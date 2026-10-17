/** Photo/typology-informed secondary facade geometry. Original tower heights/footprints retained. */
import {Recipe,BOX,beam} from '../../architecture/geometry.js';
import {buildingRecipe} from '../../architecture/index.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {MASSING_LAYOUT} from '../../architecture/massing-layout.js';
import {footprintEdges,edgePanel} from '../../architecture/site-massing.js';
import {project} from '../../geo.js';
const box=(r,m,x,y,z,w,h,d,label,yaw=0)=>{r.box(m,x,y,z,w,h,d,label,yaw);r.parts.at(-1).castShadow=false;};
function frame(r,{center=[0,0,0],width,height,yaw=0,material='metal',thickness=.16,depth=.22,label='attached glazing frame',transom=true,doors=false}){
 const sub=new Recipe(label),half=width/2,bottom=-height/2,top=height/2;
 for(const x of[-half,half])box(sub,material,x,0,0,thickness,height+thickness,depth,label+' jamb');
 for(const y of[bottom,top])box(sub,material,0,y,0,width+thickness,thickness,depth,label+' head/sill');
 if(transom)box(sub,material,0,height*.16,.025,width,.075,depth*.7,label+' thin transom');
 if(doors){box(sub,'metalDark',0,0,.025,.075,height,depth*.65,label+' double-door meeting stile');for(const x of[-.24,.24])box(sub,'bronze',x,-height*.03,depth*.65,.05,height*.26,.055,label+' pull handle');}
 r.merge(sub,center,yaw);
}
function edgeFrame(r,e,u,bottom,width,height,options={}){const t=u/e.length;frame(r,{center:[e.a[0]+(e.b[0]-e.a[0])*t+e.nx*.15,bottom+height/2,e.a[1]+(e.b[1]-e.a[1])*t+e.nz*.15],width,height,yaw:e.rotation,...options});}
function rectangularRib(r,a,b,radius,label){beam(r,'silverFacade',a,b,radius,label);const p=r.parts.at(-1);p.geometry=BOX;p.scale[0]*=2;p.scale[2]*=2;p.castShadow=false;}
export function majorFacadesRecipe(data,{quality='standard',groundAt=()=>-.02}={}){
 const fine=quality!=='low',out=new Recipe('CBD eight principal facade detail groups',{quality,authored:true,noNewRealSignage:true,noHeightChange:true,noFootprintChange:true,placements:[],sourceIds:[],accuracy:'Architectural source establishes building and feature type. Exact secondary door/window subdivisions are authored approximations, not surveyed installations.'});
 const emit=(id,r,position,yaw,reference,accuracy)=>{for(const part of r.parts)part.castShadow=false;const first=out.parts.length;out.merge(r,position,yaw);const count=out.parts.length-first;if(!count)throw Error('Empty principal facade group '+id);out.metadata.sourceIds.push(id);out.metadata.placements.push({sourceId:id,reference,accuracy,worldAnchor:position,rotation:yaw,partRange:[first,out.parts.length],parts:count,labels:[...new Set(r.parts.map(p=>p.label))]});};
 for(const id of['china_world_3','china_world_3b']){
  const f=data.landmarks.find(f=>f.id===id),site=MASSING_LAYOUT[id],edges=footprintEdges(site.polygons[0][0]),east=id==='china_world_3',e=edges.filter(e=>e.length>12).sort((a,b)=>(east?b.nx-a.nx:a.nx-b.nx)||b.length-a.length)[0],r=new Recipe(id+' second entrance layer'),w=Math.min(10,e.length*.45);
  edgeFrame(r,e,e.length/2,.12,w,6.4,{material:'silverFacade',thickness:.28,depth:.40,doors:true,label:east?'A eastern hotel-entry frame':'B low hotel-entry frame'});
  for(const side of[-1,1])edgeFrame(r,e,e.length/2+side*(w*.75),.12,w*.40,10.0,{thickness:.12,depth:.22,label:'adjacent recessed lobby glazing'});
  if(fine)for(let j=0;j<5;j++)edgePanel(r,e,'metalDark',e.length/2,7.0+j*.14,w+.4,.055,.12,'entrance head narrow shadow reveal',.19);
  const p=project(f.geometry.coordinates);emit('osm-'+f.properties.osmRef.replace('/','-'),r,[p[0],f.properties.baseElevation||1,p[1]],f.properties.rotation||0,'https://www.som.com/projects/china-world-trade-center-'+(east?'3a/':'3b/'),east?'East hotel entry orientation confirmed by SOM; exact dimensions authored.':'Lower hotel program confirmed; west-facing local door treatment is an illustrative subdivision of the actual mapped base.');
 }
 {
  const f=data.landmarks.find(f=>f.id==='china_zun'),r=new Recipe('Zun sheltered entry and skirt liner ribs');
  for(const side of[-1,1])for(const z of[-12,12])frame(r,{center:[side*29.1,3.45,z],width:6.4,height:5.5,yaw:side*Math.PI/2,material:'silverFacade',thickness:.28,depth:.48,doors:true,label:'Zun rectangular sheltered lobby portal'});
  for(const side of[-1,1])for(let x=-22;x<=22;x+=fine?4.4:8.8){const corner=Math.min(1,(Math.abs(x)/(78*.32))**2),y=12*(1-corner);rectangularRib(r,[x,y+.1,side*39],[x*.965,y+.54,side*39*.965],.075,'Zun radial aluminium skirt lining rib');}
  const p=project(f.geometry.coordinates);emit('osm-way-599547918',r,[p[0],f.properties.baseElevation||1,p[1]],f.properties.rotation||0,'https://www.kpf.com/project/citic-tower-china-zun','Rectangular entry portals and canopy aluminium ribs photo-confirmed; number/size approximate, existing flared shell unchanged.');
 }
 {
  const f=data.landmarks.find(f=>f.id==='cctv'),r=new Recipe('CCTV production glazing subdivisions');
  // The original podium rises to y6; never invent an inaccessible door below that solid base.
  for(const x of[-52,-39,-26,-13])frame(r,{center:[x,13,67.16],width:11,height:10,material:'cctvSteel',thickness:.16,depth:.28,label:'CCTV south production glazed wall frame'});
  if(fine)for(const x of[-53,-44,-35,-26,-17])box(r,'metalDark',x,7.29,68,.13,.08,12.7,'CCTV existing canopy underside seam');
  const p=project(f.geometry.coordinates);emit('osm-relation-7820447',r,[p[0],f.properties.baseElevation||1,p[1]],f.properties.rotation||0,'https://www.oma.com/projects/cctv-headquarters','Secondary production-base glazing divisions are typological; no new entry, logo or H helipad is asserted.');
 }
 for(const family of['cwtc_mall_north','kerry_mall_hotel','hanwei_plaza','tvcc_context']){
  const site=CBD_CONTEXT_SITES[family],r=new Recipe(family+' attached secondary details'),p=project(site.anchorWGS84);let reference='',accuracy='';
  if(family==='cwtc_mall_north'){
   const host=buildingRecipe(family,{detail:1});for(const q of host.parts.filter(p=>p.label==='upper inset retail window'))frame(r,{center:[q.position[0]+Math.sin(q.rotation[1])*.14,q.position[1],q.position[2]+Math.cos(q.rotation[1])*.14],width:q.scale[0],height:q.scale[1],yaw:q.rotation[1],material:'stoneLight',thickness:.18,depth:.25,transom:false,label:'mall upper existing-window stone reveal'});
   reference='https://commons.wikimedia.org/wiki/File:Intersection_of_Guanghua_Road_and_Jintong_East_Road_20260719151718.jpg';accuracy='Matched source windows retained; thin attached stone reveal, not additional doors or advertisements.';
  }else if(family==='kerry_mall_hotel'){
   const w=site.width,td=site.depth*.70,cz=site.hotelPoiLocal[1];
   for(let z=cz-td*.25;z<=cz+td*.25+.01;z+=fine?2.8:5.6)box(r,'metalDark',-w/2-2,4.87,z,7.7,.12,.12,'Kerry existing western canopy soffit rib');
   for(const z of[cz-td*.25,cz+td*.25])box(r,'metal',-w/2-5.4,.10,z,.68,.20,.68,'Kerry canopy post attached base collar');
   const e=footprintEdges(site.points.map(([x,z])=>[x*.967,z*.967])).sort((a,b)=>a.nx-b.nx)[0];const dz=e.b[1]-e.a[1],u=((cz-e.a[1])/dz)*e.length;edgeFrame(r,e,u,.26,7.2,4.6,{material:'bronze',thickness:.18,depth:.26,doors:true,label:'Kerry west entry bronze door divider'});
   reference='https://www.kerryprops.com/en/property-details/68/beijing-kerry-centre';accuracy='Existing west canopy and hotel location retained; soffit, joints and door divisions are authored detail, not new signage.';
  }else if(family==='hanwei_plaza'){
   const z=site.depth*.40+.35,g=groundAt(p[0],p[1]+z)-.8;frame(r,{center:[0,g+2.36,z],width:9.2,height:4.4,material:'stoneLight',thickness:.32,depth:.38,doors:true,label:'Hanwei central stone lobby door surround'});for(const x of[-3,0,3])frame(r,{center:[x,g+2.0875,z+.13],width:2.8,height:4.1,material:'bronze',thickness:.075,depth:.10,doors:fine,label:'Hanwei bronze inner double-door divider'});
   if(fine)for(let x=-10;x<=10;x+=2.5)box(r,'metalDark',x,5.45,site.depth*.44+2.3,.08,.10,8.0,'Hanwei canopy underside narrow joint');
   reference='https://www.bjhwds.cn/';accuracy='Existing south central entrance retained; stone/bronze framing visually informed but dimensions approximate. No unverified roof lettering.';
  }else{
   frame(r,{center:[83.15,4.8,12],width:10.2,height:7.0,yaw:Math.PI/2,material:'silverFacade',thickness:.22,depth:.34,doors:true,label:'TVCC east hotel entry silver framing'});
   for(const z of[7,12,17])frame(r,{center:[83.23,3.4,z],width:4.6,height:4.2,yaw:Math.PI/2,material:'metalDark',thickness:.09,depth:.12,doors:fine,label:'TVCC east entry door division'});
   for(const x of[-55,-40,-25]){const z=29.053+(x+85.612)*7.926/173.563-1.4;frame(r,{center:[x,8,z+.13],width:11.8,height:10.5,yaw:-Math.atan(7.926/173.563),material:'silverFacade',thickness:.11,depth:.20,label:'TVCC west theatre lower glazing division'});}
   reference='https://www.oma.com/projects/cctv-television-cultural-centre';accuracy='East hotel/west theatre source arrangement unchanged; door/glazing subdivisions approximate.';
  }
  emit(site.osmId,r,[p[0],.8,p[1]],0,reference,accuracy);
 }
 out.metadata.buildingCount=new Set(out.metadata.sourceIds).size;out.metadata.noNewRealSignage=true;out.metadata.geometryBudget={maxTriangles:24000,maxMaterialBatches:8};return out;
}
export function buildMajorCbdFacades(kit,data,options={}){const g=kit.buildMergedRecipe(majorFacadesRecipe(data,options),{castShadow:false});if(g.userData.architectureStats.triangles>24000||g.userData.architectureStats.drawCalls>8)throw Error('Principal facade geometry budget exceeded');return g;}
