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
    this.pointerX = Number.NaN;
    this.pointerY = Number.NaN;
    this.enabled = true;
    this.focusResolver = null;
    this.focusInFlight = false;

    const orbit = this.#derive(position, target);
    this.initialRadius = orbit.radius;
    this.initialYaw = orbit.yaw;
    this.initialPitch = orbit.pitch;
    this.minRadius = 1e-6;
    this.maxRadius = Number.POSITIVE_INFINITY;
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
    const radius = Math.max(this.minRadius ?? 1e-6, Math.hypot(dx, dy, dz));
    return {
      radius,
      yaw: Math.atan2(dx, dz),
      pitch: Math.asin(clamp(dy / radius, -1, 1))
    };
  }

  #position() {
    const cp = Math.cos(this.pitch);
    return [
      this.target[0] + Math.sin(this.yaw) * cp * this.radius,
      this.target[1] + Math.sin(this.pitch) * this.radius,
      this.target[2] + Math.cos(this.yaw) * cp * this.radius
    ];
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

  #pointerInsideCanvas(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.dragging = false;
  }

  setFocusResolver(resolver) {
    this.focusResolver = typeof resolver === 'function' ? resolver : null;
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

  focus(target) {
    if (!Array.isArray(target) || target.length !== 3 || target.some((v) => !Number.isFinite(v))) return false;
    const currentPosition = this.#position();
    const orbit = this.#derive(currentPosition, target);
    this.target = [...target];
    this.radius = clamp(orbit.radius, this.minRadius, this.maxRadius);
    this.yaw = orbit.yaw;
    this.pitch = clamp(orbit.pitch, -Math.PI * 0.499, Math.PI * 0.499);
    this.#apply();
    return true;
  }

  async focusAtCursor() {
    if (!this.enabled || !this.focusResolver || this.focusInFlight) return false;
    const rect = this.canvas.getBoundingClientRect();
    const x = Number.isFinite(this.pointerX) && this.#pointerInsideCanvas(this.pointerX, this.pointerY)
      ? this.pointerX
      : rect.left + rect.width * 0.5;
    const y = Number.isFinite(this.pointerY) && this.#pointerInsideCanvas(this.pointerX, this.pointerY)
      ? this.pointerY
      : rect.top + rect.height * 0.5;

    this.focusInFlight = true;
    try {
      const target = await this.focusResolver(x, y);
      return target ? this.focus(target) : false;
    } finally {
      this.focusInFlight = false;
    }
  }

  onPointerDown(event) {
    if (!this.enabled || event.button !== 1) return;
    event.preventDefault();
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.canvas.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    if (event.target === this.canvas && this.#pointerInsideCanvas(event.clientX, event.clientY)) {
      this.pointerX = event.clientX;
      this.pointerY = event.clientY;
    }
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
      this.pitch = clamp(this.pitch - dy * 0.0032, -Math.PI * 0.499, Math.PI * 0.499);
    }
    this.#apply();
  }

  onPointerUp() {
    this.dragging = false;
  }

  onWheel(event) {
    if (!this.enabled) return;
    event.preventDefault();
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;

    const boundedDelta = clamp(event.deltaY, -600, 600);
    const speed = event.shiftKey ? 0.0030 : 0.0019;
    const scale = Math.exp(boundedDelta * speed);
    const previousRadius = this.radius;
    const nextRadius = Math.max(this.minRadius, previousRadius * scale);

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
      const gain = zoomFraction >= 0 ? 0.94 : 0.22;
      for (let i = 0; i < 3; i++) this.target[i] += (anchor[i] - this.target[i]) * zoomFraction * gain;
    }

    this.radius = nextRadius;
    this.#apply();
  }

  onKeyDown(event) {
    if (!this.enabled || event.defaultPrevented) return;
    const tag = event.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || event.metaKey || event.ctrlKey || event.altKey) return;

    const key = event.key.toLowerCase();
    if (key === 'f') {
      event.preventDefault();
      void this.focusAtCursor();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.fit();
    } else if (key === 'r') {
      event.preventDefault();
      this.reset();
    }
  }

  #apply() {
    this.setCamera(this.#position(), this.target);
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
