/** Dependency-free geometry descriptions, shared with the editable Blender source. */
export const BOX = Object.freeze({ type: 'box' });
export const CYLINDER = Object.freeze({ type: 'cylinder', segments: 12, topRadius: 1 });
export const ROUND_CYLINDER = Object.freeze({ type: 'cylinder', segments: 48, topRadius: 1 });
export const SPHERE = Object.freeze({ type: 'sphere', widthSegments: 12, heightSegments: 8 });

function quad(indices, a, b, c, d) { indices.push(a, b, c, a, c, d); }

/** Chamfered footprint, counter-clockwise viewed from above. */
export function rectangleRing(width = 1, depth = 1, chamfer = 0.09) {
  const x = width / 2, z = depth / 2, c = Math.min(width, depth) * chamfer;
  return [[-x+c,-z],[x-c,-z],[x,-z+c],[x,z-c],[x-c,z],[-x+c,z],[-x,z-c],[-x,-z+c]];
}

/** Closed extruded mesh with aligned horizontal rings. y is absolute. */
export function loftGeometry(rings, caps = true) {
  const vertices = [], indices = [], n = rings[0].points.length;
  for (const ring of rings) for (const [x,z] of ring.points) vertices.push(x,ring.y,z);
  for (let j=0;j<rings.length-1;j++) for(let i=0;i<n;i++) {
    const next=(i+1)%n; quad(indices,j*n+i,(j+1)*n+i,(j+1)*n+next,j*n+next);
  }
  if (caps) {
    for (let i=1;i<n-1;i++) indices.push(0,i,i+1);
    const base=(rings.length-1)*n;
    for(let i=1;i<n-1;i++) indices.push(base,base+i+1,base+i);
  }
  return {type:'mesh',vertices,indices};
}

// Faceted towers need hard wall/cap normals; smooth lofts elsewhere stay smooth.
export const CHAMFER_BOX = {...loftGeometry([
  { y:-0.5,points:rectangleRing() }, { y:0.5,points:rectangleRing() }
]),flatShading:true};

/** Unit traditional hipped roof; shallow curved eaves, long ridge along X. */
export function hipRoofGeometry({ ridge = 0.55, sweep = 0.12 } = {}) {
  const vertices=[],indices=[];
  const rings=[
    {x:0.5,z:0.5,y:sweep},
    {x:0.46,z:0.43,y:0.04},
    {x:0.39,z:0.29,y:0.27},
    {x:0.31,z:0.13,y:0.62},
    {x:ridge/2,z:0.008,y:1.0}
  ];
  for(const r of rings) vertices.push(-r.x,r.y,-r.z,r.x,r.y,-r.z,r.x,r.y,r.z,-r.x,r.y,r.z);
  for(let k=0;k<rings.length-1;k++) for(let i=0;i<4;i++) quad(indices,k*4+i,(k+1)*4+i,(k+1)*4+(i+1)%4,k*4+(i+1)%4);
  quad(indices,0,1,2,3);quad(indices,16,19,18,17);
  return {type:'mesh',vertices,indices};
}
export const HIP_ROOF = hipRoofGeometry();

/** Grey hutong roof with straight gables and slightly kicked eaves. */
export const GABLE_ROOF = (()=>{
  const vertices=[],indices=[];
  const profile=[[-0.5,0.08],[-0.43,0],[-0.2,0.48],[0,1],[0.2,0.48],[0.43,0],[0.5,0.08]];
  for (const x of [-0.5,0.5]) for (const [z,y] of profile) vertices.push(x,y,z);
  // Exterior roof faces must point upward. FrontSide materials deliberately remain
  // single-sided, so winding errors cannot be hidden by a DoubleSide workaround.
  for(let i=0;i<profile.length-1;i++) quad(indices,i,i+1,i+profile.length+1,i+profile.length);
  // A fan from the kicked eave self-intersects. Use an interior ridge-to-base
  // triangulation for the five-point gable and separate the upturned eave lips.
  // Each pair is left (-X) followed by right (+X).
  const capTriangles=[[1,2,3],[1,3,5],[3,4,5],[0,1,6],[1,5,6]];
  for(const tri of capTriangles) {
    const [a,b,c]=tri,pa=profile[a],pb=profile[b],pc=profile[c];
    const nx=(pb[1]-pa[1])*(pc[0]-pa[0])-(pb[0]-pa[0])*(pc[1]-pa[1]);
    const left=nx<0?[a,b,c]:[a,c,b];
    indices.push(...left,...left.map(i=>i+profile.length).reverse());
  }
  quad(indices,0,profile.length,profile.length*2-1,profile.length-1);
  return {type:'mesh',vertices,indices};
})();

/** A curved revolved roof, parameterized by [radius,height] pairs. */
export function latheGeometry(profile, segments=48) {
  const vertices=[],indices=[];
  for(const [r,y] of profile) for(let i=0;i<segments;i++) {
    const a=i/segments*Math.PI*2; vertices.push(Math.cos(a)*r,y,Math.sin(a)*r);
  }
  for(let j=0;j<profile.length-1;j++) for(let i=0;i<segments;i++) quad(indices,j*segments+i,(j+1)*segments+i,(j+1)*segments+(i+1)%segments,j*segments+(i+1)%segments);
  return {type:'mesh',vertices,indices};
}

