/** Photographed Qianmen / Dashilan / Liulichang street-wall typologies. Not surveyed individual shops. */
import {Recipe,GABLE_ROOF,HIP_ROOF,seededRandom,beam,loftGeometry} from './geometry.js';
import {polygonPrism} from './site-massing.js';
const SOURCES={qianmen:'https://commons.wikimedia.org/wiki/File:Qianmen_Dajie_View1_2010.jpg',dashilan:'https://commons.wikimedia.org/wiki/File:Dashala_Enterance_2010.jpg',liulichang:'https://commons.wikimedia.org/wiki/File:Liulichang_East_St_during_Changdian_Temple_Fair_(20240210144753).jpg'};
function setup(family,o,defaults){const w=Math.max(4,o.width??defaults[0]),d=Math.max(6,o.depth??defaults[1]),h=Math.max(family==='qianmen_shop'?7:5,o.height??defaults[2]),seed=o.seed??1,random=seededRandom(seed),v=(o.variant??Math.floor(random()*4))%4,far=o.lod==='silhouette'||o.detail===-1,detail=far?0:Math.max(0,Math.min(2,o.detail??1));return{r:new Recipe(family,{family,width:w,depth:d,height:h,seed,variant:v,detail,lod:far?'silhouette':'detailed',approx:true,frontFacing:'+Z south before street alignment',signPanels:[],lanternHooks:[],placementAccuracy:'Typological illustrative shop module. Place along an actual street; individual shop footprint, tenant and facade not surveyed'}),w,d,h,v,far,detail};}
function panelShape(r,points,material,x,y,z,depth,label){r.add(polygonPrism(points.map(([u,v])=>[u,-v]),-depth/2,depth/2),material,[x,y,z],[1,1,1],[Math.PI/2,0,0],label);}
function archWindow(r,x,bottom,z,w,h,material='shopGlass'){const radius=w/2,straight=h-radius,p=[[-radius,0],[radius,0],[radius,straight]];for(let i=1;i<=10;i++){const a=i*Math.PI/10;p.push([Math.cos(a)*radius,straight+Math.sin(a)*radius]);}panelShape(r,p,material,x,bottom,z,.12,'tall round-headed commercial window');}
function frame(r,x,y,z,w,h,mat='stoneLight',th=.16){for(const a of[-1,1]){r.box(mat,x+a*w/2,y,z,th,h+th,.18,'shop window surround');r.box(mat,x,y+a*h/2,z,w+th,th,.18,'shop window sill and lintel');}}
function sign(r,x,y,z,w,h,mat='signDark'){r.box(mat,x,y,z,w,h,.13,'blank historic shop signboard');r.metadata.signPanels.push({position:[x,y,z+.09],width:w-.10,height:h-.08,rotation:[0,0,0],normal:[0,0,1]});}

/** Street-edge roof treatment for retained mapped volumes. Anchor positions stay
 * in the additive facade selector's front 1.05m, while geometry returns inward.
 * It dresses only a shallow roof strip; it never replaces or stretches the body.
 */
