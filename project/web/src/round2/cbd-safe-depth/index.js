import * as T from '../../../vendor/three.module.js';

/** Move only the rendering near plane into demonstrably empty camera space.
 * The complete near-plane rectangle stays inside a ball that does not touch
 * any visible mesh's conservative world AABB. No road surface is removed.
 * Simulation, controls, picking and streaming keep the original source camera.
 * Current city shaders alter color/normals, not vertex positions. Unsupported
 * deforming/renderable objects conservatively disable the adaptation.
 */
export function createCbdSafeDepthCamera(){
 const geometryCache=new WeakMap(),meshCache=new WeakMap(),renderCamera=new T.PerspectiveCamera(),eye=new T.Vector3(),corner=new T.Vector3();
 let report={enabled:false,sourceNear:null,renderNear:null,browserTemporalAcceptance:false};
 function geometryBounds(g){
  const p=g?.attributes?.position;if(!p)return null;
  const version=p.isInterleavedBufferAttribute?p.data.version:p.version;
  const prev=geometryCache.get(g);if(!prev||prev.position!==p||prev.version!==version){g.computeBoundingBox();geometryCache.set(g,{position:p,version});}
  return g.boundingBox;
 }
 function meshBounds(o){
  if(o.isSkinnedMesh||o.isBatchedMesh||o.morphTargetInfluences?.some(v=>v!==0)||o.morphTexture)return null;
  if((Array.isArray(o.material)?o.material:[o.material]).some(m=>m&&(m.isShaderMaterial||m.isRawShaderMaterial||m.displacementMap&&(m.displacementScale!==0||m.displacementBias!==0))))return null;
  const local=geometryBounds(o.geometry);if(!local)return null;
  const gv=geometryCache.get(o.geometry);let c=meshCache.get(o),changed=!c||c.geometry!==o.geometry||c.geometryVersion!==gv.version||c.position!==gv.position;
  if(!c){c={world:new T.Box3(),matrix:new Array(16)};meshCache.set(o,c);}
  let box=local;
  if(o.isInstancedMesh){if(changed||c.instanceMatrix!==o.instanceMatrix||c.instanceVersion!==o.instanceMatrix.version||c.count!==o.count){o.computeBoundingBox();changed=true;}box=o.boundingBox;}
  const m=o.matrixWorld.elements;if(changed||m.some((v,i)=>v!==c.matrix[i])){c.world.copy(box).applyMatrix4(o.matrixWorld);for(let i=0;i<16;i++)c.matrix[i]=m[i];}
  c.geometry=o.geometry;c.geometryVersion=gv.version;c.position=gv.position;c.instanceMatrix=o.instanceMatrix;c.instanceVersion=o.instanceMatrix?.version;c.count=o.count;
  return c.world;
 }
 return{
  prepare(scene,camera,{enabled=true,maxNear=64,guardMeters=.25}={}){
   const start=performance.now();renderCamera.copy(camera,false);
   if(!enabled||!camera.isPerspectiveCamera||camera.parent||camera.scale.toArray().some(v=>Math.abs(v-1)>1e-9)){report={enabled:false,sourceNear:camera.near,renderNear:camera.near,reason:!enabled?'baseline requested':'unsupported camera',browserTemporalAcceptance:false};return camera;}
   scene.updateMatrixWorld();camera.updateMatrixWorld();
   // WebGLRenderer updates automatic LODs during traversal. Match that current
   // frame selection before collecting bounds, including nested visible LODs.
   scene.traverseVisible(o=>{if(o.isLOD&&o.autoUpdate)o.update(camera);});
   eye.setFromMatrixPosition(camera.matrixWorld);
   let clearance=Infinity,count=0,unsupported=false;
   scene.traverseVisible(o=>{
    if(!(o.isMesh||o.isLine||o.isPoints||o.isSprite))return;
    if(!o.isMesh){unsupported=true;return;}
    const b=meshBounds(o);if(!b){unsupported=true;return;}if(b.isEmpty())return;
    if(![...b.min.toArray(),...b.max.toArray()].every(Number.isFinite)){unsupported=true;return;}
    count++;clearance=Math.min(clearance,b.distanceToPoint(eye));
   });
   let cornerCos=1;for(const x of [-1,1])for(const y of [-1,1]){corner.set(x,y,-1).applyMatrix4(camera.projectionMatrixInverse);cornerCos=Math.min(cornerCos,Math.abs(corner.z)/corner.length());}
   const safeRadius=Math.max(0,clearance-guardMeters),candidate=Math.min(maxNear,camera.far*.25,safeRadius*cornerCos*.9);
   const near=unsupported||!Number.isFinite(candidate)?camera.near:Math.max(camera.near,candidate);
   renderCamera.near=near;renderCamera.updateProjectionMatrix();renderCamera.updateMatrixWorld();
   report={enabled:true,sourceNear:camera.near,renderNear:near,clearanceMeters:clearance,safeRadiusMeters:safeRadius,nearCornerRadiusMeters:near/cornerCos,cornerCos,guardMeters,meshBounds:count,conservativeFallback:unsupported,frameCPUms:performance.now()-start,browserTemporalAcceptance:false};
   return renderCamera;
  },
  stats(){return {...report};}
 };
}
