/** Standalone candidate: mapped plan + photograph-informed, unmeasured massing.
 * Nothing in this module mutates scene data, removes the baseline, or registers
 * a replacement. The caller must explicitly choose whether to integrate it.
 */
import {Recipe} from '../../architecture/geometry.js';
import {project,centroid,polygonArea,hash} from '../../geo.js';
import {contextDetailHost} from '../cbd-context-details/recipe.js';
import {secondIdentityWord} from '../cbd-second-identities/index.js';

export const MILLENNIUM_ID='osm-way-338084085';
export const MILLENNIUM_RING_HASH=1388189296;
export const MILLENNIUM_LIMITS=Object.freeze({maxTriangles:18000,maxMaterialBatches:8});
export const MILLENNIUM_EVIDENCE=Object.freeze({
  height:{metres:104,status:'estimated',floors:27,source:'https://www.skyscrapercenter.com/beijing/grand-millennium-beijing/18979/',basis:'CTBUH floor-count estimate, explicitly not a measured height. Its page derives 104m from 27 hotel floors and warns that podiums and non-standard features affect accuracy.',checked:'2026-10-17'},
  identity:{name:'北京千禧大酒店 / Grand Millennium Beijing',address:'No. 7 DongSanHuan Middle Road, Fortune Plaza, Beijing',source:'https://www.millenniumhotels.com/zh/destinations/asia/china/beijing/grand-millennium-beijing/',corroboratingAddress:'https://www.skyscrapercenter.com/beijing/grand-millennium-beijing/18979/'},
  photograph:{source:'https://hi-life.hongleong.com.sg/December2025/meals_deals-article03.html',image:'https://hi-life.hongleong.com.sg/December2025/images/mealsndeals-article3-main.jpg',publication:'Hong Leong Group, December 2025; image capture date unknown',viewed:'2026-10-17T07:37:29Z',method:'Normal cloud browser image viewing; no image saved or used as a texture',observed:'Blue glazed high-rise with recessed/folded central facade, higher terminal wings, stone-clad low podium, white GRAND above larger MILLENNIUM. Red emblem observed but not reproduced.'},
  secondView:{source:'https://www.skyscrapercenter.com/beijing/grand-millennium-beijing/18979/',image:'https://images.skyscrapercenter.com/building/grandmilleniumbeijing_ext_%28c%29tm-0.jpg',credit:'Tansri Muliani via CTBUH',viewed:'2026-10-17T07:38:46Z',observed:'Additional view supports the multi-wing glazed tower and lower stone volumes. It does not establish a surveyed plan or compass match.'},
  footprint:{source:'https://www.openstreetmap.org/way/338084085',status:'Existing OSM-derived simplified geographic footprint retained exactly; not survey-grade'},
  uncertainty:'Tower/podium cut, west-facing photo registration, 96m central roof, 11.5m podium, roof interpolation, bay spacing, material colours and sign size are modelling inferences. Only 104m has an external numerical source, and that source is itself estimated.'
});

const MAIN=[0,1,2,3,4,5,10,11,12,13,14,15,16,17,18];
const LOW=[5,6,7,8,9,10];
const PODIUM=11.5,CENTRE_ROOF=96,FLOOR=104/27;
const EPS=1e-8;
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const signedArea=ring=>ring.reduce((sum,a,i)=>{const b=ring[(i+1)%ring.length];return sum+a[0]*b[1]-b[0]*a[1];},0)/2;
const samePoint=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<EPS;
const lerp=(a,b,t)=>a+(b-a)*t;

