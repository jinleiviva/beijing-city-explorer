import {ncpaRefined} from './ncpa.js';
import {galaxySohoRefined} from './galaxy-soho.js';
import {chinaWorldRefined}from'./china-world.js';
import { Recipe, BOX, HIP_ROOF, CHAMFER_BOX, rectangleRing, loftGeometry, latheGeometry, annulusGeometry, ellipseRing, seededRandom, beam } from './geometry.js';
import { buildingRecipe, detailLevel, traditionalRoof } from './buildings.js';
import { registerModernLandmarks } from './landmark-modern.js';
import { registerCivicLandmarks } from './landmark-civic.js';
import { registerHistoricLandmarks } from './landmark-historic.js';
import { registerCityLandmarks } from './landmark-city.js';
import { registerInfrastructureLandmarks } from './landmark-infrastructure.js';
import {palaceEnsemble} from './palace-ensemble.js';
import {chinaZunRefined,cctvRefined} from './flagship-cbd.js';
import {templeHeavenRefined} from './temple-heaven.js';
import {wangjingSohoRefined} from './wangjing-soho.js';

/** Landmark geometry is an original, photo-researched approximation in metres. */
const registry={};
function register(id,name,height,factory) {registry[id]={name,height,factory};}
const lerp=(a,b,t)=>a+(b-a)*t;
const add=(a,b)=>a.map((n,i)=>n+b[i]);

function ring(w,d,y,x=0,z=0,chamfer=.06) {return {y,points:rectangleRing(w,d,chamfer).map(([xx,zz])=>[xx+x,zz+z])};}
function loft(r,material,rings,label) {r.add(loftGeometry(rings),material,[0,0,0],[1,1,1],[0,0,0],label);}

function chinaZun(o) {
  const r=new Recipe('中国尊 · CITIC Tower');
  const count=o.detail===2?32:20,h=528;
  const width=t=>t<.48?54+24*Math.pow(1-t/.48,2):54+15*Math.pow((t-.48)/.52,1.9);
  const rings=[];for(let i=0;i<=count;i++){const t=i/count;rings.push(ring(width(t),width(t),h*t));}
  loft(r,'glassBlue',rings,'flared zun-shaped curtain wall');
  const ribs=o.detail===0?8:o.detail===1?12:20;
  for(let side=0;side<4;side++) for(let n=0;n<=ribs;n++) {
    const u=-.45+.9*n/ribs,a=side*Math.PI/2;
    for(let j=0;j<count;j++) {
      const points=[j,j+1].map(k=>{const t=k/count,w=width(t)+.3,x=u*w,z=w*.5;return[x*Math.cos(a)+z*Math.sin(a),h*t,-x*Math.sin(a)+z*Math.cos(a)];});
      beam(r,'metal',points[0],points[1],.18,'continuous silver facade rib');
    }
  }
  const step=o.detail===0?32:o.detail===1?16:8;
  for(let y=12;y<h;y+=step) {
    const w=width(y/h)+.5;
    for(const z of [-w/2,w/2]) r.box('metalDark',0,y,z,w,.28,.2,'glass floor joint');
    for(const x of [-w/2,w/2]) r.box('metalDark',x,y,0,.2,.28,w,'glass floor joint');
  }
  r.box('glassDark',0,524,0,57,7,57,'open crown interior');
  for(const x of [-35,35]) r.box('metal',x,526,0,.65,4,69,'crown lip');
  for(const z of [-35,35]) r.box('metal',0,526,z,69,4,.65,'crown lip');
  r.box('stoneLight',0,.5,0,91,1,91,'plaza plinth');
  r.box('glassPale',0,8,42,42,.5,15,'south lobby canopy');
  return r;
}

