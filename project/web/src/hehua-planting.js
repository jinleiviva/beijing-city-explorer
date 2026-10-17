/** Built landscape photographs and design plan support these approximate groups,
 * not individually surveyed tree trunks. Keep the broad stone forecourt open. */
import * as THREE from '../vendor/three.module.js';
import {project,bounds,pointInRing,rng,hash} from './geo.js';
import {polygonIndex,inPolygons,insideBuilding} from './spatial.js';
import {Recipe} from './architecture/geometry.js';
export function applyHehuaPlanting(waterfront,geometry,buildingMask){
 const trees=[],beds=[],random=rng(1132021),polys=geometry.features.filter(f=>f.properties.role==='keep-clear-paved-circulation').map(f=>({rings:f.geometry.coordinates.map(r=>r.map(project))})),open=polygonIndex(polys);
 const free=(x,z)=>!inPolygons(waterfront.waterMask,x,z)&&!inPolygons(open,x,z)&&!insideBuilding(buildingMask,x,z,.2);
 const add=(id,x,z,p)=>{if(!free(x,z))return;const rr=rng(hash(id)),hr=p.heightRangeM||[7,10],dr=p.crownDiameterRangeM||[5,8];trees.push({id,x,z,h:hr[0]+rr()*(hr[1]-hr[0]),r:(dr[0]+rr()*(dr[1]-dr[0]))/2,type:p.treeType==='pine'?'pine':'broad',seed:rr(),priority:true,photoWaterfront:'hehua_south_plaza',accuracy:'Relative placement from landscape plan; about 15m coordinate uncertainty'});};
 // Replace, rather than duplicate, the two trees already associated with round beds.
 waterfront.extraTrees=waterfront.extraTrees.filter(t=>t.photoWaterfront!=='hehua_south_plaza');
 for(const f of geometry.features){const p=f.properties,g=f.geometry;
  if(g.type==='Point'){const[x,z]=project(g.coordinates);add(f.id,x,z,p);}
  else if(p.role==='approximate-tree-row'){const a=project(g.coordinates[0]),b=project(g.coordinates.at(-1));for(let i=0;i<11;i++){const t=(i+.18+random()*.45)/11;add(f.id+'-'+i,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+(random()-.5)*.6,p);}}
  else if(p.role==='approximate-low-planting-envelope'){const rings=g.coordinates.map(r=>r.map(project)),bb=bounds(rings[0]);for(let z=bb[1];z<bb[3];z+=1.9)for(let x=bb[0];x<bb[2];x+=1.9){const points=[[x,z],[x+1.7,z],[x+1.7,z+1.7],[x,z+1.7]];if(random()>.48||points.some(([xx,zz])=>!pointInRing(xx,zz,rings[0])||rings.slice(1).some(r=>pointInRing(xx,zz,r))||!free(xx,zz)))continue;beds.push({x:x+.85,z:z+.85,r:.7+random()*.25,h:.2+random()*.32,seed:random()});}}
 }
 waterfront.extraTrees.push(...trees);return{trees,beds,source:geometry.metadata,accuracy:'Photo/plan referenced groups and approximate tree coordinates; no new building volumes'};
}
export function buildHehuaPlanting(kit,plan){if(!kit.materials.gardenFlower)kit.materials.gardenFlower=new THREE.MeshStandardMaterial({color:'#8b76ab',roughness:.95});const root=new THREE.Group();root.name='Hehua retained open plaza with photo-referenced planting';const center=project([116.38610,39.93243]),r=new Recipe(root.name);for(const b of plan.beds){r.box('timber',b.x-center[0],.77,b.z-center[1],1.72,.07,1.72,'small irregular planting soil cell');for(let j=0;j<3;j++){const a=j*2.399+b.seed*6.28;r.sphere('foliage',b.x-center[0]+Math.cos(a)*.35,.88+b.h*.5,b.z-center[1]+Math.sin(a)*.35,b.r*.67,b.h*.75,b.r*.61,'low groundcover cluster');if(b.seed>.72&&j===0)r.sphere('gardenFlower',b.x-center[0],1.03+b.h*.5,b.z-center[1],.24,.13,.23,'photo-observed seasonal flower color, illustrative');}}
 const near=kit.buildRecipe(r,{castShadow:false}),lod=new THREE.LOD();lod.position.set(center[0],0,center[1]);lod.addLevel(near,0);lod.addLevel(new THREE.Group(),1300,.1);root.add(lod);root.userData={trees:plan.trees.length,beds:plan.beds.length,accuracy:plan.accuracy};return root;}
