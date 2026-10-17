import{olympicTowerRefined}from'./olympic-tower.js';
import{telegraphRefined}from'./telegraph-building.js';
import {ancientObservatoryRefined} from './ancient-observatory.js';
import {beijingHotelRefined} from './beijing-hotel.js';
import {polygonPrism} from './site-massing.js';
import {Recipe,GABLE_ROOF,HIP_ROOF,ellipseRing,loftGeometry,latheGeometry,annulusGeometry,beam} from './geometry.js';
import {traditionalRoof,buildingRecipe} from './buildings.js';
import {windowGrid,stairs,portico,clockFace} from './landmark-utils.js';

function church(o,gothic=false) {
  const r=new Recipe(gothic?'西什库天主堂 · Xishiku Cathedral':'王府井天主堂 · St Joseph’s Church');
  // Local +Z is the principal front. Geographic west-facing Dongtang uses -PI/2.
  const width=gothic?21.8:24.8,depth=gothic?60:64,wall=gothic?'stoneDark':'greyBrick';
  const naveW=gothic?17.8:21.6,naveD=gothic?54:55.4,naveZ=gothic?-2.5:-3.8,wallTop=gothic?12.8:18.5,roofRise=gothic?3.7:5.5;
  r.box('stoneLight',0,.5,0,width+4,1,depth+5,'church stone platform');
  r.box(wall,0,(wallTop+1)/2,naveZ,naveW,wallTop-1,naveD,'masonry basilica nave');
  r.add(GABLE_ROOF,'roofGrey',[0,wallTop,naveZ],[naveD+1,roofRise,naveW+.9],[0,Math.PI/2,0],'long gabled nave roof');
  if(gothic){
    // Actual OSM outline has a broad northern transept and narrow rear apse.
    r.box('stoneLight',0,.5,-8,40.1,1,14,'cross-transept stone footing');
    r.box(wall,0,6.9,-8,38.3,11.8,12,'broad northern Gothic cross transept');
    r.add(GABLE_ROOF,'roofGrey',[0,12.8,-8],[38.8,3.7,13.0],[0,0,0],'perpendicular low transept roof');
    r.add({type:'cylinder',segments:8,topRadius:1},wall,[0,6.9,-26.6],[6.4,11.8,6.4],[0,Math.PI/8,0],'polygonal northern church apse');
    r.add(latheGeometry([[6.7,12.8],[6.6,13.2],[.25,16.5]],8),'roofGrey',[0,0,-26.6],[1,1,1],[0,Math.PI/8,0],'low polygonal apse roof');
  }
  const roundOpening=(x,bottom,z,w,h,label,pointed=false)=>{
    const rad=w/2,pts=[[-rad,0],[rad,0],[rad,h-(pointed?rad:rad)]];
    if(pointed)pts.push([0,h],[-rad,h-rad]);else for(let j=1;j<=10;j++){const a=j*Math.PI/10;pts.push([Math.cos(a)*rad,h-rad+Math.sin(a)*rad]);}
    r.add(polygonPrism(pts.map(([u,v])=>[u,-v]),-.06,.06),'window',[x,bottom,z],[1,1,1],[Math.PI/2,0,0],label);
  };
  const towerX=gothic?7.5:8.6,towerW=gothic?6.6:6.8,towerZ=depth/2-4.5;
  for(const side of [-1,1]) {
    const x=side*towerX,z=towerZ,towerTop=gothic?26.5:22;
    r.box(wall,x,(towerTop+1)/2,z,towerW,towerTop-1,9,'front bell tower');
    for(const sx of [-1,1])r.box('stoneLight',x+sx*(towerW/2-.35),towerTop/2,z+4.57,.47,towerTop,.48,'tower vertical stone buttress');
    if(gothic) {
      for(const sx of [-1,1])for(const sz of [-1,1])r.cylinder('stoneLight',x+sx*2.8,28.5,z+sz*3.5,.48,6,'Gothic tower pinnacle',4,0);
      r.add(GABLE_ROOF,'stoneLight',[x,25.5,z],[8.2,4.4,6.8],[0,Math.PI/2,0],'tower pointed gable');
      for(const y of[11.2,21.3,26.2])r.box('stoneLight',x,y,z+4.65,towerW+.25,.32,.45,'Gothic pale facade stringcourse');
    } else {
      r.cylinder('stoneDark',x,22.7,z,3.35,1.4,'octagonal dome drum',8);
      r.add(latheGeometry([[3.25,0],[3.35,1],[2.8,2.2],[1.5,3.2],[.5,4.7]],24),'roofGrey',[x,23.3,z],[1,1,1],[0,0,0],'baroque bell-tower dome');
      r.box('metalDark',x,28.3,z,.15,1.5,.15,'tower cross upright');r.box('metalDark',x,28.5,z,1.1,.15,.15,'tower cross arms');
      for(const y of[9.1,18.8,22.5])r.box('stoneLight',x,y,z+4.64,towerW+.3,.35,.45,'Romanesque pale facade stringcourse');
    }
    for(let j=0;j<3;j++)for(const dx of(gothic?[-1.5,0,1.5]:[-.95,.95]))roundOpening(x+dx,3.3+j*7,z+4.65,gothic?1.03:1.30,4.2,gothic?'pointed Gothic bell-tower window':'paired round-headed bell-tower window',gothic);
  }
  const front=depth/2-.9,face=front+.62;
  r.box(wall,0,10.5,front-2,gothic?8.5:width-8,20,5,'ornamental principal church facade');
  const ridge=gothic?26:25.5,half=gothic?4.5:8.8;
  r.add({type:'mesh',vertices:[-half,19,face,half,19,face,0,ridge,face],indices:[0,1,2]},'stoneLight',[0,0,0],[1,1,1],[0,0,0],'central facade pediment');
  if(!gothic) {
    const z=front-2.6;
    r.box(wall,0,21,z,6,6,7,'central taller bell tower');r.cylinder('stoneDark',0,24.5,z,3.4,1.2,'central bell tower drum',8);
    r.add(latheGeometry([[3.4,0],[3.1,1.5],[1.7,3.5],[.3,4.5]],24),'roofGrey',[0,25,z],[1,1,1],[0,0,0],'central baroque dome');
    r.box('metalDark',0,29.9,z,.14,1.4,.14,'central dome cross upright');r.box('metalDark',0,30.1,z,.9,.14,.14,'central dome cross arms');
    for(const x of[-1.0,1.0])roundOpening(x,20.1,face+.1,1.1,3.1,'central round-headed bell-tower window');
    for(const y of[9.1,18.8])r.box('stoneLight',0,y,face+.02,width,.38,.42,'continuous Romanesque pale facade cornice');
  }
  const roseY=gothic?16.0:15.1,roseR=gothic?2.4:2.5;
  r.add(annulusGeometry(.73,32),'stoneLight',[0,roseY,face+.15],[roseR,.18,roseR],[Math.PI/2,0,0],'rose window stone tracery');
  r.add({type:'cylinder',segments:32,topRadius:1},'window',[0,roseY,face+.1],[roseR*.8,.12,roseR*.8],[Math.PI/2,0,0],'rose window glass');
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;beam(r,'stoneLight',[0,roseY,face+.3],[Math.cos(a)*roseR*.8,roseY+Math.sin(a)*roseR*.8,face+.3],.08,'rose window spoke');}
  for(const x of[-towerX,0,towerX]){
    roundOpening(x,.6,face+.2,gothic?3.4:3.1,gothic?6.6:5.8,'recessed arched church portal',gothic);
    if(gothic){beam(r,'stoneLight',[x-2.2,5.4,face+.4],[x,9.2,face+.4],.25,'pointed portal arch');beam(r,'stoneLight',[x,9.2,face+.4],[x+2.2,5.4,face+.4],.25,'pointed portal arch');}
  }
  for(let j=0;j<7;j++)for(const side of[-1,1]){const z=-depth/2+5+j*(depth-14)/6;r.box('stoneLight',side*(naveW/2+.45),wallTop/2+.5,z,.85,wallTop-1,1.1,'side nave buttress');}
  stairs(r,width+2,depth/2+2,1,4,4);
  r.metadata.frontFacing=gothic?'south at rotation0':'west when geographic rotation=-PI/2';
  r.metadata.proportionEvidence=gothic?'Beijing Cultural Heritage Bureau: hall16.5m, tower tips about31m; actual mapped cross-plan38.3x63m':'Beijing Religious Affairs Commission: front width25m; actual mapped long axis64.7m';
  r.metadata.geometryAccuracy='Photo-informed facade, approximate ornamental positions; mapped plan proportions retained. Forecourt plinth is not a footprint replacement.';
  r.metadata.mainNaveRoofHeight=gothic?16.5:24.0;
  return r;
}

