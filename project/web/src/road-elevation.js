/** OSM layer is stacking order, NEVER a metre elevation.
 * Priority: modeled profiles > explicit deck/source dimensions > bounded small
 * water-crossing context > labeled assumed crossing clearance. No measured
 * bridge levels are claimed. min_height is interpreted as underside clearance.
 */
import {lowBankWaterBridgeIds} from './bridge-elevation-context.js';
const metre=v=>{if(v==null||v==='')return null;const n=parseFloat(v);return Number.isFinite(n)&&n>=0?n:null;};
export function roadElevationPolicy(properties){
 const p=properties||{},layer=Number(p.layer)||0,tag=String(p.bridge??'no'),floor=.65;
 const mappedBridge=!['no','false','0',''].includes(tag),pedestrian=['footway','path','steps','pedestrian','cycleway'].includes(p.class);
 const custom=p.heightProfile||p.customDrapedPath||p.customBridge||p.drapeTerrain;
 if(!mappedBridge||p.class==='steps'||custom||layer<0)return{height:floor,buildDeck:false,mappedBridge,source:'Ground or separately modeled profile; layer alone is never a height'};
 const explicit=metre(p.bridgeDeckHeight),min=metre(p.minHeight??p.min_height),height=metre(p.height),id=p.id||`osm-${p.osmType||'way'}-${p.osmId}`;
 if(explicit!==null)return{height:explicit,buildDeck:explicit>floor,mappedBridge,source:p.bridgeHeightAccuracy||'Explicit bridge deck parameter; see feature evidence'};
 if(height!==null||min!==null){const top=height??(min+(pedestrian?.3:1.1));return{height:floor+top,buildDeck:top>0,mappedBridge,source:'OSM height/min_height dimension; assumed bridge-top/underside datum, not surveyed world elevation'};}
 if(lowBankWaterBridgeIds.has(id))return{height:1.05,buildDeck:true,mappedBridge,source:'Inferred low-bank small water bridge: actual water intersection, local class, length<180m and width<18m; 1.05m scene deck approximate'};
 const elevated=layer>0;
 const assumedClearance=pedestrian?5.5:6,extraCrossing=layer>1?(layer-1)*5.8:0;
 return{height:floor+(elevated?assumedClearance+extraCrossing:0),buildDeck:elevated,mappedBridge,source:elevated?'Inferred crossing clearance by pedestrian/motor type; extra stacked crossings use an assumed 5.8m gap, not a conversion of OSM layer to metres':'Mapped bridge without height: conservative ground-level proxy'};
}
