import {project,pointInRing} from '../geo.js';
export const SHARED_CBD_VERSION='cbd11-shared-1';
export function cbdOwnership(data){
 const ids=(items,label)=>{const values=items.map(f=>f.id);if(values.some(x=>!x)||new Set(values).size!==values.length)throw Error('Invalid '+label+' ownership IDs');return new Set(values);};
 const ground=ids(data.ground,'ground'),buildings=ids(data.collisionBuildings,'building'),landmarks=ids(data.landmarks,'landmark'),rich=ids(data.rich,'rich'),landuse=ids(data.landuse,'landuse'),sites=new Set(data.sites.map(s=>s.osmId));
 const [w,s,e,n]=data.boundsWGS84,a=project([w,s]),b=project([e,n]);
 const parkRings=data.ground.filter(f=>f.properties.kind==='park').flatMap(f=>(f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates]).map(p=>p.map(r=>r.map(project))));
 const treeCells=new Map(),treeKey=(x,z)=>`${Math.floor(x/6)},${Math.floor(z/6)}`;const nearTree=(x,z)=>{const ix=Math.floor(x/6),iz=Math.floor(z/6);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const t of treeCells.get(`${ix+dx},${iz+dz}`)||[])if(Math.hypot(x-t.x,z-t.z)<6)return true;return false;};
 return {isWithin:(x,z)=>x>=a[0]&&x<=b[0]&&z>=b[1]&&z<=a[1],setTreeSources:records=>{for(const t of records){const k=treeKey(t.x,t.z);if(!treeCells.has(k))treeCells.set(k,[]);treeCells.get(k).push(t);}},version:SHARED_CBD_VERSION,ground,buildings,landmarks,rich,landuse,sites,
  retainGround:f=>!ground.has(f.id),retainLanduse:f=>!landuse.has(f.id),retainRich:f=>!buildings.has(f.id),retainSite:s=>!sites.has(s.osmId),
  excludePlanting:(x,z)=>nearTree(x,z)||(x>=a[0]&&x<=b[0]&&z>=b[1]&&z<=a[1])||parkRings.some(r=>pointInRing(x,z,r[0])&&!r.slice(1).some(h=>pointInRing(x,z,h))),
  assertRuntime:runtime=>{if(runtime.manifest.cbdShared?.version!==SHARED_CBD_VERSION)throw Error('CBD ownership cache/version mismatch');},
 };
}
