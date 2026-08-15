const EPS = 1e-9;
const RAD2DEG = 180 / Math.PI;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const length = (v) => Math.hypot(v[0], v[1], v[2]);
const normalize = (v) => { const len=length(v); return len>EPS?scale(v,1/len):null; };

export function angleDeg(a,b){ const na=normalize(a),nb=normalize(b); if(!na||!nb)return Number.NaN; return Math.acos(clamp(dot(na,nb),-1,1))*RAD2DEG; }
export function axisAngleDeg(a,b){ const d=angleDeg(a,b); return Number.isFinite(d)?Math.min(d,180-d):Number.NaN; }

export function rotationBetween(from,to){
  const a=normalize(from),b=normalize(to); if(!a||!b)return[0,0,0,1]; const d=clamp(dot(a,b),-1,1);
  if(d<-0.999999){ let axis=normalize(cross(a,[1,0,0])); if(!axis)axis=normalize(cross(a,[0,1,0])); if(!axis)axis=[0,0,1]; return[axis[0],axis[1],axis[2],0]; }
  const c=cross(a,b),s=Math.sqrt((1+d)*2),inv=1/Math.max(EPS,s),q=[c[0]*inv,c[1]*inv,c[2]*inv,s*0.5],ql=Math.hypot(...q)||1; return q.map(v=>v/ql);
}
export function rotateVectorByQuat(v,q){ const[qx,qy,qz,qw]=q,qv=[qx,qy,qz],t=scale(cross(qv,v),2); return add(add(v,scale(t,qw)),cross(qv,t)); }

function covarianceMatrix(dirs){ const m=[[0,0,0],[0,0,0],[0,0,0]]; for(const v of dirs)for(let r=0;r<3;r++)for(let c=0;c<3;c++)m[r][c]+=v[r]*v[c]; return m; }
function multiply(m,v){ return[m[0][0]*v[0]+m[0][1]*v[1]+m[0][2]*v[2],m[1][0]*v[0]+m[1][1]*v[1]+m[1][2]*v[2],m[2][0]*v[0]+m[2][1]*v[1]+m[2][2]*v[2]]; }
function dominantAxis(dirs){
  const m=covarianceMatrix(dirs),basis=[[1,0,0],[0,1,0],[0,0,1]]; let axis=basis.map(v=>({v,energy:dot(v,multiply(m,v))})).sort((a,b)=>b.energy-a.energy)[0].v;
  for(let i=0;i<48;i++){ const n=normalize(multiply(m,axis)); if(!n)break; axis=n; }
  const rayleigh=dot(axis,multiply(m,axis)),trace=m[0][0]+m[1][1]+m[2][2]; return{axis,coherence:trace>EPS?rayleigh/trace:0};
}
function orientAxis(axis,dirs){
  let agree=0,reverse=0; for(const d of dirs){ if(dot(d,axis)>=0)agree++; else reverse++; }
  let up=axis;
  if(reverse>agree){up=scale(axis,-1);[agree,reverse]=[reverse,agree];}
  else if(reverse===agree&&dot(axis,[0,1,0])<0)up=scale(axis,-1);
  return{up,agreeCount:agree,reversedCount:reverse,agreeFraction:dirs.length?agree/dirs.length:0,voteMargin:agree-reverse,method:agree===reverse?'BASELINE_Y_TIE_BREAK':'MAJORITY_BOTTOM_TO_TOP'};
}
function stats(values){ if(!values.length)return{meanDeg:NaN,rmsDeg:NaN,medianDeg:NaN,maxDeg:NaN}; const s=[...values].sort((a,b)=>a-b),mean=values.reduce((a,b)=>a+b,0)/values.length,rms=Math.sqrt(values.reduce((a,b)=>a+b*b,0)/values.length),mid=Math.floor(s.length/2),median=s.length%2?s[mid]:(s[mid-1]+s[mid])*0.5; return{meanDeg:mean,rmsDeg:rms,medianDeg:median,maxDeg:s.at(-1)}; }

export function solveGravity(references){
  const valid=[]; for(const ref of references){ const raw=sub(ref.top,ref.bottom),referenceLength=length(raw),direction=normalize(raw); if(direction&&referenceLength>EPS)valid.push({...ref,direction,referenceLength}); }
  if(valid.length<2)return{status:'INSUFFICIENT',referenceCount:valid.length,required:2};
  const axisResult=dominantAxis(valid.map(r=>r.direction)),orientation=orientAxis(axisResult.axis,valid.map(r=>r.direction)),up=orientation.up;
  const residuals=valid.map((ref,index)=>{ const directedResidualDeg=angleDeg(ref.direction,up); return{index,axisResidualDeg:Math.min(directedResidualDeg,180-directedResidualDeg),directedResidualDeg,directionStatus:directedResidualDeg<=90?'AGREES':'REVERSED',referenceLength:ref.referenceLength}; });
  const tiltDeg=angleDeg(up,[0,1,0]);
  return{status:'CANDIDATE',referenceCount:valid.length,up,tiltDeg,axisCoherence:axisResult.coherence,residuals,axisResidualStats:stats(residuals.map(r=>r.axisResidualDeg)),directedResidualStats:stats(residuals.map(r=>r.directedResidualDeg)),directionConsensus:{agreeCount:orientation.agreeCount,reversedCount:orientation.reversedCount,agreeFraction:orientation.agreeFraction,voteMargin:orientation.voteMargin,method:orientation.method},correctionQuaternion:rotationBetween(up,[0,1,0]),automaticAcceptance:false};
}
