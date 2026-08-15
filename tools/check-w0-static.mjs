import { readFile } from 'node:fs/promises';

async function text(path) { return readFile(new URL(`../${path}`, import.meta.url), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const [html, app, survey, server, launcher, owner] = await Promise.all([
  text('world-lab/index.html'), text('world-lab/app.js'), text('world-lab/survey.mjs'),
  text('tools/w0-server.mjs'), text('URUCHOM_W0_WORLD_GROUNDING.cmd'), text('tools/run-w0-owner.ps1')
]);

assert(html.includes('playcanvas@2.21.2'), 'PlayCanvas pin drifted');
assert(!html.includes('@latest'), 'W0 must not use latest CDN alias');
assert(app.includes('app.scene.gsplat.enableIds = true'), 'GSplat IDs must be enabled before picking');
assert(app.includes('new Picker(app, 1, 1, true)'), 'Depth-enabled Picker missing');
assert(app.includes('picker.prepare(camera.camera, app.scene, [worldLayer])'), 'Picker prepare contract missing');
assert(app.includes('getWorldPointAsync'), 'World-point picking missing');
assert(app.includes('getSelectionAsync'), 'Foreground identity picking missing');
assert(app.includes('environment.enabled = false'), 'Environment must be excluded from calibration picking');
assert(app.includes('selection.includes(foreground.gsplat)'), 'Foreground-only calibration authority missing');
assert(app.includes('getWorldTransform().clone().invert()'), 'Runtime-world to source coordinate conversion missing');
assert(app.includes("worldCalibration: 'DRAFT_UNMEASURED'"), 'W0.1 must not promote calibration');
assert(!app.includes('unitsPerMetre'), 'W0.1 must not invent metric scale');
assert(!app.includes('Box3D'), 'W0.1 must not pull physics forward');
assert(server.includes("EXPECTED_SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3'"), 'Source SHA gate drifted');
assert(server.includes("ENVIRONMENT_SHA = 'b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c'"), 'Environment receipt drifted');
assert(server.includes("'/asset/environment.ply'"), 'Environment endpoint missing');
assert(server.includes('calibrationAuthority: false'), 'Environment must explicitly lack calibration authority');
assert(survey.includes('export class SurveyController'), 'Survey controller missing');
assert(!survey.includes("'w'"), 'W0.1 survey must not silently reintroduce fly/WASD navigation');
assert(launcher.includes('run-w0-owner.ps1'), 'Owner launcher wiring missing');
assert(owner.includes('System.Windows.Forms.OpenFileDialog'), 'Owner file picker missing');

console.log('W0.1 static contract check: PASS');
