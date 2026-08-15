import { Picker, Vec3 } from 'playcanvas';

function distance3(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export class CollisionProbe {
  constructor({ app, camera, foreground, environment, markers, spatialProbe, candidateLayer }) {
    this.app = app;
    this.camera = camera;
    this.foreground = foreground;
    this.environment = environment;
    this.markers = markers;
    this.spatialProbe = spatialProbe;
    this.candidateLayer = candidateLayer;
    this.picker = new Picker(app, 1, 1, true);
  }

  #pixel(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const x = (event.clientX - rect.left) * width / rect.width;
    const y = (event.clientY - rect.top) * height / rect.height;
    return { width, height, x, y };
  }

  #candidateSourceFromWorld(worldPoint) {
    const active = this.candidateLayer.active;
    if (!active) return null;
    const inverse = active.parent.getWorldTransform().clone().invert();
    const source = inverse.transformPoint(worldPoint.clone());
    return [source.x, source.y, source.z];
  }

  async #pickCandidate(event, canvas) {
    const active = this.candidateLayer.active;
    if (!active) return null;
    const { width, height, x, y } = this.#pixel(event, canvas);
    this.picker.resize(width, height);

    const foregroundEnabled = this.foreground.enabled;
    const environmentEnabled = this.environment.enabled;
    const candidateVisible = this.candidateLayer.visible;
    this.foreground.enabled = false;
    this.environment.enabled = false;
    this.markers.setPickingVisibility(false);
    this.candidateLayer.setVisible(true);

    try {
      return await this.candidateLayer.withSolidPicking(async () => {
        const worldLayer = this.app.scene.layers.getLayerByName('World');
        this.picker.prepare(this.camera.camera, this.app.scene, [worldLayer]);
        const worldPoint = await this.picker.getWorldPointAsync(x, y);
        const selection = await this.picker.getSelectionAsync(x, y, 1, 1);
        if (!worldPoint || !selection.some((item) => active.meshInstances.includes(item))) return null;
        return {
          source: this.#candidateSourceFromWorld(worldPoint),
          runtimeWorld: [worldPoint.x, worldPoint.y, worldPoint.z]
        };
      });
    } finally {
      this.foreground.enabled = foregroundEnabled;
      this.environment.enabled = environmentEnabled;
      this.markers.setPickingVisibility(true);
      this.candidateLayer.setVisible(candidateVisible);
    }
  }

  async compare(event, canvas) {
    const active = this.candidateLayer.active;
    if (!active) throw new Error('No active collision candidate.');

    const candidateVisible = this.candidateLayer.visible;
    const foregroundEnabled = this.foreground.enabled;
    const environmentEnabled = this.environment.enabled;
    this.candidateLayer.setVisible(false);
    this.foreground.enabled = true;
    let appearance;
    try {
      appearance = await this.spatialProbe.pickForeground(event, canvas);
    } finally {
      this.foreground.enabled = foregroundEnabled;
      this.environment.enabled = environmentEnabled;
      this.candidateLayer.setVisible(candidateVisible);
    }
    const candidate = await this.#pickCandidate(event, canvas);

    let status = 'MISS_BOTH';
    if (appearance && candidate) status = 'HIT_BOTH';
    else if (appearance) status = 'APPEARANCE_ONLY';
    else if (candidate) status = 'CANDIDATE_ONLY';

    let sourceDelta = null;
    let cameraDepthDelta = null;
    if (appearance && candidate) {
      sourceDelta = distance3(appearance.source, candidate.source);
      const cameraPosition = this.camera.getPosition();
      const appearanceWorld = new Vec3(...appearance.runtimeWorld);
      const candidateWorld = new Vec3(...candidate.runtimeWorld);
      cameraDepthDelta = cameraPosition.distance(candidateWorld) - cameraPosition.distance(appearanceWorld);
    }

    return {
      status,
      appearance,
      candidate,
      sourceDelta,
      cameraDepthDelta,
      candidateName: active.name
    };
  }

  destroy() {
    this.picker.destroy();
  }
}
