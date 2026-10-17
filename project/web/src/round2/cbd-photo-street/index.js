/** Five CBD street-photo-informed families, bounded to the mapped mall corner.
 * Exact stations, bike-lane allocation and dimensions are authored, not surveyed.
 * No reference photo is distributed or used as a texture. All detail is mesh.
 */
import {Recipe} from '../../architecture/geometry.js';
import {insideBuilding} from '../../spatial.js';
import {distanceToSegment} from '../../geo.js';
import {MALL_JUNCTION_PLAN as J} from '../cbd-mall-junction/plan.js';
import {MALL_VISIBLE_TREE_RECORDS as TREES} from '../cbd-mall-corner/visible-trees.js';
import {mallPlazaRecipe,mallPlazaWalkingRoutes} from '../cbd-mall-corner/plaza.js';
import {streetWord} from './lettering.js';
export const STREET_PHOTO_SOURCES=['https://www.wayfinding.com.cn/page2536','https://www.wayfinding.com.cn/uploads/image/202401/1706151677.jpg','https://www.wayfinding.com.cn/uploads/image/202401/1706162853.jpg','https://www.wayfinding.com.cn/uploads/image/202401/1706155300.jpg'];
const box=(r,m,p,s,label,yaw=0)=>{r.box(m,...p,...s,'CBD photographed street type · '+label,yaw);r.parts.at(-1).castShadow=false;};
function bar(r,m,a,b,width,height,y,label){const dx=b[0]-a[0],dz=b[1]-a[1];box(r,m,[(a[0]+b[0])/2,y,(a[1]+b[1])/2],[width,height,Math.hypot(dx,dz)],label,Math.atan2(dx,dz));}
function atAxis(road,value,axis){for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i];if((value-a[axis])*(value-b[axis])<=0){const t=(value-a[axis])/(b[axis]-a[axis]),l=Math.hypot(b[0]-a[0],b[1]-a[1]);return{p:[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])],d:[(b[0]-a[0])/l,(b[1]-a[1])/l]};}}throw Error('Street station outside mapped road');}
function word(r,text,center,size,yaw,maxWidth){const g=streetWord(text,.014),s=Math.min(size,maxWidth/g.width);r.add(g.geometry,'streetPhotoWhite',center,[s,s,1],[0,yaw,0],'CBD road-name lettering · '+text);r.parts.at(-1).castShadow=false;return{text,center,size:s,width:g.width*s,height:g.height*s,yaw};}
function flatBike(r,x,z,y,rotation,size=1){
 const map=(u,v)=>[x+Math.cos(rotation)*u+Math.sin(rotation)*v,z-Math.sin(rotation)*u+Math.cos(rotation)*v];
 for(const cx of[-.46,.46])for(let k=0;k<16;k++){const a=k/16*Math.PI*2,b=(k+1)/16*Math.PI*2;bar(r,'streetPhotoWhite',map((cx+Math.cos(a)*.30)*size,Math.sin(a)*.30*size),map((cx+Math.cos(b)*.30)*size,Math.sin(b)*.30*size),.035*size,.008,y,'white cycle wheel');}
 for(const[a,b]of[[[-.46,0],[-.10,0]],[[-.10,0],[-.23,-.50]],[[-.23,-.50],[-.46,0]],[[-.23,-.50],[.26,-.48]],[[.26,-.48],[-.10,0]],[[.26,-.48],[.46,0]],[[.26,-.48],[.23,-.70]],[[.23,-.70],[.43,-.70]],[[-.35,-.55],[-.11,-.55]]])bar(r,'streetPhotoWhite',map(a[0]*size,a[1]*size),map(b[0]*size,b[1]*size),.04*size,.008,y,'white cycle frame');
}
export function cbdPhotoStreetRecipe(roads,collision,groundAt,{quality='standard'}={}){
 const r=new Recipe('Mapped mall corner · Beijing street-photo details',{buildings:0,quality,sources:STREET_PHOTO_SOURCES,sourceRoadIds:J.stopControls.map(x=>x.sourceRoadId),placements:[],lettering:[],unmeasured:true,photoLocationCaveat:'References are nearby CBD northwest district types, not proof of these exact installed objects. Road names use the mapped East Jintong / Guanghua intersection.',lightObjectsAdded:0}),byId=new Map(roads.map(x=>[x.id,x])),carriageways=roads.filter(x=>x.y<4&&!['footway','path','pedestrian','steps','cycleway'].includes(x.class)),walks=mallPlazaWalkingRoutes();
 const safe=(x,z,rad=.2)=>!insideBuilding(collision,x,z,rad)&&!carriageways.some(q=>q.points.slice(1).some((b,i)=>distanceToSegment(x,z,q.points[i],b)<q.width/2+rad))&&!walks.some(q=>distanceToSegment(x,z,q.points[0],q.points[1])<q.width/2+rad);
 // Only the mapped north/south median has enough free width here. The east/west
 // paired carriageways overlap near this corner; no railing is forced there.
 const nb=byId.get('osm-way-25761584'),sb=byId.get('osm-way-223865804');
 const rail=[];for(let z=-345;z<=-313;z+=2){const a=atAxis(nb,z,1),b=atAxis(sb,z,1),x=(a.p[0]+b.p[0])/2,y=groundAt(x,z);if(!safe(x,z,.10))throw Error('Median rail would occupy a mapped carriageway');rail.push([x,z,y]);r.cylinder('streetPhotoGold',x,y+.57,z,.045,1.14,'Median grounded gold-brown post',8,1);r.parts.at(-1).castShadow=false;box(r,'streetPhotoGold',[x,y+.065,z],[.17,.13,.17],'median post foot');}
 for(let i=1;i<rail.length;i++){const a=rail[i-1],b=rail[i];for(const h of[.29,.97])bar(r,'streetPhotoGold',a,b,.038,.038,(a[2]+b[2])/2+h,'median horizontal rail');for(let k=1;k<=7;k++){const t=k/8,x=a[0]+t*(b[0]-a[0]),z=a[1]+t*(b[1]-a[1]),y=a[2]+t*(b[2]-a[2]);box(r,'streetPhotoGold',[x,y+.63,z],[.023,.68,.023],'fine vertical median bar');}}
 r.metadata.placements.push({type:'median_rail',points:rail,span:32,openingBeforeCrosswalkMetres:8.7,notOnOverlappingEastWestCarriageways:true});
 // Painted edge band uses the spare outer 1.6m of each 14m carriageway. Actual
 // source traffic centre is offset3.08m; even its widest body ends <4.4m.
 for(const id of['osm-way-1147350758','osm-way-1147352145']){const q=byId.get(id),samples=[];for(const x of[4645,4718]){const s=atAxis(q,x,0),n=[-s.d[1],s.d[0]];samples.push({center:s.p,n,d:s.d,p:[s.p[0]+n[0]*6.05,s.p[1]+n[1]*6.05]});}const[a,b]=samples,y=q.y+.006;bar(r,'streetPhotoBrick',a.p,b.p,1.60,.008,y,'bounded muted brick-red cycle band');for(const off of[5.23,6.88])bar(r,'streetPhotoWhite',[a.center[0]+a.n[0]*off,a.center[1]+a.n[1]*off],[b.center[0]+b.n[0]*off,b.center[1]+b.n[1]*off],.045,.008,y+.006,'cycle band edge line');
  for(const x of[4655,4698]){const s=atAxis(q,x,0),n=[-s.d[1],s.d[0]],p=[s.p[0]+n[0]*6.05,s.p[1]+n[1]*6.05];flatBike(r,...p,q.y+.020,Math.atan2(-s.d[1],s.d[0]),.90);}
  r.metadata.placements.push({type:'cycle_band',sourceRoadId:id,endpoints:samples.map(s=>s.p),width:1.60,lateralRange:[5.25,6.85],y:q.y+.010,carRouteOffset:3.08,assignment:'Photo-informed authored allocation within existing width; not surveyed cycle-lane data'});
 }
 // Flush sloped crossing mouths connect the source road surface to its lower
 // sidewalk datum; original curb arcs are outside these four clear openings.
 for(const c of J.crossings.filter(c=>['E','S'].includes(c.arm)))for(let end=0;end<2;end++){
  const sign=end?1:-1,u=c.acrossUnit.map(x=>x*sign),v=[-u[1],u[0]],p=c.curbEndpoints[end],width=c.crosswalkDepth,depth=1.8,inner=[p[0]-u[0]*.035,p[1]-u[1]*.035],outer=[p[0]+u[0]*depth,p[1]+u[1]*depth],y0=Math.max(...c.sourceRoadIds.map(id=>byId.get(id).y))+.004,y1=groundAt(...outer)+.004;
  if(Math.abs(y0-y1)/depth>1/12)throw Error('Photo-informed crossing mouth too steep for a credible gentle transition');
  const points=[[-1,inner,y0],[1,inner,y0],[1,outer,y1],[-1,outer,y1]].map(([side,p,y])=>[p[0]+v[0]*side*width/2,y,p[1]+v[1]*side*width/2]);
  const a=points[0],b=points[1],cc=points[2],up=(b[2]-a[2])*(cc[0]-a[0])-(b[0]-a[0])*(cc[2]-a[2]),indices=up>0?[0,1,2,0,2,3]:[0,2,1,0,3,2];r.add({type:'mesh',vertices:points.flat(),indices,flatShading:true},'streetPhotoGranite',[0,0,0],[1,1,1],[0,0,0],'CBD crossing continuous sloped surface');r.parts.at(-1).castShadow=false;
  r.metadata.placements.push({type:'crossing_ramp',crossing:c.id,inner,outer,width,depth,y0,y1,slope:Math.abs(y0-y1)/depth,geometryOnlyNotAccessCertification:true});
 }
 // Paired low granite posts leave the complete4.4m crossing clear and do not
 // add a raised curb across its mouth. They are outside the mapped road body.
 for(const c of J.crossings.filter(c=>['E','S'].includes(c.arm)))for(let end=0;end<2;end++)for(const side of[-1,1]){const sign=end?1:-1,u=c.acrossUnit,v=[-u[1],u[0]],p=c.curbEndpoints[end],x=p[0]+u[0]*sign*.52+v[0]*side*2.72,z=p[1]+u[1]*sign*.52+v[1]*side*2.72;if(!safe(x,z,.18)||TREES.some(t=>Math.hypot(t.x-x,t.z-z)<1.30)||J.signals.some(s=>Math.hypot(s.polePosition[0]-x,s.polePosition[1]-z)<.5))continue;const y=groundAt(x,z);r.cylinder('streetPhotoGranite',x,y+.36,z,.16,.72,'Granite low crossing bollard',12,.92);r.parts.at(-1).castShadow=false;r.cylinder('streetPhotoYellow',x,y+.55,z,.161,.07,'Single yellow reflective bollard band',12,.92);r.parts.at(-1).castShadow=false;r.metadata.placements.push({type:'bollard',crossing:c.id,base:[x,y,z],radius:.161,height:.72,clearCrosswalkWidth:c.crosswalkDepth});}
 for(const[x,z]of[[4637,-354],[4584,-399]]){if(!safe(x,z,.47)||TREES.some(t=>Math.hypot(t.x-x,t.z-z)<1.65))throw Error('Road-name column unsafe');const y=groundAt(x,z),yaw=Math.PI;box(r,'streetPhotoBlue',[x,y+1.70,z],[.84,3.30,.18],'narrow road-name direction column');box(r,'streetPhotoGold',[x-.39,y+1.70,z-.103],[.045,3.30,.028],'muted gold edge');box(r,'streetPhotoGranite',[x,y+.055,z],[.98,.11,.34],'flush road-name column base');for(const[text,h,size]of[['光华路',2.95,.19],['GUANGHUA ROAD',2.68,.074],['金桐东路',2.15,.17],['EAST JINTONG ROAD',1.89,.062]])r.metadata.lettering.push(word(r,text,[x,y+h,z-.107],size,yaw,.70));
  // Simple cross-street pictogram; no invented shop destinations or distances.
  box(r,'streetPhotoWhite',[x,y+1.24,z-.112],[.055,.68,.012],'wayfinding cross vertical');box(r,'streetPhotoWhite',[x,y+1.24,z-.112],[.50,.055,.012],'wayfinding cross horizontal');
  r.metadata.placements.push({type:'road_name_column',base:[x,y,z],height:3.35,width:.84,realNames:['光华路','金桐东路'],sourceNamesMatch:true});
 }
 const bikes=mallPlazaRecipe(roads,collision).metadata.placements.filter(p=>p.type==='parked_cycle');
 for(let start=0;start<bikes.length;start+=3){const group=bikes.slice(start,start+3);if(group.length!==3)continue;const a=group[0].world,b=group[2].world,c=[(a[0]+b[0])/2,(a[1]+b[1])/2],l=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/l,(b[1]-a[1])/l],v=[-u[1],u[0]],at=(s,t)=>[c[0]+u[0]*s+v[0]*t,c[1]+u[1]*s+v[1]*t],half=2.55;
  const corners=[at(-half,-.85),at(half,-.85),at(half,.85),at(-half,.85)];if(!corners.every(p=>safe(...p,.04)))throw Error('Bicycle bay invades road or walking band');for(let i=0;i<4;i++){const p=corners[i],q=corners[(i+1)%4];bar(r,'streetPhotoWhite',p,q,.045,.008,Math.max(groundAt(...p),groundAt(...q))+.012,'white parked-cycle bay outline');}
  const end=at(half+1.02,0),y=groundAt(...end);if(!safe(...end,.55))throw Error('Bicycle bay planter unsafe');box(r,'streetPhotoGranite',[end[0],y+.26,end[1]],[.82,.52,1.42],'bike bay end stone planter',Math.atan2(-u[1],u[0]));box(r,'streetPhotoSoil',[end[0],y+.50,end[1]],[.68,.035,1.26],'planter recessed soil',Math.atan2(-u[1],u[0]));for(const k of[-1,0,1]){const p=[end[0]+v[0]*k*.36,end[1]+v[1]*k*.36];r.cylinder('foliage',p[0],y+.71,p[1],.30,.34,'Bicycle bay low planting clump',7,.80);r.parts.at(-1).castShadow=false;}flatBike(r,...at(-half+.65,0),groundAt(...at(-half+.65,0))+.018,Math.atan2(-u[1],u[0]),.55);const badge=new Recipe('Stone planter white bicycle badge'),line=(a,b)=>{box(badge,'streetPhotoWhite',[(a[0]+b[0])/2,(a[1]+b[1])/2,-.722],[Math.hypot(b[0]-a[0],b[1]-a[1]),.017,.012],'stone planter bicycle pictogram');badge.parts.at(-1).rotation[2]=Math.atan2(b[1]-a[1],b[0]-a[0]);};for(const cx of[-.17,.17])for(let k=0;k<12;k++){const a=k/12*Math.PI*2,b=(k+1)/12*Math.PI*2;line([cx+Math.cos(a)*.105,.23+Math.sin(a)*.105],[cx+Math.cos(b)*.105,.23+Math.sin(b)*.105]);}for(const[a,b]of[[[-.17,.23],[-.03,.23]],[[-.03,.23],[-.08,.40]],[[-.08,.40],[-.17,.23]],[[-.08,.40],[.09,.40]],[[.09,.40],[-.03,.23]],[[.09,.40],[.17,.23]],[[.09,.40],[.08,.47]],[[.08,.47],[.16,.47]]])line(a,b);r.merge(badge,[end[0],y,end[1]],Math.atan2(-u[1],u[0]));r.metadata.placements.push({type:'bicycle_parking_bay',corners,existingBikeCount:3,planterBase:[...end,y],noAddedBikeCount:true});
 }
 r.metadata.counts=Object.fromEntries(['median_rail','cycle_band','bollard','road_name_column','bicycle_parking_bay'].map(type=>[type,r.metadata.placements.filter(p=>p.type===type).length]));r.metadata.noNewVehicleRoutes=true;r.metadata.noChangedTreePositions=true;r.metadata.noAddedPointLights=true;return r;
}
export function buildCbdPhotoStreet(kit,roads,collision,groundAt,options={}){
 for(const[name,base,color,roughness]of[['streetPhotoGold','metal','#96763F',.65],['streetPhotoBrick','paving','#8E5145',.96],['streetPhotoWhite','marble','#E2DFCA',.95],['streetPhotoBlue','metalDark','#233B4D',.72],['streetPhotoGranite','stoneDark','#9CA09A',.94],['streetPhotoYellow','roofGold','#C9A548',.8],['streetPhotoSoil','stoneDark','#4C5348',1]])if(!kit.materials[name]){const m=kit.materials[base].clone();m.name=name;m.color.set(color);m.roughness=roughness;m.metalness=name==='streetPhotoGold'?.25:0;kit.materials[name]=m;}
 return kit.buildMergedRecipe(cbdPhotoStreetRecipe(roads,collision,groundAt,options),{castShadow:false});
}
