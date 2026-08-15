import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, open, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { once } from 'node:events';

const EXPECTED = Object.freeze({
  sha256: '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3',
  bytes: 263_655_789,
  headerBytes: 1_533,
  vertexCount: 1_063_122,
  fieldsPerVertex: 62,
  recordBytes: 248,
  shellStart: 1_013_122,
  shellCount: 50_000,
  shellRadius: 171.8685303,
  shellRadiusTolerance: 0.0001,
  shellOpacityRaw: 4.5951209068,
  shellOpacityTolerance: 1e-6,
});

const EXPECTED_PROPERTIES = [
  'x', 'y', 'z', 'nxx', 'ny', 'nz',
  'f_dc_0', 'f_dc_1', 'f_dc_2',
  ...Array.from({ length: 45 }, (_, i) => `f_rest_${i}`),
  'opacity', 'scale_0', 'scale_1', 'scale_2',
  'rot_0', 'rot_1', 'rot_2', 'rot_3',
];

function fail(message) { throw new Error(message); }

async function sha256File(path) {
  const hash = createHash('sha256');
  const stream = createReadStream(path);
  stream.on('data', (chunk) => hash.update(chunk));
  await once(stream, 'end');
  return hash.digest('hex');
}

async function readHeader(path) {
  const fh = await open(path, 'r');
  try {
    const chunk = Buffer.alloc(64 * 1024);
    const { bytesRead } = await fh.read(chunk, 0, chunk.length, 0);
    const prefix = chunk.subarray(0, bytesRead);
    const marker = Buffer.from('end_header\n', 'ascii');
    const markerIndex = prefix.indexOf(marker);
    if (markerIndex < 0) fail('PLY header terminator not found in first 64 KiB');
    const headerBytes = markerIndex + marker.length;
    return { text: prefix.subarray(0, headerBytes).toString('ascii'), length: headerBytes };
  } finally { await fh.close(); }
}

function parseHeader(headerText) {
  const lines = headerText.trimEnd().split('\n').map((line) => line.replace(/\r$/, ''));
  if (lines[0] !== 'ply') fail('not a PLY header');
  if (lines[1] !== 'format binary_little_endian 1.0') fail(`unexpected PLY format: ${lines[1]}`);
  const elementLines = lines.filter((line) => line.startsWith('element '));
  if (elementLines.length !== 1) fail(`expected exactly one PLY element, found ${elementLines.length}`);
  const match = /^element vertex (\d+)$/.exec(elementLines[0]);
  if (!match) fail(`unexpected element declaration: ${elementLines[0]}`);
  const properties = lines.filter((line) => line.startsWith('property ')).map((line) => {
    const property = /^property float ([A-Za-z0-9_]+)$/.exec(line);
    if (!property) fail(`unsupported property declaration: ${line}`);
    return property[1];
  });
  return { vertexCount: Number(match[1]), properties };
}

function verifyHeader(header, parsed, fileBytes) {
  if (header.length !== EXPECTED.headerBytes) fail(`header bytes ${header.length} != ${EXPECTED.headerBytes}`);
  if (parsed.vertexCount !== EXPECTED.vertexCount) fail(`vertex count ${parsed.vertexCount} != ${EXPECTED.vertexCount}`);
  if (parsed.properties.length !== EXPECTED.fieldsPerVertex) fail(`property count ${parsed.properties.length} != ${EXPECTED.fieldsPerVertex}`);
  if (parsed.properties.join('\n') !== EXPECTED_PROPERTIES.join('\n')) fail('property layout does not match recorded source layout');
  const expectedBytes = header.length + parsed.vertexCount * EXPECTED.recordBytes;
  if (fileBytes !== expectedBytes) fail(`file-size equation failed: ${fileBytes} != ${expectedBytes}`);
}

function selected(buffer, base) {
  return {
    x: buffer.readFloatLE(base), y: buffer.readFloatLE(base + 4), z: buffer.readFloatLE(base + 8),
    nxx: buffer.readFloatLE(base + 12), ny: buffer.readFloatLE(base + 16), nz: buffer.readFloatLE(base + 20),
    opacity: buffer.readFloatLE(base + 54 * 4),
    scale0: buffer.readFloatLE(base + 55 * 4), scale1: buffer.readFloatLE(base + 56 * 4), scale2: buffer.readFloatLE(base + 57 * 4),
    rot0: buffer.readFloatLE(base + 58 * 4), rot1: buffer.readFloatLE(base + 59 * 4), rot2: buffer.readFloatLE(base + 60 * 4), rot3: buffer.readFloatLE(base + 61 * 4),
  };
}

