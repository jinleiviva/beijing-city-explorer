import {createMidFoliageBatch} from './round2/cbd-street-detail/mid-foliage.js';
import {createHeroTreeBatch} from './round2/hero-trees.js';
import {guardTreeGround} from './tree-ground-guard.js';
import * as THREE from '../vendor/three.module.js';
import {bounds,pointInRing,hash,rng,yieldFrame} from './geo.js';
import {insideBuilding,polygonIndex,inPolygons,roadIndex,nearRoad} from './spatial.js';

export async function buildLandscape(roads,parks,{maxTrees=46000,buildingMask=null,waters=[],heightAt=()=>0,extraTrees=[],styleOverrides={},detailZones=[],plantingExclusions=[],canopyZones=null,heroTreeSelector=null,heroTreeZones=[],heroTreeLimit=8,heroTreeRecords=[],midTreeZones=[],lodHysteresis=0,initializeLodVisibility=false}={}){
 if(!Number.isFinite(lodHysteresis)||lodHysteresis<0||lodHysteresis>.3)throw new RangeError('Tree LOD hysteresis must be between 0 and .3');
 const group=new THREE.Group();group.name='Procedural urban planting on mapped streets and parks';
 const heroCollections=[],heroSourceRecords=[],midCollections=[],midSourceRecords=[],heroRecordOverrides=new Map();
 let isRound2Hero=t=>Math.hypot(t.x+819.1046059869,t.z+3264.0328898391513)<.05;
 const trees=[],stableScore=t=>hash(t.x.toFixed(3)+','+t.z.toFixed(3)+':tree-budget')/4294967296,waterMask=polygonIndex(waters),walkMask=roadIndex(roads),extraExclusionMask=polygonIndex(plantingExclusions),canopyZoneMask=polygonIndex(canopyZones?.replacementPolygons||canopyZones?.polygons||[]);
 const canPlant=(x,z)=>!inPolygons(canopyZoneMask,x,z)&&!detailZones.some(b=>x>=b[0]&&z>=b[1]&&x<=b[2]&&z<=b[3])&&!inPolygons(extraExclusionMask,x,z)&&!nearRoad(walkMask,x,z,-1.8)&&!inPolygons(waterMask,x,z)&&(!buildingMask||!insideBuilding(buildingMask,x,z,1.2));
 for(const road of roads){
  if(road.properties.customBridge||road.properties.bridge==='yes'||road.elevationProfile)continue;
  if(!['primary','secondary','tertiary','trunk','pedestrian','residential'].includes(road.class)||road.y>3)continue;
  const rr=rng(hash(road.id)),observed=styleOverrides[road.properties.streetId]?.trees,range=observed?.spacingMetresRange,spacing=range?(range[0]+range[1])*.5:(road.properties.streetId?17:road.class==='residential'?32:25);if(observed?.density==='none')continue;
  let carry=rr()*spacing;
  for(let i=1;i<road.points.length;i++){
   const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<1)continue;
   for(let d=carry;d<l;d+=spacing){const t=d/l;for(const side of [-1,1]){if(rr()>.88)continue;const offset=road.width/2+4.5+rr()*1.2;
    const x=a[0]+dx*t-dz/l*offset*side,z=a[1]+dz*t+dx/l*offset*side;if(canPlant(x,z))trees.push({x,z,h:8+rr()*5,r:2.8+rr()*1.6,type:rr()>.94?'conifer':'broad',seed:rr(),colorGroup:hash(road.properties.streetId||road.id)%6,priority:!!road.properties.streetId});
   }}carry=(carry-l)%spacing;if(carry<0)carry+=spacing;
  }
 }
 // Subsample repeatably so the complete city remains within a bounded budget.
 if(trees.length>maxTrees*.70){const important=trees.filter(t=>t.priority),other=trees.filter(t=>!t.priority),budget=Math.max(0,Math.floor(maxTrees*.70)-important.length),ratio=budget/other.length;trees.length=0;trees.push(...important,...other.filter(t=>stableScore(t)<ratio));}
 for(let n=0;n<parks.length;n++){
  const p=parks[n],bb=bounds(p.rings[0]);const area=(bb[2]-bb[0])*(bb[3]-bb[1]);const rr=rng(hash(p.id));
  const count=Math.min(850,Math.floor(area/480));
  for(let i=0;i<count;i++){
   const x=bb[0]+rr()*(bb[2]-bb[0]),z=bb[1]+rr()*(bb[3]-bb[1]);
   if(canPlant(x,z)&&pointInRing(x,z,p.rings[0])&&!p.rings.slice(1).some(r=>pointInRing(x,z,r)))trees.push({x,z,h:7+rr()*9,r:3.8+rr()*2.7,type:rr()>.8?'conifer':'broad',seed:rr(),colorGroup:hash(p.id)%6});
  }
  if(n%150===0)await yieldFrame();
 }
 // Willow-like waterfront planting follows the mapped shore, with each tree tested against water/buildings.
 for(const water of waters){if(!water.name||!/(海|湖|池)/.test(water.name))continue;const rr=rng(hash(water.id));for(const ring of water.rings){for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);for(let d=4;d<length;d+=16){for(const side of [-1,1]){const x=a[0]+dx*d/length-dz/length*7*side,z=a[1]+dz*d/length+dx/length*7*side;if(canPlant(x,z)){trees.push({x,z,h:8+rr()*4,r:3.2+rr()*1.1,type:'willow',seed:rr(),colorGroup:hash(water.id)%6,priority:true});break;}}}}}}
 if(trees.length>maxTrees){const important=trees.filter(t=>t.priority),other=trees.filter(t=>!t.priority);trees.length=0;trees.push(...important,...other.filter(t=>stableScore(t)<Math.max(0,maxTrees-important.length)/other.length));}
 const filteredExtra=extraTrees.filter(t=>!inPolygons(canopyZoneMask,t.x,t.z)&&!inPolygons(extraExclusionMask,t.x,t.z));const localCanopy=(canopyZones?.trees||[]).filter(t=>!inPolygons(extraExclusionMask,t.x,t.z)&&(!buildingMask||!insideBuilding(buildingMask,t.x,t.z,.7)));trees.push(...filteredExtra,...localCanopy);
 const finalGroundGuard=guardTreeGround(trees,roads,waters);trees.length=0;trees.push(...finalGroundGuard.trees);
 if(heroTreeZones.length){
  // Bounded per-view allocation replaces source-order selection. All selected
  // records are existing guarded trees; no positions, sizes or counts change.
  const selected=new Set();
  for(const zone of heroTreeZones){const forward=zone.forward||[1,0],score=t=>Math.hypot(t.x-zone.x,t.z-zone.z)+(((t.x-zone.x)*forward[0]+(t.z-zone.z)*forward[1])<0?40:0);const candidates=trees.filter(t=>!selected.has(t)&&Math.hypot(t.x-zone.x,t.z-zone.z)<zone.radius).sort((a,b)=>score(a)-score(b));for(const t of candidates.slice(0,Math.min(zone.count||4,Math.min(20,heroTreeLimit)-selected.size)))selected.add(t);}
  // Exact previously generated sources, selected after a visible-pixel audit.
  // Refuse stale coordinates instead of silently choosing a different tree.
  for(const ref of heroTreeRecords){const t=trees.find(t=>Math.abs(t.x-ref.x)<1e-6&&Math.abs(t.z-ref.z)<1e-6&&Math.abs(t.seed-ref.seed)<1e-12);if(!t)throw new Error('Exact hero tree source no longer exists');if(Math.abs(t.h-ref.h)>1e-8||Math.abs(t.r-ref.r)>1e-8)throw new Error('Exact hero tree size changed');if(!selected.has(t)&&selected.size>=Math.min(20,heroTreeLimit))throw new Error('Exact hero tree allocation exceeds bounded budget');selected.add(t);const overrides={};if(Number.isFinite(ref.groundY))overrides.y=ref.groundY;if(ref.crownStyle==='grouped')overrides.crownStyle='grouped';if(Object.keys(overrides).length)heroRecordOverrides.set(t,overrides);}
  isRound2Hero=t=>selected.has(t);
 }else if(heroTreeSelector){const selected=new Set(trees.filter(heroTreeSelector).slice(0,8));isRound2Hero=t=>selected.has(t);}
 const midSelected=new Set();for(const zone of midTreeZones){const candidates=trees.filter(t=>!isRound2Hero(t)&&t.type==='broad'&&t.x>=zone.minX&&t.x<=zone.maxX&&Math.abs(t.z-zone.z)<=zone.halfDepth).sort((a,b)=>Math.hypot(a.x-zone.minX,a.z-zone.z)-Math.hypot(b.x-zone.minX,b.z-zone.z));for(const t of candidates.slice(0,Math.min(zone.count||12,16-midSelected.size)))midSelected.add(t);}
 const trunkGeometry=new THREE.CylinderGeometry(.18,.29,1,7);trunkGeometry.translate(0,.5,0);
 const canopyGeometry=new THREE.IcosahedronGeometry(1,0),nearCanopyGeometry=new THREE.IcosahedronGeometry(1,1);
 // Small asymmetric deformations avoid identical geometric balls while keeping the near crown at80triangles.
 const np=nearCanopyGeometry.attributes.position;for(let i=0;i<np.count;i++){const x=np.getX(i),y=np.getY(i),z=np.getZ(i),f=1+.07*Math.sin(x*7.1+z*4.3)+.06*Math.sin(y*9.4-x*2.7);np.setXYZ(i,x*f,y*(1+.06*Math.sin(z*6.2)),z*f);}np.needsUpdate=true;nearCanopyGeometry.computeBoundingSphere();
 const willowVertices=[],willowNormals=[];function appendCrown(g,x,y,z,sx,sy,sz){const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){willowVertices.push(x+p.getX(i)*sx,y+p.getY(i)*sy,z+p.getZ(i)*sz);const normal=new THREE.Vector3(n.getX(i)/sx,n.getY(i)/sy,n.getZ(i)/sz).normalize();willowNormals.push(...normal.toArray());}}
 appendCrown(nearCanopyGeometry,-.20,.26,.12,.76,.36,.73);appendCrown(nearCanopyGeometry,.27,.17,-.10,.69,.35,.76);appendCrown(nearCanopyGeometry,.03,.40,-.22,.56,.30,.57);
 for(let i=0;i<27;i++){const a=i/27*Math.PI*2,r=.62+.13*Math.sin(i*2.7),sy=.24+.17*(.5+.5*Math.sin(i*2.17));appendCrown(canopyGeometry,Math.cos(a)*r,-.12-.11*Math.sin(i*1.9),Math.sin(a)*r,.14+.04*Math.sin(i*.7),sy,.15+.03*Math.cos(i*.9));}
 const willowGeometry=new THREE.BufferGeometry();willowGeometry.setAttribute('position',new THREE.Float32BufferAttribute(willowVertices,3));willowGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(willowNormals,3));willowGeometry.computeBoundingSphere();
 const coneGeometry=new THREE.ConeGeometry(1,1,9);coneGeometry.translate(0,.5,0);
 const trunkMat=new THREE.MeshStandardMaterial({color:'#746951',roughness:1});
 const leafMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.93,flatShading:false});
 const palettes=['#427043','#5b8547','#73964c','#7b9d52','#3d6944','#90a95b'];
 // Clean broad color clusters; no high-frequency checker pattern on foliage.
 const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),pos=new THREE.Vector3();
 const tiles=new Map(),tileSize=400;
 for(const t of trees){const tx=Math.floor(t.x/tileSize),tz=Math.floor(t.z/tileSize),key=`${tx},${tz}`;if(!tiles.has(key))tiles.set(key,{x:(tx+.5)*tileSize,z:(tz+.5)*tileSize,trees:[]});tiles.get(key).trees.push(t);}
 function level(tile,detail){
  const root=new THREE.Group(),sourceList=detail===2?tile.trees.filter((_,i)=>i%2===0):tile.trees,list=detail===0?sourceList.filter(t=>!isRound2Hero(t)):sourceList;
  if(detail===0){const selected=sourceList.filter(isRound2Hero);for(let offset=0;offset<selected.length;offset+=8){const records=selected.slice(offset,offset+8).map(t=>heroRecordOverrides.has(t)?{...t,...heroRecordOverrides.get(t)}:t),standard=createHeroTreeBatch(THREE,records,{origin:[tile.x,0,tile.z],heightAt}),low=createHeroTreeBatch(THREE,records,{quality:'low',origin:[tile.x,0,tile.z],heightAt});low.group.visible=false;root.add(standard.group,low.group);heroCollections.push({standard,low});heroSourceRecords.push(...records);}}
  if(detail===0){const selected=list.filter(t=>midSelected.has(t));if(selected.length){const standard=createMidFoliageBatch(THREE,selected,{origin:[tile.x,0,tile.z],heightAt,quality:'std'}),low=createMidFoliageBatch(THREE,selected,{origin:[tile.x,0,tile.z],heightAt,quality:'low'});low.visible=false;root.add(standard,low);midCollections.push({standard,low});midSourceRecords.push(...selected);}}
  const broad=detail===0?list.filter(t=>t.type!=='willow'&&t.type!=='conifer'&&!midSelected.has(t)):list,willows=detail===0?list.filter(t=>t.type==='willow'):[],conifers=detail===0?list.filter(t=>t.type==='conifer'):[];
  const mesh=new THREE.InstancedMesh(detail===0?nearCanopyGeometry:canopyGeometry,leafMat,broad.reduce((n,t)=>n+(detail===0?(t.crownLobes||3):detail===1&&t.crownLobes?2:1),0));
  const trunks=detail===0?new THREE.InstancedMesh(trunkGeometry,trunkMat,list.length):null;let ci=0;
  for(const t of broad){const x=t.x-tile.x,z=t.z-tile.z,ground=heightAt(t.x,t.z),pine=t.type==='pine',color=new THREE.Color(palettes[t.colorGroup??hash(`${Math.floor(t.x/250)},${Math.floor(t.z/250)}`)%palettes.length]).multiplyScalar(.94+t.seed*.12);q.setFromAxisAngle(new THREE.Vector3(0,1,0),t.seed*Math.PI*2);const sy=pine?.48:t.type==='cypress'?1.30:.96;
   matrix.compose(pos.set(x,ground+t.h*.63,z),q,s.set(t.r,Math.min(t.h*.39,t.r*sy),t.r*.96));mesh.setMatrixAt(ci,matrix);mesh.setColorAt(ci++,color);
   if(detail===0){const a=t.seed*Math.PI*2,dx=Math.cos(a)*t.r*.42,dz=Math.sin(a)*t.r*.40;
    matrix.compose(pos.set(x+dx,ground+t.h*.76,z+dz),q,s.set(t.r*.76,Math.min(t.h*.29,t.r*(pine?.30:.82)),t.r*.72));mesh.setMatrixAt(ci,matrix);mesh.setColorAt(ci++,color.clone().multiplyScalar(1.06));
    matrix.compose(pos.set(x-dx,ground+t.h*.57,z-dz),q,s.set(t.r*.72,Math.min(t.h*.32,t.r*(pine?.32:.83)),t.r*.79));mesh.setMatrixAt(ci,matrix);mesh.setColorAt(ci++,color.clone().multiplyScalar(.93));
    for(let k=3;k<(t.crownLobes||3);k++){const angle=a+k*2.4,cr=t.r*(.48+(k%2)*.12);matrix.compose(pos.set(x+Math.cos(angle)*t.r*.57,ground+t.h*(.57+(k%3)*.065),z+Math.sin(angle)*t.r*.55),q,s.set(cr,Math.min(t.h*.25,cr*(pine?.49:.88)),cr*.9));mesh.setMatrixAt(ci,matrix);mesh.setColorAt(ci++,color.clone().multiplyScalar(k%2?.96:1.035));}
   }else if(detail===1&&t.crownLobes){const a=t.seed*6.28;matrix.compose(pos.set(x+Math.cos(a)*t.r*.42,ground+t.h*.76,z+Math.sin(a)*t.r*.42),q,s.set(t.r*.74,t.r*(pine?.34:.7),t.r*.78));mesh.setMatrixAt(ci,matrix);mesh.setColorAt(ci++,color.clone().multiplyScalar(1.035));}
  }mesh.castShadow=detail===0;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);
  if(willows.length){const wm=new THREE.InstancedMesh(willowGeometry,leafMat,willows.length);willows.forEach((t,i)=>{q.setFromAxisAngle(new THREE.Vector3(0,1,0),t.seed*Math.PI*2);matrix.compose(pos.set(t.x-tile.x,heightAt(t.x,t.z)+t.h*.63,t.z-tile.z),q,s.set(t.r,t.h*.40,t.r*(.78+t.seed*.32)));wm.setMatrixAt(i,matrix);wm.setColorAt(i,new THREE.Color('#7b9844').multiplyScalar(.88+t.seed*.20));});wm.castShadow=true;wm.receiveShadow=true;wm.computeBoundingSphere();root.add(wm);}
  if(conifers.length){const cm=new THREE.InstancedMesh(coneGeometry,leafMat,conifers.length*3);let i=0;for(const t of conifers)for(let k=0;k<3;k++){q.identity();matrix.compose(pos.set(t.x-tile.x,heightAt(t.x,t.z)+t.h*(.20+k*.20),t.z-tile.z),q,s.set(t.r*(1-k*.19),t.h*.43,t.r*(1-k*.19)));cm.setMatrixAt(i,matrix);cm.setColorAt(i++,new THREE.Color('#416a48').multiplyScalar(.9+k*.07));}cm.castShadow=true;cm.receiveShadow=true;cm.computeBoundingSphere();root.add(cm);}
  if(trunks){list.forEach((t,i)=>{q.setFromEuler(new THREE.Euler((t.seed-.5)*.07,0,(t.seed-.5)*.06));matrix.compose(pos.set(t.x-tile.x,heightAt(t.x,t.z)+.45,t.z-tile.z),q,s.set(Math.max(.7,t.h/11),t.h*.68,Math.max(.7,t.h/11)));trunks.setMatrixAt(i,matrix);});trunks.castShadow=true;trunks.receiveShadow=true;trunks.computeBoundingSphere();root.add(trunks);
   const branches=new THREE.InstancedMesh(trunkGeometry,trunkMat,list.length*5),up=new THREE.Vector3(0,1,0),start=new THREE.Vector3(),end=new THREE.Vector3(),direction=new THREE.Vector3();let bi=0;for(const t of list){const ground=heightAt(t.x,t.z);for(let k=0;k<5;k++){const angle=t.seed*6.28+k*2.399,reach=t.r*(.38+(k%3)*.14);start.set(t.x-tile.x,ground+t.h*(.35+(k%2)*.07),t.z-tile.z);end.set(start.x+Math.cos(angle)*reach,ground+t.h*(.61+(k%3)*.045),start.z+Math.sin(angle)*reach);direction.subVectors(end,start);q.setFromUnitVectors(up,direction.clone().normalize());matrix.compose(start,q,s.set((.09+(k%2)*.035)/.29,direction.length(),(.09+(k%2)*.035)/.29));branches.setMatrixAt(bi++,matrix);}}branches.castShadow=true;branches.receiveShadow=true;branches.computeBoundingSphere();root.add(branches);}
  return root;
 }
 const regions=new Map();for(const tile of tiles.values()){const rx=Math.floor(tile.x/1600),rz=Math.floor(tile.z/1600),key=`${rx},${rz}`;if(!regions.has(key))regions.set(key,{x:(rx+.5)*1600,z:(rz+.5)*1600,tiles:[],trees:[]});const region=regions.get(key);region.tiles.push(tile);region.trees.push(...tile.trees);}
 for(const region of regions.values()){
  const regionalLod=new THREE.LOD();regionalLod.position.set(region.x,0,region.z);const near=new THREE.Group();
  for(const tile of region.tiles){const lod=new THREE.LOD();lod.position.set(tile.x-region.x,0,tile.z-region.z);lod.addLevel(level(tile,0),0);const farLevel=level(tile,1);if(initializeLodVisibility)farLevel.visible=false;lod.addLevel(farLevel,750,lodHysteresis);near.add(lod);}
  regionalLod.addLevel(near,0);const regionalFar=level(region,2);if(initializeLodVisibility)regionalFar.visible=false;regionalLod.addLevel(regionalFar,3500,.12);group.add(regionalLod);
 }
 group.userData={round2HeroTreeCount:heroSourceRecords.length,round2HeroSourceRecords:heroSourceRecords,round2HeroStats:heroCollections.map(c=>({standard:c.standard.stats,low:c.low.stats})),round2MidTreeCount:midSourceRecords.length,round2MidSourceRecords:midSourceRecords,round2MidStats:midCollections.map(c=>({standard:c.standard.userData,low:c.low.userData})),setQuality:q=>{heroCollections.forEach(c=>{c.standard.group.visible=q!=='low';c.low.group.visible=q==='low';});midCollections.forEach(c=>{c.standard.visible=q!=='low';c.low.visible=q==='low';});},trees:trees.length,placementGuard:finalGroundGuard.audit,canopyZones:canopyZones?.zones||[],localCanopyTrees:localCanopy.length,baseTreeBudget:maxTrees,additiveTrees:filteredExtra.length,tiles:tiles.size,regions:regions.size,lodDistances:[0,750,3500],lodHysteresis:{inner:lodHysteresis,outer:.12},accuracy:'Procedural streetside and park planting; individual trees are not surveyed'};
 return group;
}
