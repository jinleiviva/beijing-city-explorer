import {Recipe,loftGeometry} from './geometry.js';
import {WANGJING_TOWERS} from './wangjing-layout.js';

function sampleOutline(points,count) {
 const lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%points.length][0],p[1]-points[(i+1)%points.length][1])),total=lengths.reduce((a,b)=>a+b,0);
 let out=[];
 for(let k=0;k<count;k++) {
  let d=k/count*total,j=0;
  while(j<lengths.length-1&&d>lengths[j])d-=lengths[j++];
  const a=points[j],b=points[(j+1)%points.length],t=d/lengths[j];out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
 }
 for(let pass=0;pass<2;pass++)out=out.map((p,i)=>p.map((v,k)=>(out[(i+count-1)%count][k]+v*2+out[(i+1)%count][k])/4));
 // Ring order must face outward with Y-up loft geometry.
 const area=out.reduce((sum,p,i)=>{const q=out[(i+1)%count];return sum+p[0]*q[1]-q[0]*p[1];},0);
 return area<0?out.reverse():out;
}

/** Real footprint directions and unequal 211/173/129 m-long leaf-shaped bases.
 * Upper cross-sections and peak offsets are a photo-informed approximation.
 */
export function wangjingSohoRefined(o) {
 const r=new Recipe('望京SOHO · Wangjing SOHO'),far=o.lod==='silhouette',segments=far?28:o.detail>0?64:40,rows=far?12:26;
 for(const tower of WANGJING_TOWERS) {
  const outline=sampleOutline(tower.points,segments),a=tower.longAxis,cs=Math.cos(a),sn=Math.sin(a),[cx,cz]=tower.center;
  const ring=(t,expand=0,y=t*tower.height)=>({y,points:outline.map(([x,z])=>{
   const u=x*cs+z*sn,v=-x*sn+z*cs;
   const su=.10+.90*Math.pow(1-t,.65),sv=.10+.90*Math.pow(1-t,.42);
   const offset=tower.peakOffset*Math.pow(t,1.2),U=u*su+offset,V=v*sv;
   const xx=U*cs-V*sn,zz=U*sn+V*cs,len=Math.hypot(xx-offset*cs,zz-offset*sn)||1;
   return[cx+xx+(xx-offset*cs)/len*expand,cz+zz+(zz-offset*sn)/len*expand];
  })});
  const body=[];for(let i=0;i<=rows;i++)body.push(ring(i/rows));
  r.add(loftGeometry(body),'glass',[0,0,0],[1,1,1],[0,0,0],`${tower.id} asymmetric mapped leaf-plan glazed tower`);
  const levels=far?6:tower.floors,bandVertices=[],bandIndices=[];
  for(let i=0;i<=levels;i++) {
   const t=Math.min(.995,i/levels),y=t*tower.height,h=far?1.5:1.1;
   // Each facade ribbon follows the same non-circular footprint and shrinking
   // section as the glass. No elliptical floor disks floating through another tower.
   const band=[ring(t,.65,Math.max(0,y-h/2)),ring(t,.65,Math.min(tower.height,y+h/2))];
   const geometry=loftGeometry(band),base=bandVertices.length/3;
   bandVertices.push(...geometry.vertices);bandIndices.push(...geometry.indices.map(i=>i+base));
  }
  r.add({type:'mesh',vertices:bandVertices,indices:bandIndices},'silverFacade',[0,0,0],[1,1,1],[0,0,0],`${tower.id} merged silver aluminium floor ribbons`);
  if(!far&&o.detail>0) {
   // A sparse mullion subset; the characteristic bright horizontal facade stays dominant.
   const vertices=[],indices=[];
   for(let i=0;i<segments;i+=2)for(let j=0;j<rows;j++) {
    const p=body[j].points[i],q=body[j+1].points[i],next=body[j].points[(i+1)%segments],dx=next[0]-p[0],dz=next[1]-p[1],len=Math.hypot(dx,dz)||1,tx=dx/len*.055,tz=dz/len*.055,b=vertices.length/3;
    vertices.push(p[0]-tx,body[j].y,p[1]-tz,p[0]+tx,body[j].y,p[1]+tz,q[0]+tx,body[j+1].y,q[1]+tz,q[0]-tx,body[j+1].y,q[1]-tz);
    indices.push(b,b+1,b+2,b,b+2,b+3);
   }
   r.add({type:'mesh',vertices,indices},'glassMullion',[0,0,0],[1,1,1],[0,0,0],`${tower.id} fine curtain-wall vertical mullions`);
  }
 }
 r.metadata={referenceFeatures:['three separate mapped leaf-shaped footprints','T1 east118 m, T2 northwest127 m, T3 southwest200 m','unequal elongated floor plates','broad bright horizontal aluminium ribbons'],heightSource:'https://www.skyscrapercenter.com/complex/280',footprintSource:'data/landmark-components.geojson',upperTaperAccuracy:'Photo-informed approximation, not a measured facade survey'};
 return r;
}
