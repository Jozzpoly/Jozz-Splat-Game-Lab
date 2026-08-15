import { Color, Entity, StandardMaterial } from 'playcanvas';

const DIAMETER_PX = 15;
const SCALE_MIN = 0.0004;
const SCALE_MAX = 0.08;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function makeMaterial(color) {
  const material = new StandardMaterial();
  material.useLighting = false;
  material.diffuse = color;
  material.emissive = color;
  material.emissiveIntensity = 2.0;
  material.update();
  return material;
}

export class CompareMarkerSystem {
  constructor({ root, camera, canvas }) {
    this.root = root;
    this.camera = camera;
    this.canvas = canvas;
    this.entities = [];
    this.appearanceMaterial = makeMaterial(new Color(0.20, 0.86, 1.0));
    this.candidateMaterial = makeMaterial(new Color(1.0, 0.62, 0.18));
  }

  createWorld(worldPoint, role, name) {
    const marker = new Entity(name);
    marker.addComponent('render', { type: 'sphere' });
    marker.setPosition(worldPoint[0], worldPoint[1], worldPoint[2]);
    const material = role === 'candidate' ? this.candidateMaterial : this.appearanceMaterial;
    for (const mesh of marker.render.meshInstances) mesh.material = material;
    this.root.addChild(marker);
    this.entities.push(marker);
    this.updateScale(marker);
    return marker;
  }

  clear() {
    for (const entity of this.entities.splice(0)) entity.destroy();
  }

  setPickingVisibility(enabled) {
    for (const entity of this.entities) entity.enabled = enabled;
  }

  updateScale(marker) {
    if (!marker?.enabled) return;
    const distance = Math.max(0.0001, this.camera.getPosition().distance(marker.getPosition()));
    const height = Math.max(1, this.canvas.clientHeight || this.canvas.height || 1);
    const worldHeight = 2 * distance * Math.tan(this.camera.camera.fov * Math.PI / 360);
    const size = clamp((worldHeight / height) * DIAMETER_PX, SCALE_MIN, SCALE_MAX);
    marker.setLocalScale(size, size, size);
  }

  update() {
    for (const entity of this.entities) this.updateScale(entity);
  }
}
