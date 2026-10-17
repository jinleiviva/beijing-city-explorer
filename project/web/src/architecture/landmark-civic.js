import {capitalMuseumRefined} from './capital-museum.js';
import{militaryMuseumRefined}from'./military-museum.js';
import {beijingExhibitionRefined} from './exhibition-center.js';
import {Recipe,HIP_ROOF,annulusGeometry,beam} from './geometry.js';
import {traditionalRoof} from './buildings.js';
import {windowGrid,stairs,portico,star,flagpole} from './landmark-utils.js';

function greatHall(o) {
  const r=new Recipe('人民大会堂 · Great Hall of the People');
  r.box('stone',0,2,0,336,4,206,'broad national assembly base');
  r.box('stoneLight',0,21,-9,330,38,174,'long symmetrical assembly wings');
  r.box('stone',0,41.2,-12,146,10.4,118,'central auditorium roof volume');
  r.box('stoneLight',0,41,82,98,3,25,'central grand portico roof');
  r.box('stoneDark',0,43.2,82,104,1.4,28,'portico projecting roof slab');
  r.box('glassDark',0,19.5,79,89,30,.3,'main east entrance glazing');
  portico(r,{width:86,height:31,z:98,y:5,columns:12,depth:24});
  for(const x of [-116,116])windowGrid(r,{width:108,height:25,x,z:78.2,y:8,columns:19,rows:4,detail:o.detail});
  for(const x of [-158,158])r.box('stone',x,22,85,13,38,24,'end pavilion');
  stairs(r,103,103,5,19,9);
  r.cylinder('roofGoldLight',0,39,111,2.4,.3,'national emblem abstraction',24);
  if(o.detail>0)for(let i=0;i<12;i++)flagpole(r,-43+i*86/11,43.9,91,6);
  return r;
}

function nationalMuseum(o) {
  const r=new Recipe('中国国家博物馆 · National Museum of China');
  r.box('stone',0,1.8,0,314,3.6,150,'museum base');
  r.box('stoneLight',0,18,-8,310,32.4,134,'long museum galleries');
  for(const x of [-130,130]) {
    r.box('stone',x,20.3,62,42,37,25,'broad end pavilion');
    r.box('stoneLight',x,39.1,62,45,1.2,28,'end pavilion cornice');
  }
  r.box('glassDark',0,18,61.2,208,28,.3,'west entrance glazed gallery');
  // A fine rectilinear screen, visually distinct from the Great Hall's round columns.
  portico(r,{width:207,height:28,z:74,y:5,columns:34,depth:16,round:false});
  for(const x of [-72,72])r.box('stoneLight',x,18.4,81,1.3,28,1.4,'forward ceremonial pier');
  r.box('stoneDark',0,35.5,66,226,1,26,'low sweeping west cornice');
  windowGrid(r,{width:270,height:18,z:-75.2,y:12,columns:45,rows:3,detail:o.detail});
  stairs(r,220,83,5,17,9);
  if(o.detail>0)for(let i=0;i<13;i++)flagpole(r,-90+i*15,36,65,5);
  return r;
}

function maoMausoleum(o) {
  const r=new Recipe('毛主席纪念堂 · Chairman Mao Memorial Hall');
  r.box('stoneLight',0,2,0,116,4,109,'granite ceremonial terrace');
  r.box('stone',0,15.5,0,85,27,82,'square memorial chamber');
  r.box('window',0,15,41.15,68,22,.2,'deep recessed entrance glazing');
  for(let side=0;side<4;side++)for(let i=0;i<11;i++) {
    const a=side*Math.PI/2,u=-46+i*9.2;
    const x=u*Math.cos(a)+47*Math.sin(a),z=-u*Math.sin(a)+47*Math.cos(a);
    r.box('stoneLight',x,16,z,1.9,24,1.9,'perimeter granite column');
  }
  r.box('stoneLight',0,28.5,0,106,2,103,'lower overhanging roof fascia');
  r.box('roofGrey',0,29.8,0,108,.6,105,'lower flat roof');
  r.box('stone',0,30.8,0,81,2,78,'upper memorial clerestory');
  r.box('roofGrey',0,33.2,0,89,.8,86,'upper hovering roof');
  r.box('stoneLight',0,27,51.7,18,2.3,.2,'memorial inscription tablet');
  stairs(r,56,55,4,13,8);
  return r;
}