/** Leaning rectangular prism with structural diagonal grids on all four faces. */
function diagridPrism(r,base,top,w,d,material,detail=1,label='diagrid tower') {
  const bottom=ring(w,d,base[1],base[0],base[2],0),upper=ring(w,d,top[1],top[0],top[2],0);
  // Remove duplicate corner pairs from a zero-chamfer octagon.
  bottom.points=bottom.points.filter((_,i)=>i%2===0);upper.points=upper.points.filter((_,i)=>i%2===0);
  loft(r,material,[bottom,upper],label);
  const levels=detail===0?5:detail===1?9:14;
  const sides=[[[ -w/2,-d/2],[w/2,-d/2]],[[w/2,-d/2],[w/2,d/2]],[[w/2,d/2],[-w/2,d/2]],[[-w/2,d/2],[-w/2,-d/2]]];
  const point=(edge,t,u)=>{const center=base.map((n,i)=>lerp(n,top[i],t));return[center[0]+lerp(edge[0][0],edge[1][0],u),center[1],center[2]+lerp(edge[0][1],edge[1][1],u)];};
  for(const edge of sides) for(let k=0;k<levels;k++) {
    const t0=k/levels,t1=(k+1)/levels,cols=detail===0?2:3;
    for(let n=0;n<cols;n++) {
      beam(r,'metalDark',point(edge,t0,n/cols),point(edge,t1,(n+1)/cols),.5,'structural diagonal');
      beam(r,'metalDark',point(edge,t1,n/cols),point(edge,t0,(n+1)/cols),.5,'structural diagonal');
    }
    if(detail>0) beam(r,'metal',point(edge,t0,0),point(edge,t0,1),.15,'floor edge');
  }
}

function cctv(o) {
  const r=new Recipe('中央电视台总部 · CCTV Headquarters');
  // True loop typology: two inclined shafts, lower podium and a high 3D cantilever.
  r.box('stone',0,5,0,190,10,160,'broadcasting podium');
  r.box('glassDark',-25,14,20,145,18,94,'broadcast production base');
  diagridPrism(r,[-55,10,38],[-32,198,12],52,54,'glass',o.detail,'inclined southwest tower');
  diagridPrism(r,[57,10,-33],[34,234,-18],48,58,'glass',o.detail,'inclined northeast tower');
  // Two deep bridge arms close the loop while retaining a large central void.
  loft(r,'glass',[ring(50,108,180,-31,-15,0),ring(50,108,218,-26,-15,0)],'southwest cantilever arm');
  loft(r,'glass',[ring(109,53,193,4,-42,0),ring(109,53,234,4,-42,0)],'upper cantilever connecting arm');
  for(let k=0;k<6;k++) {
    const x=-49+k*21;
    beam(r,'metalDark',[x,193,-15],[Math.min(x+21,58),234,-15],.55,'cantilever diagonal');
    beam(r,'metalDark',[x,234,-15],[Math.min(x+21,58),193,-15],.55,'cantilever diagonal');
    beam(r,'metalDark',[x,193,-69],[Math.min(x+21,58),234,-69],.55,'rear cantilever diagonal');
  }
  for(let k=0;k<5;k++) {
    const z=-66+k*22;
    beam(r,'metalDark',[-56,180,z],[-51,218,Math.min(z+22,39)],.55,'cantilever side diagonal');
    beam(r,'metalDark',[-56,180,Math.min(z+22,39)],[-51,218,z],.55,'cantilever side diagonal');
  }
  r.cylinder('metalDark',34,234.3,-18,10,.6,'rooftop helipad',40);
  return r;
}

const chinaWorld=chinaWorldRefined;



const ncpa=ncpaRefined;

