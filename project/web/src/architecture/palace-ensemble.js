/** Real OSM-positioned Palace Museum compound, counted as one landmark. */
import {Recipe,GABLE_ROOF,HIP_ROOF} from './geometry.js';
import {buildingRecipe} from './buildings.js';
import {PALACE_LAYOUT} from './palace-layout.js';
import {addPalaceUltraLow} from './palace-ultralow.js';
const MAIN={
 '太和殿':[64,37,35.05],'中和殿':[25,25,21],'保和殿':[50,25,29],
 '乾清宫':[46,28,26],'交泰殿':[18,18,20],'坤宁宫':[40,22,22],
 '太和门':[54,24,23],'乾清门':[32,18,16],'神武门':[44,22,31],
 '东华门':[34,20,25],'西华门':[34,20,25],
};
function simpleHall(r,b,{full=false,main=false}={}) {
 const w=b.width,d=b.depth,h=b.height,rise=Math.min(h*.34,d*.33),wall=h-rise,roof=main||b.roof==='gold'?'roofGold':'roofGrey';
 const q=new Recipe(b.name||'mapped subsidiary palace hall');
 q.box(roof==='roofGold'?'vermilionDark':'greyBrick',0,wall/2,0,w*.92,wall,d*.87,'mapped palace wall volume');
 q.add(roof==='roofGold'?HIP_ROOF:GABLE_ROOF,roof,[0,wall,0],[w,rise,d],[0,0,0],'mapped palace roof silhouette');
 if(full) {
  q.box('stoneDark',0,.3,0,w*.96,.6,d*.91,'mapped palace stone footing');
  q.box(roof==='roofGold'?'greenBeam':'timber',0,wall-.20,0,w*.95,.40,d*.94,'mapped palace painted eave');
  q.box(roof==='roofGold'?'roofGoldLight':'roofGreyRidge',0,h+.05,0,w*(roof==='roofGold'?.55:.98),.10,.16,'mapped palace roof ridge');
  if(b.area>260) {
   q.box('timber',0,wall*.50,d*.44,w*.76,wall*.55,.12,'mapped palace dark window strip');
   const n=Math.min(9,Math.max(3,Math.round(w/6)));
   for(let i=0;i<=n;i++)q.cylinder('vermilion',-w*.43+i*w*.86/n,wall*.48,d*.45,.13,wall*.9,'mapped palace front column',8);
  }
 }
 r.merge(q,[b.x,0,b.z],b.rotation);
}
function principal(r,b,level) {
 const [w,d,h]=MAIN[b.name],angle=['东华门','西华门'].includes(b.name)?Math.PI/2+.025:.025;
 if(level==='far') {
  simpleHall(r,{...b,width:w,depth:d,height:h,rotation:angle},{main:true});
  return;
 }
 const q=buildingRecipe('palace',{width:w,depth:d,height:h,detail:level==='near'?1:0,variant:w<30?1:0});
 q.parts.forEach(p=>p.label=`${b.name}: ${p.label}`);r.merge(q,[b.x,0,b.z],angle);
}

