/** Bounded furniture/landscape along the north/west mapped mall edges.
 * Photo-supported types; specific positions/species are authored, not surveyed.
 */
import {Recipe} from '../../architecture/geometry.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {footprintEdges} from '../../architecture/site-massing.js';
import {project,distanceToSegment} from '../../geo.js';
import {insideBuilding} from '../../spatial.js';
import {appendParkedBike,appendStreetBench} from '../cbd-street-detail/index.js';
import {MALL_CORNER_GROUND,MALL_CORNER_SOURCE} from './index.js';
const LEAF={type:'mesh',flatShading:true,vertices:[0,0,-.5,-.5,0,0,0,0,.5,.5,0,0,0,.20,0,0,-.12,0],indices:[4,0,1,4,1,2,4,2,3,4,3,0,5,1,0,5,2,1,5,3,2,5,0,3]};
const box=(r,m,x,y,z,w,h,d,label,shadow=false)=>{r.box(m,x,y,z,w,h,d,'Mall plaza '+label);r.parts.at(-1).castShadow=shadow;};
function plantingBed(r,x,z,length,depth,fine){
 box(r,'greyBrickDark',x,.06,z,length,.12,depth,'recessed soil');
 for(const s of[-1,1])box(r,'stoneDark',x,.09,z+s*(depth/2+.05),length+.20,.18,.10,'long low stone edging',true);
 for(const s of[-1,1])box(r,'stoneDark',x+s*(length/2+.05),.09,z,.10,.18,depth,'end low stone edging',true);
 const n=Math.ceil(length/.65);for(let i=0;i<n;i++){const px=x-length*.46+length*.92*i/(n-1),pz=z+Math.sin(i*2.31)*depth*.16,h=.58+.14*Math.sin(i*.7);r.cylinder('timber',px,.24,pz,.022,.42,'Mall plaza shrub basal stem',5,.8);r.parts.at(-1).castShadow=false;
  for(let k=0;k<(fine?12:7);k++){const a=k*2.399+i*.65,reach=.12+(k%3)*.12;r.add(LEAF,k%5===0?'grass':'foliage',[px+Math.cos(a)*reach,.29+h*(.25+(k%4)*.15),pz+Math.sin(a)*reach],[.50,.46,.72],[(k%4-1.5)*.60,a,(k%3-1)*.35],'Mall plaza dense volumetric hedge leaf');r.parts.at(-1).castShadow=true;}
 }
 for(let i=0;i<n*2;i++){const px=x-length*.47+length*.94*i/(n*2-1);for(let k=0;k<3;k++){r.add(LEAF,'grass',[px,.12,z+depth*.34],[.15,.24,.38],[.8,k*2.1+i*.5,0],'Mall plaza lower groundcover blade');r.parts.at(-1).castShadow=false;}}
}
export function mallPlazaRecipe(roads,collision,{quality='std'}={}){
 const site=CBD_CONTEXT_SITES.cwtc_mall_north,a=project(site.anchorWGS84),edges=footprintEdges(site.points),chosen=[edges.find(e=>e.nz<-.98&&e.center[0]<0),edges.filter(e=>e.nx<-.98).sort((a,b)=>b.length-a.length)[0]],out=new Recipe('North mall paired street-facing plaza bands',{buildings:0,quality,source:MALL_CORNER_SOURCE,sourceId:site.osmId,groundY:MALL_CORNER_GROUND,pavingTopAboveLanduse:.008,placementAccuracy:'Photo-informed planting and parked-cycle types; arrangement authored and kept outside mapped vehicle roads/buildings',placements:[],noNewTrees:true}),fine=quality!=='low',carriageways=roads.filter(r=>r.y<4&&!['footway','path','pedestrian','steps','cycleway'].includes(r.class));
 for(let ei=0;ei<chosen.length;ei++){const e=chosen[ei],r=new Recipe('Mall plaza edge'),origin=[a[0]+e.center[0],a[1]+e.center[1]],c=Math.cos(e.rotation),s=Math.sin(e.rotation),world=(u,v)=>[origin[0]+u*c+v*s,origin[1]-u*s+v*c];
  const safe=(u,v,ru,rv)=>[-ru,ru].every(du=>[-rv,rv].every(dv=>{const[x,z]=world(u+du,v+dv);return!insideBuilding(collision,x,z,.05)&&!carriageways.some(road=>road.points.slice(1).some((p,i)=>distanceToSegment(x,z,road.points[i],p)<road.width/2+.1));}));
  // Slab tops sit 8mm above the original land-use surface, avoiding coplanar
  // depth fighting while keeping the apron essentially flush and accessible.
  // Broad clear apron supports the observed recessed gallery. Side planting is
  // grouped rather than an obstacle across the inferred central door approach.
  for(let u=-e.length/2+1;u<e.length/2-1;u+=2)for(let v=1;v<9;v+=2){if(safe(u,v,.99,.99))box(r,(Math.round(u/2)%9===0)?'stoneDark':'paving',u,-.027,v,1.985,.07,1.985,'individual plaza stone slab');}
  for(const u of [-e.length*.31,e.length*.31]){const v=5.5,len=ei?7.5:6.5;if(safe(u,v,len/2+.15,.95)){plantingBed(r,u,v,len,1.55,fine);out.metadata.placements.push({type:'hedge_and_groundcover',world:world(u,v),length:len,depth:1.75});}}
  const benchU=-e.length*.30;if(safe(benchU,8.1,1.1,.45)){appendStreetBench(r,benchU,8.1);out.metadata.placements.push({type:'bench',world:world(benchU,8.1)});}
  for(let i=0;i<3;i++){const u=e.length*.30+(i-1)*1.5,v=8.25;if(safe(u,v,.90,.65)){appendParkedBike(r,u,v,.15+(i%2)*.12,i%2?'glassBlue':'roofGold',fine);out.metadata.placements.push({type:'parked_cycle',world:world(u,v)});}}
  out.merge(r,[origin[0],MALL_CORNER_GROUND,origin[1]],e.rotation);
 }
 return out;
}
export const buildMallPlaza=(kit,roads,collision,options={})=>kit.buildMergedRecipe(mallPlazaRecipe(roads,collision,options));
/** Inferred walking bands on the new clear apron, not surveyed OSM footways.
 * They use the existing pedestrian pool and never cross a vehicle carriageway. */
export function mallPlazaWalkingRoutes(){const site=CBD_CONTEXT_SITES.cwtc_mall_north,a=project(site.anchorWGS84),edges=footprintEdges(site.points),chosen=[edges.find(e=>e.nz<-.98&&e.center[0]<0),edges.filter(e=>e.nx<-.98).sort((a,b)=>b.length-a.length)[0]];return chosen.map((e,i)=>{const c=Math.cos(e.rotation),s=Math.sin(e.rotation),at=u=>[a[0]+e.center[0]+u*c+2.75*s,a[1]+e.center[1]-u*s+2.75*c];return{id:'authored-north-mall-gallery-'+i,points:[at(-e.length*.30),at(e.length*.30)],width:3.8,y:MALL_CORNER_GROUND,class:'pedestrian',properties:{authoredDisplayPath:true,source:MALL_CORNER_SOURCE,accuracy:'Inferred clear walking band on photo-informed plaza, not a surveyed mapped route'}};});}

// Shared original geometry for the bounded visible-tree corner groups.
export {plantingBed as appendMallPlantingBed};
