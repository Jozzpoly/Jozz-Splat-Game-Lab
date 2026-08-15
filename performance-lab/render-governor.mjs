const PROFILES = Object.freeze({
  quiet: Object.freeze({ id: 'quiet', label: 'Quiet 60', autoRender: false, targetFps: 60, settleMs: 850 }),
  balanced: Object.freeze({ id: 'balanced', label: 'Balanced 120', autoRender: false, targetFps: 120, settleMs: 850 }),
  continuous: Object.freeze({ id: 'continuous', label: 'Continuous', autoRender: true, targetFps: null, settleMs: 0 })
});

export class RenderGovernor {
  constructor(app, profileId = 'quiet') {
    this.app = app;
    this.profile = PROFILES.quiet;
    this.activeUntil = 0;
    this.nextAllowedRender = 0;
    this.oneShot = false;
    this.lastWakeReason = 'boot';
    this.destroyed = false;

    this.onUpdate = this.onUpdate.bind(this);
    this.onGsplatFrameRequest = this.onGsplatFrameRequest.bind(this);
    app.on('update', this.onUpdate);
    app.systems.gsplat?.on('frame:request', this.onGsplatFrameRequest);
    this.setProfile(profileId);
  }

  static get profiles() { return PROFILES; }

  setProfile(profileId) {
    const next = PROFILES[profileId] ?? PROFILES.quiet;
    this.profile = next;
    this.app.autoRender = next.autoRender;
    this.nextAllowedRender = 0;
    this.wake(next.autoRender ? 0 : 1200, `profile:${next.id}`);
    this.requestFrame(`profile:${next.id}`);
  }

  wake(durationMs = this.profile.settleMs, reason = 'interaction') {
    this.lastWakeReason = reason;
    if (this.profile.autoRender) return;
    const now = performance.now();
    this.activeUntil = Math.max(this.activeUntil, now + Math.max(0, durationMs));
    this.oneShot = true;
  }

  requestFrame(reason = 'request') {
    this.lastWakeReason = reason;
    if (this.profile.autoRender) return;
    this.oneShot = true;
  }

  onGsplatFrameRequest() {
    this.requestFrame('gsplat:frame-request');
  }

  onUpdate() {
    if (this.destroyed || this.profile.autoRender) return;
    const now = performance.now();
    const active = now <= this.activeUntil;
    if (!active && !this.oneShot) return;

    const interval = 1000 / this.profile.targetFps;
    if (now + 0.01 < this.nextAllowedRender) return;

    this.app.renderNextFrame = true;
    this.nextAllowedRender = now + interval;
    this.oneShot = false;
  }

  snapshot() {
    const now = performance.now();
    return {
      profile: this.profile.id,
      label: this.profile.label,
      autoRender: this.profile.autoRender,
      targetFps: this.profile.targetFps,
      settleMs: this.profile.settleMs,
      state: this.profile.autoRender ? 'CONTINUOUS' : (now <= this.activeUntil || this.oneShot ? 'ACTIVE' : 'IDLE'),
      idleForMs: this.profile.autoRender ? 0 : Math.max(0, now - this.activeUntil),
      lastWakeReason: this.lastWakeReason
    };
  }

  destroy() {
    this.destroyed = true;
    this.app.off('update', this.onUpdate);
    this.app.systems.gsplat?.off('frame:request', this.onGsplatFrameRequest);
  }
}