function shellLike(v) {
  return Math.abs(Math.hypot(v.x, v.y, v.z) - EXPECTED.shellRadius) <= EXPECTED.shellRadiusTolerance &&
    Math.abs(v.opacity - EXPECTED.shellOpacityRaw) <= EXPECTED.shellOpacityTolerance &&
    v.rot0 === 1 && v.rot1 === 0 && v.rot2 === 0 && v.rot3 === 0 &&
    v.scale0 === v.scale1 && v.scale0 === v.scale2;
}

async function analyzeRecords(path) {
  const fh = await open(path, 'r');
  const rowsPerChunk = 8_192;
  const buffer = Buffer.allocUnsafe(rowsPerChunk * EXPECTED.recordBytes);
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  let nonFiniteRecords = 0, normalsNonZero = 0, shellLikeCount = 0, shellLikeFirst = null, shellLikeLast = null;
  let shellRadiusMin = Infinity, shellRadiusMax = -Infinity, shellRadiusMean = 0, shellRadiusM2 = 0, shellRadiusN = 0;
  let shellOpacityMin = Infinity, shellOpacityMax = -Infinity, shellScaleMismatch = 0, shellQuaternionMismatch = 0;
  try {
    let row = 0;
    while (row < EXPECTED.vertexCount) {
      const rows = Math.min(rowsPerChunk, EXPECTED.vertexCount - row);
      const bytes = rows * EXPECTED.recordBytes;
      const { bytesRead } = await fh.read(buffer, 0, bytes, EXPECTED.headerBytes + row * EXPECTED.recordBytes);
      if (bytesRead !== bytes) fail(`short PLY data read at row ${row}`);
      for (let i = 0; i < rows; i += 1) {
        const globalRow = row + i;
        const base = i * EXPECTED.recordBytes;
        const v = selected(buffer, base);
        let recordFinite = true;
        for (let field = 0; field < EXPECTED.fieldsPerVertex; field += 1) {
          if (!Number.isFinite(buffer.readFloatLE(base + field * 4))) { recordFinite = false; break; }
        }
        if (!recordFinite) nonFiniteRecords += 1;
        if (v.nxx !== 0 || v.ny !== 0 || v.nz !== 0) normalsNonZero += 1;
        if (globalRow < EXPECTED.shellStart) {
          bounds.min[0] = Math.min(bounds.min[0], v.x); bounds.min[1] = Math.min(bounds.min[1], v.y); bounds.min[2] = Math.min(bounds.min[2], v.z);
          bounds.max[0] = Math.max(bounds.max[0], v.x); bounds.max[1] = Math.max(bounds.max[1], v.y); bounds.max[2] = Math.max(bounds.max[2], v.z);
        }
        if (shellLike(v)) { shellLikeCount += 1; shellLikeFirst ??= globalRow; shellLikeLast = globalRow; }
        if (globalRow >= EXPECTED.shellStart) {
          const radius = Math.hypot(v.x, v.y, v.z);
          shellRadiusMin = Math.min(shellRadiusMin, radius); shellRadiusMax = Math.max(shellRadiusMax, radius);
          shellRadiusN += 1; const delta = radius - shellRadiusMean; shellRadiusMean += delta / shellRadiusN; shellRadiusM2 += delta * (radius - shellRadiusMean);
          shellOpacityMin = Math.min(shellOpacityMin, v.opacity); shellOpacityMax = Math.max(shellOpacityMax, v.opacity);
          if (v.scale0 !== v.scale1 || v.scale0 !== v.scale2) shellScaleMismatch += 1;
          if (v.rot0 !== 1 || v.rot1 !== 0 || v.rot2 !== 0 || v.rot3 !== 0) shellQuaternionMismatch += 1;
        }
      }
      row += rows;
    }
  } finally { await fh.close(); }
  return {
    nonFiniteRecords, normalsNonZero, foregroundBounds: bounds, shellLikeCount, shellLikeFirst, shellLikeLast,
    shell: { radiusMin: shellRadiusMin, radiusMax: shellRadiusMax, radiusMean: shellRadiusMean, radiusStd: Math.sqrt(shellRadiusM2 / shellRadiusN), opacityMin: shellOpacityMin, opacityMax: shellOpacityMax, scaleMismatchCount: shellScaleMismatch, quaternionMismatchCount: shellQuaternionMismatch }
  };
}

