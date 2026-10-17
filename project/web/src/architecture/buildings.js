import {oldtownStreetfront,OLDTOWN_STREETFRONT_DEFAULTS} from './oldtown-streetfront.js';
import {peoplesHeroesMonument} from './peoples-heroes-monument.js';
import{beihaiNorthGallery}from'./beihai-gallery.js';
import{agricultureSideHall}from'./agriculture-side-hall.js';
import{lamaFalunHall}from'./lama-falun-hall.js';
import{heritageHall}from'./heritage-hall.js';
import {tvccContext} from './tvcc-context.js';
import{smallCourtyard}from'./small-courtyard.js';
import{sidePavilion}from'./side-pavilion.js';
import {qianmenShop,liulichangShop} from './historic-commerce.js';
import { Recipe, CHAMFER_BOX, GABLE_ROOF, HIP_ROOF, seededRandom, beam } from './geometry.js';
import { heritageShop } from './heritage-shop.js';
import { xindibai } from './xindibai.js';
import {cwtcMallNorth,hanweiPlaza,kerryMallHotel,CBD_CONTEXT_SITES} from './cbd-context.js';
import {wangfujingApm,wangfujingWestWall,sanlitunS2} from './street-corner.js';
import {contemporaryCbd,contemporaryFinancial,contemporaryCommercial} from './modern-commerce.js';

export const BUILDING_FAMILIES = ['oldtown_streetfront','peoples_heroes_monument','cbd','financial','commercial','sanlitun','hutong','slab','tower','palace','paifang','gray_tile_wing','heritage_shop','xindibai','cwtc_mall_north','hanwei_plaza','kerry_mall_hotel','wangfujing_apm','wangfujing_west_wall','sanlitun_s2','qianmen_shop','liulichang_shop','side_pavilion','tvcc_context','lama_falun_hall','heritage_hall','beihai_north_gallery','agriculture_side_hall'];

export const BUILDING_DEFAULTS = Object.freeze({
  oldtown_streetfront:OLDTOWN_STREETFRONT_DEFAULTS,
  peoples_heroes_monument:{width:57.6,depth:68.6,height:37.94},
  beihai_north_gallery:{width:173.5,depth:47.3,height:8.35},
  agriculture_side_hall:{width:48.13,depth:140.26,height:18.8},
  lama_falun_hall:{width:36.19,depth:29.65,height:17.4},
  heritage_hall:{width:18.2,depth:10.3,height:10.2},
  tvcc_context:{width:CBD_CONTEXT_SITES.tvcc_context.width,depth:CBD_CONTEXT_SITES.tvcc_context.depth,height:159},
  cbd:{width:44,depth:42,height:160}, financial:{width:52,depth:35,height:90},
  commercial:{width:72,depth:45,height:26}, sanlitun:{width:38,depth:30,height:17},
  hutong:{width:28,depth:32,height:6}, slab:{width:54,depth:15,height:26},
  tower:{width:27,depth:25,height:72}, palace:{width:42,depth:24,height:22},
  paifang:{width:18,depth:5,height:15},
  gray_tile_wing:{width:30,depth:9,height:6},
  heritage_shop:{width:6.8,depth:8.6,height:5.3},
  xindibai:{width:60,depth:85,height:19.5},
  cwtc_mall_north:{width:60.1484,depth:56.9511,height:27.5},
  hanwei_plaza:{width:122.6195,depth:69.8975,height:100},
  kerry_mall_hotel:{width:157.2876,depth:83.6121,height:84},
  wangfujing_apm:{width:108.052,depth:367.0092,height:47},
  wangfujing_west_wall:{width:58.193,depth:57.708,height:28},
  sanlitun_s2:{width:83.8697,depth:26.0822,height:15.5},
  qianmen_shop:{width:8.8,depth:12,height:11.2},
  liulichang_shop:{width:8,depth:11,height:7.5},
  side_pavilion:{width:11.5,depth:11.5,height:12.1},
});

export function detailLevel(value) {
  return value==='low'?0:value==='high'?2:value==='medium'?1:Math.max(0,Math.min(2,value??1));
}

function settings(family,options={}) {
  const d=BUILDING_DEFAULTS[family]||BUILDING_DEFAULTS.slab;
  return {...d,...options,width:Math.max(4,options.width??d.width),depth:Math.max(3,options.depth??d.depth),height:Math.max(3,options.height??d.height),detail:detailLevel(options.detail),rng:seededRandom(options.seed??1)};
}

