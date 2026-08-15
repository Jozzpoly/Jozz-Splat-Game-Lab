import { readFile } from 'node:fs/promises';

async function json(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function sha256(value, label) {
  assert(/^[a-f0-9]{64}$/.test(value ?? ''), `${label}: invalid SHA-256`);
}

const source = await json('evidence/sources/luma-school-2026-08-15.json');
const report = await json('evidence/f0/luma-school-2026-08-15/reproduction.json');
const foreground = await json('evidence/f0/luma-school-2026-08-15/scene.foreground.receipt.json');
const environment = await json('evidence/f0/luma-school-2026-08-15/scene.environment.receipt.json');

assert(source.status === 'verified-by-f0-reproduction', 'source receipt is not promoted by F0 reproduction');
assert(report.status === 'VERIFIED', 'F0 reproduction report is not VERIFIED');
assert(report.gate === 'F0 Evidence Freeze', 'unexpected F0 gate identity');

sha256(source.source.sha256, 'source');
sha256(report.source.sha256, 'report source');
assert(report.source.sha256 === source.source.sha256, 'F0 report/source SHA mismatch');
assert(report.source.bytes === source.source.bytes, 'F0 report/source byte mismatch');
assert(report.reproducedObservations.vertexCount === source.ply.vertexCount, 'F0 report/source vertex-count mismatch');
assert(report.reproducedObservations.recordBytes === source.ply.recordBytes, 'F0 report/source record-size mismatch');
assert(report.reproducedObservations.allFloatFieldsFinite === true, 'F0 report contains non-finite source fields');
assert(report.reproducedObservations.allNormalsZero === true, 'F0 report/source normal-field observation changed');

assert(report.structuralPartition.status === 'VERIFIED', 'F0 structural partition is not VERIFIED');
assert(source.environmentShellInference.structuralPartitionState === 'VERIFIED', 'source receipt structural partition is not VERIFIED');
assert(
  report.structuralPartition.foregroundRecords + report.structuralPartition.environmentRecords === source.ply.vertexCount,
  'F0 partition count mismatch'
);
assert(report.structuralPartition.foregroundRecords === source.foregroundObservation.recordCount, 'foreground record-count mismatch');
assert(report.structuralPartition.environmentRecords === source.environmentShellInference.recordCount, 'environment record-count mismatch');
assert(report.reproducedObservations.shell.firstRecord === source.environmentShellInference.startRecord, 'shell start-record mismatch');
assert(report.reproducedObservations.shell.recordCount === source.environmentShellInference.recordCount, 'shell record-count mismatch');

assert(report.semanticInterpretation.environmentShell === 'LIKELY', 'semantic shell interpretation must remain LIKELY');
assert(source.environmentShellInference.claimState === 'LIKELY', 'source semantic shell interpretation must remain LIKELY');

assert(report.execution.supportedNodeBaseline === '>=22.16.0', 'unexpected F0 Node support baseline');
assert(report.execution.npmEvidenceVariable === false, 'npm must not become an F0 evidence variable');
assert(typeof report.execution.qualification === 'string' && report.execution.qualification.startsWith('accepted:'), 'F0 execution is not qualified as accepted');

for (const [role, receipt, output] of [
  ['foreground', foreground, report.outputs.foreground],
  ['environment', environment, report.outputs.environment],
]) {
  assert(receipt.evidenceStatus === 'VERIFIED', `${receipt.id}: expected VERIFIED`);
  assert(receipt.inputs?.[0]?.sha256 === source.source.sha256, `${receipt.id}: source hash mismatch`);
  assert(receipt.scanToWorldVersion === null, `${receipt.id}: F0 split must remain source-coordinate data`);
  sha256(receipt.output.sha256, `${receipt.id} output`);
  sha256(receipt.output.payloadSha256, `${receipt.id} payload`);
  assert(receipt.output.sha256 === output.sha256, `${role} output hash mismatch`);
  assert(receipt.output.payloadSha256 === output.payloadSha256, `${role} payload hash mismatch`);
  assert(receipt.output.bytes === output.bytes, `${role} output byte mismatch`);
}

console.log('F0 committed evidence check: PASS');
