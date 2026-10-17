import * as THREE from '../vendor/three.module.js';
import {SpatialGrid} from './spatial.js';
import {contextMaterial} from './context-buildings.js';
import {decorateFarContext} from './context-surfaces.js';
const BASE='../data/runtime/';
const json=n=>fetch(BASE+n).then(r=>{if(!r.ok)throw Error(`Runtime cache missing: ${n}. Run node scripts/build-runtime-cache.mjs`);return r.json();});
const binary=(n,signal)=>fetch(BASE+n,{signal}).then(r=>{if(!r.ok)throw Error('Runtime buffer missing: '+n);return r.arrayBuffer();});
export async function loadRuntimePlan(){
 const [manifest,placement,headers,points,farTiles,farBuffer]=await Promise.all([json('manifest.json'),json('placement.json'),json('collision-index.json'),binary('collision.bin'),json('context-far-tiles.json'),binary('context-far.bin')]);
 if(manifest.schema!=='beijing-runtime-cache-1')throw Error('Unsupported city runtime cache schema');
 const values=new Float32Array(points),collision=new SpatialGrid(90);for(const [offset,count,...bb] of headers){const ring=values.subarray(offset*2,(offset+count)*2);collision.insert({flatRing:ring,bb},bb);}
 const heritage=placement.heritage;heritage.frontageMask=new SpatialGrid(50);for(const item of heritage.fronts)heritage.frontageMask.insert(item,item.bb);delete heritage.fronts;
 return{manifest,placement,heritage,collision,farTiles,farValues:new Float32Array(farBuffer)};
}
export function createCachedContext(plan,{maxLoaded=10}={}){
 const group=new THREE.Group();group.name='OSM context buildings — geographic far proxies and streamed exact footprints';
 const nearMaterial=contextMaterial(),farMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.88,metalness:.02});
 decorateFarContext(farMaterial);
 const groups=new Map(),farLinks=new Map(),rows=plan.farValues,stride=plan.manifest.farStride;
 for(let i=0;i<plan.manifest.farCount;i++){const x=rows[i*stride],z=rows[i*stride+1],key=`${Math.floor(x/2400)},${Math.floor(z/2400)}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);}
 const base=new THREE.BoxGeometry(1,1,1),matrix=new THREE.Matrix4(),color=new THREE.Color();
 for(const [key,list] of groups){const geo=base.clone(),roof=new Float32Array(list.length),facadeModes=new Float32Array(list.length),mesh=new THREE.InstancedMesh(geo,farMaterial,list.length);mesh.name='Far mapped context '+key;mesh.castShadow=false;mesh.receiveShadow=true;
  list.forEach((row,index)=>{const off=row*stride,[x,z,w,d,h,r,g,b,old,ground=0,mode=0,baseY=.8]=rows.subarray(off,off+stride);matrix.makeScale(w,Math.max(.25,h-baseY),d);matrix.setPosition(x,(h+baseY)/2+ground,z);mesh.setMatrixAt(index,matrix);mesh.setColorAt(index,color.setRGB(r,g,b));roof[index]=old;facadeModes[index]=mode;const tile=plan.farTiles[row];if(!farLinks.has(tile))farLinks.set(tile,[]);farLinks.get(tile).push({mesh,index,matrix:matrix.clone()});});geo.setAttribute('facadeMode',new THREE.InstancedBufferAttribute(facadeModes,1));geo.setAttribute('oldRoof',new THREE.InstancedBufferAttribute(roof,1));mesh.computeBoundingSphere();group.add(mesh);
 }
 base.dispose();const tiles=plan.manifest.chunks.map(c=>({...c,mesh:null,loading:false,failed:null,last:0})),hidden=new THREE.Matrix4().makeScale(0,0,0);let pending=0,loadedCount=0,peak=0,fetchBytes=0,releases=0,frame=0;
 function farVisible(tile,visible){for(const f of farLinks.get(tile.tile)||[]){f.mesh.setMatrixAt(f.index,visible?f.matrix:hidden);f.mesh.instanceMatrix.needsUpdate=true;}}
 function release(tile){if(!tile.mesh)return;group.remove(tile.mesh);tile.mesh.geometry.dispose();tile.mesh=null;loadedCount--;releases++;farVisible(tile,true);}
 async function load(tile){tile.loading=true;tile.controller=new AbortController();pending++;try{const buf=await binary(tile.file,tile.controller.signal);if(!tile.wanted)return;if(buf.byteLength!==tile.bytes)throw Error('Byte length mismatch '+tile.file);const geo=new THREE.BufferGeometry();for(const [name,a] of Object.entries(tile.geometry.attributes))geo.setAttribute(name,new THREE.BufferAttribute(new Float32Array(buf,a.byteOffset,a.length),a.itemSize));const a=tile.geometry.index;geo.setIndex(new THREE.BufferAttribute(new Uint32Array(buf,a.byteOffset,a.length),1));geo.computeBoundingSphere();const m=new THREE.Mesh(geo,nearMaterial);m.name='Exact OSM footprint tile '+tile.tile;m.castShadow=true;m.receiveShadow=true;tile.mesh=m;group.add(m);farVisible(tile,false);loadedCount++;peak=Math.max(peak,loadedCount);fetchBytes+=buf.byteLength;}catch(e){if(e.name!=='AbortError'){tile.failed=String(e);console.error(e);}}finally{pending--;tile.loading=false;tile.controller=null;}}
 const cameraPosition=new THREE.Vector3();
 function update(camera,distance,quality='standard'){frame++;cameraPosition.copy(camera.position);const limit=quality==='low'?5:maxLoaded;for(const t of tiles){t.distance=Math.hypot(cameraPosition.x-t.center[0],cameraPosition.y,cameraPosition.z-t.center[2]);t.wanted=t.distance<1800+t.radius;if(t.loading&&!t.wanted)t.controller?.abort();if(t.mesh){if(t.wanted)t.last=frame;if(t.distance>3200+t.radius)release(t);}}
  while(loadedCount>limit){const old=tiles.filter(t=>t.mesh).sort((a,b)=>b.distance-a.distance)[0];if(!old)break;release(old);}if(pending)return;const candidate=tiles.filter(t=>t.wanted&&!t.mesh&&!t.loading&&!t.failed).sort((a,b)=>a.distance-b.distance)[0];if(!candidate)return;if(loadedCount>=limit){const old=tiles.filter(t=>t.mesh&&!t.wanted).sort((a,b)=>a.last-b.last)[0]||tiles.filter(t=>t.mesh&&t.distance>candidate.distance+300).sort((a,b)=>b.distance-a.distance)[0];if(!old)return;release(old);}load(candidate);
 }
 group.userData={...plan.manifest.contextStats,cache:'Versioned per-tile indexed buffers; far proxies use mapped bounding extents, not exact footprints'};
 return{group,update,stats:()=>({loaded:loadedCount,pending,peak,releases,downloadedBytes:fetchBytes,availableTiles:tiles.length,farRegionCalls:groups.size,failures:tiles.filter(t=>t.failed).map(t=>({tile:t.tile,error:t.failed}))})};
}
