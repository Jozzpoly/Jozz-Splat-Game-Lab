import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { open, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, join, normalize, relative as pathRelative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const EXPECTED_SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3';
const SOURCE_BYTES = 263_655_789;
const HEADER_BYTES = 1_533;
const RECORD_BYTES = 248;
const RAW_SPLATS = 1_063_122;
const FOREGROUND_SPLATS = 1_013_122;
const FOREGROUND_BYTES = HEADER_BYTES + FOREGROUND_SPLATS * RECORD_BYTES;
const FOREGROUND_SHA = 'a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112';
const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const labRoot = join(repoRoot, 'lab');
const sourcePath = process.argv[2] ? resolve(process.argv[2]) : '';

if (!sourcePath || !existsSync(sourcePath)) {
  console.error('R0 server: podaj istniejący plik gs_GG_Szko_a.ply.');
  process.exit(2);
}

function sha256File(path) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolveHash(hash.digest('hex')));
    stream.on('error', reject);
  });
}

const sourceStat = await stat(sourcePath);
if (sourceStat.size !== SOURCE_BYTES) {
  console.error(`R0 server: zły rozmiar źródła (${sourceStat.size}, oczekiwano ${SOURCE_BYTES}).`);
  process.exit(3);
}

console.log('R0: potwierdzam SHA-256 źródła…');
const sourceSha = await sha256File(sourcePath);
if (sourceSha !== EXPECTED_SOURCE_SHA) {
  console.error(`R0 server: SHA-256 nie pasuje.\nOtrzymano: ${sourceSha}\nOczekiwano: ${EXPECTED_SOURCE_SHA}`);
  process.exit(4);
}

const handle = await open(sourcePath, 'r');
const headerBuffer = Buffer.alloc(HEADER_BYTES);
await handle.read(headerBuffer, 0, HEADER_BYTES, 0);
await handle.close();
const rawHeader = headerBuffer.toString('ascii');
if (!rawHeader.includes(`element vertex ${RAW_SPLATS}`) || !rawHeader.endsWith('end_header\n')) {
  console.error('R0 server: nagłówek PLY nie spełnia zweryfikowanego kontraktu F0.');
  process.exit(5);
}
const foregroundHeaderText = rawHeader.replace(`element vertex ${RAW_SPLATS}`, `element vertex ${FOREGROUND_SPLATS}`);
const foregroundHeader = Buffer.from(foregroundHeaderText, 'ascii');
if (foregroundHeader.length !== HEADER_BYTES) {
  console.error('R0 server: zmiana nagłówka foreground zmieniła długość danych.');
  process.exit(6);
}

const sourceMeta = {
  verified: true,
  sourceSha256: sourceSha,
  raw: { splats: RAW_SPLATS, bytes: SOURCE_BYTES, sha256: EXPECTED_SOURCE_SHA },
  foreground: {
    splats: FOREGROUND_SPLATS,
    bytes: FOREGROUND_BYTES,
    sha256: FOREGROUND_SHA,
    bounds: {
      min: [-150.57611083984375, -14.89201545715332, -71.93040466308594],
      max: [110.7751235961914, 6.4909186363220215, 80.14979553222656]
    }
  },
  semanticEnvironmentState: 'LIKELY',
  worldCalibration: 'UNMEASURED'
};

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

function sendJson(res, value, headOnly = false) {
  const body = Buffer.from(JSON.stringify(value));
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length, 'Cache-Control': 'no-store' });
  res.end(headOnly ? undefined : body);
}

function streamRaw(res, headOnly) {
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': SOURCE_BYTES,
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'none'
  });
  if (headOnly) return res.end();
  createReadStream(sourcePath).pipe(res);
}

function streamForeground(res, headOnly) {
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': FOREGROUND_BYTES,
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'none'
  });
  if (headOnly) return res.end();
  res.write(foregroundHeader);
  const payloadEnd = HEADER_BYTES + FOREGROUND_SPLATS * RECORD_BYTES - 1;
  const stream = createReadStream(sourcePath, { start: HEADER_BYTES, end: payloadEnd });
  stream.pipe(res);
}

function serveStatic(reqPath, res, headOnly) {
  const requested = reqPath === '/' ? '/index.html' : reqPath;
  const relativePath = normalize(decodeURIComponent(requested)).replace(/^[/\\]+/, '');
  const fullPath = resolve(labRoot, relativePath);
  const relToLab = pathRelative(resolve(labRoot), fullPath);
  if (relToLab === '..' || relToLab.startsWith(`..${sep}`) || isAbsolute(relToLab)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  readFile(fullPath).then((body) => {
    const type = contentTypes.get(extname(fullPath).toLowerCase()) || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': body.length, 'Cache-Control': 'no-store' });
    res.end(headOnly ? undefined : body);
  }).catch(() => { res.writeHead(404); res.end('Not found'); });
}

const server = createServer((req, res) => {
  const method = req.method || 'GET';
  const headOnly = method === 'HEAD';
  if (method !== 'GET' && method !== 'HEAD') { res.writeHead(405); res.end('Method not allowed'); return; }
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/api/source') return sendJson(res, sourceMeta, headOnly);
  if (url.pathname === '/asset/raw.ply') return streamRaw(res, headOnly);
  if (url.pathname === '/asset/foreground.ply') return streamForeground(res, headOnly);
  serveStatic(url.pathname, res, headOnly);
});

async function listenOnAvailablePort(start = 4173, max = 4190) {
  for (let port = start; port <= max; port++) {
    try {
      await new Promise((resolveListen, reject) => {
        const onError = (err) => { server.off('listening', onListening); reject(err); };
        const onListening = () => { server.off('error', onError); resolveListen(); };
        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port, '127.0.0.1');
      });
      return port;
    } catch (error) {
      if (error?.code !== 'EADDRINUSE') throw error;
    }
  }
  throw new Error('Brak wolnego portu 4173–4190.');
}

const port = await listenOnAvailablePort();
const url = `http://127.0.0.1:${port}/?runtime=spark&source=foreground&backend=webgl2`;
console.log('');
console.log('============================================================');
console.log('Jozz Splat Game Lab — R0 LAB');
console.log('============================================================');
console.log(`Source: VERIFIED ${sourceSha.slice(0, 12)}…`);
console.log(`LAB:    ${url}`);
console.log('');
console.log('Przeglądarka powinna otworzyć się automatycznie.');
console.log('Zamknięcie tego okna zatrzyma lokalny LAB.');
console.log('');

if (process.platform === 'win32') {
  const child = spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' });
  child.unref();
}
