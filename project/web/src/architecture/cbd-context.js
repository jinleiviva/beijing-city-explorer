import {Recipe,BOX} from './geometry.js';
import {CBD_CONTEXT_SITES} from './cbd-context-sites.js';
import {mappedBody,footprintEdges,edgePanel} from './site-massing.js';
export {CBD_CONTEXT_SITES};

function setup(id,o,defaultHeight) {
 const site=CBD_CONTEXT_SITES[id],w=Math.max(4,o.width??site.width),d=Math.max(3,o.depth??site.depth),h=Math.max(defaultHeight*.5,o.height??defaultHeight),far=o.detail===-1||o.lod==='silhouette',detail=far?0:Math.max(0,Math.min(2,o.detail??1));
 const points=site.points.map(([x,z])=>[x*w/site.width,z*d/site.depth]);
 const r=new Recipe(id,{family:id,approx:true,width:w,depth:d,height:h,detail,lod:far?'silhouette':'detailed',fixedGeographicOrientation:true,rotation:0,anchorWGS84:site.anchorWGS84,osmId:site.osmId,source:site.source,footprintAccuracy:site.footprintAccuracy});
 return {r,site,w,d,h,far,detail,points,edges:footprintEdges(points)};
}

function glazedBase(r,points,edges,height,detail,far=false) {
 mappedBody(r,points.map(([x,z])=>[x*.967,z*.967]),.25,height,'glassPale','recessed tall glazed retail ground floor');
 if(!far)for(const edge of edges) {
  const count=Math.max(1,Math.round(edge.length/5.5));
  for(let i=0;i<=count;i++)edgePanel(r,edge,'silverFacade',edge.length*i/count,height/2,.26,height,.30,'retail glass vertical mullion',-.22);
  if(detail>0)for(const y of [height*.38,height*.72])edgePanel(r,edge,'metal',edge.length/2,y,edge.length,.16,.20,'fine retail horizontal mullion',-.24);
 }
}

function stoneWindowFacade(r,points,bottom,top,detail,far=false,bay=4.7) {
 const edges=footprintEdges(points),height=top-bottom;
 for(const edge of edges) {
  if(edge.length<2.2)continue;
  const cols=Math.max(1,Math.round(edge.length/bay)),rows=far?3:Math.max(1,Math.round(height/(detail>0?3.65:7.0))),bw=edge.length/cols,fh=height/rows;
  if(far) {
   for(let j=0;j<rows;j++)edgePanel(r,edge,'glass',edge.length/2,bottom+(j+.5)*fh,edge.length*.82,Math.min(1.8,fh*.40),.13,'coarse stone tower window band');
  }else for(let j=0;j<rows;j++)for(let i=0;i<cols;i++) {
   edgePanel(r,edge,'glass',bw*(i+.5),bottom+fh*(j+.5),bw*.62,fh*(detail>0?.62:.55),.13,'individual blue recessed stone-building window');
   if(detail>0)edgePanel(r,edge,'metal',bw*(i+.5),bottom+fh*(j+.5),.07,fh*.62,.16,'fine stone-building window mullion');
  }
 }
}

function rect(x,z,w,d){return[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]];}
function equipment(r,x,z,w,d,y,far=false) {
 r.box('stone',x,y+1,z,w,2,d,'screened rooftop equipment enclosure');
 if(!far)for(let i=0;i<5;i++)r.box('metalDark',x,y+.3+i*.35,z-d/2-.05,w*.84,.14,.12,'rooftop screen louver',0);
}

