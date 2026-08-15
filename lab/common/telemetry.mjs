export class FrameTelemetry {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.samples = [];
    this.last = performance.now();
    this.lastPublish = this.last;
  }

  sample(now = performance.now()) {
    const dt = now - this.last;
    this.last = now;
    if (dt > 0 && dt < 500) {
      this.samples.push(dt);
      if (this.samples.length > 240) this.samples.shift();
    }
    if (now - this.lastPublish >= 500 && this.samples.length >= 10) {
      this.lastPublish = now;
      const ordered = [...this.samples].sort((a, b) => a - b);
      const mean = this.samples.reduce((sum, v) => sum + v, 0) / this.samples.length;
      const percentile = (p) => ordered[Math.min(ordered.length - 1, Math.floor((ordered.length - 1) * p))];
      this.onUpdate({
        fps: 1000 / mean,
        p50: percentile(0.5),
        p95: percentile(0.95),
        p99: percentile(0.99),
        samples: this.samples.length
      });
    }
  }
}
