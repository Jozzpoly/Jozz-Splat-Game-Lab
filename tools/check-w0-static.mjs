import { readFile } from 'node:fs/promises';

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [html, app, gravity, workflow, probe, markers, survey, server, launcher, owner] = await Promise.all([
  text('world-lab/index.html'),
  text('world-lab/app.js'),
  text('world-lab/gravity.mjs'),
  text('world-lab/gravity-workflow.mjs'),
  text('world-lab/spatial-probe.mjs'),
  text('world-lab/marker-system.mjs'),
  text('world-lab/survey.mjs'),
  text('tools/w0-server.mjs'),
  text('URUCHOM_W0_WORLD_GROUNDING.cmd'),
  text('tools/run-w0-owner.ps1')
]);

assert(html.includes('playcanvas@2.21.2'), 'PlayCanvas pin drifted');
assert(!html.includes('@latest'), 'W0 must not use latest CDN alias');
assert(html.includes('W0.2 · Gravity'), 'W0.2 UI identity missing');
assert(html.includes('axisCoherenceStatus'), 'axis coherence readout missing');
assert(html.includes('reversedStatus'), 'reversed direction readout missing');
assert(html.includes('focusViewButton'), 'surface-focus control missing');
assert(html.includes('Fit (Home)'), 'Fit navigation control missing');
assert(html.includes('MMB obrót'), 'owner navigation hint missing');
assert(html.includes('F focus pod kursorem'), 'focus navigation hint missing');

assert(app.includes('app.scene.gsplat.enableIds = true'), 'GSplat IDs missing');
assert(app.includes("groundingRoot = new Entity('W0 Draft Grounding Root')"), 'draft grounding root missing');
assert(app.includes('foreground.setLocalEulerAngles(0, 0, 180)'), 'foreground baseline orientation missing');
assert(app.includes('environment.setLocalEulerAngles(0, 0, 180)'), 'environment baseline orientation missing');
assert(app.includes('new SpatialProbe'), 'SpatialProbe not wired');
assert(app.includes('new GravityWorkflow'), 'GravityWorkflow not wired');
assert(app.includes('fovDeg: camera.camera.fov'), 'Survey FOV contract missing');
assert(app.includes('survey.setFocusResolver'), 'surface focus resolver not wired');
assert(app.includes('picked?.runtimeWorld'), 'focus must use a picked foreground world point');
assert(app.includes('nearClip: 0.003'), 'close inspection near clip drifted');

assert(probe.includes('new Picker(app, 1, 1, true)'), 'depth Picker missing');
assert(probe.includes('this.environment.enabled = false'), 'environment picking exclusion missing');
assert(probe.includes('selection.includes(this.foreground.gsplat)'), 'foreground authority missing');
assert(probe.includes('getWorldTransform().clone().invert()'), 'source coordinate recovery missing');

assert(markers.includes('DIAMETER_PX=16') || markers.includes('DIAMETER_PX = 16'), 'adaptive marker target drifted');
assert(markers.includes('setRole(marker,role)') || markers.includes('setRole(marker, role)'), 'explicit endpoint role update missing');

assert(workflow.includes('axisResidualDeg'), 'axis residual evidence missing');
assert(workflow.includes('directionStatus'), 'direction evidence missing');
assert(workflow.includes('manualFlipCount'), 'manual direction correction audit missing');
assert(workflow.includes('data-flip-index'), 'explicit endpoint flip UI missing');
assert(workflow.includes('directionConsensus.reversedCount'), 'preview direction guard missing');
assert(workflow.includes('automaticAcceptance:false'), 'owner decision boundary missing');
assert(!workflow.includes('unitsPerMetre'), 'W0.2 must not invent metric scale');
assert(!workflow.includes('Box3D'), 'W0.2 must not pull physics forward');

assert(gravity.includes('axisCoherence'), 'axis coherence solver output missing');
assert(gravity.includes('axisResidualStats'), 'axis residual statistics missing');
assert(gravity.includes("directionStatus:directedResidualDeg<=90?'AGREES':'REVERSED'") || gravity.includes("directionStatus: directedResidualDeg <= 90 ? 'AGREES' : 'REVERSED'"), 'direction classification missing');
assert(gravity.includes('automaticAcceptance:false') || gravity.includes('automaticAcceptance: false'), 'solver must not self-accept');

assert(server.includes("EXPECTED_SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3'"), 'source SHA drifted');
assert(server.includes('calibrationAuthority: false'), 'environment authority drifted');
assert(server.includes('isAllowedHost'), 'loopback Host validation missing');
assert(server.includes("parsed.hostname === '127.0.0.1'"), '127.0.0.1 Host allowlist missing');
assert(server.includes("'Cross-Origin-Resource-Policy', 'same-origin'"), 'same-origin resource hardening missing');
assert(server.includes("'X-Content-Type-Options', 'nosniff'"), 'nosniff header missing');
assert(server.includes('res.writeHead(400)'), 'malformed request handling missing');

assert(survey.includes('event.button !== 1'), 'camera must use MMB only and leave LMB/RMB free');
assert(survey.includes('event.shiftKey'), 'Shift+MMB pan missing');
assert(survey.includes('this.minRadius = 1e-6'), 'close inspection safety floor drifted');
assert(!survey.includes('this.initialRadius * 0.025'), 'old coarse zoom floor returned');
assert(!survey.includes('this.initialRadius * 80'), 'old far zoom ceiling returned');
assert(survey.includes('zoomFraction'), 'cursor-anchored zoom missing');
assert(survey.includes('setFocusResolver'), 'focus resolver contract missing');
assert(survey.includes('focusAtCursor'), 'surface focus action missing');
assert(survey.includes("key === 'f'"), 'F focus shortcut missing');
assert(survey.includes("event.key === 'Home'"), 'Home fit shortcut missing');
assert(survey.includes("key === 'r'"), 'R reset shortcut missing');
assert(!survey.includes("'w'"), 'Survey must not reintroduce WASD');

assert(launcher.includes('run-w0-owner.ps1'), 'launcher wiring missing');
assert(owner.includes('System.Windows.Forms.OpenFileDialog'), 'owner file picker missing');
assert(owner.includes('$ExpectedArchiveSha256'), 'ZIP SHA gate missing');
assert(owner.includes('Get-FileHash'), 'ZIP must be hashed before extraction');
assert(owner.indexOf('Get-FileHash') < owner.indexOf('Expand-Archive'), 'ZIP hash gate must happen before extraction');
assert(owner.includes('Remove-Item -LiteralPath $extractDir -Recurse -Force'), 'temporary extraction cleanup missing');

console.log('W0.2 static + navigation + local-security contract check: PASS');
