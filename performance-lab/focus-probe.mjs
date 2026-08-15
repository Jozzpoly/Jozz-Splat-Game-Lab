import { Picker } from 'playcanvas';

export class FocusProbe {
  constructor({ app, camera, foreground, environment }) {
    this.app = app;
    this.camera = camera;
    this.foreground = foreground;
    this.environment = environment;
    this.picker = new Picker(app, 1, 1, true);
  }

  async pick(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    this.picker.resize(width, height);
    const x = (clientX - rect.left) * width / rect.width;
    const y = (clientY - rect.top) * height / rect.height;
    const environmentEnabled = this.environment.enabled;
    this.environment.enabled = false;
    try {
      const worldLayer = this.app.scene.layers.getLayerByName('World');
      this.picker.prepare(this.camera.camera, this.app.scene, [worldLayer]);
      const worldPoint = await this.picker.getWorldPointAsync(x, y);
      const selection = await this.picker.getSelectionAsync(x, y, 1, 1);
      if (!worldPoint || !selection.includes(this.foreground.gsplat)) return null;
      return [worldPoint.x, worldPoint.y, worldPoint.z];
    } finally {
      this.environment.enabled = environmentEnabled;
    }
  }

  destroy() { this.picker.destroy(); }
}
