import {scienceMuseumRefined} from './science-museum.js';
import {agricultureExhibitionRefined} from './agriculture-exhibition.js';
import {Recipe,HIP_ROOF,ellipseRing,loftGeometry,beam} from './geometry.js';
import {traditionalRoof} from './buildings.js';
import {windowGrid,stairs,clockFace,portico} from './landmark-utils.js';

function beijingRailway(o) {
  const r=new Recipe('北京站 · Beijing Railway Station');
  r.box('stoneLight',0,1,0,228,2,92,'station platform');
  r.box('stone',0,12.5,0,224,23,82,'long symmetrical station frontage');
  r.box('stoneLight',0,26,-3,89,7,62,'raised central station hall');
  r.box('glassDark',0,17,41.2,80,20,.3,'tall central waiting-hall glazing');
  for(let i=0;i<12;i++)r.box('stoneLight',-40+i*80/11,17,41.6,.8,21,.7,'central hall pier');
  for(const side of [-1,1]) {
    const x=side*53;
    r.box('stoneLight',x,18,34,18,34,23,'twin station clock tower');
    clockFace(r,x,31,45.7,3.1);
    const roof=new Recipe('station tower roof');traditionalRoof(roof,23,27,35,3.8,'roofGrey',o.detail,true);r.merge(roof,[x,0,34]);
    r.cylinder('bronze',x,39.2,34,.4,1.3,'clock tower finial',8,.1);
    windowGrid(r,{width:48,height:15,x:side*88,z:41.2,y:5,columns:11,rows:3,detail:o.detail});
  }
  r.box('roofGrey',0,23.7,-5,228,.7,88,'station flat wing roofs');
  r.box('stoneLight',0,29.8,-3,93,.6,65,'central hall roof cap');
  r.box('glassPale',0,5.5,49,195,.5,14,'long entrance canopy');
  stairs(r,202,57,1.5,9,4);
  return r;
}

function beijingWest(o) {
  const r=new Recipe('北京西站 · Beijing West Railway Station');
  r.box('stoneLight',0,2,0,450,4,130,'west station base');
  for(const side of [-1,1]) {
    r.box('stoneLight',side*135,24,-3,170,44,112,'long station office and waiting wing');
    windowGrid(r,{width:157,height:33,x:side*135,z:53.2,y:7,columns:30,rows:8,detail:o.detail});
    r.box('stone',side*86,33,17,49,62,75,'flanking high station pavilion');
    windowGrid(r,{width:40,height:45,x:side*86,z:54.7,y:9,columns:8,rows:10,detail:o.detail});
    r.add(HIP_ROOF,'roofGrey',[side*86,64,17],[59,7,85],[0,0,0],'traditional flanking station roof');
    r.box('stoneLight',side*48,35,31,25,66,48,'great gate structural pier');
    windowGrid(r,{width:17,height:42,x:side*48,z:55.2,y:13,columns:3,rows:10,detail:o.detail});
  }
  // The monumental central void remains genuinely open, including from behind.
  r.box('stoneLight',0,63,31,122,21,48,'great gate upper bridge');
  r.box('stone',0,73.8,31,127,.6,52,'great gate cornice');
  r.box('vermilionDark',0,78,31,34,8,28,'central traditional pavilion');
  r.add(HIP_ROOF,'roofGrey',[0,81.6,31],[45,5,38],[0,0,0],'central pavilion lower roof');
  r.box('stone',0,85.3,31,23,2.3,18,'upper pavilion drum');
  r.add(HIP_ROOF,'roofGrey',[0,86.2,31],[31,3.6,28],[0,0,0],'highest Chinese roof');
  r.box('sign',0,62,55.3,33,3,.2,'Beijing West station sign panel');
  for(const side of [-1,1])r.box('glassPale',side*129,7,62,165,.6,18,'long wing entrance canopy');
  return r;
}

