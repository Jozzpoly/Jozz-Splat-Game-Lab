import {
  Application,
  Asset,
  Color,
  DEVICETYPE_WEBGL2,
  Entity,
  FILLMODE_FILL_WINDOW,
  Picker,
  RESOLUTION_AUTO,
  StandardMaterial,
  createGraphicsDevice
} from 'playcanvas';
import { SurveyController } from './survey.mjs';

const $ = (selector) => document.querySelector(selector);
const canvas = $('#viewport');
const appElement = $('#app');
const loadingPanel = $('#loadingPanel');
const loadingTitle = $('#loadingTitle');
const loadingDetail = $('#loadingDetail');
const progressBar = $('#progressBar');
const errorPanel = $('#errorPanel');
const errorText = $('#errorText');
const backendStatus = $('#backendStatus');
const armPickButton = $('#armPickButton');
const undoButton = $('#undoButton');
const clearButton = $('#clearButton');
const copyEvidenceButton = $('#copyEvidenceButton');
const resetViewButton = $('#resetViewButton');
const pickHint = $('#pickHint');
const pickStatus = $('#pickStatus');
const pointCount = $('#pointCount');
const sourceCoords = $('#sourceCoords');
const worldCoords = $('#worldCoords');
const pointsList = $('#pointsList');

const SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3';
const BASELINE_ORIENTATION = 'source -> runtime: 180deg around Z; NOT calibrated world orientation';

let app = null;
let camera = null;
let foreground = null;
let environment = null;
let picker = null;
let survey = null;
let pickArmed = false;
let pickInFlight = false;
let markerMaterial = null;
const probes = [];
const markerEntities = [];
const MARKER_DIAMETER_PX = 18;
const MARKER_SCALE_MIN = 0.002;
const MARKER_SCALE_MAX = 8.0;

function formatVec(v) {
  if (!v) return '—';
  const values = Array.isArray(v) ? v : [v.x, v.y, v.z];
  return values.map((n) => Number(n).toFixed(5)).join(', ');
}

function sourceFromWorld(worldPoint) {
  const inverse = foreground.getWorldTransform().clone().invert();
  return inverse.transformPoint(worldPoint.clone());
}

function setPickArmed(value) {
  pickArmed = value;
  appElement.dataset.pickArmed = value ? 'true' : 'false';
  armPickButton.classList.toggle('armed', value);
  armPickButton.textContent = value ? 'Anuluj picking' : 'Dodaj punkt';
  pickHint.hidden = !value;
  survey?.setEnabled(!value);
  pickStatus.textContent = value ? 'ARMED' : probes.length ? 'READY' : 'IDLE';
}

function renderProbeList() {
  pointCount.textContent = String(probes.length);
  undoButton.disabled = probes.length === 0;
  clearButton.disabled = probes.length === 0;
  copyEvidenceButton.disabled = probes.length === 0;

  if (!probes.length) {
    pointsList.innerHTML = '<p class="empty">Brak punktów.</p>';
    sourceCoords.textContent = '—';
    worldCoords.textContent = '—';
    return;
  }

  const last = probes.at(-1);
  sourceCoords.textContent = formatVec(last.source);
  worldCoords.textContent = formatVec(last.world);
  pointsList.innerHTML = probes.map((probe, index) => `
    <div class="point-row">
      <strong>P${String(index + 1).padStart(2, '0')}</strong>
      <code>${formatVec(probe.source)}</code>
    </div>
  `).join('');
}

function createMarker(worldPoint, index) {
  const marker = new Entity(`W0 Probe ${index + 1}`);
  marker.addComponent('render', { type: 'sphere' });
  marker.setPosition(worldPoint);
  for (const meshInstance of marker.render.meshInstances) meshInstance.material = markerMaterial;
  app.root.addChild(marker);
  markerEntities.push(marker);
  updateMarkerScale(marker);
}