const BACKWARD_BOX=loftGeometry([{y:-.5,points:[[-.5,-1],[.5,-1],[.5,0],[-.5,0]]},{y:.5,points:[[-.5,-1],[.5,-1],[.5,0],[-.5,0]]}]);
function mappedRoofEdge(r,o,w,d,h,v) {
 const front=d/2,reach=Math.min(3.4,d*.42),anchor=front-.08;
 // Approximate shallow slate/tile weathering strip above the existing mapped roof.
 r.add(BACKWARD_BOX,'roofGrey',[0,h+.02,anchor],[w-.10,.12,reach],[0,0,0],'additive dark roof-edge weathering strip');
 r.box('stoneLight',0,h+.02,front+.04,w+.06,.18,.38,'additive continuous roofline pale coping');
 for(const side of[-1,1])r.add(BACKWARD_BOX,'stoneLight',[side*(w/2-.12),h+.02,anchor],[.20,.20,reach],[0,0,0],'additive short party-wall coping return');
 if(v===0){
  const p=[[-w*.34,0],[w*.34,0],[w*.34,.32],[w*.20,.32],[w*.20,.64],[-w*.20,.64],[-w*.20,.32],[-w*.34,.32]];
  panelShape(r,p,'stoneLight',0,h+.02,front+.04,.29,'additive stepped roofline attic above mapped volume');
 }else if(v===1){
  const p=[[-w*.30,0],[w*.30,0],[0,.72]];panelShape(r,p,'stoneLight',0,h+.02,front+.04,.28,'additive low classical pediment above mapped volume');
 }else if(v===2){
  // Full-width triangular gable remains shallow, within the actual mapped edge.
  panelShape(r,[[-w*.48,0],[w*.48,0],[0,.96]],'greyBrick',0,h+.02,front+.04,.30,'additive shallow grey triangular roofline gable');
 }else{
  const p=[[-w*.32,0],[w*.32,0],[w*.32,.22],[w*.18,.22],[w*.12,.50],[0,.61],[-w*.12,.50],[-w*.18,.22],[-w*.32,.22]];
  panelShape(r,p,'stoneLight',0,h+.02,front+.04,.27,'additive curved roofline attic above mapped volume');
 }
 r.metadata.additiveRoofTreatment={sourceId:o.sourceId,scope:'Only shallow front roof strip, parapet and short inward party-wall coping. Original mapped volume remains.',inwardDepthMetres:reach,maximumApproximateAdditionMetres:v===2?.98:v===1?.74:v===0?.66:.63,accuracy:'Photo-informed Qianmen roofline vocabulary; individual rooftop and attic not surveyed'};
}

