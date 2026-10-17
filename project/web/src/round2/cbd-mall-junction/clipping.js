/** Split existing ribbons only where a bounded junction mask intersects them.
 * Original source segment indices and UV stations are retained. Mask boundaries
 * are closed: a coincident/tangent segment is removed rather than z-fighting.
 */
import {pointInRing,distanceToSegment} from '../../geo.js';
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
function insideClosed(p,poly){return pointInRing(p[0],p[1],poly)||poly.some((a,i)=>distanceToSegment(p[0],p[1],a,poly[(i+1)%poly.length])<=1e-8);}
export function clippedLineSegments(points,polygons=[]){
 const out=[];let distance=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],v=[b[0]-a[0],b[1]-a[1]],length=Math.hypot(...v);if(length<1e-8)continue;
  const cuts=[0,1];
  for(const polygon of polygons)for(let j=0;j<polygon.length;j++){
   const c=polygon[j],d=polygon[(j+1)%polygon.length],w=[d[0]-c[0],d[1]-c[1]],den=cross(v,w),ca=[c[0]-a[0],c[1]-a[1]];
   if(Math.abs(den)<1e-12){if(Math.abs(cross(ca,v))<1e-9){for(const p of [c,d]){const t=((p[0]-a[0])*v[0]+(p[1]-a[1])*v[1])/(length*length);if(t>1e-9&&t<1-1e-9)cuts.push(t);}}continue;}
   const t=cross(ca,w)/den,u=cross(ca,v)/den;if(t>1e-9&&t<1-1e-9&&u>=-1e-9&&u<=1+1e-9)cuts.push(t);
  }
  cuts.sort((a,b)=>a-b);
  for(let j=1;j<cuts.length;j++){
   const t0=cuts[j-1],t1=cuts[j];if(t1-t0<1e-8)continue;const mid=(t0+t1)/2,p=[a[0]+v[0]*mid,a[1]+v[1]*mid];if(polygons.some(poly=>insideClosed(p,poly)))continue;
   out.push({a:[a[0]+v[0]*t0,a[1]+v[1]*t0],b:[a[0]+v[0]*t1,a[1]+v[1]*t1],startDistance:distance+length*t0,endDistance:distance+length*t1,segmentIndex:i-1,t0,t1});
  }distance+=length;
 }return out;
}
/** Exact original strip side vertices, interpolated only where a mask cuts it. */
export function clippedStrip(batch,points,width,y,color,polygons){
 if(points.length<2)return;const sides=[];
 for(let i=0;i<points.length;i++){const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];let dx=next[0]-prev[0],dz=next[1]-prev[1],l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const a=[points[i][0]-dz*width/2,points[i][1]+dx*width/2],b=[points[i][0]+dz*width/2,points[i][1]-dx*width/2];sides.push([[a[0],typeof y==='function'?y(...a):y,a[1]],[b[0],typeof y==='function'?y(...b):y,b[1]]]);}
 const mix=(a,b,t)=>t===0?a:t===1?b:a.map((v,i)=>v+(b[i]-v)*t);
 for(const p of clippedLineSegments(points,polygons)){const a=sides[p.segmentIndex],b=sides[p.segmentIndex+1];batch.quad(mix(a[0],b[0],p.t0),mix(a[0],b[0],p.t1),mix(a[1],b[1],p.t1),mix(a[1],b[1],p.t0),color,typeof y==='function'?null:[0,1,0]);}
}
export function segmentRectangle(a,b,halfWidth){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l*halfWidth,nz=dx/l*halfWidth;return[[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]];}