/** Ear clipping rather than a fan: the source H-shaped plan is concave. */
export function triangulateMillenniumRing(ring){
  const order=ring.map((_,i)=>i),triangles=[];
  if(signedArea(ring)<0)order.reverse();
  const inside=(p,a,b,c)=>cross(a,b,p)>=-EPS&&cross(b,c,p)>=-EPS&&cross(c,a,p)>=-EPS;
  while(order.length>3){
    let found=false;
    for(let k=0;k<order.length;k++){
      const a=order[(k+order.length-1)%order.length],b=order[k],c=order[(k+1)%order.length];
      if(cross(ring[a],ring[b],ring[c])<=EPS)continue;
      if(order.some(i=>i!==a&&i!==b&&i!==c&&inside(ring[i],ring[a],ring[b],ring[c])))continue;
      triangles.push([a,b,c]);order.splice(k,1);found=true;break;
    }
    if(!found)throw Error('Millennium mapped footprint could not be triangulated without crossing a concavity.');
  }
  triangles.push([...order]);return triangles;
}

export function millenniumPlan(feature){
  if(feature?.id!==MILLENNIUM_ID||feature?.geometry?.type!=='Polygon'||feature.geometry.coordinates.length!==1)throw Error('Millennium correction requires its one original mapped Polygon.');
  const source=feature.geometry.coordinates[0];
  if(hash(JSON.stringify(source))!==MILLENNIUM_RING_HASH)throw Error('Millennium source ring changed: review the documented source-index partition first.');
  const closed=source.map(project),ring=samePoint(closed[0],closed.at(-1))?closed.slice(0,-1):closed;
  const tower=MAIN.map(i=>ring[i]),podiumWing=LOW.map(i=>ring[i]);
  const area=polygonArea(ring),towerArea=polygonArea(tower),podiumWingArea=polygonArea(podiumWing);
  if(Math.abs(towerArea+podiumWingArea-area)>1e-5)throw Error('Tower/podium partition must exactly preserve the original footprint area.');
  return {ring,closed,tower,podiumWing,sourceVertexIndices:{tower:[...MAIN],lowWing:[...LOW]},internalCut:[5,10],area,towerArea,podiumWingArea,center:centroid(closed)};
}

/** North/south terminal wings rise above the lower recessed central roof.
 * Interpolation is a conservative photograph-informed candidate, not dimensions
 * measured from a perspective photograph. All top points remain <=104m.
 */
function roofProfile(plan,z){
  const middle=plan.ring[17][1],terminal=z<middle?plan.ring[18][1]:plan.ring[16][1];
  const t=Math.min(1,Math.max(0,Math.abs(z-middle)/Math.abs(terminal-middle)));
  return CENTRE_ROOF+(104-CENTRE_ROOF)*t*t*(3-2*t);
}

function shell(ring,base,roof,origin,{walls=true,top=true,bottom=false}={}){
  const points=ring.map(([x,z])=>[x-origin[0],z-origin[1]]),n=ring.length,vertices=[],indices=[];
  for(const [i,[x,z]]of points.entries())vertices.push(x,typeof base==='function'?base(i):base,z);
  for(const [i,[x,z]]of points.entries())vertices.push(x,typeof roof==='function'?roof(i):roof,z);
  const positive=signedArea(points)>0;
  if(walls)for(let i=0;i<n;i++){const j=(i+1)%n;positive?indices.push(i,n+i,n+j,i,n+j,j):indices.push(i,j,n+j,i,n+j,n+i);}
  for(const[a,b,c]of triangulateMillenniumRing(points)){
    if(top)indices.push(n+a,n+c,n+b);
    if(bottom)indices.push(a,b,c);
  }
  return {type:'mesh',vertices,indices,flatShading:true};
}

function edges(ring,sourceIndices=null){
  const sign=Math.sign(signedArea(ring));
  return ring.map((a,i)=>{const b=ring[(i+1)%ring.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]),tangent=[(b[0]-a[0])/length,(b[1]-a[1])/length];return{a,b,length,tangent,normal:[sign*tangent[1],-sign*tangent[0]],yaw:Math.atan2(-tangent[1],tangent[0]),sourceEdge:sourceIndices&&(sourceIndices[(i+1)%ring.length]===(sourceIndices[i]+1)%19)?sourceIndices[i]:null};});
}
const at=(e,u,d=0)=>[e.a[0]+e.tangent[0]*u+e.normal[0]*d,e.a[1]+e.tangent[1]*u+e.normal[1]*d];

