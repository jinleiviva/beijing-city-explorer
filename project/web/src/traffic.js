import {createJunctionController} from './round2/cbd-mall-junction/control.js';
import * as THREE from '../vendor/three.module.js';
import {rng,hash} from './geo.js';
import {SpatialGrid,insideBuilding} from './spatial.js';

const CAR_TYPES=[
 {id:'sedan',name:'轿车',w:1.82,l:4.55,h:1.42,roof:.69,speed:11.5},
 {id:'taxi',name:'北京出租车风格',w:1.82,l:4.65,h:1.49,roof:.72,speed:10.8},
 {id:'bus',name:'城市公交',w:2.48,l:11.8,h:3.15,roof:1.9,speed:8.0},
 {id:'delivery',name:'配送厢车',w:2.05,l:5.6,h:2.65,roof:1.55,speed:8.6},
 {id:'compact',name:'小型新能源车',w:1.72,l:3.9,h:1.52,roof:.74,speed:10.2},
];
const PAINT=['#e9e5da','#bfc4c0','#314d62','#4b5458','#9d5545','#c4bca8','#3f7771','#657861'];
const SHIRTS=['#394d5f','#d0bba0','#a76650','#677c5d','#d9d4bd','#8c6b74','#344b46','#b19359','#708b96','#bb7770','#ededdf','#584c42'];
function route(points){let length=0;const lengths=[0];for(let i=1;i<points.length;i++){length+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(length);}return{points,lengths,length};}
function sample(edge,d,out){d=Math.max(0,Math.min(edge.length-.001,d));let i=1;while(i<edge.lengths.length-1&&edge.lengths[i]<d)i++;const a=edge.points[i-1],b=edge.points[i],l=edge.lengths[i]-edge.lengths[i-1]||1,t=(d-edge.lengths[i-1])/l;out.x=a[0]+(b[0]-a[0])*t;out.z=a[1]+(b[1]-a[1])*t;out.dx=(b[0]-a[0])/l;out.dz=(b[1]-a[1])/l;return out;}
const key=p=>`${Math.round(p[0])},${Math.round(p[1])}`;

