import{Recipe,HIP_ROOF,latheGeometry}from'./geometry.js';
import{mappedBody}from'./site-massing.js';
import{BEIHAI_HALL_SITES}from'./heritage-hall-layout.js';
const GREEN_EAVE={...HIP_ROOF,indices:[...HIP_ROOF.indices.slice(0,24),...HIP_ROOF.indices.slice(96,102)]},YELLOW_TILE={...HIP_ROOF,indices:[...HIP_ROOF.indices.slice(24,96),...HIP_ROOF.indices.slice(102)]};
export function heritageHall(o={}){
 const site=BEIHAI_HALL_SITES[o.siteId]??BEIHAI_HALL_SITES.beihai_puan_hall,far=o.lod==='silhouette',w=site.width,d=site.depth,h=site.height,rise=Math.min(3.8,h*.34),eave=h-rise;
 const r=new Recipe(site.name+' · Mapped Yong’an temple hall',{...site,approx:true,extraContextNotCountedIn45:true,replacesOsmIds:[site.osmId],wallAndRoofScope:'Roof envelope fits mapped individual building;interior divisions illustrative'});
 mappedBody(r,site.points,0,.5,'stoneDark','actual individual temple footprint plinth');
 const q=new Recipe('oriented traditional hall');
 q.box('vermilionDark',0,(eave+.5)/2,0,w*.82,eave-.5,d*.72,'red traditional hall wall body');
 q.box('greenBeam',0,eave-.35,0,w*.91,.7,d*.90,'blue-green painted temple beam course');
 q.add(GREEN_EAVE,'roofGreen',[0,eave,0],[w,rise,d],[0,0,0],'green glazed hip roof edging');
 q.add(YELLOW_TILE,'roofGold',[0,eave,0],[w,rise,d],[0,0,0],'yellow glazed tile roof field');
 q.box('roofGreen',0,eave+rise+.02,0,w*.55,.22,.28,'green temple roof ridge');
 // Deformed four-point motifs follow the actual roof slope, rather than floating decals.
 function roofY(z){const a=Math.abs(z/d),p=[[0,1],[.008,1],[.13,.62],[.29,.27],[.43,.04],[.5,.12]];for(let i=1;i<p.length;i++)if(a<=p[i][0]){const t=(a-p[i-1][0])/(p[i][0]-p[i-1][0]);return eave+rise*(p[i-1][1]*(1-t)+p[i][1]*t)+.035;}return eave+.035;}
 for(const sign of[-1,1])for(const[scale,material,offset]of[[1,'roofGreen',0],[.62,'roofBlue',.02]]){
  const z=sign*d*.26,dx=w*.13*scale,dz=d*.115*scale,pts=[[-dx,z],[0,z-dz],[dx,z],[0,z+dz]],vertices=pts.flatMap(([x,z])=>[x,roofY(z)+offset,z]);
  q.add({type:'mesh',vertices,indices:[0,2,1,0,3,2]},material,[0,0,0],[1,1,1],[0,0,0],'photograph-informed coloured glazed roof diamond');
 }
 for(const sign of[-1,1])for(let i=0;i<=site.bays;i++){
  const x=-w*.43+i*w*.86/site.bays;
  q.box('vermilion',x,eave/2+.25,sign*d*.41,.25,eave-.5,.25,'temple porch post');
 }
 if(!far)for(let i=0;i<site.bays;i++){
  const bw=w*.82/site.bays,x=-w*.41+(i+.5)*bw;
  q.box('paintedWood',x,eave*.49,d*.368,bw*.8,eave*.75,.08,'recessed traditional lattice door');
  for(const dx of[-.25,.25])q.box('roofGoldLight',x+dx*bw,eave*.49,d*.418,.07,eave*.72,.07,'fine historic door vertical line');
  q.box('vermilion',x,eave*.58,d*.425,bw*.75,.12,.08,'traditional red door crossrail');
 }
 if(site.siteId==='beihai_falun_hall')q.add(latheGeometry([[.35,0],[.43,.17],[.2,.4],[.25,.65],[.1,.9],[0,1.3]],far?8:12),'roofGreen',[0,h+.1,0],[1,1,1],[0,0,0],'documented glazed ridge stupa approximation');
 r.merge(q,[0,0,0],site.internalRoofRotation);return r;
}
