import {Recipe,HIP_ROOF} from './geometry.js';
import {mappedBody,footprintEdges,edgePanel} from './site-massing.js';
import {STREET_CORNER_SITES} from './street-corner-sites.js';
export {STREET_CORNER_SITES};

function setup(id,o) {
 const s=STREET_CORNER_SITES[id],w=o.width??s.width,d=o.depth??s.depth,h=o.height??s.height,far=o.lod==='silhouette'||o.detail===-1,detail=far?0:o.detail??1;
 const p=s.points.map(([x,z])=>[x*w/s.width,z*d/s.depth]);
 const r=new Recipe(id,{family:id,approx:true,width:w,depth:d,height:h,detail,lod:far?'silhouette':'detailed',fixedGeographicOrientation:true,anchorWGS84:s.anchorWGS84,osmId:s.osmId,source:s.source,footprintAccuracy:s.footprintAccuracy,heightAccuracy:s.heightAccuracy,signPanels:[]});
 return {r,s,w,d,h,far,detail,p,edges:footprintEdges(p)};
}
function glassEdge(r,e,bottom,top,material='glassPale',cols=0) {
 edgePanel(r,e,material,e.length/2,(bottom+top)/2,e.length-.25,top-bottom,.16,'inset street-corner glazing',.09);
 if(cols)for(let i=0;i<=cols;i++)edgePanel(r,e,'glassMullion',e.length*i/cols,(bottom+top)/2,.13,top-bottom,.22,'fine street-corner glazing mullion',.20);
}
function localSign(r,e,u,y,width,height,text) {
 const t=u/e.length,x=e.a[0]+(e.b[0]-e.a[0])*t+e.nx*.36,z=e.a[1]+(e.b[1]-e.a[1])*t+e.nz*.36;
 r.metadata.signPanels.push({text,position:[x,y,z],rotation:e.rotation,width,height,accuracy:'Photo-informed location; lettering to be supplied by application'});
}
function shopBays(r,e,bottom,height,bayWidth,far,material='stoneLight') {
 const n=Math.max(1,Math.round(e.length/bayWidth)),bw=e.length/n;
 glassEdge(r,e,bottom,bottom+height,'shopGlass',far?0:n*2);
 for(let i=0;i<=n;i++)edgePanel(r,e,material,e.length*i/n,bottom+height/2,.50,height,.55,'street shop dividing pier');
 for(let i=0;i<n;i++)edgePanel(r,e,'metalDark',bw*(i+.5),bottom+height+.65,bw-.7,.95,.20,'restrained blank retailer fascia');
}
const DISPLAY_DISC={type:'mesh',vertices:[0,0,0,...Array.from({length:12},(_,i)=>[Math.cos(i/6*Math.PI),Math.sin(i/6*Math.PI),0]).flat()],indices:Array.from({length:12},(_,i)=>[0,i+1,(i+1)%12+1]).flat()};
/** Original abstract displays, not copied advertisements or claims about current tenants. */
function originalDisplay(r,e,u,y,w,h,variant=0,offset=.45){
 const q=new Recipe('Original non-verbatim commercial display');
 const palettes=[['stoneLight','glassBlue','awning'],['apmStone','vermilionDark','stoneLight'],['glassDark','glassPale','roofGoldLight'],['stuccoPale','greenBeam','bronze']],c=palettes[variant%4];
 q.box(c[0],0,0,0,w,h,.06,'original unbranded display background');
 q.box(c[1],-w*.18,-h*.08,.05,w*.35,h*.64,.035,'original display geometric colour field');
 q.add(DISPLAY_DISC,c[2],[w*.19,h*.19,.08],[Math.min(w,h)*.20,Math.min(w,h)*.20,1],[0,0,0],'original display circular graphic');
 q.box(c[2],w*.16,-h*.25,.075,w*.36,h*.16,.025,'original display lower colour block');
 for(const part of q.parts)part.castShadow=false;
 const t=u/e.length;r.merge(q,[e.a[0]+(e.b[0]-e.a[0])*t+e.nx*offset,y,e.a[1]+(e.b[1]-e.a[1])*t+e.nz*offset],e.rotation);
}
function apmRetailFrontage(r,e,far,detail){
 const n=Math.max(1,Math.round(e.length/8.2)),bw=e.length/n;
 if(far){const portals=Math.max(1,Math.round(e.length/38));for(let i=0;i<portals;i++)edgePanel(r,e,'shopGlass',e.length*(i+.5)/portals,2.7,Math.min(5,bw*.85),4.8,.18,'silhouette distinct mall entrance',.25);return;}
 for(let i=0;i<n;i++){
  const u=bw*(i+.5),entry=i%7===3||(n<5&&i===Math.floor(n/2)),ww=bw-.65;
  edgePanel(r,e,'metalDark',u,3.16,ww,5.72,.12,'dark recessed independent shop display bay',.22);
  for(const sign of[-1,1])edgePanel(r,e,'stoneLight',u+sign*(bw/2-.16),3.4,.32,6.5,.48,'individual retail bay stone jamb',.31);
  edgePanel(r,e,i%3===0?'apmStone':'metalDark',u,6.42,bw-.40,.69,.20,'independent blank retailer doorhead fascia',.31);
  edgePanel(r,e,'metal',u,5.93,ww,.13,.20,'shopfront horizontal transom',.40);
  if(entry){
   const doorW=Math.min(3.8,ww*.71);
   edgePanel(r,e,'stoneDark',u,.17,doorW+.65,.25,.8,'visible mall entrance threshold',.42);
   for(const sign of[-1,1]){
    edgePanel(r,e,'glassPale',u+sign*doorW/4,2.03,doorW/2-.08,3.78,.07,'separate glass entrance door leaf',.39);
    edgePanel(r,e,'metalDark',u+sign*doorW/2,2.15,.13,4.08,.23,'deep entrance vertical frame',.50);
    if(detail>0)edgePanel(r,e,'silverFacade',u+sign*.18,1.8,.045,.85,.13,'mall entrance small pull handle',.54);
   }
   edgePanel(r,e,'metalDark',u,4.16,doorW+.18,.18,.25,'deep entrance overhead frame',.50);
   edgePanel(r,e,'silverFacade',u,2.05,.10,3.86,.16,'glass-door central meeting stile',.48);
  }else{
   edgePanel(r,e,i%3?'windowWarm':'glassPale',u,3.03,ww-.20,4.98,.08,'lit shop display back wall',.30);
   edgePanel(r,e,'stoneLight',u,.69,ww*.78,.28,.38,'shop merchandise display plinth',.38);
   if(detail>0)originalDisplay(r,e,u,3.15,Math.min(ww*.60,3.2),3.65,i,.39);
   edgePanel(r,e,'glassEnvelope',u,3.22,ww-.15,5.28,.025,'clear shop display outer pane',.52);r.parts.at(-1).castShadow=false;
   edgePanel(r,e,'metalDark',u,3.2,.08,5.4,.14,'fine clear display centre mullion',.57);
  }
 }
 r.metadata.retailBayCount=(r.metadata.retailBayCount??0)+n;
 r.metadata.displayArtwork='Original abstract geometry and colours, no copied advertising art or invented current tenant names';
 r.metadata.shopBayAccuracy='Facade rhythm inferred from viewed2025 street and2026 owner photos, not a measured shop-tenancy plan';
}