export function cwtcMallNorth(o={}) {
 const {r,site,w,d,h,far,detail,points,edges}=setup('cwtc_mall_north',o,27.5),ground=8.0;
 glazedBase(r,points,edges,ground,detail,far);
 mappedBody(r,points,ground,h,'concrete','actual L-shaped pale stone mall upper volume');
 // Photo viewed from the NW: large elevated glazed corner inside a thick stone frame.
 const x=-w/2+.08,z=-d*.295,bw=w*.38,bd=d*.32,boxTop=h-2,boxBottom=ground+1.1;
 r.box('glassPale',x+bw/2, (boxTop+boxBottom)/2,z-.13,bw,boxTop-boxBottom,.26,'northwest upper glazed corner north face');
 r.box('glassPale',x-.13,(boxTop+boxBottom)/2,z+bd/2,.26,boxTop-boxBottom,bd,'northwest upper glazed corner west face');
 for(const y of [boxTop+.7,boxBottom-.7]) {
  r.box('stoneLight',x+bw/2,y,z-.62,bw+1.4,1.4,1.2,'projecting thick north corner frame');
  r.box('stoneLight',x-.62,y,z+bd/2,1.2,1.4,bd+1.4,'projecting thick west corner frame');
 }
 r.box('stoneLight',x+bw+.4,(boxTop+boxBottom)/2,z-.55,1.0,boxTop-boxBottom+1.4,1.15,'glazed corner outer stone jamb');
 r.box('stoneLight',x-.55,(boxTop+boxBottom)/2,z+bd+.4,1.15,boxTop-boxBottom+1.4,1.0,'glazed corner west stone jamb');
 if(!far) {
  for(let i=1;i<6;i++)r.box('silverFacade',x+bw*i/6,(boxTop+boxBottom)/2,z-.31,.13,boxTop-boxBottom,.16,'corner glazing vertical mullion');
  for(let i=1;i<5;i++)r.box('silverFacade',x-.31,(boxTop+boxBottom)/2,z+bd*i/5,.16,boxTop-boxBottom,.13,'corner west glazing vertical mullion');
  // Narrow upper shop windows along the remaining long facades.
  for(const edge of edges)if(edge.length>25) {
   const n=Math.max(2,Math.floor(edge.length/7));
   for(let i=0;i<n;i++) {
    const u=(i+.5)*edge.length/n,px=edge.a[0]+(edge.b[0]-edge.a[0])*u/edge.length,pz=edge.a[1]+(edge.b[1]-edge.a[1])*u/edge.length;
    if(px<x+bw+1&&pz<z+bd+1)continue;
    edgePanel(r,edge,'glassPale',u,h*.62,edge.length/n*.59,h*.24,.2,'upper inset retail window');
   }
   if(detail>0)for(let y=ground+1;y<h;y+=2)edgePanel(r,edge,'stoneDark',edge.length/2,y,edge.length,.055,.05,'fine pale stone cladding joint',.035);
  }
  // Low roof-level planting and screened mechanical box, all within the mapped site.
  for(let i=0;i<6;i++) {
   const xx=-w*.20+i*w*.09;
   r.box('stone',xx,h+.30,d*.28,w*.07,.6,1.35,'roof terrace planter');
   r.box('foliage',xx,h+.85,d*.28,w*.07,1.0,1.2,'roof terrace low planting');
  }
  equipment(r,w*.22,d*.20,w*.22,d*.18,h,false);
 }
 r.metadata={...r.metadata,sourcePhotograph:'https://commons.wikimedia.org/wiki/File:Intersection_of_Guanghua_Road_and_Jintong_East_Road_20260719151718.jpg',heightAccuracy:'27.5m photo-estimated main wall; small roof equipment/planting additional; not surveyed',frontFacing:'northwest'};
 return r;
}

export function hanweiPlaza(o={}) {
 const {r,w,d,h,far,detail,points,edges}=setup('hanwei_plaza',o,100),ph=o.podiumHeight??32;
 glazedBase(r,points,edges,6.2,detail,far);
 mappedBody(r,points,6.2,ph-6,'stoneLight','mapped H-shaped broad stepped podium');
 stoneWindowFacade(r,points,7.0,ph-6,detail,far,5.3);
 // Independently supported west/east tower masses. The H courtyards remain open.
 for(const side of [-1,1]) {
  const cx=side*w*.347,cz=-d*.10,tw=w*(side<0?.25:.235),td=d*.48,top=side<0?h:h*.93;
  const footprint=rect(cx,cz,tw,td);
  mappedBody(r,rect(cx,cz,tw+3,td+3),ph-6,ph,'stoneLight','set-back upper podium tier under tower');
  mappedBody(r,footprint,ph,top-2.2,'stoneLight',side<0?'west stone office tower':'east stone office tower');
  stoneWindowFacade(r,footprint,ph+.7,top-3,detail,far,4.2);
  r.box('stone',cx,top-1.75,cz,tw+1.2,.9,td+1.2,'projecting flat tower crown cornice');
  r.box('stoneLight',cx,top-1.0,cz,tw*.77,2,td*.77,'recessed flat tower equipment crown');
  // Classical open pier row at the stepped podium roof, visible in the photo.
  const z=d*.44,pierN=far?4:6;
  r.box('stoneLight',cx,ph-.4,z,tw+4,.8,6.0,'podium colonnade cornice');
  for(let i=0;i<pierN;i++)r.box('stoneLight',cx-tw*.46+i*tw*.92/(pierN-1),ph-3.5,z,1.1,6.2,1.1,'open classical podium pier');
  if(!far)r.box('metalDark',cx,ph-4,z-1.0,tw,4.2,.15,'dark setback behind podium colonnade');
 }
 r.box('glass',0,3.9,d*.40+.2,w*.18,6.2,.3,'central recessed connecting lobby facade');
 r.box('metal',0,5.8,d*.44+2.3,w*.23,.6,8.4,'central entrance rain canopy');
 if(!far)for(let i=-2;i<=2;i++)r.box('metal',i*w*.033,3.8,d*.40+.4,.15,6.0,.20,'central lobby door mullion');
 r.metadata={...r.metadata,sourcePhotograph:'https://www.bjhwds.cn/',heightAccuracy:'West100m/east93m and podium32m are photographic modelling estimates within85–110m guidance, not measured',frontFacing:'south',towerFootprintAccuracy:'Two tower positions and setbacks inferred from exterior photo within actual H footprint'};
 return r;
}

