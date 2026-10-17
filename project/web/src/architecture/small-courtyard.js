/** Compact photo-informed courtyard typologies. Individual plots remain inferred. */
import{Recipe,GABLE_ROOF,seededRandom}from'./geometry.js';
const LAYOUTS={'three-sided':'three_sided','four-sided':'four_sided','short-south':'short_south',three_sided:'three_sided',sanheyuan:'three_sided',four_sided:'four_sided',siheyuan:'four_sided',short_south:'short_south',short_south_with_wall:'short_south'};
function hall(r,w,d,h,x,z,rotation,far,detail){
 const q=new Recipe('Small courtyard hall'),rise=Math.min(h*.31,d*.29),wall=h-rise;
 q.box('greyBrick',0,wall/2,0,w-.38,wall,d-.40,'compact courtyard grey-brick hall');
 q.add(GABLE_ROOF,'roofGrey',[0,wall,0],[w,rise,d],[0,0,0],'compact courtyard complete grey-tile roof');
 if(!far){
  q.box('roofGreyRidge',0,h+.025,0,w*.91,.05,.15,'compact courtyard ridge');
  q.box('paintedWood',0,wall-.09,d/2-.12,w-.22,.16,.17,'compact courtyard deep dark eave');
  const bays=Math.max(2,Math.min(6,Math.round(w/2.5))),bw=(w-.65)/bays;
  for(let i=0;i<bays;i++){const xx=-(w-.65)/2+(i+.5)*bw,door=i===Math.floor(bays/2);
   q.box(door?'vermilionDark':'shopGlass',xx,door?wall*.40:wall*.50,d/2-.17,bw*.63,wall*(door?.75:.43),.055,door?'recessed inward-facing courtyard door':'inward-facing courtyard window');
   if(detail>0&&!door){q.box('paintedWood',xx,wall*.50,d/2-.12,.065,wall*.44,.07,'fine courtyard window lattice');q.box('paintedWood',xx,wall*.50,d/2-.12,bw*.63,.065,.07,'fine courtyard window lattice');}
   if(door)q.box('stoneDark',xx,.065,d/2-.01,bw*.80,.13,.43,'courtyard doorway threshold');
  }
 }
 r.merge(q,[x,0,z],rotation);
}
export function smallCourtyard(o={}){
 const layout=LAYOUTS[o.courtyardLayout];if(!layout)throw new Error('courtyardLayout must be three_sided, four_sided or short_south');
 const w=Math.max(12,o.width??18),d=Math.max(14,o.depth??22),h=Math.max(3.2,o.height??5.8),far=o.lod==='silhouette'||o.detail===-1,detail=far?0:Math.max(0,Math.min(2,o.detail??1)),random=seededRandom(o.seed??1);
 const northD=Math.min(6.2,d*(.225+random()*.060)),sideD=Math.min(4.6,w*(.205+random()*.045)),southD=layout==='three_sided'?Math.min(3.5,d*.18):Math.min(4.5,d*(.18+random()*.035)),sideL=d-northD-southD-.42,sideZ=(northD-southD)/2;
 const wingPlan=[];
 const r=new Recipe('Compact '+layout+' Beijing courtyard',{family:'hutong',courtyardLayout:layout,width:w,depth:d,height:h,detail,lod:far?'silhouette':'detailed',seed:o.seed??1,approx:true,openCourtyard:true,footprintConvention:'Roof outside dimensions and perimeter walls stay inside supplied width/depth; no external nonuniform scaling',placementAccuracy:'Inferred small courtyard typology, not a surveyed parcel or named household',sourceContext:'Photo-informed Shichahai courtyard density; placement must be supplied by the main geographic planner'});
 hall(r,w-.24,northD,h,0,-d/2+northD/2,0,far,detail);
 // Unequal wing lengths and occasional narrow service gaps stay inside the same plot.
 const splitSide=random()<.28?(random()<.5?-1:1):0;
 for(const side of[-1,1]){
  const shorten=.12+random()*.16,wingL=sideL*(1-shorten),shift=(random()-.5)*(sideL-wingL)*.6,cy=sideZ+shift,hh=h*(.73+random()*.14),x=side*(w/2-sideD/2),rot=side<0?Math.PI/2:-Math.PI/2;
  if(side===splitSide&&wingL>7.2){const gap=1.15+random()*.55,a=(wingL-gap)*(.44+random()*.12),b=wingL-gap-a;hall(r,a,sideD,hh,x,cy-wingL/2+a/2,rot,far,detail);hall(r,b,sideD,hh*.91,x,cy+wingL/2-b/2,rot,far,detail);wingPlan.push({side,length:wingL,gapMetres:gap,centerZ:cy});}
  else{hall(r,wingL,sideD,hh,x,cy,rot,far,detail);wingPlan.push({side,length:wingL,gapMetres:0,centerZ:cy});}
 }
 if(layout==='four_sided')hall(r,w*(.66+random()*.08),southD,h*(.65+random()*.08),-w*.08,d/2-southD/2,Math.PI,far,detail);
 else if(layout==='short_south')hall(r,w*(.43+random()*.10),southD,h*(.61+random()*.10),-w*.18,d/2-southD/2,Math.PI,far,detail);
 const wallH=Math.min(1.85,h*.35),gateW=Math.min(2.4,w*.14),gateX=w*.36,gateLeft=gateX-gateW/2,gateRight=gateX+gateW/2,wallZ=d/2-.14;
 r.box('greyBrick',(-w/2+gateLeft)/2,wallH/2,wallZ,gateLeft+w/2,wallH,.28,'south courtyard wall left of real opening');
 r.box('greyBrick',(gateRight+w/2)/2,wallH/2,wallZ,w/2-gateRight,wallH,.28,'south courtyard wall right of real opening');
 for(const side of[-1,1])r.box('greyBrick',side*(w/2-.14),wallH/2,.02,.28,wallH,d-.28,'continuous low courtyard perimeter wall');
 const gateH=Math.min(2.45,h*.48),gateRoofD=1.32,gateRoofW=Math.min(gateW+.58,w-2*gateX);
 r.box('paintedWood',gateX,gateH-.11,d/2-.48,gateW,.22,.35,'open courtyard gate lintel');
 r.add(GABLE_ROOF,'roofGrey',[gateX,gateH,d/2-gateRoofD/2],[gateRoofW,.53,gateRoofD],[0,0,0],'low grey-tile courtyard gate roof');
 for(const x of[gateLeft-.09,gateRight+.09])r.box('greyBrickDark',x,gateH/2,d/2-.47,.18,gateH,.42,'courtyard entrance brick jamb');
 if(!far){
  // Door leaves stand against the inside jambs, keeping the actual entrance visibly open.
  for(const sign of[-1,1])r.box('vermilionDark',gateX+sign*(gateW/2-.12),gateH*.44,d/2-.85,.10,gateH*.84,.72,'open inward-folded courtyard timber gate');
  for(const side of[-1,1])r.box('roofGrey',side*(w/2-.14),wallH+.055,.02,.28,.11,d-.28,'narrow grey-tile perimeter wall coping');
  r.box('roofGrey',(-w/2+gateLeft)/2,wallH+.055,wallZ,gateLeft+w/2,.11,.28,'south wall grey coping');
  r.box('roofGrey',(gateRight+w/2)/2,wallH+.055,wallZ,w/2-gateRight,.11,.28,'south wall short grey coping');
 }
 const innerW=Math.max(2,w-sideD*2-.24),innerD=Math.max(2,d-northD-southD-.32);
 r.box('paving',0,.025,sideZ,innerW,.05,innerD,'visible open-air inner courtyard paving');
 r.metadata.wingPlan=wingPlan;r.metadata.northHallDepth=northD;r.metadata.courtyardPlantingSuggestion={pattern:['open paved courtyard','small off-centre tree','potted planting by a wall','vine shade beside wing'][(o.seed??1)%4],accuracy:'Optional illustrative court life; not a surveyed tree inventory'};
 r.metadata.entrance={position:[gateX,0,d/2],normal:[0,0,1],width:gateW};r.metadata.openCourtyardBounds=[-innerW/2,sideZ-innerD/2,innerW/2,sideZ+innerD/2];
 return r;
}
