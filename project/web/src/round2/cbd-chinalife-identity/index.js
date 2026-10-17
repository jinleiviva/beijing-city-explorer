/** Photograph-supported China Life name, additive to the unmodified rich host.
 * Exact text is supported; dimensions, letterforms and compass assignment are
 * authored/inferred. No logo, texture, lighting, footprint or height change.
 */
import {Recipe} from '../../architecture/geometry.js';
import {buildingRecipe} from '../../architecture/index.js';
import {secondIdentityTowerFace} from '../cbd-second-identities/index.js';
import {CHINALIFE_IDENTITY_GLYPHS} from './glyph-data.js';

export const CHINALIFE_IDENTITY_EVIDENCE=Object.freeze({
 id:'osm-way-764434361',name:'中国人寿金融中心',text:['中国人寿金融中心','CHINALIFE FINANCIAL CENTER'],
 source:'https://www.chinalifeinvest.com/',image:'https://www.chinalifeinvest.com/res/Home/2011/20110782.jpg',
 heightSource:'https://www.sinooceangroup.com/zh-cn/business/detail.html?commonCode=8cbe0321-9dbe-46fb-b938-eafc04eb19b8&productCategory=2',sourceHeight:190,
 sourceContext:'Owner-hosted photograph inspected by the evidence researcher. Photograph date unknown; the image URL is not evidence of its capture date. Official Sino-Ocean project reference corroborates 190m.',
 mount:'White Chinese name above smaller white CHINALIFE FINANCIAL CENTER on the upper long glazing below the crown. The photograph shows a green emblem on the left and an emblem alone on the adjoining narrow face; both emblems are omitted, and no narrow-face text is inferred. East assignment is inferred from China Zun/Taikang relative positions in the photograph, with no camera metadata. Local +X is the east long principal plane of the current rotated procedural host. Text-group leftward placement, size and letterform are approximate; the omitted emblem is not counted as signage.',
 status:'Photograph-supported exact two-row text; inferred compass face and approximate procedural-host placement'
});
const EMBED=.015,DEPTH=.28;
const worldPoint=(p,f)=>{const c=Math.cos(f.rotation||0),s=Math.sin(f.rotation||0);return[f.x+p[0]*c+p[2]*s,(f.y||0)+p[1],f.z-p[0]*s+p[2]*c];};

/** Baked local Noto subset; closed, outward-facing extruded glyphs, no font runtime. */
export function chinalifeIdentityWord(text,depth=DEPTH){
 if(!(depth>0))throw Error('China Life glyph depth must be positive.');
 const vertices=[],indices=[];let cursor=0;
 for(const ch of text){
  if(ch===' '){cursor+=.35;continue;}
  const g=CHINALIFE_IDENTITY_GLYPHS[ch];if(!g)throw Error('Missing China Life identity glyph '+ch);
  const n=g.vertices.length/3,b=vertices.length/3;
  for(const z of[depth/2,-depth/2])for(let i=0;i<n;i++)vertices.push(cursor+g.vertices[i*3],g.vertices[i*3+1],z);
  const edges=new Map();
  for(let i=0;i<g.indices.length;i+=3){const[a,c,d]=g.indices.slice(i,i+3);indices.push(b+a,b+c,b+d,b+n+d,b+n+c,b+n+a);
   for(const[x,y]of[[a,c],[c,d],[d,a]]){const key=x<y?x+','+y:y+','+x,old=edges.get(key);if(old)old.count++;else edges.set(key,{x,y,count:1});}}
  for(const{x,y,count}of edges.values())if(count===1)indices.push(b+x,b+n+x,b+n+y,b+x,b+n+y,b+y);
  cursor+=g.advance+.065;
 }
 if(!vertices.length)throw Error('China Life identity requires visible text.');
 let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
 for(let i=0;i<vertices.length;i+=3){x0=Math.min(x0,vertices[i]);x1=Math.max(x1,vertices[i]);y0=Math.min(y0,vertices[i+1]);y1=Math.max(y1,vertices[i+1]);}
 for(let i=0;i<vertices.length;i+=3){vertices[i]-=(x0+x1)/2;vertices[i+1]-=(y0+y1)/2;}
 return{geometry:{type:'mesh',vertices,indices,flatShading:true},width:x1-x0,height:y1-y0};
}