function facade(recipe,{w,d,h,x=0,y=0,z=0,material='window',floorHeight=3.6,columns=8,detail=1,inset=0.08,trim='stone',vertical=true}) {
  const floorCount=Math.max(1,Math.floor(h/floorHeight)),floor=h/floorCount;
  // Dark recessed curtain walls remain recognizable when individual windows are culled.
  recipe.box(material,x,y+h/2,z+d/2+inset,w*.92,h*.9,.16,'south glazing');
  recipe.box(material,x,y+h/2,z-d/2-inset,w*.92,h*.9,.16,'north glazing');
  recipe.box(material,x+w/2+inset,y+h/2,z,.16,h*.9,d*.92,'east glazing');
  recipe.box(material,x-w/2-inset,y+h/2,z,.16,h*.9,d*.92,'west glazing');
  if(detail===0) {
    for(let i=1;i<4;i++) recipe.box(trim,x,y+i*h/4,z,w+0.3,.42,d+.3,'horizontal articulation');
    return;
  }
  const step=detail===2?1:Math.max(1,Math.ceil(floorCount/11));
  for(let i=1;i<floorCount;i+=step) {
    const yy=y+i*floor;
    recipe.box(trim,x,yy,z+d/2+.19,w+.25,.34,.38,'south spandrel');
    recipe.box(trim,x,yy,z-d/2-.19,w+.25,.34,.38,'north spandrel');
    recipe.box(trim,x+w/2+.19,yy,z,.38,.34,d+.25,'east spandrel');
    recipe.box(trim,x-w/2-.19,yy,z,.38,.34,d+.25,'west spandrel');
  }
  if(vertical) {
    const cols=Math.max(3,Math.min(detail===2?24:10,columns));
    for(let i=0;i<=cols;i++) {
      const xx=x-w*.46+i*w*.92/cols;
      recipe.box(trim,xx,y+h/2,z+d/2+.21,.35,h,.5,'south mullion');
      recipe.box(trim,xx,y+h/2,z-d/2-.21,.35,h,.5,'north mullion');
    }
    const sideCols=Math.max(3,Math.round(cols*d/w));
    for(let i=0;i<=sideCols;i++) {
      const zz=z-d*.46+i*d*.92/sideCols;
      recipe.box(trim,x+w/2+.21,y+h/2,zz,.5,h,.35,'east mullion');
      recipe.box(trim,x-w/2-.21,y+h/2,zz,.5,h,.35,'west mullion');
    }
  }
}

function parapet(r,w,d,y,material='stone',height=.65) {
  r.box(material,0,y+height/2,d/2,w,height,.4,'south parapet');
  r.box(material,0,y+height/2,-d/2,w,height,.4,'north parapet');
  r.box(material,w/2,y+height/2,0,.4,height,d,'east parapet');
  r.box(material,-w/2,y+height/2,0,.4,height,d,'west parapet');
}

function rooftop(r,w,d,y,random,detail=1) {
  r.box('concrete',0,y+.65,0,w*.26,1.3,d*.3,'mechanical penthouse');
  r.box('metalDark',0,y+1.4,0,w*.29,.25,d*.34,'penthouse coping');
  if(detail>0) for(let i=0;i<3;i++) {
    const x=-w*.3+i*w*.14,z=-d*.24;
    r.box('metal',x,y+.55,z,w*.085,1.1,d*.12,'HVAC unit');
    r.cylinder('metalDark',x,y+1.16,z,Math.min(w,d)*.029,.12,'fan',8);
  }
  if(detail===2) {
    r.cylinder('metal',w*.22,y+2,-d*.18,.1,4,'antenna mast',6);
    r.box('metal',w*.22,y+3.1,-d*.18,1.8,.12,.12,'antenna');
    for(let i=0;i<2;i++) r.box('solar',-w*.18+i*w*.21,y+.5,d*.3,w*.16,.1,d*.12,'solar panel');
  }
}

