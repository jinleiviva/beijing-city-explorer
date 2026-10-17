/** Two original, photo-informed wall advertisements, not real campaigns.
 * Ground footprint, windows, doors and street access are unchanged.
 * Photos establish building/mounting vocabulary only and are never textures.
 */
import {Recipe} from '../../architecture/geometry.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {footprintEdges} from '../../architecture/site-massing.js';
import {project} from '../../geo.js';
import {COMMERCIAL_POSTER_GLYPHS,COMMERCIAL_POSTER_GLYPH_INFO} from './glyph-data.js';
const MATERIALS=['signDark','cctvSteel','greenBeam','marble','vermilion','bronze'];
const CACHE=new Map(),LABEL='Commercial authored wall poster ';
export const COMMERCIAL_POSTER_DEFINITIONS=Object.freeze([
 {id:'mall-recess-city-inspiration',edgeIndex:0,u:6.334684406108958,width:8.4,height:13,worldY:16.9,title:'城市灵感',theme:'city'},
 {id:'mall-west-life-happens',edgeIndex:4,u:10.4,width:16,height:4.4,worldY:24.9,title:'让生活发生',theme:'life'}
]);
const box=(r,m,x,y,z,w,h,d,label)=>{r.box(m,x,y,z,w,h,d,LABEL+label);r.parts.at(-1).castShadow=false;};
function polygon(r,m,points,z,label){
 const area=points.reduce((a,p,i)=>{const q=points[(i+1)%points.length];return a+p[0]*q[1]-p[1]*q[0];},0),p=area>0?points:[...points].reverse(),indices=[];
 for(let i=1;i<p.length-1;i++)indices.push(0,i,i+1);
 r.add({type:'mesh',vertices:p.flatMap(([x,y])=>[x,y,0]),indices},m,[0,0,z],[1,1,1],[0,0,0],LABEL+label);r.parts.at(-1).castShadow=false;
}
function disk(r,m,x,y,radius,z,label){polygon(r,m,Array.from({length:32},(_,i)=>{const a=i*Math.PI/16;return[x+radius*Math.cos(a),y+radius*Math.sin(a)];}),z,label);}
function arc(r,m,x,y,inner,outer,a,b,z,label){for(let i=0;i<24;i++){const u=a+(b-a)*i/24,v=a+(b-a)*(i+1)/24;polygon(r,m,[[x+inner*Math.cos(u),y+inner*Math.sin(u)],[x+outer*Math.cos(u),y+outer*Math.sin(u)],[x+outer*Math.cos(v),y+outer*Math.sin(v)],[x+inner*Math.cos(v),y+inner*Math.sin(v)]],z,label);}}
function glyphLine(content){
 if(CACHE.has(content))return CACHE.get(content);
 const vertices=[],indices=[];let cursor=0,x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
 for(const ch of content){const g=COMMERCIAL_POSTER_GLYPHS[ch];if(!g)throw Error('Missing commercial poster glyph: '+ch);const base=vertices.length/3;for(let i=0;i<g.vertices.length;i+=3){let x=cursor+g.vertices[i],y=g.vertices[i+1];vertices.push(x,y,0);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}indices.push(...g.indices.map(i=>i+base));cursor+=g.advance+.075;}
 for(let i=0;i<vertices.length;i+=3){vertices[i]-=(x0+x1)/2;vertices[i+1]-=(y0+y1)/2;}
 const g={type:'mesh',vertices,indices};CACHE.set(content,g);return g;
}
function text(r,content,x,y,size,m='marble',z=.545){r.add(glyphLine(content),m,[x,y,z],[size,size,1],[0,0,0],LABEL+'text · '+content);r.parts.at(-1).castShadow=false;}
function mounting(r,d,fine){
 const {width:w,height:h}=d,xs=[-w*.38,0,w*.38],ys=[-h*.39,h*.39];
 for(const y of ys){
  box(r,'signDark',0,y,.26,w*.90,.16,.10,'continuous rear support rail');
  for(const x of xs){box(r,'signDark',x,y,.035,.34,.44,.13,'wall contact plate');box(r,'bronze',x,y,.17,.15,.18,.30,'attached wall-to-frame standoff');}
 }
 box(r,'signDark',0,0,.36,w,h,.24,'0.24m thick billboard cassette');
 box(r,d.theme==='city'?'greenBeam':'cctvSteel',0,0,.492,w-.22,h-.22,.024,'original solid color graphic field');
 // A real shallow perimeter lip retains the face without covering graphics.
 for(const x of[-w/2+.055,w/2-.055])box(r,'bronze',x,0,.497,.055,h-.04,.040,'restrained vertical metal frame');
 for(const y of[-h/2+.055,h/2-.055])box(r,'bronze',0,y,.497,w-.04,.055,.040,'restrained horizontal metal frame');
 if(fine)for(const x of xs)for(const y of ys)box(r,'bronze',x,y,.105,.10,.10,.018,'visible mounting pad fastener');
}
function cityDesign(r,fine){
 text(r,'原创广告',0,5.83,.34);
 text(r,'城市',0,3.96,2.56);
 text(r,'灵感',0,1.44,2.56);
 // An original architectural portal and rising disk, never a real product/logo.
 arc(r,'marble',0,-3.12,1.48,2.34,0,Math.PI,.521,'original sculptural portal arch');
 for(const x of[-1.91,1.91])box(r,'marble',x,-4.20,.521,.86,2.16,.012,'original sculptural portal leg');
 disk(r,'cctvSteel',0,-3.95,1.12,.526,'original blue sphere silhouette');
 disk(r,'vermilion',1.78,-1.40,.66,.531,'restrained coral sun accent');
 if(fine){box(r,'bronze',0,-5.34,.535,5.8,.055,.012,'graphic grounding rule');text(r,'慢享日常',0,-5.69,.32);}
 text(r,'风貌示意',0,-6.10,.27);
}
function lifeDesign(r,fine){
 // Left text / right abstract still-life, composed for a long upper stone band.
 box(r,'marble',-2.62,0,.516,10.24,3.98,.012,'warm white editorial field');
 text(r,'让生活发生',-2.62,.36,1.68,'signDark');
 if(fine)text(r,'慢享日常',-5.50,-1.18,.34,'greenBeam');
 text(r,'风貌示意',.79,-1.26,.27,'signDark');
 box(r,'vermilion',-6.28,1.52,.537,2.26,.095,.012,'restrained editorial accent');
 // Original lounge-chair and arch still life, not an existing product identity.
 disk(r,'greenBeam',5.21,.22,1.66,.521,'original still life background disk');
 arc(r,'marble',5.21,-.38,.89,1.28,0,Math.PI,.528,'original still life arch');
 for(const x of[4.125,6.295])box(r,'marble',x,-.83,.528,.39,.90,.012,'original still life arch pier');
 polygon(r,'marble',[[4.14,-1.31],[6.35,-1.31],[6.15,-.76],[4.34,-.76]],.535,'original sculptural bench');
 disk(r,'vermilion',6.87,1.20,.36,.537,'small coral still life sun');
 if(fine)box(r,'bronze',5.23,-1.64,.538,3.35,.045,.012,'still life grounding rule');
}
export function commercialPostersRecipe({quality='std'}={}){
 const site=CBD_CONTEXT_SITES.cwtc_mall_north,edges=footprintEdges(site.points),anchor=project(site.anchorWGS84),fine=quality!=='low';
 const out=new Recipe('Two original large CBD commercial wall posters',{buildings:0,quality,authored:true,noRealCampaignClaims:true,noRealTenancyClaims:true,noTextures:true,sourceFootprintUnchanged:true,existingWindowsUnchanged:true,existingEntrancesUnchanged:true,sourceId:site.osmId,sourceHostBaseY:.8,placements:[],materials:MATERIALS,font:{family:COMMERCIAL_POSTER_GLYPH_INFO.family,licenseURL:COMMERCIAL_POSTER_GLYPH_INFO.licenseURL,version:COMMERCIAL_POSTER_GLYPH_INFO.version},accuracy:'Original wall-mounted visual installation concept. Location, text, graphics, dimensions and hardware are illustrative, not surveyed actual advertising. Both panels carry 风貌示意. Not a structural engineering claim.'});
 for(const d of COMMERCIAL_POSTER_DEFINITIONS){
  const e=edges[d.edgeIndex],t=d.u/e.length,x=e.a[0]+(e.b[0]-e.a[0])*t,z=e.a[1]+(e.b[1]-e.a[1])*t,r=new Recipe(d.id);
  mounting(r,d,fine);if(d.theme==='city')cityDesign(r,fine);else lifeDesign(r,fine);
  out.merge(r,[anchor[0]+x,d.worldY,anchor[1]+z],e.rotation);
  out.metadata.placements.push({...d,sourceHostBaseY:.8,hostLocalHeightRange:[d.worldY-d.height/2-.8,d.worldY+d.height/2-.8],worldHeightRange:[d.worldY-d.height/2,d.worldY+d.height/2],hostWallRangeY:[8.8,28.3],edgeLength:e.length,edgeURange:[d.u-d.width/2,d.u+d.width/2],edgeRotationY:e.rotation,worldWallCenter:[anchor[0]+x,d.worldY,anchor[1]+z],worldFaceCenter:[anchor[0]+x+e.nx*.545,d.worldY,anchor[1]+z+e.nz*.545],frontNormal:[e.nx,0,e.nz],hardware:{wallContactRange:[-.03,.10],standoffRange:[.02,.32],rearRailRange:[.21,.31],caseRange:[.24,.48],faceMaxNormalOffset:.55,padCount:6,groundFootprint:false,lowestWorldY:d.worldY-d.height/2},disclaimer:'风貌示意',existingWindowTopWorldY:d.edgeIndex===4?21.15:null,minimumUpperWindowGap:d.edgeIndex===4?d.worldY-d.height/2-21.15:null,source:'https://www.openstreetmap.org/way/660651177'});
 }
 let triangles=0;for(const p of out.parts)triangles+=p.geometry.type==='box'?12:p.geometry.indices.length/3;
 out.metadata.geometryBudget={triangles,parts:out.parts.length,materials:[...new Set(out.parts.map(p=>p.material))],maximumTriangles:12000,maximumMaterialBatches:6};
 if(triangles>12000||out.metadata.geometryBudget.materials.length>6)throw Error('Commercial posters exceeded the agreed bounded budget.');
 out.metadata.qualityPolicy='Both qualities preserve both locations, connected support rails/cassettes, all main illustrations and title/disclaimer meshes. Low removes only tiny fasteners, secondary captions and hairline rules.';
 return out;
}
export function buildCommercialPosters(kit,options={}){
 if(typeof kit?.buildMergedRecipe!=='function')throw new TypeError('The existing architecture kit is required.');
 const recipe=commercialPostersRecipe(options);
 // Semantic color slots keep real title and background contrast in the reversible study.
 // Baseline colors are exact clones of the previous materials; no geometry changes.
 for(const [key,source]of Object.entries({posterCityField:'greenBeam',posterLifeEditorial:'marble',posterLifeTitle:'signDark'}))if(!kit.materials[key]){const m=kit.materials[source].clone();m.onBeforeCompile=kit.materials[source].onBeforeCompile;m.customProgramCacheKey=kit.materials[source].customProgramCacheKey;m.name='Beijing_'+key;kit.materials[key]=m;}
 for(const p of recipe.parts){if(p.label.endsWith('original solid color graphic field')&&p.material==='greenBeam')p.material='posterCityField';else if(p.label.endsWith('warm white editorial field'))p.material='posterLifeEditorial';else if(p.label.endsWith('text · 让生活发生'))p.material='posterLifeTitle';}
 recipe.metadata.semanticColorSlots=['posterCityField','posterLifeEditorial','posterLifeTitle'];recipe.metadata.materialBatchBudget=9;
 const group=kit.buildMergedRecipe(recipe,{castShadow:false});
 if(group.userData.architectureStats.drawCalls>9||group.userData.architectureStats.triangles>12000)throw Error('Merged commercial poster geometry budget exceeded.');
 return group;
}
