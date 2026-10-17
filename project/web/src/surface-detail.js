/** Original procedural close-range tile/brick detail, derivative-filtered at distance. */
export function enhanceArchitectureMaterials(materials){
 for(const [name,mat] of Object.entries(materials)){
  const roof=/^roof/.test(name),brick=/[bB]rick/.test(name),paving=['paving','marble'].includes(name);if(!roof&&!brick&&!paving)continue;
  mat.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 vDetailPosition;varying vec3 vDetailNormal;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec3 detailScale=vec3(1.0);
    #ifdef USE_INSTANCING
     detailScale=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
    #endif
    vDetailPosition=position*detailScale;vDetailNormal=normal;`);
   shader.fragmentShader='varying vec3 vDetailPosition;varying vec3 vDetailNormal;\n'+shader.fragmentShader;
   const roofCode=`vec2 tile=vDetailPosition.xz/vec2(.24,.34);vec2 fw=fwidth(tile);float vis=1.0-smoothstep(.18,.7,max(fw.x,fw.y));float roll=.5+.5*cos(tile.x*6.2831853);float joint=1.0-smoothstep(.025,.10,fract(tile.y));diffuseColor.rgb*=1.0+vis*((roll-.5)*.16-joint*.15);`;
   const brickCode=`vec2 coord=abs(vDetailNormal.z)>.5?vDetailPosition.xy:vDetailPosition.zy;float row=floor(coord.y/.26);vec2 tile=vec2(coord.x/.62+mod(row,2.)*.5,coord.y/.26);vec2 f=fract(tile),fw=fwidth(tile);float vis=1.0-smoothstep(.12,.65,max(fw.x,fw.y));float grout=max(1.0-smoothstep(.015,.065,f.x),1.0-smoothstep(.035,.12,f.y));float grain=fract(sin(dot(floor(tile),vec2(12.9898,78.233)))*43758.5453);diffuseColor.rgb*=1.0+vis*((grain-.5)*.15-grout*.17);`;
   const pavingCode=`vec2 tile=vDetailPosition.xz/1.25;vec2 f=fract(tile),fw=fwidth(tile);float vis=1.0-smoothstep(.1,.6,max(fw.x,fw.y));float joint=max(1.0-smoothstep(.005,.025,f.x),1.0-smoothstep(.005,.025,f.y));diffuseColor.rgb*=1.0-joint*vis*.18;`;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+(roof?roofCode:brick?brickCode:pavingCode));
  };
  mat.customProgramCacheKey=()=>`beijing-surface-${roof?'tile':brick?'brick':'paving'}-v1`;mat.needsUpdate=true;
 }
}