function shopfront(r,w,d,y=0,detail=1,material='stoneLight',seed=1) {
  const bays=Math.max(3,Math.round(w/6)),bw=w/bays;
  r.box('glassDark',0,y+2.3,d/2+.12,w-1,4.2,.2,'streetfront shop glazing');
  for(let i=0;i<bays;i++) {
    const x=-w/2+bw*(i+.5);
    r.box(material,x+bw/2-.15,y+2.2,d/2+.25,.3,4.5,.55,'shop pier');
    r.box(i%3===seed%3?'awning':'vermilionDark',x,y+4.65,d/2+.32,bw-.4,.7,.24,'shop sign backing');
    if(detail>0) {
      r.box('sign',x,y+4.65,d/2+.47,bw*.5,.16,.06,'sign graphic');
      r.box('metal',x,y+2.0,d/2+.28,.12,3.7,.15,'shop door stile');
    }
    if(detail===2&&i%3===0) r.box('awning',x,y+3.5,d/2+1.2,bw*.8,.15,2.4,'canvas awning');
  }
}

function cbd(options) {
  const o=settings('cbd',options),{width:w,depth:d,height:h,detail,rng}=o;
  const r=new Recipe('CBD curtain-wall tower',{family:'cbd',...dimensions(o)});
  const variant=(o.variant??Math.floor(rng()*4))%4,podiumH=Math.min(13,h*.15);
  r.add(CHAMFER_BOX,'stoneLight',[0,podiumH/2,0],[w*1.18,podiumH,d*1.15],[0,0,0],'stone podium');
  facade(r,{w:w*1.18,d:d*1.15,h:podiumH*.8,y:.3,material:'glassDark',detail:0,trim:'stoneLight'});
  const top=h-5,bodyH=top-podiumH;
  if(variant===0||variant===3) {
    const levels=variant===0?3:2;
    for(let i=0;i<levels;i++) {
      const bh=bodyH/levels,ww=w*(1-i*.11),dd=d*(1-i*.08),yy=podiumH+i*bh;
      r.add(CHAMFER_BOX,i%2?'glassPale':'glass',[0,yy+bh/2,0],[ww,bh,dd],[0,0,0],'setback glass stage');
      facade(r,{w:ww,d:dd,h:bh,y:yy,material:'glass',trim:'metal',columns:Math.round(w/3),detail});
      r.box('metal',0,yy+bh,0,ww+1,.55,dd+1,'setback cornice');
    }
  } else {
    r.add(CHAMFER_BOX,variant===1?'glassBlue':'glassPale',[0,podiumH+bodyH/2,0],[w,bodyH,d],[0,0,0],'chamfered curtain-wall shaft');
    facade(r,{w,d,h:bodyH,y:podiumH,material:variant===1?'glassBlue':'glassPale',trim:variant===1?'metalDark':'metal',columns:Math.round(w/3),detail});
    if(variant===2) {
      r.box('stoneLight',-w*.4,podiumH+bodyH/2,d*.49,w*.12,bodyH+1,1.2,'expressed stone spine');
      r.box('stoneLight',w*.4,podiumH+bodyH/2,-d*.49,w*.12,bodyH+1,1.2,'expressed stone spine');
    }
  }
  r.box('metalDark',0,top+1,0,w*.54,2,d*.5,'recessed crown');
  r.box('metal',0,top+3,0,w*.65,2,d*.6,'roof mechanical screen');
  if(detail>0) rooftop(r,w*.65,d*.6,top+4,rng,detail);
  r.box('glassPale',0,5,d*.68,w*.45,.5,d*.25,'entrance canopy');
  r.box('metal',-w*.2,2.5,d*.7,.35,5,.35,'canopy support');
  r.box('metal',w*.2,2.5,d*.7,.35,5,.35,'canopy support');
  return r;
}

