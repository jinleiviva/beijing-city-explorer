import {createInfillGuard} from './infill-constraints.js';
import {project,rng,hash,bounds,yieldFrame} from './geo.js';
import {SpatialGrid,buildingIndex,insideBuilding,roadIndex,nearRoad,polygonIndex,inPolygons} from './spatial.js';

/** Inferred old-city fabric in incomplete OSM blocks. Never represented as surveyed buildings. */
export async function generateOldCityInfill(buildingFeatures,roads,parks,waters,landuseFeatures,{maxBuildings=10800,exclusions=[],avoidMask=null}={}){
 const guard=createInfillGuard({roads,parks,waters},exclusions);const existing=buildingIndex(buildingFeatures),inferred=new SpatialGrid(60),roadMask=roadIndex(roads),openSpace=polygonIndex([...parks,...waters]);
 const residential=[],retail=[];
 for(const f of landuseFeatures){if(f.properties.kind!=='landuse')continue;const isResidential=f.properties.class==='residential',isRetail=['retail','commercial'].includes(f.properties.class);if(!isResidential&&!isRetail)continue;const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];for(const p of polys)(isResidential?residential:retail).push({rings:p.map(r=>r.map(project))});}
 const residentialMask=polygonIndex(residential),retailMask=polygonIndex(retail);
 const forbidden=[];for(const f of exclusions){const reasons=f.properties.exclusionReasons||[];if(reasons.length&&reasons.every(r=>['landuse:retail','landuse:commercial'].includes(r)))continue;const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:f.geometry.type==='Polygon'?[f.geometry.coordinates]:[];for(const p of polys)forbidden.push({rings:p.map(r=>r.map(project))});}
 const exclusionMask=polygonIndex(forbidden);
 const regions=[{id:'shichahai_context',bbox:[116.365,39.930,116.402,39.950],angle:-.015},{id:'east_old_city_context',bbox:[116.400,39.916,116.430,39.945],angle:.012},{id:'west_old_city_context',bbox:[116.357,39.914,116.380,39.934],angle:-.01},{id:'qianmen_context',bbox:[116.377,39.887,116.412,39.901],angle:.01}];
 const instances=[],courtyardTrees=[];const rejected={mappedBuilding:0,road:0,openSpace:0,nonResidential:0,otherInfill:0};
 const rectangle=(x,z,w,d,angle)=>{const c=Math.cos(angle),s=Math.sin(angle);return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([xx,zz])=>[x+xx*c+zz*s,z-xx*s+zz*c]);};
 for(const region of regions){let regionCount=0;const regionBudget=Math.floor(maxBuildings/regions.length);const sw=project([region.bbox[0],region.bbox[1]]),ne=project([region.bbox[2],region.bbox[3]]);let row=0;
  for(let z=ne[1]+7;z<sw[1]-7;z+=21){row++;for(let x=sw[0]+8+(row%2)*6;x<ne[0]-8;x+=27){
   if(regionCount>=regionBudget)break;
   const cellId=`${region.id}-${row}-${Math.round(x)}`,random=rng(hash(cellId));
   const xx=x+(random()-.5)*10,zz=z+(random()-.5)*8;
   if((avoidMask&&insideBuilding(avoidMask,xx,zz,2))||inPolygons(exclusionMask,xx,zz)){rejected.nonResidential++;continue;}
   const mappedResidential=inPolygons(residentialMask,xx,zz),retailParcel=inPolygons(retailMask,xx,zz);
   if(inPolygons(openSpace,xx,zz)){rejected.openSpace++;continue;}
   const courtyard=random()<.35;let width=courtyard?23+random()*8:16+random()*11,depth=courtyard?26+random()*10:7.5+random()*5.5;
   const rotation=region.angle+(!courtyard&&random()<.18?Math.PI/2:0),margin=Math.min(width,depth)*.35;
   if(nearRoad(roadMask,xx,zz,margin)){rejected.road++;continue;}
   if(insideBuilding(existing,xx,zz,margin+1)){rejected.mappedBuilding++;continue;}
   if(insideBuilding(inferred,xx,zz,margin+1)){rejected.otherInfill++;continue;}
   const ring=rectangle(xx,zz,width,depth,rotation),corners=ring.slice(0,4);
   if(!guard(ring)||corners.some(([x,z])=>(avoidMask&&insideBuilding(avoidMask,x,z,2))||inPolygons(exclusionMask,x,z)||inPolygons(openSpace,x,z)||nearRoad(roadMask,x,z,1)||insideBuilding(existing,x,z,1)||insideBuilding(inferred,x,z,1)))continue;
   const height=4.1+random()*2.6,id=`inferred-${cellId}`;
   const instance={id,family:courtyard?'hutong':'gray_tile_wing',x:xx,z:zz,width,depth,height,rotation,seed:hash(id),detail:0,variant:Math.floor(random()*4),retailFrontage:retailParcel,source:mappedResidential?'OSM residential parcel and local lane constraints':retailParcel?'Mapped old-city retail parcel and local lane constraints':'Official old-city neighborhood plan extent; unmapped block constrained by real OSM local lanes, public-land exclusions and mapped buildings',accuracy:'Procedural inferred courtyard or building, not a mapped or surveyed footprint',region:region.id};instances.push(instance);regionCount++;
   const bb=bounds(ring);inferred.insert({id,ring,bb},bb);
   if(courtyard&&random()<.72)courtyardTrees.push({x:xx+(random()-.5)*3,z:zz+(random()-.5)*3,h:5.2+random()*3.2,r:2.1+random()*.9,type:'broad',seed:random(),priority:true,courtyard:true});
  }if(row%20===0)await yieldFrame();}
 }
 // Buildings added to the planting collision index; courtyard centres are added separately as intentional planting.
 for(const i of instances){const ring=rectangle(i.x,i.z,i.width,i.depth,i.rotation),bb=bounds(ring);existing.insert({id:i.id,ring,bb},bb);}
 return{instances,courtyardTrees,existingBuildingIndex:existing,roadMask,stats:{count:instances.length,courtyards:instances.filter(i=>i.family==='hutong').length,wings:instances.filter(i=>i.family==='gray_tile_wing').length,courtyardTrees:courtyardTrees.length,regions:regions.map(r=>r.id),rejected,accuracy:'Explicitly inferred mixed old-city courtyard/wing context; real roads, public-use exclusions, water and parks kept clear. Varying roof orientation and lot dimensions are plausible typology, not surveyed individual houses.'}};
}
