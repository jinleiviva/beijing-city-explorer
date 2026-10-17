import * as THREE from '../vendor/three.module.js';
import {decorateContextArchitecture} from './context-architecture-surfaces.js';
import {Recipe} from './architecture/geometry.js';
import {buildingRecipe} from './architecture/index.js';

/** Coarse city is always present. Fine instance buffers are built only around the
 * camera, at most one chunk per frame, and released when outside the bounded cache. */
export function createDetailStreamer({maxActive=12}={}){
 const entries=[];let frame=0,built=0,released=0,peakActive=0,lastBuildMs=0;
 function register({node,coarse,build,threshold=1300,radius=0,name='',onDispose,onVisibility}){const e={node,coarse,build,threshold,radius,name,detail:null,lastUsed:0,onDispose,onVisibility,detailVisible:false};entries.push(e);node.add(coarse);return e;}
 function setDetailVisible(e,value){if(e.detailVisible===value)return;e.detailVisible=value;e.onVisibility?.(value);}
 function release(e){if(!e.detail)return;e.node.remove(e.detail);const geometries=new Set(),materials=new Set();e.detail.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!o.geometry.name.startsWith('Beijing_geometry_'))geometries.add(o.geometry);for(const material of Array.isArray(o.material)?o.material:o.material?[o.material]:[])if(!material.name.startsWith('Beijing_'))materials.add(material);});for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}e.onDispose?.(e.detail);e.detail=null;e.coarse.visible=true;setDetailVisible(e,false);released++;}
 function update(camera,quality='standard'){
  frame++;const cameraPosition=camera.position,limit=quality==='low'?Math.max(4,Math.floor(maxActive*.5)):maxActive;
  for(const e of entries){e.distance=cameraPosition.distanceTo(e.node.position);e.wanted=e.node.parent?.visible!==false&&e.distance<e.threshold*(quality==='low'?.65:1)+e.radius;if(e.detail){e.detail.visible=e.wanted;e.coarse.visible=!e.wanted;setDetailVisible(e,e.wanted);if(e.wanted)e.lastUsed=frame;if(e.distance>e.threshold*2.1+e.radius)release(e);}}
  let held=entries.filter(e=>e.detail);while(held.length>limit){const old=held.sort((a,b)=>Number(a.wanted)-Number(b.wanted)||b.distance-a.distance)[0];release(old);held=entries.filter(e=>e.detail);}
  const active=entries.filter(e=>e.detail),pending=entries.filter(e=>e.wanted&&!e.detail&&!e.failed).sort((a,b)=>a.distance-b.distance);
  if(pending.length){if(active.length>=limit){const old=active.filter(e=>!e.wanted).sort((a,b)=>a.lastUsed-b.lastUsed)[0]||active.filter(e=>e.distance>pending[0].distance+250).sort((a,b)=>b.distance-a.distance)[0];if(old)release(old);else return;}
   const e=pending[0],start=performance.now();try{e.detail=e.build();e.node.add(e.detail);e.coarse.visible=false;setDetailVisible(e,true);e.lastUsed=frame;built++;}catch(error){e.failed=String(error);console.error('Detail streaming failed',e.name,error);}lastBuildMs=performance.now()-start;
  }
  peakActive=Math.max(peakActive,entries.filter(e=>e.detail).length);
 }
 function stats(){return{entries:entries.length,active:entries.filter(e=>e.detail).length,wanted:entries.filter(e=>e.wanted).length,built,released,peakActive,lastBuildMs,failures:entries.filter(e=>e.failed).map(e=>({name:e.name,error:e.failed})),policy:'Full-city silhouettes always visible; near geometry generated serially, bounded detail cache; far instance buffers released'};}
 return{register,update,stats,entries};
}

function coarseRecipe(instances){
 const r=new Recipe('Distant district architecture');
 for(const i of instances){
  if(['hutong','gray_tile_wing'].includes(i.family)){r.merge(buildingRecipe(i.family,{...i,detail:-1}),[i.x,i.y||0,i.z],i.rotation||0);continue;}
  const local=new Recipe('distant building'),w=i.width,d=i.depth,h=i.height;
  const glass=['cbd','tower','sanlitun'].includes(i.family),material=glass?'glassPale':i.family==='financial'?'stoneLight':'concrete';
  if(h>40&&['cbd','financial','tower'].includes(i.family)){const podium=Math.min(17,h*.20);local.box(i.family==='financial'?'stone':'glassDark',0,podium/2,0,w,podium,d,'distant podium');local.box(material,0,podium+(h-podium)/2,0,w*.78,h-podium,d*.74,'distant tower');local.box('metalDark',0,h+.4,0,w*.61,.8,d*.58,'distant roof equipment screen');}
  else{local.box(material,0,h/2,0,w,h,d,'distant commercial or residential block');local.box('stoneDark',0,h+.2,0,w,.4,d,'distant roof cap');}
  r.merge(local,[i.x,i.y||0,i.z],i.rotation||0);
 }
 return r;
}