export function qianmenShop(o={}) {
 const{r,w,d,h,v,far,detail}=setup('qianmen_shop',o,[8.8,12,11.2]),front=d/2,roofBase=h-(v===2?1.8:1.1),ground=Math.min(4.6,roofBase*.48),upper=(ground+roofBase)/2,wall=v===1?'stoneLight':v===3?'stuccoPale':'greyBrick';
 r.box(wall,0,roofBase/2,-.35,w,roofBase,d-.7,'two-storey Republican-era masonry shop volume');
 r.box('stoneDark',0,.18,0,w+.06,.36,d+.06,'continuous commercial stone footing');
 if(!far) {
  const cols=w<7?2:3,bw=(w-.8)/cols;
  for(let i=0;i<cols;i++) {
   const x=-(w-.8)/2+(i+.5)*bw;
   if(v===0||v===3)archWindow(r,x,.38,front-.10,bw-.30,ground-1.0);
   else r.box('shopGlass',x,ground*.46,front-.10,bw-.30,ground*.76,.14,'large recessed street shop opening');
   r.box('paintedWood',x,ground*.43,front+.03,.07,ground*.72,.12,'fine timber ground-window mullion');
   const uh=roofBase-ground-1.15;
   r.box('shopGlass',x,upper-.05,front-.10,bw*.72,uh,.14,'tall upper commercial sash glazing');
   frame(r,x,upper-.05,front+.02,bw*.75,uh+.12,v===1?'paintedWood':'stoneLight',.15);
   r.box('paintedWood',x,upper-.05,front+.12,.07,uh,.10,'fine upper shop sash mullion');
   r.box('paintedWood',x,upper-.05,front+.12,bw*.72,.07,.10,'fine upper shop sash mullion');
   r.box('stoneLight',x,upper-uh/2-.24,front+.15,bw*.90,.20,.42,'projecting upper stone window sill');
  }
  for(let i=0;i<=cols;i++)r.box('stoneLight',-(w-.8)/2+i*bw,roofBase/2,front+.07,.38,roofBase,.44,'slender two-storey masonry pilaster');
  const signWidth=Math.min(w*.80,7.5);sign(r,0,ground-.12,front+.20,signWidth,.72,v===1?'vermilionDark':'signDark');
  r.box('stoneLight',0,ground+.49,front+.23,w+.15,.28,.75,'projecting storefront floor cornice');
  r.box('stoneLight',0,.10,front+.32,w*.44,.20,.62,'shallow continuous commercial doorstep');
  if(v===1) {
   r.box('metalDark',0,ground-.78,front+.82,w*.80,.18,1.65,'slim urban shop entrance rain canopy');
   for(const x of[-w*.34,w*.34])r.box('paintedWood',x,upper,front+.42,.13,roofBase-ground-.4,.12,'upper gallery timber post');
  }
  if(detail>0)for(let j=0;j<Math.floor(roofBase/.45);j++)r.box('greyBrickDark',0,.6+j*.45,front-.01,w-.35,.018,.025,'fine historic masonry horizontal mortar joint');
 }
 r.box('stoneLight',0,roofBase-.13,front+.14,w+.34,.30,.66,'deep pale classical roof cornice');
 // Four genuinely different parapet/gable silhouettes; low roof stays mostly hidden.
 if(v===0) {
  r.add(GABLE_ROOF,'roofGrey',[0,roofBase-.15,-.45],[w-.3,.70,d-.4],[0,0,0],'low tiled roof behind stepped shop parapet');
  r.box(wall,0,roofBase+.28,front-.05,w,.65,.36,'low flat facade parapet');
  r.box(wall,0,roofBase+.70,front-.05,w*.47,.40,.36,'raised middle parapet panel');
  r.box('stoneLight',0,roofBase+.94,front-.05,w*.50,.12,.49,'raised parapet coping');
  for(const x of[-w*.38,w*.38])r.box('stoneLight',x,roofBase+.64,front-.05,w*.24,.12,.49,'lower parapet coping');
 } else if(v===1) {
  r.add(HIP_ROOF,'roofGrey',[0,roofBase-.05,0],[w+.50,1.05,d+.4],[0,0,0],'shallow hipped roof above pale urban shop');
  r.box('stoneLight',0,roofBase+.34,front+.05,w*.67,.55,.45,'central pale facade attic');
 } else if(v===2) {
  r.add(GABLE_ROOF,'roofGrey',[0,roofBase,0],[d+.2,1.8,w+.12],[0,Math.PI/2,0],'front-gabled urban shop roof');
  panelShape(r,[[-w/2,0],[w/2,0],[0,1.75]],wall,0,roofBase,front+.12,.3,'large street-facing triangular masonry gable');
  for(const side of[-1,1]){beam(r,'stoneLight',[side*w/2,roofBase,front+.3],[0,roofBase+1.75,front+.3],.12,'pale triangular gable coping');const p=r.parts.at(-1);p.geometry={type:'box'};p.scale[0]=.22;p.scale[2]=.25;}
 } else {
  r.box('roofGrey',0,roofBase-.12,0,w,.24,d,'flat urban roof behind ornamental gable');
  const p=[[-w/2,0],[w/2,0],[w/2,.35],[w*.27,.35],[w*.23,.7],[w*.15,.95],[0,1.10],[-w*.15,.95],[-w*.23,.7],[-w*.27,.35],[-w/2,.35]];
  panelShape(r,p,wall,0,roofBase,front,.4,'curved central Baroque-inspired urban parapet');
  if(!far)r.box('stoneLight',0,roofBase+.43,front+.24,w*.31,.18,.14,'small ornamental parapet tablet');
 }
 if(o.sourceId&&o.additiveRoofTreatment!==false)mappedRoofEdge(r,o,w,d,h,v);
 r.metadata.sourceReferences=[SOURCES.qianmen,SOURCES.dashilan];r.metadata.usage='Qianmen/Dashilan short historic commercial street walls, generally2storeys. Do not use for residential hutong alleys or entire modern shopping centres.';
 return r;
}

