/** Photographically supported names, mounted to the original mapped envelopes.
 * Geometry/font/proportions are authored approximations; logos not legible in the
 * source photographs are deliberately not invented. No image is a texture.
 */
import {Recipe} from '../../architecture/geometry.js';
import {buildingRecipe} from '../../architecture/index.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {project} from '../../geo.js';
import {contextDetailHost,contextDetailEdges} from '../cbd-context-details/index.js';
import {IDENTITY_GLYPHS} from './glyph-data.js';
export const FACADE_IDENTITY_EVIDENCE={
 hanwei:{id:'osm-way-116944489',name:'漢威大廈 / HANWEI PLAZA',url:'https://www.hanweidasha.cn/',mount:'Gold names on the central stone portal (south side in the existing model; compass assignment inferred) and inner lintel. Letter style, portal dimensions and height are approximate.'},
 bea:{id:'osm-way-233513044',name:'BEA / 東亞銀行',url:'https://www.mfgchn.com/office/beijing/bpc/',mount:'Red letters below the crown on two adjacent facades. East long / south short face assignment is a geographic inference; original low-resolution emblem omitted.'},
 cwh:{id:'osm-way-33459419',name:'中国大饭店 / China World Hotel',url:'https://www.shangri-la.com/cn/beijing/chinaworld/about/map-directions/',mount:'Official arrival photograph establishes south upper-cornice and arrival canopy names. Original inferred 37.847m envelope retained; curved glazing is approximated on the mapped planar walls.'},
 ffc:{id:'osm-way-338085198',name:'FFC',url:'https://www.hki.com.cn/company-business/commercial-operations.html',mount:'Owner photograph shows FFC below the curving roof on two adjacent faces. East and south assignment inferred; existing generic crown retained and unresolvable red corporate icon omitted.'}
};
const box=(r,m,x,y,z,w,h,d,label,ry=0)=>{r.box(m,x,y,z,w,h,d,label,ry);r.parts.at(-1).castShadow=false;};
export function identityWord(word,depth=.08){
 const vertices=[],indices=[];let cursor=0;
 for(const ch of word){if(ch===' '){cursor+=.35;continue;}const g=IDENTITY_GLYPHS[ch];if(!g)throw Error('Missing facade identity glyph '+ch);const n=g.vertices.length/3,b=vertices.length/3;
  for(const z of[depth/2,-depth/2])for(let i=0;i<n;i++)vertices.push(cursor+g.vertices[i*3],g.vertices[i*3+1],z);
  const edges=new Map();for(let i=0;i<g.indices.length;i+=3){const[a,c,d]=g.indices.slice(i,i+3);indices.push(b+a,b+c,b+d,b+n+d,b+n+c,b+n+a);for(const[x,y]of[[a,c],[c,d],[d,a]]){const key=x<y?x+','+y:y+','+x,old=edges.get(key);if(old)old.count++;else edges.set(key,{x,y,count:1});}}
  for(const{x,y,count}of edges.values())if(count===1)indices.push(b+x,b+n+x,b+n+y,b+x,b+n+y,b+y);cursor+=g.advance+.065;
 }
 const xs=vertices.filter((_,i)=>i%3===0),ys=vertices.filter((_,i)=>i%3===1),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 for(let i=0;i<vertices.length;i+=3){vertices[i]-=cx;vertices[i+1]-=cy;}
 return{geometry:{type:'mesh',vertices,indices,flatShading:true},width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
function letters(r,text,material,center,size,yaw,{sourceId,face,accuracy,depth=.08,maxWidth=Infinity}={}){
 const g=identityWord(text,depth),scale=Math.min(size,maxWidth/g.width);r.add(g.geometry,material,center,[scale,scale,1],[0,yaw,0],'Photographed building name · '+text);r.parts.at(-1).castShadow=false;
 r.metadata.signs.push({sourceId,text,face,center,size:scale,width:g.width*scale,height:g.height*scale,depth,yaw,normal:[Math.sin(yaw),0,Math.cos(yaw)],accuracy,partIndex:r.parts.length-1});
}
function transformedSigns(out,r,anchor,yaw=0){const c=Math.cos(yaw),s=Math.sin(yaw);for(const p of r.metadata.signs){const[x,y,z]=p.center;out.metadata.signs.push({...p,center:[anchor[0]+x*c+z*s,anchor[1]+y,anchor[2]-x*s+z*c],yaw:p.yaw+yaw,normal:[Math.sin(p.yaw+yaw),0,Math.cos(p.yaw+yaw)]});}}
/** Close the diagnosed base gap by extending only existing base glazing/frame
 * downward to sampled paving; preserve every original top, roof and footprint. */
export function prepareHanweiGroundHost(recipe,{groundAt=()=>-.02,anchor=project(CBD_CONTEXT_SITES.hanwei_plaza.anchorWGS84),baseY=.8}={}){
 const labels=new Set(['recessed tall glazed retail ground floor','retail glass vertical mullion','central recessed connecting lobby facade','central lobby door mullion','Hanwei portal dark recessed glazing','Hanwei photo-informed tall stone portal pier','Hanwei recessed lobby mullion']);
 const r=new Recipe(recipe.name,{...recipe.metadata,groundContactCorrections:[]});
 r.parts=recipe.parts.map(p=>{if(!labels.has(p.label))return p;const q={...p,position:[...p.position],scale:[...p.scale]},bottom=groundAt(anchor[0]+p.position[0],anchor[1]+p.position[2])-baseY;
  let oldBottom,oldTop;if(p.geometry.type==='mesh'){const ys=p.geometry.vertices.filter((_,i)=>i%3===1),lo=Math.min(...ys),hi=Math.max(...ys);oldBottom=p.position[1]+lo*p.scale[1];oldTop=p.position[1]+hi*p.scale[1];q.geometry={...p.geometry,vertices:p.geometry.vertices.map((v,i)=>i%3===1?(v===lo?(bottom-p.position[1])/p.scale[1]:v):v)};}else if(p.geometry.type==='box'){oldBottom=p.position[1]-p.scale[1]/2;oldTop=p.position[1]+p.scale[1]/2;q.scale[1]=oldTop-bottom;q.position[1]=(oldTop+bottom)/2;}else throw Error('Unexpected Hanwei ground-contact geometry');
  r.metadata.groundContactCorrections.push({label:p.label,x:anchor[0]+p.position[0],z:anchor[1]+p.position[2],oldBottom:oldBottom+baseY,newBottom:bottom+baseY,oldTop:oldTop+baseY,newTop:oldTop+baseY});return q;});
 return r;
}
export function prepareIdentityTowerHost(feature,recipe){if(feature.id!=='osm-way-233513044')return recipe;const r=new Recipe(recipe.name,{...recipe.metadata,identityHostAdjustment:'BEA photo shows continuous glazing here: remove the generic protruding dark slot, keeping all tower massing/height unchanged.'});r.parts=recipe.parts.filter(p=>p.label!=='dark vertical recessed tower slot');return r;}
export function hotelFacadePortal(data,{baseY}={}){const f=data.contextBuildings.find(x=>x.id===FACADE_IDENTITY_EVIDENCE.cwh.id),h=contextDetailHost(f),e=contextDetailEdges(h).find(x=>x.index===3);return{sourceId:f.id,ringIndex:0,edgeIndex:e.index,u0:e.length/2-3.75,u1:e.length/2+3.75,y0:baseY??h.baseY,y1:4.20,edge:e,recess:.55};}
export function facadeIdentitiesRecipe(data,{quality='standard',groundAt=()=>-.02}={}){
 const out=new Recipe('Four photograph-supported CBD facade identities',{buildings:0,quality,sourceIds:[],signs:[],evidence:FACADE_IDENTITY_EVIDENCE,noAddedHelipads:true,noTextureAssets:true,noSurveyClaim:true});
 const merge=(r,e,anchor,yaw=0)=>{out.merge(r,anchor,yaw);transformedSigns(out,r,anchor,yaw);out.metadata.sourceIds.push(e.id);};
 {
  const e=FACADE_IDENTITY_EVIDENCE.hanwei,s=CBD_CONTEXT_SITES.hanwei_plaza,r=new Recipe(e.name,{signs:[]}),z=s.depth*.40+1.2;
  // A deep, host-connected stone portal frames the photograph-supported names.
  box(r,'glassDark',0,9.1,z-.18,13.1,16.5,.18,'Hanwei portal dark recessed glazing');
  for(const x of[-7.3,7.3])box(r,'stoneLight',x,9.8,z-.5,1.45,18.4,2.4,'Hanwei photo-informed tall stone portal pier');
  box(r,'stoneLight',0,18.2,z-.5,16,2.0,2.4,'Hanwei attached name lintel');
  for(let x=-5.4;x<=5.5;x+=2.7)box(r,'metal',x,9.1,z-.06,.075,16.2,.10,'Hanwei recessed lobby mullion');
  for(const y of[7.4,11.5,15.4])box(r,'metal',0,y,z-.04,13.1,.10,.12,'Hanwei lobby glazing crossrail');
  box(r,'stoneDark',0,12.3,z+.01,12.7,1.6,.16,'Hanwei inner bronze name lintel');
  letters(r,'漢威大廈','identityGold',[0,18.35,z+.76],2.05,0,{sourceId:e.id,face:'south central outer portal',accuracy:e.mount,maxWidth:12.5});
  letters(r,'HANWEI PLAZA','identityGold',[0,12.35,z+.15],1.15,0,{sourceId:e.id,face:'south inner lintel',accuracy:e.mount,maxWidth:11.4});
  const a=project(s.anchorWGS84),grounded=prepareHanweiGroundHost(r,{groundAt,anchor:a});out.metadata.hanweiGroundContact=grounded.metadata.groundContactCorrections;merge(grounded,e,[a[0],.8,a[1]]);
 }
 for(const key of['bea','ffc']){
  const e=FACADE_IDENTITY_EVIDENCE[key],f=data.rich.find(x=>x.id===e.id);if(!f)throw Error('Missing known facade host '+e.id);const r=new Recipe(e.name,{signs:[]}),host=prepareIdentityTowerHost(f,buildingRecipe(f.family,{...f,detail:1})),topStage=host.parts.filter(p=>p.label==='faceted main tower envelope').sort((a,b)=>(b.position[1]+b.scale[1]/2)-(a.position[1]+a.scale[1]/2))[0];if(!topStage)throw Error('No actual tower-envelope host '+e.id);const ww=topStage.scale[0],dd=topStage.scale[2],y=Math.min(f.height-9.0,topStage.position[1]+topStage.scale[1]/2-3.2);
  if(key==='bea'){
   // Local +Z is geographic east; local -X is geographic south.
   letters(r,'BEA 東亞銀行','identityRed',[0,y,dd/2+.28],3.0,0,{sourceId:e.id,face:'east long upper elevation',accuracy:e.mount,maxWidth:ww*.72});
   letters(r,'BEA','identityRed',[-ww/2-.28,y,0],4.3,-Math.PI/2,{sourceId:e.id,face:'south short upper elevation',accuracy:e.mount,maxWidth:dd*.70});
   for(const z of[-dd*.32,dd*.32])box(r,'metalDark',-ww/2-.12,y,z,.16,.14,.20,'BEA thin wall-mounted letter stand-off');
  }else{
   // Local -Z is east; local +X is south in the existing mapped tower rotation.
   letters(r,'FFC','identityGold',[0,y,-dd/2-.28],4.8,Math.PI,{sourceId:e.id,face:'east upper elevation',accuracy:e.mount,maxWidth:ww*.50});
   letters(r,'FFC','identityIvory',[ww/2+.28,y,0],4.1,Math.PI/2,{sourceId:e.id,face:'south upper elevation',accuracy:e.mount,maxWidth:dd*.68});
  }
  merge(r,e,[f.x,f.y||0,f.z],f.rotation||0);
 }
 {
  const e=FACADE_IDENTITY_EVIDENCE.cwh,f=data.contextBuildings.find(x=>x.id===e.id),h=contextDetailHost(f),edges=contextDetailEdges(h),r=new Recipe(e.name,{signs:[]});
  for(const index of[1,2,3,4,5,6]){const edge=edges.find(x=>x.index===index),yaw=Math.atan2(edge.normal[0],edge.normal[1]),mid=[(edge.a[0]+edge.b[0])/2,(edge.a[1]+edge.b[1])/2],width=edge.length-2.0,y0=index===3?5.7:1.15,y1=h.roofY-3.2,depth=.18;
   box(r,'glassDark',mid[0]+edge.normal[0]*.06,(y0+y1)/2,mid[1]+edge.normal[1]*.06,width,y1-y0,depth,'China World Hotel south mapped glazing field',yaw);
   const count=Math.round(width/(quality==='low'?4.8:2.4));for(let j=0;j<=count;j++){const t=(j/count-.5)*width,xx=mid[0]+Math.cos(yaw)*t+edge.normal[0]*.20,zz=mid[1]-Math.sin(yaw)*t+edge.normal[1]*.20;box(r,'identityBronzeFrame',xx,(y0+y1)/2,zz,.075,y1-y0,.10,'China World Hotel bronze glazing mullion',yaw);}
   for(let yy=y0;yy<y1;yy+=3.35)box(r,'identityBronzeFrame',mid[0]+edge.normal[0]*.20,yy,mid[1]+edge.normal[1]*.20,width,.085,.10,'China World Hotel fine floor glazing rail',yaw);
   box(r,'stoneLight',mid[0]+edge.normal[0]*.10,h.roofY-1.25,mid[1]+edge.normal[1]*.10,width,2.2,.28,'China World Hotel upper name cornice',yaw);
   if(index===1)letters(r,'中国大饭店 China World Hotel','identityHotelRed',[mid[0]+edge.normal[0]*.30,h.roofY-1.30,mid[1]+edge.normal[1]*.30],1.55,yaw,{sourceId:e.id,face:'south-east upper cornice',accuracy:e.mount,maxWidth:width-3});
  }
  // The actual mapped forward central segment supports an arrival canopy.
  const edge=edges.find(x=>x.index===3),mid=[(edge.a[0]+edge.b[0])/2,(edge.a[1]+edge.b[1])/2],yaw=Math.atan2(edge.normal[0],edge.normal[1]);
  box(r,'metalDark',mid[0]+edge.normal[0]*1.8,4.45,mid[1]+edge.normal[1]*1.8,13.1,.35,3.8,'China World Hotel photo-informed arrival canopy',yaw);
  box(r,'identityBronzeFrame',mid[0]+edge.normal[0]*3.68,5.16,mid[1]+edge.normal[1]*3.68,13.0,1.08,.20,'China World Hotel arrival name fascia',yaw);
  letters(r,'中国大饭店','identityIvory',[mid[0]+edge.normal[0]*3.82,5.16,mid[1]+edge.normal[1]*3.82],.80,yaw,{sourceId:e.id,face:'south arrival canopy',accuracy:e.mount,maxWidth:11.7});
  const portal=hotelFacadePortal(data,{baseY:groundAt(mid[0],mid[1])}),yc=(portal.y0+portal.y1)/2,dh=portal.y1-portal.y0,n=edge.normal,t=[Math.cos(yaw),-Math.sin(yaw)],rear=[mid[0]-n[0]*portal.recess,mid[1]-n[1]*portal.recess];
  box(r,'glassDark',rear[0],yc,rear[1],7.5,dh,.12,'China World Hotel recessed closed-glass entry',yaw);
  for(const u of[-3.75,-1.5,0,1.5,3.75])box(r,'identityBronzeFrame',rear[0]+t[0]*u+n[0]*.10,yc,rear[1]+t[1]*u+n[1]*.10,.085,dh,.12,'China World Hotel real opening inner door stile',yaw);
  for(const u of[-.2,.2])box(r,'identityGold',rear[0]+t[0]*u+n[0]*.20,1.75,rear[1]+t[1]*u+n[1]*.20,.05,.65,.09,'China World Hotel door pull',yaw);
  for(const u of[-3.88,3.88])box(r,'stoneLight',mid[0]+t[0]*u-n[0]*.24,yc,mid[1]+t[1]*u-n[1]*.24,.26,dh,.60,'China World Hotel entry side reveal',yaw);
  box(r,'stoneLight',mid[0]-n[0]*.24,portal.y1+.12,mid[1]-n[1]*.24,7.5,.24,.60,'China World Hotel entry head reveal',yaw);
  box(r,'stoneLight',mid[0]-n[0]*.20,portal.y0+.025,mid[1]-n[1]*.20,7.5,.05,.9,'China World Hotel low threshold connected to sampled arrival paving',yaw);
  out.metadata.hotelContinuousGlazing={edges:[1,2,3,4,5,6],source:'Official China World Hotel arrival photograph',accuracy:'Continuous curved arrival glazing approximated across mapped planar wall segments; bay dimensions inferred.'};
  out.metadata.hotelPortal={...portal,accuracy:'Authored closed glazed-door opening and reveals within mapped arrival segment; dimensions approximate, source height and footprint unchanged.'};
  merge(r,e,[0,0,0]);out.metadata.chinaWorldHotelHeight={originalInferredHeight:h.height,heightChanged:false,sourceStatus:h.sourceHeightStatus};
 }
 out.metadata.verifiedNameBuildingCount=out.metadata.sourceIds.length;out.metadata.logoEmblemsReproduced=0;out.metadata.signPlacements=out.metadata.signs.length;return out;
}
export function buildCbdFacadeIdentities(kit,data,options={}){
 const specs={identityGold:['bronze','#c5a65b',.36,.28],identityRed:['vermilion','#b83b36',.54,.07],identityIvory:['marble','#e9e1c8',.55,.05],identityHotelRed:['vermilion','#8f4136',.56,.08],identityBronzeFrame:['bronze','#91836b',.52,.20]};
 for(const[name,[base,color,roughness,metalness]]of Object.entries(specs))if(!kit.materials[name]){const m=kit.materials[base].clone();m.name='Beijing_'+name;m.color.set(color);m.roughness=roughness;m.metalness=metalness;m.emissiveIntensity=0;kit.materials[name]=m;}
 return kit.buildMergedRecipe(facadeIdentitiesRecipe(data,options),{castShadow:false});
}