export function palaceEnsemble(o={}) {
 const far=o.lod==='silhouette',level=far?'far':o.detail===0?'middle':'near';
 const r=new Recipe('故宫建筑群 · real-footprint Palace Museum ensemble',{mappedRoofCount:PALACE_LAYOUT.buildings.length,mappedWallCount:PALACE_LAYOUT.walls.length,layoutOriginWGS84:PALACE_LAYOUT.originWGS84,layoutAccuracy:PALACE_LAYOUT.accuracy,sourceAttribution:PALACE_LAYOUT.source});
 // Actual corner-platform positions define an open, slightly rotated palace court.
 const corners=[[-377.78,-452.88],[342.92,-487.58],[378.52,448.47],[-344.34,482.82]];
 r.add({type:'mesh',vertices:corners.flatMap(([x,z])=>[x,.06,z]),indices:[0,2,1,0,3,2]},'paving',[0,0,0],[1,1,1],[0,0,0],'mapped palace court ground');
 const mains=PALACE_LAYOUT.buildings.filter(b=>MAIN[b.name]);
 for(const b of mains)principal(r,b,level);
 let secondary=PALACE_LAYOUT.buildings.filter(b=>!MAIN[b.name]);
 // All mapped side halls remain present at everyLOD. Far geometry has only
 //14triangles per hall, merged into4material meshes rather than887object groups.
 if(far)addPalaceUltraLow(r,secondary);
 else {
  const ranked=secondary.sort((a,b)=>b.area-a.area),fullCount=o.detail===0?290:ranked.length;
  for(const b of ranked.slice(0,fullCount)) {
   const roof=(Math.abs(b.x)<245&&b.z<145)||b.roof==='gold'?'gold':'grey';
   simpleHall(r,{...b,roof},{full:level==='near'});
  }
  if(o.detail===0)addPalaceUltraLow(r,ranked.slice(fullCount));
 }
 const walls=far?PALACE_LAYOUT.walls.filter(b=>b.width>55||b.name.includes('城墙')).slice(0,75):PALACE_LAYOUT.walls;
 for(const b of walls) {
  const outer=b.name.includes('城墙');
  r.box(outer?'vermilionDark':'vermilion',b.x,b.height/2,b.z,b.width,b.height,b.depth,outer?'mapped palace perimeter wall':'mapped courtyard separating wall',b.rotation);
  if(!far&&b.depth<12)r.add(GABLE_ROOF,outer?'roofGold':'roofGrey',[b.x,b.height,b.z],[b.width,.45,b.depth+.30],[0,b.rotation,0],'mapped palace wall tile coping');
 }
 // Corner towers sit on their mapped masonry platforms, not arbitrary site corners.
 for(const [x,z] of corners) {
  if(far) {
   r.box('vermilionDark',x,15,z,18,10,18,'corner tower timber drum');
   r.add(HIP_ROOF,'roofGold',[x,20,z],[26,5.5,22],[0,.025,0],'corner tower upper swept roof');
   r.add(HIP_ROOF,'roofGold',[x,16.8,z],[24,3.5,29],[0,.025,0],'corner tower cross roof');
  } else {
   const q=buildingRecipe('palace',{width:23,depth:23,height:17.5,detail:Math.min(1,o.detail)});r.merge(q,[x,10,z],.025);
   r.add(HIP_ROOF,'roofGold',[x,17.4,z],[18,3.4,31],[0,.025,0],'corner tower perpendicular roof wing');
  }
 }
 // Meridian Gate, a researched U-shaped ensemble. Position refined separately
 // from the gate's large compound outline; subsidiary halls are never extra IDs.
 const gx=15.21,gz=467.58,angle=.026049;
 const gate=new Recipe('午门 · Meridian Gate context');
 gate.box('vermilionDark',0,6,0,138,12,29,'Meridian Gate broad red gate platform');
 if(far) {
  simpleHall(gate,{x:0,z:0,width:60.05,depth:25,height:23.6,rotation:0,roof:'gold'},{main:true});
  // Raise the simplified roof/upper hall by the platform height.
  for(let i=1;i<gate.parts.length;i++)gate.parts[i].position[1]+=12;
 } else gate.merge(buildingRecipe('palace',{width:60.05,depth:25,height:23.6,detail:Math.min(1,o.detail)}),[0,12,0]);
 for(const side of [-1,1]) {
  gate.box('vermilionDark',side*51.5,6,42,17,12,84,'Meridian Gate projecting arm');
  if(far) {
   gate.add(HIP_ROOF,'roofGold',[side*51.5,23,84],[25,5,23],[0,0,0],'Meridian Gate projecting corner pavilion');
   gate.add(HIP_ROOF,'roofGold',[side*51.5,24,0],[33,4,24],[0,0,0],'Meridian Gate side pavilion');
  } else {
   gate.merge(buildingRecipe('palace',{width:25,depth:23,height:16,detail:0}),[side*51.5,12,84]);
   gate.merge(buildingRecipe('palace',{width:32,depth:23,height:17,detail:0}),[side*51.5,12,0]);
  }
 }
 r.merge(gate,[gx,0,gz],angle);
 r.metadata.wumenPositionAccuracy='Main hall and four pavilions inferred from OSM U-shaped base and DPM official arrangement, approximately 5–10 m uncertainty; dimensions 60.05 × 25 m and total height35.6 m from official sources.';
 r.metadata.visibleMappedRoofs=mains.length+secondary.length;r.metadata.layoutLevel=level;
 return r;
}
