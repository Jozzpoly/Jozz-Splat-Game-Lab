import { Color, Entity, StandardMaterial } from 'playcanvas';
const DIAMETER_PX=16,SCALE_MIN=0.001,SCALE_MAX=8.0,clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function material(color){const m=new StandardMaterial();m.useLighting=false;m.diffuse=color;m.emissive=color;m.emissiveIntensity=2;m.update();return m;}
export class MarkerSystem{
  constructor({root,camera,canvas}){this.root=root;this.camera=camera;this.canvas=canvas;this.entities=[];this.bottomMaterial=material(new Color(.25,.82,1));this.topMaterial=material(new Color(1,.72,.34));}
  create(sourcePoint,role,name,sourceToBaseline){const p=sourceToBaseline(sourcePoint),e=new Entity(name);e.addComponent('render',{type:'sphere'});e.setLocalPosition(...p);this.setRole(e,role);this.root.addChild(e);this.entities.push(e);this.updateScale(e);return e;}
  setRole(marker,role){if(!marker?.render?.meshInstances)return;const mat=role==='bottom'?this.bottomMaterial:this.topMaterial;for(const mesh of marker.render.meshInstances)mesh.material=mat;}
  remove(marker){const i=this.entities.indexOf(marker);if(i>=0)this.entities.splice(i,1);marker?.destroy();}
  setPickingVisibility(enabled){for(const marker of this.entities)marker.enabled=enabled;}
  updateScale(marker){if(!marker?.enabled)return;const distance=Math.max(.001,this.camera.getPosition().distance(marker.getPosition())),height=Math.max(1,this.canvas.clientHeight||this.canvas.height||1),worldHeight=2*distance*Math.tan(this.camera.camera.fov*Math.PI/360),size=clamp(worldHeight/height*DIAMETER_PX,SCALE_MIN,SCALE_MAX);marker.setLocalScale(size,size,size);}
  update(){for(const marker of this.entities)this.updateScale(marker);}
}
