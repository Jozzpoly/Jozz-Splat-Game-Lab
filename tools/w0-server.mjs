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
const ENVIRONMENT_SPLATS = 50_000;
const FOREGROUND_BYTES = HEADER_BYTES + FOREGROUND_SPLATS * RECORD_BYTES;
const FOREGROUND_SHA = 'a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112';
const ENVIRONMENT_SHA = 'b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c';
const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const labRoot = join(repoRoot, 'world-lab');
const sourcePath = process.argv[2] ? resolve(process.argv[2]) : '';

if (!sourcePath || !existsSync(sourcePath)) {
  console.error('W0 server: wybierz istniejący zweryfikowany PLY.');
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
  console.error(`W0 server: zły rozmiar źródła (${sourceStat.size}, oczekiwano ${SOURCE_BYTES}).`);
  process.exit(3);
}

console.log('W0: potwierdzam SHA-256 źródła…');
const sourceSha = await sha256File(sourcePath);
if (sourceSha !== EXPECTED_SOURCE_SHA) {
  console.error(`W0 server: SHA-256 nie pasuje.\nOtrzymano: ${sourceSha}\nOczekiwano: ${EXPECTED_SOURCE_SHA}`);
  process.exit(4);
}

const handle = await open(sourcePath, 'r');
const headerBuffer = Buffer.alloc(HEADER_BYTES);
await handle.read(headerBuffer, 0, HEADER_BYTES, 0);
await handle.close();
const rawHeader = headerBuffer.toString('ascii');
if (!rawHeader.includes(`element vertex ${RAW_SPLATS}`) || !rawHeader.endsWith('end_header\n')) {
  console.error('W0 server: nagłówek PLY nie spełnia F0 contract.');
  process.exit(5);
}

const foregroundHeader = Buffer.from(rawHeader.replace(`element vertex ${RAW_SPLATS}`, `element vertex ${FOREGROUND_SPLATS}`), 'ascii');
if (foregroundHeader.length !== HEADER_BYTES) {
  console.error('W0 server: foreground header unexpectedly changed byte length.');
  process.exit(6);
}
const environmentHeader = Buffer.from(rawHeader.replace(`element vertex ${RAW_SPLATS}`, `element vertex ${ENVIRONMENT_SPLATS}`), 'ascii');
const environmentBytes = environmentHeader.length + ENVIRONMENT_SPLATS * RECORD_BYTES;

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
  environment: {
    splats: ENVIRONMENT_SPLATS,
    bytes: environmentBytes,
    sha256: ENVIRONMENT_SHA,
    semanticState: 'LIKELY',
    physicalAuthority: false,
    calibrationAuthority: false
  },
  worldCalibration: 'DRAFT_ORIENTATION_VERIFIED_SCALE_UNKNOWN'
};

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
}

function isAllowedHost(rawHost) {
  if (!rawHost) return false;
  try {
    const parsed = new URL(`http://${rawHost}`);
    return parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  } catch {
    return false;
  }
}

function sendJson(res, value, headOnly = false) {
  const body = Buffer.from(JSON.stringify(value));
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store'
  });
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
  createReadStream(sourcePath, {
    start: HEADER_BYTES,
    end: HEADER_BYTES + FOREGROUND_SPLATS * RECORD_BYTES - 1
  }).pipe(res);
}

function streamEnvironment(res, headOnly) {
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': environmentBytes,
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'none'
  });
  if (headOnly) return res.end();
  res.write(environmentHeader);
  const start = HEADER_BYTES + FOREGROUND_SPLATS * RECORD_BYTES;
  createReadStream(sourcePath, { start, end: SOURCE_BYTES - 1 }).pipe(res);
}

function serveStatic(reqPath, res, headOnly) {
  const requested = reqPath === '/' ? '/index.html' : reqPath;
  let decoded;
  try {
    decoded = decodeURIComponent(requested);
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  const relativePath = normalize(decoded).replace(/^[/\\]+/, '');
  const fullPath = resolve(labRoot, relativePath);
  const relToLab = pathRelative(resolve(labRoot), fullPath);
  if (relToLab === '..' || relToLab.startsWith(`..${sep}`) || isAbsolute(relToLab)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  readFile(fullPath).then((body) => {
    const type = contentTypes.get(extname(fullPath).toLowerCase()) || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': body.length,
      'Cache-Control': 'no-store'
    });
    res.end(headOnly ? undefined : body);
  }).catch(() => {
    res.writeHead(404);
    res.end('Not found');
  });
}

const server = createServer((req, res) => {
  applySecurityHeaders(res);

  if (!isAllowedHost(req.headers.host)) {
    res.writeHead(403);
    res.end('Forbidden host');
    return;
  }

  const method = req.method || 'GET';
  const headOnly = method === 'HEAD';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  let url;
  try {
    url = new URL(req.url || '/', 'http://127.0.0.1');
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (url.pathname === '/api/source') return sendJson(res, sourceMeta, headOnly);
  if (url.pathname === '/asset/raw.ply') return streamRaw(res, headOnly);
  if (url.pathname === '/asset/foreground.ply') return streamForeground(res, headOnly);
  if (url.pathname === '/asset/environment.ply') return streamEnvironment(res, headOnly);
  serveStatic(url.pathname, res, headOnly);
});

async function listenOnAvailablePort(start = 4173, max = 4190) {
  for (let port = start; port <= max; port++) {
    try {
      await new Promise((resolveListen, reject) => {
        const onError = (error) => {
          server.off('listening', onListening);
          reject(error);
        };
        const onListening = () => {
          server.off('error', onError);
          resolveListen();
        };
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
const url = `http://127.0.0.1:${port}/`;
console.log('');
console.log('============================================================');
console.log('Jozz Splat Game Lab — W0.3 METRIC SCALE');
console.log('============================================================');
console.log(`Source: VERIFIED ${sourceSha.slice(0, 12)}…`);
console.log(`LAB:    ${url}`);
console.log('');
console.log('Przeglądarka powinna otworzyć się automatycznie.');
console.log('Zamknięcie tego okna zatrzyma lokalny LAB.');
console.log('');

if (process.platform === 'win32') {
  const child = spawn('cmd.exe', ['/c', 'start', '', url], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
}
