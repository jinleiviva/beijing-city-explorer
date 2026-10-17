/** Sparse physical facade detail for the approved ordinary CBD footprints.
 * OSM supplies the envelope; this unmeasured window hardware is a typological
 * approximation registered to the existing procedural facade, not photo truth.
 * These functions only describe geometry and never modify data or materials.
 */
import {Recipe} from '../../architecture/geometry.js';
import {inferredHeight,districtAt} from '../../context-buildings.js';
import {buildingMinHeight,contextRenderFacadeMode} from '../../building-semantics.js';
import {buildingGroundAt} from '../../relief.js';
import {project,polygonArea,centroid,hash,rng,pointInRing,bounds} from '../../geo.js';
import {CBD_CONTEXT_DETAIL_IDS} from './selection.js';

export const FACADE_PROFILES=Object.freeze({
  4:Object.freeze({family:'glass',cellWidth:1.9,cellHeight:3.35,side:.07,frame:.09,depth:.10,material:'metal'}),
  5:Object.freeze({family:'stone',cellWidth:3.7,cellHeight:3.35,side:.23,frame:.14,depth:.14,material:'stoneLight'}),
  6:Object.freeze({family:'residential',cellWidth:2.9,cellHeight:3.35,side:.23,frame:.12,depth:.12,material:'metalDark'}),
  7:Object.freeze({family:'low_podium',cellWidth:4.8,cellHeight:4.4,side:.07,frame:.12,depth:.10,material:'metalDark'}),
});
const ACCURACY='Typological shallow physical details aligned to the existing shader; not surveyed or photo-matched window hardware.';
const CAMERAS=[[5650,440],[4530,-385],[4701.200193410583,-395.1258534203153],[5298.92732723279,-417.6182177759449]];
const HOST_OVERLAP=.02, EDGE_CLEARANCE=.30, ROOF_CLEARANCE=.22;

export function contextDetailHost(feature){
  if(feature?.geometry?.type!=='Polygon'||feature.geometry.coordinates.length!==1)throw Error('CBD context detail requires one simple Polygon: '+feature?.id);
  const p=feature.properties??{},ring=feature.geometry.coordinates[0].map(project),ll=feature.geometry.coordinates[0][0];
  if(p.terrainDrape)throw Error('Draped context is outside the approved CBD detail scope: '+feature.id);
  if(feature.id==='osm-way-156061546')throw Error('The unique conservative 7m override is deliberately excluded.');
  const area=polygonArea(ring),district=districtAt(...ll),height=inferredHeight(p,...ll,rng(hash(feature.id)),area,feature.id);
  const ground=buildingGroundAt(ring),baseY=ground+buildingMinHeight(p,height),roofY=ground+height,mode=contextRenderFacadeMode(p,district,height);
  if(!FACADE_PROFILES[mode])throw Error('Unsupported context facade mode '+mode+' for '+feature.id);
  return {id:feature.id,name:p.name||'',ring,center:centroid(ring),area,district,height,ground,baseY,roofY,mode,profile:FACADE_PROFILES[mode],existingRoofRim:['cbd','financial','sanlitun','wangfujing'].includes(district)&&height>18&&area>350,sourceHeight:p.height,sourceHeightStatus:p.heightSource||''};
}

