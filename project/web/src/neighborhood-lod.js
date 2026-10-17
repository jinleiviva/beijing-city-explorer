import * as THREE from '../vendor/three.module.js';
/** Keep courtyard openings and pitched roofs at all ranges; remove tiny frames far away. */
export function createNeighborhoodLOD(kit,instances,{tileSize=700,nearDistance=1100}={}){
 const group=new THREE.Group();group.name='Old-city fabric with courtyard-preserving LOD';const tiles=new Map();let nearParts=0,farParts=0;
 for(const i of instances){const key=`${Math.floor(i.x/tileSize)},${Math.floor(i.z/tileSize)}`;if(!tiles.has(key))tiles.set(key,{x:(Math.floor(i.x/tileSize)+.5)*tileSize,z:(Math.floor(i.z/tileSize)+.5)*tileSize,instances:[]});tiles.get(key).instances.push(i);}
 for(const t of tiles.values()){
  const lod=new THREE.LOD();lod.position.set(t.x,0,t.z);const local=t.instances.map(i=>({...i,x:i.x-t.x,z:i.z-t.z,detail:0}));const near=kit.createBatch(local,{detail:0,chunkSize:0});const far=kit.createBatch(local.map(i=>({...i,detail:-1})),{detail:-1,chunkSize:0,castShadow:false});nearParts+=near.userData.architectureStats.parts;farParts+=far.userData.architectureStats.parts;lod.addLevel(near,0);lod.addLevel(far,nearDistance);group.add(lod);
 }
 group.userData.architectureStats={buildings:instances.length,tiles:tiles.size,nearParts,farParts,lodDistance:nearDistance};return group;
}
