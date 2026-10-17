import {COMPOUND_COMPONENTS} from './compound-layout.js';
import {Recipe,HIP_ROOF,latheGeometry,annulusGeometry,beam} from './geometry.js';
import {traditionalRoof,buildingRecipe} from './buildings.js';
import {stairs} from './landmark-utils.js';

function greenEdgedRoof(r,w,d,y,rise,detail) {
  traditionalRoof(r,w,d,y,rise,'roofGrey',detail,true);
  for(const z of [-d*.49,d*.49])r.box('roofGreen',0,y+rise*.1,z,w,.22,.45,'green glazed eave border');
  for(const x of [-w*.49,w*.49])r.box('roofGreen',x,y+rise*.1,0,.45,.22,d,'green glazed eave border');
  r.box('roofGreen',0,y+rise+.16,0,w*.55,.22,.35,'green glazed ridge');
}
function darkPortal(r,x,z,width,height,y=0,material='greyBrickDark') {
  r.box(material,x,y+height*.38,z,width,height*.76,.15,'deep arched portal');
  const vertices=[x,y+height*.75,z],indices=[];
  for(let i=0;i<=20;i++) {
    const a=Math.PI*i/20;vertices.push(x+Math.cos(a)*width/2,y+height*.75+Math.sin(a)*height*.25,z);
    if(i>0)indices.push(0,i,i+1);
  }
  r.add({type:'mesh',vertices,indices},material,[0,0,0],[1,1,1],[0,0,0],'arched portal head');
}

function zhengyangmen(o,arrow=false) {
  const r=new Recipe(arrow?'正阳门箭楼 · Zhengyangmen Arrow Tower':'正阳门城楼 · Zhengyangmen Gate Tower');
  if(arrow) {
    r.box('greyBrick',0,6.5,0,52,13,30,'broad battered masonry gate base');
    r.box('greyBrick',0,22,0,43,18,24,'defensive arrow tower');
    darkPortal(r,0,15.1,6.5,9);
    for(let j=0;j<4;j++)for(let i=0;i<11;i++)r.box('greyBrickDark',-18+i*3.6,15.3+j*3.35,12.15,1.25,1.5,.2,'south defensive arrow window');
    for(const side of [-1,1])for(let j=0;j<4;j++)for(let i=0;i<5;i++)r.box('greyBrickDark',side*21.6,15.3+j*3.35,-9+i*4.5,.2,1.5,1.25,'side defensive arrow window');
    greenEdgedRoof(r,49,31,28,3.3,o.detail);
    r.box('greyBrick',0,32,0,37,3,20,'upper arrow tower drum');
    greenEdgedRoof(r,44,26,32.2,2.95,o.detail);
  }else {
    r.box('greyBrick',0,6.5,0,61,13,38,'large grey masonry gate platform');
    darkPortal(r,0,19.1,7.2,10);
    r.box('marble',0,13.3,0,63,.6,40,'gate platform coping');
    r.box('vermilion',0,22.8,0,42,19,24,'two-storey timber gate hall');
    for(let level=0;level<2;level++)for(let i=0;i<11;i++)for(const z of [-14,14]) {
      const x=-22+i*4.4;r.cylinder('vermilionDark',x,18.3+level*9,z,.3,9,'gate red column',8);
      r.box('greenBeam',x,22.4+level*9,z,1.2,.6,1.1,'painted dougong bracket');
    }
    greenEdgedRoof(r,56,35,22.1,4.5,o.detail);
    greenEdgedRoof(r,53,32,32.0,4.3,o.detail);
    r.box('vermilionDark',0,37.5,0,37,3.2,18,'upper clerestory');
    greenEdgedRoof(r,47,28,38.7,4.72,o.detail);
  }
  return r;
}

function drumTower(o) {
  const r=new Recipe('鼓楼 · Beijing Drum Tower');
  r.box('stoneDark',0,3.1,0,61,6.2,46,'drum tower masonry terrace');
  r.box('vermilion',0,22.3,0,49,32.2,34,'large red drum tower');
  darkPortal(r,0,17.1,8,11,6.2,'vermilionDark');
  for(const x of [-15,15])darkPortal(r,x,17.13,4.2,8.6,8,'vermilionDark');
  for(let i=0;i<9;i++)r.box('vermilionDark',-20+i*5,31,17.2,2.8,6,.2,'upper drum tower shutter');
  greenEdgedRoof(r,62,46,26,5.3,o.detail);
  greenEdgedRoof(r,58,42,35,5.1,o.detail);
  r.box('vermilionDark',0,40.5,0,38,3,22,'upper roof clerestory');
  greenEdgedRoof(r,49,35,41.3,5.17,o.detail);
  stairs(r,20,24,6.2,16,10);
  return r;
}