const capitalMuseum=capitalMuseumRefined;

function nationalLibrary(o) {
  const r=new Recipe('国家图书馆总馆北区 · National Library North Building'),far=o.lod==='silhouette';
  // The architect explicitly distinguishes the low podium, clear middle hall and
  // floating digital-library roof. Main height27m is published by the Ministry.
  r.box('stoneLight',0,.35,0,142.8,.7,124.8,'library site plinth');
  // Two low entrance wings leave an open, sunken central stair approach.
  for(const x of [-43,43])r.box('stoneDark',x,4.35,12,45,8,100,'low entrance courtyard side block');
  r.box('stoneDark',0,4.35,-38,130,8,28,'low rear reading-room volume');
  r.box('glassDark',0,12.0,-3,103,7.4,81,'recessed transparent middle hall');
  r.box('glassPale',0,15.9,0,91,.4,73,'glazed central reading court rooflight');
  for(const z of [-49.4,49.4])r.box('metal',0,22,z,142.8,10,25.4,'floating bookcase front and rear volume');
  for(const x of [-58.7,58.7])r.box('metal',x,22,0,25.4,10,73.4,'floating bookcase side volume');
  for(const z of [-62.2,62.2]) {
    r.box('glassPale',0,22,z,137.8,7.6,.18,'wide upper reading-room glazing');
    r.box('silverFacade',0,26.7,z,140.8,.6,.5,'floating bookcase upper silver frame');
    r.box('silverFacade',0,17.3,z,140.8,.6,.5,'floating bookcase lower silver frame');
    for(const x of [-70.5,70.5])r.box('silverFacade',x,22,z,.6,9.4,.5,'floating bookcase end silver frame');
    if(!far) {
      for(let i=0;i<=35;i++)r.box('glassMullion',-68+i*136/35,22,z+.12,.15,7.7,.22,'fine library glazing mullion');
      for(const y of [19.5,22.0,24.5])r.box('silverFacade',0,y,z+.15,137.8,.14,.20,'fine library horizontal mullion');
    }
  }
  // The large outward-inclined concrete brackets are visible in the real gap.
  for(const side of [-1,1])for(const u of [-45,-20,20,45]) {
    beam(r,'metal',[u,8.4,side*41],[u,17,side*54],1.4,'exposed inclined cantilever support');
    const part=r.parts.at(-1);part.geometry={type:'box'};part.scale[0]=2.8;part.scale[2]=2.6;
  }
  for(const side of [-1,1])for(const z of [-25,25]) {
    beam(r,'metal',[side*48,8.4,z],[side*63,17,z],1.4,'side inclined cantilever support');
    const part=r.parts.at(-1);part.geometry={type:'box'};part.scale[0]=2.8;part.scale[2]=2.6;
  }
  for(const x of [-43,43]) {
    r.box('glassDark',x,4.5,62.15,42,6.8,.18,'low entrance-wing glazing behind louvers');
    const count=far?5:13;
    for(let i=0;i<count;i++)r.box('metalDark',x,1.3+i*6.4/(count-1),62.4,42,.19,.55,'low stone-wing horizontal louver');
  }
  for(const side of [-1,1]) {
    if(!far)for(let i=0;i<18;i++)for(let j=0;j<2;j++)r.box('glass',side*71.5,20+j*4,-51+i*102/17,.15,1.3,2.3,'small side bookcase window');
  }
  r.box('glassPale',0,4.5,23,36,7.4,.3,'central recessed entrance glazing');
  stairs(r,36,62,3.6,32,12);
  r.metadata.reference='https://www.ksp-engel.com/en/projekte/chinesische-nationalbibliothek';
  r.metadata.heightSource='https://www.mct.gov.cn/whzx/tpxw/200807/t20080722_828617.htm';
  r.metadata.approximation='Overall mapped envelope and27m height grounded; courtyard, structural bracket spacing and facade dimensions photo-informed';
  return r;
}

