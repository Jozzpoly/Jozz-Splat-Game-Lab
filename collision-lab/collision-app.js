import {
  Application,
  Asset,
  Color,
  DEVICETYPE_WEBGL2,
  Entity,
  FILLMODE_FILL_WINDOW,
  Quat,
  RESOLUTION_AUTO,
  Vec3,
  createGraphicsDevice
} from 'playcanvas';
import { SurveyController } from '/shared/survey.mjs';
import { SpatialProbe } from '/shared/spatial-probe.mjs';
import { ACCEPTED_W0_2 } from './accepted-orientation.mjs';
import { CandidateLayer } from './candidate-layer.mjs';
import { CollisionProbe } from './collision-probe.mjs';
import { CollisionWorkflow } from './collision-workflow.mjs';
import { CompareMarkerSystem } from './compare-markers.mjs';

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
let spatialProbe;
let collisionProbe;
let workflow;
let markers;
let candidates;

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

function sourcePointToWorld(source) {
  const point = new Vec3(source[0], source[1], source[2]);
  return foreground.getWorldTransform().transformPoint(point);
}

function candidateUi() {
  return {
    voxel: $('#voxelStatus'),
    alpha: $('#alphaStatus'),
    scale: $('#scaleStatus'),
    faces: $('#facesStatus'),
    sha: $('#meshShaStatus')
  };
}

function workflowUi() {
  return {
    addProbe: $('#addProbeButton'),
    clear: $('#clearProbeButton'),
    copy: $('#copyEvidenceButton'),
    hint: $('#probeHint'),
    classifyButtons: [...document.querySelectorAll('[data-classification]')],
    probeCount: $('#probeCount'),
    latestStatus: $('#latestStatus'),
    latestDelta: $('#latestDelta'),
    latestDepth: $('#latestDepth'),
    latestClass: $('#latestClass'),
    bothCount: $('#bothCount'),
    missingCount: $('#missingCount'),
    phantomCount: $('#phantomCount'),
    list: $('#probeList')
  };
}

function renderCandidateMetadata(meta, name) {
  const c = meta.candidates[name];
  const ui = candidateUi();
  ui.voxel.textContent = `${c.parameters.voxel} src · ${(c.voxelFractionOfRoiDiagonal * 100).toFixed(3)}% ROI`;
  ui.alpha.textContent = String(c.parameters.alpha_min);
  ui.scale.textContent = `${c.parameters.max_scale} src`;
  ui.faces.textContent = c.faces.toLocaleString('pl-PL');
  ui.sha.textContent = `${c.sha256.slice(0, 12)}…`;
}