function frame(r,e,u0,u1,y0,y1,material,depth,label){
  if(!(u1>u0&&y1>y0))return;
  const [x,z]=at(e,(u0+u1)/2,depth/2-.012);
  r.box(material,x,(y0+y1)/2,z,u1-u0,y1-y0,depth,label,e.yaw);
  r.parts.at(-1).castShadow=false;
}

function patches(r,material,quads,label){
  if(!quads.length)return;
  const origin=quads[0][0],vertices=[],indices=[];
  for(const q of quads){const k=vertices.length/3;for(const p of q)vertices.push(p[0]-origin[0],p[1]-origin[1],p[2]-origin[2]);indices.push(k,k+1,k+2,k,k+2,k+3);}
  r.add({type:'mesh',vertices,indices,flatShading:true},material,origin,[1,1,1],[0,0,0],label);r.parts.at(-1).castShadow=false;
}

function panel(e,u0,u1,y0,y1,d=.025){
  const a=at(e,u0,d),b=at(e,u1,d);
  // Edge order is CCW in XZ; this order faces the exterior, not into the shell.
  return [[a[0],y0,a[1]],[a[0],y1,a[1]],[b[0],y1,b[1]],[b[0],y0,b[1]]];
}

function addTowerFacade(r,plan,ground,quality){
  const light=[],dark=[],grid=[],roofBands=[],walls=edges(plan.tower,MAIN);
  for(const[eIndex,e]of walls.entries()){
    const top0=roofProfile(plan,e.a[1]),top1=roofProfile(plan,e.b[1]),topAt=u=>lerp(top0,top1,u/e.length);
    // Whole folded elevations remain on their source wall planes. The lower
    // central top is actual geometry, not a painted black rectangle.
    const columns=Math.max(1,Math.round(e.length/2.8)),bay=e.length/columns;
    for(let c=0;c<columns;c++)for(let row=3;row<27;row++){
      const u0=c*bay+.18,u1=(c+1)*bay-.18,y0=row*FLOOR+.45,y1=Math.min((row+1)*FLOOR-.45,topAt(u0)-.45,topAt(u1)-.45);
      if(y1<=y0||y0<PODIUM+.1)continue;
      // Sparse neutral sky/reflection variation; no random luminous windows.
      const phase=(c*7+row*3+eIndex*2)%11;
      if(phase<(quality==='standard'?3:1))light.push(panel(e,u0,u1,ground+y0,ground+y1));
      else if(quality==='standard'&&phase===8)dark.push(panel(e,u0,u1,ground+y0,ground+y1));
    }
    for(let row=4;row<27;row++){
      const y=row*FLOOR;
      if(y>Math.min(top0,top1)-.35)continue;
      const h=row%3===0?.18:.10;
      grid.push(panel(e,.02,e.length-.02,ground+y-h/2,ground+y+h/2,.045));
    }
    const stride=quality==='standard'?1:2;
    for(let c=1;c<columns;c+=stride){
      const u=c*bay;
      frame(r,e,u-.045,u+.045,ground+PODIUM+.12,ground+topAt(u)-.30,'millenniumMetal',.09,'unmeasured vertical curtain-wall mullion');
    }
    const a=at(e,.015,.055),b=at(e,e.length-.015,.055),ya=ground+top0,yb=ground+top1;
    roofBands.push([[a[0],ya-.30,a[1]],[a[0],ya-.08,a[1]],[b[0],yb-.08,b[1]],[b[0],yb-.30,b[1]]]);
  }
  patches(r,'millenniumGlassLight',light,'unmeasured sparse neutral reflected-sky panes');
  patches(r,'millenniumGlassDark',dark,'unmeasured sparse darker glazing panes');
  patches(r,'millenniumMetal',grid,'27-floor-reference horizontal curtain-wall rhythm');
  patches(r,'millenniumMetal',roofBands,'profile-following two-wing crown rim');

  // Two groups of taller terminal ribs, located on actual convex-end walls.
  const sourceEdges=edges(plan.ring,plan.ring.map((_,i)=>i));
  for(const index of [18,15]){
    const e=sourceEdges[index];
    for(const u of [e.length*.12,e.length*.88])frame(r,e,u-.12,u+.12,ground+PODIUM,ground+103.85,'millenniumMetal',.18,'terminal wing full-height paired silver seam');
  }
}