function steppedRoof(r,x,z,w,d,y,far) {
 r.box('stoneLight',x,y-.4,z,w+1.1,.8,d+1.1,'office traditional-roof deep entablature');
 r.add(HIP_ROOF,'roofGreen',[x,y,z],[w+2.5,3.2,d+2.5],[0,0,0],'APM broad grey-green lower hipped roof');
 r.box('apmStone',x,y+2.4,z,w*.64,1.4,d*.60,'upper traditional-roof clerestory');
 r.add(HIP_ROOF,'roofGreen',[x,y+2.9,z],[w*.80,3.4,d*.78],[0,0,0],'APM raised grey-green hipped roof');
 if(!far)r.box('roofGreyRidge',x,y+6.15,z,w*.42,.2,.36,'traditional commercial roof ridge');
}

export function wangfujingApm(o={}) {
 const {r,w,d,h,far,detail,p,edges}=setup('wangfujing_apm',o),podium=h*.59;
 mappedBody(r,p,.15,podium,'apmStone','mapped six-level mall base including rounded northwest corner');
 const west=edges.filter(e=>e.nx<-.45&&e.length>5),north=edges.filter(e=>e.nz<-.6&&e.length>20);
 for(const e of [...west,...north]) {
  glassEdge(r,e,.4,7.1,'glassPale',0);
  apmRetailFrontage(r,e,far,detail);
  glassEdge(r,e,8.8,podium-2.0,'glass',far?0:Math.max(2,Math.round(e.length/8.0)));
  if(!far)for(const y of[12.6,17.8,23.0])if(y<podium-1.5)edgePanel(r,e,'apmStone',e.length/2,y,e.length,.62,.44,'retail upper floor separation band',.30);
  // Long shop-front canopy follows the actual slanted street edge, rather than global Z.
  edgePanel(r,e,'metal',e.length/2,7.35,e.length,.38,3.6,'projecting continuous metal entrance canopy',1.45);
  edgePanel(r,e,'stoneLight',e.length/2,8.2,e.length,1.2,.50,'continuous retail stone fascia');
  edgePanel(r,e,'stoneLight',e.length/2,podium-1.1,e.length,1.0,.55,'upper mall cornice');
  if(!far) {
   const n=Math.max(1,Math.round(e.length/9));
   for(let i=0;i<=n;i++)edgePanel(r,e,'apmStone',e.length*i/n,(podium+8)/2,.70,podium-8,.55,'pale stone retail vertical pilaster');
   for(let i=0;i<=Math.floor(e.length/3.5);i++)edgePanel(r,e,'metalDark',e.length*i/Math.max(1,Math.floor(e.length/3.5)),7.28,.16,.30,3.8,'fine projecting canopy rib',1.5);
  }
 }
 // Official owner confirms three office blocks above the shopping mall. Setbacks and
 // roof dimensions below are visual approximations, not an as-built roof survey.
 for(const [x,z,tw,td] of [[w*.25,-d*.365,w*.40,d*.18],[-w*.19,-d*.11,w*.40,d*.17],[-w*.16,d*.30,w*.40,d*.17]]) {
  const top=h-6.3;
  r.box('apmStone',x,(podium+top)/2,z,tw,top-podium,td,'independent office upper block above mall');
  for(const side of [-1,1]) {
   r.box('glass',x+side*(tw/2+.10),(podium+top)/2,z,.18,top-podium-1.4,td*.87,'office green-blue long window band');
   r.box('glass',x,(podium+top)/2,z+side*(td/2+.10),tw*.86,top-podium-1.4,.18,'office green-blue end window band');
   const rows=far?2:4;
   for(let j=1;j<=rows;j++) {
    const y=podium+(top-podium)*j/(rows+1);
    r.box('apmStone',x+side*(tw/2+.3),y,z,.55,.9,td,'office pink stone floor band');
    r.box('apmStone',x,y,z+side*(td/2+.3),tw,.9,.55,'office pink stone floor band');
   }
   if(!far)for(let j=0;j<9;j++)r.box('apmStone',x+side*(tw/2+.32),(podium+top)/2,z-td*.44+j*td*.88/8,.65,top-podium,1.0,'office facade stone pier');
  }
  steppedRoof(r,x,z,tw,td,top,far);
 }
 // Lower roof over the prominent northwest commercial corner, separate from offices.
 r.add(HIP_ROOF,'roofGreen',[-w*.23,podium,-d*.405],[w*.57,5.6,d*.16],[0,-Math.PI/8,0],'lower northwest commercial pavilion roof');
 for(const e of west)if(e.length>150) {
  const n=far?3:8;
  for(let i=0;i<n;i++){const u=e.length*(i+.5)/n,pw=Math.min(12,e.length/n*.75);edgePanel(r,e,'metalDark',u,18,pw+.40,8.6,.22,'framed changeable campaign display panel',.35);if(!far)originalDisplay(r,e,u,18,pw,8.2,i,.49);}
 }
 for(const e of edges.filter(e=>e.nx<-.3&&e.nz<-.2))if(e.length>7){edgePanel(r,e,'marble',e.length/2,17,e.length*.88,14,.24,'northwest large digital display neutral panel',.35);localSign(r,e,e.length/2,17,e.length*.75,3.8,'北京 apm');}
 r.metadata.frontFacing='west and northwest';r.metadata.reference='https://www.shkp.com/zh-CN/our-business/mainland-and-other-properties/beijing-apm';
 return r;
}

