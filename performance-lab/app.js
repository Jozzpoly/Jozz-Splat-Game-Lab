import {
  Application,
  Asset,
  Color,
  DEVICETYPE_WEBGL2,
  DEVICETYPE_WEBGPU,
  Entity,
  FILLMODE_FILL_WINDOW,
  GSPLAT_RENDERER_AUTO,
  GSPLAT_RENDERER_RASTER_CPU_SORT,
  GSPLAT_RENDERER_RASTER_GPU_SORT,
  Quat,
  RESOLUTION_AUTO,
  Vec3,
  createGraphicsDevice
} from 'playcanvas';
import { ACCEPTED_W0_2 } from './accepted-orientation.mjs';
import { RenderGovernor } from './render-governor.mjs';
import { RenderTelemetry } from './telemetry.mjs';
import { SurveyController } from './survey.mjs';
import { FocusProbe } from './focus-probe.mjs';

const $ = (selector) => document.querySelector(selector);
const SOURCE_SHA = '8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3';
const params = new URLSearchParams(location.search);
const initialProfile = ['quiet', 'balanced', 'continuous'].includes(params.get('profile')) ? params.get('profile') : 'quiet';
const backendPreference = params.get('backend') === 'webgl2' ? 'webgl2' : 'best';

const canvas = $('#viewport');
const appElement = $('#app');
const loadingPanel = $('#loadingPanel');
const loadingTitle = $('#loadingTitle');
const loadingDetail = $('#loadingDetail');
const progressBar = $('#progressBar');
const errorPanel = $('#errorPanel');
const errorText = $('#errorText');

let app;
let governor;
let telemetry;
let survey;
let focusProbe;
let foreground;
let environment;
let groundingRoot;
let uiTimer;

function rendererName(value) {
  if (value === GSPLAT_RENDERER_RASTER_GPU_SORT) return 'GPU SORT';
  if (value === GSPLAT_RENDERER_RASTER_CPU_SORT) return 'CPU SORT';
  return `UNKNOWN (${value})`;
}

function runtimeInfo() {
  return {
    requestedBackend: backendPreference,
    backend: app?.graphicsDevice?.deviceType ?? 'unknown',
    requestedGsplatRenderer: 'AUTO',
    gsplatRenderer: app ? rendererName(app.scene.gsplat.currentRenderer) : 'unknown',
    antiAlias: false,
    maxPixelRatio: app?.graphicsDevice?.maxPixelRatio ?? null,
    powerPreference: 'high-performance',
    sourceSha256: SOURCE_SHA,
    splats: 1_063_122
  };
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

function sourcePointToWorld(source) {
  return foreground.getWorldTransform().transformPoint(new Vec3(...source));
}

function setSelected(selector, key, value) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle('selected', button.dataset[key] === value);
  });
}

function setBackend(next) {
  const url = new URL(location.href);
  url.searchParams.set('backend', next);
  url.searchParams.set('profile', governor?.profile?.id ?? initialProfile);
  location.href = url.toString();
}

function updateReadout() {
  if (!telemetry) return;
  const t = telemetry.snapshot();
  const g = t.governor;
  $('#renderState').textContent = g.state;
  $('#backendStatus').textContent = t.runtime.backend;
  $('#sortStatus').textContent = t.runtime.gsplatRenderer;
  $('#backendReadout').textContent = t.runtime.backend;
  $('#sortReadout').textContent = t.runtime.gsplatRenderer;
  $('#policyReadout').textContent = g.autoRender ? 'CONTINUOUS' : `${g.label} · on-demand`;
  $('#fpsReadout').textContent = t.renderFps2s.toFixed(1);
  $('#framesReadout').textContent = String(t.renderedFrames10s);
  $('#idleFramesReadout').textContent = String(t.idleRenderedFrames10s);
  $('#idleReadout').textContent = g.autoRender ? '—' : `${(g.idleForMs / 1000).toFixed(1)} s`;
  $('#pixelsReadout').textContent = `${t.canvas.width}×${t.canvas.height} · ${t.canvas.megapixels.toFixed(2)} MP`;
  setSelected('[data-profile]', 'profile', g.profile);
  setSelected('[data-backend]', 'backend', backendPreference);
}

async function copyEvidence() {
  const evidence = {
    gate: 'R1.1/R1.2',
    status: 'OWNER_PERFORMANCE_EVIDENCE',
    ...telemetry.snapshot(),
    note: 'Browser telemetry measures rendered-frame scheduling, not GPU watts or hardware temperature.'
  };
  await navigator.clipboard.writeText(JSON.stringify(evidence, null, 2));
  const button = $('#copyEvidenceButton');
  const old = button.textContent;
  button.textContent = 'Skopiowano';
  setTimeout(() => { button.textContent = old; }, 900);
}