function beijingExhibition(o) {
  const r=new Recipe('北京展览馆 · Beijing Exhibition Center');
  r.box('stone',0,1.5,0,328,3,118,'exhibition centre base');
  for(const side of [-1,1]) {
    r.box('stoneLight',side*95,10,-8,140,20,75,'low symmetrical exhibition wing');
    windowGrid(r,{width:134,height:12,x:side*95,z:29.7,y:4,columns:22,rows:2,detail:o.detail});
    for(let i=0;i<16;i++)r.cylinder('stoneLight',side*(33+i*8.7),10,41,1,18,'wing colonnade',10);
    r.box('stone',side*99,20.7,36,142,1.4,18,'wing projecting entablature');
  }
  r.cylinder('stoneLight',0,18,0,29,36,'central rotunda',64);
  r.cylinder('stone',0,37,0,27,2,'rotunda cornice',64);
  r.cylinder('stoneLight',0,43,0,18,10,'upper octagonal drum',8);
  r.cylinder('roofGold',0,50,0,19,4,'gilded tier cornice',8,.8);
  r.cylinder('stoneLight',0,57,0,10.2,10,'lantern drum',8);
  r.cylinder('roofGold',0,64,0,11,4,'lantern gilded cupola',16,.16);
  r.cylinder('roofGoldLight',0,81.5,0,1.9,33,'long gilded spire',12,.06);
  star(r,0,100,0,2,'roofGoldLight');
  portico(r,{width:43,z:32,y:3,height:25,columns:8,depth:11});
  stairs(r,58,44,3,16,7);
  return r;
}

const militaryMuseum=militaryMuseumRefined;

function nationalArtMuseum(o) {
  const r=new Recipe('中国美术馆 · National Art Museum of China');
  r.box('stoneLight',0,1.4,0,164,2.8,65,'art museum plinth');
  r.box('stoneLight',0,11.8,0,152,20.8,54,'national-style gallery facade');
  r.box('stone',0,18.8,0,53,9,42,'raised central gallery');
  windowGrid(r,{width:144,height:13,z:27.2,y:5,columns:31,rows:3,detail:o.detail});
  traditionalRoof(r,63,53,23.3,2.5,'roofGold',o.detail,true);
  for(const side of [-1,1]) {
    const wing=new Recipe('art gallery roof');traditionalRoof(wing,52,52,22.2,3.1,'roofGold',Math.min(o.detail,1),true);r.merge(wing,[side*53,0,0]);
  }
  r.box('stoneLight',0,4.1,29,44,3,4,'central entrance terrace');
  for(let i=0;i<7;i++)r.box('stoneLight',-15+i*5,11,29,1.2,13,1.3,'entrance stone pier');
  stairs(r,47,33,2.8,11,7);
  return r;
}

export function registerCivicLandmarks(register) {
  register('great_hall','人民大会堂',46.5,greatHall);
  register('national_museum','中国国家博物馆',40,nationalMuseum);
  register('mao_mausoleum','毛主席纪念堂',33.6,maoMausoleum);
  register('capital_museum','首都博物馆',40,capitalMuseum);
  register('national_library','国家图书馆总馆北区',27,nationalLibrary);
  register('beijing_exhibition','北京展览馆',102,beijingExhibitionRefined);
  register('military_museum','中国人民革命军事博物馆',94.7,militaryMuseum);
  register('national_art_museum','中国美术馆',26,nationalArtMuseum);
}
