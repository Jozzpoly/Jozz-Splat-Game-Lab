import { Color } from 'playcanvas';
import { solveGravity } from './gravity.mjs';

const LINE_COLOR = new Color(1.0, 0.72, 0.34);
const distance = (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
const formatVec = (v, d=5) => Array.isArray(v) ? v.map(n => Number(n).toFixed(d)).join(', ') : '—';
export const sourceToBaseline = ([x,y,z]) => [-x,-y,z];

export class GravityWorkflow {
  constructor({ app, canvas, root, survey, probe, markers, ui, sourceSha }) {
    Object.assign(this, { app, canvas, root, survey, probe, markers, ui, sourceSha });
    this.verticals = [];
    this.pendingBottom = null;
    this.pickPhase = null;
    this.pickInFlight = false;
    this.result = null;
    this.previewApplied = false;
    this.bind();
    this.recompute();
  }

  bind() {
    const u=this.ui;
    u.add.addEventListener('click',()=>this.start());
    u.undo.addEventListener('click',()=>this.undo());
    u.clear.addEventListener('click',()=>this.clear());
    u.preview.addEventListener('click',()=>this.applyPreview());
    u.resetPreview.addEventListener('click',()=>this.resetPreview());
    u.copy.addEventListener('click',()=>this.copyEvidence());
    window.addEventListener('keydown',e=>{ if(e.key==='Escape'&&this.pickPhase)this.cancelPending(); });
    this.canvas.addEventListener('pointerup',e=>this.handlePick(e));
    this.app.on('update',()=>this.update());
  }

  setPhase(phase) {
    this.pickPhase=phase;
    const armed=Boolean(phase);
    this.ui.app.dataset.pickArmed=armed?'true':'false';
    this.survey.setEnabled(!armed);
    this.ui.hint.hidden=!armed;
    this.ui.add.classList.toggle('armed',armed);
    this.ui.add.textContent=armed?'Anuluj pion':'Dodaj pion';
    if(phase==='bottom') this.ui.hint.textContent='W0.2 GRAVITY · kliknij DÓŁ rzeczywiście pionowej krawędzi · Esc anuluje';
    if(phase==='top') this.ui.hint.textContent='W0.2 GRAVITY · teraz kliknij GÓRĘ tej samej pionowej krawędzi · Esc anuluje';
  }

  cancelPending() {
    if(this.pendingBottom?.marker)this.markers.remove(this.pendingBottom.marker);
    this.pendingBottom=null; this.setPhase(null);
  }

  start() {
    if(this.pickPhase){ this.cancelPending(); return; }
    if(this.previewApplied)this.resetPreview();
    this.setPhase('bottom');
  }

  async handlePick(event) {
    if(!this.pickPhase||this.pickInFlight)return;
    this.pickInFlight=true;
    try {
      const picked=await this.probe.pickForeground(event,this.canvas);
      if(!picked){ this.ui.hint.textContent='MISS / NOT FOREGROUND · wybierz widoczną powierzchnię foreground'; return; }
      if(this.pickPhase==='bottom'){
        const marker=this.markers.create(picked.source,'bottom',`Gravity bottom ${this.verticals.length+1}`,sourceToBaseline);
        this.pendingBottom={source:picked.source,marker}; this.setPhase('top'); return;
      }
      if(this.pickPhase==='top'&&this.pendingBottom){
        if(distance(sourceToBaseline(this.pendingBottom.source),sourceToBaseline(picked.source))<1e-6){
          this.ui.hint.textContent='ODCINEK ZBYT KRÓTKI · wybierz wyraźnie oddalony górny punkt'; return;
        }
        const topMarker=this.markers.create(picked.source,'top',`Gravity top ${this.verticals.length+1}`,sourceToBaseline);
        this.verticals.push({bottomSource:this.pendingBottom.source,topSource:picked.source,bottomMarker:this.pendingBottom.marker,topMarker});
        this.pendingBottom=null; this.setPhase(null); this.recompute();
      }
    } catch(error){ console.error(error); this.ui.hint.hidden=false; this.ui.hint.textContent='PICK ERROR · wyślij screenshot'; }
    finally { this.pickInFlight=false; }
  }

  solverRefs(){ return this.verticals.map(r=>({bottom:sourceToBaseline(r.bottomSource),top:sourceToBaseline(r.topSource)})); }
  recompute(){ this.resetPreview(); this.result=solveGravity(this.solverRefs()); this.render(); }

  residualClass(v){ if(!Number.isFinite(v))return''; if(v>15)return'bad'; if(v>5)return'warn'; return''; }

  render(){
    const u=this.ui,r=this.result;
    u.count.textContent=String(this.verticals.length);
    u.undo.disabled=!this.verticals.length&&!this.pendingBottom;
    u.clear.disabled=!this.verticals.length&&!this.pendingBottom;
    const candidate=r?.status==='CANDIDATE';
    u.solver.textContent=candidate?(this.verticals.length>=3?'CANDIDATE':'PROVISIONAL'):'INSUFFICIENT';
    u.tilt.textContent=candidate?`${r.tiltDeg.toFixed(2)}°`:'—';
    u.median.textContent=candidate?`${r.residualStats.medianDeg.toFixed(2)}°`:'—';
    u.max.textContent=candidate?`${r.residualStats.maxDeg.toFixed(2)}°`:'—';
    u.up.textContent=candidate?formatVec(r.up,6):'—';
    u.quat.textContent=candidate?formatVec(r.correctionQuaternion,6):'—';
    u.preview.disabled=!candidate||this.previewApplied;
    u.resetPreview.disabled=!this.previewApplied;
    u.copy.disabled=!(candidate&&this.verticals.length>=3);
    const residuals=candidate?r.residuals:[];
    u.list.innerHTML=this.verticals.length?this.verticals.map((ref,i)=>{
      const len=distance(sourceToBaseline(ref.bottomSource),sourceToBaseline(ref.topSource));
      const a=residuals[i]?.angleDeg;
      return `<div class="vertical-row"><strong>V${String(i+1).padStart(2,'0')}</strong><code>len ${len.toFixed(3)} src</code><span class="residual ${this.residualClass(a)}">${Number.isFinite(a)?`${a.toFixed(2)}°`:'—'}</span></div>`;
    }).join(''):'<p class="empty">Brak pionów.</p>';
  }

  applyPreview(){ if(this.result?.status!=='CANDIDATE')return; const [x,y,z,w]=this.result.correctionQuaternion; this.root.setLocalRotation(x,y,z,w); this.previewApplied=true; this.ui.previewStatus.textContent='LEVEL PREVIEW'; this.render(); }
  resetPreview(){ this.previewApplied=false; this.root?.setLocalRotation(0,0,0,1); if(this.ui?.previewStatus)this.ui.previewStatus.textContent='OFF'; }

  undo(){ if(this.pendingBottom){this.cancelPending();this.render();return;} const ref=this.verticals.pop(); if(!ref)return; this.markers.remove(ref.bottomMarker);this.markers.remove(ref.topMarker);this.recompute(); }
  clear(){ this.cancelPending(); while(this.verticals.length){const r=this.verticals.pop();this.markers.remove(r.bottomMarker);this.markers.remove(r.topMarker);} this.recompute(); }

  evidence(){
    const r=this.result?.status==='CANDIDATE'?this.result:null;
    return {gate:'W0.2',status:'OWNER_GRAVITY_EVIDENCE',recordedAt:new Date().toISOString(),sourceSha256:this.sourceSha,runtime:'PlayCanvas 2.21.2',backend:this.app.graphicsDevice.deviceType,baselineOrientation:'source -> baseline runtime: 180deg around Z; NOT calibrated world orientation',worldCalibration:'DRAFT_ORIENTATION_CANDIDATE_NO_SCALE',referenceCount:this.verticals.length,references:this.verticals.map((v,i)=>({id:i+1,bottomSource:v.bottomSource,topSource:v.topSource,bottomBaselineRuntime:sourceToBaseline(v.bottomSource),topBaselineRuntime:sourceToBaseline(v.topSource),sourceLength:distance(v.bottomSource,v.topSource),residualDeg:r?.residuals[i]?.angleDeg??null})),solver:r?{upBaselineRuntime:r.up,tiltDeg:r.tiltDeg,residualStats:r.residualStats,correctionQuaternion:r.correctionQuaternion,automaticAcceptance:false}:null,previewApplied:this.previewApplied,passQuestion:'Do at least three independently chosen real-world vertical references agree closely enough, and does the reversible level preview visibly correct the scan without obvious over-correction?'};
  }

  async copyEvidence(){ const text=JSON.stringify(this.evidence(),null,2); try{await navigator.clipboard.writeText(text);const old=this.ui.copy.textContent;this.ui.copy.textContent='Skopiowano';setTimeout(()=>this.ui.copy.textContent=old,1400);}catch{const blob=new Blob([text],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='w0-2-gravity-evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),0);} }

  update(){ this.markers.update(); for(const r of this.verticals)if(r.bottomMarker.enabled&&r.topMarker.enabled)this.app.drawLine(r.bottomMarker.getPosition(),r.topMarker.getPosition(),LINE_COLOR,false); }
}
