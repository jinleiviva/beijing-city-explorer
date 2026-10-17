import{Recipe,annulusGeometry}from'./geometry.js';
import{mappedBody}from'./site-massing.js';
import{windowGrid,portico,stairs,star}from'./landmark-utils.js';
import{MASSING_LAYOUT}from'./massing-layout.js';
export function militaryMuseumRefined(o={}){
 const site=MASSING_LAYOUT.military_museum,far=o.lod==='silhouette',detail=o.detail??1,cx=7.15;
 const r=new Recipe('中国人民革命军事博物馆 · Military Museum',{
  replacesOsmIds:['osm-relation-963097'],scope:'Actual mapped museum footprint, without touching adjacent BoxingBuilding1355948553',
  mappedDimensions:site.dimensions,mainAxisApproxX:cx,
  horizontalAccuracy:'Actual outer platform; front-axis inferred from mapped central projection; internal gallery partitions approximate',
  heightAccuracy:'94.7m official including6m-diameter emblem; main7storeys and wings4 per official source. Rear hall21m approximate',
  heightSource:'https://wwj.beijing.gov.cn/bjww/362771/362773/546526/index.html'
 });
 mappedBody(r,site.polygons[0][0],0,2.3,'stoneLight','actual military museum footprint platform');
 // Preserve the deep northern exhibition mass within the mapped outline.
 r.box('stone',0,11.65,-30,213,18.7,100,'approximate lower northern exhibition hall');
 r.box('concrete',0,21.15,-30,214,.3,100,'northern gallery flat roof');
 const left=-107.2,right=107.1,mainW=61,front=73.5;
 for(const [a,b]of[[left,cx-mainW/2],[cx+mainW/2,right]]){
  const x=(a+b)/2,w=b-a;
  r.box('stone',x,16.15,46.75,w,27.7,53.5,'four-storey front gallery within real footprint');
  r.box('stoneLight',x,30.3,46.75,w,0.6,53.5,'gallery shallow roof cornice');
  r.box('roofGold',x,30.66,front-.1,w,.18,.65,'gallery restrained gold eave edge');
  windowGrid(r,{width:w-5,height:20.4,x,z:front+.11,y:6,columns:Math.round(w/4.7),rows:4,detail});
 }
 // Short southern returns are present in the actual footprint, not invented wings.
 for(const [x,w,z,d]of[[-94,27.6,84.5,21.0],[95,24,86.0,23.0]]){
  r.box('stone',x,16.15,z,w,27.7,d,'mapped short southern gallery return');
  r.box('stoneLight',x,30.3,z,w,.6,d,'short gallery return coping');
  if(!far)windowGrid(r,{width:w-3,height:20,x,z:z+d/2+.1,y:6,columns:5,rows:4,detail});
 }
 const mainPlan=[[cx-mainW/2,4],[cx+mainW/2,4],[cx+mainW/2,73.1],[33.3,73.1],[33.3,81.1],[-19.0,81.1],[-19.0,73.1],[cx-mainW/2,73.1]];
 mappedBody(r,mainPlan,2.3,57.5,'stoneLight','seven-storey central museum block');
 windowGrid(r,{width:50,height:42,x:cx,z:81.12,y:9,columns:9,rows:7,detail});
 mappedBody(r,mainPlan,57.5,59.7,'stone','central deep pale cornice');
 r.box('roofGold',cx,59.78,81.1,52.3,.24,.7,'central fine gold roof edge');
 r.box('stoneLight',cx,64.2,42.5,26,8.8,29,'central tower first tier');
 r.box('stoneLight',cx,72.5,42.5,14.5,7.8,16.5,'open lantern tower');
 for(const x of[-4.8,0,4.8])r.box('window',cx+x,72.5,50.9,1.7,5.1,.13,'lantern narrow window');
 r.box('stone',cx,77,42.5,17,1.0,19,'lantern cornice');
 r.cylinder('stoneLight',cx,84.0,42.5,2.45,12.8,'slender tapered emblem finial',16,.15);
 r.add(annulusGeometry(.84,40),'roofGoldLight',[cx,91.7,42.5],[3,.24,3],[Math.PI/2,0,0],'official six-metre circular military emblem');
 star(r,cx,91.7,42.55,2.15,'roofGoldLight');
 const porch=new Recipe('central entrance');portico(porch,{width:39,height:15.5,z:80,y:2.3,columns:6,depth:7});r.merge(porch,[cx,0,0]);
 // These approach stairs are explicitly outside the modeled occupied floor area.
 const st=new Recipe('approach');stairs(st,49,84,2.3,8,far?3:5);r.merge(st,[cx,0,0]);
 return r;
}