function updateMarkerScale(marker) {
  if (!camera) return;
  const cameraPosition = camera.getPosition();
  const markerPosition = marker.getPosition();
  const distance = Math.max(0.001, cameraPosition.distance(markerPosition));
  const viewportHeight = Math.max(1, canvas.clientHeight || canvas.height || 1);
  const worldHeight = 2 * distance * Math.tan(camera.camera.fov * Math.PI / 360);
  const worldPerPixel = worldHeight / viewportHeight;
  const scale = Math.min(MARKER_SCALE_MAX, Math.max(MARKER_SCALE_MIN, worldPerPixel * MARKER_DIAMETER_PX));
  marker.setLocalScale(scale, scale, scale);
}

function updateMarkerScales() {
  for (const marker of markerEntities) updateMarkerScale(marker);
}

function removeLastProbe() {
  if (!probes.length) return;
  probes.pop();
  markerEntities.pop()?.destroy();
  renderProbeList();
}

function clearProbes() {
  probes.length = 0;
  while (markerEntities.length) markerEntities.pop().destroy();
  renderProbeList();
}

function evidencePayload() {
  return {
    gate: 'W0.1',
    status: 'OWNER_PICK_EVIDENCE',
    recordedAt: new Date().toISOString(),
    sourceSha256: SOURCE_SHA,
    runtime: 'PlayCanvas 2.21.2',
    backend: app?.graphicsDevice?.deviceType ?? 'unknown',
    baselineOrientation: BASELINE_ORIENTATION,
    worldCalibration: 'DRAFT_UNMEASURED',
    probeCount: probes.length,
    probes: probes.map((probe, index) => ({ id: index + 1, source: probe.source, runtimeWorld: probe.world })),
    passQuestion: 'After orbiting/panning/zooming, do the persistent markers remain attached to the same visible foreground surfaces?'
  };
}

