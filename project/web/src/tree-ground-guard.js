import {roadIndex,nearRoad,polygonIndex,inPolygons} from './spatial.js';
/** Shared last gate for every procedural source, including additive hero trees.
 * It tests trunk centres, allowing ordinary crowns to overhang the pavement.
 */
export function createCarriagewayGuard(roads){
 const vehicleRoads=roads.filter(r=>r.y<4&&!['footway','path','pedestrian','steps','cycleway'].includes(r.class));
 const carriageways=roadIndex(vehicleRoads);return{count:vehicleRoads.length,blocked:(x,z,clearance=.35)=>nearRoad(carriageways,x,z,clearance-2)};
}
export function guardTreeGround(trees,roads,waters=[]){
 const carriageways=createCarriagewayGuard(roads),water=polygonIndex(waters),kept=[];
 let roadRejected=0,waterRejected=0;
 for(const tree of trees){if(carriageways.blocked(tree.x,tree.z)){roadRejected++;continue;}if(inPolygons(water,tree.x,tree.z)){waterRejected++;continue;}kept.push(tree);}
 return{trees:kept,audit:{candidateTrees:trees.length,keptTrees:kept.length,roadRejected,waterRejected,vehicleRoads:carriageways.count,trunkCarriagewayClearanceMetres:.35,policy:'Every procedural tree source passes the same final mapped carriageway/water exclusion. Crowns may overhang; heights and individual positions remain inferred.'}};
}
