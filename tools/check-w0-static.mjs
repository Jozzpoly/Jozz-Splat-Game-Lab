import { readFile } from 'node:fs/promises';

async function text(path) { return readFile(new URL(`../${path}`, import.meta.url), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const [html, app, gravity, survey, server, launcher, owner] = await Promise.all([
  text('world-lab/index.html'), text('world-lab/app.js'), text('world-lab/gravity.mjs'), text('world-lab/survey.mjs'),
  text('tools/w0-server.mjs'), text('URUCHOM_W0_WORLD_GROUNDING.cmd'), text('tools/run-w0-owner.ps1')
]);

assert(html.includes('playcanvas@2.21.2'), 'PlayCanvas pin drifted');
assert(!html.includes('@latest'), 'W0 must not use latest CDN alias');
assert(html.includes('W0.2 · Gravity'), 'W0.2 Gravity UI identity missing');
assert(app.includes('app.scene.gsplat.enableIds = true'), 'GSplat IDs must be enabled before picking');
assert(app.includes('new Picker(app, 1, 1, true)'), 'Depth-enabled Picker missing');
assert(app.includes('selection.includes(foreground.gsplat)'), 'Foreground-only calibration authority missing');
assert(app.includes('environment.enabled = false'), 'Environment must be excluded from calibration picking');
assert(app.includes("const sourceToBaseline = ([x, y, z]) => [-x, -y, z]"), 'baseline source transform drifted');
assert(app.includes("groundingRoot = new Entity('W0 Draft Grounding Root')"), 'draft grounding root missing');
assert(app.includes('foreground.setLocalEulerAngles(0, 0, 180)'), 'foreground baseline orientation missing');
assert(app.includes('environment.setLocalEulerAngles(0, 0, 180)'), 'environment baseline orientation missing');
assert(app.includes('solveGravity(solverReferences())'), 'gravity solver is not wired to references');
assert(app.includes('correctionQuaternion'), 'gravity correction preview missing');
assert(app.includes('groundingRoot.setLocalRotation(x, y, z, w)'), 'reversible level preview is not applied at grounding root');
assert(app.includes('MARKER_DIAMETER_PX = 16'), 'adaptive marker screen-size contract drifted');
assert(app.includes("worldCalibration: 'DRAFT_ORIENTATION_CANDIDATE_NO_SCALE'"), 'W0.2 must remain draft and explicitly lack scale');
assert(!app.includes('unitsPerMetre'), 'W0.2 must not invent metric scale');
assert(!app.includes('Box3D'), 'W0.2 must not pull physics forward');
assert(gravity.includes('automaticAcceptance: false'), 'gravity solver must not silently accept its own candidate');
assert(gravity.includes('dominantAxis'), 'best-fit gravity axis solver missing');
assert(gravity.includes('correctionQuaternion'), 'gravity solver correction quaternion missing');
assert(server.includes("EXPECTED_SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3'"), 'Source SHA gate drifted');
assert(server.includes('calibrationAuthority: false'), 'Environment must explicitly lack calibration authority');
assert(survey.includes('export class SurveyController'), 'Survey controller missing');
assert(!survey.includes("'w'"), 'W0.2 survey must not silently reintroduce fly/WASD navigation');
assert(launcher.includes('run-w0-owner.ps1'), 'Owner launcher wiring missing');
assert(owner.includes('System.Windows.Forms.OpenFileDialog'), 'Owner file picker missing');

console.log('W0.2 static contract check: PASS');
