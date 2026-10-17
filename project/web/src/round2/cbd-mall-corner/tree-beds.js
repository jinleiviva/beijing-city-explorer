/** Small authored landscape groups around the eight retained visible tree positions.
 * Soil/root datum follows audited runtime paving, not a terrain-height guess.
 * Exact bed and bench positions are inferred landscape dressing, not surveyed.
 */
import {Recipe} from '../../architecture/geometry.js';
import {MALL_VISIBLE_TREE_RECORDS} from './visible-trees.js';
import {appendStreetBench} from '../cbd-street-detail/index.js';
import {appendMallPlantingBed} from './plaza.js';
const box=(r,m,x,y,z,w,h,d,label,shadow=false)=>{r.box(m,x,y,z,w,h,d,'Mall visible-tree '+label);r.parts.at(-1).castShadow=shadow;};
export function mallTreeBedsRecipe({quality='std'}={}){
 const out=new Recipe('Eight visible existing tree pits and paired corner planting',{buildings:0,quality,source:'Existing tree records and source surface ray audit',treePositionsUnchanged:true,groundAccuracy:'Source runtime surfaces, not surveyed elevations',placementAccuracy:'Pits and two linked beds/benches authored; outside actual road/building masks',noNewTrees:true,placements:[]});
 for(const t of MALL_VISIBLE_TREE_RECORDS){const r=new Recipe('Existing-tree grounded soil and edging');
  box(r,'greyBrickDark',0,-.035,0,3.04,.08,3.04,'soil square');
  for(const side of [-1,1]){box(r,'stoneDark',side*1.59,.065,0,.14,.13,3.32,'side low edging');box(r,'stoneDark',0,.065,side*1.59,3.04,.13,.14,'end low edging');}
  // Only short corner grate bars: leave buttress roots and soil visibly open.
  for(const sx of [-1,1])for(const sz of [-1,1])for(let j=0;j<2;j++)box(r,'metalDark',sx*(1.05+j*.22),.025,sz*1.20,.045,.035,.45,'corner drainage grate');
  out.merge(r,[t.x,t.groundY,t.z]);out.metadata.placements.push({type:'tree_pit',x:t.x,z:t.z,groundY:t.groundY,outerWidth:3.32});
 }
 for(const b of [{x:4629.4,z:-351.6,yaw:Math.PI/2,length:6.8},{x:4635.0,z:-359.3,yaw:0,length:5.8}]){const r=new Recipe('Linked corner low hedge');appendMallPlantingBed(r,0,0,b.length,1.40,quality!=='low');out.merge(r,[b.x,-.02,b.z],b.yaw);out.metadata.placements.push({type:'grouped_hedge',...b,groundY:-.02});}
 for(const b of [{x:4633.1,z:-351.6,yaw:Math.PI/2},{x:4635.0,z:-355.9,yaw:0}]){const r=new Recipe('Corner bench aligned with planted strip');appendStreetBench(r,0,0);out.merge(r,[b.x,-.02,b.z],b.yaw);out.metadata.placements.push({type:'aligned_bench',...b,groundY:-.02});}
 return out;
}
export const buildMallTreeBeds=(kit,options={})=>kit.buildMergedRecipe(mallTreeBedsRecipe(options));
