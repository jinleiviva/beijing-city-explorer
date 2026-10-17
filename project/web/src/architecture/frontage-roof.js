/** Low-cost roof/frontage patches on retained mapped waterfront building volumes. */
import{GABLE_ROOF,loftGeometry}from'./geometry.js';
const BACK_BOX=loftGeometry([{y:-.5,points:[[-.5,-1],[.5,-1],[.5,0],[-.5,0]]},{y:.5,points:[[-.5,-1],[.5,-1],[.5,0],[-.5,0]]}]);
const SLOPE={type:'mesh',vertices:[-.5,0,0,.5,0,0,.5,1,-1,-.5,1,-1,-.5,-.07,0,.5,-.07,0,.5,.93,-1,-.5,.93,-1],indices:[0,1,2,0,2,3,4,7,6,4,6,5,0,4,5,0,5,1,3,2,6,3,6,7,0,3,7,0,7,4,1,5,6,1,6,2]};
const FRONT_GABLE={type:'mesh',vertices:GABLE_ROOF.vertices.flatMap((_,i,a)=>i%3?[]:[a[i+2],a[i+1],-a[i]-.5]),indices:GABLE_ROOF.indices};
export function addMappedHeritageRoof(r,o,w,d,h,variant){
 if(!o.sourceId||o.additiveRoofTreatment===false)return;
 const front=d/2,reach=Math.min(3.0,d*.42),rise=Math.min(.92,.13*h),anchor=[0,h+.02,front-.04],gable=variant===3;
 r.add(gable?FRONT_GABLE:SLOPE,'roofGrey',anchor,[w-.08,rise,reach],[0,0,0],gable?'additive shallow front-gabled grey-tile roof':'additive inward-sloping grey-tile roof apron');
 r.box('paintedWood',0,h-.035,front-.11,w-.06,.25,.18,'additive thick dark waterfront eave fascia');
 for(const side of[-1,1])r.add(BACK_BOX,'roofGreyRidge',[side*(w/2-.12),h+.02,front-.04],[.15,.13,reach],[0,0,0],'additive short waterfront roof-edge return');
 if(!gable){
  const verts=[],indices=[],n=Math.max(4,Math.min(9,Math.round(w/1.15)));
  for(let i=1;i<n;i++){const x=-.5+i/n,t=.026/(w-.08),b=verts.length/3;verts.push(x-t,.035,0,x+t,.035,0,x+t,1.035,-1,x-t,1.035,-1);indices.push(b,b+1,b+2,b,b+2,b+3);}
  const part={type:'mesh',vertices:verts,indices};r.add(part,'roofGreyLight',anchor,[w-.08,rise,reach],[0,0,0],'additive coarse waterfront roof tile roll');r.parts.at(-1).castShadow=false;
 }
 const railing=o.waterfrontRailing??(h>=6.0&&(variant===1||variant===3));
 if(railing){
  const rw=Math.min(4.5,w*.44),x=(variant===1?-1:1)*w*.22,floor=h*.53,railH=.92;
  r.add(BACK_BOX,'stoneDark',[x,floor,front-.08],[rw+.16,.12,.85],[0,0,0],'additive shallow upper waterfront railing ledge');
  r.box('shopGlass',x,floor+1.0,front-.10,rw*.92,1.6,.08,'additive dark upper-storey opening behind railing');
  for(const y of[floor+.15,floor+railH])r.box('paintedWood',x,y,front-.025,rw,.07,.045,'additive upper waterfront railing horizontal');
  const posts=Math.max(4,Math.round(rw/.58));for(let i=0;i<=posts;i++)r.box('paintedWood',x-rw/2+i*rw/posts,floor+railH/2,front-.025,.055,railH,.045,'additive upper waterfront railing vertical');
 }
 r.metadata.additiveRoofTreatment={sourceId:o.sourceId,inwardDepthMetres:reach,maximumApproximateAdditionMetres:rise+.07,upperRailing:railing,retainsMappedVolume:true,accuracy:'Photo-informed shallow roof-edge and partial balcony-screen treatment. Individual roof, floor count and railing positions are not surveyed.',reference:'https://s.visitbeijing.com.cn/gallery/25933'};
}
