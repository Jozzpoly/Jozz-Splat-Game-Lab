import { Application, Asset, Color, DEVICETYPE_WEBGL2, Entity, FILLMODE_FILL_WINDOW, RESOLUTION_AUTO, createGraphicsDevice } from 'playcanvas';
import { SurveyController } from './survey.mjs';
import { SpatialProbe } from './spatial-probe.mjs';
import { MarkerSystem } from './marker-system.mjs';
import { GravityWorkflow, sourceToBaseline } from './gravity-workflow.mjs';
const $=s=>document.querySelector(s),SOURCE_SHA='8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3';
const canvas=$('#viewport'),appElement=$('#app'),loadingPanel=$('#loadingPanel'),loadingTitle=$('#loadingTitle'),loadingDetail=$('#loadingDetail'),progressBar=$('#progressBar'),errorPanel=$('#errorPanel'),errorText=$('#errorText'),backendStatus=$('#backendStatus');
let app,camera,groundingRoot,foreground,environment,survey,probe;
async function loadGsplat(name,url,onProgress){const asset=new Asset(name,'gsplat',{url});app.assets.add(asset);asset.on('progress',(received,total)=>onProgress?.(received,total));await new Promise((resolve,reject)=>{asset.ready(resolve);asset.once('error',e=>reject(new Error(String(e))));app.assets.load(asset);});return asset;}
function ui(){return{app:appElement,hint:$('#pickHint'),add:$('#addVerticalButton'),undo:$('#undoVerticalButton'),clear:$('#clearVerticalButton'),preview:$('#previewButton'),resetPreview:$('#resetPreviewButton'),copy:$('#copyEvidenceButton'),count:$('#verticalCount'),solver:$('#solverStatus'),tilt:$('#tiltStatus'),coherence:$('#axisCoherenceStatus'),median:$('#medianResidualStatus'),max:$('#maxResidualStatus'),reversed:$('#reversedStatus'),previewStatus:$('#previewStatus'),up:$('#upVectorStatus'),quat:$('#quatStatus'),orderWarning:$('#orderWarning'),list:$('#verticalList')};}
async function boot(){
  const meta=await fetch('/api/source',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`Source metadata HTTP ${r.status}`);return r.json();});if(!meta.verified||meta.sourceSha256!==SOURCE_SHA)throw new Error('Źródło nie spełnia F0 SHA-256 contract.');
  const device=await createGraphicsDevice(canvas,{deviceTypes:[DEVICETYPE_WEBGL2],antialias:false,powerPreference:'high-performance'});app=new Application(canvas,{graphicsDevice:device});app.graphicsDevice.maxPixelRatio=1;app.setCanvasFillMode(FILLMODE_FILL_WINDOW);app.setCanvasResolution(RESOLUTION_AUTO);app.scene.gsplat.enableIds=true;app.start();backendStatus.textContent=app.graphicsDevice.deviceType;
  camera=new Entity('W0 Survey Camera');camera.addComponent('camera',{clearColor:new Color(.027,.035,.043),nearClip:.003,farClip:2500,fov:58});app.root.addChild(camera);groundingRoot=new Entity('W0 Draft Grounding Root');app.root.addChild(groundingRoot);
  loadingTitle.textContent='Ładuję foreground…';const fgAsset=await loadGsplat('W0 Foreground','/asset/foreground.ply',(loaded,total)=>{if(total>0)progressBar.style.width=`${Math.min(86,8+loaded/total*78)}%`;loadingDetail.textContent=total>0?`${Math.round(loaded/1048576)} / ${Math.round(total/1048576)} MiB`:'Ładowanie foreground';});foreground=new Entity('W0 Foreground');foreground.setLocalEulerAngles(0,0,180);foreground.addComponent('gsplat',{asset:fgAsset});groundingRoot.addChild(foreground);
  loadingTitle.textContent='Ładuję environment appearance…';const envAsset=await loadGsplat('W0 Environment','/asset/environment.ply');environment=new Entity('W0 Environment appearance only');environment.setLocalEulerAngles(0,0,180);environment.addComponent('gsplat',{asset:envAsset});groundingRoot.addChild(environment);
  const bounds=meta.foreground.bounds,centerSource=bounds.min.map((v,i)=>(v+bounds.max[i])*.5),size=bounds.min.map((v,i)=>bounds.max[i]-v),extent=Math.max(...size),center=sourceToBaseline(centerSource),radius=extent*.42,position=[center[0]-radius*.28,center[1]+radius*.34,center[2]+radius*.88];
  survey=new SurveyController({canvas,target:center,position,fovDeg:camera.camera.fov,setCamera(p,t){camera.setPosition(...p);camera.lookAt(...t);}});
  const markers=new MarkerSystem({root:groundingRoot,camera,canvas});probe=new SpatialProbe({app,camera,foreground,environment,markers});new GravityWorkflow({app,canvas,root:groundingRoot,survey,probe,markers,ui:ui(),sourceSha:SOURCE_SHA});
  $('#fitViewButton').addEventListener('click',()=>survey.fit());$('#resetViewButton').addEventListener('click',()=>survey.reset());
  progressBar.style.width='100%';loadingPanel.hidden=true;appElement.dataset.state='ready';
}
boot().catch(error=>{console.error(error);loadingPanel.hidden=true;errorPanel.hidden=false;errorText.textContent=error?.stack||error?.message||String(error);});
window.addEventListener('beforeunload',()=>{survey?.destroy();probe?.destroy();app?.destroy();});