function roofDome(rx,rz,h,base=0,segments=64,rows=18) {
  const rings=[];
  for(let j=0;j<=rows;j++) {
    const t=j/rows,a=t*Math.PI/2,s=Math.cos(a);
    rings.push(ellipseRing(Math.max(.08,rx*s),Math.max(.08,rz*s),base+h*Math.sin(a),0,0,segments));
  }
  return loftGeometry(rings);
}
function beijingSouth(o) {
  const r=new Recipe('北京南站 · Beijing South Railway Station'),far=o.lod==='silhouette',segments=far?28:64,rows=far?9:18;
  r.add({type:'cylinder',segments:far?32:96,topRadius:1},'glassDark',[0,6,0],[215,12,204],[0,0,0],'oval glazed station concourse');
  // Five separate overlapping oval roof shells reproduce the aerial shell rhythm.
  r.add(roofDome(78,204,28,12,segments,rows),'metal',[0,0,0],[1,1,1],[0,0,0],'long central arched roof shell');
  for(const side of [-1,1]) {
    r.add(roofDome(72,185,18,11,segments,rows),'metal',[side*107,0,0],[1,1,1],[0,0,0],'intermediate oval roof shell');
    r.add(roofDome(37,145,10,10,segments,rows),'metal',[side*177,0,0],[1,1,1],[0,0,0],'outer oval roof shell');
  }
  for(let k=-9;k<=9;k+=far?3:1) {
    const z=k*19,rx=78*Math.sqrt(Math.max(.01,1-(z/204)**2));
    beam(r,'glassDark',[-rx,15,z],[rx,15,z],.7,'station roof horizontal skylight seam');
  }
  for(const x of [-7,7])r.box('solar',x,39.5,0,8,.2,180,'central photovoltaic roof strip');
  r.box('glassPale',0,6,210,69,.6,22,'south station entrance canopy');
  return r;
}

function conventionCenter(o) {
  const r=new Recipe('国家会议中心 · China National Convention Center');
  const w=406,d=162;
  r.box('stoneLight',0,2,0,w+8,4,d+8,'convention centre terrace');
  r.box('stone',0,20,-5,w,36,d-10,'long exhibition and convention hall');
  r.box('glass',0,21,d/2-8,w-22,32,.4,'long transparent east facade');
  for(let i=0;i<52;i++)r.box('stoneLight',-w/2+12+i*(w-24)/51,22,d/2-6,1.3,34,2,'tall facade rhythm');
  // A shallow upward-curving eave sweeps continuously along the full facade.
  const vertices=[],indices=[],n=40;
  for(let j=0;j<=n;j++) {
    const x=-w/2+j*w/n,t=x/(w/2),y=38+5*Math.pow(Math.abs(t),4);
    vertices.push(x,y,d/2+6,x,y,-d/2-4,x,y-1.2,-d/2-4,x,y-1.2,d/2+6);
  }
  for(let j=0;j<n;j++)for(let k=0;k<4;k++){const a=j*4+k,b=(j+1)*4+k,c=(j+1)*4+(k+1)%4,d=j*4+(k+1)%4;indices.push(a,b,d,b,c,d);}
  r.add({type:'mesh',vertices,indices},'metal',[0,0,0],[1,1,1],[0,0,0],'long upswept convention hall roof');
  for(const x of [-145,0,145])r.box('glassPale',x,7,91,72,.4,20,'conference entrance canopy');
  stairs(r,342,102,4,18,8);
  return r;
}

export function registerInfrastructureLandmarks(register) {
  register('beijing_railway','北京站',40,beijingRailway);
  register('beijing_west_railway','北京西站',90,beijingWest);
  register('beijing_south_railway','北京南站',40,beijingSouth);
  register('china_science_museum','中国科学技术馆',42,scienceMuseumRefined);
  register('national_convention_center','国家会议中心',43,conventionCenter);
  register('agriculture_exhibition','全国农业展览馆',34,agricultureExhibitionRefined);
}