async function copyEvidence() {
  const payload = JSON.stringify(evidencePayload(), null, 2);
  try {
    await navigator.clipboard.writeText(payload);
    const old = copyEvidenceButton.textContent;
    copyEvidenceButton.textContent = 'Skopiowano';
    setTimeout(() => { copyEvidenceButton.textContent = old; }, 1400);
  } catch {
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'w0-1-picking-evidence.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

async function handlePick(event) {
  if (!pickArmed || pickInFlight || !picker) return;
  pickInFlight = true;
  pickStatus.textContent = 'PICKING…';

  try {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    picker.resize(width, height);

    const x = (event.clientX - rect.left) * width / rect.width;
    const y = (event.clientY - rect.top) * height / rect.height;

    environment.enabled = false;
    for (const marker of markerEntities) marker.enabled = false;
    const worldLayer = app.scene.layers.getLayerByName('World');
    picker.prepare(camera.camera, app.scene, [worldLayer]);
    const worldPoint = await picker.getWorldPointAsync(x, y);
    const selection = await picker.getSelectionAsync(x, y, 1, 1);
    environment.enabled = true;
    for (const marker of markerEntities) marker.enabled = true;

    if (!worldPoint || !selection.includes(foreground.gsplat)) {
      pickStatus.textContent = 'MISS / NOT FOREGROUND';
      return;
    }

    const sourcePoint = sourceFromWorld(worldPoint);
    const probe = {
      source: [sourcePoint.x, sourcePoint.y, sourcePoint.z],
      world: [worldPoint.x, worldPoint.y, worldPoint.z]
    };
    probes.push(probe);
    createMarker(worldPoint, probes.length - 1);
    pickStatus.textContent = 'VALID FOREGROUND PICK';
    renderProbeList();
    setPickArmed(false);
  } catch (error) {
    environment.enabled = true;
    for (const marker of markerEntities) marker.enabled = true;
    pickStatus.textContent = 'PICK ERROR';
    throw error;
  } finally {
    pickInFlight = false;
  }
}

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

async function boot() {
  const sourceMeta = await fetch('/api/source', { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`Source metadata HTTP ${response.status}`);
    return response.json();
  });
  if (!sourceMeta.verified || sourceMeta.sourceSha256 !== SOURCE_SHA) throw new Error('Źródło nie spełnia F0 SHA-256 contract.');

  const graphicsDevice = await createGraphicsDevice(canvas, {
    deviceTypes: [DEVICETYPE_WEBGL2],
    antialias: false,
    powerPreference: 'high-performance'
  });
  app = new Application(canvas, { graphicsDevice });
  app.graphicsDevice.maxPixelRatio = 1;
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);
  app.scene.gsplat.enableIds = true;
  app.start();
  backendStatus.textContent = app.graphicsDevice.deviceType;

  camera = new Entity('W0 Survey Camera');
  camera.addComponent('camera', { clearColor: new Color(0.027, 0.035, 0.043), nearClip: 0.01, farClip: 2500, fov: 58 });
  app.root.addChild(camera);

  loadingTitle.textContent = 'Ładuję foreground…';
  const foregroundAsset = await loadGsplat('W0 Foreground', '/asset/foreground.ply', (loaded, total) => {
    if (total > 0) progressBar.style.width = `${Math.min(86, 8 + loaded / total * 78)}%`;
    loadingDetail.textContent = total > 0 ? `${Math.round(loaded / 1048576)} / ${Math.round(total / 1048576)} MiB` : 'Ładowanie foreground';
  });
  foreground = new Entity('W0 Foreground');
  foreground.setEulerAngles(0, 0, 180);
  foreground.addComponent('gsplat', { asset: foregroundAsset });
  app.root.addChild(foreground);

  loadingTitle.textContent = 'Ładuję environment appearance…';
  const environmentAsset = await loadGsplat('W0 Environment', '/asset/environment.ply');
  environment = new Entity('W0 Environment appearance only');
  environment.setEulerAngles(0, 0, 180);
  environment.addComponent('gsplat', { asset: environmentAsset });
  app.root.addChild(environment);

  markerMaterial = new StandardMaterial();
  markerMaterial.useLighting = false;
  markerMaterial.diffuse = new Color(0.25, 0.72, 1.0);
  markerMaterial.emissive = new Color(0.25, 0.72, 1.0);
  markerMaterial.emissiveIntensity = 2.0;
  markerMaterial.update();

  picker = new Picker(app, 1, 1, true);

  const bounds = sourceMeta.foreground.bounds;
  const centerSource = bounds.min.map((value, index) => (value + bounds.max[index]) * 0.5);
  const sizeSource = bounds.min.map((value, index) => bounds.max[index] - value);
  const maxExtent = Math.max(...sizeSource);
  const centerWorld = [-centerSource[0], -centerSource[1], centerSource[2]];
  const surveyRadius = maxExtent * 0.42;
  const positionWorld = [centerWorld[0] - surveyRadius * 0.28, centerWorld[1] + surveyRadius * 0.34, centerWorld[2] + surveyRadius * 0.88];

  survey = new SurveyController({
    canvas,
    target: centerWorld,
    position: positionWorld,
    setCamera(position, target) {
      camera.setPosition(position[0], position[1], position[2]);
      camera.lookAt(target[0], target[1], target[2]);
    }
  });

  armPickButton.addEventListener('click', () => setPickArmed(!pickArmed));
  undoButton.addEventListener('click', removeLastProbe);
  clearButton.addEventListener('click', clearProbes);
  copyEvidenceButton.addEventListener('click', copyEvidence);
  resetViewButton.addEventListener('click', () => survey.reset());
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && pickArmed) setPickArmed(false); });
  canvas.addEventListener('pointerup', (event) => handlePick(event).catch((error) => {
    console.error(error);
    pickStatus.textContent = 'PICK ERROR';
  }));

  app.on('update', updateMarkerScales);

  progressBar.style.width = '100%';
  loadingPanel.hidden = true;
  appElement.dataset.state = 'ready';
  renderProbeList();
}

boot().catch((error) => {
  console.error(error);
  loadingPanel.hidden = true;
  errorPanel.hidden = false;
  errorText.textContent = error?.stack || error?.message || String(error);
});

window.addEventListener('beforeunload', () => {
  survey?.destroy();
  picker?.destroy();
  app?.destroy();
});