function financial(options) {
  const o=settings('financial',options),{width:w,depth:d,height:h,detail,rng}=o;
  const r=new Recipe('Financial Street stone office',{family:'financial',...dimensions(o)});
  const plinth=Math.min(12,h*.2),shaft=h-plinth-5;
  r.box('stone',0,plinth/2,0,w*1.1,plinth,d*1.08,'rusticated limestone base');
  r.box('stoneLight',0,plinth+shaft/2,0,w,shaft,d,'stone office volume');
  facade(r,{w,d,h:shaft,y:plinth,material:'window',floorHeight:4,columns:Math.round(w/4.6),trim:'stoneLight',detail});
  const piers=Math.max(4,Math.round(w/9));
  for(let i=0;i<=piers;i++) {
    const x=-w/2+i*w/piers;
    for(const z of [-d/2-.45,d/2+.45]) r.box('stone',x,plinth+shaft/2,z,1.0,shaft+.6,1.1,'projecting stone pilaster');
  }
  for(const y of [plinth,h-5]) r.box('stoneLight',0,y,0,w+2,1.25,d+2,'deep cornice');
  r.box('stoneDark',0,h-2.5,0,w*.72,4,d*.7,'stepped mechanical crown');
  r.box('stoneLight',0,h-.25,0,w*.77,.5,d*.75,'crown cap');
  if(detail>0) rooftop(r,w*.65,d*.6,h,rng,Math.min(detail,1));
  shopfront(r,w*1.08,d*1.08,0,detail,'stoneLight',o.seed??1);
  for(const x of [-w*.32,0,w*.32]) r.box('stoneLight',x,plinth/2,d*.56,1.2,plinth,1.3,'entrance colonnade');
  return r;
}

function commercial(options) {
  const o=settings('commercial',options),{width:w,depth:d,height:h,detail,rng}=o;
  const r=new Recipe('Wangfujing commercial frontage',{family:'commercial',...dimensions(o)});
  const low=Math.min(8,h*.35),variant=(o.variant??0)%3;
  r.box('stoneLight',0,low/2,0,w,low,d,'street retail podium');
  r.box(variant===1?'brick':'stone',0,(h+low)/2,-d*.035,w*.95,h-low,d*.9,'upper commercial volume');
  shopfront(r,w,d,0,detail,'stoneLight',o.seed??1);
  facade(r,{w:w*.95,d:d*.9,z:-d*.035,h:h-low-1,y:low,material:'glassDark',floorHeight:4.4,columns:Math.round(w/8),trim:variant===1?'brick':'stoneLight',detail});
  r.box('stoneLight',0,low,0,w+1,1,d+1,'retail belt course');
  r.box('stoneLight',0,h,0,w*.99,.8,d*.96,'roof edge');
  const atriumW=w*.32,atriumD=d*.34;
  r.box('glassPale',0,h+.55,-d*.12,atriumW,1.1,atriumD,'roof atrium skylight');
  if(detail>0) {
    for(let i=0;i<6;i++) r.box('metal',-atriumW/2+i*atriumW/5,h+1.12,-d*.12,.22,.1,atriumD,'skylight mullion');
    r.box('stoneDark',-w*.34,h+.4,0,w*.16,.8,d*.6,'roof terrace planter');
    r.box('grass',-w*.34,h+.83,0,w*.145,.12,d*.58,'roof planting');
  }
  if(variant===2) {
    r.box('glassPale',w*.23,h*.6,d*.49,w*.25,h*.6,.4,'large facade display');
    r.box('bronze',w*.23,h*.92,d*.5,w*.27,.6,.6,'display header');
  }
  if(detail===2) rooftop(r,w*.5,d*.45,h,rng,1);
  return r;
}

function sanlitun(options) {
  const o=settings('sanlitun',options),{width:w,depth:d,height:h,detail,rng}=o;
  const r=new Recipe('Sanlitun contemporary low-rise',{family:'sanlitun',...dimensions(o)});
  const lower=h*.58,upper=h-lower;
  r.box('glassDark',0,lower/2,0,w,lower,d,'transparent retail ground floors');
  r.box('stoneLight',-w*.12,lower+upper/2,-d*.1,w*.76,upper,d*.8,'offset upper pavilion');
  r.box('glassPale',w*.11,h*.52,d*.43,w*.55,h*.71,d*.14,'glass projecting display box');
  r.box('metalDark',0,lower,0,w+1.8,.7,d+1.8,'deep horizontal fascia');
  r.box('stoneLight',-w*.12,h+.15,-d*.1,w*.8,.35,d*.84,'floating roof plate');
  shopfront(r,w,d,0,detail,'metalDark',o.seed??1);
  if(detail>0) {
    for(let i=0;i<9;i++) {
      const x=-w*.45+i*w*.67/8;
      r.box('bronze',x,lower+upper*.5,d*.305,.38,upper*.85,.6,'bronze screen fin');
    }
    r.box('stoneDark',w*.37,lower+.5,0,w*.19,1,d*.75,'terrace planter');
    r.box('grass',w*.37,lower+1.05,0,w*.17,.12,d*.72,'terrace planting');
    for(let i=0;i<3;i++) r.sphere('foliage',w*.37,lower+1.6,-d*.25+i*d*.25,1,1.1,1,'terrace shrub');
    r.box('glassPale',0,3.8,d*.68,w*.65,.16,d*.35,'street canopy');
    for(const x of [-w*.29,w*.29]) r.box('metalDark',x,1.9,d*.74,.16,3.8,.16,'canopy column');
  }
  return r;
}