export function wangfujingWestWall(o={}) {
 const {r,w,d,h,far,detail,p,edges}=setup('wangfujing_west_wall',o);
 mappedBody(r,p,.1,h-1.2,'apmStone','mapped west-side warm stone commercial street wall');
 const face=edges.find(e=>e.nx>.9),north=edges.find(e=>e.nz<-.9);
 shopBays(r,face,.3,5.1,8,far,'stoneLight');
 edgePanel(r,face,'stoneDark',face.length/2,6.9,face.length,1.2,.50,'heavy upper shopfront lintel');
 edgePanel(r,face,'metalDark',face.length/2,16.3,face.length*.82,15.8,.18,'large recessed dark facade display field');
 for(const u of [0,face.length*.09,face.length*.91,face.length])edgePanel(r,face,'apmStone',u,16.1,2.7,20.2,.70,'tall stone street-wall frame');
 edgePanel(r,face,'apmStone',face.length/2,25.7,face.length,1.6,.65,'plain commercial roof cornice');
 if(!far) {
  for(let j=0;j<5;j++)for(const u of [face.length*.055,face.length*.945])edgePanel(r,face,'glass',u,9.4+j*3.2,1.9,2.0,.18,'individual commercial side window');
  for(let i=0;i<17;i++)edgePanel(r,face,'stoneDark',face.length*i/16,16,.05,20,.05,'fine facade cladding seam',.43);
  for(let j=0;j<8;j++)edgePanel(r,face,'stoneDark',face.length/2,7.8+j*2.4,face.length,.06,.05,'fine facade cladding seam',.44);
  if(north)for(let i=0;i<9;i++)for(let j=0;j<5;j++)edgePanel(r,north,'glass',north.length*(i+.5)/9,9+j*3.2,3.1,2.0,.15,'individual commercial side window');
 }
 r.box('stoneDark',0,h-.7,0,w*.85,.7,d*.85,'setback low commercial parapet');
 r.metadata.frontFacing='east';r.metadata.reference='https://commons.wikimedia.org/wiki/File:Wangfujing_Street_from_north_to_south_20251002150439.jpg';r.metadata.identity='Unnamed mapped west-side building; facade inferred only from the photographed street-facing portion';
 return r;
}

