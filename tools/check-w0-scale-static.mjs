import { readFile } from 'node:fs/promises';

async function text(path) { return readFile(new URL(`../${path}`, import.meta.url), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const [html, scaleCss, app, scale, workflow, orientation, probe, survey, server, launcher, owner] = await Promise.all([
  text('world-lab/index.html'), text('world-lab/scale.css'), text('world-lab/app.js'), text('world-lab/scale.mjs'),
  text('world-lab/scale-workflow.mjs'), text('world-lab/accepted-orientation.mjs'),
  text('world-lab/spatial-probe.mjs'), text('world-lab/survey.mjs'), text('tools/w0-server.mjs'),
  text('URUCHOM_W0_WORLD_GROUNDING.cmd'), text('tools/run-w0-owner.ps1')
]);

assert(html.includes('W0.3 · Metric Scale'), 'W0.3 page identity missing');
assert(html.includes('./scale.css'), 'W0.3 scale stylesheet link missing');
assert(scaleCss.includes('.scale-row'), 'W0.3 scale stylesheet content missing');
assert(html.includes('playcanvas@2.21.2'), 'PlayCanvas pin drifted');
assert(!html.includes('@latest'), 'W0 must not use latest CDN alias');
assert(html.includes('known real distances') || html.includes('Known real distances') || html.includes('Znana odległość'), 'known-distance workflow missing');
assert(html.includes('focusViewButton'), 'Focus navigation control missing');
assert(app.includes('new ScaleWorkflow'), 'ScaleWorkflow not wired');
assert(app.includes('ACCEPTED_W0_2'), 'accepted gravity evidence not wired');
assert(app.includes('groundingRoot.setLocalRotation(...ACCEPTED_W0_2.correctionQuaternion)'), 'accepted gravity preview not applied');
assert(orientation.includes('w0-2-owner-pass-2026-08-15.json'), 'gravity provenance drifted');
assert(orientation.includes("sourceSha256: '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3'"), 'gravity source identity drifted');
assert(probe.includes('selection.includes(this.foreground.gsplat)'), 'foreground calibration authority missing');
assert(workflow.includes('knownMetres'), 'known metre input missing');

assert(workflow.includes("u.list.addEventListener('change'"), 'scale fields must commit on change/blur without per-keystroke DOM rebuild');
assert(!workflow.includes("u.list.addEventListener('input'"), 'per-keystroke scale form rebuild regression');
assert(workflow.includes('buildScaleSolverInput'), 'original measurement row identity helper not wired');
assert(scale.includes('sourceIndex'), 'scale solver-input helper must preserve original row identity');
assert(scale.includes("replace(',', '.')"), 'Polish decimal comma normalization missing');
assert(workflow.includes('provenance'), 'measurement provenance missing');
assert(workflow.includes('sourceLength'), 'source distance evidence missing');
assert(workflow.includes('relativeResidualPct'), 'per-measurement scale residual missing');
assert(workflow.includes('automaticAcceptance: false'), 'scale workflow must not self-accept');
assert(!workflow.includes('Box3D'), 'W0.3 must not pull physics forward');
assert(scale.includes('ORIGIN_CONSTRAINED_LEAST_SQUARES_ALL_VALID_MEASUREMENTS'), 'scale solve method missing');
assert(scale.includes('silentOutlierRemoval: false'), 'scale solver must expose conflicting measurements');
assert(scale.includes('automaticAcceptance: false'), 'scale solver must not self-accept');
assert(server.includes("DRAFT_ORIENTATION_VERIFIED_SCALE_UNKNOWN"), 'server calibration state drifted');
assert(server.includes("EXPECTED_SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3'"), 'source SHA drifted');
assert(server.includes('isAllowedHost'), 'loopback Host guard missing');
assert(owner.includes('$ExpectedArchiveSha256'), 'ZIP hash-before-extraction guard missing');
assert(survey.includes('focusAtCursor'), 'foreground focus navigation missing');
assert(launcher.includes('run-w0-owner.ps1'), 'owner launcher wiring missing');

console.log('W0.3 static + metric-scale contract check: PASS');
