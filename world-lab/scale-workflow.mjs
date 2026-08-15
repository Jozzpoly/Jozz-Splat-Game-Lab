import { Color } from 'playcanvas';
import { sourceToBaseline } from './gravity-workflow.mjs';
import { buildScaleSolverInput, parseKnownMetres, solveScale } from './scale.mjs';

const LINE_COLOR = new Color(0.58, 0.88, 1.0);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const finitePositive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

export class ScaleWorkflow {
  constructor({ app, canvas, survey, probe, markers, ui, sourceSha, acceptedGravity }) {
    Object.assign(this, { app, canvas, survey, probe, markers, ui, sourceSha, acceptedGravity });
    this.measurements = [];
    this.pendingA = null;
    this.pickPhase = null;
    this.pickInFlight = false;
    this.result = null;
    this.bind();
    this.recompute();
  }

  bind() {
    const u = this.ui;
    u.add.addEventListener('click', () => this.start());
    u.undo.addEventListener('click', () => this.undo());
    u.clear.addEventListener('click', () => this.clear());
    u.copy.addEventListener('click', () => this.copyEvidence());
    // Commit fields on change/blur so typing is never interrupted by rebuilding the measurement rows.
    u.list.addEventListener('change', (event) => this.handleRowInput(event));
    u.list.addEventListener('click', (event) => {
      const remove = event.target.closest('[data-remove-index]');
      if (remove) this.remove(Number(remove.dataset.removeIndex));
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.pickPhase) this.cancelPending();
    });
    this.canvas.addEventListener('pointerup', (event) => this.handlePick(event));
    this.app.on('update', () => this.update());
  }

  setPhase(phase) {
    this.pickPhase = phase;
    const armed = Boolean(phase);
    this.ui.app.dataset.pickArmed = armed ? 'true' : 'false';
    this.survey.setEnabled(!armed);
    this.ui.hint.hidden = !armed;
    this.ui.add.classList.toggle('armed', armed);
    this.ui.add.textContent = armed ? 'Anuluj pomiar' : 'Dodaj pomiar A/B';
    if (phase === 'a') this.ui.hint.textContent = 'W0.3 SCALE · kliknij punkt A na foreground · Esc anuluje';
    if (phase === 'b') this.ui.hint.textContent = 'W0.3 SCALE · kliknij punkt B tej samej znanej odległości · Esc anuluje';
  }

  start() {
    if (this.pickPhase) {
      this.cancelPending();
      return;
    }
    this.setPhase('a');
  }

  cancelPending() {
    if (this.pendingA?.marker) this.markers.remove(this.pendingA.marker);
    this.pendingA = null;
    this.setPhase(null);
    this.render();
  }

  async handlePick(event) {
    if (!this.pickPhase || this.pickInFlight) return;
    this.pickInFlight = true;
    try {
      const picked = await this.probe.pickForeground(event, this.canvas);
      if (!picked) {
        this.ui.hint.hidden = false;
        this.ui.hint.textContent = 'MISS / NOT FOREGROUND · wybierz widoczną powierzchnię foreground';
        return;
      }

      if (this.pickPhase === 'a') {
        const marker = this.markers.create(picked.source, 'bottom', `Scale A ${this.measurements.length + 1}`, sourceToBaseline);
        this.pendingA = { source: picked.source, marker };
        this.setPhase('b');
        return;
      }

      if (this.pickPhase === 'b' && this.pendingA) {
        const sourceLength = distance(this.pendingA.source, picked.source);
        if (sourceLength < 1e-6) {
          this.ui.hint.textContent = 'ODCINEK ZBYT KRÓTKI · wybierz wyraźnie oddalony punkt B';
          return;
        }
        const markerB = this.markers.create(picked.source, 'top', `Scale B ${this.measurements.length + 1}`, sourceToBaseline);
        this.measurements.push({
          aSource: this.pendingA.source,
          bSource: picked.source,
          markerA: this.pendingA.marker,
          markerB,
          sourceLength,
          knownMetres: null,
          provenance: ''
        });
        this.pendingA = null;
        this.setPhase(null);
        this.recompute();
      }
    } catch (error) {
      console.error(error);
      this.ui.hint.hidden = false;
      this.ui.hint.textContent = 'PICK ERROR · wyślij screenshot';
    } finally {
      this.pickInFlight = false;
    }
  }

  handleRowInput(event) {
    const input = event.target.closest('[data-measurement-index][data-field]');
    if (!input) return;
    const index = Number(input.dataset.measurementIndex);
    const measurement = this.measurements[index];
    if (!measurement) return;
    if (input.dataset.field === 'knownMetres') {
      measurement.knownMetres = parseKnownMetres(input.value);
    } else if (input.dataset.field === 'provenance') {
      measurement.provenance = input.value;
    }
    this.recompute(false);
  }

  solverInput() {
    return buildScaleSolverInput(this.measurements);
  }

  recompute() {
    this.result = solveScale(this.solverInput());
    this.render();
  }

  render() {
    const u = this.ui;
    const r = this.result;
    const candidate = r?.status === 'CANDIDATE';
    const validCount = candidate ? r.measurementCount : (r?.measurementCount ?? 0);
    const evidenceReadyCount = this.measurements.filter((m) => finitePositive(m.knownMetres) && m.provenance.trim()).length;

    u.count.textContent = String(this.measurements.length);
    u.solved.textContent = String(validCount);
    u.solver.textContent = candidate ? 'CANDIDATE' : 'INSUFFICIENT';
    u.units.textContent = candidate ? r.unitsPerMetre.toPrecision(8) : '—';
    u.metresPerUnit.textContent = candidate ? r.metresPerSourceUnit.toPrecision(8) : '—';
    u.median.textContent = candidate ? `${r.consistency.medianAbsRelativeResidualPct.toFixed(2)}%` : '—';
    u.max.textContent = candidate ? `${r.consistency.maxAbsRelativeResidualPct.toFixed(2)}%` : '—';
    u.cv.textContent = candidate ? `${r.consistency.ratioCoefficientOfVariationPct.toFixed(2)}%` : '—';
    u.undo.disabled = !this.measurements.length && !this.pendingA;
    u.clear.disabled = !this.measurements.length && !this.pendingA;
    u.copy.disabled = !(candidate && validCount >= 2 && evidenceReadyCount >= 2);
    u.readiness.textContent = `${evidenceReadyCount} / ${this.measurements.length} z provenance`;

    const residualBySourceIndex = new Map();
    if (candidate) {
      const solved = this.solverInput();
      r.residuals.forEach((residual, index) => residualBySourceIndex.set(solved[index].sourceIndex, residual));
    }

    u.list.innerHTML = this.measurements.length ? this.measurements.map((item, index) => {
      const residual = residualBySourceIndex.get(index);
      const implied = finitePositive(item.knownMetres) ? item.sourceLength / Number(item.knownMetres) : null;
      const residualText = residual ? `${residual.relativeResidualPct >= 0 ? '+' : ''}${residual.relativeResidualPct.toFixed(2)}%` : '—';
      const status = !finitePositive(item.knownMetres)
        ? 'WPROWADŹ m'
        : !item.provenance.trim()
          ? 'DODAJ ŹRÓDŁO'
          : 'READY';
      return `<div class="scale-row">
        <div class="scale-row-head"><strong>M${String(index + 1).padStart(2, '0')}</strong><code>${item.sourceLength.toFixed(6)} src</code><span class="scale-status">${status}</span><button data-remove-index="${index}">Usuń</button></div>
        <label>Znana odległość [m]<input type="text" inputmode="decimal" data-measurement-index="${index}" data-field="knownMetres" value="${finitePositive(item.knownMetres) ? Number(item.knownMetres) : ''}" placeholder="np. 12,50 lub 12.50"></label>
        <label>Skąd znam tę wartość<input type="text" data-measurement-index="${index}" data-field="provenance" value="${escapeHtml(item.provenance)}" placeholder="np. pomiar taśmą / dokumentacja / mapa pomiarowa"></label>
        <div class="scale-row-metrics"><span>implied <b>${implied ? implied.toPrecision(7) : '—'} src/m</b></span><span>residual <b>${residualText}</b></span></div>
      </div>`;
    }).join('') : '<p class="empty">Brak pomiarów A/B.</p>';
  }

  remove(index) {
    const item = this.measurements[index];
    if (!item) return;
    this.markers.remove(item.markerA);
    this.markers.remove(item.markerB);
    this.measurements.splice(index, 1);
    this.recompute();
  }

  undo() {
    if (this.pendingA) {
      this.cancelPending();
      return;
    }
    const item = this.measurements.pop();
    if (!item) return;
    this.markers.remove(item.markerA);
    this.markers.remove(item.markerB);
    this.recompute();
  }

  clear() {
    this.cancelPending();
    while (this.measurements.length) {
      const item = this.measurements.pop();
      this.markers.remove(item.markerA);
      this.markers.remove(item.markerB);
    }
    this.recompute();
  }

  evidence() {
    const r = this.result?.status === 'CANDIDATE' ? this.result : null;
    const solverInput = this.solverInput();
    const residualBySourceIndex = new Map();
    if (r) r.residuals.forEach((residual, index) => residualBySourceIndex.set(solverInput[index].sourceIndex, residual));
    return {
      gate: 'W0.3',
      schemaVersion: 1,
      status: 'OWNER_SCALE_EVIDENCE',
      recordedAt: new Date().toISOString(),
      sourceSha256: this.sourceSha,
      runtime: 'PlayCanvas 2.21.2',
      backend: this.app.graphicsDevice.deviceType,
      gravityEvidence: this.acceptedGravity,
      worldCalibration: 'DRAFT_ORIENTATION_VERIFIED_SCALE_CANDIDATE',
      measurementCount: this.measurements.length,
      measurements: this.measurements.map((item, index) => {
        const residual = residualBySourceIndex.get(index);
        return {
          id: index + 1,
          aSource: item.aSource,
          bSource: item.bSource,
          sourceLength: item.sourceLength,
          knownMetres: finitePositive(item.knownMetres) ? Number(item.knownMetres) : null,
          provenance: item.provenance.trim() || null,
          impliedUnitsPerMetre: finitePositive(item.knownMetres) ? item.sourceLength / Number(item.knownMetres) : null,
          relativeResidualPct: residual?.relativeResidualPct ?? null
        };
      }),
      solver: r ? {
        unitsPerMetre: r.unitsPerMetre,
        metresPerSourceUnit: r.metresPerSourceUnit,
        consistency: r.consistency,
        method: r.method,
        silentOutlierRemoval: false,
        automaticAcceptance: false
      } : null,
      passQuestion: 'Do at least two independently known real distances, preferably three, agree closely enough on one scale without hiding conflicting measurements?'
    };
  }

  async copyEvidence() {
    const text = JSON.stringify(this.evidence(), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      const old = this.ui.copy.textContent;
      this.ui.copy.textContent = 'Skopiowano';
      setTimeout(() => { this.ui.copy.textContent = old; }, 1400);
    } catch {
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'w0-3-scale-evidence.json';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  }

  update() {
    this.markers.update();
    for (const item of this.measurements) {
      if (item.markerA.enabled && item.markerB.enabled) {
        this.app.drawLine(item.markerA.getPosition(), item.markerB.getPosition(), LINE_COLOR, false);
      }
    }
  }
}
