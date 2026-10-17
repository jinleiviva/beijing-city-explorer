import {CONTEXT_FACADE_GLSL} from './facade-shader.js';
const clones=new WeakMap();
const names=new Set(['glass','glassBlue','glassDark','glassPale','concrete','stone','stoneLight','stoneDark','beige','warmStone']);
/** Only generic district batches use these clones. Photo-model landmarks retain authored facades. */
export function decorateContextArchitecture(root,materials){
 const sourceNames=new Map(Object.entries(materials).map(([name,mat])=>[mat,name]));
 root.traverse(mesh=>{if(!mesh.isMesh||Array.isArray(mesh.material))return;const name=sourceNames.get(mesh.material);if(!names.has(name))return;const original=mesh.material;if(!clones.has(original)){
  const family=/glass/i.test(name)?0:['beige','warmStone','stoneLight'].includes(name)?2:1;const mat=original.clone();mat.name='Beijing_context_surface_'+name;
  mat.onBeforeCompile=s=>{
   s.vertexShader='varying vec3 vMassSurface;varying vec3 vMassSize;varying vec3 vMassNormal;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vMassSize=vec3(0.0);vMassNormal=normal;
    #ifdef USE_INSTANCING
     vMassSize=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
    #endif
    vMassSurface=(position+vec3(0.0,.5,0.0))*vMassSize;`);
   s.fragmentShader='varying vec3 vMassSurface;varying vec3 vMassSize;varying vec3 vMassNormal;\n'+CONTEXT_FACADE_GLSL+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    if(vMassSize.y>9.0&&min(vMassSize.x,vMassSize.z)>7.0&&abs(vMassNormal.y)<.45){
     vec2 coord=abs(vMassNormal.z)>.5?vMassSurface.xy:vMassSurface.zy;
     diffuseColor.rgb=beijingContextFacade(diffuseColor.rgb,coord,0.0,vMassSize.y,vMassSize.y<18.0?3.0:${family.toFixed(1)});
    }`);
  };mat.customProgramCacheKey=()=> 'beijing-context-architecture-shared-facade-v2-'+family+'';clones.set(original,mat);
 }mesh.material=clones.get(original);});return root;
}
