/** Three bounded, original CBD service-detail families.
 * Photos establish nearby CBD fixture types only. All stations/dimensions are
 * authored. They do not establish a parking entrance or surveyed installations.
 * Pure recipe: no renderer, scene side effects, textures, animation or lights.
 */
import {Recipe} from '../../architecture/geometry.js';
import {distanceToSegment,project} from '../../geo.js';
import {insideBuilding} from '../../spatial.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {footprintEdges} from '../../architecture/site-massing.js';
import {MALL_JUNCTION_PLAN} from '../cbd-mall-junction/plan.js';
import {MALL_VISIBLE_TREE_RECORDS} from '../cbd-mall-corner/visible-trees.js';
import {mallPlazaWalkingRoutes,mallPlazaRecipe} from '../cbd-mall-corner/plaza.js';
import {CBD_STREET_DETAIL_SCOPE} from '../cbd-street-detail/index.js';

export const CBD_SERVICE_SOURCES=Object.freeze([
 {id:'cbd-nw-parking-1706155300',url:'https://www.wayfinding.com.cn/uploads/image/202401/1706155300.jpg',supports:'Narrow dark parking direction column, white P and arrow',location:'Nearby CBD northwest district; exact source-road correspondence unverified'},
 {id:'jintong-west-utility-1706162853',url:'https://www.wayfinding.com.cn/uploads/image/202401/1706162853.jpg',supports:'Deep grey louvered municipal enclosure',location:'Jintong West Road / Guanghua Road, SOHO south entrance vicinity'},
 {id:'jintong-west-signal-1706151677',url:'https://www.wayfinding.com.cn/uploads/image/202401/1706151677.jpg',supports:'Small rectangular equipment attached to a signal arm',location:'Jintong West Road vicinity'},
]);
export const CBD_SERVICE_PLACEMENTS=Object.freeze({
 parking:Object.freeze({id:'mall-north-parking-column',x:4648.4,z:-358.1,yaw:-Math.PI/2,width:.64,depth:.18,height:3.25,baseWidth:.82,baseDepth:.34}),
 cabinet:Object.freeze({id:'mall-north-municipal-cabinet',x:4654.7,z:-359.2,yaw:-Math.PI/2,width:1.28,depth:.66,height:1.76,baseWidth:1.42,baseDepth:.80}),
 signal:Object.freeze({approach:'EB',armCenterHeight:5.75,armHeight:.14,stations:Object.freeze([.30,.69])}),
});
export const CBD_SERVICE_MATERIALS=Object.freeze({
 cbdServiceDark:{base:'metalDark',color:'#242D30',roughness:.78,metalness:.13},
 cbdServiceSteel:{base:'metalDark',color:'#535E61',roughness:.72,metalness:.20},
 cbdServiceWhite:{base:'marble',color:'#E2E4DA',roughness:.90,metalness:0},
 cbdServiceStone:{base:'stoneDark',color:'#989E98',roughness:.96,metalness:0},
});
const CAR_EXCLUSIONS=new Set(['footway','path','pedestrian','steps','cycleway']);
const box=(r,m,p,s,label,rotation=[0,0,0])=>{r.box(m,...p,...s,'CBD service detail · '+label);const part=r.parts.at(-1);part.rotation=[...rotation];part.castShadow=false;};
const world2=(p,u,v)=>[p.x+u*Math.cos(p.yaw)+v*Math.sin(p.yaw),p.z-u*Math.sin(p.yaw)+v*Math.cos(p.yaw)];
const nearestRoad=(roads,x,z)=>roads.reduce((best,r)=>{for(let i=1;i<r.points.length;i++){const gap=distanceToSegment(x,z,r.points[i-1],r.points[i])-r.width/2;if(gap<best.gap)best={gap,sourceRoadId:r.id};}return best;},{gap:Infinity,sourceRoadId:null});
const routeGap=(routes,x,z,radius)=>routes.reduce((best,q)=>{for(let i=1;i<q.points.length;i++){const gap=distanceToSegment(x,z,q.points[i-1],q.points[i])-q.width/2-radius;if(gap<best.gap)best={gap,id:q.id};}return best;},{gap:Infinity,id:null});
function mallDoorRoutes(){
 const site=CBD_CONTEXT_SITES.cwtc_mall_north,a=project(site.anchorWGS84);
 return footprintEdges(site.points).filter(e=>(e.nx<-.98||e.nz<-.98)&&e.length>25).map((e,i)=>{const t=e.nz<-.98?.39:.52,center=[a[0]+e.a[0]+(e.b[0]-e.a[0])*t,a[1]+e.a[1]+(e.b[1]-e.a[1])*t];return{id:'existing-authored-mall-door-'+i,width:3.65,points:[center,[center[0]+e.nx*9,center[1]+e.nz*9]]};});
}
/** Exact existing 70m tactile band. Additional bands can be supplied by caller. */
export function cbdServiceTactileRoutes(roads){
 const s=CBD_STREET_DETAIL_SCOPE,r=roads.find(r=>r.id===s.roadId);if(!r||r.points.length<2)throw Error('Service details need the existing tactile-strip source road');
 const [a,b]=r.points,dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),u=[dx/l,dz/l],n=[-u[1],u[0]],t=(s.startX-a[0])/u[0],start=[a[0]+u[0]*t+n[0]*9.2,a[1]+u[1]*t+n[1]*9.2];
 return[{id:'existing-guanghua-70m-tactile',points:[start,[start[0]+u[0]*s.length,start[1]+u[1]*s.length]],width:.32}];
}
function parkingRoadCue(roads,collision){
 const p=CBD_SERVICE_PLACEMENTS.parking,road=roads.find(r=>r.id==='osm-way-1147350758');
 if(!road||road.oneway!=='yes')throw Error('Parking display requires the unchanged eastbound Guanghua source road');
 let best=null,total=0;
 for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.z-a[1])*dz)/(length*length))),q=[a[0]+dx*t,a[1]+dz*t],distance=Math.hypot(p.x-q[0],p.z-q[1]);if(!best||distance<best.distance)best={distance,station:total+t*length,direction:[dx/length,dz/length]};total+=length;}
 const at=station=>{for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(station<=l)return[a[0]+(b[0]-a[0])*station/l,a[1]+(b[1]-a[1])*station/l];station-=l;}throw Error('Parking continuation leaves its mapped source road');};
 const samples=Array.from({length:13},(_,i)=>at(best.station+i*5));
 if(samples.some(([x,z])=>insideBuilding(collision,x,z,1.5)))throw Error('Parking forward cue would follow a mapped building wall');
 return{sourceRoadId:road.id,meaning:'Continue east along the existing Guanghua Road alignment. No driveway, entrance location, distance or parking access route is claimed.',directionUnit:best.direction,sourceRoadSamples:samples,checkedForwardMetres:60,mappedFootprintCorridorHalfWidth:1.5,mappedFootprintCorridorClear:true,isActionableParkingNavigation:false};
}
function knownObstacles(roads,collision,treeRecords){
 const obstacles=treeRecords.map((t,i)=>({id:'existing-tree-pit-'+i,x:t.x,z:t.z,radius:Math.SQRT2*1.66}));
 // Actual existing authored corner furniture; this is not a surveyed inventory.
 for(const [id,x,z,radius]of [['road-name-column-east',4637,-354,.53],['road-name-column-west',4584,-399,.53],['corner-hedge-east',4635,-359.3,3.1],['corner-hedge-west',4629.4,-351.6,3.6],['corner-bench-east',4635,-355.9,1.15],['corner-bench-west',4633.1,-351.6,1.15]])obstacles.push({id,x,z,radius});
 for(const p of mallPlazaRecipe(roads,collision,{quality:'low'}).metadata.placements){const radius=p.type==='hedge_and_groundcover'?Math.hypot(p.length,p.depth)/2:p.type==='bench'?1.2:1.05;obstacles.push({id:'existing-plaza-'+p.type,x:p.world[0],z:p.world[1],radius});}
 for(const p of MALL_JUNCTION_PLAN.signals)obstacles.push({id:'existing-signal-pole-'+p.approach,x:p.polePosition[0],z:p.polePosition[1],radius:.22});
 return obstacles;
}
function auditStandingPlacement(p,roads,collision,groundAt,walks,tactile,doors,obstacles){
 const radius=Math.hypot(p.baseWidth,p.baseDepth)/2,points=[[p.x,p.z],...[-1,1].flatMap(a=>[-1,1].map(b=>world2(p,a*p.baseWidth/2,b*p.baseDepth/2)))];
 const groundSamples=points.map(([x,z])=>({x,z,y:groundAt(x,z)}));
 if(!groundSamples.every(p=>Number.isFinite(p.y)))throw Error(p.id+': invalid live ground height');
 const ys=groundSamples.map(p=>p.y),baseY=Math.max(...ys),relief=baseY-Math.min(...ys);
 if(relief>.015)throw Error(p.id+': support spans uneven live surfaces; choose a new station rather than floating it');
 if(insideBuilding(collision,p.x,p.z,radius+.25))throw Error(p.id+': touches an unchanged mapped footprint');
 const road=nearestRoad(roads,p.x,p.z),roadGap=road.gap-radius,walk=routeGap(walks,p.x,p.z,radius),tactileGap=routeGap(tactile,p.x,p.z,radius),door=routeGap(doors,p.x,p.z,radius);
 const fixture=obstacles.reduce((best,q)=>{const gap=Math.hypot(p.x-q.x,p.z-q.z)-radius-q.radius;return gap<best.gap?{gap,id:q.id}:best;},{gap:Infinity,id:null});
 // Preserve the whole 3.6m procedural road-side walking ribbon, plus 0.35m.
 if(roadGap<3.95||walk.gap<.5||tactileGap.gap<1||door.gap<.5||fixture.gap<.45)throw Error(p.id+': would obstruct an existing road, walking band, tactile strip, door approach or fixture');
 return{baseY,radius,groundContact:{method:'Caller-supplied live ground sampler at center and four support corners',groundSamples,baseY,maximumSupportGap:relief,maximumAllowedGap:.015,datumIsSurveyed:false},obstacleClearance:{method:'Conservative enclosing circle against unchanged mapped polylines/footprints and explicit authored exclusions; not accessibility certification',radius,buildingMarginTest:.25,nearestRoadId:road.sourceRoadId,carriagewayGap:roadGap,roadsideWalkingRibbonWidth:3.6,roadsideWalkingRibbonGap:roadGap-3.6,plazaWalking:walk,tactile:tactileGap,doorApproach:door,knownFixture:fixture,unmappedObstaclesNotCertified:true}};
}
/** Closed extruded upward arrow, wound front +Z, back -Z; no texture/font. */
function arrowGeometry(){
 const p=[[-.043,-.23],[.043,-.23],[.043,.055],[.155,.055],[0,.235],[-.155,.055],[-.043,.055]],vertices=[],indices=[];
 for(const z of[-.009,.009])for(const[x,y]of p)vertices.push(x,y,z);
 // Concave arrow is triangulated as its stem quad and head triangle, split
 // along the head base to retain all boundary vertices without zero-area fans.
 const face=[[0,1,2],[0,2,6],[6,2,4],[2,3,4],[6,4,5]];
 for(const[a,b,c]of face){indices.push(a,c,b,7+a,7+b,7+c);}
 for(let i=0;i<7;i++){const j=(i+1)%7;indices.push(i,j,7+j,i,7+j,7+i);}
 return{type:'mesh',vertices,indices,flatShading:true};
}
function parkingColumn(p,audit){
 const r=new Recipe('One narrow parking column');
 box(r,'cbdServiceStone',[0,.055,0],[p.baseWidth,.11,p.baseDepth],'parking flush stone footing');
 box(r,'cbdServiceSteel',[0,.14,0],[.66,.12,.22],'parking thick lower socket');
 box(r,'cbdServiceDark',[0,1.72,0],[p.width,3.06,p.depth],'parking dark narrow full-depth panel');
 for(const x of[-.307,.307])box(r,'cbdServiceSteel',[x,1.72,.095],[.024,3.06,.016],'parking restrained edge return');
 // Four solid strokes form a legible original geometric P, not a logo.
 const py=2.73,pz=.095;
 box(r,'cbdServiceWhite',[-.13,py,pz],[.070,.46,.018],'parking P vertical stroke');
 for(const y of[py+.195,py-.005])box(r,'cbdServiceWhite',[.005,y,pz],[.270,.070,.018],'parking P bowl horizontal stroke');
 box(r,'cbdServiceWhite',[.105,py+.095,pz],[.070,.200,.018],'parking P bowl right stroke');
 r.add(arrowGeometry(),'cbdServiceWhite',[0,2.02,pz],[1,1,1],[0,0,0],'CBD service detail · parking original upward arrow');r.parts.at(-1).castShadow=false;
 box(r,'cbdServiceSteel',[0,1.49,.095],[.37,.025,.012],'parking separator below pictograms');
 const out=new Recipe(r.name);out.merge(r,[p.x,audit.baseY,p.z],p.yaw);return out;
}
function utilityCabinet(p,audit,fine){
 const r=new Recipe('One louvered municipal enclosure');
 box(r,'cbdServiceStone',[0,.04,0],[p.baseWidth,.08,p.baseDepth],'cabinet grounded concrete pad');
 for(const x of[-.46,.46])box(r,'cbdServiceSteel',[x,.145,0],[.13,.15,.54],'cabinet separate raised metal foot');
 box(r,'cbdServiceSteel',[0,.94,0],[1.28,1.48,.60],'cabinet deep enclosed body');
 box(r,'cbdServiceDark',[0,.98,.311],[1.10,1.27,.032],'cabinet recessed door backing');
 box(r,'cbdServiceSteel',[0,1.72,0],[1.38,.08,.70],'cabinet overhanging rain cap');
 for(const x of[-.56,.56])box(r,'cbdServiceSteel',[x,.98,.345],[.065,1.32,.038],'cabinet door frame jamb');
 for(const y of[.33,1.62])box(r,'cbdServiceSteel',[0,y,.345],[1.17,.055,.038],'cabinet door frame rail');
 const count=fine?11:7;
 for(let i=0;i<count;i++){const y=.51+i*(.92/(count-1));box(r,'cbdServiceSteel',[-.045,y,.351],[.88,.052,.095],'cabinet physical angled louver',[.24,0,0]);}
 for(const y of[.52,1.41])box(r,'cbdServiceSteel',[-.545,y,.375],[.050,.14,.050],'cabinet door hinge');
 box(r,'cbdServiceDark',[.43,.98,.374],[.035,.16,.035],'cabinet recessed lock handle');
 const out=new Recipe(r.name);out.merge(r,[p.x,audit.baseY,p.z],p.yaw);return{recipe:out,louverCount:count};
}
function signalDevices(r,groundAt){
 const config=CBD_SERVICE_PLACEMENTS.signal,f=MALL_JUNCTION_PLAN.signals.find(f=>f.approach===config.approach),[x,z]=f.polePosition,[hx,hz]=f.headPosition,groundY=groundAt(x,z);
 if(!Number.isFinite(groundY))throw Error('Signal attachment needs the same live pole ground sampler as the existing junction');
 const yaw=Math.atan2(f.headFaceUnit[0],f.headFaceUnit[1]),armLength=Math.hypot(hx-x,hz-z),placements=[];
 for(let i=0;i<config.stations.length;i++){
  const t=config.stations[i],cx=x+(hx-x)*t,cz=z+(hz-z)*t,local=new Recipe('Existing signal arm device'),isCamera=i===0;
  box(local,'cbdServiceSteel',[0,0,0],[.19,.17,.19],'signal arm clamp overlapping existing arm');
  box(local,'cbdServiceSteel',[0,.17,0],[.075,.28,.075],'signal short connected equipment bracket');
  if(isCamera){
   box(local,'cbdServiceWhite',[0,.365,.045],[.24,.19,.38],'signal rectangular camera shell',[.10,0,0]);
   box(local,'cbdServiceDark',[0,.346,.239],[.17,.13,.020],'signal non-emissive camera lens face',[.10,0,0]);
   box(local,'cbdServiceSteel',[0,.473,.053],[.285,.042,.445],'signal camera weather hood',[.10,0,0]);
  }else{
   box(local,'cbdServiceWhite',[0,.33,0],[.235,.27,.23],'signal rectangular control enclosure');
   box(local,'cbdServiceSteel',[0,.33,.120],[.19,.22,.020],'signal control panel seam');
   box(local,'cbdServiceDark',[0,.26,.134],[.06,.025,.012],'signal control latch');
  }
  r.merge(local,[cx,groundY+config.armCenterHeight,cz],yaw);
  placements.push({id:'mall-EB-arm-'+(isCamera?'camera':'control-box'),type:'signal_arm_device',subtype:isCamera?'traffic_camera':'small_control_enclosure',sourceEvidence:[CBD_SERVICE_SOURCES[2].id],placementInferred:true,sourceSignalApproach:f.approach,sourceSignalKey:f.signalKey,sourceRoadId:MALL_JUNCTION_PLAN.stopControls.find(c=>c.id==='mall-stop-'+f.approach).sourceRoadId,stationFraction:t,armAnchor:[cx,groundY+config.armCenterHeight,cz],faceUnit:[...f.headFaceUnit],yaw,downwardPitch:isCamera?.10:0,groundContact:{kind:'attached-to-existing-arm',existingPole:[x,groundY,z],addsGroundObstacle:false,samePoleGroundSampler:true},obstacleClearance:{existingArmHeight:config.armCenterHeight,clampHalfHeight:.085,existingArmHalfHeight:config.armHeight/2,verticalClampOverlap:.14,distanceAlongArmToPole:t*armLength,distanceAlongArmToHead:(1-t)*armLength,noNewPole:true,noSignalHeadCover:true},dimensions:isCamera?[.285,.51,.445]:[.235,.465,.23]});
 }
 return placements;
}