export function createTraffic(roads,{carCount=650,pedestrianCount=420,buildingMask=null,crossings=[],focusRoadIds=[],pedestrianDisplayRoutes=[],stopControls=[]}={}){
 const focused=focusRoadIds.length>0,focusIDs=new Set(focusRoadIds);
 const group=new THREE.Group();group.name='Differentiated animated street life';const random=rng(7132026);
 const edges=[],junctions=new Map();
 for(const road of roads){if(road.y>10||['pedestrian','footway','path','steps','cycleway','service'].includes(road.class)||road.width<6)continue;
  const forward=route(road.points);if(forward.length<25)continue;
  const roadType=road.class;
  for(const reverse of road.oneway==='yes'?[false]:road.oneway==='-1'?[true]:[false,true]){
   const e={...route(reverse?[...road.points].reverse():road.points),road,reverse};e.start=key(e.points[0]);e.end=key(e.points.at(-1));e.signal=hash(e.end)%40;e.index=edges.length;const a=e.points.at(-2),b=e.points.at(-1);e.axis=Math.abs(b[0]-a[0])>Math.abs(b[1]-a[1])?0:1;edges.push(e);
   if(!junctions.has(e.start))junctions.set(e.start,[]);junctions.get(e.start).push(e);
  }
 }
 const outline=new THREE.Shape();outline.moveTo(-.36,-.5);outline.lineTo(.36,-.5);outline.lineTo(.5,-.36);outline.lineTo(.5,.36);outline.lineTo(.36,.5);outline.lineTo(-.36,.5);outline.lineTo(-.5,.36);outline.lineTo(-.5,-.36);outline.closePath();const carShape=new THREE.ExtrudeGeometry(outline,{depth:1,bevelEnabled:false,steps:1});carShape.rotateX(-Math.PI/2);carShape.translate(0,-.5,0);
 const limbGeometry=new THREE.CapsuleGeometry(.5,1,2,6);limbGeometry.scale(1,.5,1);const torsoGeometry=new THREE.CylinderGeometry(.43,.50,1,6);const box=new THREE.BoxGeometry(1,1,1),sphere=new THREE.IcosahedronGeometry(1,1),cylinder=new THREE.CylinderGeometry(1,1,1,8);cylinder.rotateZ(Math.PI/2);
 const bodyMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:.15});const glassMat=new THREE.MeshStandardMaterial({color:'#405b63',roughness:.27,metalness:.15});const wheelMat=new THREE.MeshStandardMaterial({color:'#303536',roughness:.9});const skinMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85});const fabricMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9});
 const mesh=(geo,mat,count,name)=>{const m=new THREE.InstancedMesh(geo,mat,count);m.name=name;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.count=0;group.add(m);return m;};
 const body=mesh(carShape,bodyMat,carCount,'chamfered vehicle bodies'),cabin=mesh(box,glassMat,carCount,'vehicle windows'),roof=mesh(box,bodyMat,carCount,'vehicle roofs'),wheels=mesh(cylinder,wheelMat,carCount*4,'vehicle wheels'),details=mesh(box,bodyMat,carCount,'taxi signs and bus destination panels');
 const cargo=mesh(box,bodyMat,carCount,'delivery cargo boxes'),busPillars=mesh(box,bodyMat,carCount*8,'bus window pillars and doors');
 const cars=[];
 for(let i=0;i<carCount;i++){const roll=random(),type=CAR_TYPES[roll<.45?0:roll<.66?1:roll<.77?2:roll<.90?3:4];const eligibleEdges=type.id==='bus'?edges.filter(e=>['primary','secondary','trunk'].includes(e.road.class)&&e.road.width>=10):edges;const edge=eligibleEdges[Math.floor(random()*eligibleEdges.length)]||edges[0];const paint=new THREE.Color(type.id==='taxi'?'#b6a36a':type.id==='bus'?(random()>.5?'#8dba8b':'#bd6650'):PAINT[Math.floor(random()*PAINT.length)]);body.setColorAt(i,paint);roof.setColorAt(i,paint);cargo.setColorAt(i,paint);for(let j=0;j<8;j++)busPillars.setColorAt(i*8+j,paint);details.setColorAt(i,new THREE.Color(type.id==='taxi'?'#e7dfb8':type.id==='bus'?'#d5c375':'#cad0bd'));cars.push({type,edge,d:random()*edge.length,speed:type.speed*(.75+random()*.5),phase:random()*40,wait:0,currentSpeed:0,paint});}
 // CBD mode starts an evenly spaced local flow on mapped carriageways. The
 // original city mode above remains unchanged, including its random seed.
 const focusEdges=edges.filter(e=>focusIDs.has(e.road.id));
 if(focused&&!focusEdges.length)throw new Error('CBD focus roads have no eligible traffic edges');
 if(focused)for(let i=0;i<cars.length;i++){
  const c=cars[i],choices=focusEdges.filter(e=>c.type.id!=='bus'||(['primary','secondary','trunk'].includes(e.road.class)&&e.road.width>=10));
  const e=choices[i%choices.length];if(!e)throw new Error('No eligible focused route for vehicle type');
  const peers=cars.filter((v,j)=>j%choices.length===i%choices.length).length;
  const rank=Math.floor(i/choices.length);c.edge=e;c.d=(rank+.5)*e.length/peers;c.currentSpeed=c.speed*.65;c.heading=null;c.stableId='cbd-car-'+i;
 }
 // The bounded CBD source contains some historical road/building overlaps.
 // Before choosing a continuation, test its actual offset lane and complete
 // vehicle footprint against the unchanged building mask. Never route through
 // a known solid building just to keep display flow moving.
 const safeContinuations=new Map();
 function safeContinuation(edge,type){
  if(!focused||!buildingMask)return true;const key=edge.index+'|'+type.id;if(safeContinuations.has(key))return safeContinuations.get(key);
  const samplePoint={},offset=Math.min(edge.road.width*.22,Math.max(1.8,edge.road.width/2-2.2));let safe=true;
  for(let d=type.l/2+.5;d<edge.length-type.l/2-.5&&safe;d+=2){sample(edge,d,samplePoint);const x=samplePoint.x-samplePoint.dz*offset,z=samplePoint.z+samplePoint.dx*offset;
   for(const along of [-type.l/2,0,type.l/2])for(const across of [-type.w/2,type.w/2])if(insideBuilding(buildingMask,x+samplePoint.dx*along-samplePoint.dz*across,z+samplePoint.dz*along+samplePoint.dx*across,.08))safe=false;
  }safeContinuations.set(key,safe);return safe;
 }
 const localJunction=stopControls.length?createJunctionController(stopControls):null;localJunction?.initialize(cars);
 const junctionProtected=car=>{if(!localJunction?.snapshot())return false;const v=localJunction.limit(car,0);return v.waiting||v.committed;};
 const peopleRoutes=roads.filter(r=>r.y<3&&!['motorway','motorway_link','trunk','trunk_link'].includes(r.class)&&r.width>=3).map(r=>({...route(r.points),road:r})).filter(r=>r.length>(r.road.properties?.customBridge?8:35));
 const displayPeopleRoutes=pedestrianDisplayRoutes.map(r=>({...route(r.points),road:r})).filter(r=>r.length>8);
 for(const c of crossings){const half=(c.roadWidth||c.width)/2+1.7;const points=[[c.x-c.dx*half,c.z-c.dz*half],[c.x+c.dx*half,c.z+c.dz*half]];peopleRoutes.push({...route(points),crossing:c,road:{id:'crossing-'+c.signalKey+'-'+c.roadAxis,class:'crossing',width:3.8,y:c.y,properties:{streetId:c.streetId}}});}
 const torsos=mesh(torsoGeometry,fabricMat,pedestrianCount,'pedestrian coats and shirts'),heads=mesh(sphere,skinMat,pedestrianCount,'pedestrian heads'),legs=mesh(limbGeometry,fabricMat,pedestrianCount*2,'walking legs'),arms=mesh(limbGeometry,fabricMat,pedestrianCount*2,'walking arms'),bags=mesh(box,fabricMat,pedestrianCount,'bags and backpacks');
 const hands=mesh(sphere,skinMat,pedestrianCount*2,'small visible hands'),shoes=mesh(box,fabricMat,pedestrianCount*2,'individual shoes');
 const hair=mesh(sphere,fabricMat,pedestrianCount,'distinct hair shapes'),hats=mesh(box,fabricMat,pedestrianCount,'caps and hats');
 const people=[];for(let i=0;i<pedestrianCount;i++){const h=1.49+random()*.43,w=.36+random()*.17,edge=peopleRoutes[Math.floor(random()*peopleRoutes.length)],shirt=new THREE.Color(SHIRTS[Math.floor(random()*SHIRTS.length)]),pants=new THREE.Color(['#4a4e4a','#667070','#394756','#958979'][Math.floor(random()*4)]);torsos.setColorAt(i,shirt);hair.setColorAt(i,new THREE.Color(['#302b27','#584134','#8b7360'][Math.floor(random()*3)]));hats.setColorAt(i,shirt.clone().multiplyScalar(1.15));const skin=new THREE.Color(['#bf9676','#d9b396','#caa58b','#e2bba0'][Math.floor(random()*4)]);heads.setColorAt(i,skin);for(let j=0;j<2;j++){hands.setColorAt(i*2+j,skin);shoes.setColorAt(i*2+j,new THREE.Color(i%5?'#464640':'#d2d1bd'));}bags.setColorAt(i,new THREE.Color(['#574f43','#8a6b51','#4c6868'][Math.floor(random()*3)]));for(let j=0;j<2;j++){legs.setColorAt(i*2+j,pants);arms.setColorAt(i*2+j,shirt);}people.push({edge,d:random()*edge.length,side:random()<.5?-1:1,direction:random()<.5?-1:1,h,w,speed:.7+random()*.95,phase:random()*Math.PI*2,wait:0,bag:random()<.53?1:0,bodyType:random(),lateral:random()*2-1,hairstyle:Math.floor(random()*3),pauseAt:25+random()*90,hat:random()<.23?1:0,coat:random()<.3?1:0,walkBlend:1,heading:null});}
 // A small subset uses clearly labelled authored plaza walking bands. These
 // are display paths on tested clear aprons, not newly claimed OSM footways.
 if(displayPeopleRoutes.length)for(let i=0;i<Math.min(8,people.length);i++){const p=people[i],e=displayPeopleRoutes[i%displayPeopleRoutes.length],rank=Math.floor(i/displayPeopleRoutes.length),phase=[.22,.29,.65,.72][rank%4];p.edge=e;p.d=Math.max(2.2,Math.min(e.length-2.2,e.length*phase));p.side=1;p.lateral=[-.9,-.3,.3,.9][rank%4];p.direction=rank<2?1:-1;p.speed=rank<2?.95:.82;p.lockedLocalRoute=true;}
 for(let i=0;i<people.length;i++){const p=people[i];p.colors={};for(const [name,m,index] of [['shirt',torsos,i],['skin',heads,i],['pants',legs,i*2],['hair',hair,i],['hat',hats,i],['bag',bags,i],['shoes',shoes,i*2]]){const color=new THREE.Color();m.getColorAt(index,color);p.colors[name]=color;}}
 const frustum=new THREE.Frustum(),viewProjection=new THREE.Matrix4(),cullSphere=new THREE.Sphere();
 const q=new THREE.Quaternion(),position=new THREE.Vector3(),scale=new THREE.Vector3(),euler=new THREE.Euler(),matrix=new THREE.Matrix4(),base=new THREE.Matrix4(),local=new THREE.Matrix4();const pos={x:0,z:0,dx:0,dz:0};
 function put(m,i,x,y,z,sx,sy,sz,rot=0){q.setFromEuler(euler.set(0,rot,0));matrix.compose(position.set(x,y,z),q,scale.set(sx,sy,sz));m.setMatrixAt(i,matrix);}
 function part(m,i,b,x,y,z,sx,sy,sz,rx=0){q.setFromEuler(euler.set(rx,0,0));local.compose(position.set(x,y,z),q,scale.set(sx,sy,sz));matrix.multiplyMatrices(b,local);m.setMatrixAt(i,matrix);}
 const edgeSpatial=new SpatialGrid(800),peopleSpatial=new SpatialGrid(600);
 for(const e of edges){for(const p of e.points)edgeSpatial.insert(e,[p[0],p[1],p[0],p[1]]);}
 for(const e of peopleRoutes){for(const p of e.points)peopleSpatial.insert(e,[p[0],p[1],p[0],p[1]]);}
 let localEdges=[],localPeople=[],lastFocus={x:Infinity,z:Infinity},localRefresh=-10;
 let viewFocus={x:0,z:0},viewRadius=700;
 let elapsed=0,accum=0,lastUpdateMs=0,visibleCars=0,visiblePeople=0,stoppedCars=0,overlapAvoided=0,offscreenReentries=0;
 // A bounded district cannot retain the entire surrounding traffic network.
 // Reuse a queued vehicle only when both its full old envelope and the clear
 // mapped-road entry are outside the current render volume (frustum and distance). This is a display flow,
 // not a claim to city traffic demand. Visible identities never get reseeded.
 function reenterOutsideView(car,camera){
  if(!focused||!camera||!car.lastPosition||junctionProtected(car))return false;
  const t=car.type,old=car.lastPosition;cullSphere.radius=t.l*.8+4;
  cullSphere.center.set(old.x,old.y+t.h*.5,old.z);if(Math.hypot(old.x-viewFocus.x,old.z-viewFocus.z)<=viewRadius+cullSphere.radius&&frustum.intersectsSphere(cullSphere))return false;
  const candidates=[...focusEdges].sort((a,b)=>cars.filter(c=>c.edge===a).length-cars.filter(c=>c.edge===b).length);
  for(const candidate of candidates){if(t.id==='bus'&&!['primary','secondary','trunk'].includes(candidate.road.class))continue;
   const entry=t.l*.5+2;sample(candidate,entry,pos);const offset=Math.min(candidate.road.width*.22,Math.max(1.8,candidate.road.width/2-2.2));
   cullSphere.center.set(pos.x-pos.dz*offset,candidate.road.y+t.h*.5,pos.z+pos.dx*offset);
   if((Math.hypot(cullSphere.center.x-viewFocus.x,cullSphere.center.z-viewFocus.z)<=viewRadius+cullSphere.radius&&frustum.intersectsSphere(cullSphere))||cars.some(other=>other!==car&&other.edge===candidate&&other.d<t.l+other.type.l+12))continue;
   car.edge=candidate;car.d=entry;car.currentSpeed=car.speed*.5;car.heading=null;car.turnFrom=null;car.stallSeconds=0;offscreenReentries++;return true;
  }return false;
 }
 function update(dt,cameraTarget,distance,camera=null){if(camera){camera.updateMatrixWorld();frustum.setFromProjectionMatrix(viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));}elapsed+=dt;accum+=dt;if(accum<1/30)return;const delta=Math.min(.2,accum);accum=0;const begin=performance.now();visibleCars=0;visiblePeople=0;
  const near=distance<6500;const radius=Math.min(4500,Math.max(700,distance*1.25));
  viewFocus=cameraTarget;viewRadius=radius;
  const newFocus=Math.hypot(lastFocus.x-cameraTarget.x,lastFocus.z-cameraTarget.z)>500;
  if(near&&(newFocus||elapsed-localRefresh>2)){localEdges=edgeSpatial.nearby(cameraTarget.x,cameraTarget.z,radius);localPeople=peopleSpatial.nearby(cameraTarget.x,cameraTarget.z,Math.max(350,distance*.7));lastFocus={x:cameraTarget.x,z:cameraTarget.z};localRefresh=elapsed;}
  if(newFocus&&near){if(!focused)for(const c of cars)if(localEdges.length){const routes=c.type.id==='bus'?localEdges.filter(e=>['primary','secondary','trunk'].includes(e.road.class)&&e.road.width>=10):localEdges;if(!routes.length)continue;c.edge=routes[Math.floor(random()*routes.length)];c.d=random()*c.edge.length;c.currentSpeed=c.speed*.55;c.heading=null;}const walkingStreets=localPeople.filter(e=>e.road.properties.streetId&&['pedestrian','footway'].includes(e.road.class));for(const p of people)if(!p.lockedLocalRoute&&localPeople.length){const routes=walkingStreets.length&&random()<.24?walkingStreets:localPeople;p.edge=routes[Math.floor(random()*routes.length)];p.d=random()*p.edge.length;p.heading=null;}}
  const crossingOccupied=new Map();for(const p of people){if(p.edge.crossing&&p.d>2&&p.d<p.edge.length-2){const c=p.edge.crossing;crossingOccupied.set(c.signalKey+'|'+c.roadAxis,(crossingOccupied.get(c.signalKey+'|'+c.roadAxis)||0)+1);}}
  localJunction?.beginFrame(elapsed,crossingOccupied);
  if(focused)for(const car of cars){if(junctionProtected(car)){car.stallSeconds=car.strandedSeconds=car.outsideFocusSeconds=0;continue;}car.stallSeconds=car.currentSpeed<.15?(car.stallSeconds||0)+delta:0;if(car.stallSeconds>(focusIDs.has(car.edge.road.id)?50:30))reenterOutsideView(car,camera);}
  // A bounded street scene has open traffic boundaries. Return cars stranded
  // beyond the focus streets through a clear, genuinely non-rendered entry.
  // Use the same radius/frustum as rendering, plus a full-body safety margin.
  // Perform before leader construction so headway data never uses stale routes.
  if(focused&&camera)for(const car of cars){
   if(junctionProtected(car)){car.stallSeconds=car.strandedSeconds=car.outsideFocusSeconds=0;continue;}
   car.strandedSeconds=car.currentSpeed<.2?(car.strandedSeconds||0)+delta:0;
   car.outsideFocusSeconds=!focusIDs.has(car.edge.road.id)?(car.outsideFocusSeconds||0)+delta:0;
   if(car.strandedSeconds<42&&car.outsideFocusSeconds<8)continue;
   const t=car.type,drawnAt=(edge,d)=>{sample(edge,d,pos);const offset=Math.min(edge.road.width*.22,Math.max(1.8,edge.road.width/2-2.2));const x=pos.x-pos.dz*offset,z=pos.z+pos.dx*offset;cullSphere.center.set(x,edge.road.y+t.h*.5,z);cullSphere.radius=t.l*.85;return Math.hypot(x-cameraTarget.x,z-cameraTarget.z)<radius+t.l&&frustum.intersectsSphere(cullSphere);};
   if(drawnAt(car.edge,car.d))continue;
   const candidates=focusEdges.slice().sort((a,b)=>cars.filter(c=>c.edge===a).length-cars.filter(c=>c.edge===b).length);
   for(const entry of candidates){const d=t.l*.5+2;if(t.id==='bus'&&!['primary','secondary','trunk'].includes(entry.road.class))continue;if(drawnAt(entry,d)||cars.some(c=>c!==car&&c.edge===entry&&c.d<d+(t.l+c.type.l)/2+12))continue;
    car.edge=entry;car.d=d;car.currentSpeed=car.speed*.5;car.heading=null;car.turnFrom=null;car.strandedSeconds=0;car.outsideFocusSeconds=0;offscreenReentries++;break;
   }
  }
  const occupied=new Map();for(const c of cars){if(!occupied.has(c.edge.index))occupied.set(c.edge.index,[]);occupied.get(c.edge.index).push(c);}for(const list of occupied.values())list.sort((a,b)=>a.d-b.d);
  const leaders=new Map();for(const list of occupied.values())for(let i=0;i<list.length-1;i++)leaders.set(list[i],list[i+1]);stoppedCars=0;
  for(let i=0;i<cars.length;i++){const car=cars[i],t=car.type;let e=car.edge;const remain=e.length-car.d;const phase=(elapsed+e.signal)%40;const green=e.axis===0?phase<16:phase>=20&&phase<36;const signalRed=(!green||crossingOccupied.has(e.end+'|'+e.axis))&&remain<42&&(junctions.get(e.end)||[]).length>=3;let speed=car.speed;
   if(signalRed){speed=Math.min(speed,Math.max(0,(remain-14)*.8));car.wait+=delta;}else car.wait=0;
   const localLimit=localJunction?.limit(car,delta);car.signalWaiting=!!localLimit?.waiting;car.junctionControlId=localLimit?.controlId||null;if(localLimit){speed=Math.min(speed,localLimit.maxSpeed);if(localLimit.waiting)car.wait+=delta;}
   const ahead=leaders.get(car);let travelLimit=localLimit?.maxTravel??Infinity;if(ahead){const gap=ahead.d-car.d-(ahead.type.l+t.l)/2;speed=Math.min(speed,Math.max(0,(gap-2.5)/1.3));travelLimit=Math.min(travelLimit,Math.max(0,gap-1.8));if(speed<car.speed*.5)overlapAvoided++;}
   const acceleration=speed>car.currentSpeed?2.2:5;car.currentSpeed+=Math.sign(speed-car.currentSpeed)*Math.min(Math.abs(speed-car.currentSpeed),acceleration*delta);if(car.currentSpeed<.15)stoppedCars++;
   const oldD=car.d,travel=Math.min(car.currentSpeed*delta,travelLimit);car.d+=travel;if(Number.isFinite(travelLimit)&&travel>=travelLimit-1e-8)car.currentSpeed=0;localJunction?.afterMove(car,oldD);if(car.d>=e.length-1){const outgoing=junctions.get(e.end)||[],preferred=outgoing.filter(n=>n.end!==e.start);let next=preferred.length?preferred:outgoing;if(car.type.id==='bus')next=next.filter(e=>['primary','secondary','trunk'].includes(e.road.class)&&e.road.width>=10);if(focused)next=next.filter(n=>safeContinuation(n,t)&&!cars.some(c=>c!==car&&c.edge===n&&c.d<(c.type.l+t.l)/2+3));if(next.length){if(focused&&car.lastPosition)car.turnFrom={x:car.lastPosition.x,z:car.lastPosition.z,length:12};car.edge=next[Math.floor(random()*next.length)];car.d=0;e=car.edge;}else {car.d=e.length-1.1;car.currentSpeed=0;
    if(reenterOutsideView(car,camera))e=car.edge;
   }}

   sample(e,car.d,pos);const offset=Math.min(e.road.width*.22,Math.max(1.8,e.road.width/2-2.2));let x=pos.x-pos.dz*offset,z=pos.z+pos.dx*offset;
   if(focused&&car.turnFrom){const u=THREE.MathUtils.smoothstep(car.d,0,car.turnFrom.length);x=THREE.MathUtils.lerp(car.turnFrom.x,x,u);z=THREE.MathUtils.lerp(car.turnFrom.z,z,u);if(u===1)car.turnFrom=null;}
   const vehicleY=e.road.surfaceHeightAt?.(x,z)??e.road.y;cullSphere.center.set(x,vehicleY+t.h*.5,z);cullSphere.radius=t.l*.65;let visible=near&&Math.hypot(x-cameraTarget.x,z-cameraTarget.z)<radius&&(!camera||frustum.intersectsSphere(cullSphere));
   // At wide views cars are intentionally culled. Near exploration seeds a bounded local pool.
   if(!focused&&!visible&&near&&i%3===0&&elapsed%6<delta){const candidates=car.type.id==='bus'?localEdges.filter(e=>['primary','secondary','trunk'].includes(e.road.class)&&e.road.width>=10):localEdges;if(candidates.length){car.edge=candidates[Math.floor(random()*candidates.length)];car.d=random()*car.edge.length;}}
   car.lastPosition={x,y:vehicleY,z};car.visible=visible;if(!visible)continue;const index=visibleCars++,size=1;body.setColorAt(index,car.paint);roof.setColorAt(index,car.paint);cargo.setColorAt(index,car.paint);details.setColorAt(index,new THREE.Color(t.id==='taxi'?'#e7dfb8':t.id==='bus'?'#d5c375':'#cad0bd'));for(let j=0;j<8;j++)busPillars.setColorAt(index*8+j,car.paint);
   const desiredHeading=Math.atan2(pos.dx,pos.dz);car.heading=car.heading??desiredHeading;let turn=desiredHeading-car.heading;turn=Math.atan2(Math.sin(turn),Math.cos(turn));car.heading+=turn*Math.min(1,delta*4);q.setFromEuler(euler.set(0,car.heading,0));base.compose(position.set(x,vehicleY,z),q,scale.set(size,size,size));
   const bus=t.id==='bus',van=t.id==='delivery';part(body,index,base,0,t.h*.35,0,t.w,t.h*.62,t.l);
   part(cabin,index,base,0,t.h*.75,bus?0:van?t.l*.31:-.15,t.w*.88,t.h*.36,bus?t.l*.84:van?t.l*.28:t.l*.53);
   part(cargo,index,base,0,t.h*.63,-t.l*.14,van?t.w*.98:0,van?t.h*.7:0,van?t.l*.65:0);
   for(let j=0;j<8;j++){const side=j<4?-1:1,zz=-t.l*.31+(j%4)*t.l*.205;part(busPillars,index*8+j,base,side*t.w*.45,t.h*.74,zz,bus?.13:0,bus?t.h*.4:0,bus?.11:0);}
   part(roof,index,base,0,t.h*.96,bus?0:van?-t.l*.15:-.15,t.w*.91,t.h*.10,bus?t.l*.92:van?t.l*.63:t.l*.49);
   const axle=t.l*(bus?.31:.3),wheelR=bus?.46:.31;let wi=0;for(const side of [-1,1])for(const zz of [-axle,axle])part(wheels,index*4+wi++,base,side*t.w*.49,wheelR,zz,.20,wheelR,wheelR);
   part(details,index,base,0,t.h+(t.id==='taxi'?.15:-.02),t.id==='bus'?t.l*.44:0,t.id==='taxi'?.52:t.id==='bus'?1.35:.01,t.id==='taxi'?.22:t.id==='bus'?.22:.01,t.id==='taxi'?.24:.10);
  }
  for(let i=0;i<people.length;i++){const p=people[i],e=p.edge;p.wait=Math.max(0,p.wait-delta);if(!e.crossing&&elapsed>p.pauseAt){p.wait=1.5+random()*5;p.pauseAt=elapsed+35+random()*85;}if(e.crossing){const c=e.crossing,phase=(elapsed+hash(c.signalKey)%40)%40,walkGreen=c.roadAxis===0?(phase>=20&&phase<34):(phase>=0&&phase<14),atEntrance=p.direction>0?p.d<=2.05:p.d>=e.length-2.05;if(atEntrance&&!walkGreen)p.wait=Math.max(p.wait,delta+.12);}
   if(p.wait<=0){p.d+=p.speed*delta*p.direction;if(p.d>e.length-2||p.d<2){p.direction*=-1;p.d=Math.max(2,Math.min(e.length-2,p.d));p.wait=1.5+random()*5;}}
   sample(e,p.d,pos);const pedestrianWay=e.road.properties?.shoreSharedPassage||['footway','pedestrian','path','steps','crossing'].includes(e.road.class),offset=pedestrianWay?p.lateral*Math.max(.4,Math.min(e.road.width*.38,e.road.class==='pedestrian'?14:2.3)):(e.road.width/2+1.5+p.lateral*.55)*p.side;const x=pos.x-pos.dz*offset,z=pos.z+pos.dx*offset;const blocked=!e.crossing&&buildingMask&&insideBuilding(buildingMask,x,z,.25);if(blocked){p.direction*=-1;p.d=Math.max(3,Math.min(e.length-3,p.d+p.direction*2));p.wait=.8;}const pedestrianY=e.road.properties?.customBridge==='yinding'?.72+1.78*Math.max(0,1-(p.d/e.length*2-1)**2):(e.road.surfaceHeightAt?.(x,z)??e.road.y);cullSphere.center.set(x,pedestrianY+p.h*.5,z);cullSphere.radius=p.h*.65;const visible=!blocked&&distance<3000&&Math.hypot(x-cameraTarget.x,z-cameraTarget.z)<Math.max(450,distance*.8)&&(!camera||frustum.intersectsSphere(cullSphere));
   p.lastPosition={x,y:pedestrianY,z};p.visible=visible;
   if(!p.lockedLocalRoute&&!visible&&distance<3000&&i%3===0&&elapsed%4<delta){const candidates=localPeople;if(candidates.length){p.edge=candidates[Math.floor(random()*candidates.length)];p.d=random()*p.edge.length;}}
   if(!visible)continue;const index=visiblePeople++,size=1;for(const [m,key] of [[torsos,'shirt'],[heads,'skin'],[hair,'hair'],[hats,'hat'],[bags,'bag']])m.setColorAt(index,p.colors[key]);for(let j=0;j<2;j++){legs.setColorAt(index*2+j,p.colors.pants);arms.setColorAt(index*2+j,p.colors.shirt);hands.setColorAt(index*2+j,p.colors.skin);shoes.setColorAt(index*2+j,p.colors.shoes);}
   const desired=Math.atan2(pos.dx*p.direction,pos.dz*p.direction);p.heading=p.heading??desired;let turn=desired-p.heading;turn=Math.atan2(Math.sin(turn),Math.cos(turn));p.heading+=turn*Math.min(1,delta*4);q.setFromEuler(euler.set(0,p.heading,0));base.compose(position.set(x,pedestrianY+(p.lockedLocalRoute?-.0125:.03),z),q,scale.set(size,size,size));p.walkBlend+=((p.wait>0?0:1)-p.walkBlend)*Math.min(1,delta*5);const stride=Math.sin(elapsed*p.speed*6+p.phase)*.42*p.walkBlend;
   part(torsos,index,base,0,p.h*(p.coat?.59:.64),0,p.w*(p.coat?1.12:1),p.h*(p.coat?.40:.31),.27+p.bodyType*.07);part(heads,index,base,0,p.h*.91,0,p.h*.09,p.h*.11,p.h*.085);
   part(hair,index,base,0,p.h*(p.hairstyle===2?.92:.965),-.035,p.h*(p.hairstyle===1?.108:.097),p.h*(p.hairstyle===2?.105:.065),p.h*.091);part(hats,index,base,0,p.h*1.01,.025,p.h*.19*p.hat,.07*p.hat,p.h*.22*p.hat);
   for(let j=0;j<2;j++){const sign=j===0?-1:1;part(legs,index*2+j,base,sign*p.w*.23,p.h*.23,Math.sin(stride*sign)*p.h*.12,p.w*.36,p.h*.45,.16,stride*sign);part(arms,index*2+j,base,sign*p.w*.64,p.h*.61,-Math.sin(stride*sign)*.08,.105,p.h*.30,.105,-stride*sign);part(hands,index*2+j,base,sign*p.w*.64,p.h*.44,-Math.sin(stride*sign)*.16,.068,.080,.065);part(shoes,index*2+j,base,sign*p.w*.23,.065,Math.sin(stride*sign)*p.h*.23+.045,.16,.105,.27);}
   part(bags,index,base,0,p.h*.63,-.17,p.w*.68*p.bag,p.h*.22*p.bag,.15*p.bag);
  }
  for(const m of [body,cabin,roof,details,cargo])m.count=visibleCars;wheels.count=visibleCars*4;busPillars.count=visibleCars*8;for(const m of [torsos,heads,bags,hair,hats])m.count=visiblePeople;for(const m of [legs,arms,hands,shoes])m.count=visiblePeople*2;for(const m of group.children){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}lastUpdateMs=performance.now()-begin;
 }
 function records(){return cars.map((c,i)=>({id:c.stableId||'car-'+i,type:c.type.id,sourceRoadId:c.edge.road.id,reverse:c.edge.reverse,distance:c.d,position:c.lastPosition?{...c.lastPosition}:null,speed:c.currentSpeed,heading:c.heading,visible:!!c.visible,signalWaiting:!!c.signalWaiting,junctionControlId:c.junctionControlId||null,length:c.type.l,width:c.type.w,time:elapsed}));}
 function pedestrianRecords(){return people.map((p,i)=>({id:'person-'+i,sourceRouteId:p.edge.road.id,authoredDisplayPath:!!p.edge.road.properties?.authoredDisplayPath,position:p.lastPosition?{...p.lastPosition}:null,height:p.h,bodyWidth:p.w*(p.coat?1.12:1),direction:p.direction,speed:p.wait>0?0:p.speed,visible:!!p.visible,time:elapsed}));}
 function stats(){return{continuationFootprintChecks:safeContinuations.size,rejectedBuildingOverlapContinuations:[...safeContinuations.values()].filter(v=>!v).length,localJunctionControls:stopControls.length,localJunction:localJunction?.snapshot()||null,authoredPlazaWalkingRoutes:displayPeopleRoutes.length,assignedPlazaPeople:people.filter(p=>p.lockedLocalRoute).length,focusedTraffic:focused,offscreenReentries,focusRoadIds:[...focusIDs],carTypes:CAR_TYPES.map(t=>({id:t.id,name:t.name,speedMetresPerSecond:t.speed})),carPool:cars.length,visibleCars,pedestrianPool:people.length,visiblePeople,pedestrianHeightRange:[1.49,1.92],pedestrianSpeedRange:[.7,1.65],shirtColors:SHIRTS.length,personVariations:['height','body width','coat length','shirt and trousers','three hair lengths and colors','continuous lateral walking positions','brief browsing pauses','caps','backpacks','pace and pause rhythm'],vehiclePaintColors:PAINT.length,roadGraphEdges:edges.length,signalCycleSeconds:40,signalGreenSeconds:16,designatedCrossingRoutes:crossings.length,pedestrianCrossingRule:'Enter only on the corresponding vehicle-red phase; active crossers hold vehicle stop line until clear',stoppedCars,headwayBrakingEvents:overlapAvoided,updateMs:lastUpdateMs,accuracy:'Display simulation on mapped road centerlines and approximate sidewalk offsets; not measured traffic'};}
 group.userData.stats=stats;return{group,update,stats,records,pedestrianRecords,junctionState:()=>localJunction?.snapshot()||null,get time(){return elapsed;}};
}