async function boot() {
  const meta = await fetch('/api/c0a', { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`C0a metadata HTTP ${response.status}`);
    return response.json();
  });
  if (!meta.source?.verified || meta.source.sourceSha256 !== SOURCE_SHA) {
    throw new Error('Źródło nie spełnia F0 SHA-256 contract.');
  }
  if (meta.metricStatus !== 'UNCALIBRATED_SOURCE_UNITS') {
    throw new Error('C0a musi pozostać jawnie niemetryczne.');
  }
  if (ACCEPTED_W0_2.sourceSha256 !== SOURCE_SHA) {
    throw new Error('Accepted W0.2 orientation belongs to another source.');
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

  camera = new Entity('C0a Survey Camera');
  camera.addComponent('camera', {
    clearColor: new Color(0.022, 0.029, 0.034),
    nearClip: 0.001,
    farClip: 2500,
    fov: 58
  });
  app.root.addChild(camera);

  groundingRoot = new Entity('Accepted W0.2 oriented world root');
  groundingRoot.setLocalRotation(new Quat(...ACCEPTED_W0_2.correctionQuaternion));
  app.root.addChild(groundingRoot);

  loadingTitle.textContent = 'Ładuję foreground…';
  const fgAsset = await loadGsplat('C0a Foreground', '/asset/foreground.ply', (loaded, total) => {
    if (total > 0) progressBar.style.width = `${Math.min(66, 5 + loaded / total * 61)}%`;
    loadingDetail.textContent = total > 0
      ? `${Math.round(loaded / 1048576)} / ${Math.round(total / 1048576)} MiB`
      : 'Ładowanie foreground';
  });
  foreground = new Entity('C0a Foreground');
  foreground.setLocalEulerAngles(0, 0, 180);
  foreground.addComponent('gsplat', { asset: fgAsset });
  groundingRoot.addChild(foreground);

  loadingTitle.textContent = 'Ładuję environment appearance…';
  const envAsset = await loadGsplat('C0a Environment', '/asset/environment.ply');
  environment = new Entity('C0a Environment appearance only');
  environment.setLocalEulerAngles(0, 0, 180);
  environment.addComponent('gsplat', { asset: envAsset });
  groundingRoot.addChild(environment);

  const roi = meta.roiSourceBounds;
  const roiCenterSource = [
    (roi.x[0] + roi.x[1]) * 0.5,
    (roi.y[0] + roi.y[1]) * 0.5,
    (roi.z[0] + roi.z[1]) * 0.5
  ];
  const roiSize = [roi.x[1] - roi.x[0], roi.y[1] - roi.y[0], roi.z[1] - roi.z[0]];
  const roiDiagonal = Math.hypot(...roiSize);
  const roiWorld = sourcePointToWorld(roiCenterSource);
  const target = [roiWorld.x, roiWorld.y, roiWorld.z];
  const position = [
    target[0] - roiDiagonal * 0.36,
    target[1] + roiDiagonal * 0.31,
    target[2] + roiDiagonal * 0.82
  ];

  survey = new SurveyController({
    canvas,
    target,
    position,
    fovDeg: camera.camera.fov,
    setCamera(nextPosition, nextTarget) {
      camera.setPosition(...nextPosition);
      camera.lookAt(...nextTarget);
    }
  });

  markers = new CompareMarkerSystem({ root: app.root, camera, canvas });
  spatialProbe = new SpatialProbe({ app, camera, foreground, environment, markers });

  candidates = new CandidateLayer({ app, groundingRoot, metadata: meta });
  loadingTitle.textContent = 'Ładuję candidate meshes…';
  await candidates.loadAll((done, total, name) => {
    progressBar.style.width = `${66 + done / total * 30}%`;
    loadingDetail.textContent = `${name} · ${done}/${total}`;
  });
  candidates.setActive('balanced');
  renderCandidateMetadata(meta, 'balanced');

  collisionProbe = new CollisionProbe({
    app,
    camera,
    foreground,
    environment,
    markers,
    spatialProbe,
    candidateLayer: candidates
  });

  workflow = new CollisionWorkflow({
    canvas,
    survey,
    collisionProbe,
    markers,
    candidateLayer: candidates,
    metadata: meta,
    sourceSha: SOURCE_SHA,
    orientation: ACCEPTED_W0_2,
    ui: workflowUi()
  });

  survey.setFocusResolver(async (clientX, clientY) => {
    const candidateVisible = candidates.visible;
    candidates.setVisible(false);
    try {
      const picked = await spatialProbe.pickForeground({ clientX, clientY }, canvas);
      return picked?.runtimeWorld ?? null;
    } finally {
      candidates.setVisible(candidateVisible);
    }
  });

  document.querySelectorAll('[data-candidate]').forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.candidate;
      if (!candidates.setActive(name)) return;
      document.querySelectorAll('[data-candidate]').forEach((item) => item.classList.toggle('selected', item === button));
      renderCandidateMetadata(meta, name);
    });
  });

  $('#wireButton').addEventListener('click', () => {
    candidates.setStyle('wireframe');
    $('#wireButton').classList.add('selected');
    $('#solidButton').classList.remove('selected');
  });
  $('#solidButton').addEventListener('click', () => {
    candidates.setStyle('solid');
    $('#solidButton').classList.add('selected');
    $('#wireButton').classList.remove('selected');
  });
  $('#opacityInput').addEventListener('input', (event) => candidates.setOpacity(event.target.value));
  $('#meshVisible').addEventListener('change', (event) => candidates.setVisible(event.target.checked));
  $('#foregroundVisible').addEventListener('change', (event) => { foreground.enabled = event.target.checked; });
  $('#environmentVisible').addEventListener('change', (event) => { environment.enabled = event.target.checked; });
  $('#focusRoiButton').addEventListener('click', () => survey.focus(target));
  $('#focusViewButton').addEventListener('click', () => void survey.focusAtCursor());
  $('#fitViewButton').addEventListener('click', () => survey.fit());
  $('#resetViewButton').addEventListener('click', () => survey.reset());

  app.on('update', () => markers.update());
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
  workflow?.destroy();
  collisionProbe?.destroy();
  spatialProbe?.destroy();
  candidates?.destroy();
  survey?.destroy();
  app?.destroy();
});
