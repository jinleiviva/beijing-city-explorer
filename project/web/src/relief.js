import * as THREE from '../vendor/three.module.js';
import {project,centroid} from './geo.js';
import {configureBeihaiRelief,beihaiHeightAt,createBeihaiHeightGeometry,getBeihaiReliefMetadata} from './beihai-relief.js';
export {configureBeihaiRelief};
export function buildingGroundAt(ring){const c=centroid(ring);return Math.max(heightAt(...c),...ring.map(p=>heightAt(...p)));}
/** Local park relief. Approximate envelopes, not a surveyed digital elevation model. */
const JINGSHAN=project([116.3904933,39.9235229]);
export function heightAt(x,z){const dx=x-JINGSHAN[0],dz=z-JINGSHAN[1];const r2=(dx/190)**2+(dz/115)**2;return (r2>=1?0:hillHeight(r2))+beihaiHeightAt(x,z);}
function hillHeight(r2){return 45.7*(1-r2)**1.8;}
export function buildRelief(){
 const group=new THREE.Group();group.name='Approximate Jingshan hill relief';
 const geo=new THREE.PlaneGeometry(390,240,52,36);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+JINGSHAN[0],z=p.getZ(i)+JINGSHAN[1];p.setXYZ(i,x,.38+heightAt(x,z),z);}
 geo.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({color:'#7c925d',roughness:1});const hill=new THREE.Mesh(geo,mat);hill.receiveShadow=true;hill.castShadow=false;group.add(hill);
 if(getBeihaiReliefMetadata()){const island=new THREE.Mesh(createBeihaiHeightGeometry(THREE),mat);island.name='Qionghua Island shore-clipped approximate relief';island.receiveShadow=true;group.add(island);group.name='Approximate Jingshan and Qionghua Island relief';}
 group.userData={beihai:getBeihaiReliefMetadata(),location:'Jingshan',summitRelativeMetres:45.7,source:'Official park description, linked in geographic landmark manifest',accuracy:'Approximate smooth terrain envelope; summit-height reference only, not measured DEM'};return group;
}
