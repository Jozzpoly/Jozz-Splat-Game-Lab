import { Picker } from 'playcanvas';

export class SpatialProbe {
  constructor({ app, camera, foreground, environment, markers }) {
    this.app = app;
    this.camera = camera;
    this.foreground = foreground;
    this.environment = environment;
    this.markers = markers;
    this.picker = new Picker(app, 1, 1, true);
  }

  sourceFromWorld(worldPoint) {
    const inverse = this.foreground.getWorldTransform().clone().invert();
    const source = inverse.transformPoint(worldPoint.clone());
    return [source.x, source.y, source.z];
  }

  async pickForeground(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    this.picker.resize(width, height);
    const x = (event.clientX - rect.left) * width / rect.width;
    const y = (event.clientY - rect.top) * height / rect.height;

    this.environment.enabled = false;
    this.markers.setPickingVisibility(false);
    try {
      const worldLayer = this.app.scene.layers.getLayerByName('World');
      this.picker.prepare(this.camera.camera, this.app.scene, [worldLayer]);
      const worldPoint = await this.picker.getWorldPointAsync(x, y);
      const selection = await this.picker.getSelectionAsync(x, y, 1, 1);
      if (!worldPoint || !selection.includes(this.foreground.gsplat)) return null;
      return {
        source: this.sourceFromWorld(worldPoint),
        runtimeWorld: [worldPoint.x, worldPoint.y, worldPoint.z]
      };
    } finally {
      this.environment.enabled = true;
      this.markers.setPickingVisibility(true);
    }
  }

  destroy() { this.picker.destroy(); }
}