export function liulichangShop(o={}) {
 const{r,w,d,h,v,far,detail}=setup('liulichang_shop',o,[8,11,7.5]),front=d/2,rise=Math.min(2.5,h*.31),wallH=h-rise,porch=.85,cols=w<7?3:4,bw=(w-.7)/cols;
 r.box('greyBrick',0,wallH/2,-porch/2,w,wallH,d-porch,'high grey-brick antique shop hall');
 r.box('stoneDark',0,.18,0,w+.08,.36,d+.08,'raised antique-shop stone footing');
 if(!far) {
  r.box('shopGlass',0,wallH*.40,front-porch,w-.6,wallH*.72,.10,'deep recessed antique storefront glazing');
  for(let i=0;i<=cols;i++) {
   const x=-(w-.7)/2+i*bw;r.box(v===2?'paintedWood':'vermilionDark',x,wallH*.48,front-.03,.18,wallH*.96,.22,'open timber shopfront colonnade');r.box('stoneLight',x,.3,front-.03,.28,.34,.3,'small column stone base');
  }
  for(let i=0;i<cols;i++) {
   const x=-(w-.7)/2+(i+.5)*bw,door=i===Math.floor(cols/2),height=wallH*.51,cy=wallH*.39;
   if(!door){r.box('paintedWood',x,.60,front-.53,bw-.15,.72,.12,'antique shop lower timber panel');frame(r,x,cy,front-.48,bw-.19,height,'vermilionDark',.10);for(let j=1;j<4;j++)r.box('greenBeam',x-bw*.45+j*bw*.9/4,cy,front-.42,.06,height,.10,'fine antique wooden window lattice');for(const y of[cy-height*.24,cy+height*.24])r.box('greenBeam',x,y,front-.42,bw-.2,.06,.10,'fine antique wooden window lattice');}
   else {r.box('paintedWood',x,.36,front-.50,bw-.1,.13,.4,'raised antique entrance threshold');r.box('stoneLight',x,.14,front+.28,bw+.25,.28,.75,'antique entrance single stone step');}
   // Tall decorative green/red square transom panels, observed in2024 Liulichang photo.
   const py=wallH-.89;r.box('greenBeam',x,py,front-.05,bw-.10,.67,.18,'painted green antique-shop transom');frame(r,x,py,front+.07,bw-.24,.51,'bronze',.045);r.box('vermilion',x,py,front+.10,bw*.30,.27,.045,'abstract red inset transom panel');
  }
  sign(r,0,wallH-.18,front+.08,w*.68,.56,v===2?'signDark':'greenBeam');
  r.box('greenBeam',0,wallH+.16,front+.12,w+.16,.25,.45,'broad painted antique-shop entablature');
  for(let i=0;i<=cols;i++){const x=-(w-.7)/2+i*bw;r.box('greenBeam',x,wallH+.12,front+.42,.42,.26,.8,'projecting timber eave bracket');r.box('vermilionDark',x,wallH+.27,front+.46,.64,.14,.52,'crosswise painted eave bracket');}
 }
 const roof=v===1?HIP_ROOF:GABLE_ROOF;
 r.add(roof,'roofGrey',[0,wallH,0],[w+.50,rise,d+1.45],[0,0,0],'high projecting grey-tile antique-shop roof');
 r.box('paintedWood',0,wallH-.06,front+.62,w+.40,.18,.24,'deep continuous dark timber eave fascia');
 r.box('roofGreyRidge',0,h+.06,0,w*.96,.12,.20,'antique shop grey ridge');
 // Exposed grey masonry party-gables are part of the street rhythm, not freestanding walls.
 if(v===0||v===3)for(const side of[-1,1]) {
  const g=new Recipe('raised hard-gable shop party wall');
  panelShape(g,[[-d/2,0],[d/2,0],[d/2,.14],[d*.25,rise*.48+.12],[0,rise+.16],[-d*.25,rise*.48+.12],[-d/2,.14]],'greyBrick',0,wallH,0,.27,'raised shaped grey-brick party gable');
  r.merge(g,[side*(w/2-.04),0,0],Math.PI/2);
 }
 if(!far&&detail>0) {
  const n=Math.min(18,Math.round(w/.45));
  for(let i=0;i<=n;i++)for(const side of[-1,1]){const x=-w*.48+i*w*.96/n;for(const[a,b]of[[[x,h+.025,0],[x,wallH+rise*.48,side*(d+1.45)*.20]],[[x,wallH+rise*.48,side*(d+1.45)*.20],[x,wallH+rise*.08+.025,side*(d+1.45)*.5]]]){beam(r,'roofGreyLight',a,b,.025,'fine antique roof tile roll');const p=r.parts.at(-1);p.geometry={type:'box'};p.scale[0]=.05;p.scale[2]=.05;}}
  for(const side of[-1,1])r.metadata.lanternHooks.push({position:[side*w*.38,wallH-.32,front+.70],radius:.25,seasonal:true});
 }
 r.metadata.sourceReferences=[SOURCES.liulichang];r.metadata.usage='Liulichang art/antique shops with high eaves, painted transoms and a shallow porch. Festival lanterns/flags from2024 photo are optional seasonal objects, not permanent building fabric.';
 return r;
}