export function annulusGeometry(inner=.5,segments=64) {
  const vertices=[],indices=[];
  for(const [radius,y] of [[1,-.5],[1,.5],[inner,.5],[inner,-.5]]) for(let i=0;i<segments;i++) {
    const a=i/segments*Math.PI*2;vertices.push(Math.cos(a)*radius,y,Math.sin(a)*radius);
  }
  for(let j=0;j<4;j++)for(let i=0;i<segments;i++)quad(indices,j*segments+i,((j+1)%4)*segments+i,((j+1)%4)*segments+(i+1)%segments,j*segments+(i+1)%segments);
  return {type:'mesh',vertices,indices};
}

export function ellipseRing(rx,rz,y,cx=0,cz=0,segments=64) {
  return {y,points:Array.from({length:segments},(_,i)=>{const a=i/segments*Math.PI*2;return[cx+Math.cos(a)*rx,cz+Math.sin(a)*rz];})};
}

export function meshGeometry(THREE,spec) {
  if(spec.type==='box') return new THREE.BoxGeometry(1,1,1);
  if(spec.type==='cylinder') return new THREE.CylinderGeometry(spec.topRadius??1,1,1,spec.segments??12);
  if(spec.type==='sphere') return new THREE.SphereGeometry(1,spec.widthSegments??12,spec.heightSegments??8);
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(spec.vertices,3));
  geo.setIndex(spec.indices);
  if(spec.flatShading)geo=geo.toNonIndexed();
  geo.computeVertexNormals();
  return geo;
}

export function seededRandom(seed=1) {
  let a=(Number(seed)||1)>>>0;
  return ()=>{ a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296; };
}

/** Compose a world/local Y rotation before a Three.js XYZ Euler orientation. */
export function prependYRotation(e,angle) {
  if(angle===0)return [...e];
  const [x,y,z]=e,c1=Math.cos(x/2),c2=Math.cos(y/2),c3=Math.cos(z/2),s1=Math.sin(x/2),s2=Math.sin(y/2),s3=Math.sin(z/2);
  const ax=s1*c2*c3+c1*s2*s3,ay=c1*s2*c3-s1*c2*s3,az=c1*c2*s3+s1*s2*c3,aw=c1*c2*c3-s1*s2*s3;
  const c=Math.cos(angle/2),s=Math.sin(angle/2),qx=c*ax+s*az,qy=c*ay+s*aw,qz=c*az-s*ax,qw=c*aw-s*ay;
  const m11=1-2*(qy*qy+qz*qz),m12=2*(qx*qy-qz*qw),m13=2*(qx*qz+qy*qw),m22=1-2*(qx*qx+qz*qz),m23=2*(qy*qz-qx*qw),m32=2*(qy*qz+qx*qw),m33=1-2*(qx*qx+qy*qy);
  const ey=Math.asin(Math.max(-1,Math.min(1,m13)));
  return Math.abs(m13)<.9999999?[Math.atan2(-m23,m33),ey,Math.atan2(-m12,m11)]:[Math.atan2(m32,m22),ey,0];
}

/** Recipes use position / Euler-XYZ rotation / positive scale. */
export class Recipe {
  constructor(name, metadata={}) {this.name=name;this.parts=[];this.metadata=metadata;}
  add(geometry,material,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0],label='') {
    this.parts.push({geometry,material,position,scale,rotation,label});return this;
  }
  box(material,x,y,z,w,h,d,label='',ry=0) {return this.add(BOX,material,[x,y,z],[w,h,d],[0,ry,0],label);}
  cylinder(material,x,y,z,r,h,label='',segments=12,topRadius=1) {return this.add({type:'cylinder',segments,topRadius},material,[x,y,z],[r,h,r],[0,0,0],label);}
  sphere(material,x,y,z,rx,ry,rz,label='') {return this.add(SPHERE,material,[x,y,z],[rx,ry,rz],[0,0,0],label);}
  merge(other,offset=[0,0,0],rotation=0) {
    const c=Math.cos(rotation),s=Math.sin(rotation);
    for(const p of other.parts) {
      const [x,y,z]=p.position;
      this.parts.push({...p,position:[offset[0]+x*c+z*s,offset[1]+y,offset[2]-x*s+z*c],rotation:prependYRotation(p.rotation,rotation)});
    }return this;
  }
}

/** Thin cylindrical beam between two points; Euler XYZ compatible with Three.js. */
export function beam(recipe,material,a,b,r=0.2,label='') {
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz);
  const rx=Math.atan2(dz,dy),rz=-Math.asin(Math.max(-1,Math.min(1,dx/len)));
  recipe.add(CYLINDER,material,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[r,len,r],[rx,0,rz],label);
}
