const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export class NavigationController {
  constructor({ canvas, setOrbitCamera, setFlyCamera, initialTarget, initialPosition }) {
    this.canvas = canvas;
    this.setOrbitCamera = setOrbitCamera;
    this.setFlyCamera = setFlyCamera;
    this.initialTarget = [...initialTarget];
    this.initialPosition = [...initialPosition];
    const orbit = this.deriveOrbit(this.initialPosition, this.initialTarget);
    const fly = this.deriveFly(this.initialPosition, this.initialTarget);
    this.initialRadius = orbit.radius;
    this.initialYaw = orbit.yaw;
    this.initialPitch = orbit.pitch;
    this.initialFlyYaw = fly.yaw;
    this.initialFlyPitch = fly.pitch;
    this.mode = 'orbit';
    this.target = [...initialTarget];
    this.radius = orbit.radius;
    this.yaw = orbit.yaw;
    this.pitch = orbit.pitch;
    this.flyPosition = [...this.initialPosition];
    this.flyYaw = fly.yaw;
    this.flyPitch = fly.pitch;
    this.dragging = false;
    this.pointerX = 0;
    this.pointerY = 0;
    this.keys = new Set();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onContextMenu = (event) => event.preventDefault();
    this.onPointerLockChange = () => {};

    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);

    this.applyOrbit();
  }

  deriveOrbit(position, target) {
    const dx = position[0] - target[0];
    const dy = position[1] - target[1];
    const dz = position[2] - target[2];
    const radius = Math.max(1e-6, Math.hypot(dx, dy, dz));
    return {
      radius,
      yaw: Math.atan2(dx, dz),
      pitch: Math.asin(clamp(dy / radius, -1, 1))
    };
  }

  deriveFly(position, target) {
    const dx = target[0] - position[0];
    const dy = target[1] - position[1];
    const dz = target[2] - position[2];
    const length = Math.max(1e-6, Math.hypot(dx, dy, dz));
    const fx = dx / length;
    const fy = dy / length;
    const fz = dz / length;
    return { yaw: Math.atan2(-fx, -fz), pitch: Math.asin(clamp(fy, -1, 1)) };
  }

  setMode(mode) {
    if (mode !== 'orbit' && mode !== 'fly') return;
    this.mode = mode;
    this.dragging = false;
    this.keys.clear();
    if (document.pointerLockElement === this.canvas && mode !== 'fly') document.exitPointerLock();
    if (mode === 'orbit') this.applyOrbit();
    else this.applyFly();
  }

  reset() {
    this.target = [...this.initialTarget];
    this.radius = this.initialRadius;
    this.yaw = this.initialYaw;
    this.pitch = this.initialPitch;
    this.flyPosition = [...this.initialPosition];
    this.flyYaw = this.initialFlyYaw;
    this.flyPitch = this.initialFlyPitch;
    if (this.mode === 'orbit') this.applyOrbit();
    else this.applyFly();
  }

  onPointerDown(event) {
    if (this.mode === 'fly') {
      if (document.pointerLockElement !== this.canvas) this.canvas.requestPointerLock?.();
      return;
    }
    this.dragging = true;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.dragButton = event.button;
    this.canvas.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    if (this.mode === 'fly') {
      if (document.pointerLockElement !== this.canvas) return;
      this.flyYaw -= event.movementX * 0.0022;
      this.flyPitch = clamp(this.flyPitch - event.movementY * 0.0022, -Math.PI * 0.49, Math.PI * 0.49);
      this.applyFly();
      return;
    }
    if (!this.dragging) return;
    const dx = event.clientX - this.pointerX;
    const dy = event.clientY - this.pointerY;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;

    if (this.dragButton === 2 || event.shiftKey) {
      const panScale = this.radius * 0.0018;
      const right = [Math.cos(this.yaw), 0, -Math.sin(this.yaw)];
      const up = [0, 1, 0];
      for (let i = 0; i < 3; i++) this.target[i] += (-dx * right[i] + dy * up[i]) * panScale;
    } else {
      this.yaw -= dx * 0.0042;
      this.pitch = clamp(this.pitch - dy * 0.0042, -Math.PI * 0.48, Math.PI * 0.48);
    }
    this.applyOrbit();
  }

  onPointerUp() { this.dragging = false; }

  onWheel(event) {
    if (this.mode !== 'orbit') return;
    event.preventDefault();
    const scale = Math.exp(event.deltaY * 0.0012);
    this.radius = clamp(this.radius * scale, this.initialRadius * 0.015, this.initialRadius * 8);
    this.applyOrbit();
  }

  onKeyDown(event) {
    if (this.mode !== 'fly') return;
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'q', 'e', 'shift'].includes(key)) {
      this.keys.add(key);
      event.preventDefault();
    }
  }

  onKeyUp(event) { this.keys.delete(event.key.toLowerCase()); }

  update(dt) {
    if (this.mode !== 'fly' || this.keys.size === 0) return;
    const speed = this.initialRadius * 0.12 * (this.keys.has('shift') ? 3.5 : 1.0);
    const cp = Math.cos(this.flyPitch);
    const forward = [-Math.sin(this.flyYaw) * cp, Math.sin(this.flyPitch), -Math.cos(this.flyYaw) * cp];
    const right = [Math.cos(this.flyYaw), 0, -Math.sin(this.flyYaw)];
    const up = [0, 1, 0];
    let vx = 0, vy = 0, vz = 0;
    const add = (v, s) => { vx += v[0] * s; vy += v[1] * s; vz += v[2] * s; };
    if (this.keys.has('w')) add(forward, 1);
    if (this.keys.has('s')) add(forward, -1);
    if (this.keys.has('d')) add(right, 1);
    if (this.keys.has('a')) add(right, -1);
    if (this.keys.has('e')) add(up, 1);
    if (this.keys.has('q')) add(up, -1);
    const len = Math.hypot(vx, vy, vz) || 1;
    const step = speed * dt / len;
    this.flyPosition[0] += vx * step;
    this.flyPosition[1] += vy * step;
    this.flyPosition[2] += vz * step;
    this.applyFly();
  }

  applyOrbit() {
    const cp = Math.cos(this.pitch);
    const offset = [
      Math.sin(this.yaw) * cp * this.radius,
      Math.sin(this.pitch) * this.radius,
      Math.cos(this.yaw) * cp * this.radius
    ];
    const position = [this.target[0] + offset[0], this.target[1] + offset[1], this.target[2] + offset[2]];
    this.setOrbitCamera(position, this.target);
  }

  applyFly() { this.setFlyCamera(this.flyPosition, this.flyYaw, this.flyPitch); }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
  }
}