function bellTower(o) {
  const r=new Recipe('钟楼 · Beijing Bell Tower');
  r.box('greyBrick',0,4,0,43,8,33,'stone bell tower platform');
  r.box('greyBrick',0,23.5,0,33,31,25,'solid grey brick bell tower');
  darkPortal(r,0,12.65,10,14,8,'greyBrickDark');
  for(const x of [-11,11])darkPortal(r,x,12.67,4.5,9.5,8,'greyBrickDark');
  r.box('marble',0,8.2,16.5,40,.5,3,'white marble front terrace');
  greenEdgedRoof(r,42,34,30.1,5.7,o.detail);
  r.box('greyBrickDark',0,38.2,0,27,6,19,'upper bell chamber');
  for(const x of [-8,0,8])darkPortal(r,x,9.6,4,4.5,35.2,'window');
  greenEdgedRoof(r,37,29,41.8,5.88,o.detail);
  stairs(r,12,18,8,20,12);
  return r;
}

function lamaTemple(o) {
  const r=new Recipe('雍和宫万福阁 · Yonghe Temple Wanfu Pavilion',{scope:'Wanfu+Yansui+Yongkang pavilions only',replacesOsmIds:['osm-way-177053588','osm-way-377843158','osm-way-377843159'],sidePavilionHeights:'16m approximate',pavilionStoreys:'main two storeys with three eaves; sides two storeys/two eaves',heightSource:'https://www.bjtzb.gov.cn/wwwroot/sdtyzx/publish/article/55/11292.shtml'});
  r.box('marble',0,.7,0,29,1.4,26,'white stone Wanfu terrace');
  r.box('vermilionDark',0,11.2,0,21,20,19,'two-storey three-eave Tibetan Buddhist pavilion');
  for(let k=0;k<3;k++) {
    const y=6.6+k*7.2,w=30-k*2,d=27-k*2;
    r.box('greenBeam',0,y,0,w*.83,.7,d*.82,'richly painted bracket belt');
    traditionalRoof(r,w,d,y,3.75,'roofGold',o.detail,true);
    for(const z of [-10.7,10.7])for(let i=0;i<5;i++)r.cylinder('vermilion',-10+i*5,y-2.5,z,.22,5,'upper pavilion red column',8);
  }
  for(const id of ['osm-way-377843158','osm-way-377843159']) {
    const site=COMPOUND_COMPONENTS[id],[x,z]=site.relativeXZ,[w,d]=site.dimensions,side=Math.sign(x);
    r.box('marble',x,.55,z,w,1.1,d,'mapped side-pavilion terrace '+id);
    r.box('vermilionDark',x,7,z,w*.75,11.8,d*.70,'two-storey side pavilion '+id);
    for(const [y,rw,rd,rise]of[[6.7,w,d,2.7],[13.1,w*.91,d*.92,2.9]]) {
      r.box('greenBeam',x,y-.25,z,rw*.84,.6,rd*.83,'side pavilion blue-green entablature '+id);
      r.add(HIP_ROOF,'roofGold',[x,y,z],[rw,rise,rd],[0,0,0],'side pavilion double yellow eave '+id);
      if(o.detail>0)for(let i=0;i<4;i++)r.cylinder('vermilion',x-w*.32+i*w*.64/3,y-2,z+d*.38,.17,4,'side pavilion upper red column',8);
    }
    // Short elevated gallery between actual separate pavilions; keep open ground below.
    const inner=side*10.5,outer=x-side*w*.37,gx=(inner+outer)/2,gw=Math.abs(outer-inner)+.8;
    r.box('vermilionDark',gx,10.8,z*.5,gw,1.9,3.6,'elevated connecting gallery '+id);
    r.add(HIP_ROOF,'roofGold',[gx,11.8,z*.5],[gw+.6,1.6,4.8],[0,0,0],'covered connecting gallery roof '+id);
  }
  stairs(r,17,14,1.4,6,5);
  return r;
}

