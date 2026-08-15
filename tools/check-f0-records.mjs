import { readFile } from 'node:fs/promises';

async function json(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = await json('evidence/sources/luma-school-2026-08-15.json');
const report = await json('evidence/f0/luma-school-2026-08-15/reproduction.json');
const foreground = await json('evidence/f0/luma-school-2026-08-15/scene.foreground.receipt.json');
const environment = await json('evidence/f0/luma-school-2026-08-15/scene.environment.receipt.json');

assert(source.status === 'verified-by-f0-reproduction', 'source receipt is not promoted by F0 reproduction');
assert(report.source.sha256 === source.source.sha256, 'F0 report/source SHA mismatch');
assert(report.source.bytes === source.source.bytes, 'F0 report/source byte mismatch');
assert(report.structuralPartition.foregroundRecords + report.structuralPartition.environmentRecords === source.ply.vertexCount, 'F0 partition count mismatch');
assert(report.semanticInterpretation.environmentShell === 'LIKELY', 'semantic shell interpretation must remain LIKELY');
assert(report.execution.canonicalToolchainReplay === 'PENDING', 'canonical toolchain replay status unexpectedly changed');

for (const receipt of [foreground, environment]) {
  assert(receipt.evidenceStatus === 'VERIFIED', `${receipt.id}: expected VERIFIED`);
  assert(receipt.inputs?.[0]?.sha256 === source.source.sha256, `${receipt.id}: source hash mismatch`);
  assert(/^[a-f0-9]{64}$/.test(receipt.output.sha256), `${receipt.id}: invalid output hash`);
  assert(receipt.scanToWorldVersion === null, `${receipt.id}: F0 split must be source-coordinate data`);
}

assert(foreground.output.sha256 === report.outputs.foreground.sha256, 'foreground output hash mismatch');
assert(environment.output.sha256 === report.outputs.environment.sha256, 'environment output hash mismatch');
assert(foreground.output.bytes === report.outputs.foreground.bytes, 'foreground output byte mismatch');
assert(environment.output.bytes === report.outputs.environment.bytes, 'environment output byte mismatch');

console.log('F0 committed evidence check: PASS');