function traditionalRoof(r,w,d,y,rise,material='roofGrey',detail=1,hip=false) {
  r.add(hip?HIP_ROOF:GABLE_ROOF,material,[0,y,0],[w,rise,d],[0,0,0],hip?'swept hipped tile roof':'grey tile gable roof');
  r.box(material==='roofGrey'?'roofGreyRidge':material,0,y+rise+.1,0,w*(hip?.55:1),.22,.3,'roof ridge');
  if(detail>0) {
    const n=Math.min(detail===2?30:14,Math.max(6,Math.round(w/1.2)));
    for(let i=0;i<=n;i++) {
      const x=-w*.48+i*w*.96/n;
      if(hip&&Math.abs(x)>w*.25) continue;
      const mat=material==='roofGold'?'roofGoldLight':material==='roofBlue'?'roofBlueLight':'roofGreyLight';
      // Four linked segments show the characteristic concave tile profile.
      for(const sign of [-1,1]) {
        const p=[[x,y+rise+.03,0],[x,y+rise*.5,sign*d*.2],[x,y+rise*.03,sign*d*.43],[x,y+rise*.1,sign*d*.5]];
        for(let j=0;j<3;j++) beam(r,mat,p[j],p[j+1],Math.max(.035,Math.min(.1,w*.002)),'tile roll');
      }
    }
  }
}

function courtyardHall({w,d,h,detail,wall='greyBrick',roof='roofGrey',hip=false}) {
  const r=new Recipe('courtyard hall');
  r.box('stoneDark',0,.23,0,w+.4,.46,d+.3,'masonry foot');
  const rise=Math.min(h*.39,d*.33),wallH=h-rise;
  r.box(wall,0,.4+wallH/2,0,w,wallH,d,'brick hall walls');
  r.box('timber',0,wallH*.6,d/2+.05,w*.78,wallH*.53,.15,'timber lattice window strip');
  const bays=Math.max(3,Math.round(w/3));
  for(let i=0;i<=bays;i++) r.box(wall,-w*.42+i*w*.84/bays,wallH*.6,d/2+.15,.16,wallH*.66,.25,'window bay frame');
  if(detail>0) r.box('greyBrickDark',0,wallH*.48,d/2+.15,w*.14,wallH*.81,.22,'central wooden door');
  r.box('timber',0,wallH+.35,0,w+1,.25,d+.5,'projecting timber eave');
  traditionalRoof(r,w+1.3,d+1.1,wallH+.4,rise,roof,detail,hip);
  return r;
}

function hutong(options) {
  const o=settings('hutong',options),{width:w,depth:d,height:h,detail,rng}=o;
  if(options.singleWing)return grayTileWing(options);
  const r=new Recipe('Beijing siheyuan courtyard',{family:'hutong',...dimensions(o)});
  const hallD=Math.min(d*.23,7.2),sideD=Math.min(w*.2,5.2),courtyardD=d-hallD*2-1.2;
  r.box('paving',0,.08,0,w,.16,d,'courtyard paving');
  // North main hall faces south into the courtyard. Side and south halls face inward.
  r.merge(courtyardHall({w:w-1.2,d:hallD,h,detail}),[0,0,-d/2+hallD/2+.3]);
  r.merge(courtyardHall({w:w-1.2,d:hallD*.8,h:h*.82,detail}),[0,0,d/2-hallD*.4-.3],Math.PI);
  r.merge(courtyardHall({w:courtyardD,d:sideD,h:h*.8,detail}),[-w/2+sideD/2+.2,0,0],Math.PI/2);
  r.merge(courtyardHall({w:courtyardD,d:sideD,h:h*.8,detail}),[w/2-sideD/2-.2,0,0],-Math.PI/2);
  r.box('greyBrick',-w*.35,1.1,d/2+.1,w*.24,2.2,.35,'courtyard screen wall');
  // Offset southeast street gate is a Beijing courtyard characteristic.
  const gateX=w*.32,gateY=h*.5;
  r.box('vermilionDark',gateX,gateY*.5,d/2+.5,w*.13,gateY,1.4,'courtyard street gate');
  r.add(GABLE_ROOF,'roofGrey',[gateX,gateY,d/2+.5],[w*.2,1.05,2.3],[0,0,0],'street gate roof');
  if(detail>0) {
    r.box('stoneLight',0,.18,0,w*.35,.08,courtyardD*.85,'courtyard central path');
    r.cylinder('stoneDark',-w*.2,.45,-d*.08,.65,.9,'courtyard planter',10);
    r.sphere('foliage',-w*.2,1.25,-d*.08,1.1,.9,1,'pomegranate shrub');
    r.cylinder('stoneDark',w*.18,.35,d*.03,.48,.7,'courtyard jar',10,.8);
    if((o.seed??1)%3===0) {
      r.box('solar',0,h*.86,-d*.35,w*.16,.12,1.4,'small roof solar water-heater collector');
      r.cylinder('metal',0,h*.89,-d*.39,.22,w*.16,'water-heater tank',10);
    }
  }
  return r;
}

