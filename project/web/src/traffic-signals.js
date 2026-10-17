import * as THREE from '../vendor/three.module.js';
import {hash} from './geo.js';
import {SpatialGrid} from './spatial.js';

/** A bounded near-camera pool; light phases use the SAME clock/key as traffic. */
export function createTrafficSignals(crossings,{capacity=100}={}){
 const group=new THREE.Group();group.name='Junction signals synchronized with vehicles and crossings';
 const grid=new SpatialGrid(600);for(const c of crossings)grid.insert(c,[c.x,c.z,c.x,c.z]);
 const box=new THREE.BoxGeometry(1,1,1),poleGeo=new THREE.CylinderGeometry(.10,.13,1,7),lightGeo=new THREE.SphereGeometry(1,8,5);
 const metal=new THREE.MeshStandardMaterial({color:'#8e9798',roughness:.55,metalness:.4}),dark=new THREE.MeshStandardMaterial({color:'#273335',roughness:.8}),bulbs=new THREE.MeshBasicMaterial({color:0xffffff});
 const make=(g,m,n,name)=>{const mesh=new THREE.InstancedMesh(g,m,n);mesh.name=name;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.castShadow=false;group.add(mesh);return mesh;};
 const poles=make(poleGeo,metal,capacity*2,'signal poles'),arms=make(box,metal,capacity*2,'signal arms'),heads=make(box,dark,capacity*2,'signal housings'),lights=make(lightGeo,bulbs,capacity*6,'red amber green lamps');
 const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),p=new THREE.Vector3(),yAxis=new THREE.Vector3(0,1,0);let selected=[],last={x:Infinity,z:Infinity},count=0;
 const set=(mesh,i,x,y,z,sx,sy,sz,yaw=0)=>{q.setFromAxisAngle(yAxis,yaw);matrix.compose(p.set(x,y,z),q,s.set(sx,sy,sz));mesh.setMatrixAt(i,matrix);};
 function update(time,target,distance){group.visible=distance<2300;if(!group.visible)return;if(Math.hypot(target.x-last.x,target.z-last.z)>180){selected=grid.nearby(target.x,target.z,1200).sort((a,b)=>Math.hypot(a.x-target.x,a.z-target.z)-Math.hypot(b.x-target.x,b.z-target.z)).slice(0,capacity);last={x:target.x,z:target.z};}count=selected.length;
  for(let i=0;i<capacity;i++){const c=selected[i];for(let k=0;k<2;k++){const idx=i*2+k;if(!c){for(const m of [poles,arms,heads])set(m,idx,0,-100,0,0,0,0);for(let j=0;j<3;j++)set(lights,i*6+k*3+j,0,-100,0,0,0,0);continue;}
   const side=k?1:-1,off=(c.roadWidth||c.width)/2+1.0,x=c.x+c.dx*off*side,z=c.z+c.dz*off*side,yaw=Math.atan2(c.dz,-c.dx)+(k?Math.PI:0),hx=x-c.dx*side*2.3,hz=z-c.dz*side*2.3,axis=c.roadAxis??(Math.abs(c.dz)>Math.abs(c.dx)?0:1),phase=(time+hash(c.signalKey)%40)%40,green=axis===0?phase<16:phase>=20&&phase<36,amber=axis===0?phase>=16&&phase<19:phase>=36&&phase<39;
   set(poles,idx,x,c.y+2.8,z,1,5.6,1);set(arms,idx,x-c.dx*side*1.15,c.y+5.5,z-c.dz*side*1.15,2.6,.12,.12,Math.atan2(-c.dz,c.dx));set(heads,idx,hx,c.y+5.05,hz,.38,1.14,.31,yaw);
   for(let j=0;j<3;j++){const lit=j===0?!green&&!amber:j===1?amber:green;set(lights,i*6+k*3+j,hx+Math.sin(yaw)*.18,c.y+5.4-j*.35,hz+Math.cos(yaw)*.18,.12,.12,.07,yaw);lights.setColorAt(i*6+k*3+j,new THREE.Color(lit?['#f34b3d','#e6b549','#5bd88c'][j]:'#263333'));}
  }}for(const m of group.children)m.instanceMatrix.needsUpdate=true;lights.instanceColor.needsUpdate=true;
 }
 return{group,update,stats:()=>({nearJunctionApproaches:count,poolCapacity:capacity,clock:'shared vehicle simulation clock',accuracy:'Illustrative signal fixture placement at mapped junction approaches; not surveyed signal plans'})};
}