function templeHeaven(o) {
  const r=new Recipe('天坛祈年殿 · Hall of Prayer for Good Harvests');
  for(const [radius,y,height] of [[45.15,.95,1.9],[39.65,2.8,1.8],[34.1,4.65,1.9]]) {
    r.cylinder('marble',0,y,0,radius,height,'three-tier circular marble altar',72);
    if(o.detail>0) for(let k=0;k<48;k++) {
      const a=k/48*Math.PI*2,x=Math.cos(a)*(radius-.6),z=Math.sin(a)*(radius-.6);
      r.cylinder('marble',x,y+height/2+.65,z,.16,1.3,'marble balustrade post',6);
    }
  }
  r.cylinder('vermilion',0,10.6,0,12,10,'red circular hall drum',64);
  for(let i=0;i<28;i++) {
    const a=i/28*Math.PI*2;
    r.cylinder('vermilionDark',Math.cos(a)*12.3,10.3,Math.sin(a)*12.3,.25,9.6,'circular outer column',8);
  }
  for(const [radius,y,height] of [[10.8,19.3,4.6],[7.9,26.2,3.5]]) {
    r.cylinder('greenBeam',0,y,0,radius,height,'painted upper circular drum',64);
    for(let i=0;i<20;i++){
      const a=i/20*Math.PI*2;
      r.cylinder('vermilion',Math.cos(a)*(radius+.05),y,Math.sin(a)*(radius+.05),.15,height,'upper drum red mullion',6);
    }
  }
  r.box('roofBlue',0,26.3,8.05,2.3,2.8,.12,'blue imperial inscription plaque');
  r.box('roofGoldLight',0,26.3,8.14,.35,1.9,.1,'gold plaque lettering abstraction');
  const roofs=[[16.35,14.5,3.6],[12.8,21.4,3.5],[9.7,27.7,7.5]];
  for(const [radius,y,rise] of roofs) {
    r.cylinder('greenBeam',0,y-.35,0,radius*.83,.7,'painted circular entablature',64);
    const profile=[[radius,y+.6],[radius*.96,y],[radius*.74,y+rise*.25],[radius*.43,y+rise*.6],[radius*.08,y+rise]];
    r.add(latheGeometry(profile,o.detail===0?48:72),'roofBlue',[0,0,0],[1,1,1],[0,0,0],'conical blue glazed swept roof');
    if(o.detail>0) for(let i=0;i<48;i++) {
      const a=i/48*Math.PI*2;
      for(let j=0;j<profile.length-1;j++) {
        const p=profile.slice(j,j+2).map(([rr,yy])=>[Math.cos(a)*(rr+.03),yy+.04,Math.sin(a)*(rr+.03)]);
        beam(r,'roofBlueLight',p[0],p[1],.055,'radial glazed tile roll');
      }
    }
  }
  r.cylinder('bronze',0,35.6,0,1.1,1.9,'golden finial pedestal',24,.65);
  r.sphere('roofGoldLight',0,37,0,.75,1,.75,'gilded roof finial');
  for(let k=0;k<12;k++) r.box('marble',0,.2+k*.43,46-k*.8,8,.4,1.5,'south ceremonial stair');
  return r;
}

