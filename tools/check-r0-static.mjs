import { readFile } from 'node:fs/promises';

const files = {
  html: 'lab/index.html',
  app: 'lab/app.js',
  spark: 'lab/runtime/spark.mjs',
  playcanvas: 'lab/runtime/playcanvas.mjs',
  server: 'tools/r0-server.mjs',
  launcher: 'URUCHOM_R0_LAB.cmd',
  owner: 'tools/run-r0-owner.ps1'
};

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const content = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await text(path)])));

assert(content.html.includes('three@0.185.1'), 'R0 Three pin drifted');
assert(content.html.includes('/spark/2.1.0/spark.module.js'), 'R0 Spark pin drifted');
assert(content.html.includes('playcanvas@2.21.2'), 'R0 PlayCanvas pin drifted');
assert(!content.html.includes('@latest'), 'R0 must not use latest CDN aliases');
assert(content.server.includes("EXPECTED_SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3'"), 'R0 source SHA gate drifted');
assert(content.server.includes("FOREGROUND_SHA = 'a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112'"), 'R0 foreground SHA drifted');
assert(content.server.includes('FOREGROUND_SPLATS = 1_013_122'), 'R0 foreground count drifted');
assert(content.server.includes('relative as pathRelative'), 'R0 static server must keep path.relative alias explicit');
assert(content.server.includes('const relativePath ='), 'R0 static server must not shadow pathRelative with the requested path variable');
assert(content.server.includes('const relToLab = pathRelative('), 'R0 static containment check is missing');
assert(content.spark.includes("backend: 'webgl2'"), 'Spark baseline must remain explicit WebGL2');
assert(content.playcanvas.includes("[DEVICETYPE_WEBGPU, DEVICETYPE_WEBGL2]"), 'PlayCanvas Best mode must preserve WebGPU->WebGL2 fallback order');
assert(content.app.includes("sourceMode === 'raw' ? '/asset/raw.ply' : '/asset/foreground.ply'"), 'R0 source selection contract drifted');
assert(content.app.includes("gate: 'R0-A'"), 'R0 report identity missing');
assert(content.app.includes("const backendMode = runtimeName === 'spark' ? 'webgl2' : requestedBackendMode"), 'Spark backend mode normalization missing');
assert(content.app.includes('benchmarkCameraSource'), 'shared source-space benchmark camera missing');
assert(content.spark.includes('transformPoint(benchmarkCameraSource.position)'), 'Spark does not transform shared source-space camera');
assert(content.playcanvas.includes('transformPoint(benchmarkCameraSource.position)'), 'PlayCanvas does not transform shared source-space camera');
assert(content.launcher.includes('run-r0-owner.ps1'), 'owner launcher is not wired to PowerShell helper');
assert(content.owner.includes('System.Windows.Forms.OpenFileDialog'), 'owner workflow lost graphical file picker');

console.log('R0 static contract check: PASS');
