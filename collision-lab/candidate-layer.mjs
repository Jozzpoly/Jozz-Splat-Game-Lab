import {
  BLEND_NORMAL,
  Color,
  CULLFACE_NONE,
  Entity,
  RENDERSTYLE_SOLID,
  RENDERSTYLE_WIREFRAME,
  StandardMaterial
} from 'playcanvas';

const COLORS = {
  conservative: new Color(0.28, 0.88, 1.0),
  balanced: new Color(1.0, 0.68, 0.20),
  permissive: new Color(1.0, 0.32, 0.62)
};

function loadContainer(app, name, url) {
  return new Promise((resolve, reject) => {
    app.assets.loadFromUrlAndFilename(url, `${name}.glb`, 'container', (error, asset) => {
      if (error) reject(new Error(String(error)));
      else resolve(asset);
    });
  });
}

export class CandidateLayer {
  constructor({ app, groundingRoot, metadata }) {
    this.app = app;
    this.groundingRoot = groundingRoot;
    this.metadata = metadata;
    this.layers = new Map();
    this.activeName = null;
    this.style = 'wireframe';
    this.opacity = 0.48;
    this.visible = true;
  }

  async loadAll(onProgress) {
    const names = Object.keys(this.metadata.candidates);
    let done = 0;
    for (const name of names) {
      const asset = await loadContainer(this.app, name, `/candidate/${name}.glb`);
      const parent = new Entity(`C0a ${name} source root`);
      parent.setLocalEulerAngles(0, 0, 180);
      const entity = asset.resource.instantiateRenderEntity({ castShadows: false });
      parent.addChild(entity);
      this.groundingRoot.addChild(parent);

      const renders = entity.findComponents('render');
      const meshInstances = [];
      const material = new StandardMaterial();
      const color = COLORS[name] ?? new Color(0.8, 0.8, 0.8);
      material.useLighting = false;
      material.diffuse = color;
      material.emissive = color;
      material.emissiveIntensity = 0.6;
      material.opacity = this.opacity;
      material.blendType = BLEND_NORMAL;
      material.cull = CULLFACE_NONE;
      material.depthWrite = false;
      material.update();

      for (const render of renders) {
        for (const meshInstance of render.meshInstances) {
          meshInstance.material = material;
          meshInstances.push(meshInstance);
        }
      }

      this.layers.set(name, { name, asset, parent, entity, renders, meshInstances, material });
      parent.enabled = false;
      done += 1;
      onProgress?.(done, names.length, name);
    }
    this.setActive(names.includes('balanced') ? 'balanced' : names[0]);
    this.setStyle(this.style);
  }

  setActive(name) {
    if (!this.layers.has(name)) return false;
    for (const [candidateName, layer] of this.layers) layer.parent.enabled = this.visible && candidateName === name;
    this.activeName = name;
    return true;
  }

  get active() {
    return this.layers.get(this.activeName) ?? null;
  }

  setVisible(visible) {
    this.visible = Boolean(visible);
    for (const [candidateName, layer] of this.layers) layer.parent.enabled = this.visible && candidateName === this.activeName;
  }

  setStyle(style) {
    this.style = style === 'solid' ? 'solid' : 'wireframe';
    const renderStyle = this.style === 'solid' ? RENDERSTYLE_SOLID : RENDERSTYLE_WIREFRAME;
    for (const layer of this.layers.values()) {
      for (const render of layer.renders) render.renderStyle = renderStyle;
    }
  }

  setOpacity(opacity) {
    this.opacity = Math.min(1, Math.max(0.05, Number(opacity) || 0.48));
    for (const layer of this.layers.values()) {
      layer.material.opacity = this.opacity;
      layer.material.update();
    }
  }

  async withSolidPicking(fn) {
    const previous = this.style;
    this.setStyle('solid');
    try {
      return await fn();
    } finally {
      this.setStyle(previous);
    }
  }

  destroy() {
    for (const layer of this.layers.values()) {
      layer.parent.destroy();
      layer.asset.unload();
    }
    this.layers.clear();
  }
}
