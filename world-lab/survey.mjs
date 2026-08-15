const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export class SurveyController {
  constructor({ canvas, setCamera, target, position }) {
    this.canvas = canvas;
    this.setCamera = setCamera;
    this.initialTarget = [...target];
    this.initialPosition = [...position];
    this.dragging = false;
    this.dragButton = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.enabled = true;

    const orbit = this.#derive(position, target);
    this.initialRadius = orbit.radius;
    this.initialYaw = orbit.yaw;
    this.initialPitch = orbit.pitch;
    this.reset();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onContextMenu = (event) => event.preventDefault();

    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  #derive(position, target) {
    const dx = position[0] - target[0];
    const dy = position[1] - target[1];
    const dz = position[2] - target[2];
    const radius = Math.max(1e-6, Math.hypot(dx, dy, dz));
    return { radius, yaw: Math.atan2(dx, dz), pitch: Math.asin(clamp(dy / radius, -1, 1)) };
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.dragging = false;
  }

  reset() {
    this.target = [...this.initialTarget];
    this.radius = this.initialRadius;
    this.yaw = this.initialYaw;
    this.pitch = this.initialPitch;
    this.#apply();
  }

  onPointerDown(event) {
    if (!this.enabled) return;
    this.dragging = true;
    this.dragButton = event.button;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.canvas.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    if (!this.enabled || !this.dragging) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    if (this.dragButton === 2 || event.shiftKey) {
      const scale = this.radius * 0.00125;
      const right = [Math.cos(this.yaw), 0, -Math.sin(this.yaw)];
      const up = [0, 1, 0];
      for (let i = 0; i < 3; i++) this.target[i] += (-dx * right[i] + dy * up[i]) * scale;
    } else {
      this.yaw -= dx * 0.0035;
      this.pitch = clamp(this.pitch - dy * 0.0035, -Math.PI * 0.47, Math.PI * 0.47);
    }
    this.#apply();
  }

  onPointerUp() { this.dragging = false; }

  onWheel(event) {
    if (!this.enabled) return;
    event.preventDefault();
    const scale = Math.exp(event.deltaY * 0.0008);
    this.radius = clamp(this.radius * scale, this.initialRadius * 0.025, this.initialRadius * 5);
    this.#apply();
  }

  #apply() {
    const cp = Math.cos(this.pitch);
    const position = [
      this.target[0] + Math.sin(this.yaw) * cp * this.radius,
      this.target[1] + Math.sin(this.pitch) * this.radius,
      this.target[2] + Math.cos(this.yaw) * cp * this.radius
    ];
    this.setCamera(position, this.target);
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
  }
}
