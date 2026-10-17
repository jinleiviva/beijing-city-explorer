import * as THREE from '../vendor/three.module.js';
import {isUndergroundStructure,hasTrustedHeight,semanticHeight,semanticClass,contextFacadeMode,contextRenderFacadeMode,buildingMinHeight} from './building-semantics.js';
import {CONTEXT_FACADE_GLSL} from './facade-shader.js';
import {planContextRoof,addContextRoof,mappedRoofColor} from './context-roofs.js';
import {heightAt,buildingGroundAt} from './relief.js';
import {project,polygonArea,centroid,hash,rng,yieldFrame} from './geo.js';
import {GeometryBatch,colorArray,strip} from './geometry.js';

const PALETTES={hutong:['#9c9f9b','#b0aea6','#989e9c','#b8b4aa'],residential:['#c6bfae','#cbbda5','#d0c6b4','#b9b9ad','#d4c7b4'],commercial:['#9facaa','#b4bdb8','#b5b7ad','#c2baa8','#9dafb3'],cbd:['#8fa7ad','#a2b6ba','#bbc9c6','#91a2a9','#b6b5a6']};
export function districtAt(lon,lat){
 if(lon>116.443&&lat>39.897&&lat<39.927)return 'cbd';
 if(lon>116.443&&lat>=39.927&&lat<39.95)return 'sanlitun';
 if(lon<116.371&&lon>116.345&&lat>39.904&&lat<39.934)return 'financial';
 if(lon>116.402&&lon<116.415&&lat>39.903&&lat<39.923)return 'wangfujing';
 if(lon>116.365&&lon<116.431&&lat>39.906&&lat<39.948)return 'hutong';
 return 'residential';
}
export function inferredHeight(p,lon,lat,random,area,id){
 random=rng(hash('height:'+String(id??(p.osmId?`${p.osmType}/${p.osmId}`:`${lon},${lat},${area}`))));
 const source=p.heightSource||'';
 if(hasTrustedHeight(p))return Math.max(.5,Math.min(528,Number(p.height)||7));
 if(Number(p.levels)>0)return Math.min(528,Number(p.levels)*3.3);
 const semantic=semanticHeight(p,random,area);if(semantic!==null)return semantic;
 const district=districtAt(lon,lat);const type=p.buildingType;
 if(['house','hut','detached','terrace','garage','garages','shed'].includes(type)||area<60)return 4+random()*4;
 if(district==='hutong')return area>2500?14+random()*14:5+random()*7;
 if(type==='apartments'||type==='residential')return 18+Math.floor(random()*8)*3;
 if(district==='cbd'){const name=(p.name||'')+' '+(p.nameEn||''),dims=p.footprintDims||[30,30],narrow=Math.min(...dims),aspect=Math.max(...dims)/Math.max(narrow,1);if(/商场|商城|购物|百货|mall|retail/i.test(name)||p.buildingType==='retail')return 16+random()*9;if(narrow<20&&aspect>2.1)return 7+random()*10;if(area>6000)return 22+random()*17;if(/大厦|中心|Tower|Plaza|office/i.test(name))return 47+random()*42;return area<450?10+random()*15:25+random()*31;}
 if(district==='financial')return 28+random()*65;
 if(district==='sanlitun'||district==='wangfujing')return 13+random()*32;
 if(['hospital','university','school','commercial','office'].includes(type))return 15+random()*37;
 return area>1500?20+random()*35:12+random()*20;
}
function footprint(batch,rings,height,color,roofColor,baseY=.8,traditional=false,drape=false,wallCuts=[]){
 const H=(x,z)=>drape?heightAt(x,z):0;
 const outline=rings[0];
 const vertices=outline.map(p=>new THREE.Vector2(p[0],p[1]));
 const holes=rings.slice(1).map(r=>r.map(p=>new THREE.Vector2(p[0],p[1])));
 const triangles=THREE.ShapeUtils.triangulateShape(vertices,holes);
 const all=vertices.concat(...holes);
 for(const t of triangles){const a=all[t[0]],b=all[t[1]],c=all[t[2]],A=[a.x,height+H(a.x,a.y),a.y],B=[b.x,height+H(b.x,b.y),b.y],C=[c.x,height+H(c.x,c.y),c.y];
  // Top faces wind upward; draped roofs retain their actual slope normal.
  const crossY=(B[2]-A[2])*(C[0]-A[0])-(B[0]-A[0])*(C[2]-A[2]);
  batch.tri(A,crossY>=0?B:C,crossY>=0?C:B,roofColor);
 }
 for(let ringIndex=0;ringIndex<rings.length;ringIndex++){const ring=rings[ringIndex];let signedArea=0;for(let i=1;i<ring.length;i++)signedArea+=ring[i-1][0]*ring[i][1]-ring[i][0]*ring[i-1][1];
  // Exterior faces away from the solid; hole walls face into their void.
  // Projection may reverse geographic winding, so never assume ring order.
  const outwardSign=(signedArea>=0?1:-1)*(ringIndex===0?1:-1);let phase=0;for(let i=1;i<ring.length;i++){
  const a=ring[i-1],b=ring[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.2)continue;
  const n=[outwardSign*(b[1]-a[1])/len,0,-outwardSign*(b[0]-a[0])/len];
  const A=[a[0],baseY+H(...a),a[1]],B=[b[0],baseY+H(...b),b[1]],C=[b[0],height+H(...b),b[1]],D=[a[0],height+H(...a),a[1]];
  const uvHeight=traditional?3.35:height-baseY;
  const cut=wallCuts.find(c=>c.ringIndex===ringIndex&&c.edgeIndex===i-1);
  if(cut){
   if(drape||traditional||cut.u0<=0||cut.u1>=len||cut.u1<=cut.u0||cut.y0<baseY||cut.y1>height||cut.y1<=cut.y0)throw Error('Invalid bounded facade opening');
   const pieces=[[0,cut.u0,baseY,height],[cut.u1,len,baseY,height],[cut.u0,cut.u1,cut.y1,height]];if(cut.y0>baseY)pieces.push([cut.u0,cut.u1,baseY,cut.y0]);
   for(const[u0,u1,y0,y1]of pieces){if(y1-y0<1e-6)continue;const at=(u,y)=>[a[0]+(b[0]-a[0])*u/len,y,a[1]+(b[1]-a[1])*u/len],P=at(u0,y0),Q=at(u1,y0),R=at(u1,y1),S=at(u0,y1),v0=y0-baseY,v1=y1-baseY;
    if(outwardSign>0)batch.quad(P,S,R,Q,color,n,[phase+u0,v0,phase+u0,v1,phase+u1,v1,phase+u1,v0]);else batch.quad(P,Q,R,S,color,n,[phase+u0,v0,phase+u1,v0,phase+u1,v1,phase+u0,v1]);
   }phase+=len;continue;
  }
  if(outwardSign>0)batch.quad(A,D,C,B,color,n,[phase,0,phase,uvHeight,phase+len,uvHeight,phase+len,0]);
  else batch.quad(A,B,C,D,color,n,[phase,0,phase+len,0,phase+len,uvHeight,phase,uvHeight]);phase+=len;
 }}
}
export {footprint as appendContextFootprint};
function contextRoofRim(batch,ring,width,y,color){
 const first=batch.indices.length;strip(batch,ring,width,y,color);
 // A concave or very short mapped corner can reverse one offset-strip
 // triangle. This component is a horizontal top rim, so orient its indices
 // upward without changing positions, colours, UVs or supplied normals.
 for(let i=first;i<batch.indices.length;i+=3){const a=batch.indices[i]*3,b=batch.indices[i+1]*3,c=batch.indices[i+2]*3,p=batch.positions;
  const crossY=(p[b+2]-p[a+2])*(p[c]-p[a])-(p[b]-p[a])*(p[c+2]-p[a+2]);
  if(crossY<0)[batch.indices[i+1],batch.indices[i+2]]=[batch.indices[i+2],batch.indices[i+1]];
 }
}
export function contextMaterial(){
 const m=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.84,metalness:.035,side:THREE.DoubleSide});
 m.onBeforeCompile=s=>{
  s.vertexShader='attribute float surfaceKind; varying float vFacadeMode; varying vec2 vFacadeUV; varying float vRoof; varying vec3 vContextPosition;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvFacadeMode=surfaceKind;vFacadeUV=uv; vRoof=normal.y;vContextPosition=position;');
  s.fragmentShader='varying float vFacadeMode; varying vec2 vFacadeUV; varying float vRoof; varying vec3 vContextPosition;\n'+CONTEXT_FACADE_GLSL+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  if(vRoof<0.5){
    if(vFacadeMode<1.5||vFacadeMode>3.5)diffuseColor.rgb=beijingContextFacade(diffuseColor.rgb,vFacadeUV,(vFacadeMode>.5&&vFacadeMode<1.5)?1.0:0.0,100000.0,max(0.0,vFacadeMode-4.0));
  }else{vec2 roofCell=vContextPosition.xz/7.0,aa=fwidth(roofCell),edge=min(fract(roofCell),1.0-fract(roofCell));float visible=1.0-smoothstep(.1,.5,max(aa.x,aa.y));float seam=max(1.0-smoothstep(.004,.014,edge.x),1.0-smoothstep(.004,.014,edge.y));diffuseColor.rgb*=1.0-seam*visible*.08;} `);
 };
 return m;
}
export async function buildContextBuildings(features,onProgress,options={}){
 const group=new THREE.Group();group.name='OSM building footprints — estimated heights when unavailable';
 const material=contextMaterial();const heightCandidateOverrides=[],baseElevationCandidateOverrides=[];const tiles=new Map();let count=0,estimated=0,gabledRoofs=0;const uniqueIds=new Set();
 for(let i=0;i<features.length;i++){
  const f=features[i],p=f.properties||{};
  if(!f.geometry||p.part==='yes'||isUndergroundStructure(p))continue;
  const polygons=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
  for(const poly of polygons){
   if(!poly[0]||poly[0].length<4)continue;
   const rings=poly.map(r=>r.map(project));const center=centroid(rings[0]);const ll=poly[0][0];const area=polygonArea(rings[0]);
   if(area<18)continue;
   const key=`${Math.floor(center[0]/1200)},${Math.floor(center[1]/1200)}`;
   let tile=tiles.get(key);if(!tile){tile={items:[],count:0,center};tiles.set(key,tile);}
   const random=rng(hash(f.id||i));const district=districtAt(ll[0],ll[1]);
   const palette=PALETTES[district==='hutong'?'hutong':district==='cbd'?'cbd':['financial','sanlitun','wangfujing'].includes(district)?'commercial':'residential'];
   const color=colorArray(palette[Math.floor(random()*palette.length)]);
   const candidate=options.heightCandidates?.[f.id],height=Number.isFinite(candidate?.height)&&candidate.height>.8?candidate.height:inferredHeight(p,ll[0],ll[1],random,area,f.id);if(candidate)heightCandidateOverrides.push({id:f.id,...candidate,status:'Explicit unmeasured candidate, not a trusted source height'});
   const mappedRoof=mappedRoofColor(p.roofColour);const roofColor=mappedRoof?colorArray(mappedRoof):district==='hutong'?colorArray(['#676f74','#767c80','#858a8b','#71787d'][Math.floor(random()*4)]):color.map(v=>v*.86);
   const drape=Boolean(p.terrainDrape);if(drape){for(let k=0;k<rings.length;k++){const dense=[];for(let j=1;j<rings[k].length;j++){const a=rings[k][j-1],b=rings[k][j],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3);for(let t=0;t<n;t++)dense.push([a[0]+(b[0]-a[0])*t/n,a[1]+(b[1]-a[1])*t/n]);}dense.push(rings[k].at(-1));rings[k]=dense;}}const ground=drape?0:buildingGroundAt(rings[0]),baseCandidate=options.baseElevationCandidates?.[f.id],originalBase=buildingMinHeight(p,height)+ground;let wallBase=originalBase;if(baseCandidate){if(drape||!Number.isFinite(baseCandidate.baseY)||baseCandidate.baseY>originalBase||baseCandidate.baseY<ground-1)throw Error('Invalid bounded downward foundation extension');wallBase=baseCandidate.baseY;baseElevationCandidateOverrides.push({id:f.id,originalBase,baseY:wallBase,roofY:height+ground,reason:baseCandidate.reason});}tile.items.push({wallCuts:options.facadeOpenings?.[f.id]||[],drape,elevated:buildingMinHeight(p,height)>.8,facadeMode:contextRenderFacadeMode(p,district,height),rim:['cbd','financial','sanlitun','wangfujing'].includes(district)&&height>18&&area>350,rings,height:height+ground,baseY:wallBase,lowGround:Math.min(...rings[0].map(p=>heightAt(...p))),color,roofColor,roofPlan:(district==='hutong'&&height<14||contextFacadeMode(p)===1)&&rings.length===1&&!drape?planContextRoof(rings[0],height,p.roofShape||'gabled'):null});tile.count++;count++;uniqueIds.add(f.id);
   if((p.heightSource||'').includes('fallback'))estimated++;
  }
  if(i%1500===0){onProgress?.(i/features.length*.45);await yieldFrame();}
 }
 let triangles=0;
 let tileIndex=0;for(const [key,tile] of tiles){const batch=new GeometryBatch();for(const item of tile.items){batch.setSurfaceKind(item.facadeMode);if(item.baseY>1.1&&!item.elevated){batch.setSurfaceKind(3);footprint(batch,item.rings,item.baseY,item.color.map(v=>v*.60),item.roofColor,Math.max(.1,item.lowGround));batch.setSurfaceKind(item.facadeMode);}footprint(batch,item.rings,item.height-(item.roofPlan?.rise||0),item.color,item.roofColor,item.baseY,item.facadeMode===1,item.drape,item.wallCuts);if(item.rim&&!item.roofPlan){for(const ring of item.rings)contextRoofRim(batch,ring,.60,item.height+.16,item.roofColor.map(v=>v*1.14));}if(item.roofPlan){addContextRoof(batch,item.roofPlan,item.height,item.roofColor);gabledRoofs++;}}const mesh=batch.mesh(material);mesh.name=`buildings ${key} (${tile.count})`;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={tile:key,count:tile.count};group.add(mesh);triangles+=batch.triangles;tile.items=null;if(++tileIndex%8===0){onProgress?.(.45+.55*tileIndex/tiles.size);await yieldFrame();}}
 group.userData={facadeOpenings:options.facadeOpenings||{},heightCandidateOverrides,baseElevationCandidateOverrides,count,footprintComponents:count,uniqueBuildingIds:uniqueIds.size,estimatedHeightComponents:estimated,estimated,gabledRoofs,triangles,tiles:tiles.size,accuracy:'OSM footprints with mixed mapped and inferred heights; facade detail is procedural'};
 return group;
}