/** Staged replacement for createStreamedDistricts/Neighborhoods. Apply after QA source freeze. */
function makeRegionalCoarse(kit,instances,streamer,{tileSize,threshold,oldCity=false,regionSize=2400}){
 const root=new THREE.Group(),nearRoot=new THREE.Group(),tiles=new Map(),regions=new Map(),links=new Map(),visibility=new Map(),matrix=new THREE.Matrix4(),hidden=new THREE.Matrix4().makeScale(0,0,0),shadowRoots=[];
 root.name=oldCity?'Streamed old-city courtyards':'Spatially streamed district architecture';root.add(nearRoot);
 for(const i of instances){const key=`${Math.floor(i.x/tileSize)},${Math.floor(i.z/tileSize)}`,region=`${Math.floor(i.x/regionSize)},${Math.floor(i.z/regionSize)}`;if(!tiles.has(key))tiles.set(key,{x:(Math.floor(i.x/tileSize)+.5)*tileSize,z:(Math.floor(i.z/tileSize)+.5)*tileSize,instances:[]});tiles.get(key).instances.push(i);if(!regions.has(region))regions.set(region,[]);regions.get(region).push({...i,coarseOwner:key});}
 let farParts=0;
 for(const [key,list] of regions){const recipe=new Recipe('Regional coarse architecture '+key);for(const i of list){const r=oldCity?buildingRecipe(i.family,{...i,detail:-1}):coarseRecipe([{...i,x:0,y:0,z:0,rotation:0}]);const first=recipe.parts.length;recipe.merge(r,[i.x,i.y||0,i.z],i.rotation||0);for(let n=first;n<recipe.parts.length;n++)recipe.parts[n].label=i.coarseOwner+'|'+recipe.parts[n].label;}
  const proxy=kit.buildRecipe(recipe,{castShadow:false});if(!oldCity)decorateContextArchitecture(proxy,kit.materials);root.add(proxy);shadowRoots.push(proxy);farParts+=recipe.parts.length;
  for(const mesh of proxy.children)for(let index=0;index<mesh.count;index++){const owner=mesh.userData.partLabels[index].split('|')[0];if(!links.has(owner))links.set(owner,[]);mesh.getMatrixAt(index,matrix);links.get(owner).push({mesh,index,matrix:matrix.clone()});}
 }
 function visible(key,value){if(visibility.get(key)===value)return;visibility.set(key,value);for(const link of links.get(key)||[]){link.mesh.setMatrixAt(link.index,value?link.matrix:hidden);link.mesh.instanceMatrix.needsUpdate=true;}}
 for(const [key,t] of tiles){const node=new THREE.Group();node.position.set(t.x,0,t.z);const local=t.instances.map(i=>({...i,x:i.x-t.x,z:i.z-t.z}));streamer.register({node,coarse:new THREE.Group(),name:(oldCity?'old city ':'district ')+key,threshold,radius:tileSize*.5,onVisibility:value=>visible(key,!value),build:()=>{const batch=kit.createBatch(local.map(i=>({...i,detail:0})),{detail:0,chunkSize:0});return oldCity?batch:decorateContextArchitecture(batch,kit.materials);}});nearRoot.add(node);}
 root.userData.updateWide=distance=>{nearRoot.visible=distance<=3300;};root.userData.coarseShadowRoots=shadowRoots;
 root.userData.architectureStats={buildings:instances.length,tiles:tiles.size,coarseRegions:regions.size,farParts,streamed:true,policy:'Regional low-call proxies always present; individual tile matrices hidden only when corresponding fine geometry is visible'};return root;
}
export function createStreamedDistricts(kit,instances,streamer,{tileSize=800,threshold=1350}={}){return makeRegionalCoarse(kit,instances,streamer,{tileSize,threshold});}
export function createStreamedNeighborhoods(kit,instances,streamer,{tileSize=600,threshold=650}={}){return makeRegionalCoarse(kit,instances,streamer,{tileSize,threshold,oldCity:true});}