const ARMILLARY_RING=annulusGeometry(.91,36);
const ancientObservatory=ancientObservatoryRefined;

const beijingHotel=beijingHotelRefined;

const telegraph=telegraphRefined;

const olympicTower=olympicTowerRefined;

function centralTV(o) {
  const r=new Recipe('中央广播电视塔 · Central Radio and Television Tower');
  const profile=[[24,0],[25,4],[19,12],[13,22],[11.5,60],[9.8,120],[8.3,190],[8,211],[14,216],[23,223],[30,231],[31,238],[27,246],[20,251],[9,258]];
  r.add(latheGeometry(profile,64),'stoneLight',[0,0,0],[1,1,1],[0,0,0],'tapered concrete tower and observation pod');
  for(const [y,radius] of [[225,25],[230,29],[236,31.2],[242,29],[248,24]])r.cylinder('bronze',0,y,0,radius,2.8,'observation deck annular band',64);
  r.cylinder('glassDark',0,234,0,31.4,3,'panoramic restaurant glazing',64);
  r.cylinder('bronze',0,254,0,12,3,'observation crown',48,.7);
  r.cylinder('metal',0,300,0,3.6,90,'communications mast lower shaft',16,.5);
  r.cylinder('metal',0,371.5,0,1.2,67,'communications mast upper tip',12,.2);
  for(let i=0;i<11;i++)r.cylinder(i%2?'stoneLight':'vermilion',0,342+i*5.6,0,1.45-i*.07,5.6,'red white antenna marking',12);
  r.cylinder('metal',0,404,0,.2,2,'antenna tip',6,0);
  return r;
}

export function registerCityLandmarks(register) {
  register('wangfujing_cathedral','王府井天主堂',28,o=>church(o,false));
  register('xishiku_cathedral','西什库天主堂',31,o=>church(o,true));
  register('ancient_observatory','北京古观象台',14,ancientObservatory);
  register('beijing_hotel','北京饭店',77,beijingHotel);
  register('telegraph_building','北京电报大楼',73,telegraph);
  register('olympic_tower','北京奥林匹克塔',246.8,olympicTower);
  register('central_tv_tower','中央广播电视塔',405,centralTV);
}