export function cbdServiceDetailsRecipe(roads,collision,groundAt,{quality='standard',treeRecords=MALL_VISIBLE_TREE_RECORDS,extraObstacles=[],extraTactileRoutes=[]}={}){
 if(!Array.isArray(roads)||!roads.length||!collision?.nearby||typeof groundAt!=='function')throw Error('Service details require actual roads, original building collision index, and live ground sampler');
 if(!['standard','std','low'].includes(quality))throw Error('Service details quality must be standard, std or low');
 const normalized=quality==='low'?'low':'standard',parkingCue=parkingRoadCue(roads,collision),carriageways=roads.filter(r=>r.y<4&&!CAR_EXCLUSIONS.has(r.class)),walks=mallPlazaWalkingRoutes(),tactile=[...cbdServiceTactileRoutes(roads),...extraTactileRoutes],doors=mallDoorRoutes(),obstacles=[...knownObstacles(roads,collision,treeRecords),...extraObstacles];
 const r=new Recipe('Bounded CBD parking, cabinet and signal-arm details',{buildings:0,quality:normalized,sourceEvidence:CBD_SERVICE_SOURCES.map(s=>({...s})),sourceIds:['osm-way-660651177',...new Set(MALL_JUNCTION_PLAN.stopControls.map(c=>c.sourceRoadId))],placementInferred:true,accuracy:'Nearby CBD photos support fixture families only. Exact stations, dimensions and counts are authored, not surveyed. The parking arrow is a typological display, not a verified parking entrance or usable navigation instruction.',noTextures:true,lightObjectsAdded:0,emissiveMaterialsAdded:0,newSignalPoles:0,noChangedRoads:true,noChangedBuildingFootprints:true,noChangedTreePositions:true,placements:[],visualReview:'Not performed; coordinate checks are not pixel acceptance.'});
 for(const [kind,p]of [['parking_column',CBD_SERVICE_PLACEMENTS.parking],['municipal_cabinet',CBD_SERVICE_PLACEMENTS.cabinet]]){
  const audit=auditStandingPlacement(p,carriageways,collision,groundAt,walks,tactile,doors,obstacles),sourceId=CBD_SERVICE_SOURCES[kind==='parking_column'?0:1].id;
  const built=kind==='parking_column'?{recipe:parkingColumn(p,audit)}:utilityCabinet(p,audit,normalized==='standard');r.merge(built.recipe);
  r.metadata.placements.push({id:p.id,type:kind,sourceEvidence:[sourceId],placementInferred:true,base:[p.x,audit.baseY,p.z],yaw:p.yaw,dimensions:[p.width,p.height,p.depth],supportDimensions:[p.baseWidth,kind==='parking_column'?.11:.08,p.baseDepth],groundContact:audit.groundContact,obstacleClearance:audit.obstacleClearance,...(kind==='parking_column'?{pictograms:{text:'P',pHeight:.46,pWidth:.305,pDepth:.018,arrowHeight:.465,arrowWidth:.31,arrowDepth:.018,faceUnit:[Math.sin(p.yaw),Math.cos(p.yaw)],verifiedEntrance:false},roadForwardCue:parkingCue}:{louverCount:built.louverCount,bodyDepth:.60})});
  obstacles.push({id:p.id,x:p.x,z:p.z,radius:audit.radius});
 }
 r.metadata.placements.push(...signalDevices(r,groundAt));
 r.metadata.counts={parking_column:1,municipal_cabinet:1,signal_arm_device:2,fixtureFamilies:3};
 r.metadata.materialBatches=Object.keys(CBD_SERVICE_MATERIALS).length;
 r.metadata.groundContact=r.metadata.placements.map(p=>({id:p.id,...p.groundContact}));
 r.metadata.obstacleClearance=r.metadata.placements.map(p=>({id:p.id,...p.obstacleClearance}));
 r.metadata.viewGuidance={shops:'Existing shops camera is expected to frame the two standing props, subject to actual foliage/fixture pixel review. EB signal devices are behind this camera and will not be shown.',mall:'Existing mall camera can be used for context; tiny signal devices require closer pixel inspection.',signalCloseup:{position:[4617,5.5,-373],target:[4631.06,r.metadata.placements.find(p=>p.type==='signal_arm_device').armAnchor[1]+.30,-365.7],fov:42,addedToScene:false},doNotInferVisibilityFromMetadata:true};
 return r;
}
export function ensureCbdServiceMaterials(kit){
 for(const[name,spec]of Object.entries(CBD_SERVICE_MATERIALS))if(!kit.materials[name]){const m=kit.materials[spec.base].clone();m.name=name;m.color.set(spec.color);m.roughness=spec.roughness;m.metalness=spec.metalness;m.emissive?.set('#000000');m.emissiveIntensity=0;for(const key of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','alphaMap','aoMap','bumpMap','displacementMap'])if(key in m)m[key]=null;kit.materials[name]=m;}
 return kit;
}
export function buildCbdServiceDetails(kit,roads,collision,groundAt,options={}){ensureCbdServiceMaterials(kit);return kit.buildMergedRecipe(cbdServiceDetailsRecipe(roads,collision,groundAt,options),{castShadow:false});}