export function sanlitunS2(o={}) {
 const {r,w,d,h,far,detail,p,edges}=setup('sanlitun_s2',o),north=edges.find(e=>e.nz<-.9),west=edges.find(e=>e.nx<-.9),cornerWidth=Math.min(18,w*.225),pinkH=h*.68;
 mappedBody(r,p,.15,h-.5,'glassPale','mapped long low-rise S2 retail block');
 for(const e of edges)if(e.length>8) {
  edgePanel(r,e,'metal',e.length/2,5.3,e.length,.50,.32,'low-rise retail floor band');
  edgePanel(r,e,'metal',e.length/2,pinkH,e.length,.60,.32,'low-rise upper floor band');
  edgePanel(r,e,'metal',e.length/2,h-.35,e.length,.70,.4,'thin contemporary flat parapet');
  if(!far)for(let i=0;i<=Math.round(e.length/3.2);i++)edgePanel(r,e,'glassMullion',e.length*i/Math.round(e.length/3.2),h/2,.16,h-.5,.22,'fine upper retail glazing mullion');
 }
 // The pink stone shop is only the northwest end of S2, not the whole building.
 const x=-w/2+cornerWidth/2,z=-d*.065;
 r.box('pinkGranite',x,pinkH/2,z,cornerWidth,pinkH,d*.87,'Acne northwest two-level pink granite corner');
 const ne={...north,a:[-w/2,-d/2],b:[-w/2+cornerWidth,-d/2],length:cornerWidth,nx:0,nz:-1,rotation:Math.PI};
 glassEdge(r,ne,.25,4.4,'shopGlass',far?0:5);
 const we={...west,a:[-w/2,d*.37],b:[-w/2,-d/2],length:d*.87,nx:-1,nz:0,rotation:-Math.PI/2};
 glassEdge(r,we,.25,4.4,'shopGlass',far?0:5);
 // Overhanging upper pink box with a small square display aperture, as in owner photo.
 edgePanel(r,ne,'pinkGranite',cornerWidth*.57,7.6,cornerWidth*.82,5.2,1.25,'projecting monolithic pink stone upper bay',.50);
 edgePanel(r,ne,'windowWarm',cornerWidth*.65,8.1,2.2,2.4,.13,'small square recessed upstairs display aperture',1.18);
 edgePanel(r,ne,'pinkGranite',cornerWidth*.65,6.85,2.55,.20,.35,'deep pink stone display sill',1.30);
 edgePanel(r,we,'pinkGranite',we.length*.55,7.6,we.length*.87,5.2,.70,'west corner pink stone upper bay',.27);
 edgePanel(r,we,'windowWarm',we.length*.66,8.1,2.1,2.4,.16,'west square display aperture',.68);
 // Three metres of glazing and projecting metal bay survive above the pink shop.
 r.box('metal',x,pinkH+.14,-d/2-1.1,cornerWidth*.42,.28,2.3,'projecting metal bay below top glazed level');
 if(!far) {
  for(let i=0;i<6;i++)edgePanel(r,ne,'stoneDark',cornerWidth*i/5,7.3,.035,6.0,.03,'fine pink stone panel joint',1.15);
  edgePanel(r,ne,'stoneDark',cornerWidth/2,6.5,cornerWidth,.035,.03,'fine pink stone panel joint',1.15);
  // Restrained glass-door fittings and shallow floor recess make the ground level readable.
  for(const u of [cornerWidth*.43,cornerWidth*.57])edgePanel(r,ne,'silverFacade',u,2.0,.035,.8,.12,'door pull handle',.29);
 }
 localSign(r,ne,cornerWidth*.53,4.9,9.2,.95,'Acne Studios');
 localSign(r,we,we.length*.54,4.9,8.7,.9,'Acne Studios');
 r.metadata.frontFacing='north and west';r.metadata.reference='https://www.acnestudios.com/uk/en/stores/sanlitun';r.metadata.identity='S2-10 and20 corner shop supported by official store locator; remaining S2 envelope approximate';
 return r;
}
