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
const collisionRoot = join(repoRoot, 'collision-lab');
const worldRoot = join(repoRoot, 'world-lab');
const receiptPath = join(repoRoot, 'evidence', 'c0', 'c0a-candidates-2026-08-15.json');
const sourcePath = process.argv[2] ? resolve(process.argv[2]) : '';
const candidateDir = process.argv[3] ? resolve(process.argv[3]) : join(repoRoot, 'derived', 'c0a');

function fail(message, code) {
  console.error(`C0a server: ${message}`);
  process.exit(code);
}

if (!sourcePath || !existsSync(sourcePath)) fail('wybierz istniejący zweryfikowany PLY.', 2);
if (!existsSync(receiptPath)) fail('brakuje committed candidate receipt.', 3);
if (!existsSync(candidateDir)) fail('brakuje katalogu derived/c0a z candidate GLB.', 4);

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
if (sourceStat.size !== SOURCE_BYTES) fail(`zły rozmiar źródła (${sourceStat.size}, oczekiwano ${SOURCE_BYTES}).`, 5);
console.log('C0a: potwierdzam SHA-256 źródła…');
const sourceSha = await sha256File(sourcePath);
if (sourceSha !== EXPECTED_SOURCE_SHA) fail(`SHA-256 PLY nie pasuje: ${sourceSha}`, 6);

const handle = await open(sourcePath, 'r');
const headerBuffer = Buffer.alloc(HEADER_BYTES);
await handle.read(headerBuffer, 0, HEADER_BYTES, 0);
await handle.close();
const rawHeader = headerBuffer.toString('ascii');
if (!rawHeader.includes(`element vertex ${RAW_SPLATS}`) || !rawHeader.endsWith('end_header\n')) fail('nagłówek PLY nie spełnia F0 contract.', 7);

const foregroundHeader = Buffer.from(rawHeader.replace(`element vertex ${RAW_SPLATS}`, `element vertex ${FOREGROUND_SPLATS}`), 'ascii');
const environmentHeader = Buffer.from(rawHeader.replace(`element vertex ${RAW_SPLATS}`, `element vertex ${ENVIRONMENT_SPLATS}`), 'ascii');
if (foregroundHeader.length !== HEADER_BYTES) fail('foreground PLY header zmienił długość.', 8);
if (!environmentHeader.toString('ascii').includes(`element vertex ${ENVIRONMENT_SPLATS}`) || !environmentHeader.toString('ascii').endsWith('end_header\n')) fail('environment PLY header jest niepoprawny.', 8);
const environmentBytes = environmentHeader.length + ENVIRONMENT_SPLATS * RECORD_BYTES;

const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
if (receipt.sourceSha256 !== EXPECTED_SOURCE_SHA) fail('candidate receipt należy do innego source SHA.', 9);
if (receipt.metricStatus !== 'UNCALIBRATED_SOURCE_UNITS') fail('candidate receipt próbuje nadać nieuprawnioną skalę metryczną.', 10);
if (receipt.status !== 'EXPERIMENTAL_NON_METRIC_CANDIDATES') fail('nieoczekiwany status candidate receipt.', 11);

const verifiedCandidates = {};
for (const [name, info] of Object.entries(receipt.candidates ?? {})) {
  if (!/^[a-z0-9_-]+$/i.test(name)) fail(`niebezpieczna nazwa candidate: ${name}`, 12);
  const path = join(candidateDir, `${name}.glb`);
  if (!existsSync(path)) fail(`brakuje ${name}.glb`, 13);
  const fileStat = await stat(path);
  if (fileStat.size !== info.bytes) fail(`${name}.glb ma zły rozmiar.`, 14);
  const digest = await sha256File(path);
  if (digest !== info.sha256) fail(`${name}.glb ma zły SHA-256.`, 15);
  verifiedCandidates[name] = { ...info, path };
}
if (Object.keys(verifiedCandidates).length < 2) fail('za mało zweryfikowanych candidate meshes.', 16);

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
  }
};

const apiMeta = {
  source: sourceMeta,
  gate: 'C0a',
  status: receipt.status,
  metricStatus: receipt.metricStatus,
  roiSourceBounds: receipt.roiSourceBounds,
  generator: receipt.generator,
  candidates: Object.fromEntries(Object.entries(verifiedCandidates).map(([name, value]) => [name, {
    parameters: value.parameters,
    selectedSplats: value.selectedSplats,
    gridDims: value.gridDims,
    occupiedVoxels: value.occupiedVoxels,
    vertices: value.vertices,
    faces: value.faces,
    watertight: value.watertight,
    boundsSource: value.boundsSource,
    voxelFractionOfRoiDiagonal: value.voxelFractionOfRoiDiagonal,
    bytes: value.bytes,
    sha256: value.sha256
  }]))
};

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.glb', 'model/gltf-binary']
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
  res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': SOURCE_BYTES, 'Cache-Control': 'no-store', 'Accept-Ranges': 'none' });
  if (headOnly) return res.end();
  createReadStream(sourcePath).pipe(res);
}

