import {bounds,pointInRing,distanceToSegment,project} from './geo.js';
export class SpatialGrid{
 constructor(size=100){this.size=size;this.cells=new Map();}
 key(x,z){return`${Math.floor(x/this.size)},${Math.floor(z/this.size)}`;}
 insert(item,bb){for(let x=Math.floor(bb[0]/this.size);x<=Math.floor(bb[2]/this.size);x++)for(let z=Math.floor(bb[1]/this.size);z<=Math.floor(bb[3]/this.size);z++){const key=`${x},${z}`;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(item);}}
 at(x,z){return this.cells.get(this.key(x,z))||[];}
 nearby(x,z,r=0){const output=new Set();for(let ix=Math.floor((x-r)/this.size);ix<=Math.floor((x+r)/this.size);ix++)for(let iz=Math.floor((z-r)/this.size);iz<=Math.floor((z+r)/this.size);iz++)for(const item of this.cells.get(`${ix},${iz}`)||[])output.add(item);return[...output];}
}
export function buildingIndex(features){const index=new SpatialGrid(90);for(const f of features){const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];for(const p of polys){const ring=p[0].map(project),bb=bounds(ring);index.insert({ring,holes:p.slice(1).map(r=>r.map(project)),bb,id:f.id},bb);}}return index;}
export function insideBuilding(index,x,z,margin=0){for(const p of index.nearby(x,z,margin)){const b=p.bb;if(x<b[0]-margin||x>b[2]+margin||z<b[1]-margin||z>b[3]+margin)continue;if(p.flatRing){const r=p.flatRing;let inside=false;for(let i=0,j=r.length-2;i<r.length;j=i,i+=2){const ax=r[i],az=r[i+1],bx=r[j],bz=r[j+1];if(((az>z)!=(bz>z))&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;if(margin>0&&distanceToSegment(x,z,[ax,az],[bx,bz])<margin)return true;}if(inside)return true;}else{if(pointInRing(x,z,p.ring))return true;if(margin>0)for(let i=1;i<p.ring.length;i++)if(distanceToSegment(x,z,p.ring[i-1],p.ring[i])<margin)return true;}}return false;}
export function roadIndex(roads){const index=new SpatialGrid(90);for(const road of roads){for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],r=road.width/2+2;index.insert({a,b,r,road},[Math.min(a[0],b[0])-r,Math.min(a[1],b[1])-r,Math.max(a[0],b[0])+r,Math.max(a[1],b[1])+r]);}}return index;}
export function nearRoad(index,x,z,margin=0){for(const q of index.nearby(x,z,Math.max(0,margin)))if(distanceToSegment(x,z,q.a,q.b)<q.r+margin)return true;return false;}
export function polygonIndex(polygons){const index=new SpatialGrid(180);for(const p of polygons){const bb=bounds(p.rings[0]);index.insert(p,bb);}return index;}
export function inPolygons(index,x,z){for(const p of index.at(x,z))if(pointInRing(x,z,p.rings[0])&&!p.rings.slice(1).some(r=>pointInRing(x,z,r)))return true;return false;}

/** Exact replacement mask. Collision can remain conservative; courtyard holes remain void here. */
export function insideReplacement(index,x,z){for(const p of index.at(x,z)){if(pointInRing(x,z,p.ring)&&!(p.holes||[]).some(h=>pointInRing(x,z,h)))return true;}return false;}
