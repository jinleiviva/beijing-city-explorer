import {createRoadElevationProfiles,roadProfileKey,profileHeightAt,profiledRoadPoints} from './road-profiles.js';
import {wanningDeckHeight} from './wanning-bridge.js';
import {roadElevationPolicy} from './road-elevation.js';
import {heightAt} from './relief.js';
import {decorateGround} from './ground-surfaces.js';
import * as THREE from '../vendor/three.module.js';
import {project,BOUNDS,hash,rng,yieldFrame} from './geo.js';
import {GeometryBatch,polygonGeometry,strip,colorArray} from './geometry.js';

export async function buildTerrain(features,onProgress,{parkSurfaceOverrides}={}){
 const parkSurfaces=new Map((parkSurfaceOverrides?.features||[]).map(f=>[f.properties.sourceParkId||f.id,f.geometry]));const emptyParkSurfaces=new Set(parkSurfaceOverrides?.metadata?.emptySurfaceParkIds||[]);
 const root=new THREE.Group();root.name='Mapped city ground';
 const sw=project([BOUNDS[0],BOUNDS[1]]),ne=project([BOUNDS[2],BOUNDS[3]]);
 const width=ne[0]-sw[0],depth=sw[1]-ne[1],cx=(sw[0]+ne[0])/2,cz=(sw[1]+ne[1])/2;
 const base=new THREE.Mesh(new THREE.BoxGeometry(width,60,depth),new THREE.MeshStandardMaterial({color:'#a8ada7',roughness:1}));base.position.set(cx,-31,cz);base.receiveShadow=true;root.add(base);
 const underside=new THREE.Mesh(new THREE.BoxGeometry(width+24,28,depth+24),new THREE.MeshStandardMaterial({color:'#9e9989',roughness:1}));underside.position.set(cx,-74,cz);root.add(underside);
 const tiles=new Map();function tile(x,z){const key=`${Math.floor(x/2500)},${Math.floor(z/2500)}`;if(!tiles.has(key)){const ground=new GeometryBatch();tiles.set(key,{key,ground,roadBatch:ground,curbBatch:ground,waterBatch:new GeometryBatch(),parkBatch:ground,waterEdgeBatch:ground});};return tiles.get(key);}
 const roads=[],parks=[],waters=[],roadProfiles=createRoadElevationProfiles(features);let processed=0;
 for(const f of features){const p=f.properties,g=f.geometry;
  if(p.kind==='road'){
   if(p.tunnel==='yes'||p.layer<0)continue;
   const lines=g.type==='MultiLineString'?g.coordinates:[g.coordinates];
   for(const line of lines){let pts=line.map(project);const elevationProfile=roadProfiles.get(roadProfileKey(f.id,pts));if(elevationProfile)pts=profiledRoadPoints(elevationProfile,pts);if(p.drapeTerrain){const dense=[];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3);for(let j=0;j<steps;j++)dense.push([a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps]);}dense.push(pts.at(-1));pts=dense;}if(pts.length<2)continue;const {roadBatch,curbBatch}=tile(pts[Math.floor(pts.length/2)][0],pts[Math.floor(pts.length/2)][1]);
    const width=Math.min(60,Math.max(['footway','path','steps'].includes(p.class)?1.2:3,p.width||10));const elevation=roadElevationPolicy(p),y=elevation.height;
    const foot=p.shoreSharedPassage||['footway','path','pedestrian','steps','cycleway','living_street'].includes(p.class);
    const surfaceHeightAt=(x,z)=>elevationProfile?profileHeightAt(elevationProfile,x,z):p.customBridge==='wanning'?wanningDeckHeight(pts,x,z):p.heightProfile==='danbi'?.65+4*THREE.MathUtils.clamp((project([0,p.heightProfileSouth])[1]-z)/(project([0,p.heightProfileSouth])[1]-project([0,p.heightProfileNorth])[1]),0,1):y+((foot||p.drapeTerrain)?heightAt(x,z):0);
    const motorway=['motorway','trunk','motorway_link','trunk_link'].includes(p.class);
    curbBatch.setSurfaceKind(4);if(!p.customBridge&&!p.customDrapedPath)strip(curbBatch,pts,width+(motorway?2.0:foot?.65:5.0),(x,z)=>surfaceHeightAt(x,z)-.12,colorArray(motorway?'#9b9e92':'#b4b4a4'));
    roadBatch.setSurfaceKind(foot?2:1);if(!p.customBridge&&!p.customDrapedPath)strip(roadBatch,pts,width,surfaceHeightAt,colorArray(motorway?'#555f60':foot?'#a3aaa4':'#626b69'));
    roads.push({id:f.id,name:p.name,points:pts,width,y,elevation,elevationProfile,surfaceHeightAt,class:p.class,oneway:p.oneway,properties:p});
   }
  }else if(p.kind==='water'||p.kind==='park'){
   const isWater=p.kind==='water';if(!isWater){for(const poly of g.type==='MultiPolygon'?g.coordinates:[g.coordinates])parks.push({id:f.id,name:p.name,rings:poly.map(r=>r.map(project)),class:p.class});}
   const surfaceGeometry=isWater?g:emptyParkSurfaces.has(f.id)?null:(parkSurfaces.get(f.id)||g);const polys=!surfaceGeometry?[]:surfaceGeometry.type==='MultiPolygon'?surfaceGeometry.coordinates:[surfaceGeometry.coordinates];
   for(const polygon of polys){if(!polygon[0]||polygon[0].length<4)continue;
    const rings=polygon.map(r=>r.map(project));const isWater=p.kind==='water';const {waterBatch,parkBatch,waterEdgeBatch}=tile(rings[0][0][0],rings[0][0][1]);
    const r=rng(hash(f.id));const c=colorArray(isWater?'#4b9390':['#8fa779','#91ad7b','#829d6d','#a3b282'][Math.floor(r()*4)]);
    parkBatch.setSurfaceKind(3);const geometry=polygonGeometry(rings,isWater?-.82:.23);(isWater?waterBatch:parkBatch).addGeometry(geometry,new THREE.Matrix4(),c);geometry.dispose();
    if(isWater){waterEdgeBatch.setSurfaceKind(4);for(const ring of rings){strip(waterEdgeBatch,ring,1.7,.3,colorArray('#aaa999'));for(let j=1;j<ring.length;j++){const a=ring[j-1],b=ring[j];waterEdgeBatch.quad([a[0],-.84,a[1]],[b[0],-.84,b[1]],[b[0],.26,b[1]],[a[0],.26,a[1]],colorArray('#737f7b'));}}waters.push({id:f.id,name:p.name,rings});}

   }
  }
  if(++processed%1000===0){onProgress?.(processed/features.length);await yieldFrame();}
 }
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96,side:THREE.DoubleSide});
 const waterTime={value:0};
 decorateGround(mat);
 const waterMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.39,metalness:.035,side:THREE.DoubleSide,envMapIntensity:.30,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4});
 waterMat.onBeforeCompile=s=>{s.uniforms.waterTime=waterTime;s.vertexShader='varying vec3 vWater;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWater=position;');s.fragmentShader='uniform float waterTime; varying vec3 vWater;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
 float warpA=sin(vWater.x*.019+vWater.z*.023)*1.2,warpB=cos(vWater.x*.031-vWater.z*.017)*.9;float wx=sin(vWater.x*.31+vWater.z*.27+warpA+waterTime*.48)+.35*sin(vWater.x*.77-vWater.z*.53+warpB-waterTime*.31);float wz=cos(vWater.z*.39-vWater.x*.17+warpB+waterTime*.34)+.28*sin(vWater.x*.64+vWater.z*.81+warpA);float detail=1.0-smoothstep(.9,5.0,length(fwidth(vWater.xz)));normal=normalize(normal+vec3(wx*.014,0.,wz*.012)*detail);`);};for(const [key,t] of tiles){for(const [name,batch] of [['ground',t.ground],['water',t.waterBatch]]){if(!batch.triangles)continue;const m=batch.mesh(name==='water'?waterMat:mat);m.name=name+' '+key;m.receiveShadow=true;root.add(m);for(const k of ['positions','normals','colors','uvs','indices','surfaceKinds'])batch[k]=null;}}
 root.userData={roads:roads.length,parks:parks.length,waters:waters.length,spatialTiles:tiles.size,width,depth,parkSurfaceOverrides:parkSurfaces.size,emptyParkSurfaces:emptyParkSurfaces.size};
 return{group:root,roads,parks,waters,update:time=>{waterTime.value=time;}};
}
