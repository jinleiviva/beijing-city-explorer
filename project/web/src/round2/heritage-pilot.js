/** Round-two authored detail for three existing inferred storefronts.
 * Footprints, rotations and absolute roof heights are unchanged.
 * No claim of surveyed shop interiors or current commercial tenants. */
import {Recipe,beam,seededRandom} from '../architecture/geometry.js';
import {heritageShop} from '../architecture/heritage-shop.js';
import {configureRound2Material} from './materials.js';
export const PILOT_SHOP_IDS=Object.freeze(['heritage-yandai_xiejie--1-5','heritage-yandai_xiejie--1-6','heritage-yandai_xiejie--1-7']);
export const PILOT_CAMERA=Object.freeze({position:[-826.197475965,26,-3212.971217846],target:[-815.892607784,2.2,-3241.145846358]});
export function isPilotShop(i){return PILOT_SHOP_IDS.includes(i.id);}
const MAP={greyBrick:'r2Brick',greyBrickDark:'r2BrickDark',roofGrey:'r2Roof',roofGreyLight:'r2Roof',roofGreyRidge:'r2RoofRidge',stoneDark:'r2Stone',timber:'r2Wood',paintedWood:'r2WoodPaint'};
function frame(r,x,y,z,w,h,m='r2WoodPaint',th=.085,depth=.12){for(const s of [-1,1]){r.box(m,x+s*w/2,y,z,th,h+th,depth,'r2 window jamb');r.box(m,x,y+s*h/2,z,w,th,depth,'r2 window head or sill');}}
function pottery(r,x,y,z,seed){const rand=seededRandom(seed);for(let j=0;j<3;j++){const xx=x+(j-1)*.22,rr=.075+rand()*.035,hh=.13+rand()*.13;r.cylinder(j===1?'r2Glass':'r2Clay',xx,y+hh/2,z,rr,hh,'r2 ceramic vessel',10,.76);r.cylinder('r2Interior',xx,y+hh+.008,z,rr*.58,.012,'r2 hollow vessel mouth',10);}}
function cabinet(r,x,y,z,w,variant){r.box('r2Wood',x,y+.34,z,w,.68,.36,'r2 shop display cabinet');r.box('r2Stone',x,y+.70,z,w+.08,.06,.42,'r2 worn display counter');for(const sx of [-1,1])r.box('r2WoodPaint',x+sx*w*.35,y+.32,z+.19,.06,.59,.04,'r2 cabinet panel stile');pottery(r,x,y+.73,z,variant+31);}
function canopy(r,x,y,z,w){const d=.80;for(let i=0;i<6;i++){const xx=x-w/2+(i+.5)*w/6;r.add({type:'box'},i%2?'r2Fabric':'r2Stone',[xx,y-.12,z+d*.34],[w/6,.045,d],[.16,0,0],'r2 folded fabric awning panel');r.box(i%2?'r2Fabric':'r2Stone',xx,y-.22,z+d*.81,w/6,.14,.04,'r2 short cloth valance');}for(const side of [-1,1])beam(r,'r2Metal',[x+side*w*.45,y+.03,z],[x+side*w*.45,y-.17,z+d*.75],.018,'r2 awning tension rod');}
function board(r,x,y,z){r.add({type:'box'},'r2WoodPaint',[x,y+.52,z],[.52,.90,.055],[-.12,0,0],'r2 freestanding category board');r.box('r2Sign',x,y+.57,z+.06,.40,.66,.012,'r2 category board paper');for(const sx of [-1,1])r.box('r2Wood',x+sx*.20,y+.12,z,.045,.3,.23,'r2 board supported foot');for(let j=0;j<3;j++)r.box('r2Wood',x,y+.45+j*.13,z+.07,.25-j*.035,.022,.012,'r2 category board motif');}
function bench(r,x,y,z){r.box('r2Wood',x,y+.44,z,1.25,.10,.36,'r2 worn narrow bench seat');for(const sx of [-1,1])for(const sz of [-1,1])r.box('r2WoodPaint',x+sx*.47,y+.21,z+sz*.10,.09,.42,.09,'r2 bench grounded leg');}
export function heritagePilotRecipe(options={}){
 const original=heritageShop({...options,detail:1,tileDetail:'coarse'}),w=options.width,d=options.depth,h=options.height,front=d/2,rise=Math.min(1.8,h*.29),wallH=h-rise,ground=.82,type=Math.max(0,PILOT_SHOP_IDS.indexOf(options.id)),v=type%3;
 const r=new Recipe('Round 2 smoke-pipe lane shop detail',{...original.metadata,round2:true,shopId:options.id,shopType:['tea and craft','ceramics','cloth and books'][v],groundDatum:ground,roofDatumUnchanged:true,accuracy:'Original photo-informed construction; shop category, portable props and exact openings inferred'});
 r.parts=original.parts.filter(p=>p.label==='grey-brick rear shop volume'||/roof|ridge cap|tile roll|tile end|hard-gable|parapet|front gable/.test(p.label)).map(p=>({...p,material:MAP[p.material]||p.material}));
 const baseTop=ground+.22,openTop=wallH-.35,openH=openTop-baseTop,post=v===0?'r2WoodPaint':'r2Wood';
 r.box('r2Paving',0,ground+.008,front+.44,w,.016,.88,'r2 worn stone entrance apron');
 for(let k=0;k<3;k++)r.box('r2Metal',-w*.42+k*.12,ground+.019,front+.75,.045,.016,.25,'r2 narrow drainage slots');
 r.box('r2Stone',0,ground+.11,front-.10,w,.22,.52,'r2 continuous dressed stone plinth');
 r.box('r2BrickDark',0,ground+.035,front+.17,w,.055,.14,'r2 wall foot contact band');
 for(const side of [-1,1]){r.box('r2Brick',side*(w/2-.22),(wallH+ground)/2,front-.43,.44,wallH-ground,.86,'r2 masonry front pier');r.box('r2Stone',side*(w/2-.22),ground+.22,front-.36,.51,.38,.94,'r2 masonry plinth cap');}
 r.box('r2Interior',0,(baseTop+openTop)/2,front-.98,w-.84,openH,.035,'r2 deep interior rear wall');
 r.box('r2Stone',0,baseTop-.05,front-.44,w-.84,.10,1.05,'r2 recessed shop floor');
 r.box(post,0,wallH-.24,front+.04,w-.30,.20,.25,'r2 continuous thick lintel');
 r.box('r2WoodPaint',0,wallH-.08,front+.23,w+.12,.16,.65,'r2 thick dark eave fascia');
 r.box('r2Wood',0,wallH-.23,front+.24,w+.05,.08,.55,'r2 second projecting fascia');
 for(let i=0;i<Math.ceil(w/.42);i++){const x=-w*.47+i*w*.94/(Math.ceil(w/.42)-1);r.box('r2Wood',x,wallH-.035,front+.37,.095,.12,.40,'r2 readable rafter tail');}
 const doorX=v===0?-w*.25:v===1?0:w*.27,doorW=v===1?1.75:1.10;
 const panels=v===0?[{x:w*.12,w:w*.48}]:v===1?[{x:-w*.31,w:w*.24},{x:w*.31,w:w*.24}]:[{x:-w*.14,w:w*.48}];
 // An open portal, with actual .8 m depth, soffit, returns and side-hung leaves.
 for(const s of [-1,1]){const x=doorX+s*doorW/2;r.box(post,x,(baseTop+openTop)/2,front-.1,.13,openH,.24,'r2 portal structural jamb');r.box('r2Wood',x,openTop-.08,front-.5,.11,.16,.86,'r2 portal return head');r.box('r2Wood',x,baseTop+openH*.45,front-.46,.075,openH*.90,.64,'r2 folded door leaf in depth');r.box('r2Metal',x-s*.065,baseTop+openH*.48,front-.04,.035,.20,.045,'r2 bronze door handle');}
 r.box(post,doorX,openTop,front-.08,doorW+.18,.12,.22,'r2 portal head');
 r.box('r2WoodPaint',doorX,baseTop+.035,front-.06,doorW,.09,.30,'r2 raised door threshold above paving');
 r.box('r2Stone',doorX,ground+.075,front+.30,doorW+.33,.15,.52,'r2 first worn stone doorstep');
 r.box('r2Stone',doorX,ground+.025,front+.63,doorW+.47,.05,.17,'r2 outer paving transition');
 // Different visible window proportions and lower-panel construction per category.
 for(const p of panels){const winBottom=baseTop+(v===1?.54:.67),winH=openTop-winBottom-.05,cy=winBottom+winH/2;r.box('r2Wood',p.x,(baseTop+winBottom)/2,front-.14,p.w,winBottom-baseTop,.18,'r2 solid lower timber panel');frame(r,p.x,(baseTop+winBottom)/2,front-.025,p.w-.16,winBottom-baseTop-.12,post,.045,.055);r.box('r2Glass',p.x,cy,front-.46,p.w-.16,winH,.035,'r2 recessed glass window');frame(r,p.x,cy,front-.12,p.w,winH,post,.10,.15);r.box('r2Stone',p.x,winBottom-.035,front+.015,p.w+.17,.11,.42,'r2 projecting stone window sill');const count=v===0?4:3;for(let j=1;j<count;j++)r.box(post,p.x-p.w/2+j*p.w/count,cy,front-.025,.038,winH,.055,'r2 timber window mullion');for(let j=1;j<(v===0?4:2);j++)r.box(post,p.x,winBottom+j*winH/(v===0?4:2),front-.02,p.w,.038,.055,'r2 timber window rail');if(v===1)pottery(r,p.x,winBottom+.05,front-.32,options.seed);}
 const signY=wallH-.13,signH=.40,signW=w*.65;
 r.box('r2WoodPaint',0,signY,front+.66,signW,signH,.16,'r2 suspended shop category board');frame(r,0,signY,front+.755,signW-.06,signH-.06,'r2Clay',.032,.025);
 r.metadata.signPanels=[{position:[0,signY,front+.78],width:signW-.17,height:signH-.12,variant:[0,4,5][v],normal:[0,0,1],rotation:[0,0,0]}];
 r.metadata.lanternHooks=[];
 if(v===0){bench(r,w*.26,ground,front+.37);board(r,-w*.39,ground,front+.37);}
 if(v===1){cabinet(r,-w*.31,ground,front+.24,w*.22,options.seed);r.cylinder('r2Clay',w*.34,ground+.24,front+.29,.18,.48,'r2 empty large display urn',12,.75);}
 if(v===2){canopy(r,-w*.15,openTop+.05,front+.08,w*.50);board(r,-w*.33,ground,front+.42);}
 // Soft, bounded grime/contact as opaque thin geometry, not a screen-space AO trick.
 for(const side of [-1,1])r.box('r2BrickDark',side*(w/2-.24),ground+.035,front+.20,.44,.025,.23,'r2 localized damp stone contact');
 const shadowMaterials=new Set(['r2Brick','r2Roof','r2Wood','r2WoodPaint','r2Fabric']);
 for(const part of r.parts)if(!shadowMaterials.has(part.material))part.castShadow=false;
 r.metadata.doorClearance=openTop-(baseTop+.08);
 r.metadata.localExtents={width:w,depth:d,frontProjection:.80,roofHeight:h};
 return r;
}

export function buildHeritagePilot(kit,plan){
 const combined=new Recipe('Round 2 three same-footprint storefronts',{buildings:3,scope:'three shop pilot',shopIds:PILOT_SHOP_IDS,approx:true});
 const shops=plan.instances.filter(isPilotShop),anchor=shops[1];
 if(shops.length!==3)throw new Error('Round 2 pilot requires exactly the three frozen shop IDs.');
 if(!shops.every(i=>Math.abs(i.rotation-anchor.rotation)<1e-8))throw new Error('Pilot material frame requires parallel original storefronts.');
 for(const material of Object.values(kit.materials))if(material.userData?.round2)configureRound2Material(material,{origin:[anchor.x,0,anchor.z],rotationY:-anchor.rotation});
 combined.metadata.materialFrame={origin:[anchor.x,0,anchor.z],rotationY:-anchor.rotation};
 for(const i of shops)combined.merge(heritagePilotRecipe(i),[i.x,0,i.z],i.rotation);
 return kit.buildMergedRecipe(combined);
}