function forbiddenCity(o) {
  const r=new Recipe('故宫建筑群 · Forbidden City ensemble');
  const w=753,d=961;
  r.box('paving',0,.12,0,w,.24,d,'palace courts');
  for(const x of [-w/2,w/2])r.box('vermilionDark',x,5,0,7,10,d,'east-west palace wall');
  for(const z of [-d/2,d/2])r.box('vermilionDark',0,5,z,w,10,7,'north-south palace wall');
  // Deliberately preserve the north-south sequence and large ceremonial voids.
  const halls=[
    {z:165,w:64,d:37,h:35.05,id:'Hall of Supreme Harmony'},
    {z:88,w:25,d:25,h:21,id:'Hall of Central Harmony'},
    {z:17,w:50,d:25,h:29,id:'Hall of Preserving Harmony'},
    {z:-97,w:46,d:28,h:26,id:'Palace of Heavenly Purity'},
    {z:-157,w:18,d:18,h:20,id:'Hall of Union'},
    {z:-212,w:40,d:22,h:22,id:'Palace of Earthly Tranquility'},
  ];
  for(const hall of halls) {
    const recipe=buildingRecipe('palace',{width:hall.w,depth:hall.d,height:hall.h,detail:o.detail,variant:hall.w<30?1:0});
    recipe.parts.forEach(p=>p.label=`${hall.id}: ${p.label}`);r.merge(recipe,[0,0,hall.z]);
  }
  r.box('marble',0,2.1,105,125,4.2,220,'three great halls continuous terrace');
  for(const side of [-1,1]) {
    for(let j=0;j<5;j++) for(let i=0;i<3;i++) {
      const x=side*(100+i*78),z=-250+j*118;
      r.merge(buildingRecipe('palace',{width:45,depth:20,height:14,detail:Math.min(o.detail,1),variant:1}),[x,0,z]);
      r.box('vermilionDark',x,2.6,z+36,59,5.2,1.5,'enclosed subsidiary courtyard wall');
    }
    for(const z of [230,342]) r.merge(buildingRecipe('palace',{width:112,depth:15,height:15,detail:Math.min(o.detail,1),variant:1}),[side*180,0,z]);
  }
  for(const x of [-w/2,w/2]) for(const z of [-d/2,d/2]) {
    const corner=buildingRecipe('palace',{width:21,depth:21,height:24,detail:o.detail});r.merge(corner,[x,10,z]);
    r.merge(buildingRecipe('palace',{width:14,depth:28,height:18,detail:Math.min(o.detail,1)}),[x,12,z],Math.PI/2);
  }
  // Meridian Gate: broad base, central hall, two wings and projecting arms.
  r.box('vermilionDark',0,6,d/2-8,140,12,32,'Meridian Gate high podium');
  r.merge(buildingRecipe('palace',{width:60,depth:28,height:24,detail:o.detail}),[0,12,d/2-8]);
  for(const side of [-1,1]) {
    r.merge(buildingRecipe('palace',{width:32,depth:22,height:18,detail:Math.min(o.detail,1)}),[side*57,12,d/2-8]);
    r.box('vermilionDark',side*66,6,d/2+27,20,12,70,'Meridian Gate projecting wing');
    r.merge(buildingRecipe('palace',{width:24,depth:22,height:18,detail:Math.min(o.detail,1)}),[side*66,12,d/2+59]);
  }
  r.merge(buildingRecipe('palace',{width:44,depth:22,height:22,detail:o.detail}),[0,10,-d/2]);
  return r;
}

function tiananmen(o) {
  const r=new Recipe('天安门城楼 · Tiananmen Gate');
  r.box('stoneDark',0,1.1,0,68,2.2,37,'stone foundation');
  r.box('vermilion',0,8.8,0,66,15.4,36,'broad red gate platform');
  // Inset dark portals suggest deep masonry arches without expensive boolean geometry.
  for(const x of [-24,-12,0,12,24]) {
    const width=x===0?6.2:4.6,height=x===0?8:6.3;
    r.box('vermilionDark',x,height*.43,18.08,width,height*.86,.2,'recessed gate opening');
    r.add(latheGeometry([[width/2,0],[width/2,.08]],24),'vermilionDark',[x,height*.86,18.12],[1,1,1],[Math.PI/2,0,0],'arched gate head');
  }
  r.box('marble',0,16.7,0,69,.9,39,'white terrace balustrade base');
  r.box('vermilionDark',0,21.2,0,59,8.3,26,'upper timber hall');
  for(let i=0;i<13;i++) for(const z of [-14,14]) r.cylinder('vermilion',-29+i*58/12,21,z,.3,8,'red columns',8);
  r.box('greenBeam',0,25.1,0,64,.75,30,'painted lower eave');
  traditionalRoof(r,72,39,25.2,4.7,'roofGold',o.detail,true);
  r.box('vermilionDark',0,29.1,0,50,2.6,20,'double-eave upper wall');
  traditionalRoof(r,65,31,29.6,4.9,'roofGold',o.detail,true);
  // Inscription panels are abstracted; no invented portrait or unreadable pseudo-text.
  for(const x of [-20,20]) r.box('sign',x,11.6,18.16,22,2.3,.18,'inscription panel');
  r.box('bronze',0,11.0,18.2,4.2,5.5,.25,'central framed portrait panel');
  for(const x of [-26,-13,0,13,26]) {
    r.box('marble',x,.45,30,5,.9,25,'Jinshui bridge approach');
    if(o.detail>0) for(const side of [-1,1])r.box('marble',x+side*2.2,1.2,30,.2,.7,25,'marble bridge parapet');
  }
  return r;
}