function grayTileWing(options) {
  const o=settings('gray_tile_wing',options),{width:w,depth:d,height:h,detail}=o;
  const r=new Recipe('Hutong grey-tiled single wing',{family:'gray_tile_wing',...dimensions(o)});
  const alongX=w>=d;
  r.merge(courtyardHall({w:Math.max(3,(alongX?w:d)-1.3),d:Math.max(2,(alongX?d:w)-1.1),h,detail}),[0,0,0],alongX?0:Math.PI/2);
  return r;
}

function slab(options) {
  const o=settings('slab',options),{width:w,depth:d,height:h,detail,rng}=o;
  const r=new Recipe('Beijing slab apartment block',{family:'slab',...dimensions(o)});
  const floors=Math.max(2,Math.floor(h/3)),fh=h/floors,bays=Math.max(3,Math.round(w/6)),bw=w/bays;
  const wall=['stucco','stuccoPale','stuccoRose','brick'][(o.variant??Math.floor(rng()*4))%4];
  r.box(wall,0,h/2,0,w,h,d,'slab residential mass');
  r.box('stoneDark',0,.65,0,w+0.2,1.3,d+.2,'ground floor base');
  for(let i=0;i<bays;i++) {
    const x=-w/2+bw*(i+.5);
    r.box('window',x,h*.5,d/2+.07,bw*.61,h*.87,.16,'south stacked window strip');
    r.box('window',x,h*.5,-d/2-.07,bw*.48,h*.87,.16,'north stacked window strip');
    if(i%3===1) r.box('stoneLight',x,h*.5,-d/2-.5,bw*.22,h,1.1,'stairwell projection');
    if(detail>0) for(let f=0;f<floors;f++) {
      const y=fh*(f+.35);
      r.box(wall,x,y,d/2+.8,bw*.78,.8,1.45,'enclosed balcony lower wall');
      r.box('window',x,y+fh*.38,d/2+1.45,bw*.67,fh*.42,.1,'balcony glazing');
      r.box('stoneLight',x,y+fh*.65,d/2+.8,bw*.84,.18,1.6,'balcony slab');
      if(detail===2) {
        r.box('stoneLight',x,y+fh*.36,d/2+1.53,.14,fh*.45,.16,'balcony mullion');
        if((i+f)%3===0) r.box('metal',x+bw*.36,y+fh*.3,d/2+.35,.65,.55,.55,'air conditioning condenser');
      }
    }
  }
  const floorStep=detail===0?Math.max(2,Math.floor(floors/4)):1;
  for(let f=1;f<floors;f+=floorStep) {
    r.box(wall,0,f*fh,-d/2-.12,w,.55,.26,'north floor spandrel');
    if(detail===0) r.box(wall,0,f*fh,d/2+.12,w,.55,.26,'south floor spandrel');
  }
  r.box('roofGrey',0,h+.15,0,w+.6,.3,d+.6,'flat roof');
  parapet(r,w+.35,d+.35,h+.3,'stoneLight',.4);
  if(detail>0) rooftop(r,w,d,h+.4,rng,detail);
  return r;
}

