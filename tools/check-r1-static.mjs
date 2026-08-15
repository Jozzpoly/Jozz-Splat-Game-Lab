import { readFile } from 'node:fs/promises';

const files = [
  'performance-lab/index.html',
  'performance-lab/styles.css',
  'performance-lab/app.js',
  'performance-lab/render-governor.mjs',
  'performance-lab/telemetry.mjs',
  'performance-lab/survey.mjs',
  'performance-lab/focus-probe.mjs',
  'performance-lab/accepted-orientation.mjs',
  'tools/r1-server.mjs',
  'tools/run-r1-owner.ps1',
  'URUCHOM_R1_PERFORMANCE_LAB.cmd'
];

const root = new URL('../', import.meta.url);
const content = {};
for (const file of files) content[file] = await readFile(new URL(file, root), 'utf8');
const app = content['performance-lab/app.js'];
const governor = content['performance-lab/render-governor.mjs'];
const server = content['tools/r1-server.mjs'];

function assert(value, message) { if (!value) throw new Error(message); }
assert(app.includes('DEVICETYPE_WEBGPU'), 'R1 must include WebGPU preference path');
assert(app.includes('GSPLAT_RENDERER_AUTO'), 'R1 must explicitly use AUTO GS renderer');
assert(app.includes('antialias: false'), 'R1 must keep antialias disabled');
assert(app.includes('maxPixelRatio = 1'), 'R1 must keep DPR capped at 1 for this gate');
assert(app.includes("'frame:ready'"), 'R1 must wait for an initial complete GS frame before on-demand mode');
assert(app.indexOf('new RenderGovernor') > app.indexOf('waitForInitialGsplatReady'), 'Render governor must be enabled after initial GS readiness');
assert(governor.includes("quiet: Object.freeze({ id: 'quiet'"), 'Quiet profile missing');
assert(governor.includes('autoRender: false'), 'On-demand rendering missing');
assert(governor.includes("'frame:request'"), 'GSplat frame:request bridge missing');
assert(server.includes("parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'"), 'Host allowlist missing');
assert(!app.includes('splatBudget ='), 'R1.1/R1.2 must not introduce a splat budget yet');
assert(!app.includes('maxPixelRatio = 0.'), 'R1.1/R1.2 must not reduce resolution yet');
console.log('R1 static contract: PASS');
