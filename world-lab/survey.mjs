const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export class SurveyController {
  constructor({ canvas, setCamera, target, position, fovDeg = 58 }) {
    this.canvas = canvas;
    this.setCamera = setCamera;
    this.fovDeg = fovDeg;
    this.initialTarget = [...target];
    this.initialPosition = [...position];
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.enabled = true;

    const orbit = this.#derive(position, target);
    this.initialRadius = orbit.radius;
    this.initialYaw = orbit.yaw;
    this.initialPitch = orbit.pitch;
    this.minRadius = Math.max(1e-6, this.initialRadius * 1e-5);
    this.maxRadius = this.initialRadius * 80;
    this.reset();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onContextMenu = (event) => event.preventDefault();

    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown);
    canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  #derive(position, target) {
    const dx = position[0] - target[0];
    const dy = position[1] - target[1];
    const dz = position[2] - target[2];
    const radius = Math.max(1e-6, Math.hypot(dx, dy, dz));
    return { radius, yaw: Math.atan2(dx, dz), pitch: Math.asin(clamp(dy / radius, -1, 1)) };
  }

  #basis() {
    const sy = Math.sin(this.yaw);
    const cy = Math.cos(this.yaw);
    const sp = Math.sin(this.pitch);
    const cp = Math.cos(this.pitch);
    return {
      right: [cy, 0, -sy],
      up: [-sy * sp, cp, -cy * sp]
    };
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

  fit() {
    this.target = [...this.initialTarget];
    this.radius = this.initialRadius;
    this.#apply();
  }

  focus(target, radius = null) {
    this.target = [...target];
    if (Number.isFinite(radius)) this.radius = clamp(radius, this.minRadius, this.maxRadius);
    this.#apply();
  }

  onPointerDown(event) {
    if (!this.enabled || event.button !== 1) return;
    event.preventDefault();
    this.dragging = true;
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

    if (event.shiftKey) {
      const { right, up } = this.#basis();
      const viewportHeight = Math.max(1, this.canvas.clientHeight || this.canvas.height || 1);
      const worldPerPixel = (2 * this.radius * Math.tan(this.fovDeg * Math.PI / 360)) / viewportHeight;
      const panScale = worldPerPixel * 1.05;
      for (let i = 0; i < 3; i++) this.target[i] += (-dx * right[i] + dy * up[i]) * panScale;
    } else {
      this.yaw -= dx * 0.0032;
      this.pitch = clamp(this.pitch - dy * 0.0032, -Math.PI * 0.495, Math.PI * 0.495);
    }
    this.#apply();
  }

  onPointerUp() { this.dragging = false; }

  onWheel(event) {
    if (!this.enabled) return;
    event.preventDefault();

    const boundedDelta = clamp(event.deltaY, -600, 600);
    const scale = Math.exp(boundedDelta * 0.00145);
    const previousRadius = this.radius;
    const nextRadius = clamp(previousRadius * scale, this.minRadius, this.maxRadius);

    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && previousRadius > 1e-9) {
      const nx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const ny = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      const halfHeight = previousRadius * Math.tan(this.fovDeg * Math.PI / 360);
      const halfWidth = halfHeight * (rect.width / rect.height);
      const { right, up } = this.#basis();
      const anchor = [
        this.target[0] + right[0] * nx * halfWidth - up[0] * ny * halfHeight,
        this.target[1] + right[1] * nx * halfWidth - up[1] * ny * halfHeight,
        this.target[2] + right[2] * nx * halfWidth - up[2] * ny * halfHeight
      ];
      const zoomFraction = 1 - nextRadius / previousRadius;
      const gain = zoomFraction >= 0 ? 0.9 : 0.18;
      for (let i = 0; i < 3; i++) this.target[i] += (anchor[i] - this.target[i]) * zoomFraction * gain;
    }

    this.radius = nextRadius;
    this.#apply();
  }

  onKeyDown(event) {
    if (!this.enabled || event.defaultPrevented) return;
    const tag = event.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      this.fit();
    } else if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      this.reset();
    }
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
    window.removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
  }
}