export function kerryMallHotel(o={}) {
 const {r,site,w,d,h,far,detail,points,edges}=setup('kerry_mall_hotel',o,84),ph=o.podiumHeight??18;
 glazedBase(r,points,edges,6.5,detail,far);
 mappedBody(r,points,6.5,ph,'stoneLight','actual low commercial and sports podium footprint');
 for(const edge of edges) {
  if(edge.length<20)continue;
  edgePanel(r,edge,'bronze',edge.length/2,12.2,edge.length*.87,9.0,.18,'bronze louver retail frontage');
  if(!far)for(let i=1;i<Math.floor(edge.length/4);i++)edgePanel(r,edge,'stoneLight',i*4,12.2,.30,9.2,.25,'vertical stone retail facade blade');
 }
 // Hotel POI fixes the western sub-volume; its precise roof outline is not mapped.
 const [poiX,poiZ]=site.hotelPoiLocal,cx=poiX*w/site.width,cz=poiZ*d/site.depth,tw=w*.205,td=d*.70,rotation=.020;
 const tower=new Recipe('western Kerry hotel slab');
 tower.box('stoneLight',0,(ph+h-2)/2,0,tw,h-ph-2,td,'separate western hotel slab');
 for(const side of [-1,1]) {
  tower.box('glass',side*(tw/2+.10),(ph+h-3)/2,0,.20,h-ph-3,td*.87,'long hotel glazing facade');
  const vertical=far?4:8;
  for(let i=0;i<=vertical;i++)tower.box('stoneLight',side*(tw/2+.28),(ph+h-2)/2,-td*.44+i*td*.88/vertical,.55,h-ph-2,far?1.2:.9,'hotel pale vertical stone strip');
  const floors=far?5:detail>0?19:10;
  for(let i=1;i<floors;i++)tower.box('stoneLight',side*(tw/2+.24),ph+(h-ph-2)*i/floors,0,.50,far?1.1:.65,td*.92,'hotel horizontal spandrel band');
  if(!far)for(let i=0;i<7;i++)for(let j=0;j<(detail>0?19:10);j++)tower.box('glass',-tw*.39+i*tw*.78/6,ph+2+(h-ph-5)*(j+.5)/(detail>0?19:10),side*(td/2+.1),tw*.072,detail>0?1.7:3.1,.15,'hotel narrow-end square window');
 }
 tower.box('stone',0,h-1.15,0,tw+1,1.7,td+1,'hotel flat parapet crown');
 tower.box('stoneLight',0,h-.3,0,tw*.8,.6,td*.78,'hotel recessed mechanical roof');
 r.merge(tower,[cx,0,cz],rotation);
 // Low, long west entrance canopy, below the hotel rather than across whole site.
 r.box('metal',-w/2-2,5.2,cz,8,.55,td*.56,'western hotel entrance porte cochere');
 if(!far)for(const z of [cz-td*.25,cz+td*.25])r.cylinder('metal',-w/2-5.4,2.6,z,.25,5.2,'hotel canopy post',8);
 r.metadata={...r.metadata,sourcePhotograph:'https://item.secoo.com/10945351.shtml',heightSource:'https://www.skyscrapercenter.com/building/kerry-hotel/27220',heightAccuracy:'84m is CTBUH database estimate, not measured; podium18m is photo-informed approximation',hotelPOI:site.hotelPoiLocal,towerFootprintAccuracy:'Approximate west hotel slab around mapped POI; not a surveyed separate roof footprint',frontFacing:'west'};
 return r;
}