function nationalStadium(o) {
  const r=new Recipe('国家体育场鸟巢 · Beijing National Stadium');
  // Beijing construction archive: E-W 298 m, N-S 333 m; roof opening 124 x 182 m.
  const rx=149,rz=166.5,n=96,vertices=[],wallIndices=[],roofIndices=[],seatIndices=[];
  const rim=a=>56+13.2*Math.cos(a*2);
  const sections=[[.90,.90,0],[.965,.965,24],[.945,.945,.985],[62/rx,91/rz,.985],[.40,.52,.62],[.24,.36,.1]];
  for(let j=0;j<sections.length;j++)for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2,[sx,sz,y]=sections[j];vertices.push(rx*sx*Math.cos(a),j===0?2:j===1?y:rim(a)*y,rz*sz*Math.sin(a));
  }
  for(let j=0;j<sections.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=(j+1)*n+(i+1)%n,d=(j+1)*n+i;(j<2?wallIndices:j===2?roofIndices:seatIndices).push(a,b,d,b,c,d);}
  r.add({type:'mesh',vertices,indices:wallIndices},'glassDark',[0,0,0],[1,1,1],[0,0,0],'recessed dark stadium outer concourse');
  r.add({type:'mesh',vertices,indices:roofIndices},'metalDark',[0,0,0],[1,1,1],[0,0,0],'grey stadium roof membrane beneath open steel lattice');
  r.add({type:'mesh',vertices,indices:seatIndices},'vermilionDark',[0,0,0],[1,1,1],[0,0,0],'red inner seating bowl and stadium terraces');
  r.box('grass',0,2,0,68,.5,106,'football field');
  r.add(annulusGeometry(.72,96),'awning',[0,1.7,0],[58,.5,82],[0,0,0],'athletics running track');
  const p=(a,t)=>{
    const bulge=.94+.065*Math.sin(t*Math.PI),top=rim(a);
    return[rx*bulge*Math.cos(a),2+t*(top-2),rz*bulge*Math.sin(a)];
  };
  const ribs=o.detail===0?36:64;
  // Interwoven spatial steel paths, deliberately irregular rather than a regular cage.
  for(let i=0;i<ribs;i++) {
    const a=i/ribs*Math.PI*2,twist=(i%2?1:-1)*(.35+.35*((i*7)%11)/10);
    for(let j=0;j<9;j++)beam(r,'metal',p(a+twist*j/9,j/9),p(a+twist*(j+1)/9,(j+1)/9),i%3===0?1.05:.66,'interwoven exterior steel ribbon');
    const a0=a+twist;
    for(let j=0;j<5;j++) {
      const q=k=>{const t=k/5,angle=a0+t*(i%2?-.7:.7);return[lerp(rx*.97,62,t)*Math.cos(angle),rim(angle)+1.0*Math.sin(t*Math.PI),lerp(rz*.97,91,t)*Math.sin(angle)];};
      beam(r,'metal',q(j),q(j+1),.85,'roof steel lattice');
    }
  }
  for(let j=1;j<7;j++)for(let i=0;i<n;i++) {
    const a=i/n*Math.PI*2,aa=(i+1)/n*Math.PI*2,t=j/7+.035*Math.sin(a*7+j);
    beam(r,'metal',p(a,t),p(aa,j/7+.035*Math.sin(aa*7+j)),.52,'irregular horizontal steel ribbon');
  }
  return r;
}

