import {Recipe,latheGeometry} from './geometry.js';
import {polygonPrism,mappedBody,footprintEdges,edgePanel} from './site-massing.js';
import {EXHIBITION_OUTLINE} from './exhibition-layout.js';
import {stairs,star} from './landmark-utils.js';

function archProfile(radius,inner,segments=12) {
 const p=[];
 for(let i=0;i<=segments;i++){const a=i*Math.PI/segments;p.push([radius*Math.cos(a),-radius*Math.sin(a)]);}
 for(let i=segments;i>=0;i--){const a=i*Math.PI/segments;p.push([inner*Math.cos(a),-inner*Math.sin(a)]);}
 return p;
}
function archBay(radius=4.2,depth=4,spring=10,far=false) {
 const r=new Recipe('open Soviet classical arched colonnade bay');
 r.add(polygonPrism(archProfile(radius,radius-.65,far?8:12),-depth/2,depth/2),'stoneLight',[0,spring,0],[1,1,1],[Math.PI/2,0,0],'open semicircular colonnade arch');
 for(const x of [-radius+.35,radius-.35]) {
  r.cylinder('stoneLight',x,spring/2+.7,0,.48,spring-1.4,'slender exhibition arcade column',far?8:12);
  r.cylinder('stone',x,1,0,.68,.6,'arcade column base',8);
  r.box('stoneLight',x,spring-.3,0,1.3,.6,depth,'arcade column capital');
 }
 return r;
}
function vault(r,x,z,width,length,base,rise,far,label) {
 const p=[],n=far?8:16;
 for(let i=0;i<=n;i++){const a=i*Math.PI/n;p.push([width/2*Math.cos(a),-rise*Math.sin(a)]);}
 r.add(polygonPrism(p,-length/2,length/2),'roofGreen',[x,base,z],[1,1,1],[Math.PI/2,0,0],label);
}

export function beijingExhibitionRefined(o) {
 const far=o.lod==='silhouette',r=new Recipe('北京展览馆 · Beijing Exhibition Center');
 // Whole complex ground outline is an elongated north-south U, not a wide east-west slab.
 mappedBody(r,EXHIBITION_OUTLINE,.2,13.2,'stone','actual mapped U-shaped exhibition complex');
 const centerZ=48,frontZ=72;
 for(const side of [-1,1]) {
  vault(r,side*52,-1,94,98,13.2,8.4,far,'long green barrel-vaulted industrial exhibition hall');
  r.box('stoneLight',side*91,14.0,92,26,1.6,86,'south wing classical entablature');
  vault(r,side*91,93,25,80,14.8,3.3,far,'low green south-wing barrel roof');
  const n=9;
  for(let i=0;i<n;i++) {
   const a=(i+.5)*Math.PI/2/n,x=side*(25+54*Math.sin(a)),z=64+52*(1-Math.cos(a));
   r.merge(archBay(4.2,4,10,far),[x,0,z],-side*a);
  }
  // Small domed junction towers sit at the meeting of arcade and side gallery.
  const x=side*81,z=115;
  r.cylinder('stoneLight',x,9,z,7.0,18,'side arcade junction rotunda',far?16:24);
  r.cylinder('stone',x,18.3,z,7.8,.8,'rotunda cornice',far?16:24);
  r.add(latheGeometry([[7.8,18.6],[7.7,18.8],[4.6,20.7],[2,21.8],[0,22]],far?16:32),'roofGreen',[x,0,z],[1,1,1],[0,0,0],'small green domed arcade junction');
  if(!far)for(let i=0;i<5;i++)r.box('glassDark',x-5+i*2.5,12,z+6.7,1.4,7,.2,'rotunda tall window');
 }
 // The tall spire belongs over the south entrance hall, sixty metres south of centroid.
 r.box('stoneLight',0,16.4,centerZ,49,31.2,48,'rectangular main entrance hall');
 r.box('stone',0,32.6,centerZ,52,1.2,51,'broad entrance-hall cornice');
 for(const x of [-15,0,15]) {
  r.box('vermilionDark',x,9.5,frontZ+.1,11,17,.2,'deep red ceremonial entrance portal');
  const bay=archBay(6.4,1.9,18.0,far);r.merge(bay,[x,0,frontZ+.8]);
 }
 // Square tower, then an open slender lantern. No false giant central rotunda.
 r.box('stone',0,35.0,centerZ,23,3.6,23,'tower setback plinth');
 r.box('stoneLight',0,45.1,centerZ,18.4,17.0,18.4,'tall square decorated spire tower');
 r.box('stone',0,54.0,centerZ,20.8,1.0,20.8,'square tower cornice');
 for(const x of [-9,9])for(const z of [-9,9])r.cylinder('roofGoldLight',x,46,centerZ+z,.34,18,'gilded corner tower pilaster',8);
 r.cylinder('stoneLight',0,58.1,centerZ,6.2,7.4,'narrow upper octagonal lantern',8);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;r.cylinder('stoneLight',Math.cos(a)*5.9,65,centerZ+Math.sin(a)*5.9,.28,7.2,'open top lantern column',8);}
 r.cylinder('roofGold',0,68.8,centerZ,5.6,1.0,'gilded lantern crown',16,.45);
 r.cylinder('roofGoldLight',0,83.9,centerZ,1.55,29.2,'slender long gold spire',12,.045);
 r.cylinder('roofGoldLight',0,97.3,centerZ,.60,1.3,'spire finial neck',12);
 star(r,0,100.1,centerZ,1.9,'roofGoldLight');
 if(!far) {
  // Four small roof-corner pavilions, visible around the foot of the tower.
  for(const x of [-20,20])for(const z of [centerZ-19,centerZ+19]) {
   for(const dx of [-1.6,1.6])for(const dz of [-1.6,1.6])r.cylinder('stoneLight',x+dx,36.4,z+dz,.25,6.0,'corner roof pavilion column',8);
   r.cylinder('roofGold',x,40,z,2.6,1.4,'corner gilded pavilion cap',8,.2);
  }
  for(const e of footprintEdges(EXHIBITION_OUTLINE))if(e.length>22) {
   const n=Math.floor(e.length/6);
   for(let i=0;i<n;i++)edgePanel(r,e,'glassDark',e.length*(i+.5)/n,7.3,3.4,8.1,.15,'individual tall exhibition-hall window');
  }
  for(const x of [-6,0,6])r.box('roofGoldLight',x,28.1,frontZ+.2,3.2,.8,.12,'abstract exhibition inscription plaque');
 }
 // Northern theatre roof is a separate low, broad volume in the real outline.
 r.cylinder('stone',1,9,-101,31,18,'northern theatre rounded auditorium',far?20:36);
 r.add(latheGeometry([[31,18.1],[24,20.8],[12,23.3],[0,24]],far?20:40),'roofGreyLight',[1,0,-101],[1,1,1.10],[0,0,0],'northern theatre shallow roof');
 stairs(r,53,frontZ+2,1.8,12,6);
 r.metadata.reference='https://s.visitbeijing.com.cn/gallery/21030';
 r.metadata.heightAccuracy='102m includes the long spire and star; approximate, primary-source measured height unresolved';
 r.metadata.footprintAccuracy='Actual OSM whole-complex U outline; hall roofs, arcade curvature, tower local position and heights are photo-informed approximations';
 return r;
}
