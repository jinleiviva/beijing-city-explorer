import * as THREE from '../vendor/three.module.js';
import {allowModernDistrictKit,hasTrustedHeight} from './building-semantics.js';
import {project,centroid,polygonArea,hash,rng} from './geo.js';
import {districtAt,inferredHeight} from './context-buildings.js';

/** Select mapped simple footprints for richer parametric architectural treatment.
 * This preserves placement and a fitted footprint, but facade/roof design is inferred.
 */
function orientedBox(ring){
 let best=null;
 for(let i=1;i<ring.length;i++){
  const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<3)continue;
  const ux=dx/l,uz=dz/l,vx=-uz,vz=ux;let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity;
  for(const p of ring){const u=p[0]*ux+p[1]*uz,v=p[0]*vx+p[1]*vz;minU=Math.min(minU,u);maxU=Math.max(maxU,u);minV=Math.min(minV,v);maxV=Math.max(maxV,v);}
  const width=maxU-minU,depth=maxV-minV,area=width*depth;
  if(!best||area<best.area)best={area,width,depth,x:(minU+maxU)/2*ux+(minV+maxV)/2*vx,z:(minU+maxU)/2*uz+(minV+maxV)/2*vz,rotation:-Math.atan2(uz,ux)};
 }
 return best;
}
export function selectDistrictBuildings(features,{maxBuildings=2800,landmarkExclusions=[],streetCatalog=[]}={}){
 const candidates=[];
 for(const f of features){const p=f.properties,g=f.geometry;if(g.type!=='Polygon'||g.coordinates.length>1||p.part==='yes')continue;
  if(!allowModernDistrictKit(p))continue;
  const ring=g.coordinates[0].map(project),area=polygonArea(ring);if(area<100||area>14000||ring.length>15)continue;
  const box=orientedBox(ring);if(!box||area/box.area<.77||box.width<6||box.depth<6)continue;
  const c=centroid(ring),ll=g.coordinates[0][0],district=districtAt(...ll),r=rng(hash(f.id));
  const fallback=!hasTrustedHeight(p);const height=inferredHeight(p,ll[0],ll[1],r,area,f.id);
  let family='slab',priority=1;
  if(district==='cbd'){family=height>42?'cbd':'commercial';priority=5;}
  else if(district==='financial'){family=height>24?'financial':'commercial';priority=5;}
  else if(district==='wangfujing'){family='commercial';priority=5;}
  else if(district==='sanlitun'){family='sanlitun';priority=5;}
  else if(district==='hutong'){if(height>12){family=height>42?'tower':'slab';priority=2;}else{if(Math.max(box.width,box.depth)>55&&Math.min(box.width,box.depth)>18)continue;family='hutong';priority=3;}}
  else {family=height>42?'tower':'slab';priority=1;}
  if(family==='hutong'&&(box.width/box.depth>2.3||box.depth/box.width>2.3||area<450))family='gray_tile_wing';
  if(landmarkExclusions.some(e=>Math.hypot(c[0]-e.x,c[1]-e.z)<e.radius))continue;
  // Building modules include small projecting podiums, so fit slightly inside the footprint.
  const fit=family==='cbd'||family==='financial'?.97:.96;
  candidates.push({id:f.id,family,x:box.x,z:box.z,width:box.width*fit,depth:box.depth*fit,height,rotation:box.rotation,seed:hash(f.id),variant:Math.floor(r()*4),detail:0,source:p.source,accuracy:'Mapped footprint with inferred architectural facade and roof',priority,rank:r()});
 }
 candidates.sort((a,b)=>(b.priority-a.priority)||(a.rank-b.rank));
 const quotas={cbd:500,financial:320,commercial:400,sanlitun:240,hutong:220,gray_tile_wing:500,slab:420,tower:160};const used={},selected=[],chosen=new Set(),streetCoverage=[];
 // Every named street receives a bounded local architectural focus where suitable
 // mapped simple footprints exist. This does not fabricate missing surveyed footprints.
 for(const street of streetCatalog){const[x,z]=project(street.coordinates),near=candidates.map(c=>({c,d:Math.hypot(c.x-x,c.z-z)})).filter(o=>o.d<380).sort((a,b)=>a.d-b.d).slice(0,12);streetCoverage.push({id:street.id,mappedDetailedFrontageCandidates:near.length,searchRadius:380,selected:near.map(o=>o.c.id)});for(const {c}of near){c.streetInfluence??=[];c.streetInfluence.push(street.id);if(chosen.has(c.id)||selected.length>=maxBuildings)continue;selected.push(c);chosen.add(c.id);used[c.family]=(used[c.family]||0)+1;}}
 for(const c of candidates){if(selected.length>=maxBuildings)break;if(chosen.has(c.id))continue;if((used[c.family]||0)<(quotas[c.family]||100)){selected.push(c);chosen.add(c.id);used[c.family]=(used[c.family]||0)+1;}}const ids=new Set(selected.map(b=>b.id));
 const counts={};for(const b of selected)counts[b.family]=(counts[b.family]||0)+1;
 return{instances:selected,ids,counts,streetCoverage};
}
