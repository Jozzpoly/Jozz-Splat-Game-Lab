import { NavigationController } from './common/navigation.mjs';
import { FrameTelemetry } from './common/telemetry.mjs';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const params = new URLSearchParams(location.search);
const runtimeName = params.get('runtime') === 'playcanvas' ? 'playcanvas' : 'spark';
const sourceMode = params.get('source') === 'raw' ? 'raw' : 'foreground';
const requestedBackendMode = params.get('backend') === 'best' ? 'best' : 'webgl2';
const backendMode = runtimeName === 'spark' ? 'webgl2' : requestedBackendMode;

const canvas = $('#viewport');
const loadingPanel = $('#loadingPanel');
const loadingTitle = $('#loadingTitle');
const loadingDetail = $('#loadingDetail');
const progressBar = $('#progressBar');
const errorPanel = $('#errorPanel');
const errorText = $('#errorText');
const sourceStatus = $('#sourceStatus');
const runtimeStatus = $('#runtimeStatus');
const backendStatus = $('#backendStatus');
const splatStatus = $('#splatStatus');
const loadStatus = $('#loadStatus');
const fpsStatus = $('#fpsStatus');
const p95Status = $('#p95Status');
const orientationStatus = $('#orientationStatus');
const orbitButton = $('#orbitButton');
const flyButton = $('#flyButton');
const resetButton = $('#resetButton');
const flyHint = $('#flyHint');
const copyReportButton = $('#copyReportButton');

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—';
  const mib = bytes / (1024 * 1024);
  return `${mib.toFixed(mib >= 100 ? 0 : 1)} MiB`;
}

function replaceParams(patch) {
  const next = new URLSearchParams(location.search);
  for (const [key, value] of Object.entries(patch)) next.set(key, value);
  location.search = next.toString();
}

function setActiveButtons() {
  $$('[data-runtime]').forEach((button) => button.classList.toggle('is-active', button.dataset.runtime === runtimeName));
  $$('[data-source]').forEach((button) => button.classList.toggle('is-active', button.dataset.source === sourceMode));
  $$('[data-backend]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.backend === backendMode);
    button.disabled = runtimeName === 'spark' && button.dataset.backend === 'best';
  });
}

setActiveButtons();
$$('[data-runtime]').forEach((button) => button.addEventListener('click', () => {
  const runtime = button.dataset.runtime;
  replaceParams(runtime === 'spark' ? { runtime, backend: 'webgl2' } : { runtime });
}));
$$('[data-source]').forEach((button) => button.addEventListener('click', () => replaceParams({ source: button.dataset.source })));
$$('[data-backend]').forEach((button) => button.addEventListener('click', () => replaceParams({ backend: button.dataset.backend })));

let candidate = null;
let navigation = null;
let animationHandle = 0;
let lastFrame = performance.now();
let latestTelemetry = null;
let reportData = null;

const telemetry = new FrameTelemetry((sample) => {
  latestTelemetry = sample;
  fpsStatus.textContent = sample.fps.toFixed(1);
  p95Status.textContent = `${sample.p95.toFixed(1)} ms`;
  if (reportData) reportData.telemetry = sample;
});

function setNavigationMode(mode) {
  navigation?.setMode(mode);
  orbitButton.classList.toggle('is-active', mode === 'orbit');
  flyButton.classList.toggle('is-active', mode === 'fly');
  flyHint.hidden = mode !== 'fly';
}

