/** Remove only proven, horizontally coplanar covered roof cap portions.
 * Building coordinates, facade vertices, total height and outer bounds are unchanged.
 * Pure recipe transform, before merging. No depth-test override or blanket offset.
 */
const BOX_VERTICES=[-.5,-.5,-.5,.5,-.5,-.5,.5,-.5,.5,-.5,-.5,.5,-.5,.5,-.5,.5,.5,-.5,.5,.5,.5,-.5,.5,.5];
const BOX_INDICES=[0,1,2,0,2,3,4,7,6,4,6,5,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0];
const EPS=1e-7;
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
function signedArea(p){let a=0;for(let i=0;i<p.length;i++)a+=cross(p[i],p[(i+1)%p.length]);return a/2;}
function halfPlane(poly,axis,value,keepGreater){const out=[];if(!poly.length)return out;let s=poly.at(-1),ds=(s[axis]-value)*(keepGreater?1:-1);for(const e of poly){const de=(e[axis]-value)*(keepGreater?1:-1),si=ds>=-EPS,ei=de>=-EPS;if(si!==ei){const t=ds/(ds-de);out.push([s[0]+(e[0]-s[0])*t,s[1]+(e[1]-s[1])*t]);}if(ei)out.push(e);s=e;ds=de;}return out;}
export function subtractRectangle(triangle,[x0,z0,x1,z1]){
 let remaining=triangle;const outside=[];
 for(const[axis,value,greater]of[[0,x0,true],[0,x1,false],[1,z0,true],[1,z1,false]]){const part=halfPlane(remaining,axis,value,!greater);if(part.length>2&&Math.abs(signedArea(part))>EPS)outside.push(part);remaining=halfPlane(remaining,axis,value,greater);if(remaining.length<3)break;}
 return{outside,removedArea:Math.abs(signedArea(remaining))};
}
const axisAligned=p=>p.rotation.every(v=>Math.abs(v)<1e-9);
function boxMask(p){if(p.geometry.type!=='box'||!axisAligned(p))return null;const[x,y,z]=p.position,[w,h,d]=p.scale;return{top:y+h/2,rect:[x-w/2,z-d/2,x+w/2,z+d/2],label:p.label};}
export function removeCoveredTopCaps(part,masks){
 if(!axisAligned(part)||!['box','mesh'].includes(part.geometry.type))return{part,removedArea:0,removedTriangles:0};
 const source=part.geometry.type==='box'?{type:'mesh',vertices:BOX_VERTICES,indices:BOX_INDICES,flatShading:true}:part.geometry;
 const vertices=[...source.vertices],indices=[],[px,py,pz]=part.position,[sx,sy,sz]=part.scale;let removedArea=0,removedTriangles=0;
 for(let i=0;i<source.indices.length;i+=3){const ix=source.indices.slice(i,i+3),v=ix.map(j=>[px+source.vertices[j*3]*sx,py+source.vertices[j*3+1]*sy,pz+source.vertices[j*3+2]*sz]);
  const y=v[0][1],up=(v[1][2]-v[0][2])*(v[2][0]-v[0][0])-(v[1][0]-v[0][0])*(v[2][2]-v[0][2]);
  const eligible=Math.max(...v.map(p=>p[1]))-Math.min(...v.map(p=>p[1]))<EPS&&up>EPS?masks.filter(m=>Math.abs(m.top-y)<1e-5):[];
  if(!eligible.length){indices.push(...ix);continue;}
  let pieces=[v.map(p=>[p[0],p[2]])],removed=0;
  for(const mask of eligible){const next=[];for(const piece of pieces){const r=subtractRectangle(piece,mask.rect);removed+=r.removedArea;next.push(...r.outside);}pieces=next;}
  if(removed<EPS){indices.push(...ix);continue;}
  removedArea+=removed;removedTriangles++;
  for(const poly of pieces){for(let j=1;j<poly.length-1;j++){const points=[poly[0],poly[j],poly[j+1]];if(Math.abs(signedArea(points))<EPS)continue;const b=vertices.length/3;for(const[x,z]of points)vertices.push((x-px)/sx,(y-py)/sy,(z-pz)/sz);indices.push(b,b+1,b+2);}}
 }
 if(!removedTriangles)return{part,removedArea:0,removedTriangles:0};
 return{part:{...part,geometry:{...source,vertices,indices}},removedArea,removedTriangles};
}
export function prepareRoofSurfaceOwnership(recipe,{enabled=true}={}){
 if(!enabled)return recipe;
 const masks=recipe.parts.filter(p=>['tower setback terrace rim','podium roof slab','recessed crown roof'].includes(p.label)).map(boxMask).filter(Boolean);
 const eligible=new Set(['faceted main tower envelope','retail podium rear structural core','tower vertical curtain-wall fin','tower side vertical fin','subtle canted rounded-corner facade section']);
 const audit=[];
 recipe.parts=recipe.parts.map(p=>{if(!eligible.has(p.label))return p;const result=removeCoveredTopCaps(p,masks);if(result.removedTriangles)audit.push({label:p.label,material:p.material,removedOriginalTriangles:result.removedTriangles,removedAreaM2:result.removedArea});return result.part;});
 // The last B section-edge was a full silver slab covering its recessed roof.
 // Keep the identical outer box extents and height, but give the rim an opening.
 if(recipe.parts.some(p=>p.label==='recessed crown roof')){
  recipe.parts=recipe.parts.flatMap(p=>{if(p.label!=='thin section edge'||Math.abs(p.position[1]-268)>1e-7||p.geometry.type!=='box'||!axisAligned(p))return[p];const[x,y,z]=p.position,[w,h,d]=p.scale,t=.35;const parts=[[-(w-t)/2,0,t,d],[(w-t)/2,0,t,d],[0,-(d-t)/2,w-2*t,t],[0,(d-t)/2,w-2*t,t]].map(([dx,dz,ww,dd])=>({...p,position:[x+dx,y,z+dz],scale:[ww,h,dd],label:'B crown section-edge perimeter with open roof centre'}));audit.push({label:p.label,operation:'full silver cap to four perimeter bars',outerWidth:w,outerDepth:d,height:h,opening:[w-2*t,d-2*t]});return parts;});
 }
 recipe.metadata={...recipe.metadata,roofSurfaceOwnership:{mode:'single proven surface owner',changedParts:audit.length,removedAreaM2:audit.reduce((n,a)=>n+(a.removedAreaM2||0),0),audit,limitations:'Targeted source-level duplicate cap removal; near-separated rims/paint, shadow precision and browser temporal behavior are separate.'}};
 return recipe;
}
