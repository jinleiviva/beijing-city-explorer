/** Evidence-bounded second-pass CBD names. Additive lettering only.
 * These are approximate letterforms on existing procedural hosts, not surveyed
 * facade reconstructions. Samsung upper podium glass is corrected to the photographed flush exterior; tower height and footprint are unchanged.
 */
import {Recipe} from '../../architecture/geometry.js';
import {buildingRecipe} from '../../architecture/index.js';
import {SECOND_IDENTITY_GLYPHS} from './glyph-data.js';

export const SECOND_IDENTITY_EVIDENCE=Object.freeze({
 samsung:{id:'osm-way-764434414',name:'三星大厦',text:['三星大厦'],status:'photograph-supported text; inferred procedural-host attachment',source:'https://www.arcadis.cn/zh-cn/projects/asia/china/samsung-china-hq',image:'https://www.arcadis.cn/-/media/project/arcadiscom/com/projects/asia/china/samsung-china-hq/samsung_china_hq---hero.png',sourceContext:'Project completed in 2019; photograph date not stated.',mount:'Deep-blue Chinese name on the low glass arrival/podium upper edge, approximately 2–3 storeys. The existing 14m podium is retained. Single local +Z flush silver-blue glass ribbon follows the exterior installation relationship in the Arcadis photograph; compass face and dimensions inferred. Generic deep arcade recess and thick upper frames corrected locally. No tower-top SAMSUNG.'},
 cmNorth:{id:'osm-way-599547915',name:'世界华商中心 / 正大中心北塔',text:['世界华商中心','CM CENTER'],status:'photograph-supported text; north ID and compass face inferred',source:'https://www.cp-center.cn/news-detail/1757.html',image:'https://www.cp-center.cn/uploads/images/2026/0324/huSKS9pmmP3C4tNhxiU5shWYOWRoPdIoa0U8IQvY.png',sourceContext:'Official article 2026-03-24; photograph date unknown; article says some images originate online.',mount:'Gold Chinese above CM CENTER below the roofline. Existing north-ID assignment comes from scene identity and centroid, not independent photo geolocation. One local −Z / approximately west face inferred; no claim all faces share this sign.'},
 cpSouth:{id:'osm-way-662019986',name:'正大中心 / 正大中心南塔',text:['正大中心','CP CENTER'],status:'photograph-supported text; south ID and compass face inferred',source:'https://www.cp-center.cn/news-detail/1757.html',image:'https://www.cp-center.cn/uploads/images/2026/0324/huSKS9pmmP3C4tNhxiU5shWYOWRoPdIoa0U8IQvY.png',sourceContext:'Official article 2026-03-24; photograph date unknown; article says some images originate online.',mount:'Gold Chinese above CP CENTER below the roofline. Existing south-ID assignment comes from scene identity and centroid, not independent photo geolocation. One local −X / approximately west face inferred. Gold emblem deliberately omitted; historical CP GROUP not substituted.'},
 millennium:{id:'osm-way-338084085',name:'北京千禧大酒店',text:['GRAND','MILLENNIUM'],status:'blocked: photographed high-rise recessed-glass host absent',source:'https://hi-life.hongleong.com.sg/December2025/meals_deals-article03.html',image:'https://hi-life.hongleong.com.sg/December2025/images/mealsndeals-article3-main.jpg',sourceContext:'Hong Leong publication December 2025; photograph date unknown.',mount:'Photograph places white two-line text high on recessed glazing between taller crowns. Current host is a 30.461182m stone-mode polygon extrusion, not that high-rise facade. No Millennium letters are installed; backup glyphs do not count as installed signage.'}
});