function clipPolygon(poly,nx,ny,d) {
  const out=[];
  for(let i=0;i<poly.length;i++) {
    const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*nx+a[1]*ny-d,db=b[0]*nx+b[1]*ny-d;
    if(da<=1e-8)out.push(a);
    if((da<0)!==(db<0)){const t=da/(da-db);out.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t)]);}
  }
  return out;
}
function waterCube(o) {
  const r=new Recipe('国家游泳中心水立方 · Water Cube'),random=seededRandom(2008);
  const w=177,h=31,d=177;
  r.box('glassBlue',0,h/2,0,w,h,d,'translucent aquatics centre volume');
  const buckets=Array.from({length:3},()=>({type:'mesh',vertices:[],indices:[]}));
  function surface(width,height,transform,cellSize) {
    const pts=[],cols=Math.ceil(width/cellSize),rows=Math.ceil(height/cellSize);
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)pts.push([(i+.25+random()*.5)*width/cols-width/2,(j+.25+random()*.5)*height/rows-height/2]);
    for(let index=0;index<pts.length;index++) {
      const p=pts[index];let poly=[[-width/2,-height/2],[width/2,-height/2],[width/2,height/2],[-width/2,height/2]];
      for(let k=0;k<pts.length;k++)if(k!==index) {
        const q=pts[k];if(Math.hypot(q[0]-p[0],q[1]-p[1])>cellSize*2.8)continue;
        poly=clipPolygon(poly,q[0]-p[0],q[1]-p[1],(q[0]*q[0]+q[1]*q[1]-p[0]*p[0]-p[1]*p[1])/2);
        if(!poly.length)break;
      }
      if(poly.length<3)continue;
      const mesh=buckets[index%3],base=mesh.vertices.length/3;
      const center=transform(p[0],p[1],.65);mesh.vertices.push(...center);
      for(const corner of poly)mesh.vertices.push(...transform(corner[0],corner[1],.08));
      for(let i=0;i<poly.length;i++) {
        mesh.indices.push(base,base+i+1,base+(i+1)%poly.length+1);
        if(index%2===0||o.detail>0) beam(r,'metal',transform(...poly[i],.12),transform(...poly[(i+1)%poly.length],.12),.13,'ETFE pillow seam');
      }
    }
  }
  const cell=o.detail===0?14:10;
  surface(w,h,(u,v,n)=>[u,v+h/2,d/2+n],cell);
  surface(w,h,(u,v,n)=>[-u,v+h/2,-d/2-n],cell);
  surface(d,h,(u,v,n)=>[w/2+n,v+h/2,-u],cell);
  surface(d,h,(u,v,n)=>[-w/2-n,v+h/2,u],cell);
  surface(w,d,(u,v,n)=>[u,h+n,-v],cell*1.15);
  buckets.forEach((geo,i)=>r.add(geo,['glassBlue','glass','glassPale'][i],[0,0,0],[1,1,1],[0,0,0],'irregular ETFE foam pillow field'));
  r.box('glassDark',0,3,d/2+.8,35,6,2,'south entrance portal');
  return r;
}

const SOHO_RING=annulusGeometry(.28,64);
function curvedBridge(r,a,b,width,y,label) {
  const vertices=[],indices=[],segments=8;
  for(let j=0;j<=segments;j++) {
    const t=j/segments,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t)+Math.sin(t*Math.PI)*width*.45;
    const dx=b[0]-a[0],dz=b[1]-a[1]+Math.cos(t*Math.PI)*Math.PI*width*.45,len=Math.hypot(dx,dz);
    const nx=-dz/len*width/2,nz=dx/len*width/2;
    for(const [side,yy] of [[-1,-.65],[1,-.65],[1,.65],[-1,.65]])vertices.push(x+side*nx,y+yy,z+side*nz);
  }
  for(let j=0;j<segments;j++)for(let k=0;k<4;k++){const a=j*4+k,b=(j+1)*4+k,c=(j+1)*4+(k+1)%4,d=j*4+(k+1)%4;indices.push(a,b,d,b,c,d);}
  r.add({type:'mesh',vertices,indices},'stoneLight',[0,0,0],[1,1,1],[0,0,0],label);
}
const galaxySOHO=galaxySohoRefined;

