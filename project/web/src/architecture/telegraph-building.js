import{Recipe}from'./geometry.js';
import{mappedBody}from'./site-massing.js';
import{windowGrid,clockFace}from'./landmark-utils.js';
import{MASSING_LAYOUT}from'./massing-layout.js';
export function telegraphRefined(o={}){
 const site=MASSING_LAYOUT.telegraph_building,detail=o.detail??1;
 const r=new Recipe('北京电报大楼 · Beijing Telegraph Building',{
  replacesOsmIds:['osm-way-256042566'],scope:'Actual105.3x35.9m concave building footprint',
  horizontalAccuracy:'Mapped outline; clock-tower widths and setbacks photo-proportioned',heightAccuracy:'73m overall approximate;44.4m seven-storey main block approximate'
 });
 mappedBody(r,site.polygons[0][0],0,44.4,'brick','actual concave telecommunications building');
 mappedBody(r,site.polygons[0][0],44.4,45.3,'stoneLight','mapped roof cornice');
 windowGrid(r,{width:100,height:34.5,z:13.95,y:5.8,columns:23,rows:7,detail,trim:'stoneLight'});
 // Recessed north facade remains inside the deeply indented mapped back wall.
 windowGrid(r,{width:70,height:33,z:-7.7,y:6,columns:17,rows:7,detail,trim:'stoneLight'});
 r.box('brick',0,47,1.5,24,4.0,19.0,'raised clock-tower attic');
 r.box('stoneLight',0,49.2,1.5,26,.6,20,'clock attic cornice');
 r.box('brick',0,57.2,1.5,14,15.4,15.5,'slender central clock shaft');
 r.box('stoneLight',0,65.2,1.5,16.0,.6,17,'clock shaft cornice');
 for(const x of[-6.4,6.4])r.box('stoneLight',x,57.2,9.42,.55,15.8,.4,'clock shaft pale vertical corner trim');
 clockFace(r,0,60.2,9.56,3.15);
 r.box('brick',0,67.5,1.5,8.7,4.0,9.5,'small lantern above clock');
 r.box('stoneLight',0,69.8,1.5,10.2,.6,11,'lantern cap');
 r.cylinder('metal',0,71.6,1.5,.18,2.8,'telegraph finial mast',8);
 for(const x of[-6.8,0,6.8])r.box('glassDark',x,4.2,14.05,4.7,7.2,.18,'telegraph three ground entrance portals');
 for(const x of[-11.2,11.2])r.box('stoneLight',x,22.0,14.12,1.15,43.7,.55,'central front pale vertical pilaster');
 return r;
}