async function boot() {
  const meta = await fetch('/api/source', { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`Source metadata HTTP ${response.status}`);
    return response.json();
  });
  if (!meta.verified || meta.sourceSha256 !== SOURCE_SHA) throw new Error('Źródło nie spełnia F0 SHA-256 contract.');
  if (ACCEPTED_W0_2.sourceSha256 !== SOURCE_SHA) throw new Error('W0.2 orientation belongs to another source.');

  const deviceTypes = backendPreference === 'webgl2'
    ? [DEVICETYPE_WEBGL2]
    : [DEVICETYPE_WEBGPU, DEVICETYPE_WEBGL2];
  const device = await createGraphicsDevice(canvas, {
    deviceTypes,
    antialias: false,
    powerPreference: 'high-performance'
  });

  app = new Application(canvas, { graphicsDevice: device });
  app.graphicsDevice.maxPixelRatio = 1;
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);
  app.scene.gsplat.enableIds = true;
  app.scene.gsplat.renderer = GSPLAT_RENDERER_AUTO;
  app.start();

  governor = new RenderGovernor(app, initialProfile);

  const camera = new Entity('R1 Survey Camera');
  camera.addComponent('camera', {
    clearColor: new Color(0.025, 0.032, 0.037),
    nearClip: 0.003,
    farClip: 2500,
    fov: 58
  });
  app.root.addChild(camera);

  groundingRoot = new Entity('Accepted W0.2 oriented world root');
  groundingRoot.setLocalRotation(new Quat(...ACCEPTED_W0_2.correctionQuaternion));
  app.root.addChild(groundingRoot);

  loadingTitle.textContent = 'Ładuję foreground…';
  const fgAsset = await loadGsplat('R1 Foreground', '/asset/foreground.ply', (loaded, total) => {
    if (total > 0) progressBar.style.width = `${Math.min(84, 5 + loaded / total * 79)}%`;
    loadingDetail.textContent = total > 0 ? `${Math.round(loaded / 1048576)} / ${Math.round(total / 1048576)} MiB` : 'Ładowanie foreground';
  });
  foreground = new Entity('R1 Foreground');
  foreground.setLocalEulerAngles(0, 0, 180);
  foreground.addComponent('gsplat', { asset: fgAsset });
  groundingRoot.addChild(foreground);
  governor.wake(1400, 'foreground-loaded');

  loadingTitle.textContent = 'Ładuję environment appearance…';
  const envAsset = await loadGsplat('R1 Environment', '/asset/environment.ply');
  environment = new Entity('R1 Environment appearance only');
  environment.setLocalEulerAngles(0, 0, 180);
  environment.addComponent('gsplat', { asset: envAsset });
  groundingRoot.addChild(environment);
  governor.wake(1400, 'environment-loaded');

  const bounds = meta.foreground.bounds;
  const centerSource = bounds.min.map((value, index) => (value + bounds.max[index]) * 0.5);
  const size = bounds.min.map((value, index) => bounds.max[index] - value);
  const extent = Math.max(...size);
  const centerWorld = sourcePointToWorld(centerSource);
  const target = [centerWorld.x, centerWorld.y, centerWorld.z];
  const radius = extent * 0.42;
  const position = [target[0] - radius * 0.28, target[1] + radius * 0.34, target[2] + radius * 0.88];

  survey = new SurveyController({
    canvas,
    target,
    position,
    fovDeg: camera.camera.fov,
    setCamera(nextPosition, nextTarget) {
      camera.setPosition(...nextPosition);
      camera.lookAt(...nextTarget);
    },
    onCameraChanged(reason) {
      governor.wake(900, `camera:${reason}`);
    }
  });

  focusProbe = new FocusProbe({ app, camera, foreground, environment });
  survey.setFocusResolver((clientX, clientY) => focusProbe.pick(clientX, clientY, canvas));

  telemetry = new RenderTelemetry({ app, governor, canvas, getRuntimeInfo: runtimeInfo });
  app.scene.on('postrender', () => updateReadout());

  document.querySelectorAll('[data-profile]').forEach((button) => {
    button.addEventListener('click', () => {
      governor.setProfile(button.dataset.profile);
      updateReadout();
    });
  });
  document.querySelectorAll('[data-backend]').forEach((button) => {
    button.addEventListener('click', () => setBackend(button.dataset.backend));
  });
  $('#focusViewButton').addEventListener('click', () => void survey.focusAtCursor());
  $('#fitViewButton').addEventListener('click', () => survey.fit());
  $('#resetViewButton').addEventListener('click', () => survey.reset());
  $('#copyEvidenceButton').addEventListener('click', () => void copyEvidence());
  window.addEventListener('resize', () => governor.wake(900, 'resize'));

  progressBar.style.width = '100%';
  loadingPanel.hidden = true;
  appElement.dataset.state = 'ready';
  governor.wake(1600, 'boot-ready');
  governor.requestFrame('boot-ready');
  updateReadout();
  uiTimer = setInterval(updateReadout, 500);
}

boot().catch((error) => {
  console.error(error);
  loadingPanel.hidden = true;
  errorPanel.hidden = false;
  errorText.textContent = error?.stack || error?.message || String(error);
});

window.addEventListener('beforeunload', () => {
  if (uiTimer) clearInterval(uiTimer);
  telemetry?.destroy();
  focusProbe?.destroy();
  survey?.destroy();
  governor?.destroy();
  app?.destroy();
});
