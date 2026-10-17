/**
 * Authored, unbranded shop signs and original vector window posters.
 * The mapped north/west edges and existing column rhythm come from the host.
 * No shop identity, poster, exact installation, or retail tenancy is surveyed.
 * Every panel is explicitly marked 风貌示意; reference photos are not textures.
 * Baked glyph triangles remain visible in the CPU bridge and both quality modes.
 */
import {Recipe} from '../../architecture/geometry.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {footprintEdges} from '../../architecture/site-massing.js';
import {project} from '../../geo.js';
import {MALL_GLYPHS,MALL_GLYPH_INFO} from './glyph-data.js';

const GROUND=-.02,GLASS_OFFSET=-1.22,PANEL_OFFSET=-.02;
const LABEL='Mall authored signage ';
const TEXT_CACHE=new Map();
const materials=['signDark','greenBeam','vermilion','marble','bronze','mallSignFacePale','roofBlue'];
const rounded=n=>Math.round(n*1e6)/1e6;
const point=(e,u,v)=>[e.a[0]+(e.b[0]-e.a[0])*u/e.length+e.nx*v,e.a[1]+(e.b[1]-e.a[1])*u/e.length+e.nz*v];
const box=(r,material,x,y,z,w,h,d,label)=>{r.box(material,x,y,z,w,h,d,LABEL+label);r.parts.at(-1).castShadow=false;};
function polygon(r,material,points,z,label){
 const area=points.reduce((a,p,i)=>{const q=points[(i+1)%points.length];return a+p[0]*q[1]-p[1]*q[0];},0),p=area>0?points:[...points].reverse(),indices=[];
 // All poster/arrow polygons are convex. Letter holes are triangulated offline.
 for(let i=1;i<p.length-1;i++)indices.push(0,i,i+1);
 r.add({type:'mesh',vertices:p.flatMap(([x,y])=>[x,y,0]),indices},material,[0,0,z],[1,1,1],[0,0,0],LABEL+label);r.parts.at(-1).castShadow=false;
}
function circle(r,material,x,y,radius,z,label){polygon(r,material,Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return[x+Math.cos(a)*radius,y+Math.sin(a)*radius];}),z,label);}
function textGeometry(text){
 if(TEXT_CACHE.has(text))return TEXT_CACHE.get(text);
 const vertices=[],indices=[];let cursor=0,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(const ch of text){const g=MALL_GLYPHS[ch];if(!g)throw new Error('Missing baked mall glyph: '+ch);const start=vertices.length/3;
  for(let i=0;i<g.vertices.length;i+=3){const x=cursor+g.vertices[i],y=g.vertices[i+1];vertices.push(x,y,0);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  for(const i of g.indices)indices.push(start+i);cursor+=g.advance+.065;
 }
 const cx=(minX+maxX)/2,cy=(minY+maxY)/2;for(let i=0;i<vertices.length;i+=3){vertices[i]-=cx;vertices[i+1]-=cy;}
 const spec={type:'mesh',vertices,indices};TEXT_CACHE.set(text,spec);return spec;
}
function text(r,content,x,y,z,size,material='marble',kind='text'){
 r.add(textGeometry(content),material,[x,y,z],[size,size,1],[0,0,0],LABEL+kind+' · '+content);r.parts.at(-1).castShadow=false;
}
function hangSign(r,title,color,bay,fine){
 // Crossbar ends overlap the existing 0.44 m columns. Standoffs connect it to
 // the back of the forward sign tray. The crossbar stays attached to the host
 // columns rather than moving outward with the sign and floating in the air.
 box(r,'signDark',0,5.87,-.09,bay-.12,.095,.12,'column-to-column upper sign support');
 for(const x of[-1.64,1.64])box(r,'signDark',x,5.76,-.05,.085,.22,.18,'attached upper sign standoff');
 box(r,'bronze',0,5.05,0,4.40,1.40,.14,'0.14m thick sign tray');
 box(r,'mallSignFacePale',0,5.05,.082,4.30,1.30,.020,'warm pale low-emission sign face');
 box(r,color,0,4.42,.108,4.24,.055,.016,'restrained shop accent band');
 text(r,title,0,5.19,.112,.84,'signDark','shop title');
 text(r,'风貌示意',0,4.60,.112,.18,'signDark','explicit authored disclaimer');
 if(fine){for(const x of[-2.08,2.08])box(r,'bronze',x,5.05,.107,.014,1.14,.015,'fine tray edge');}
}
function poster(r,theme,fine){
 const book=theme==='book',title=book?'一页一城':'城市影像';
 // The two fixed display feet stand on the host gallery floor, inside the
 // column-bay width, with the case ahead of the column front and the glass
 // sheet 1.13 m behind its back. Feet project only 0.14 m past the facade line.
 for(const x of[-.72,.72]){box(r,'bronze',x,.005,0,.28,.05,.32,'grounded poster foot');box(r,'signDark',x,.415,0,.10,.77,.12,'poster support leg');}
 box(r,'bronze',0,2.40,0,2.28,3.30,.14,'thick poster display case');
 box(r,'mallSignFacePale',0,2.40,.082,2.16,3.18,.018,'warm pale original poster field');
 text(r,title,0,3.60,.114,.43,'signDark','poster headline');
 if(fine)text(r,book?'慢读时光':'光影之间',0,3.15,.114,.205,'signDark','poster subheading');
 if(book){
  polygon(r,'vermilion',[[-.89,1.46],[-.08,1.24],[-.08,2.57],[-.89,2.80]],.110,'original book left cover');
  polygon(r,'greenBeam',[[.08,1.24],[.89,1.46],[.89,2.80],[.08,2.57]],.110,'original book right cover');
  polygon(r,'bronze',[[-.72,1.63],[-.14,1.46],[-.14,2.47],[-.72,2.64]],.118,'original book left page');
  polygon(r,'marble',[[.14,1.46],[.72,1.63],[.72,2.64],[.14,2.47]],.118,'original book right page');
  // Deliberate open-book profile, not a sampled or copied cover illustration.
  if(fine)for(let i=0;i<4;i++){const y=1.82+i*.14;polygon(r,'signDark',[[.22,y],[.61,y+.115],[.61,y+.135],[.22,y+.020]],.126,'original book page rule');}
 }else{
  circle(r,'vermilion',.59,2.77,.245,.110,'original skyline sun');
  polygon(r,'greenBeam',[[-.90,1.38],[-.46,1.38],[-.46,2.76],[-.80,2.88]],.110,'original skyline tower one');
  polygon(r,'signDark',[[-.34,1.38],[.17,1.38],[.10,2.56],[-.25,2.69]],.110,'original skyline tower two');
  polygon(r,'bronze',[[.29,1.38],[.90,1.38],[.90,2.17],[.70,2.35],[.44,2.35],[.29,2.17]],.110,'original skyline low gallery');
  if(fine)for(let i=0;i<6;i++){const y=1.57+i*.15;box(r,'marble',-.66,y,.122,.24,.022,.012,'original skyline window band');box(r,'bronze',-.09,y,.122,.18,.022,.012,'original skyline second band');}
  box(r,'vermilion',0,1.30,.118,1.80,.055,.015,'original skyline street baseline');
 }
 text(r,'风貌示意',0,.98,.128,.17,'signDark','explicit authored poster disclaimer');
 if(fine)for(const x of[-1.04,1.04])box(r,'bronze',x,2.40,.108,.012,3.02,.012,'fine poster inner edge');
}
function entrance(r){
 // Existing column front is offset -0.02. The mount overlaps it and the plaque
 // rear. The guide is beside the door and never occupies an opening or a head.
 box(r,'signDark',0,2.60,-.055,.27,.47,.16,'entry guide column mounting pad');
 box(r,'bronze',0,2.60,.035,1.55,.78,.12,'0.12m thick entrance plaque');
 box(r,'greenBeam',0,2.60,.104,1.47,.70,.018,'entrance plaque inset');
 text(r,'入口',-.22,2.70,.136,.42,'marble','entrance direction');
 text(r,'风貌示意',-.08,2.34,.136,.115,'marble','explicit authored wayfinding disclaimer');
 // Local +X follows decreasing edge-u, toward both existing inferred doors.
 polygon(r,'marble',[[.32,2.65],[.51,2.65],[.51,2.79],[.32,2.79]],.136,'right arrow shaft toward existing entrance');
 polygon(r,'marble',[[.50,2.56],[.70,2.72],[.50,2.88]],.136,'right arrow head toward existing entrance');
}
function categoryFlag(r,title,color,icon,fine){
 // Two pads overlap the existing column front at -0.02. Short brackets meet
 // the 0.12 m case back at +0.11; the hanging body never enters walking space.
 for(const y of[4.62,6.48]){
  box(r,'signDark',0,y,-.04,.28,.30,.12,'category flag column contact pad');
  box(r,'bronze',0,y,.06,.16,.14,.16,'category flag connected short bracket');
 }
 box(r,'bronze',0,5.55,.17,.90,2.70,.12,'category flag thick backed case');
 box(r,color,0,5.55,.242,.82,2.62,.018,'category flag solid color field');
 text(r,title[0],0,5.58,.272,.46,'marble','category title');
 text(r,title[1],0,4.96,.272,.46,'marble','category title');
 text(r,'风貌示意',0,4.43,.272,.125,'marble','category illustrative disclaimer');
 if(icon==='cup'){
  polygon(r,'marble',[[-.25,6.45],[.17,6.45],[.13,6.20],[-.19,6.20]],.270,'original cup silhouette');
  box(r,'marble',-.03,6.49,.270,.49,.035,.012,'original cup rim');
  box(r,'marble',-.03,6.15,.270,.57,.035,.012,'original cup saucer');
  for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/8,b=a+Math.PI/8;polygon(r,'marble',[[.18+Math.cos(a)*.145,6.34+Math.sin(a)*.145],[.18+Math.cos(b)*.145,6.34+Math.sin(b)*.145],[.18+Math.cos(b)*.085,6.34+Math.sin(b)*.085],[.18+Math.cos(a)*.085,6.34+Math.sin(a)*.085]],.270,'original cup handle segment');}
  if(fine)for(const x of[-.10,.05])box(r,'marble',x,6.63,.270,.024,.12,.012,'original cup steam stroke');
 }else if(icon==='book'){
  polygon(r,'marble',[[-.30,6.18],[-.025,6.12],[-.025,6.55],[-.30,6.61]],.270,'original category open book left');
  polygon(r,'marble',[[.025,6.12],[.30,6.18],[.30,6.61],[.025,6.55]],.270,'original category open book right');
  if(fine)box(r,'bronze',0,6.34,.278,.015,.43,.01,'original category book binding');
 }else{
  polygon(r,'marble',[[-.31,6.20],[.31,6.20],[.31,6.51],[.25,6.57],[-.25,6.57],[-.31,6.51]],.270,'original category camera silhouette');
  box(r,'marble',-.10,6.61,.270,.23,.07,.012,'original camera top');
  circle(r,color,0,6.385,.155,.279,'original camera lens field');
  circle(r,'marble',0,6.385,.083,.286,'original camera inner lens');
 }
}
function placementRecord({site,anchor,e,edgeIndex,id,type,u,y,w,h,offset,depth,title,bayIndex=null,support,textLineSpecs=null}){
 const p=point(e,u,offset),doorU=e.length*(e.nz<-.98?.39:.52),doorHalf=1.575,columnBay=e.length/Math.max(2,Math.round(e.length/5.5));
 const textLines=textLineSpecs??(type==='column_supported_sign'?[{text:title,x:0,y:5.19,offset:PANEL_OFFSET+.112,fontSize:.84},{text:'风貌示意',x:0,y:4.60,offset:PANEL_OFFSET+.112,fontSize:.18}]:type==='grounded_window_display'?[{text:title.split(' · ')[0],x:0,y:3.60,offset:PANEL_OFFSET+.114,fontSize:.43},{text:title.split(' · ')[1],x:0,y:3.15,offset:PANEL_OFFSET+.114,fontSize:.205,standardOnly:true},{text:'风貌示意',x:0,y:.98,offset:PANEL_OFFSET+.128,fontSize:.17}]:[{text:'入口',x:-.22,y:2.70,offset:.136,fontSize:.42},{text:'风貌示意',x:-.08,y:2.34,offset:.136,fontSize:.115}]);
 for(const line of textLines){const t=point(e,u-line.x,line.offset);line.worldFrontCenter=[anchor[0]+t[0],line.y,anchor[1]+t[1]];line.frontNormal=[e.nx,0,e.nz];const vertices=textGeometry(line.text).vertices,xs=vertices.filter((_,i)=>i%3===0),ys=vertices.filter((_,i)=>i%3===1);line.glyphBoundsSize=[(Math.max(...xs)-Math.min(...xs))*line.fontSize,(Math.max(...ys)-Math.min(...ys))*line.fontSize];}
 return {id,type,text:title,textLines,frontNormal:[e.nx,0,e.nz],textFrontCenter:textLines[0].worldFrontCenter,disclaimer:'风貌示意',authored:true,edgeIndex,edgeStartLocal:e.a,edgeEndLocal:e.b,edgeLength:e.length,edgeNormal:[e.nx,0,e.nz],edgeRotationY:e.rotation,edgeU:u,bayIndex,localCenter:[...p.slice(0,1),y,p[1]],worldCenter:[anchor[0]+p[0],y,anchor[1]+p[1]],size:[w,h,depth],normalOffset:offset,glassPlaneOffset:GLASS_OFFSET,glassFrontGap:offset-depth/2-GLASS_OFFSET,doorCenterU:doorU,doorWidth:doorHalf*2,horizontalDoorClearance:Math.abs(u-doorU)-w/2-doorHalf,columnBay,support,sourceFootprint:site.osmId,accuracy:'Original illustrative sign/poster and placement, not surveyed retail or tenant information.'};
}
export function mallSignageRecipe({quality='std'}={}){
 const site=CBD_CONTEXT_SITES.cwtc_mall_north,anchor=project(site.anchorWGS84),edges=footprintEdges(site.points),northIndex=edges.findIndex(e=>e.nz<-.98&&e.center[0]<0),westIndex=edges.findIndex(e=>e.nx<-.98&&e.length>40),fine=quality!=='low';
 if(northIndex<0||westIndex<0)throw new Error('Mapped north/west mall signage edges are missing.');
 const out=new Recipe('North mall original shop signs and window posters',{buildings:0,quality,sourceId:site.osmId,anchorWGS84:site.anchorWGS84,groundY:GROUND,authoredRetailSignage:true,sourceFootprintUnchanged:true,upperVolumeUnchanged:true,noTextures:true,noRealTenancyClaims:true,placements:[],font:{family:MALL_GLYPH_INFO.family,postscriptName:MALL_GLYPH_INFO.postscriptName,collectionFace:MALL_GLYPH_INFO.collectionFace,licenseURL:MALL_GLYPH_INFO.licenseURL,version:MALL_GLYPH_INFO.version},materialBudget:{names:materials,maxDrawCalls:7,castShadow:false,lowEmissionSurfaceOnly:true,emissiveMaterial:'mallSignFacePale',emissiveIntensity:.20},geometryBudget:{maximumTriangles:16000,maximumNewSourceBytes:1000000},accuracy:'Existing mapped footprint and host column/door rhythm used only for support and clearance. Shop names, poster art, hardware and their exact placements are original illustrative additions, all labeled 风貌示意.'});
 const definitions=[
  {id:'west-corner-coffee',edgeIndex:westIndex,bayIndex:6,title:'街角咖啡',color:'greenBeam'},
  {id:'north-reading',edgeIndex:northIndex,bayIndex:0,title:'读书空间',color:'signDark',poster:'book'},
  {id:'north-images',edgeIndex:northIndex,bayIndex:4,title:'城市影像',color:'vermilion',poster:'city'},
 ];
 for(const d of definitions){
  const e=edges[d.edgeIndex],bay=e.length/Math.max(2,Math.round(e.length/5.5)),u=(d.bayIndex+.5)*bay,[x,z]=point(e,u,PANEL_OFFSET),r=new Recipe(d.id);
  hangSign(r,d.title,d.color,bay,fine);
  out.metadata.placements.push(placementRecord({site,anchor,e,edgeIndex:d.edgeIndex,id:d.id,type:'column_supported_sign',u,y:5.05,w:4.40,h:1.40,offset:PANEL_OFFSET,depth:.14,title:d.title,bayIndex:d.bayIndex,support:{type:'column-to-column crossbar with two standoffs',columnUs:[d.bayIndex*bay,(d.bayIndex+1)*bay],crossbarNormalRange:[-.17,-.05],crossbarY:5.87,standoffYRange:[5.65,5.87],columnNormalRange:[-.74,-.02],standoffNormalRange:[-.16,.02],bodyNormalRange:[-.09,.05]}}));
  if(d.poster){poster(r,d.poster,fine);out.metadata.placements.push(placementRecord({site,anchor,e,edgeIndex:d.edgeIndex,id:d.id+'-poster',type:'grounded_window_display',u,y:2.40,w:2.28,h:3.30,offset:PANEL_OFFSET,depth:.14,title:d.poster==='book'?'一页一城 · 慢读时光':'城市影像 · 光影之间',bayIndex:d.bayIndex,support:{type:'two attached floor feet and continuous legs',bottomY:GROUND,caseBottomY:.75,legRangeY:[.03,.80],footRangeY:[GROUND,.03],glassClearance:1.13,doorApproachClear:true}}));}
  out.merge(r,[anchor[0]+x,0,anchor[1]+z],e.rotation);
 }
 for(const [edgeIndex,columnIndex] of [[northIndex,3],[westIndex,5]]){
  const e=edges[edgeIndex],bay=e.length/Math.max(2,Math.round(e.length/5.5)),u=columnIndex*bay,[x,z]=point(e,u,0),r=new Recipe('Existing entrance side guide');entrance(r);out.merge(r,[anchor[0]+x,0,anchor[1]+z],e.rotation);
  out.metadata.placements.push(placementRecord({site,anchor,e,edgeIndex,id:'entry-guide-'+edgeIndex,type:'column_mounted_entrance_guide',u,y:2.60,w:1.55,h:.78,offset:.035,depth:.12,title:'入口 →',support:{type:'mounting pad attached to existing column front',columnU:u,columnFrontNormalOffset:-.02,mountNormalRange:[-.135,.025],plaqueNormalRange:[-.025,.095],arrowDirectionEdgeU:-1,existingDoorUnchanged:true}}));
 }
 // Three category markers belong to the same three illustrative shops. They
 // add no tenants and stay outside the established main-title bounding boxes.
 const flags=[{id:'coffee-category',edgeIndex:westIndex,columnIndex:6,title:'咖啡',color:'greenBeam',icon:'cup',relatedShop:'west-corner-coffee'},
  {id:'reading-category',edgeIndex:northIndex,columnIndex:1,title:'读书',color:'roofBlue',icon:'book',relatedShop:'north-reading'},
  {id:'image-category',edgeIndex:northIndex,columnIndex:4,title:'影像',color:'vermilion',icon:'camera',relatedShop:'north-images'}];
 for(const f of flags){const e=edges[f.edgeIndex],bay=e.length/Math.max(2,Math.round(e.length/5.5)),u=f.columnIndex*bay,[x,z]=point(e,u,0),r=new Recipe(f.id);categoryFlag(r,f.title,f.color,f.icon,fine);out.merge(r,[anchor[0]+x,0,anchor[1]+z],e.rotation);
  const record=placementRecord({site,anchor,e,edgeIndex:f.edgeIndex,id:f.id,type:'column_category_flag',u,y:5.55,w:.90,h:2.70,offset:.17,depth:.12,title:f.title,support:{type:'two column pads and short solid brackets',columnU:u,columnFrontNormalOffset:-.02,padNormalRange:[-.10,.02],bracketNormalRange:[-.02,.14],caseNormalRange:[.11,.23],mountHeights:[4.62,6.48],lowestY:4.20,noGroundFootprint:true},textLineSpecs:[{text:f.title[0],x:0,y:5.58,offset:.272,fontSize:.46},{text:f.title[1],x:0,y:4.96,offset:.272,fontSize:.46},{text:'风貌示意',x:0,y:4.43,offset:.272,fontSize:.125}]});
  Object.assign(record,{relatedShop:f.relatedShop,newTenancy:false,icon:f.icon,solidColorMaterial:f.color,bodyFrontOffset:.23,textFrontOffset:.272});out.metadata.placements.push(record);
 }
 let triangles=0;for(const p of out.parts)triangles+=p.geometry.type==='box'?12:p.geometry.indices.length/3;
 out.metadata.geometryBudget.actualTriangles=triangles;out.metadata.geometryBudget.partCount=out.parts.length;out.metadata.geometryBudget.actualMaterials=[...new Set(out.parts.map(p=>p.material))];
 out.metadata.minimumHorizontalDoorClearance=Math.min(...out.metadata.placements.map(p=>p.horizontalDoorClearance));
 out.metadata.qualityPolicy='Both levels retain all shop titles, poster headlines, entrance text, explicit disclaimers, three solid-color category markers and their main icons, supported trays, ground feet and original main illustrations. Low removes only secondary poster captions, decorative edges and tiny illustration rules.';
 for(const p of out.metadata.placements){p.textLines=p.textLines.filter(line=>fine||!line.standardOnly);p.worldCenter=p.worldCenter.map(rounded);p.localCenter=p.localCenter.map(rounded);p.horizontalDoorClearance=rounded(p.horizontalDoorClearance);}
 return out;
}
export function buildMallSignage(kit,options={}){
 if(typeof kit?.buildMergedRecipe!=='function')throw new TypeError('Existing architecture kit is required.');
 // Register a private face material; never mutate the shared marble or lights.
 if(!kit.materials.mallSignFacePale){
  const face=kit.materials.marble.clone();face.name='Mall signage warm pale low-emission face';
  face.color.set('#e9dfc8');face.emissive.set('#e9dfc8');face.emissiveIntensity=.20;face.roughness=.90;face.metalness=0;
  face.userData={...face.userData,mallSignageOnly:true,authoredLowBrightnessFace:true};kit.materials.mallSignFacePale=face;
 }
 const recipe=mallSignageRecipe(options),group=kit.buildMergedRecipe(recipe,{castShadow:false});
 if(group.userData.architectureStats.drawCalls>8||group.userData.architectureStats.triangles>16000)throw new Error('Mall signage exceeded its agreed geometry/draw-call budget.');
 return group;
}
