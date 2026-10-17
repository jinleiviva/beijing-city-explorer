/** Surface classes: 0 neutral/inferred land use,1 asphalt,2 paving,3 vegetation,4 curb/stone. */
export function decorateGround(material){
 material.onBeforeCompile=s=>{
  s.vertexShader='attribute float surfaceKind; varying vec3 vGround; varying float vSurfaceKind;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGround=position;vSurfaceKind=surfaceKind;');
  s.fragmentShader='varying vec3 vGround; varying float vSurfaceKind;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float groundPatch=sin(vGround.x*.19+sin(vGround.z*.07))*sin(vGround.z*.15)+.35*sin(vGround.x*.67+vGround.z*.51);
   float fine=fract(sin(dot(floor(vGround.xz*3.2),vec2(12.9898,78.233)))*43758.5453)-.5;
   float grainVis=1.0-smoothstep(.12,.7,max(fwidth(vGround.x),fwidth(vGround.z)));
   float vegetation=step(2.5,vSurfaceKind)*(1.0-step(3.5,vSurfaceKind));
   diffuseColor.rgb*=1.0+groundPatch*mix(.018,.048,vegetation)+fine*grainVis*.055;
   if(vSurfaceKind>1.5&&vSurfaceKind<2.5){
    vec2 grid=vGround.xz/vec2(1.35,.72);grid.x+=mod(floor(grid.y),2.0)*.5;
    vec2 edge=min(fract(grid),1.0-fract(grid)),aa=fwidth(grid);
    float joint=max(1.0-smoothstep(.008-aa.x,.025+aa.x,edge.x),1.0-smoothstep(.008-aa.y,.025+aa.y,edge.y));
    float visible=1.0-smoothstep(.10,.5,max(aa.x,aa.y));diffuseColor.rgb*=1.0-joint*visible*.12;
   }
   if(vSurfaceKind>3.5){vec2 grid=vGround.xz/2.0,aa=fwidth(grid);float visible=1.0-smoothstep(.12,.55,max(aa.x,aa.y));float line=1.0-smoothstep(.01,.045,min(fract(grid.x),fract(grid.y)));diffuseColor.rgb*=1.0-line*visible*.09;}`);
 };
 material.customProgramCacheKey=()=> 'beijing-explicit-surface-classes-v1';
}
