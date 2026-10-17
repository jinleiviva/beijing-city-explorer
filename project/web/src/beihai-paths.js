import * as THREE from '../vendor/three.module.js';
import {prepareBeihaiPathDrape,buildDrapedRibbonArrays} from './beihai-path-drape.js';
import {heightAt} from './relief.js';
import {GeometryBatch,colorArray} from './geometry.js';
/** Source centerlines remain intact; only the documented island paths get this treatment. */
export function applyBeihaiPathTreatments(features,geojson){
 const allowed=geojson.features.filter(f=>['mapped-path','mapped-steps'].includes(f.properties.role)&&Number(f.properties.tags?.layer||0)===0&&f.properties.tags?.bridge!=='yes'&&f.properties.tags?.tunnel!=='yes');
 const byId=new Map(allowed.map(f=>['osm-'+f.properties.osmRef.replace('/','-'),f])),seen=new Set();
 function apply(f,source){const tags=source.properties.tags||{},steps=source.properties.role==='mapped-steps';seen.add(f.id);return{...f,properties:{...f.properties,kind:'road',class:steps?'steps':tags.highway||'footway',width:parseFloat(tags.width)||(steps?2.4:2.5),drapeTerrain:true,customDrapedPath:true,terrainSource:source.properties.source,terrainAccuracy:'Mapped centerline; approximate relative island relief and stair treads'}};}
 const result=features.map(f=>byId.has(f.id)?apply(f,byId.get(f.id)):f);for(const [id,f] of byId)if(!seen.has(id))result.push(apply({id,geometry:f.geometry,properties:{name:f.properties.name||'',layer:0}},f));return result;
}
export function buildBeihaiPaths(geojson){
 const plan=prepareBeihaiPathDrape(geojson,{heightAt}),group=new THREE.Group(),batch=new GeometryBatch(),curb=new GeometryBatch(),identity=new THREE.Matrix4();group.name='Qionghua source-mapped paths and approximate stair treads';
 function ribbon(path,width,baseY,destination,color){const arrays=buildDrapedRibbonArrays(path,heightAt,{widthM:width,baseY}),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(arrays.positions,3));g.setIndex(new THREE.BufferAttribute(arrays.indices,1));g.computeVertexNormals();destination.addGeometry(g,identity,color);g.dispose();}
 const treads=[];for(const path of plan.paths){ribbon(path,path.widthM+.38,.48,curb,colorArray('#9b9b8c'));if(path.isSteps)treads.push(...path.stepSegments);else ribbon(path,path.widthM,.65,batch,colorArray('#aaada3'));}
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide});for(const b of [curb,batch])if(b.triangles){const m=b.mesh(material);m.receiveShadow=true;group.add(m);}
 if(treads.length){const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#aaa99b',roughness:.96}),treads.length),q=new THREE.Quaternion(),y=new THREE.Vector3(0,1,0),m=new THREE.Matrix4();treads.forEach((t,i)=>{const dx=t.endXZ[0]-t.startXZ[0],dz=t.endXZ[1]-t.startXZ[1],h=Math.max(.12,Math.min(.60,Math.abs(t.approximateRiseM)+.14));q.setFromAxisAngle(y,Math.atan2(dx,dz));m.compose(new THREE.Vector3(t.centerXZ[0],t.treadY-h/2,t.centerXZ[1]),q,new THREE.Vector3(t.widthM,h,t.depthM+.025));mesh.setMatrixAt(i,m);});mesh.receiveShadow=true;mesh.castShadow=true;mesh.computeBoundingSphere();group.add(mesh);}
 group.userData={...plan.metadata,treads:treads.length,skipped:plan.skipped,accuracy:'Horizontal paths from OSM; height profile, tread spacing and widths without tags are approximate.'};return group;
}
