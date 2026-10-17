/** Three explicitly mapped hotel components, without claiming the whole hotel campus. */
import {Recipe,HIP_ROOF}from'./geometry.js';
import {mappedBody}from'./site-massing.js';
import {windowGrid}from'./landmark-utils.js';
import {COMPOUND_COMPONENTS as C}from'./compound-layout.js';
export function beijingHotelRefined(o={}){
 const far=o.lod==='silhouette',detail=far?0:o.detail??1;
 const ids=['osm-way-33459001','osm-way-236379913','osm-way-236379912'];
 const r=new Recipe('北京饭店东楼及1917中楼 · Beijing Hotel',{
  scope:'1974 eastern high block,1917 middle block and mapped southern podium only;1954 western block retained as context',replacesOsmIds:ids,
  componentCenters:ids.map(id=>({id,localCenterXZ:C[id].relativeXZ})),
  horizontalAccuracy:'Actual OSM component footprints/centres; upper tower and facade subdivisions approximate',
  heightAccuracy:'77m eastern high block,31.5m middle block and12.2m podium are approximate visual reconstructions',
  referencePhoto:'assets/architecture/research/beijing_hotel.jpg',placementRotation:0
 });
 mappedBody(r,C[ids[0]].points,0,8,'stone','actual east hotel base footprint '+ids[0]);
 r.box('stoneLight',0,37,0,106,66,42,'1974 eastern high slab anchored at mapped centroid');
 // Two shallow, open rooftop levels read as colonnaded terraces in the reference.
 r.box('stone',0,70.15,0,109,.60,43.4,'thin main hotel terrace cornice');
 r.box('glassDark',-2,71.95,-1,95,2.9,33,'recessed lower restaurant glazing');
 r.box('stoneLight',-1,73.55,0,108,.50,42.8,'first open restaurant terrace slab');
 r.box('glassDark',-5,75.0,-1.2,83,2.4,28.5,'recessed upper restaurant glazing');
 r.box('stoneLight',-5,76.45,-1,95,.45,36.5,'thin projecting upper hotel roof');
 r.box('stoneLight',-10,76.85,-3,71,.30,27,'small asymmetric upper roof cap');
 for(const [y,h,w,d,cx]of[[71.9,2.9,105,40,0],[75.0,2.5,91,34,-5]]){
  for(const z of[-d/2,d/2])for(let i=0;i<=12;i++)r.box('stoneLight',cx-w/2+i*w/12,y,z,.50,h,.55,'open rooftop restaurant colonnade');
  for(const x of[cx-w/2,cx+w/2])for(const z of[-d/4,0,d/4])r.box('stoneLight',x,y,z,.50,h,.55,'open rooftop restaurant side colonnade');
 }
 // Continuous recessed glazing and projecting balcony edges give all four walls depth.
 for(let side=0;side<4;side++){
  const w=side<2?99:36,z=side===0?21.13:side===1?-21.13:0,x=side===2?53.13:side===3?-53.13:0;
  if(!far)r.box('glassDark',x,39,z,side<2?w:.18,59,side<2?.18:w,'continuous recessed hotel window field');
  for(let j=0;j<=16;j++){
   if(far&&j%3!==0&&j!==16)continue;
   const y=9+j*3.68;
   r.box('stoneLight',x,y,z,side<2?w+1.2:1.05,.35,side<2?1.05:w+1.2,'projecting hotel balcony ledge');
  }
  if(!far){const cols=side<2?25:9;for(let j=0;j<=cols;j++){
   const u=-w/2+j*w/cols;
   r.box('stoneLight',side<2?u:x,39,side<2?z:u,side<2?.30:.7,59,side<2?.7:.30,'recessed hotel vertical balcony divider');
  }}
 }
 for(const x of[-51,51])r.box('stone',x,37,21.5,3.7,66,1.1,'tall hotel facade end pier');
 const west=C[ids[1]],[wx,wz]=west.relativeXZ;
 mappedBody(r,west.points,0,29.7,'stoneLight','1917 seven-storey middle block '+ids[1]);
 mappedBody(r,west.points,29.7,30.35,'stone','1917 middle block roof cornice');
 for(const z of[wz-9.5,wz+9.5])windowGrid(r,{width:81,height:23,x:wx,z,y:4,columns:19,rows:6,detail,trim:'stoneLight'});
 // Photo shows a classical parapeted skyline, not one long hutong gable.
 r.box('stoneLight',wx,30.8,wz+9.65,87,.9,.7,'1917 classical south parapet');
 for(const dx of[-40,-20,0,20,40]){
  r.box('stoneLight',wx+dx,30.9,wz+9.65,1.05,1.2,.95,'1917 parapet pedestal');
  if(!far&&detail>0)r.box('stoneLight',wx+dx,18,wz+9.65,1.0,23,.6,'1917 classical facade pilaster');
 }
 r.add(HIP_ROOF,'roofGrey',[wx,30.35,wz-1],[77,1.15,16],[0,0,0],'low roof behind historic classical parapet');
 const pod=C[ids[2]],[px,pz]=pod.relativeXZ;
 mappedBody(r,pod.points,0,12.2,'stone','actual low southern entrance podium '+ids[2]);
 r.box('glassPale',px,12.45,pz,114,.5,24,'southern podium shallow glazed roof');
 const n=far?9:21;
 for(let i=0;i<n;i++){
  const x=px-54+i*108/(n-1);
  r.box('glassDark',x,6.2,pz+13.2,108/n*.63,9.0,.18,'southern podium entrance glazing');
  r.box('stoneLight',x+108/n*.45,6.3,pz+13.7,.72,11.2,.8,'southern podium pale colonnade');
 }
 return r;
}
