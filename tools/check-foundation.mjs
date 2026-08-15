import { readFile } from 'node:fs/promises';

const requiredFiles = [
  'AGENTS.md',
  'AI_PROJECT_MEMORY.md',
  'docs/PROJECT_STATE.md',
  'docs/FOUNDATION_PLAN.md',
  'docs/EVIDENCE_CONTRACT.md',
  'docs/R0_RENDERER_BAKEOFF.md',
  'docs/RESEARCH_BASELINE.md',
  'contracts/source-receipt.schema.json',
  'contracts/derived-asset-receipt.schema.json',
  'contracts/scan-to-world.schema.json',
  'evidence/sources/luma-school-2026-08-15.json'
];

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const path of requiredFiles) {
  await text(path);
}

const pkg = JSON.parse(await text('package.json'));
assert(pkg.packageManager === 'npm@11.13.0', 'unexpected packageManager pin');
assert(pkg.engines?.node === '24.16.0', 'unexpected Node pin');
assert(pkg.engines?.npm === '11.13.0', 'unexpected npm engine pin');

const source = JSON.parse(await text('evidence/sources/luma-school-2026-08-15.json'));
assert(/^[a-f0-9]{64}$/.test(source.source.archiveSha256), 'invalid archive SHA-256');
assert(/^[a-f0-9]{64}$/.test(source.source.plySha256), 'invalid PLY SHA-256');
assert(source.ply.vertexCount === 1_063_122, 'unexpected historical vertex count');
assert(
  source.foregroundObservation.recordCount + source.environmentShellInference.recordCount === source.ply.vertexCount,
  'foreground + environment counts do not equal total records'
);
assert(source.environmentShellInference.claimState === 'LIKELY', 'environment shell must not be promoted to VERIFIED before F0 reproduction');

for (const path of [
  'contracts/source-receipt.schema.json',
  'contracts/derived-asset-receipt.schema.json',
  'contracts/scan-to-world.schema.json'
]) {
  const schema = JSON.parse(await text(path));
  assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', `${path}: unexpected schema draft`);
}

const ignore = await text('.gitignore');
assert(ignore.includes('local-data/'), 'raw local-data directory must stay ignored');
assert(ignore.includes('derived/'), 'derived experiment outputs must stay ignored by default');

console.log('foundation check: PASS');