orbitButton.addEventListener('click', () => setNavigationMode('orbit'));
flyButton.addEventListener('click', () => setNavigationMode('fly'));
resetButton.addEventListener('click', () => navigation?.reset());
copyReportButton.addEventListener('click', async () => {
  if (!reportData) return;
  const payload = JSON.stringify({ ...reportData, telemetry: latestTelemetry }, null, 2);
  try {
    await navigator.clipboard.writeText(payload);
    const old = copyReportButton.textContent;
    copyReportButton.textContent = 'Skopiowano';
    setTimeout(() => { copyReportButton.textContent = old; }, 1400);
  } catch {
    const blob = new Blob([payload], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `r0-${runtimeName}-${sourceMode}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
});

function loop(now) {
  const dt = Math.min(0.1, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  navigation?.update(dt);
  telemetry.sample(now);
  animationHandle = requestAnimationFrame(loop);
}
animationHandle = requestAnimationFrame(loop);

async function boot() {
  const bootStarted = performance.now();
  loadingTitle.textContent = 'Sprawdzam źródło…';
  const sourceMeta = await fetch('/api/source', { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`Source metadata HTTP ${response.status}`);
    return response.json();
  });

  if (!sourceMeta.verified) throw new Error('Serwer nie potwierdził dokładnego SHA-256 źródła F0.');
  sourceMeta.active = sourceMode === 'raw' ? sourceMeta.raw : sourceMeta.foreground;

  const bounds = sourceMeta.foreground.bounds;
  const centerSource = bounds.min.map((value, index) => (value + bounds.max[index]) * 0.5);
  const sizeSource = bounds.min.map((value, index) => bounds.max[index] - value);
  const benchmarkRadius = Math.max(...sizeSource) * 0.72;
  const benchmarkCameraSource = {
    target: centerSource,
    position: [centerSource[0], centerSource[1] - benchmarkRadius * 0.14, centerSource[2] + benchmarkRadius]
  };
  sourceStatus.textContent = `VERIFIED · ${sourceMode === 'raw' ? 'raw' : 'foreground'}`;
  splatStatus.textContent = sourceMeta.active.splats.toLocaleString('pl-PL');
  loadingDetail.textContent = `${sourceMeta.active.splats.toLocaleString('pl-PL')} splats · ${formatBytes(sourceMeta.active.bytes)}`;

  loadingTitle.textContent = runtimeName === 'spark' ? 'Ładuję Spark…' : 'Ładuję PlayCanvas…';
  const moduleStarted = performance.now();
  const runtimeModule = runtimeName === 'spark'
    ? await import('./runtime/spark.mjs')
    : await import('./runtime/playcanvas.mjs');
  const moduleLoadMs = performance.now() - moduleStarted;

  loadingTitle.textContent = 'Ładuję Gaussian splat…';
  progressBar.style.width = '8%';
  candidate = await runtimeModule.createCandidate({
    canvas,
    sourceUrl: sourceMode === 'raw' ? '/asset/raw.ply' : '/asset/foreground.ply',
    sourceMeta,
    backendMode,
    benchmarkCameraSource,
    onProgress({ loaded, total, ratio }) {
      if (ratio !== null) progressBar.style.width = `${Math.max(8, Math.min(98, ratio * 100))}%`;
      if (total > 0) loadingDetail.textContent = `${formatBytes(loaded)} / ${formatBytes(total)}`;
      else if (loaded > 0) loadingDetail.textContent = `${formatBytes(loaded)} wczytane`;
    }
  });

  runtimeStatus.textContent = candidate.runtime;
  backendStatus.textContent = candidate.backend;
  splatStatus.textContent = Number(candidate.splatCount || sourceMeta.active.splats).toLocaleString('pl-PL');
  loadStatus.textContent = `${(candidate.assetLoadMs / 1000).toFixed(2)} s`;
  orientationStatus.textContent = `${candidate.orientation} · module ${(moduleLoadMs / 1000).toFixed(2)} s · boot ${((performance.now() - bootStarted) / 1000).toFixed(2)} s`;

  reportData = {
    gate: 'R0-A',
    recordedAt: new Date().toISOString(),
    sourceSha256: sourceMeta.sourceSha256,
    sourceMode,
    sourceAssetSha256: sourceMeta.active.sha256,
    splats: Number(candidate.splatCount || sourceMeta.active.splats),
    runtime: candidate.runtime,
    backend: candidate.backend,
    backendMode,
    benchmarkCameraSource,
    assetLoadMs: candidate.assetLoadMs,
    moduleLoadMs,
    userAgent: navigator.userAgent,
    orientation: candidate.orientation
  };

  navigation = new NavigationController({
    canvas,
    setOrbitCamera: candidate.setOrbitCamera,
    setFlyCamera: candidate.setFlyCamera,
    initialTarget: candidate.initialTarget,
    initialPosition: candidate.initialPosition
  });

  progressBar.style.width = '100%';
  loadingPanel.hidden = true;
  document.querySelector('#app').dataset.state = 'ready';
}

boot().catch((error) => {
  console.error(error);
  loadingPanel.hidden = true;
  errorPanel.hidden = false;
  errorText.textContent = error?.stack || error?.message || String(error);
  runtimeStatus.textContent = 'FAILED';
});

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationHandle);
  navigation?.destroy();
  candidate?.destroy?.();
});