function whitePagoda(o) {
  const r=new Recipe('北海白塔 · Beihai White Dagoba',{replacesOsmIds:['osm-way-561193504','osm-way-1021040719'],scope:'Mapped white pagoda and immediately adjacent ShanyinHall only;not the whole summit court',shanyinCenterApproxXZ:[.16647,13.917783]});
  // Full-silhouette photographs and Palace Museum publication: stepped square
  // masonry base, broad-shouldered bottle body, thirteen rings and two canopies.
  r.box('stoneDark',0,.65,0,23,1.3,23,'square dagoba ground platform');
  r.box('greyBrick',0,3.9,0,17.8,5.2,17.8,'grey masonry square dagoba pedestal');
  for(const [y,size,h] of [[1.6,20.2,.6],[6.35,19.8,.65],[6.95,21,.55]])r.box('marble',0,y,0,size,h,size,'white stepped square pedestal cornice');
  for(const [y,rad,h] of [[7.8,9.6,1.2],[9,8.6,1.2],[10.2,7.5,1.2]])r.cylinder('marble',0,y,0,rad,h,'three stepped white circular courses',64);
  const profile=[[6.3,10.8],[6.05,11.5],[6.2,14],[6.5,17.5],[6.9,21],[7.05,22.6],[6.75,23.6],[5.65,24.6],[4.25,25.1],[2.4,25.45],[2.3,26.5]];
  r.add(latheGeometry(profile,64),'marble',[0,0,0],[1,1,1],[0,0,0],'broad-shouldered white bottle-shaped stupa');
  for(let i=0;i<13;i++)r.cylinder('marble',0,26.5+i*.43,0,2.36-i*.065,.40,'thirteen tapered heavenly rings',48,.97);
  r.cylinder('metalDark',0,32.15,0,2.55,.58,'lower dark bronze canopy',48,.50);
  r.cylinder('metalDark',0,33.0,0,1.98,.48,'upper dark bronze canopy',40,.45);
  r.cylinder('roofGoldLight',0,33.6,0,.75,.55,'golden finial pedestal',24,.65);
  r.sphere('roofGoldLight',0,34.35,0,.48,.65,.48,'gilded stupa flame jewel');
  r.cylinder('roofGoldLight',0,35.25,0,.23,1.30,'gilded flame tip',12,0);
  // The eye gate is a flame/crest-shaped niche, not a large entrance door.
  const contour=[[-1.4,14.0],[-1.9,17.8],[-1.5,19.1],[-.75,19.8],[0,20.4],[.75,19.8],[1.5,19.1],[1.9,17.8],[1.4,14.0]];
  const vertices=[0,17.1,7.01,...contour.flatMap(([x,y])=>[x,y,7.01])],indices=[];
  for(let i=0;i<contour.length;i++)indices.push(0,i+1,(i+1)%contour.length+1);
  // Reverse perimeter is clockwise on the front; expose outward +Z.
  r.add({type:'mesh',vertices,indices:indices.map((v,i)=>i%3===1?indices[i+1]:i%3===2?indices[i-1]:v)},'vermilionDark',[0,0,0],[1,1,1],[0,0,0],'red sacred eye-gate niche');
  for(let i=0;i<contour.length;i++) {
    const a=contour[i],b=contour[(i+1)%contour.length];
    beam(r,'roofGreen',[a[0]*1.14,(a[1]-17.1)*1.1+17.1,7.04],[b[0]*1.14,(b[1]-17.1)*1.1+17.1,7.04],.22,'green flame-shaped niche frame');
    beam(r,'roofGoldLight',[a[0],a[1],7.16],[b[0],b[1],7.16],.13,'gilded sacred niche border');
  }
  if(o.detail>0) {
    for(const x of [-.5,0,.5])r.box('roofGoldLight',x,16.8,7.18,.12,2.0,.05,'abstract sacred gold inscription stroke');
    for(const y of [16.3,17.4,18])r.box('roofGoldLight',0,y,7.19,1.2,.10,.05,'abstract sacred gold inscription stroke');
    for(let i=0;i<16;i++) {
      const a=i*Math.PI/8,x=Math.cos(a)*2.45,z=Math.sin(a)*2.45;
      r.cylinder('metalDark',x,31.77,z,.025,.42,'bronze canopy bell suspension',6);
      r.sphere('bronze',x,31.52,z,.10,.14,.10,'small hanging bronze canopy bell');
    }
    for(const side of [-1,1])for(let i=0;i<6;i++) {
      const u=-10+i*4;
      r.cylinder('marble',u,1.85,side*11,.16,1.3,'stone terrace balustrade post',8);
      r.cylinder('marble',side*11,1.85,u,.16,1.3,'stone terrace balustrade post',8);
    }
  }
  // Shanyin Hall is integral context, never counted as another landmark.
  const shanyinStart=r.parts.length,z=13.917783;
  r.box('vermilionDark',0,2.25,z,8.4,4.5,8.4,'Shanyin Hall red raised platform');
  r.box('marble',0,4.7,z,8.7,.4,8.7,'Shanyin Hall white terrace');
  r.box('roofGreen',0,7.1,z,5.5,4.4,5.5,'Shanyin Hall glazed-brick walls');
  for(const x of [-2.9,2.9])for(const zz of [-2.9,2.9])r.cylinder('vermilion',x,7.1,z+zz,.17,4.5,'Shanyin Hall corner column',8);
  r.add(HIP_ROOF,'roofGold',[0,9.1,z],[8.3,1.35,8.3],[0,0,0],'Shanyin Hall square lower golden roof');
  const roofProfile=[[3.6,10.25],[3.4,10.12],[2.65,10.8],[1.45,11.8],[.4,12.6]];
  r.add(latheGeometry(roofProfile,48),'roofGold',[0,0,z],[1,1,1],[0,0,0],'Shanyin Hall round upper gilded roof');
  r.sphere('roofGoldLight',0,13.05,z,.32,.5,.32,'Shanyin Hall golden finial');
  if(o.detail>0) {
    for(const side of [-1,1])for(let i=0;i<7;i++)for(let j=0;j<5;j++)r.box(j%2?'roofBlue':'roofGoldLight',-2.35+i*.78,5.5+j*.7,z+side*2.79,.40,.43,.06,'small coloured glazed Buddha tile abstraction');
    r.box('bronze',0,7.0,z+2.85,2.3,3.5,.12,'Shanyin Hall bronze lattice doors');
  }
  for(const p of r.parts.slice(shanyinStart))p.position[0]+=.16647;
  return r;
}

