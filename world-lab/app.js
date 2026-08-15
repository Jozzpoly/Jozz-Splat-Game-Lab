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
import { solveGravity } from './gravity.mjs';

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
const addVerticalButton = $('#addVerticalButton');
const undoVerticalButton = $('#undoVerticalButton');
const clearVerticalButton = $('#clearVerticalButton');
const previewButton = $('#previewButton');
const resetPreviewButton = $('#resetPreviewButton');
const copyEvidenceButton = $('#copyEvidenceButton');
const resetViewButton = $('#resetViewButton');
const pickHint = $('#pickHint');
const verticalCount = $('#verticalCount');
const solverStatus = $('#solverStatus');
const tiltStatus = $('#tiltStatus');
const medianResidualStatus = $('#medianResidualStatus');
const maxResidualStatus = $('#maxResidualStatus');
const previewStatus = $('#previewStatus');
const upVectorStatus = $('#upVectorStatus');
const quatStatus = $('#quatStatus');
const verticalList = $('#verticalList');

const SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3';
const BASELINE_ORIENTATION = 'source -> baseline runtime: 180deg around Z; NOT calibrated world orientation';
const MARKER_DIAMETER_PX = 16;
const MARKER_SCALE_MIN = 0.001;
const MARKER_SCALE_MAX = 8.0;
const LINE_COLOR = new Color(1.0, 0.72, 0.34);

let app = null;
let camera = null;
let groundingRoot = null;
let foreground = null;
let environment = null;
let picker = null;
let survey = null;
let bottomMaterial = null;
let topMaterial = null;
let pickPhase = null;
let pickInFlight = false;
let pendingBottom = null;
let gravityResult = null;
let previewApplied = false;
const verticals = [];
const markerEntities = [];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const formatVec = (v, digits = 5) => Array.isArray(v) ? v.map((n) => Number(n).toFixed(digits)).join(', ') : '—';
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const sourceToBaseline = ([x, y, z]) => [-x, -y, z];

function sourceFromWorld(worldPoint) {
  const inverse = foreground.getWorldTransform().clone().invert();
  const source = inverse.transformPoint(worldPoint.clone());
  return [source.x, source.y, source.z];
}

function createMaterial(color) {
  const material = new StandardMaterial();
  material.useLighting = false;
  material.diffuse = color;
  material.emissive = color;
  material.emissiveIntensity = 2.0;
  material.update();
  return material;
}

function createMarker(sourcePoint, role, name) {
  const baseline = sourceToBaseline(sourcePoint);
  const marker = new Entity(name);
  marker.addComponent('render', { type: 'sphere' });
  marker.setLocalPosition(baseline[0], baseline[1], baseline[2]);
  for (const meshInstance of marker.render.meshInstances) meshInstance.material = role === 'bottom' ? bottomMaterial : topMaterial;
  groundingRoot.addChild(marker);
  markerEntities.push(marker);
  updateMarkerScale(marker);
  return marker;
}

function removeMarker(marker) {
  const index = markerEntities.indexOf(marker);
  if (index >= 0) markerEntities.splice(index, 1);
  marker?.destroy();
}

function updateMarkerScale(marker) {
  if (!camera || !marker?.enabled) return;
  const cameraPosition = camera.getPosition();
  const markerPosition = marker.getPosition();
  const dist = Math.max(0.001, cameraPosition.distance(markerPosition));
  const viewportHeight = Math.max(1, canvas.clientHeight || canvas.height || 1);
  const worldHeight = 2 * dist * Math.tan(camera.camera.fov * Math.PI / 360);
  const scale = clamp((worldHeight / viewportHeight) * MARKER_DIAMETER_PX, MARKER_SCALE_MIN, MARKER_SCALE_MAX);
  marker.setLocalScale(scale, scale, scale);
}

function updateMarkersAndLines() {
  for (const marker of markerEntities) updateMarkerScale(marker);
  for (const ref of verticals) {
    if (ref.bottomMarker?.enabled && ref.topMarker?.enabled) {
      app.drawLine(ref.bottomMarker.getPosition(), ref.topMarker.getPosition(), LINE_COLOR, false);
    }
  }
}

function setPickPhase(phase) {
  pickPhase = phase;
  const armed = Boolean(phase);
  appElement.dataset.pickArmed = armed ? 'true' : 'false';
  survey?.setEnabled(!armed);
  pickHint.hidden = !armed;
  if (phase === 'bottom') {
    addVerticalButton.textContent = 'Anuluj pion';
    addVerticalButton.classList.add('armed');
    pickHint.textContent = 'W0.2 GRAVITY · kliknij DÓŁ rzeczywiście pionowej krawędzi · Esc anuluje';
  } else if (phase === 'top') {
    addVerticalButton.textContent = 'Anuluj pion';
    addVerticalButton.classList.add('armed');
    pickHint.textContent = 'W0.2 GRAVITY · teraz kliknij GÓRĘ tej samej pionowej krawędzi · Esc anuluje';
  } else {
    addVerticalButton.textContent = 'Dodaj pion';
    addVerticalButton.classList.remove('armed');
  }
}

function cancelPendingVertical() {
  if (pendingBottom?.marker) removeMarker(pendingBottom.marker);
  pendingBottom = null;
  setPickPhase(null);
}

function resetPreview() {
  previewApplied = false;
  groundingRoot?.setLocalRotation(0, 0, 0, 1);
  previewStatus.textContent = 'OFF';
  resetPreviewButton.disabled = true;
  previewButton.disabled = gravityResult?.status !== 'CANDIDATE';
}

function startVertical() {
  if (pickPhase) {
    cancelPendingVertical();
    return;
  }
  if (previewApplied) resetPreview();
  setPickPhase('bottom');
}

async function pickForeground(event) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  picker.resize(width, height);
  const x = (event.clientX - rect.left) * width / rect.width;
  const y = (event.clientY - rect.top) * height / rect.height;

  environment.enabled = false;
  for (const marker of markerEntities) marker.enabled = false;
  try {
    const worldLayer = app.scene.layers.getLayerByName('World');
    picker.prepare(camera.camera, app.scene, [worldLayer]);
    const worldPoint = await picker.getWorldPointAsync(x, y);
    const selection = await picker.getSelectionAsync(x, y, 1, 1);
    if (!worldPoint || !selection.includes(foreground.gsplat)) return null;
    return {
      source: sourceFromWorld(worldPoint),
      pickedWorld: [worldPoint.x, worldPoint.y, worldPoint.z]
    };
  } finally {
    environment.enabled = true;
    for (const marker of markerEntities) marker.enabled = true;
  }
}

async function handleCanvasPick(event) {
  if (!pickPhase || pickInFlight || !picker) return;
  pickInFlight = true;
  try {
    const picked = await pickForeground(event);
    if (!picked) {
      pickHint.textContent = 'MISS / NOT FOREGROUND · wybierz widoczną powierzchnię foreground';
      return;
    }

    if (pickPhase === 'bottom') {
      const marker = createMarker(picked.source, 'bottom', `Gravity pending bottom ${verticals.length + 1}`);
      pendingBottom = { source: picked.source, marker };
      setPickPhase('top');
      return;
    }

    if (pickPhase === 'top' && pendingBottom) {
      const baselineBottom = sourceToBaseline(pendingBottom.source);
      const baselineTop = sourceToBaseline(picked.source);
      if (distance(baselineBottom, baselineTop) < 1e-6) {
        pickHint.textContent = 'ODCINEK ZBYT KRÓTKI · wybierz