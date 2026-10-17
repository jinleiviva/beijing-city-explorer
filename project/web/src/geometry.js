import * as THREE from '../vendor/three.module.js';
/** Compact non-indexed geometry accumulator. */
export class GeometryBatch {
 constructor(){this.surfaceKinds=null;this.currentSurfaceKind=0;this.positions=[];this.normals=[];this.colors=[];this.uvs=[];this.indices=[];}
 setSurfaceKind(value){if(!this.surfaceKinds)this.surfaceKinds=Array(this.positions.length/3).fill(0);this.currentSurfaceKind=value;return this;}
 tri(a,b,c,color=[1,1,1],normal=null,uvs=null){
  const u=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));
  const v=new THREE.Vector3().subVectors(new THREE.Vector3(...c),new THREE.Vector3(...a));
  const n=normal||u.cross(v).normalize().toArray(),base=this.positions.length/3;
  this.positions.push(...a,...b,...c);if(this.surfaceKinds)this.surfaceKinds.push(...Array(3).fill(this.currentSurfaceKind));this.normals.push(...n,...n,...n);this.colors.push(...color,...color,...color);this.uvs.push(...(uvs||[0,0,1,0,1,1]));this.indices.push(base,base+1,base+2);
 }
 quad(a,b,c,d,color=[1,1,1],normal=null,uvs=[0,0,1,0,1,1,0,1]){
  const base=this.positions.length/3,u=new THREE.Vector3().fromArray(b).sub(new THREE.Vector3().fromArray(a)),v=new THREE.Vector3().fromArray(c).sub(new THREE.Vector3().fromArray(a)),n=normal||u.cross(v).normalize().toArray();
  this.positions.push(...a,...b,...c,...d);if(this.surfaceKinds)this.surfaceKinds.push(...Array(4).fill(this.currentSurfaceKind));this.normals.push(...n,...n,...n,...n);this.colors.push(...color,...color,...color,...color);this.uvs.push(...uvs);this.indices.push(base,base+1,base+2,base,base+2,base+3);
 }
 addGeometry(g,matrix,color=[1,1,1]){const q=g.clone();q.applyMatrix4(matrix);const p=q.attributes.position,n=q.attributes.normal,uv=q.attributes.uv,base=this.positions.length/3;for(let i=0;i<p.count;i++){this.positions.push(p.getX(i),p.getY(i),p.getZ(i));if(this.surfaceKinds)this.surfaceKinds.push(this.currentSurfaceKind);this.normals.push(n?.getX(i)??0,n?.getY(i)??1,n?.getZ(i)??0);this.colors.push(...color);this.uvs.push(uv?.getX(i)||0,uv?.getY(i)||0);}if(q.index){for(let i=0;i<q.index.count;i++)this.indices.push(base+q.index.getX(i));}else for(let i=0;i<p.count;i++)this.indices.push(base+i);q.dispose();}
 geometry(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.normals,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(this.uvs,2));if(this.surfaceKinds)g.setAttribute('surfaceKind',new THREE.Float32BufferAttribute(this.surfaceKinds,1));g.setIndex(this.indices);g.computeBoundingSphere();return g;}
 mesh(mat){return new THREE.Mesh(this.geometry(),mat);}
 get triangles(){return this.indices.length/3;}
}
export function makeShape(rings){const s=new THREE.Shape(rings[0].map(p=>new THREE.Vector2(p[0],-p[1])));for(const h of rings.slice(1))s.holes.push(new THREE.Path(h.map(p=>new THREE.Vector2(p[0],-p[1]))));return s;}
export function polygonGeometry(rings,y=0){const g=new THREE.ShapeGeometry(makeShape(rings));g.rotateX(-Math.PI/2);g.translate(0,y,0);return g;}
export function strip(batch,points,width,y,color){
 if(points.length<2)return;
 const sides=[];
 for(let i=0;i<points.length;i++){const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];let dx=next[0]-prev[0],dz=next[1]-prev[1],l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const a=[points[i][0]-dz*width/2,points[i][1]+dx*width/2],b=[points[i][0]+dz*width/2,points[i][1]-dx*width/2];sides.push([[a[0],typeof y==='function'?y(...a):y,a[1]],[b[0],typeof y==='function'?y(...b):y,b[1]]]);}
 for(let i=1;i<sides.length;i++)batch.quad(sides[i-1][0],sides[i][0],sides[i][1],sides[i-1][1],color,typeof y==='function'?null:[0,1,0]);
}
export function colorArray(hex){const c=new THREE.Color(hex);return[c.r,c.g,c.b];}