export function cbdChinalifeIdentityRecipe(data,{quality='standard'}={}){
 if(!['standard','low'].includes(quality))throw Error('Unknown China Life identity quality '+quality);
 const e=CHINALIFE_IDENTITY_EVIDENCE,f=data.rich?.find(x=>x.id===e.id);if(!f)throw Error('Missing mapped China Life rich host '+e.id);
 if(f.family!=='cbd'||f.variant!==2)throw Error('Changed China Life host factory requires facade review.');
 const host=buildingRecipe(f.family,{...f,detail:1}),face=secondIdentityTowerFace(host,{axis:0,sign:1});
 const yaw=face.yaw+(f.rotation||0),normal=[Math.sin(yaw),0,Math.cos(yaw)];
 if(normal[0]<.98||face.width<28)throw Error('Changed China Life long east face requires explicit review.');
 const cn=chinalifeIdentityWord(e.text[0]),en=chinalifeIdentityWord(e.text[1]);
 const cnSize=Math.min(2.2,18.4/cn.width,face.width*.49/cn.width),enSize=Math.min(1.18,17.3/en.width,cn.width*cnSize*.94/en.width);
 const cnY=face.y1-1.10-cn.height*cnSize/2,enY=cnY-cn.height*cnSize/2-.48-en.height*enSize/2;
 // Viewed square-on from the east, local +Z is visual left. Preserve a modest
 // leftward text-group offset; do not redistribute letters across the full face.
 const localOffset=3.0,mountId='chinalife-east-upper-two-row-name';
 const out=new Recipe('China Life Financial Center · evidence-bounded two-row name',{
  buildings:1,quality,sourceIds:[e.id],verifiedNameBuildingCount:1,signPlacements:1,textRows:2,logoEmblemsReproduced:0,signs:[],mounts:[],evidence:e,
  noHeightChange:true,noFootprintChange:true,noHostGeometryChange:true,noTextures:true,noGuessedEmblems:true,noSurveyClaim:true,
  geometryBudget:{maxTriangles:6000,maxMaterialBatches:1},qualityPolicy:'The same small two-row text mesh is retained in standard and low quality.'
 });
 const local=new Recipe(e.name);
 for(const [text,g,size,y]of[[e.text[0],cn,cnSize,cnY],[e.text[1],en,enSize,enY]]){
  const wallPoint=[face.plane,y,localOffset],center=[face.plane+DEPTH/2-EMBED,y,localOffset],partIndex=local.parts.length;
  if(y+g.height*size/2>=face.y1-.30||y-g.height*size/2<=face.y0)throw Error('China Life name leaves its actual upper glazing.');
  if(localOffset-g.width*size/2<=face.u0+.5||localOffset+g.width*size/2>=face.u1-.5)throw Error('China Life name crosses a chamfer.');
  local.add(g.geometry,'chinalifeIdentityWhite',center,[size,size,1],[0,face.yaw,0],e.id+' · photographed text · '+text);local.parts.at(-1).castShadow=false;
  out.metadata.signs.push({sourceId:e.id,mountId,text,material:'chinalifeIdentityWhite',partIndex,localCenter:center,center:worldPoint(center,f),size,width:g.width*size,height:g.height*size,depth:DEPTH,localYaw:face.yaw,yaw,localNormal:face.normal,normal,
   attachment:{partIndex:face.partIndex,partLabel:face.partLabel,hostDetail:1,localWallPoint:wallPoint,wallPoint:worldPoint(wallPoint,f),localWallNormal:face.normal,wallNormal:normal,backEmbed:EMBED,frontProjection:DEPTH-EMBED,wallWidth:face.width,wallY0:face.y0,wallY1:face.y1,attachmentSource:face.source},accuracy:e.mount});
 }
 out.merge(local,[f.x,f.y||0,f.z],f.rotation||0);
 out.metadata.mounts.push({id:mountId,sourceId:e.id,family:f.family,factory:'contemporaryCbd',variant:f.variant,hostPart:face.partLabel,hostPartIndex:face.partIndex,hostDetail:1,partRange:[0,out.parts.length],sourceHeight:f.height,sourceWidth:f.width,sourceDepth:f.depth,sourceRotation:f.rotation||0,worldAnchor:[f.x,f.y||0,f.z],localFace:'+X long planar glass face, world approximately east',localPlane:face.plane,actualPlane:face.plane,actualPlanarWidth:face.width,actualPlanarRange:[face.u0,face.u1],actualEnvelopeY:[face.y0,face.y1],localFaceCenter:face.center,worldFaceCenter:worldPoint(face.center,f),localNormal:face.normal,worldNormal:normal,localTextCenterZ:localOffset,visualTextGroupOffsetLeft:localOffset,faceAssignment:'Inferred from China Zun/Taikang relative positions; no photograph camera metadata',accuracy:e.mount});
 return out;
}

export function buildCbdChinalifeIdentity(kit,data,options={}){
 if(!kit.materials.chinalifeIdentityWhite){const m=kit.materials.metal.clone();m.name='Beijing_chinalifeIdentityWhite';m.color.set('#edece6');m.roughness=.48;m.metalness=.08;m.emissive.set('#000000');m.emissiveIntensity=0;kit.materials.chinalifeIdentityWhite=m;}
 const group=kit.buildMergedRecipe(cbdChinalifeIdentityRecipe(data,options),{castShadow:false});
 const stats=group.userData.architectureStats;
 if(stats.triangles>6000||stats.drawCalls>1)throw Error('China Life name exceeds its bounded geometry budget.');
 return group;
}
