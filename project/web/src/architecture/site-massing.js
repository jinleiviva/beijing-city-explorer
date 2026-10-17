/** Dependency-free concave footprint extrusion, preserving H/L-shaped recesses. */
export function polygonPrism(input,y0,y1) {
 let points=input.map(p=>[...p]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const area=points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p[0]*q[1]-q[0]*p[1];},0);
 if(area<0)points.reverse();
 const n=points.length,vertices=[...points.flatMap(([x,z])=>[x,y0,z]),...points.flatMap(([x,z])=>[x,y1,z])],indices=[],remaining=points.map((_,i)=>i),cap=[];
 for(let guard=0;remaining.length>3&&guard<n*n;guard++) {
  let found=false;
  for(let j=0;j<remaining.length;j++) {
   const a=remaining[(j+remaining.length-1)%remaining.length],b=remaining[j],c=remaining[(j+1)%remaining.length];
   if(cross(points[a],points[b],points[c])<1e-8)continue;
   if(remaining.some(k=>k!==a&&k!==b&&k!==c&&cross(points[a],points[b],points[k])>=-1e-8&&cross(points[b],points[c],points[k])>=-1e-8&&cross(points[c],points[a],points[k])>=-1e-8))continue;
   cap.push(a,b,c);remaining.splice(j,1);found=true;break;
  }
  if(!found)throw new Error('Footprint triangulation failed: non-simple or degenerate polygon');
 }
 if(remaining.length===3)cap.push(...remaining);
 for(let i=0;i<cap.length;i+=3){const[a,b,c]=cap.slice(i,i+3);indices.push(a,b,c,n+a,n+c,n+b);}
 for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(i,n+i,n+j,i,n+j,j);}
 return {type:'mesh',vertices,indices,flatShading:true};
}

export function footprintEdges(points) {
 const area=points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p[0]*q[1]-q[0]*p[1];},0),p=area<0?[...points].reverse():points;
 return p.map((a,i)=>{const b=p[(i+1)%p.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),nx=dz/length,nz=-dx/length;return{a,b,length,nx,nz,rotation:Math.atan2(nx,nz),center:[(a[0]+b[0])/2,(a[1]+b[1])/2]};});
}

export function edgePanel(r,edge,material,u,y,width,height,thickness=.18,label='facade panel',offset=.12) {
 const t=u/edge.length,x=edge.a[0]+(edge.b[0]-edge.a[0])*t+edge.nx*offset,z=edge.a[1]+(edge.b[1]-edge.a[1])*t+edge.nz*offset;
 r.box(material,x,y,z,width,height,thickness,label,edge.rotation);
}

export function mappedBody(r,points,bottom,top,material,label) {
 r.add(polygonPrism(points,bottom,top),material,[0,0,0],[1,1,1],[0,0,0],label);
}
