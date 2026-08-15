const fmt = (value, digits = 5) => Number.isFinite(value) ? value.toFixed(digits) : '—';
const vec = (value) => Array.isArray(value) ? value.map((v) => Number(v.toFixed(7))) : null;

export class CollisionWorkflow {
  constructor({ canvas, survey, collisionProbe, markers, candidateLayer, metadata, sourceSha, orientation, ui }) {
    this.canvas = canvas;
    this.survey = survey;
    this.collisionProbe = collisionProbe;
    this.markers = markers;
    this.candidateLayer = candidateLayer;
    this.metadata = metadata;
    this.sourceSha = sourceSha;
    this.orientation = orientation;
    this.ui = ui;
    this.armed = false;
    this.busy = false;
    this.probes = [];
    this.latest = null;

    this.onCanvasClick = this.onCanvasClick.bind(this);
    canvas.addEventListener('click', this.onCanvasClick);
    ui.addProbe.addEventListener('click', () => this.arm());
    ui.clear.addEventListener('click', () => this.clear());
    ui.copy.addEventListener('click', () => void this.copyEvidence());
    for (const button of ui.classifyButtons) {
      button.addEventListener('click', () => this.classify(button.dataset.classification));
    }
    this.render();
  }

  arm() {
    if (this.busy) return;
    this.armed = true;
    this.canvas.dataset.probeArmed = 'true';
    this.ui.hint.hidden = false;
    this.ui.hint.textContent = 'Kliknij LMB w miejscu, gdzie chcesz porównać splat i candidate mesh.';
  }

  disarm() {
    this.armed = false;
    this.canvas.dataset.probeArmed = 'false';
    this.ui.hint.hidden = true;
  }

  async onCanvasClick(event) {
    if (!this.armed || this.busy || event.button !== 0) return;
    this.disarm();
    this.busy = true;
    this.ui.addProbe.disabled = true;
    try {
      const result = await this.collisionProbe.compare(event, this.canvas);
      const probe = {
        id: this.probes.length + 1,
        candidateName: result.candidateName,
        status: result.status,
        classification: null,
        appearanceSource: vec(result.appearance?.source),
        candidateSource: vec(result.candidate?.source),
        sourceDelta: Number.isFinite(result.sourceDelta) ? result.sourceDelta : null,
        cameraDepthDelta: Number.isFinite(result.cameraDepthDelta) ? result.cameraDepthDelta : null
      };
      this.probes.push(probe);
      this.latest = probe;
      this.markers.clear();
      if (result.appearance) this.markers.createWorld(result.appearance.runtimeWorld, 'appearance', `Appearance P${probe.id}`);
      if (result.candidate) this.markers.createWorld(result.candidate.runtimeWorld, 'candidate', `Candidate P${probe.id}`);
      this.render();
    } catch (error) {
      console.error(error);
      this.ui.hint.hidden = false;
      this.ui.hint.textContent = `Probe FAIL: ${error?.message || error}`;
    } finally {
      this.busy = false;
      this.ui.addProbe.disabled = false;
    }
  }

  classify(value) {
    if (!this.latest) return;
    this.latest.classification = value;
    this.render();
  }

  clear() {
    this.probes.length = 0;
    this.latest = null;
    this.markers.clear();
    this.render();
  }

  render() {
    const latest = this.latest;
    this.ui.probeCount.textContent = String(this.probes.length);
    this.ui.latestStatus.textContent = latest?.status ?? '—';
    this.ui.latestDelta.textContent = latest?.sourceDelta == null ? '—' : `${fmt(latest.sourceDelta)} src`;
    this.ui.latestDepth.textContent = latest?.cameraDepthDelta == null ? '—' : `${fmt(latest.cameraDepthDelta)} src`;
    this.ui.latestClass.textContent = latest?.classification ?? 'UNCLASSIFIED';

    const both = this.probes.filter((p) => p.status === 'HIT_BOTH').length;
    const missing = this.probes.filter((p) => p.status === 'APPEARANCE_ONLY').length;
    const phantom = this.probes.filter((p) => p.status === 'CANDIDATE_ONLY').length;
    this.ui.bothCount.textContent = String(both);
    this.ui.missingCount.textContent = String(missing);
    this.ui.phantomCount.textContent = String(phantom);

    for (const button of this.ui.classifyButtons) button.disabled = !latest;
    this.ui.clear.disabled = this.probes.length === 0;
    this.ui.copy.disabled = this.probes.length === 0;

    if (!this.probes.length) {
      this.ui.list.innerHTML = '<p class="empty">Brak probe evidence.</p>';
    } else {
      this.ui.list.innerHTML = this.probes.slice().reverse().map((probe) => {
        const delta = probe.sourceDelta == null ? '—' : `${fmt(probe.sourceDelta, 4)} src`;
        const cls = probe.classification ?? 'UNCLASSIFIED';
        return `<div class="probe-row"><strong>P${String(probe.id).padStart(2, '0')}</strong><span>${probe.candidateName}</span><code>${probe.status}</code><span>${delta}</span><b>${cls}</b></div>`;
      }).join('');
    }
  }

  evidence() {
    return {
      gate: 'C0a',
      schemaVersion: 1,
      status: 'OWNER_NON_METRIC_COLLISION_EVIDENCE',
      recordedAt: new Date().toISOString(),
      sourceSha256: this.sourceSha,
      metricStatus: 'UNCALIBRATED_SOURCE_UNITS',
      acceptedOrientation: {
        evidence: this.orientation.evidence,
        tiltDeg: this.orientation.tiltDeg,
        correctionQuaternion: this.orientation.correctionQuaternion
      },
      roiSourceBounds: this.metadata.roiSourceBounds,
      activeCandidate: this.candidateLayer.activeName,
      candidateReceiptStatus: this.metadata.status,
      probeCount: this.probes.length,
      probes: this.probes,
      interpretationBoundary: 'Candidate meshes are structural hypotheses. Source-unit deltas are non-metric and must not be interpreted as metres.',
      passQuestion: 'Does at least one candidate preserve useful walls/ground/corners with a manageable rate of missing and phantom surfaces inside this ROI?'
    };
  }

  async copyEvidence() {
    const text = JSON.stringify(this.evidence(), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      const old = this.ui.copy.textContent;
      this.ui.copy.textContent = 'Skopiowano';
      setTimeout(() => { this.ui.copy.textContent = old; }, 1200);
    } catch {
      window.prompt('Skopiuj C0a evidence:', text);
    }
  }

  destroy() {
    this.canvas.removeEventListener('click', this.onCanvasClick);
  }
}
