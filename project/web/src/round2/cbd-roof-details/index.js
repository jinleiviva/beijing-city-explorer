/** Evidence-bounded CBD roof details. Photos are reference only, not textures.
 * Real building names identify their respective properties, with no affiliation
 * implied. Typeface, precise placement and unmeasured dimensions are approximate.
 */
import {Recipe,beam} from '../../architecture/geometry.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {project} from '../../geo.js';
import {ROOF_GLYPHS} from './glyph-data.js';

export const ROOF_EVIDENCE={
 kerry:{source:'https://item.secoo.com/10945351.shtml',status:'Exterior photograph shows two-line KERRY / HOTEL and vertical 嘉里大酒店; facade directions and dimensions inferred within existing mapped hotel slab.',trademark:'KERRY HOTEL / 嘉里大酒店 identify the real hotel; not authored tenants or an affiliation claim.'},
 zun:{source:'https://www.skyscrapercenter.com/building/citic-tower/11116',engineering:'https://www.shinjuker.com/nd.jsp?fromColId=101&id=153',photo:'https://thetowerinfo.com/buildings-list/china-zun-tower/',height:527.7,heightMeaning:'Published helipad height above the building base, not a new terrain elevation measurement.',status:'Central raised circular helipad, white H and yellow ring supported by built-crown aerial. Diameter, wall height, H orientation, service equipment and markings are photograph-based approximations.'}
};
function solidWord(word,depth=.14){
 const vertices=[],indices=[];let cursor=0;
 for(const ch of word){const g=ROOF_GLYPHS[ch];if(!g)throw Error('Missing roof name glyph '+ch);const n=g.vertices.length/3,b=vertices.length/3;
  for(const z of[depth/2,-depth/2])for(let i=0;i<n;i++)vertices.push(cursor+g.vertices[i*3],g.vertices[i*3+1],z);
  const edges=new Map();for(let i=0;i<g.indices.length;i+=3){const[a,c,d]=g.indices.slice(i,i+3);indices.push(b+a,b+c,b+d,b+n+d,b+n+c,b+n+a);for(const[x,y]of[[a,c],[c,d],[d,a]]){const key=x<y?x+','+y:y+','+x;const old=edges.get(key);if(old)old.count++;else edges.set(key,{x,y,count:1});}}
  for(const{x,y,count}of edges.values())if(count===1)indices.push(b+x,b+n+x,b+n+y,b+x,b+n+y,b+y);
  cursor+=g.advance+.065;
 }
 const xs=vertices.filter((_,i)=>i%3===0),ys=vertices.filter((_,i)=>i%3===1),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 for(let i=0;i<vertices.length;i+=3){vertices[i]-=cx;vertices[i+1]-=cy;}
 return{type:'mesh',vertices,indices,flatShading:true};
}
function ring(r,m,inner,outer,y,label,segments=96){const v=[],ix=[];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;v.push(Math.cos(a)*outer,y,Math.sin(a)*outer,Math.cos(a)*inner,y,Math.sin(a)*inner);if(i<segments){const n=i*2;ix.push(n,n+1,n+3,n,n+3,n+2);}}r.add({type:'mesh',vertices:v,indices:ix},m,[0,0,0],[1,1,1],[0,0,0],label);r.parts.at(-1).castShadow=false;}
const box=(r,m,x,y,z,w,h,d,label,ry=0,shadow=true)=>{r.box(m,x,y,z,w,h,d,label,ry);r.parts.at(-1).castShadow=shadow;};
export function kerryRoofNamesRecipe(){
 const site=CBD_CONTEXT_SITES.kerry_mall_hotel,w=site.width,d=site.depth,h=84,tw=w*.205,td=d*.70,[cx,cz]=site.hotelPoiLocal,r=new Recipe('Kerry photographed upper-facade hotel names',{buildings:0,sourceId:site.osmId,evidence:ROOF_EVIDENCE.kerry,heightAccuracy:'Existing 84m hotel model is database-estimated; name placement is image-proportioned, not surveyed.',placements:[]}),local=new Recipe('Hotel upper-name letter hardware');
 const westX=-tw/2-.70;
 for(const[word,y,size]of[['KERRY',h-2.7,2.35],['HOTEL',h-5.0,2.20]]){
  box(local,'metalDark',-tw/2-.52,y,0,.30,.12,9.2,'Hotel thin western letter support rail');
  local.add(solidWord(word,.075),'roofNameIvory',[westX,y,0],[size,size,1],[0,-Math.PI/2,0],'Real hotel name · '+word);local.parts.at(-1).castShadow=true;
  r.metadata.placements.push({text:word,face:'west long hotel elevation',localCenter:[westX,y,0],fontSize:size,letterDepth:.075,placement:'just below the top crown, not compressed into parapet'});
 }
 const x=-tw/2+3.0,z=td/2+.38;
 for(const[ch,i]of [...'嘉里大酒店'].map((ch,i)=>[ch,i])){const y=h-11-i*3.7;box(local,'metalDark',x,y,td/2+.25,.16,1.6,.22,'Hotel south name stand-off rail');local.add(solidWord(ch,.14),'roofNameIvory',[x,y,z],[2.60,2.60,1],[0,0,0],'Real hotel vertical name · '+ch);local.parts.at(-1).castShadow=true;}
 r.metadata.placements.push({text:'嘉里大酒店',face:'south narrow hotel elevation, west corner',localCenter:[x,h-18.4,z],fontSize:2.60,characterSpacing:3.7,letterDepth:.14});
 r.merge(local,[cx,0,cz],.020);const a=project(site.anchorWGS84),world=new Recipe(r.name,r.metadata);world.merge(r,[a[0],.8,a[1]]);return world;
}
export function chinaZunHelipadRecipe(){
 const r=new Recipe('China Zun photographed central elevated helipad',{buildings:0,evidence:ROOF_EVIDENCE.zun,helipadTop:527.7,diameter:33,diameterAccuracy:'33m selected within a 30–36m photograph-estimated range; no surveyed diameter available.',center:[0,0],originalVaseLipUnchanged:true,originalDeckTop:515.925,markOrientation:'Approximate local building axes, not a verified operational heading.',noAircraftAdded:true});
 // The former 516m recessed plane remains below. A connected drum raises the
 // pad to the published helipad level rather than painting H on that low plane.
 r.cylinder('zunDark',0,517.1,0,15.1,2.4,'Helipad lower drum connected to existing mechanical deck',64);
 r.cylinder('silverFacade',0,(518.3+527.35)/2,0,16.15,527.35-518.3,'Helipad raised circular screened support drum',96);
 r.cylinder('roofHelipadGrey',0,527.525,0,16.5,.35,'Helipad 33m raised circular top slab',96);
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2;box(r,'stoneLight',Math.cos(a)*16.22,522.90,Math.sin(a)*16.22,.13,8.55,.18,'Helipad support drum vertical screen fin',-a,false);}
 ring(r,'roofPaintWhite',14.87,15.08,527.712,'Helipad thin outer white perimeter');
 ring(r,'roofPaintYellow',8.02,8.45,527.718,'Helipad photographed yellow inner ring');
 for(const x of[-1.35,1.35])box(r,'roofPaintWhite',x,527.72,0,.65,.016,4.0,'Helipad white H upright',0,false);
 box(r,'roofPaintWhite',0,527.72,0,2.7,.016,.65,'Helipad white H crossbar',0,false);
 box(r,'roofPaintYellow',0,527.72,11.98,.24,.016,7.05,'Helipad single inferred radial alignment line',0,false);
 // Rim and catch-net support remain BELOW the landing surface. No tall fence
 // or roof advertising is inserted through the helipad approach surface.
 ring(r,'metalDark',16.50,17.05,527.08,'Helipad below-deck perimeter safety ledge',80);
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2;beam(r,'silverFacade',[Math.cos(a)*15.9,526.70,Math.sin(a)*15.9],[Math.cos(a)*17.1,527.08,Math.sin(a)*17.1],.035,'Helipad below-deck radial rim support');r.parts.at(-1).castShadow=false;}
 // Only a bounded set of low service housings around the clear central drum.
 // Their type is visible in the aerial; counts and exact locations are inferred.
 for(let i=0;i<8;i++){const a=i*Math.PI/4+.12,x=Math.cos(a)*25.1,z=Math.sin(a)*25.1;box(r,'metal',x,517.30,z,4.8,2.60,2.8,'Crown low photo-informed service housing',-a,true);for(let j=-1;j<=1;j++)box(r,'metalDark',x+Math.cos(a)*j*.72,518.635,z+Math.sin(a)*j*.72,.16,.07,2.40,'Crown service housing roof louver',-a,false);}
 ring(r,'stoneDark',19.35,20.15,516.07,'Crown clear annular inspection walkway',96);
 return r;
}
export function buildCbdRoofDetails(kit,data){
 const specs={roofNameIvory:['marble','#e3ddc0',.50,0,.10],roofHelipadGrey:['concrete','#687877',.92,.01,0],roofPaintWhite:['marble','#dce2da',.92,0,0],roofPaintYellow:['roofGold','#c7ac4e',.94,0,0]};
 for(const[name,[base,color,roughness,metalness,emission]]of Object.entries(specs))if(!kit.materials[name]){const m=kit.materials[base].clone();m.name=name;m.color.set(color);m.roughness=roughness;m.metalness=metalness;m.emissive.set(color);m.emissiveIntensity=emission;kit.materials[name]=m;}
 const r=new Recipe('Evidence-bounded CBD roof details',{buildings:0,evidence:ROOF_EVIDENCE,noTextureAssets:true,scope:['Kerry upper hotel names','China Zun central raised circular helipad'],notSurveyed:true}),kerry=kerryRoofNamesRecipe(),zun=chinaZunHelipadRecipe(),feature=data.landmarks.find(f=>(f.properties.model||f.id)==='china_zun');if(!feature)throw Error('China Zun mapped feature missing');
 const a=project(feature.geometry.coordinates);r.merge(kerry);r.merge(zun,[a[0],feature.properties.baseElevation||1,a[1]],feature.properties.rotation||0);r.metadata.kerry=kerry.metadata;r.metadata.zun={...zun.metadata,worldAnchor:[a[0],feature.properties.baseElevation||1,a[1]]};
 return kit.buildMergedRecipe(r);
}
