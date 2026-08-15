import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const required = [
  'collision-lab/index.html',
  'collision-lab/collision.css',
  'collision-lab/collision-app.js',
  'collision-lab/accepted-orientation.mjs',
  'collision-lab/candidate-layer.mjs',
  'collision-lab/collision-probe.mjs',
  'collision-lab/collision-workflow.mjs',
  'collision-lab/compare-markers.mjs',
  'world-lab/survey.mjs',
  'world-lab/spatial-probe.mjs',
  'tools/c0a-server.mjs',
  'tools/run-c0a-owner.ps1',
  'URUCHOM_C0A_COLLISION_LAB.cmd',
  'tools/c0a-generate.py',
  'tools/c0a-requirements.txt',
  'evidence/c0/c0a-candidates-2026-08-15.json'
];

const text = async (path) => readFile(resolve(root, path), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

for (const path of required) await readFile(resolve(root, path));

const html = await text('collision-lab/index.html');
const app = await text('collision-lab/collision-app.js');
const probe = await text('collision-lab/collision-probe.mjs');
const workflow = await text('collision-lab/collision-workflow.mjs');
const server = await text('tools/c0a-server.mjs');
const receipt = JSON.parse(await text('evidence/c0/c0a-candidates-2026-08-15.json'));

assert(html.includes('C0a · Non-Metric Collision Feasibility'), 'wrong C0a page identity');
assert(html.includes('SOURCE UNITS'), 'UI must expose non-metric status');
assert(app.includes("metricStatus !== 'UNCALIBRATED_SOURCE_UNITS'"), 'runtime must fail closed on metric status');
assert(app.includes('ACCEPTED_W0_2'), 'C0a must consume accepted W0.2 orientation');
assert(probe.includes('APPEARANCE_ONLY') && probe.includes('CANDIDATE_ONLY'), 'dual-surface probe statuses missing');
assert(workflow.includes('Source-unit deltas are non-metric'), 'evidence boundary missing');
assert(!app.toLowerCase().includes('box3d'), 'Box3D must not enter C0a');
assert(server.includes('isAllowedHost'), 'loopback Host validation missing');
assert(server.includes("receipt.metricStatus !== 'UNCALIBRATED_SOURCE_UNITS'"), 'server metric fail-closed guard missing');
assert(server.includes('sha256File(path)'), 'candidate hash verification missing');
assert(server.includes('voxelFractionOfRoiDiagonal: value.voxelFractionOfRoiDiagonal'), 'normalized voxel metadata missing from API');
assert(receipt.sourceSha256 === '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3', 'wrong source receipt hash');
assert(receipt.metricStatus === 'UNCALIBRATED_SOURCE_UNITS', 'receipt must remain non-metric');
assert(Object.keys(receipt.candidates).sort().join(',') === 'balanced,conservative,permissive', 'unexpected candidate set');
for (const [name, candidate] of Object.entries(receipt.candidates)) {
  assert(/^[a-f0-9]{64}$/.test(candidate.sha256), `${name}: invalid candidate SHA`);
  assert(candidate.faces > 0 && candidate.vertices > 0, `${name}: empty mesh`);
  assert(candidate.watertight === false, `${name}: candidate unexpectedly promoted to watertight truth`);
}

console.log('C0a static contract: PASS');
