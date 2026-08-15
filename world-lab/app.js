import {
  Application,
  Asset,
  Color,
  DEVICETYPE_WEBGL2,
  Entity,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  createGraphicsDevice
} from 'playcanvas';
import { SurveyController } from './survey.mjs';
import { SpatialProbe } from './spatial-probe.mjs';
import { MarkerSystem } from './marker-system.mjs';
import { sourceToBaseline } from './gravity-workflow.mjs';
import { rotateVectorByQuat } from './gravity.mjs';
import { ACCEPTED_W0_2 } from './accepted-orientation.mjs';
import { ScaleWorkflow } from './scale-workflow.mjs';

const $ = (selector) => document.querySelector(selector);
const SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3';

const canvas = $('#viewport');
const appElement = $('#app');
const loadingPanel = $('#loadingPanel');
const loadingTitle = $('#loadingTitle');
const loadingDetail = $('#loadingDetail');
const progressBar = $('#progressBar');
const errorPanel = $('#errorPanel');
const errorText = $('#errorText');
const backendStatus = $('#backendStatus');
let app;
let camera;
let groundingRoot;
let foreground;
let environment;
let survey;
let probe;

async function loadGsplat(name, url, onProgress) {
  const asset = new Asset(name, 'gsplat', { url });
  app.assets.add(asset);
  asset.on('progress', (received, total) => onProgress?.(received, total));
  await new Promise((resolve, reject) => {
    asset.ready(resolve);
    asset.once('error', (error) => reject(new Error(String(error))));
    app.assets.load(asset);
  });
  return asset;
}

function scaleUi() {
  return {
    app: appElement,
    hint: $('#pickHint'),
    add: $('#addMeasurementButton'),
    undo: $('#undoMeasurementButton'),
    clear: $('#clearMeasurementButton'),
    copy: $('#copyScaleEvidenceButton'),
    count: $('#measurementCount'),
    solved: $('#solvedMeasurementCount'),
    solver: $('#scaleSolverStatus'),
    units: $('#unitsPerMetreStatus'),
    metresPerUnit: $('#metresPerUnitStatus'),
    median: $('#medianScaleResidualStatus'),
    max: $('#maxScaleResidualStatus'),
    cv: $('#scaleCvStatus'),
    readiness: $('#scaleReadinessStatus'),
    list: $('#measurementList')
  };
}


async function boot() {
  const meta = await fetch('/api/source', { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`Source metadata HTTP ${response.status}`);
    return response.json();
  });
  if (!meta.verified || meta.sourceSha256 !== SOURCE_SHA || ACCEPTED_W0_2.sourceSha256 !== SOURCE_SHA) {
    throw new Error('Źródło albo zaakceptowana orientacja W0.2 nie spełnia source SHA contract.');
  }

  const device = await createGraphicsDevice(canvas, {
    deviceTypes: [DEVICETYPE_WEBGL2],
    antialias: false,
    powerPreference: 'high-performance'
  });
  app = new Application(canvas, { graphicsDevice: device });
  app.graphicsDevice.maxPixelRatio = 1;
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);
  app.scene.gsplat.enableIds = true;
  app.start();
  backendStatus.textContent = app.graphicsDevice.deviceType;

  camera = new Entity('W0 Survey Camera');
  camera.addComponent('camera', {
    clearColor: new Color(0.027, 0.035, 0.043),
    nearClip: 0.003,
    farClip: 2500,
    fov: 58
  });
  app.root.addChild(camera);

  groundingRoot = new Entity('W0 Draft Grounding Root');
  groundingRoot.setLocalRotation(...ACCEPTED_W0_2.correctionQuaternion);
  app.root.addChild(groundingRoot);

  loadingTitle.textContent = 'Ładuję foreground…';
  const fgAsset = await loadGsplat('W0 Foreground', '/asset/foreground.ply', (loaded, total) => {
    if (total > 0) progressBar.style.width = `${Math.min(86, 8 + loaded / total * 78)}%`;
    loadingDetail.textContent = total > 0
      ? `${Math.round(loaded / 1048576)} / ${Math.round(total / 1048576)} MiB`
      : 'Ładowanie foreground';
  });
  foreground = new Entity('W0 Foreground');
  foreground.setLocalEulerAngles(0, 0, 180);
  foreground.addComponent('gsplat', { asset: fgAsset });
  groundingRoot.addChild(foreground);

  loadingTitle.textContent = 'Ładuję environment appearance…';
  const envAsset = await loadGsplat('W0 Environment', '/asset/environment.ply');
  environment = new Entity('W0 Environment appearance only');
  environment.setLocalEulerAngles(0, 0, 180);
  environment.addComponent('gsplat', { asset: envAsset });
  groundingRoot.addChild(environment);

  const bounds = meta.foreground.bounds;
  const centerSource = bounds.min.map((value, index) => (value + bounds.max[index]) * 0.5);
  const size = bounds.min.map((value, index) => bounds.max[index] - value);
  const extent = Math.max(...size);
  const centerBaseline = sourceToBaseline(centerSource);
  const center = rotateVectorByQuat(centerBaseline, ACCEPTED_W0_2.correctionQuaternion);
  const radius = extent * 0.42;
  const baselineOffset = [-radius * 0.28, radius * 0.34, radius * 0.88];
  const correctedOffset = rotateVectorByQuat(baselineOffset, ACCEPTED_W0_2.correctionQuaternion);
  const position = center.map((value, index) => value + correctedOffset[index]);

  survey = new SurveyController({
    canvas,
    target: center,
    position,
    fovDeg: camera.camera.fov,
    setCamera(nextPosition, target) {
      camera.setPosition(...nextPosition);
      camera.lookAt(...target);
    }
  });

  const markers = new MarkerSystem({ root: groundingRoot, camera, canvas });
  probe = new SpatialProbe({ app, camera, foreground, environment, markers });
  survey.setFocusResolver(async (clientX, clientY) => {
    const picked = await probe.pickForeground({ clientX, clientY }, canvas);
    return picked?.runtimeWorld ?? null;
  });

  new ScaleWorkflow({
    app,
    canvas,
    survey,
    probe,
    markers,
    ui: scaleUi(),
    sourceSha: SOURCE_SHA,
    acceptedGravity: ACCEPTED_W0_2
  });

  $('#focusViewButton').addEventListener('click', () => void survey.focusAtCursor());
  $('#fitViewButton').addEventListener('click', () => survey.fit());
  $('#resetViewButton').addEventListener('click', () => survey.reset());

  $('#gravityStatus').textContent = `VERIFIED · ${ACCEPTED_W0_2.tiltDeg.toFixed(2)}°`;
  progressBar.style.width = '100%';
  loadingPanel.hidden = true;
  appElement.dataset.state = 'ready';
}

boot().catch((error) => {
  console.error(error);
  loadingPanel.hidden = true;
  errorPanel.hidden = false;
  errorText.textContent = error?.stack || error?.message || String(error);
});

window.addEventListener('beforeunload', () => {
  survey?.destroy();
  probe?.destroy();
  app?.destroy();
});
