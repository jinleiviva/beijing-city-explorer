import {hash} from '../../geo.js';

// This controller owns only the one authored, internal-source-road junction.
// It never chooses routes, moves a car during simulation, or replaces following.
const EPS=1e-8;
const approachKey=(roadId,reverse)=>`${roadId}|${Boolean(reverse)}`;
const positiveModulo=(n,d)=>(n%d+d)%d;
const halfLength=car=>car.type.l/2;

/**
 * The unheld 40-second display schedule. Controller snapshots, rather than this
 * helper, are authoritative for both lamps and vehicle entry permissions.
 */
export function nominalJunctionState(time,signalKey,axis){
 const phase=positiveModulo(time+hash(signalKey)%40,40);
 const green=axis===0?phase<16:phase>=20&&phase<36;
 const amber=axis===0?phase>=16&&phase<19:phase>=36&&phase<39;
 return {phase,green,amber,red:!green&&!amber};
}

/**
 * stopDistance / clearDistance are stations along the specified directed edge.
 * clearDistance is a far-side boundary: the REAR bumper must pass it to release.
 * API order: initialize(cars), then beginFrame(time, occupied), then for each car
 * limit -> existing speed/following integration -> afterMove (before rerouting).
 */
export function createJunctionController(stopControls,{deceleration=3,queueGap=1.8}={}){
 if(!Array.isArray(stopControls)||!stopControls.length)throw new Error('Junction controls are required');
 if(!(deceleration>0)||!Number.isFinite(deceleration)||!(queueGap>=0)||!Number.isFinite(queueGap))throw new Error('Invalid junction braking or queue gap');
 const signalKey=stopControls[0].signalKey;
 if(typeof signalKey!=='string'||!signalKey)throw new Error('Junction signalKey is required');
 const byApproach=new Map();
 for(const raw of stopControls){
  const c=Object.freeze({...raw,reverse:Boolean(raw.reverse),bumperSetback:raw.bumperSetback??.8});
  if(c.signalKey!==signalKey)throw new Error('One controller must own exactly one junction signalKey');
  if(!c.sourceRoadId||![0,1].includes(c.axis)||!Number.isFinite(c.stopDistance)||!Number.isFinite(c.clearDistance)||c.stopDistance<=0||c.clearDistance<=c.stopDistance||!Number.isFinite(c.bumperSetback)||c.bumperSetback<0)throw new Error('Invalid source-road stop control');
  const key=approachKey(c.sourceRoadId,c.reverse);
  if(byApproach.has(key))throw new Error('Duplicate directed-road stop control');
  byApproach.set(key,c);
 }
 const controls=Object.freeze([...byApproach.values()]);
 const committed=new Map(),permissions=new WeakMap();
 let initialized=false,carList=null,frame=0,lastTime=-Infinity,view=null,initialization=null;
 const controlFor=car=>byApproach.get(approachKey(car.edge?.road?.id,car.edge?.reverse));
 const atSameApproach=(car,c)=>controlFor(car)===c;
 const stopFront=c=>c.stopDistance-c.bumperSetback;
 const fullyClear=(car,c)=>car.d-halfLength(car)>=c.clearDistance-EPS;
 const counts=()=>{const n=[0,0];for(const c of committed.values())n[c.axis]++;return n;};
 const refreshCounts=()=>{
  if(!view)return;
  const n=counts();
  view=Object.freeze({...view,committedCount:n[0]+n[1],axes:Object.freeze(view.axes.map((s,axis)=>Object.freeze({...s,committedCount:n[axis]})))});
 };
 const requireFrame=()=>{if(!view)throw new Error('Call initialize and beginFrame before junction movement');};

 function initialize(cars){
  if(initialized||frame)throw new Error('Junction initialization is one-time, before the first frame');
  if(!Array.isArray(cars))throw new Error('initialize expects the live cars array');
  const plans=[];let seededInside=0;
  for(const c of controls){
   const lane=cars.filter(car=>controlFor(car)===c);
   for(const car of lane){
    if(!Number.isFinite(car.d)||!(car.type?.l>0)||!Number.isFinite(car.type.l))throw new Error('Invalid car station or length');
    if(Number.isFinite(car.edge.length)&&c.clearDistance+halfLength(car)>=car.edge.length-1)throw new Error('Junction clearance must precede the source-edge exit');
   }
   // Include upstream neighbours so a relocated seeded occupant cannot land on
   // top of one. Downstream, completely clear vehicles remain exactly untouched.
   const queue=lane.filter(car=>!fullyClear(car,c)).sort((a,b)=>b.d-a.d||String(a.stableId??'').localeCompare(String(b.stableId??'')));
   let leader=null;
   for(const car of queue){
    const half=halfLength(car),original=car.d;
    if(original+half>stopFront(c)+EPS)seededInside++;
    const maximum=leader?leader.d-(leader.car.type.l+car.type.l)/2-queueGap:stopFront(c)-half;
    const d=Math.min(original,maximum);
    // Never hide an overfull queue at negative route stations. Build all plans
    // first, so a capacity error does not leave a partially rewritten scene.
    if(d-half<2-EPS)throw new Error(`Insufficient upstream queue space on ${c.id??c.sourceRoadId}`);
    const plan={car,d,moved:original-d>EPS};plans.push(plan);leader=plan;
   }
  }
  for(const {car,d,moved} of plans)if(moved){car.d=d;car.currentSpeed=0;car.wait=0;}
  carList=cars;initialized=true;
  initialization=Object.freeze({seededInside,relocated:plans.filter(p=>p.moved).length,queueGap});
  return initialization;
 }

 function beginFrame(time,occupied=new Map()){
  if(!initialized)throw new Error('Initialize junction cars before the first frame');
  if(!Number.isFinite(time)||time<lastTime-EPS)throw new Error('Junction clock must be finite and monotonic');
  lastTime=time;frame++;
  const live=new Set(carList);
  for(const [car,c] of committed)if(!live.has(car)||!atSameApproach(car,c)||fullyClear(car,c))committed.delete(car);
  const n=counts(),phase=positiveModulo(time+hash(signalKey)%40,40);
  const axes=[0,1].map(axis=>{
   const nominal=nominalJunctionState(time,signalKey,axis);
   const value=occupied?.get?.(`${signalKey}|${axis}`);
   const occupiedNow=value===true||(typeof value==='number'&&value>0);
   const held=occupiedNow||n[1-axis]>0;
   const green=nominal.green&&!held,amber=nominal.amber&&!held;
   return Object.freeze({green,amber,red:!green&&!amber,held,occupied:occupiedNow,committedCount:n[axis],nominalGreen:nominal.green});
  });
  view=Object.freeze({signalKey,time,phase,axes:Object.freeze(axes),committedCount:n[0]+n[1],initialization});
  return view;
 }

 function isWaiting(car){
  if(!view)return false;
  const c=controlFor(car);
  return Boolean(c&&!committed.has(car)&&!fullyClear(car,c)&&!view.axes[c.axis].green);
 }

 function limit(car,delta){
  requireFrame();
  if(!Number.isFinite(delta)||delta<0)throw new Error('Junction delta must be finite and nonnegative');
  const c=controlFor(car);
  const free={controlled:Boolean(c),maxSpeed:Infinity,maxTravel:Infinity,waiting:false,committed:false,controlId:c?.id??null};
  if(!c||fullyClear(car,c))return free;
  if(committed.has(car))return {...free,committed:true};
  const gap=stopFront(c)-(car.d+halfLength(car));
  if(gap<-EPS)throw new Error('Uncommitted car appeared inside the controlled junction');
  // Treat an unsplit frame spanning the end of green conservatively. This
  // cannot authorize entry late in a long frame after the lamps become red.
  const remainingGreen=c.axis===0?16-view.phase:36-view.phase;
  const allowed=view.axes[c.axis].green&&delta<=remainingGreen+EPS;
  permissions.set(car,{frame,allowed,control:c});
  if(allowed)return free;
  const maxTravel=Math.max(0,gap);
  return {...free,maxSpeed:Math.sqrt(2*deceleration*maxTravel),maxTravel,waiting:true};
 }

 function afterMove(car,oldD){
  requireFrame();
  const c=controlFor(car),previous=committed.get(car);
  if(previous){
   if(!atSameApproach(car,previous)||fullyClear(car,previous)){committed.delete(car);refreshCounts();}
   return;
  }
  if(!c)return;
  const half=halfLength(car),threshold=stopFront(c);
  if(oldD+half<=threshold+EPS&&car.d+half>threshold+EPS){
   const permit=permissions.get(car);
   if(!permit||permit.frame!==frame||permit.control!==c||!permit.allowed)throw new Error('Red or unauthorized junction entry; apply maxTravel before afterMove');
   if(!fullyClear(car,c)){committed.set(car,c);refreshCounts();}
  }
 }

 return Object.freeze({initialize,beginFrame,limit,afterMove,isWaiting,snapshot:()=>view});
}