function verifyShell(a) {
  if (a.nonFiniteRecords !== 0) fail(`non-finite float fields observed in ${a.nonFiniteRecords} records`);
  if (a.normalsNonZero !== 0) fail(`non-zero source normals observed in ${a.normalsNonZero} records`);
  if (a.shellLikeCount !== EXPECTED.shellCount || a.shellLikeFirst !== EXPECTED.shellStart || a.shellLikeLast !== EXPECTED.vertexCount - 1) fail('shell partition invariants failed');
  if (a.shell.scaleMismatchCount !== 0 || a.shell.quaternionMismatchCount !== 0) fail('shell transform invariants failed');
}

function headerWithVertexCount(text, count) {
  const replaced = text.replace(/^element vertex \d+$/m, `element vertex ${count}`);
  if (replaced === text) fail('could not rewrite vertex count');
  return Buffer.from(replaced, 'ascii');
}

async function pipeRange(sourcePath, outputPath, header, startByte, byteLength) {
  const out = createWriteStream(outputPath, { flags: 'wx' });
  const hash = createHash('sha256'); let bytes = 0;
  const write = async (chunk) => { hash.update(chunk); bytes += chunk.length; if (!out.write(chunk)) await once(out, 'drain'); };
  await write(header);
  for await (const chunk of createReadStream(sourcePath, { start: startByte, end: startByte + byteLength - 1 })) await write(chunk);
  out.end(); await once(out, 'finish');
  return { sha256: hash.digest('hex'), bytes };
}

async function inspect(sourcePath) {
  const info = await stat(sourcePath); const digest = await sha256File(sourcePath);
  if (digest !== EXPECTED.sha256 || info.size !== EXPECTED.bytes) fail('source identity mismatch');
  const header = await readHeader(sourcePath); const parsed = parseHeader(header.text); verifyHeader(header, parsed, info.size);
  const analysis = await analyzeRecords(sourcePath); verifyShell(analysis);
  return { status: 'VERIFIED', source: { name: basename(sourcePath), sha256: digest, bytes: info.size }, layout: { format: 'binary_little_endian 1.0', headerBytes: header.length, vertexCount: parsed.vertexCount, fieldsPerVertex: parsed.properties.length, recordBytes: EXPECTED.recordBytes, properties: parsed.properties }, analysis };
}

async function split(sourcePath, outputDir) {
  const inspection = await inspect(sourcePath); await mkdir(outputDir, { recursive: true });
  const sourceHeader = await readHeader(sourcePath);
  const foregroundPath = join(outputDir, 'scene.foreground.ply'); const environmentPath = join(outputDir, 'scene.environment.ply');
  const foreground = await pipeRange(sourcePath, foregroundPath, headerWithVertexCount(sourceHeader.text, EXPECTED.shellStart), EXPECTED.headerBytes, EXPECTED.shellStart * EXPECTED.recordBytes);
  const environment = await pipeRange(sourcePath, environmentPath, headerWithVertexCount(sourceHeader.text, EXPECTED.shellCount), EXPECTED.headerBytes + EXPECTED.shellStart * EXPECTED.recordBytes, EXPECTED.shellCount * EXPECTED.recordBytes);
  const receipt = { receiptVersion: 1, id: 'luma-school-f0-split', evidenceStatus: 'GENERATED', source: inspection.source, splitContract: { sourceSha256Required: EXPECTED.sha256, foregroundRecords: EXPECTED.shellStart, environmentRecords: EXPECTED.shellCount, shellInference: 'LIKELY semantic environment; VERIFIED deterministic structural partition for this exact source', shellValidation: inspection.analysis.shell }, outputs: { foreground: { path: basename(foregroundPath), ...foreground }, environment: { path: basename(environmentPath), ...environment } } };
  const receiptPath = join(outputDir, 'f0-split-receipt.json'); await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  return receipt;
}

const [command, sourceArg, outputArg] = process.argv.slice(2);
try {
  if (command === 'inspect' && sourceArg) console.log(JSON.stringify(await inspect(sourceArg), null, 2));
  else if (command === 'split' && sourceArg && outputArg) console.log(JSON.stringify({ status: 'PASS', receipt: await split(sourceArg, outputArg) }, null, 2));
  else { console.error('Usage: node tools/f0-luma-source.mjs inspect <source.ply> | split <source.ply> <output-dir>'); process.exitCode = 2; }
} catch (error) {
  console.error(`F0 source gate: FAIL — ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1;
}