function jingshan(o) {
  const r=new Recipe('景山万春亭 · Jingshan Wanchun Pavilion');
  r.box('marble',0,.75,0,23,1.5,23,'summit pavilion terrace');
  r.box('vermilionDark',0,6.6,0,12,10.2,12,'central timber pavilion');
  for(const x of [-9,0,9])for(const z of [-9,9])r.cylinder('vermilion',x,6.2,z,.35,9.4,'outer pavilion column',10);
  for(const z of [-9,0,9])for(const x of [-9,9])r.cylinder('vermilion',x,6.2,z,.35,9.4,'outer pavilion column',10);
  r.box('greenBeam',0,10.7,0,21,.9,21,'painted pavilion bracket course');
  traditionalRoof(r,26,26,10.7,3.2,'roofGold',o.detail,true);
  r.box('greenBeam',0,13.4,0,13,1.4,13,'upper lantern bracket');
  traditionalRoof(r,18,18,13.5,3.67,'roofGold',o.detail,true);
  stairs(r,10,12,1.5,5,5);
  return r;
}

function imperialVault(o) {
  const r=new Recipe('皇穹宇 · Imperial Vault of Heaven');
  r.cylinder('marble',0,.9,0,13,1.8,'circular marble platform',64);
  r.cylinder('vermilion',0,6.2,0,7.8,8.8,'single circular red hall',64);
  for(let i=0;i<20;i++) {
    const a=i/20*Math.PI*2;r.cylinder('vermilionDark',Math.cos(a)*8.2,6.2,Math.sin(a)*8.2,.21,8.8,'red circular timber column',8);
  }
  r.cylinder('greenBeam',0,10.5,0,9.2,.6,'painted entablature',64);
  r.add(latheGeometry([[10.3,11.3],[10,10.9],[8,12],[5,14],[.9,17.3]],64),'roofBlue',[0,0,0],[1,1,1],[0,0,0],'single swept blue glazed conical roof');
  r.cylinder('bronze',0,17.8,0,.65,1,'gilt finial base',24,.65);
  r.sphere('roofGoldLight',0,18.6,0,.48,.42,.48,'gilt finial');
  if(o.detail>0)for(let i=0;i<48;i++) {
    const a=i/48*Math.PI*2;
    beam(r,'roofBlueLight',[Math.cos(a)*10.1,11.1,Math.sin(a)*10.1],[Math.cos(a)*5,14.1,Math.sin(a)*5],.04,'blue roof tile roll');
  }
  stairs(r,6,13.3,1.8,7,6);
  return r;
}

export function registerHistoricLandmarks(register) {
  register('zhengyangmen','正阳门城楼',43.65,o=>zhengyangmen(o,false));
  register('zhengyangmen_arrow','正阳门箭楼',35.37,o=>zhengyangmen(o,true));
  register('drum_tower','鼓楼',46.7,drumTower);
  register('bell_tower','钟楼',47.9,bellTower);
  register('lama_temple','雍和宫万福阁',25,lamaTemple);
  register('beihai_white_pagoda','北海白塔',35.9,whitePagoda);
  register('jingshan_pavilion','景山万春亭',17.4,jingshan);
  register('imperial_vault','天坛皇穹宇',19.02,imperialVault);
}