function addPodiumFacade(r,plan,ground,quality){
  const glass=[],seams=[];
  for(const e of edges(plan.ring)){
    const columns=Math.max(1,Math.floor(e.length/(quality==='standard'?3.7:6))),bay=e.length/columns;
    for(let c=0;c<columns;c++){
      const a=c*bay+.45,b=(c+1)*bay-.45;
      if(b-a>.8)glass.push(panel(e,a,b,ground+1.1,ground+7.8,.026));
    }
    // Cladding course lines stay below the low podium roof. No canopy extends
    // into streets or outside the mapped footprint in this isolated candidate.
    for(const y of [8.6,10.0])seams.push(panel(e,.03,e.length-.03,ground+y,ground+y+.035,.035));
  }
  patches(r,'millenniumGlassDark',glass,'stone podium recessed-appearing window bays, inferred');
  patches(r,'millenniumMetal',seams,'stone podium cladding course seams, inferred');
}

function addName(r,plan,ground){
  const e=edges(plan.ring,plan.ring.map((_,i)=>i))[16],centerU=e.length-6.9,normal=[e.normal[0],0,e.normal[1]],yaw=Math.atan2(normal[0],normal[2]);
  for(const[text,size,y]of[['GRAND',1.2,93.1],['MILLENNIUM',1.8,91.5]]){
    const word=secondIdentityWord(text,.20),width=word.width*size,height=word.height*size;
    if(centerU-width/2<.4||centerU+width/2>e.length-.4)throw Error('Millennium lettering escaped its single mapped recessed-glass wall.');
    const [x,z]=at(e,centerU,.20/2-.015),partIndex=r.parts.length,center=[x,ground+y,z];
    r.add(word.geometry,'millenniumLetter',center,[size,size,1],[0,yaw,0],'photograph-supported white '+text);
    r.parts.at(-1).castShadow=false;
    const wall=at(e,centerU);
    r.metadata.signs.push({text,partIndex,center,width,height,depth:.2,normal,yaw,sourceId:MILLENNIUM_ID,sourceEdge:16,wallPoint:[wall[0],ground+y,wall[1]],wallNormal:normal,backEmbed:.015,frontProjection:.185,attachment:'Actual western recess edge 16; photographic compass correspondence inferred, not independently geolocated',photoSupportedText:true,logoEmblem:false});
  }
}

/** Pure world-coordinate recipe.
 * groundAt(x,z) selects the same max-of-vertices+centroid datum as context hosts.
 * baseY is an alternative explicit ORIGINAL CONTEXT WALL BASE (normally 0.8m
 * above terrain). The building's 104m height is above ground, not above baseY.
 */