/** Independent Noto glyph subset; same extrusion method as first-pass identityWord. */
export function secondIdentityWord(word,depth=.18){
 const vertices=[],indices=[];let cursor=0;
 for(const ch of word){
  if(ch===' '){cursor+=.35;continue;}
  const g=SECOND_IDENTITY_GLYPHS[ch];if(!g)throw Error('Missing second facade identity glyph '+ch);
  const n=g.vertices.length/3,b=vertices.length/3;
  for(const z of[depth/2,-depth/2])for(let i=0;i<n;i++)vertices.push(cursor+g.vertices[i*3],g.vertices[i*3+1],z);
  const edges=new Map();
  for(let i=0;i<g.indices.length;i+=3){
   const[a,c,d]=g.indices.slice(i,i+3);indices.push(b+a,b+c,b+d,b+n+d,b+n+c,b+n+a);
   for(const[x,y]of[[a,c],[c,d],[d,a]]){const key=x<y?x+','+y:y+','+x,old=edges.get(key);if(old)old.count++;else edges.set(key,{x,y,count:1});}
  }
  for(const{x,y,count}of edges.values())if(count===1)indices.push(b+x,b+n+x,b+n+y,b+x,b+n+y,b+y);
  cursor+=g.advance+.065;
 }
 if(!vertices.length)throw Error('A facade name requires visible glyphs.');
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(let i=0;i<vertices.length;i+=3){minX=Math.min(minX,vertices[i]);maxX=Math.max(maxX,vertices[i]);minY=Math.min(minY,vertices[i+1]);maxY=Math.max(maxY,vertices[i+1]);}
 for(let i=0;i<vertices.length;i+=3){vertices[i]-=(minX+maxX)/2;vertices[i+1]-=(minY+maxY)/2;}
 return {geometry:{type:'mesh',vertices,indices,flatShading:true},width:maxX-minX,height:maxY-minY};
}

const EMBED=.015;
const worldPoint=(p,f)=>{const c=Math.cos(f.rotation||0),s=Math.sin(f.rotation||0);return[f.x+p[0]*c+p[2]*s,(f.y||0)+p[1],f.z-p[0]*s+p[2]*c];};
const top=p=>p.position[1]+p.scale[1]/2;
const bottom=p=>p.position[1]-p.scale[1]/2;
function requiredPart(host,label){const index=host.parts.findIndex(p=>p.label===label);if(index<0)throw Error('Missing actual second-identity host part: '+label);return{part:host.parts[index],index};}
/** Samsung alone: the photograph shows a continuous exterior glass ribbon, not
 * the generic recessed retail arcade. Source tower and podium footprint/top stay.
 */
export function prepareSecondIdentityHost(feature,recipe){
 if(feature.id!==SECOND_IDENTITY_EVIDENCE.samsung.id)return recipe;
 const r=new Recipe(recipe.name,{...recipe.metadata,samsungHostCorrection:{source:SECOND_IDENTITY_EVIDENCE.samsung.source,scope:'Flush silver-blue upper podium curtain wall; thin silver mullions and 0.20m edge. Dimensions/reflectance are authored approximations.',towerHeightUnchanged:true,footprintUnchanged:true,podiumTopUnchanged:true}});
 r.parts=recipe.parts.map(p=>({...p,position:[...p.position],scale:[...p.scale],rotation:[...p.rotation]}));
 const slab=r.parts.find(p=>p.label==='podium roof slab'),front=slab.scale[2]/2,roof=top(slab);
 for(const p of r.parts){
  if(p.label==='upper retail mezzanine window ribbon'){p.position[2]=front-.12;p.material='samsungExteriorGlass';}
  if(p.label==='double-height podium window frame'){p.position[2]=front-.065;p.scale[0]=.085;p.scale[2]=.06;p.material='silverFacade';}
  if(p.label==='recessed arcade structural pier'){const y0=bottom(p);p.scale[1]=5.40-y0;p.position[1]=(5.40+y0)/2;}
  if(p.label==='podium roof slab'){p.scale[1]=.20;p.position[1]=roof-.10;}
 }
 return r;
}
export function ensureSecondIdentityHostMaterials(kit){
 if(!kit.materials.samsungExteriorGlass){const m=kit.materials.glassPale.clone();m.name='Beijing_samsungExteriorGlass';m.color.set('#B1C1CB');m.roughness=.24;m.metalness=.15;m.envMapIntensity=.9;m.emissiveIntensity=0;kit.materials.samsungExteriorGlass=m;}
}
function richHost(data,e){
 const feature=data.rich?.find(f=>f.id===e.id);if(!feature)throw Error('Missing mapped second-identity host '+e.id);
 if(feature.family!=='cbd')throw Error('Review changed host factory for '+e.id);
 const recipe=prepareSecondIdentityHost(feature,buildingRecipe(feature.family,{...feature,detail:1}));
 return{feature,recipe};
}

/** Extract the real planar wall segment from the generated chamfer mesh.
 * A bare width/2 is insufficient: the sign must also fit between chamfers.
 */