function wangjingSOHO(o) {
  const r=new Recipe('望京SOHO · Wangjing SOHO');
  // Relative centres converted from the three unmodified OSM/WGS84 tower footprints.
  const towers=[[-27.6,67.5,54,37,200],[40.3,31.2,48,31,127],[-88.9,-62.2,52,34,118]];
  for(let i=0;i<towers.length;i++) {
    const [cx,cz,rx,rz,h]=towers[i],far=o.lod==='silhouette',floors=far?7:Math.round(h/4),rings=[],slices=far?12:24,segments=far?28:64;
    const profile=t=>Math.max(.05,.92+.13*Math.sin(t*Math.PI)-.88*Math.pow(t,3));
    for(let j=0;j<=slices;j++) {
      const t=j/slices,s=profile(t);rings.push(ellipseRing(rx*s,rz*s,h*t,cx+t*t*16,cz-t*t*8,segments));
    }
    loft(r,'glassDark',rings,'asymmetric pebble-shaped office tower');
    for(let f=1;f<floors;f++) {
      const t=f/floors,s=profile(t);
      r.add({type:'cylinder',segments,topRadius:1},'stoneLight',[cx+t*t*16,h*t,cz-t*t*8],[rx*s+.35,.6,rz*s+.35],[0,0,0],'continuous silver horizontal band');
    }
  }
  return r;
}

register('china_zun','中国尊',528,chinaZunRefined);
register('cctv','中央电视台总部',234,cctvRefined);
register('china_world_3','国贸三期A座',330,o=>chinaWorld(o,false));
register('china_world_3b','国贸三期B座',296,o=>chinaWorld(o,true));
register('ncpa','国家大剧院',46.68,ncpa);
register('temple_heaven','天坛祈年殿',38,templeHeavenRefined);
register('forbidden_city','故宫建筑群',35.6,palaceEnsemble);
register('tiananmen','天安门',34.7,tiananmen);
register('national_stadium','国家体育场鸟巢',69.2,nationalStadium);
register('water_cube','国家游泳中心水立方',31,waterCube);
register('galaxy_soho','银河SOHO',67,galaxySOHO);
register('wangjing_soho','望京SOHO',200,wangjingSohoRefined);
registerModernLandmarks(register);
registerCivicLandmarks(register);
registerHistoricLandmarks(register);
registerCityLandmarks(register);
registerInfrastructureLandmarks(register);

export const LANDMARK_IDS=Object.keys(registry);
export function landmarkRecipe(id,options={}) {
  const aliases={chinaZun:'china_zun',chinaWorld:'china_world_3',templeHeaven:'temple_heaven',forbiddenCity:'forbidden_city'};
  id=aliases[id]??id;
  const item=registry[id];
  if(!item) throw new Error(`Unknown Beijing landmark "${id}". Available: ${LANDMARK_IDS.join(', ')}`);
  const silhouette=options.lod==='silhouette';
  const detail=silhouette?0:detailLevel(options.detail);
  const recipe=item.factory({...options,detail});
  if(silhouette) {
    // Preserve each building's actual form, voids, roof stacks and compound layout.
    // Remove sub-pixel decoration rather than substituting a generic box.
    const small=/tile roll|panel seam|floor joint|solar shading fin|continuous silver facade rib|window|mullion|spandrel|balustrade post|inscription|sign panel|sign backing|door stile|facade joint|facade seam|stem fluting|flag|HVAC|fan$|pillow seam|clock .*hand|clock .*tick|shop .*graphic|lattice window/;
    const counted=new Map();
    recipe.parts=recipe.parts.filter(p=>{
      if(small.test(p.label))return false;
      if(/structural diagonal|cantilever diagonal|cantilever side diagonal|irregular horizontal steel ribbon/.test(p.label))return false;
      if(/interwoven exterior steel ribbon|roof steel lattice/.test(p.label)) {
        const n=counted.get(p.label)||0;counted.set(p.label,n+1);
        const chain=p.label==='roof steel lattice'?5:9;
        return Math.floor(n/chain)%3===0;
      }
      if(/horizontal band|floor edge|floor rim|annular band/.test(p.label)) {
        const n=counted.get(p.label)||0;counted.set(p.label,n+1);return n%3===0;
      }
      return true;
    });
  }
  recipe.metadata={...recipe.metadata,landmark:id,nameZh:item.name,approx:true,height:item.height,detail,lod:silhouette?'silhouette':'detailed',units:'metres'};
  return recipe;
}
