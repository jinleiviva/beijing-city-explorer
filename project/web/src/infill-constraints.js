/** One authoritative public-space exclusion input for all inferred fabric planners. */
export function collectPublicInfillExclusions(base,...documents){
 const all=new Map();for(const f of base||[])if(['Polygon','MultiPolygon'].includes(f.geometry?.type))all.set(f.id,f);
 for(const document of documents)for(const f of document?.features||[]){if(!['Polygon','MultiPolygon'].includes(f.geometry?.type))continue;const role=f.properties?.role||'';if(!/keep-open|keep-clear|low-planting|tree-cover|sports-surface|protected-courtyard|paving/.test(role))continue;all.set(f.id,{...f,properties:{...f.properties,exclusionReasons:['public-space:'+role]}});}
 return [...all.values()];
}
import {bounds,pointInRing,distanceToSegment,project} from './geo.js';
import {polygonIndex,inPolygons,roadIndex} from './spatial.js';
const turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function crosses(a,b,c,d){return turn(a,b,c)*turn(a,b,d)<-1e-8&&turn(c,d,a)*turn(c,d,b)<-1e-8;}
export function createInfillGuard(terrain,exclusions,{ignoreRoadIds=[]}={}){
 const polygons=[...(terrain.parks||[]),...(terrain.waters||[])];for(const f of exclusions||[]){const reasons=f.properties.exclusionReasons||[];if(reasons.length&&reasons.every(r=>['landuse:retail','landuse:commercial'].includes(r)))continue;for(const p of f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates])polygons.push({rings:p.map(r=>r.map(project))});}
 const publicMask=polygonIndex(polygons),ignore=new Set(ignoreRoadIds),roads=roadIndex((terrain.roads||[]).filter(r=>!ignore.has(r.id)));
 return function allowed(ring){const bb=bounds(ring),cx=(bb[0]+bb[2])/2,cz=(bb[1]+bb[3])/2,radius=Math.hypot(bb[2]-bb[0],bb[3]-bb[1])*.5;
  for(const p of publicMask.nearby(cx,cz,radius)){if(ring.some(([x,z])=>pointInRing(x,z,p.rings[0])&&!p.rings.slice(1).some(h=>pointInRing(x,z,h))))return false;if(p.rings[0].some(([x,z])=>pointInRing(x,z,ring)))return false;for(const boundary of p.rings)for(let i=1;i<ring.length;i++)for(let j=1;j<boundary.length;j++)if(crosses(ring[i-1],ring[i],boundary[j-1],boundary[j]))return false;}
  for(const q of roads.nearby(cx,cz,radius)){const width=q.road.width/2+.15;if(ring.some(([x,z])=>distanceToSegment(x,z,q.a,q.b)<width)||pointInRing(...q.a,ring)||pointInRing(...q.b,ring))return false;for(let i=1;i<ring.length;i++)if(crosses(ring[i-1],ring[i],q.a,q.b))return false;}
  return true;
 };
}