export function secondIdentityTowerFace(recipe,{axis=2,sign=-1}={}){
 if(![0,2].includes(axis)||![1,-1].includes(sign))throw Error('Expected principal X/Z facade.');
 const candidates=recipe.parts.map((part,index)=>({part,index})).filter(x=>x.part.label==='faceted main tower envelope').sort((a,b)=>top(b.part)-top(a.part));
 if(!candidates.length)throw Error('No actual tower envelope for facade lettering.');
 const{part,index}=candidates[0];
 if(part.geometry.type!=='mesh'||part.rotation.some(v=>Math.abs(v)>1e-9))throw Error('Changed tower geometry needs explicit attachment review.');
 const v=part.geometry.vertices,points=[];
 for(let i=0;i<v.length;i+=3)points.push([0,1,2].map(j=>part.position[j]+v[i+j]*part.scale[j]));
 const plane=sign*Math.max(...points.map(p=>sign*p[axis])),on=points.filter(p=>Math.abs(p[axis]-plane)<1e-7),t=axis===0?2:0;
 const u0=Math.min(...on.map(p=>p[t])),u1=Math.max(...on.map(p=>p[t])),y0=Math.min(...on.map(p=>p[1])),y1=Math.max(...on.map(p=>p[1]));
 if(on.length<4||u1-u0<5)throw Error('No safe planar segment in actual tower mesh.');
 const normal=[0,0,0];normal[axis]=sign;const center=[0,(y0+y1)/2,0];center[axis]=plane;center[t]=(u0+u1)/2;
 return {partIndex:index,partLabel:part.label,axis,sign,center,normal,yaw:Math.atan2(normal[0],normal[2]),width:u1-u0,u0,u1,y0,y1,plane,source:'Actual generated envelope mesh principal-plane vertices'};
}

function addWord(r,{text,material,face,y,size,maxWidth,sourceId,mountId,evidence,depth=.28}){
 const g=secondIdentityWord(text,depth),scale=Math.min(size,maxWidth/g.width),center=[...face.center];center[1]=y;
 for(let j=0;j<3;j++)center[j]+=face.normal[j]*(depth/2-EMBED);
 const partIndex=r.parts.length;
 r.add(g.geometry,material,center,[scale,scale,1],[0,face.yaw,0],sourceId+' · photographed text · '+text);
 r.parts.at(-1).castShadow=false;
 const sign={sourceId,mountId,text,material,center,width:g.width*scale,height:g.height*scale,size:scale,depth,yaw:face.yaw,normal:face.normal,partIndex,attachment:{partLabel:face.partLabel,partIndex:face.partIndex,wallPoint:[...face.center.slice(0,1),y,face.center[2]],wallNormal:face.normal,backEmbed:EMBED,frontProjection:depth-EMBED,wallWidth:face.width,wallY0:face.y0,wallY1:face.y1,attachmentSource:face.source},accuracy:evidence.mount};
 r.metadata.signs.push(sign);return sign;
}
function emit(out,r,feature,e,mount){
 const start=out.parts.length;out.merge(r,[feature.x,feature.y||0,feature.z],feature.rotation||0);
 for(const s of r.metadata.signs){const yaw=s.yaw+(feature.rotation||0);out.metadata.signs.push({...s,localCenter:s.center,center:worldPoint(s.center,feature),yaw,normal:[Math.sin(yaw),0,Math.cos(yaw)],partIndex:start+s.partIndex,attachment:{...s.attachment,localWallPoint:s.attachment.wallPoint,wallPoint:worldPoint(s.attachment.wallPoint,feature),wallNormal:[Math.sin(yaw),0,Math.cos(yaw)]}});}
 out.metadata.sourceIds.push(e.id);out.metadata.mounts.push({...mount,sourceId:e.id,partRange:[start,out.parts.length],sourceHeight:feature.height,sourceWidth:feature.width,sourceDepth:feature.depth,sourceRotation:feature.rotation||0,worldAnchor:[feature.x,feature.y||0,feature.z],faceAssignment:'inferred, not independently geolocated from photograph'});
}

