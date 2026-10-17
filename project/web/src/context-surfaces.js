import {CONTEXT_FACADE_GLSL} from './facade-shader.js';
/** Original distance-filtered procedural surfaces for approximate context volumes.
 * No photographed texture, surveyed window count or building-specific facade claim.
 */
export function decorateFarContext(material){
 material.onBeforeCompile=s=>{
  s.vertexShader='attribute float facadeMode;varying float vFacadeMode;attribute float oldRoof; varying float vOldRoof; varying vec3 vBoxSurface; varying vec3 vBoxSize; varying vec3 vBoxNormal;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vFacadeMode=facadeMode;vOldRoof=oldRoof;vBoxNormal=normal;
   vBoxSize=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
   vBoxSurface=(position+vec3(0.0,.5,0.0))*vBoxSize;`);
  s.fragmentShader='varying float vFacadeMode;varying float vOldRoof; varying vec3 vBoxSurface; varying vec3 vBoxSize; varying vec3 vBoxNormal;\n'+CONTEXT_FACADE_GLSL+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   if(vBoxNormal.y>.5){
    diffuseColor.rgb=mix(diffuseColor.rgb*.72,vec3(.125,.145,.155),vOldRoof);
    vec2 edge=vBoxSize.xz*.5-abs(vBoxSurface.xz);float distanceToEdge=min(edge.x,edge.y);
    float roofPixel=max(fwidth(vBoxSurface.x),fwidth(vBoxSurface.z));
    float rim=(1.0-smoothstep(.6-roofPixel,.9+roofPixel,distanceToEdge))*(1.0-vOldRoof);
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.30,rim);
   }else if(abs(vBoxNormal.y)<.5){
    vec2 coord=abs(vBoxNormal.z)>.5?vBoxSurface.xy:vBoxSurface.zy;
    if(vFacadeMode<1.5||vFacadeMode>3.5){if(vFacadeMode>.5&&vFacadeMode<1.5)coord.y*=3.35/max(3.35,vBoxSize.y);diffuseColor.rgb=beijingContextFacade(diffuseColor.rgb,coord,vOldRoof,vBoxSize.y,max(0.0,vFacadeMode-4.0));}
   }`);
 };
 material.customProgramCacheKey=()=> 'beijing-far-surface-window-rim-base-v2';
}
