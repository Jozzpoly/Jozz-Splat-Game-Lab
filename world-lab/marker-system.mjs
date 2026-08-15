import { Color, Entity, StandardMaterial } from 'playcanvas';

const DIAMETER_PX = 16;
const SCALE_MIN = 0.001;
const SCALE_MAX = 8.0;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function material(color) {
  const value = new StandardMaterial();
  value.useLighting = false;
  value.diffuse = color;
  value.emissive = color;
  value.emissiveIntensity = 2;
  value.update();
  return value;
}

export class MarkerSystem {
  constructor({ root, camera, canvas }) {
    this.root = root;
    this.camera = camera;
    this.canvas = canvas;
    this.entities = [];
    this.bottomMaterial = material(new Color(0.25, 0.82, 1.0));
    this.topMaterial = material(new Color(1.0, 0.72, 0.34));
  }

  create(sourcePoint, role, name, sourceToBaseline) {
    const p = sourceToBaseline(sourcePoint);
    const marker = new Entity(name);
    marker.addComponent('render', { type: 'sphere' });
    marker.setLocalPosition(p[0], p[1], p[2]);
    const mat = role === 'bottom' ? this.bottomMaterial : this.topMaterial;
    for (const mesh of marker.render.meshInstances) mesh.material = mat;
    this.root.addChild(marker);
    this.entities.push(marker);
    this.updateScale(marker);
    return marker;
  }

  setRole(marker, role) {
    if (!marker?.render?.meshInstances) return;
    const mat = role === 'bottom' ? this.bottomMaterial : this.topMaterial;
    for (const mesh of marker.render.meshInstances) mesh.material = mat;
  }

  remove(marker) {
    const index = this.entities.indexOf(marker);
    if (index >= 0) this.entities.splice(index, 1);
    marker?.destroy();
  }

  setPickingVisibility(enabled) {
    for (const marker of this.entities) marker.enabled = enabled;
  }

  updateScale(marker) {
    if (!marker?.enabled) return;
    const distance = Math.max(0.001, this.camera.getPosition().distance(marker.getPosition()));
    const height = Math.max(1, this.canvas.clientHeight || this.canvas.height || 1);
    const worldHeight = 2 * distance * Math.tan(this.camera.camera.fov * Math.PI / 360);
    const size = clamp((worldHeight / height) * DIAMETER_PX, SCALE_MIN, SCALE_MAX);
    marker.setLocalScale(size, size, size);
  }

  update() { for (const marker of this.entities) this.updateScale(marker); }
}