function tower(options) {
  const o=settings('tower',options),{width:w,depth:d,height:h,detail,rng}=o;
  const r=new Recipe('Beijing residential point tower',{family:'tower',...dimensions(o)});
  const wall=['stuccoPale','stucco','stuccoRose'][(o.variant??Math.floor(rng()*3))%3],floors=Math.floor(h/3.1),fh=h/floors;
  r.box(wall,0,h/2,-d*.1,w*.78,h,d*.8,'central residential tower');
  for(const sign of [-1,1]) {
    r.box(wall,sign*w*.32,h/2,d*.12,w*.36,h,d*.78,'projecting apartment wing');
    r.box('window',sign*w*.32,h*.5,d*.51,w*.24,h*.93,.18,'south window stack');
    r.box('window',sign*w*.505,h*.5,d*.1,.18,h*.93,d*.43,'outer window stack');
  }
  r.box('stoneLight',0,h*.5,d*.18,w*.16,h,d*.9,'central service spine');
  const step=detail===0?Math.max(2,Math.floor(floors/6)):detail===1?2:1;
  for(let f=1;f<floors;f+=step) {
    const y=f*fh;
    for(const sign of [-1,1]) {
      r.box(wall,sign*w*.32,y,d*.52,w*.35,.6,.6,'balcony band');
      r.box(wall,sign*w*.51,y,d*.12,.5,.6,d*.75,'outer spandrel');
    }
  }
  r.box('stoneLight',0,h+.4,-d*.1,w*.83,.8,d*.84,'roof cap');
  r.box(wall,0,h+2,-d*.05,w*.32,4,d*.34,'lift motor room');
  if(detail>0) rooftop(r,w*.7,d*.7,h+.8,rng,1);
  return r;
}

function palace(options) {
  const o=settings('palace',options),{width:w,depth:d,height:h,detail}=o;
  const r=new Recipe('Traditional imperial hall',{family:'palace',...dimensions(o)});
  const platform=h*.12,wallH=h*.36,double=(o.variant??0)%2===0;
  const roofH=double?h*.28:h-platform-wallH-.21,upperRoof=h-platform-wallH-roofH*.55-.21;
  r.box('marble',0,platform*.4,0,w*1.1,platform*.8,d*1.18,'white marble terrace');
  r.box('marble',0,platform*.9,0,w*1.16,platform*.2,d*1.24,'terrace coping');
  for(let i=0;i<5;i++) r.box('marble',0,platform*(1-i/5)/2,d*.62+i*.7,w*.26,platform*(1-i/5),1.5,'ceremonial stair');
  r.box('vermilion',0,platform+wallH/2,0,w*.88,wallH,d*.77,'red hall');
  const cols=Math.max(5,Math.round(w/5));
  for(let i=0;i<=cols;i++) for(const z of [-d*.45,d*.45]) {
    const x=-w*.46+i*w*.92/cols;
    r.cylinder('vermilion',x,platform+wallH*.5,z,.31,wallH,'red timber column',10);
    if(detail>0) r.box('greenBeam',x,platform+wallH-.25,z,.9,.7,.9,'painted bracket capital');
  }
  r.box('greenBeam',0,platform+wallH,0,w*.98,.65,d*.96,'painted entablature');
  traditionalRoof(r,w*1.12,d*1.18,platform+wallH,roofH,'roofGold',detail,true);
  // Double eave with an upper roof, as on the largest imperial halls.
  if(double) {
    r.box('vermilionDark',0,platform+wallH+roofH*.61,0,w*.62,roofH*.3,d*.52,'upper eave drum');
    traditionalRoof(r,w*.92,d*.91,platform+wallH+roofH*.55,upperRoof,'roofGold',detail,true);
  }
  if(detail>0) for(let i=0;i<cols;i++) {
    const x=-w*.42+(i+.5)*w*.84/cols;
    r.box('vermilionDark',x,platform+wallH*.5,d*.391,w*.72/cols,wallH*.72,.12,'red lattice doors');
    r.box('bronze',x,platform+wallH*.5,d*.46,.13,.13,.13,'door boss');
  }
  return r;
}