function streamForeground(res, headOnly) {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': FOREGROUND_BYTES, 'Cache-Control': 'no-store', 'Accept-Ranges': 'none' });
  if (headOnly) return res.end();
  res.write(foregroundHeader);
  createReadStream(sourcePath, { start: HEADER_BYTES, end: HEADER_BYTES + FOREGROUND_SPLATS * RECORD_BYTES - 1 }).pipe(res);
}

function streamEnvironment(res, headOnly) {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': environmentBytes, 'Cache-Control': 'no-store', 'Accept-Ranges': 'none' });
  if (headOnly) return res.end();
  res.write(environmentHeader);
  const start = HEADER_BYTES + FOREGROUND_SPLATS * RECORD_BYTES;
  createReadStream(sourcePath, { start, end: SOURCE_BYTES - 1 }).pipe(res);
}

function streamCandidate(name, res, headOnly) {
  const candidate = verifiedCandidates[name];
  if (!candidate) {
    res.writeHead(404);
    res.end('Unknown candidate');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'model/gltf-binary', 'Content-Length': candidate.bytes, 'Cache-Control': 'no-store' });
  if (headOnly) return res.end();
  createReadStream(candidate.path).pipe(res);
}

function serveStatic(root, requestPath, res, headOnly) {
  let decoded;
  try { decoded = decodeURIComponent(requestPath); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  const relativePath = normalize(decoded).replace(/^[/\\]+/, '');
  const fullPath = resolve(root, relativePath);
  const rel = pathRelative(resolve(root), fullPath);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  readFile(fullPath).then((body) => {
    const type = contentTypes.get(extname(fullPath).toLowerCase()) || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': body.length, 'Cache-Control': 'no-store' });
    res.end(headOnly ? undefined : body);
  }).catch(() => { res.writeHead(404); res.end('Not found'); });
}

const server = createServer((req, res) => {
  applySecurityHeaders(res);
  if (!isAllowedHost(req.headers.host)) { res.writeHead(403); res.end('Forbidden host'); return; }
  const method = req.method || 'GET';
  const headOnly = method === 'HEAD';
  if (method !== 'GET' && method !== 'HEAD') { res.writeHead(405); res.end('Method not allowed'); return; }

  let url;
  try { url = new URL(req.url || '/', 'http://127.0.0.1'); }
  catch { res.writeHead(400); res.end('Bad request'); return; }

  if (url.pathname === '/api/c0a') return sendJson(res, apiMeta, headOnly);
  if (url.pathname === '/asset/raw.ply') return streamRaw(res, headOnly);
  if (url.pathname === '/asset/foreground.ply') return streamForeground(res, headOnly);
  if (url.pathname === '/asset/environment.ply') return streamEnvironment(res, headOnly);
  if (url.pathname.startsWith('/candidate/')) return streamCandidate(url.pathname.slice('/candidate/'.length).replace(/\.glb$/i, ''), res, headOnly);
  if (url.pathname === '/shared/survey.mjs') return serveStatic(worldRoot, '/survey.mjs', res, headOnly);
  if (url.pathname === '/shared/spatial-probe.mjs') return serveStatic(worldRoot, '/spatial-probe.mjs', res, headOnly);
  const path = url.pathname === '/' ? '/index.html' : url.pathname;
  return serveStatic(collisionRoot, path, res, headOnly);
});

async function listenOnAvailablePort(start = 4173, max = 4190) {
  for (let port = start; port <= max; port++) {
    try {
      await new Promise((resolveListen, reject) => {
        const onError = (error) => { server.off('listening', onListening); reject(error); };
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
const url = `http://127.0.0.1:${port}/`;
console.log('');
console.log('============================================================');
console.log('Jozz Splat Game Lab — C0a COLLISION INSPECTOR');
console.log('============================================================');
console.log(`Source: VERIFIED ${sourceSha.slice(0, 12)}…`);
console.log(`Candidates: VERIFIED ${Object.keys(verifiedCandidates).join(', ')}`);
console.log('Metric status: UNCALIBRATED_SOURCE_UNITS');
console.log(`LAB: ${url}`);
console.log('');
console.log('Zamknięcie tego okna zatrzyma lokalny LAB.');

if (process.platform === 'win32') {
  const child = spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' });
  child.unref();
}
