/** Two of the existing eight fixed plaza people walk on existing road-side paving.
 * This is an authored display band, not a new surveyed or OSM footway. No new pool.
 */
import {distanceToSegment} from '../../geo.js';
import {insideBuilding} from '../../spatial.js';
export function buildCbdForecourtRoute(roads,collision,groundAt){
 const road=roads.find(r=>r.id==='osm-way-1147350758');if(!road||road.points.length!==2)throw Error('Forecourt band needs its unchanged mapped Guanghua road');
 const[a,b]=road.points,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),n=[-dz/length,dx/length];if(dx<=0||road.width!==14)throw Error('Forecourt reference road orientation/width changed');
 const at=x=>{const t=(x-a[0])/dx;return[x+n[0]*9,a[1]+dz*t+n[1]*9];},points=[at(4639),at(4654)],width=3.4,offsets=[-.9,-.3].map(v=>v*width*.38),bodyRadius=.55,groundSamples=[];let minRoadGap=Infinity,buildingHits=0;
 for(let i=0;i<=32;i++)for(const off of offsets){const t=i/32,p=[points[0][0]+(points[1][0]-points[0][0])*t+n[0]*off,points[0][1]+(points[1][1]-points[0][1])*t+n[1]*off];minRoadGap=Math.min(minRoadGap,distanceToSegment(...p,a,b)-road.width/2-bodyRadius);if(insideBuilding(collision,...p,bodyRadius))buildingHits++;for(const[cx,cz]of[[0,0],[bodyRadius,0],[-bodyRadius,0],[0,bodyRadius],[0,-bodyRadius]])groundSamples.push(groundAt(p[0]+cx,p[1]+cz));}
 const y=groundAt((points[0][0]+points[1][0])/2,(points[0][1]+points[1][1])/2),maxGroundError=Math.max(...groundSamples.map(v=>Math.abs(v-y)));
 if(!Number.isFinite(y)||maxGroundError>.005||Math.abs(y-.58)>.005||minRoadGap<.25||buildingHits)throw Error('Forecourt band no longer has its audited safe, level paving');
 return{id:'authored-north-mall-roadside-forecourt',points,width,y,class:'pedestrian',properties:{authoredDisplayPath:true,sourceRoadId:road.id,source:'https://www.wayfinding.com.cn/uploads/image/202401/1706151677.jpg',accuracy:'Authored display band on existing mapped Guanghua roadside paving; not a surveyed OSM footway or observed pedestrian demand',groundAudit:{samples:groundSamples.length,maximumError:maxGroundError,groundY:y,bodyRadius,minimumCarriagewayGap:minRoadGap,buildingHits},assignment:{newRoutePeople:['person-2','person-5'],fixedPoolRemains:8,totalPoolRemains:52,allEightReinitialized:true,lateralSlotSeparation:Math.abs(offsets[0]-offsets[1]),note:'Appending a third route changes modulo assignment/phases of other fixed people too; full 8-person motion must be rechecked.'},noChangedPaving:true,noMovedTrees:true}};
}