function paifang(options) {
  const o=settings('paifang',options),{width:w,depth:d,height:h,detail}=o;
  const r=new Recipe('Three-bay Beijing paifang',{family:'paifang',...dimensions(o)});
  for(const x of [-w*.48,-w*.18,w*.18,w*.48]) {
    r.box('marble',x,.35,0,1.2,.7,1.4,'gate column plinth');
    r.cylinder('vermilion',x,h*.42,0,.38,h*.84,'gate column',12);
  }
  for(const [x,bw,top] of [[0,w*.43,h*.81],[-w*.335,w*.36,h*.67],[w*.335,w*.36,h*.67]]) {
    r.box('greenBeam',x,top-1.2,0,bw,1.5,d*.34,'painted gate beam');
    r.add(HIP_ROOF,'roofGold',[x,top-.5,0],[bw*1.15,h*.18,d],[0,0,0],'gate swept roof');
    r.box('roofGoldLight',x,top+h*.18-.4,0,bw*.65,.18,.2,'gate roof ridge');
    if(detail>0) r.box('bronze',x,top-1.2,d*.18,bw*.45,.6,.16,'gate inscription plaque');
  }
  return r;
}

function dimensions(o) {return {width:o.width,depth:o.depth,height:o.height,seed:o.seed??1,detail:o.detail,approx:true};}
const factories={oldtown_streetfront:oldtownStreetfront,peoples_heroes_monument:peoplesHeroesMonument,beihai_north_gallery:beihaiNorthGallery,agriculture_side_hall:agricultureSideHall,lama_falun_hall:lamaFalunHall,heritage_hall:heritageHall,tvcc_context:tvccContext,cbd:contemporaryCbd,financial:contemporaryFinancial,commercial:contemporaryCommercial,sanlitun,hutong,slab,tower,palace,paifang,gray_tile_wing:grayTileWing,heritage_shop:heritageShop,xindibai,cwtc_mall_north:cwtcMallNorth,hanwei_plaza:hanweiPlaza,kerry_mall_hotel:kerryMallHotel,wangfujing_apm:wangfujingApm,wangfujing_west_wall:wangfujingWestWall,sanlitun_s2:sanlitunS2,qianmen_shop:qianmenShop,liulichang_shop:liulichangShop,side_pavilion:sidePavilion};

/** Exactly two parts per wing; no windows, doors, trim or hidden full courtyard. */
function lowTileWing(r,w,d,h,x=0,z=0,rotation=0) {
  const rise=Math.min(h*.36,d*.32),wallH=h-rise;
  r.box('greyBrick',x,wallH/2,z,w-.4,wallH,Math.max(.8,d-.5),'silhouette grey-brick hall',rotation);
  r.add(GABLE_ROOF,'roofGrey',[x,wallH,z],[w,rise,d],[0,rotation,0],'silhouette grey tile roof');
}

function courtyardSilhouette(family,options) {
  const o=settings(family,options),{width:w,depth:d,height:h}=o;
  const r=new Recipe(family==='hutong'&&!options.singleWing?'Open siheyuan silhouette':'Single grey-tile wing silhouette',{family,...dimensions(o),detail:-1,lod:'silhouette'});
  if(family==='gray_tile_wing'||options.singleWing) {
    if(d>w)lowTileWing(r,d,w,h,0,0,Math.PI/2);else lowTileWing(r,w,d,h);
  } else {
    const hallD=Math.min(d*.23,7.2),sideD=Math.min(w*.2,5.2),innerD=d-hallD*2;
    lowTileWing(r,w,hallD,h,0,-d/2+hallD/2);
    lowTileWing(r,w,hallD,h*.82,0,d/2-hallD/2);
    lowTileWing(r,innerD,sideD,h*.8,-w/2+sideD/2,0,Math.PI/2);
    lowTileWing(r,innerD,sideD,h*.8,w/2-sideD/2,0,Math.PI/2);
  }
  return r;
}

export function buildingRecipe(family='slab',options={}) {
  const aliases={office:'cbd',finance:'financial',wangfujing:'commercial',siheyuan:'hutong',residential:'slab',residentialSlab:'slab',residentialTower:'tower',temple:'palace',gate:'paifang'};
  family=aliases[family]??family;
  if(!factories[family]) throw new Error(`Unknown Beijing building family "${family}". Available: ${BUILDING_FAMILIES.join(', ')}`);
  if(family==='hutong'&&options.courtyardLayout)return smallCourtyard(options);
  if((options.detail===-1||options.lod==='silhouette')&&(family==='hutong'||family==='gray_tile_wing'))return courtyardSilhouette(family,options);
  return factories[family](options);
}

export {traditionalRoof,courtyardHall};
