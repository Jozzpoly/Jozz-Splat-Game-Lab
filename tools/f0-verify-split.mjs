import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { open, stat } from 'node:fs/promises';
import { once } from 'node:events';

const SOURCE_HEADER_BYTES = 1533;
const RECORD_BYTES = 248;
const FOREGROUND_RECORDS = 1_013_122;
const ENVIRONMENT_RECORDS = 50_000;

function fail(message) { throw new Error(message); }

async function header(path) {
  const fh = await open(path, 'r');
  try {
    const buffer = Buffer.alloc(64 * 1024);
    const { bytesRead } = await fh.read(buffer, 0, buffer.length, 0);
    const prefix = buffer.subarray(0, bytesRead);
    const marker = Buffer.from('end_header\n');
    const i = prefix.indexOf(marker);
    if (i < 0) fail(`${path}: no PLY header terminator`);
    const length = i + marker.length;
    const text = prefix.subarray(0, length).toString('ascii');
    const match = /^element vertex (\d+)$/m.exec(text);
    if (!match) fail(`${path}: vertex element not found`);
    return { length, text, vertexCount: Number(match[1]) };
  } finally { await fh.close(); }
}

function normalizedHeader(text) {
  return text.replace(/^element vertex \d+$/m, 'element vertex <N>');
}

async function shaRange(path, start, bytes) {
  const hash = createHash('sha256');
  const stream = createReadStream(path, { start, end: start + bytes - 1 });
  stream.on('data', (chunk) => hash.update(chunk));
  await once(stream, 'end');
  return hash.digest('hex');
}

async function main() {
  const [source, foreground, environment] = process.argv.slice(2);
  if (!source || !foreground || !environment) {
    console.error('Usage: node tools/f0-verify-split.mjs <source.ply> <foreground.ply> <environment.ply>');
    process.exitCode = 2;
    return;
  }

  const [sh, fh, eh] = await Promise.all([header(source), header(foreground), header(environment)]);
  if (sh.length !== SOURCE_HEADER_BYTES) fail(`source header length ${sh.length} != ${SOURCE_HEADER_BYTES}`);
  if (fh.vertexCount !== FOREGROUND_RECORDS) fail(`foreground count ${fh.vertexCount} != ${FOREGROUND_RECORDS}`);
  if (eh.vertexCount !== ENVIRONMENT_RECORDS) fail(`environment count ${eh.vertexCount} != ${ENVIRONMENT_RECORDS}`);
  if (normalizedHeader(sh.text) !== normalizedHeader(fh.text)) fail('foreground header layout differs from source');
  if (normalizedHeader(sh.text) !== normalizedHeader(eh.text)) fail('environment header layout differs from source');

  const fgBytes = FOREGROUND_RECORDS * RECORD_BYTES;
  const envBytes = ENVIRONMENT_RECORDS * RECORD_BYTES;
  const [fgStat, envStat] = await Promise.all([stat(foreground), stat(environment)]);
  if (fgStat.size !== fh.length + fgBytes) fail('foreground file-size equation failed');
  if (envStat.size !== eh.length + envBytes) fail('environment file-size equation failed');

  const [sourceFgHash, outputFgHash, sourceEnvHash, outputEnvHash] = await Promise.all([
    shaRange(source, sh.length, fgBytes),
    shaRange(foreground, fh.length, fgBytes),
    shaRange(source, sh.length + fgBytes, envBytes),
    shaRange(environment, eh.length, envBytes),
  ]);

  if (sourceFgHash !== outputFgHash) fail('foreground payload differs from source byte range');
  if (sourceEnvHash !== outputEnvHash) fail('environment payload differs from source byte range');

  console.log(JSON.stringify({
    status: 'PASS',
    foreground: { payloadSha256: outputFgHash, records: FOREGROUND_RECORDS },
    environment: { payloadSha256: outputEnvHash, records: ENVIRONMENT_RECORDS },
    invariant: 'output payloads are exact, ordered source byte ranges; only PLY vertex-count headers differ',
  }, null, 2));
}

main().catch((error) => {
  console.error(`F0 split verification: FAIL — ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