export function cbdSecondIdentitiesRecipe(data,{quality='standard'}={}){
 if(!['standard','low'].includes(quality))throw Error('Unknown second-identity quality '+quality);
 const out=new Recipe('CBD second-pass three verified name hosts',{buildings:0,quality,sourceIds:[],signs:[],mounts:[],evidence:SECOND_IDENTITY_EVIDENCE,blockedSourceIds:[SECOND_IDENTITY_EVIDENCE.millennium.id],noHeightChange:true,noFootprintChange:true,hostGeometryCorrectionIds:[SECOND_IDENTITY_EVIDENCE.samsung.id],noTextures:true,noGuessedEmblems:true,noSurveyClaim:true,geometryBudget:{maxTriangles:15000,maxMaterialBatches:8},qualityPolicy:'Both qualities retain the same small factual-letter mesh for legibility; no additional detail.'});
 {
  const e=SECOND_IDENTITY_EVIDENCE.samsung,{feature,recipe}=richHost(data,e),r=new Recipe(e.name,{signs:[]});
  const {part:ribbon,index}=requiredPart(recipe,'upper retail mezzanine window ribbon'),{part:slab}=requiredPart(recipe,'podium roof slab');
  if(ribbon.geometry.type!=='box'||ribbon.rotation.some(v=>Math.abs(v)>1e-9))throw Error('Samsung glazing geometry changed.');
  const y0=bottom(ribbon),y1=Math.min(top(ribbon),bottom(slab)),plane=ribbon.position[2]+ribbon.scale[2]/2;
  const face={partIndex:index,partLabel:ribbon.label,center:[0,0,plane],normal:[0,0,1],yaw:0,width:ribbon.scale[0],y0,y1,source:'Photograph-corrected continuous outer curtain-wall ribbon; original top and footprint retained'};
  const word=secondIdentityWord(e.text[0],.18),size=Math.min(2.1,8.6/word.width),y=y1-.38-word.height*size/2;
  addWord(r,{text:e.text[0],material:'secondIdentityBlue',face,y,size,maxWidth:8.6,sourceId:e.id,mountId:'samsung-podium-glass',evidence:e,depth:.18});
  emit(out,r,feature,e,{id:'samsung-podium-glass',family:feature.family,factory:'contemporaryCbd',hostPart:ribbon.label,localFace:'+Z upper podium glazing; world approximately north',letterWidthApproximate:8.6,podiumHeight:top(slab),accuracy:e.mount});
 }
 for(const[key,axis]of[['cmNorth',2],['cpSouth',0]]){
  const e=SECOND_IDENTITY_EVIDENCE[key],{feature,recipe}=richHost(data,e),r=new Recipe(e.name,{signs:[]}),face=secondIdentityTowerFace(recipe,{axis,sign:-1}),mountId=key+'-single-upper-face';
  const cn=secondIdentityWord(e.text[0]),cnSize=Math.min(2.22,(face.width-4)/cn.width),cnY=face.y1-1.30-cn.height*cnSize/2;
  const en=secondIdentityWord(e.text[1]),enSize=Math.min(1.55,(face.width-4)/en.width),enY=cnY-cn.height*cnSize/2-.60-en.height*enSize/2;
  addWord(r,{text:e.text[0],material:'secondIdentityGold',face,y:cnY,size:cnSize,maxWidth:face.width-4,sourceId:e.id,mountId,evidence:e});
  addWord(r,{text:e.text[1],material:'secondIdentityGold',face,y:enY,size:enSize,maxWidth:face.width-4,sourceId:e.id,mountId,evidence:e});
  emit(out,r,feature,e,{id:mountId,family:feature.family,factory:'contemporaryCbd',hostPart:face.partLabel,localFace:axis===2?'−Z, world approximately west':'−X, world approximately west',actualPlane:face.plane,actualPlanarWidth:face.width,actualEnvelopeY:[face.y0,face.y1],accuracy:e.mount});
 }
 out.metadata.buildings=out.metadata.sourceIds.length;out.metadata.verifiedNameBuildingCount=out.metadata.sourceIds.length;out.metadata.signPlacements=out.metadata.mounts.length;out.metadata.textRows=out.metadata.signs.length;out.metadata.logoEmblemsReproduced=0;
 return out;
}

export function buildCbdSecondIdentities(kit,data,options={}){
 const specs={secondIdentityGold:['bronze','#baa16a',.43,.24],secondIdentityBlue:['metalDark','#203e66',.42,.12]};
 for(const[name,[base,color,roughness,metalness]]of Object.entries(specs))if(!kit.materials[name]){const m=kit.materials[base].clone();m.name='Beijing_'+name;m.color.set(color);m.roughness=roughness;m.metalness=metalness;m.emissiveIntensity=0;kit.materials[name]=m;}
 const group=kit.buildMergedRecipe(cbdSecondIdentitiesRecipe(data,options),{castShadow:false});
 if(group.userData.architectureStats.triangles>15000||group.userData.architectureStats.drawCalls>8)throw Error('Second facade identities exceed their bounded geometry budget.');
 return group;
}