/** Same edge iteration, skip rule and cumulative U phase as appendContextFootprint. */
export function contextDetailEdges(host){
  let area2=0,phase=0;const ring=host.ring,edges=[];
  for(let i=1;i<ring.length;i++)area2+=ring[i-1][0]*ring[i][1]-ring[i][0]*ring[i-1][1];
  const sign=area2>=0?1:-1;
  for(let i=1;i<ring.length;i++){
    const a=ring[i-1],b=ring[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(length<.2)continue;
    const tangent=[(b[0]-a[0])/length,(b[1]-a[1])/length],normal=[sign*tangent[1],-sign*tangent[0]];
    const midpoint=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    const facing=Math.max(...CAMERAS.map(([x,z])=>{const d=Math.hypot(x-midpoint[0],z-midpoint[1]);return (normal[0]*(x-midpoint[0])+normal[1]*(z-midpoint[1]))/Math.max(d,1);}));
    edges.push({index:i-1,a,b,length,phase,tangent,normal,rotationY:Math.atan2(-tangent[1],tangent[0]),score:Math.log1p(length)+2*facing});
    phase+=length;
  }
  return edges;
}
const at=(edge,u,offset=0)=>[edge.a[0]+edge.tangent[0]*u+edge.normal[0]*offset,edge.a[1]+edge.tangent[1]*u+edge.normal[1]*offset];

/** Prevent a concave corner from giving an outward frame an inward attachment. */
function safeSpan(host,edge,u0,u1){
  if(u0<EDGE_CLEARANCE||u1>edge.length-EDGE_CLEARANCE)return false;
  for(const u of [u0,(u0+u1)/2,u1]){
    const inside=at(edge,u,-HOST_OVERLAP),outside=at(edge,u,.18);
    if(!pointInRing(...inside,host.ring)||pointInRing(...outside,host.ring))return false;
  }
  return true;
}

/** Conservative mapped-neighbor clearance, not an occlusion/visibility claim. */
function clearOfNeighbors(host,edge,u0,u1,y0,y1,depth=.18){
  const obstacles=host.obstacles??[];
  for(const other of obstacles){
    if(other.id===host.id||y0>=other.roofY+.02||y1<=other.baseY-.02)continue;
    const steps=Math.max(2,Math.ceil((u1-u0)/.7));
    for(let i=0;i<=steps;i++)for(const offset of [.001,(depth-.02)/2,depth-.02]){
      const [x,z]=at(edge,u0+(u1-u0)*i/steps,offset),b=other.bounds;
      if(x<b[0]||x>b[2]||z<b[1]||z>b[3])continue;
      if(pointInRing(x,z,other.rings[0])&&!other.rings.slice(1).some(r=>pointInRing(x,z,r)))return false;
    }
  }
  return true;
}

/** Read-only bounded collision envelopes, preserving actual context heights. */
export function contextDetailObstacles(data,{heightOverrides={}}={}){
  const context=new Map(data.contextBuildings.map(f=>[f.id,f]));
  const rich=new Map((data.rich??[]).map(r=>[r.id,r]));
  return (data.collisionBuildings??data.contextBuildings).flatMap(f=>{
    const polygons=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
    return polygons.map(poly=>{
      const rings=poly.map(r=>r.map(project)),ground=buildingGroundAt(rings[0]),p=f.properties??{},cf=context.get(f.id),r=rich.get(f.id);
      let height;
      if(Number.isFinite(heightOverrides[f.id]))height=heightOverrides[f.id];
      else if(cf?.id==='osm-way-156061546')height=7;
      else if(cf)height=inferredHeight(cf.properties,...poly[0][0],rng(hash(f.id)),polygonArea(rings[0]),f.id);
      else height=r?.height??(Number(p.height)||528);
      return {id:f.id,rings,bounds:bounds(rings[0]),baseY:ground,roofY:ground+height+(r?.y??0)};
    });
  });
}

/** Full shader cells only in U; a short host may contain a vertically clipped pane. */
export function contextWindowCandidates(host,edge){
  const p=host.profile,windows=[],w=p.cellWidth,h=p.cellHeight,t=p.frame;
  const first=Math.floor(edge.phase/w)-1,last=Math.ceil((edge.phase+edge.length)/w)+1;
  for(let cell=first;cell<=last;cell++){
    const left=(cell+p.side)*w-edge.phase,right=(cell+1-p.side)*w-edge.phase;
    if(!safeSpan(host,edge,left-t-.04,right+t+.04))continue;
    for(let row=0;row<Math.ceil((host.roofY-host.baseY)/h);row++){
      const bottom=host.baseY+(row+.27)*h,fullTop=host.baseY+(row+.82)*h;
      const clipped=fullTop+t>host.roofY-ROOF_CLEARANCE,top=clipped?host.roofY-ROOF_CLEARANCE:fullTop;
      if(top-bottom<.35)break;
      if(!clearOfNeighbors(host,edge,left-t-.04,right+t+.04,bottom-t-.10,top+(clipped?0:t)))continue;
      windows.push({edgeIndex:edge.index,cell,row,u0:left,u1:right,y0:bottom,y1:top,fullTop,clipped,cellWidth:w,cellHeight:h});
      break;
    }
  }
  return windows;
}

function addBox(recipe,host,edge,{u0,u1,y0,y1,depth,material,kind,windowIndex=null}){
  if(!(u1>u0&&y1>y0&&depth>=.08&&depth<=.18))throw Error('Invalid shallow detail dimensions');
  if(!safeSpan(host,edge,u0,u1)||y0<host.baseY-.000001||y1>host.roofY-ROOF_CLEARANCE+.000001)throw Error('Frame escaped its original host '+host.id+' '+kind);
  if(!clearOfNeighbors(host,edge,u0,u1,y0,y1,depth))throw Error('Frame intersects a mapped neighboring envelope '+host.id+' '+kind);
  const offset=depth/2-HOST_OVERLAP,[x,z]=at(edge,(u0+u1)/2,offset);
  const label=`${host.id} / ${host.profile.family} / ${kind}${windowIndex===null?'':' '+(windowIndex+1)}`;
  recipe.box(material,x,(y0+y1)/2,z,u1-u0,y1-y0,depth,label,edge.rotationY);
  const part=recipe.parts.at(-1);part.castShadow=false;
  part.detail={sourceId:host.id,kind,edgeIndex:edge.index,windowIndex,u0,u1,y0,y1,normal:edge.normal,depth,hostOverlap:HOST_OVERLAP};
}

function addWindow(recipe,host,edge,window,index,quality){
  const p=host.profile,t=p.frame,{u0,u1,y0,y1,clipped}=window;
  const box=(a,b,c,d,kind,material=p.material,depth=p.depth)=>addBox(recipe,host,edge,{u0:a,u1:b,y0:c,y1:d,depth,material,kind,windowIndex:index});
  box(u0-t,u0,y0-t,y1+(clipped?0:t),'window left reveal');
  box(u1,u1+t,y0-t,y1+(clipped?0:t),'window right reveal');
  box(u0,u1,y0-t,y0,'window bottom rail');
  if(!clipped)box(u0,u1,y1,y1+t,'window head rail');
  // Sills stay below the shader pane. No artificial transom across a clipped pane.
  if(quality==='standard'&&(p.family==='stone'||p.family==='residential'))box(u0-t-.025,u1+t+.025,y0-t-.09,y0-t,'projecting window sill','stoneLight',.18);
}

function chooseWindows(host,quality){
  const candidates=contextDetailEdges(host).map(edge=>({edge,windows:contextWindowCandidates(host,edge)})).filter(x=>x.windows.length).sort((a,b)=>b.edge.score-a.edge.score||a.edge.index-b.edge.index);
  if(!candidates.length)return [];
  const selected=candidates.slice(0,2),out=[],target=quality==='low'?2:3;
  // One group on each safe face first, then a separated group on the first face.
  for(const [i,{edge,windows}]of selected.entries()){
    const item=windows[Math.floor(windows.length*(i===0?.35:.60))];out.push({edge,window:item});
  }
  for(const {edge,windows} of selected){
    const sorted=[...windows].sort((a,b)=>Math.abs(b.u0-edge.length*.73)-Math.abs(a.u0-edge.length*.73));
    while(sorted.length&&out.length<target){const w=sorted.pop();if(!out.some(q=>q.edge.index===edge.index&&q.window.cell===w.cell))out.push({edge,window:w});}
  }
  return out.slice(0,target);
}

/** Single-footprint pure recipe; never alters its source or claims image validation. */
export function cbdContextDetailRecipe(feature,{quality='standard',obstacles=[]}={}){
  if(!['standard','low'].includes(quality))throw Error('Use quality standard or low.');
  const host=contextDetailHost(feature),recipe=new Recipe('CBD context '+host.id,{buildings:0,sourceId:host.id,quality,accuracy:ACCURACY});
  host.obstacles=obstacles;
  const selections=chooseWindows(host,quality);
  for(const [i,{edge,window}]of selections.entries())addWindow(recipe,host,edge,window,i,quality);
  const usedEdges=[...new Map(selections.map(s=>[s.edge.index,s.edge])).values()];
  // A shallow low base seam lives below the first pane and is attached to the host.
  for(const edge of usedEdges.slice(0,quality==='low'?1:2)){
    const group=selections.filter(s=>s.edge.index===edge.index),u0=Math.min(...group.map(s=>s.window.u0))-.12,u1=Math.max(...group.map(s=>s.window.u1))+.12;
    if(safeSpan(host,edge,u0,u1)&&clearOfNeighbors(host,edge,u0,u1,host.baseY+.16,host.baseY+.24,.08))addBox(recipe,host,edge,{u0,u1,y0:host.baseY+.16,y1:host.baseY+.24,depth:.08,material:'paving',kind:'attached base course seam'});
  }
  if(!recipe.parts.length)throw Error('No safe nonempty detail generated for '+host.id);
  if(recipe.parts.length*12>240)throw Error('Per-footprint triangle budget exceeded: '+host.id);
  const windows=selections.map(({edge,window:w})=>{
    const left=at(edge,w.u0),right=at(edge,w.u1),center=at(edge,(w.u0+w.u1)/2);
    return {...w,normal:[edge.normal[0],0,edge.normal[1]],worldCenter:[center[0],(w.y0+w.y1)/2,center[1]],worldFacadeCorners:[[left[0],w.y0,left[1]],[right[0],w.y0,right[1]],[right[0],w.y1,right[1]],[left[0],w.y1,left[1]]],coordinateMeaning:'Original host wall/shader pane boundary in metres; shallow hardware projects outward from this plane.'};
  });
  recipe.metadata={...recipe.metadata,host:{id:host.id,name:host.name,height:host.height,ground:host.ground,baseY:host.baseY,roofY:host.roofY,mode:host.mode,family:host.profile.family,sourceHeight:host.sourceHeight,sourceHeightStatus:host.sourceHeightStatus,existingRoofRim:host.existingRoofRim},windows,edges:usedEdges,partCount:recipe.parts.length,triangles:recipe.parts.length*12,labels:recipe.parts.map(p=>p.label),clippedWindows:selections.filter(s=>s.window.clipped).length,roofGeometryAdded:false,signageAdded:false};
  return recipe;
}

/** The selected IDs are only counted after their actual nonempty recipe exists. */
export function cbdContextDetailsRecipe(data,{quality='standard',ids=CBD_CONTEXT_DETAIL_IDS,heightOverrides={}}={}){
  const allowed=new Set(CBD_CONTEXT_DETAIL_IDS),features=new Map(data.contextBuildings.map(f=>[f.id,f])),obstacles=contextDetailObstacles(data,{heightOverrides});
  if(new Set(ids).size!==ids.length||ids.some(id=>!allowed.has(id)))throw Error('Requested IDs must be a unique subset of the approved 100.');
  const recipe=new Recipe('CBD shader-registered shallow context details',{buildings:0,quality,accuracy:ACCURACY,visualReview:'pending parent CPU/image inspection',neighborClearance:'Mapped collision envelopes checked at candidate/window height; lowest unobstructed shader row used. This is not rendered visibility proof.',texturesAdded:0,lightsAdded:0,sourceHeightsChanged:false,sourceFootprintsChanged:false,placements:[]});
  for(const id of ids){
    if(!features.has(id))throw Error('Approved context feature missing: '+id);
    const child=cbdContextDetailRecipe(features.get(id),{quality,obstacles});
    recipe.merge(child);recipe.metadata.placements.push(child.metadata);
  }
  recipe.metadata.coveredSourceIds=[...new Set(recipe.parts.map(p=>p.detail.sourceId))];
  recipe.metadata.coverageCount=recipe.metadata.coveredSourceIds.length;
  recipe.metadata.addedTriangles=recipe.parts.length*12;
  recipe.metadata.materialKeys=[...new Set(recipe.parts.map(p=>p.material))];
  if(recipe.metadata.addedTriangles>24000||recipe.metadata.materialKeys.length>4)throw Error('Combined context detail budget exceeded.');
  return recipe;
}