export function millenniumCorrectionRecipe(feature,{quality='standard',groundAt,baseY}={}){
  if(!['standard','low'].includes(quality))throw Error('Millennium quality must be standard or low.');
  if(groundAt!==undefined&&typeof groundAt!=='function')throw Error('groundAt must be a function.');
  if(baseY!==undefined&&!Number.isFinite(baseY))throw Error('baseY must be a finite original context wall datum.');
  if(groundAt!==undefined&&baseY!==undefined)throw Error('Pass groundAt or baseY, not both.');
  const plan=millenniumPlan(feature),baseline=contextDetailHost(feature);
  const samples=groundAt?[...plan.ring,plan.center].map(([x,z])=>Number(groundAt(x,z))):null;
  if(samples?.some(y=>!Number.isFinite(y)))throw Error('groundAt returned a non-finite elevation.');
  const ground=baseY!==undefined?baseY-.8:samples?Math.max(...samples):baseline.ground;
  const wallBase=ground+.8,roofHeights=plan.tower.map(([,z])=>roofProfile(plan,z));
  const r=new Recipe('Grand Millennium Beijing / isolated estimated-height correction',{
    buildings:1,sourceId:MILLENNIUM_ID,quality,status:'standalone candidate; not integrated',height:104,heightStatus:'estimated',heightSource:MILLENNIUM_EVIDENCE.height,sourceIds:[MILLENNIUM_ID],evidence:MILLENNIUM_EVIDENCE,
    baseline:{sourceHeight:feature.properties.height,sourceHeightStatus:feature.properties.heightSource,inferredRenderHeight:baseline.height,renderFacadeMode:baseline.mode,renderFacadeFamily:baseline.profile.family,baseY:baseline.baseY,groundY:baseline.ground,sourceUntouched:true},
    grounding:{groundY:ground,baseY:wallBase,roofMaxY:ground+104,method:baseY!==undefined?'explicit original-context wall base minus 0.8m':samples?'max groundAt over original ring vertices and centroid':'existing context host ground datum',foundationWithinOriginalRing:true},
    plan:{sourceRingHash:MILLENNIUM_RING_HASH,originalRing:plan.closed,area:plan.area,towerArea:plan.towerArea,podiumWingArea:plan.podiumWingArea,sourceVertexIndices:plan.sourceVertexIndices,internalCut:[5,10],planChange:0,photoFaceEdges:[16,17],photoFaceOrientation:'approximately west; inferred',noNewLandOccupation:true},
    massing:{highestPoint:104,centralRecessRoof:96,podiumHeight:PODIUM,towerSourceVertexHeights:MAIN.map((sourceVertex,i)=>({sourceVertex,height:roofHeights[i]})),method:'Exact mapped western multi-wing polygon with a lower middle and taller north/south terminal wings; low eastern extension is retained. Heights interpolate on the actual outline, not a 104m bounding-box extrusion.',partitionStatus:'inferred from source concavities and published photos; not surveyed'},
    signs:[],verifiedNameBuildingCount:1,geometryBudget:MILLENNIUM_LIMITS,noTextures:true,noNewLights:true,noGuessedEmblems:true,noSurveyClaim:true,noDataMutation:true,noAutoReplacement:true,
    integration:'Caller must explicitly suppress the original context host and its attached details before adding this replacement, while keeping baseline data and controls available. This module performs no suppression or registration.'
  });
  const anchor=[plan.center[0],ground,plan.center[1]];
  r.add(shell(plan.ring,0,.8,plan.center,{bottom:true}),'millenniumStone',anchor,[1,1,1],[0,0,0],'foundation retaining the entire original mapped footprint');
  r.add(shell(plan.ring,.8,PODIUM,plan.center,{top:false}),'millenniumStone',anchor,[1,1,1],[0,0,0],'low stone podium over unchanged source footprint');
  r.add(shell(plan.podiumWing,PODIUM,PODIUM,plan.center,{walls:false}),'millenniumRoof',anchor,[1,1,1],[0,0,0],'eastern low wing roof at inferred 11.5m');
  r.add(shell(plan.tower,PODIUM,i=>roofHeights[i],plan.center,{top:false}),'millenniumGlass',anchor,[1,1,1],[0,0,0],'western multi-wing glass shell with physically recessed west edge');
  r.add(shell(plan.tower,PODIUM,i=>roofHeights[i],plan.center,{walls:false}),'millenniumRoof',anchor,[1,1,1],[0,0,0],'lower middle and two higher terminal-wing roof groups');
  addTowerFacade(r,plan,ground,quality);addPodiumFacade(r,plan,ground,quality);addName(r,plan,ground);
  const triangles=r.parts.reduce((n,p)=>n+(p.geometry.type==='box'?12:p.geometry.indices.length/3),0),materials=[...new Set(r.parts.map(p=>p.material))];
  r.metadata.stats={parts:r.parts.length,triangles,materialBatches:materials.length,materials};
  if(triangles>MILLENNIUM_LIMITS.maxTriangles||materials.length>MILLENNIUM_LIMITS.maxMaterialBatches)throw Error('Millennium independent candidate exceeded its bounded geometry budget.');
  return r;
}
