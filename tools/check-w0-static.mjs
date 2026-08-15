import { readFile } from 'node:fs/promises';
async function text(path){return readFile(new URL(`../${path}`,import.meta.url),'utf8');}
function assert(c,m){if(!c)throw new Error(m);}
const [html,app,gravity,workflow,probe,markers,survey,server,launcher,owner]=await Promise.all([
  text('world-lab/index.html'),text('world-lab/app.js'),text('world-lab/gravity.mjs'),text('world-lab/gravity-workflow.mjs'),text('world-lab/spatial-probe.mjs'),text('world-lab/marker-system.mjs'),text('world-lab/survey.mjs'),text('tools/w0-server.mjs'),text('URUCHOM_W0_WORLD_GROUNDING.cmd'),text('tools/run-w0-owner.ps1')
]);
assert(html.includes('playcanvas@2.21.2'),'PlayCanvas pin drifted');
assert(!html.includes('@latest'),'W0 must not use latest CDN alias');
assert(html.includes('W0.2 · Gravity'),'W0.2 UI identity missing');
assert(app.includes('app.scene.gsplat.enableIds=true'),'GSplat IDs missing');
assert(app.includes("groundingRoot=new Entity('W0 Draft Grounding Root')"),'draft grounding root missing');
assert(app.includes('foreground.setLocalEulerAngles(0,0,180)'),'foreground baseline orientation missing');
assert(app.includes('environment.setLocalEulerAngles(0,0,180)'),'environment baseline orientation missing');
assert(app.includes('new SpatialProbe'),'SpatialProbe not wired');
assert(app.includes('new GravityWorkflow'),'GravityWorkflow not wired');
assert(probe.includes('new Picker(app, 1, 1, true)'),'depth Picker missing');
assert(probe.includes('this.environment.enabled = false'),'environment picking exclusion missing');
assert(probe.includes('selection.includes(this.foreground.gsplat)'),'foreground authority missing');
assert(probe.includes('getWorldTransform().clone().invert()'),'source coordinate recovery missing');
assert(markers.includes('const DIAMETER_PX = 16'),'adaptive marker target drifted');
assert(workflow.includes('solveGravity(this.solverRefs())'),'solver wiring missing');
assert(workflow.includes('this.root.setLocalRotation(x,y,z,w)'),'reversible preview missing');
assert(workflow.includes("worldCalibration:'DRAFT_ORIENTATION_CANDIDATE_NO_SCALE'"),'draft no-scale evidence missing');
assert(workflow.includes('automaticAcceptance:false'),'owner decision boundary missing');
assert(workflow.includes("this.verticals.length>=3"),'minimum evidence reference count missing');
assert(!workflow.includes('unitsPerMetre'),'W0.2 must not invent metric scale');
assert(!workflow.includes('Box3D'),'W0.2 must not pull physics forward');
assert(gravity.includes('automaticAcceptance: false'),'solver must not self-accept');
assert(gravity.includes('dominantAxis'),'dominant-axis solver missing');
assert(server.includes("EXPECTED_SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3'"),'source SHA drifted');
assert(server.includes('calibrationAuthority: false'),'environment authority drifted');
assert(!survey.includes("'w'"),'Survey must not reintroduce WASD');
assert(launcher.includes('run-w0-owner.ps1'),'launcher wiring missing');
assert(owner.includes('System.Windows.Forms.OpenFileDialog'),'owner file picker missing');
console.log('W0.2 static contract check: PASS');
