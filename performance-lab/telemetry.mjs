export class RenderTelemetry {
  constructor({ app, governor, canvas, getRuntimeInfo }) {
    this.app = app;
    this.governor = governor;
    this.canvas = canvas;
    this.getRuntimeInfo = getRuntimeInfo;
    this.frames = [];
    this.totalFrames = 0;
    this.startedAt = performance.now();
    this.onPostRender = this.onPostRender.bind(this);
    app.scene.on('postrender', this.onPostRender);
  }

  onPostRender() {
    const now = performance.now();
    const state = this.governor.snapshot().state;
    this.frames.push({ t: now, state });
    this.totalFrames += 1;
    this.#trim(now);
  }

  #trim(now = performance.now()) {
    const cutoff = now - 10000;
    while (this.frames.length && this.frames[0].t < cutoff) this.frames.shift();
  }

  snapshot() {
    const now = performance.now();
    this.#trim(now);
    const last2 = this.frames.filter((f) => f.t >= now - 2000);
    const last10 = this.frames.filter((f) => f.t >= now - 10000);
    const idle10 = last10.filter((f) => f.state === 'IDLE');
    const runtime = this.getRuntimeInfo();
    const dpr = window.devicePixelRatio || 1;
    const width = this.app.graphicsDevice.width;
    const height = this.app.graphicsDevice.height;
    return {
      recordedAt: new Date().toISOString(),
      uptimeSec: (now - this.startedAt) / 1000,
      governor: this.governor.snapshot(),
      runtime,
      renderFps2s: last2.length / 2,
      renderedFrames10s: last10.length,
      idleRenderedFrames10s: idle10.length,
      totalRenderedFrames: this.totalFrames,
      canvas: {
        width,
        height,
        megapixels: width * height / 1_000_000,
        cssWidth: this.canvas.clientWidth,
        cssHeight: this.canvas.clientHeight,
        browserDevicePixelRatio: dpr,
        engineMaxPixelRatio: this.app.graphicsDevice.maxPixelRatio
      }
    };
  }

  destroy() {
    this.app.scene.off('postrender', this.onPostRender);
  }
}
