import {buildWanningBridge} from './wanning-bridge.js';
import {roadElevationPolicy} from './road-elevation.js';
import * as THREE from '../vendor/three.module.js';
import {GeometryBatch,colorArray} from './geometry.js';
import {roadIndex,nearRoad} from './spatial.js';
/** True mapped alignments. Heights, thin decks, railings and supports remain
 * documented approximations. Only shared graph endpoints form approaches. */
export function buildBridges(roads){
 const root=new THREE.Group(),tiles=new Map(),postTiles=new Map(),ground=roadIndex(roads.filter(r=>r.y<3&&!r.elevationProfile));let decks=0,piers=0,pedestrianDecks=0,approaches=0;
 root.name='Mapped bridges and continuous evidence-bounded approaches';
 const cube=new THREE.BoxGeometry(1,1,1),matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3(),euler=new THREE.Euler();
 function post(x,y,z,yaw){const key=`${Math.floor(x/2600)},${Math.floor(z/2600)}`;if(!postTiles.has(key))postTiles.set(key,[]);q.setFromEuler(euler.set(0,yaw,0));matrix.compose(p.set(x,y,z),q,s.set(.055,1,.055));postTiles.get(key).push(...matrix.elements);}
 function get(x,z){const key=`${Math.floor(x/2600)},${Math.floor(z/2600)}`;if(!tiles.has(key))tiles.set(key,{values:[],colors:[]});return tiles.get(key);}
 function box(batch,x,y,z,w,h,d,yaw=0,pitch=0,col='#b1b5b2'){q.setFromEuler(euler.set(pitch,yaw,0,'YXZ'));matrix.compose(p.set(x,y,z),q,s.set(w,h,d));batch.values.push(...matrix.elements);batch.colors.push(...colorArray(col));}
 for(const r of roads){const policy=r.elevation||roadElevationPolicy(r.properties),ramp=!!r.elevationProfile;if(!policy.buildDeck&&!ramp)continue;if(r.properties.customBridge)continue;const foot=['footway','path','pedestrian','steps','cycleway'].includes(r.class),height=(x,z)=>r.surfaceHeightAt?.(x,z)??r.y;decks++;if(foot)pedestrianDecks++;if(ramp)approaches++;let carry=foot?3:14;
  for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<.5)continue;const ha=height(...a),hb=height(...b);if(Math.max(ha,hb)<1.0)continue;const cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,cy=(ha+hb)/2,yaw=Math.atan2(dx,dz),pitch=-Math.atan2(hb-ha,l),length3=Math.hypot(l,hb-ha),batch=get(cx,cz),thick=foot?.30:.70;
   box(batch,cx,cy-thick/2-.11,cz,r.width+.35,thick,length3+.03,yaw,pitch);
   for(const side of[-1,1]){const x=cx-dz/l*(r.width/2+.10)*side,z=cz+dx/l*(r.width/2+.10)*side;if(foot){for(const yy of[.48,1.0])box(batch,x,cy+yy,z,.065,.065,length3+.03,yaw,pitch,'#b3b7b0');for(let d=0;d<l;d+=2.5){const xx=a[0]+dx*d/l-dz/l*(r.width/2+.10)*side,zz=a[1]+dz*d/l+dx/l*(r.width/2+.10)*side,h=height(xx,zz);post(xx,h+.5,zz,yaw);}}else box(batch,x,cy+.38,z,.24,.76,length3+.03,yaw,pitch);}
   if(foot&&r.class==='steps')for(let d=.5;d<l;d+=.55){const x=a[0]+dx*d/l,z=a[1]+dz*d/l;box(batch,x,height(x,z)+.025,z,r.width,.05,.07,yaw,0,'#d0d0c2');}
   for(let d=carry;d<l;d+=38){const x=a[0]+dx*d/l,z=a[1]+dz*d/l,h=height(x,z);if(h<2.0||nearRoad(ground,x,z,foot?1.1:3.4))continue;box(batch,x,(h-.7)/2,z,foot?.45:1.8,h-.7,foot?.55:2.2,yaw);piers++;}carry=(carry-l)%38;if(carry<0)carry+=38;
  }
 }
 for(const r of roads)if(r.properties.customBridge==='wanning')root.add(buildWanningBridge(r));
 const mat=new THREE.MeshStandardMaterial({roughness:.94}),structureGeometry=cube.clone();for(const[key,b]of tiles){const m=new THREE.InstancedMesh(structureGeometry,mat,b.values.length/16);m.instanceMatrix.array.set(b.values);m.instanceMatrix.needsUpdate=true;m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(b.colors),3);m.computeBoundingSphere();m.name='bridge structure '+key;m.castShadow=true;m.receiveShadow=true;root.add(m);b.values=[];b.colors=[];}let pedestrianPosts=0;const postGeometry=cube.clone(),postMaterial=new THREE.MeshStandardMaterial({color:'#8b9890',roughness:.9});for(const[key,values]of postTiles){const mesh=new THREE.InstancedMesh(postGeometry,postMaterial,values.length/16);mesh.name='instanced pedestrian bridge posts '+key;mesh.instanceMatrix.array.set(values);mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();root.add(mesh);pedestrianPosts+=mesh.count;}cube.dispose();root.userData={decks,piers,pedestrianDecks,approaches,pedestrianPosts,accuracy:'True mapped horizontal paths and shared endpoint connectivity; vertical layer spacing, approach gradients and structure details approximate, not engineering survey'};return root;
}
