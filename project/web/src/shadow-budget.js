import * as THREE from '../vendor/three.module.js';
/** Only nearby coarse architecture joins the shadow pass. No global shadow blanket. */
export function createFocusedShadowBudget(){
 const baseline=new WeakMap(),sphere=new THREE.Sphere();let last=-Infinity,stats={enabled:false,candidateMeshes:0,additionalCasters:0};
 function update(roots,target,range,enabled,time,force=false){
  if(!force&&time-last<350)return;last=time;let candidates=0,additional=0;
  for(const root of roots){if(!root)continue;root.updateWorldMatrix(true,true);root.traverse(o=>{
   if(!o.isMesh)return;if(!baseline.has(o))baseline.set(o,o.castShadow);const original=baseline.get(o);
   if(original)return;candidates++;if(!enabled){o.castShadow=false;return;}
   if(o.isInstancedMesh){if(!o.boundingSphere)o.computeBoundingSphere();sphere.copy(o.boundingSphere);}else{if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();sphere.copy(o.geometry.boundingSphere);}
   sphere.applyMatrix4(o.matrixWorld);
   // Global merged city proxies have enormous bounds. They remain outside this pass.
   const near=sphere.radius<2100&&Math.hypot(sphere.center.x-target.x,sphere.center.z-target.z)<range+sphere.radius;
   o.castShadow=near;if(near)additional++;
  });}
  stats={enabled,candidateMeshes:candidates,additionalCasters:additional,focusRadiusMetres:range,maximumProxyRadiusMetres:2100};
 }
 return{update,stats:()=>({...stats})};
}
