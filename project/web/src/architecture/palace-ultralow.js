/**14 triangles per actual subsidiary hall; no window, column or ridge allocations. */
export function addPalaceUltraLow(r,buildings){
 const buckets=new Map();const get=m=>{if(!buckets.has(m))buckets.set(m,{type:'mesh',vertices:[],indices:[],flatShading:true});return buckets.get(m);};
 function mesh(m,vertices,indices,b){const g=get(m),base=g.vertices.length/3,c=Math.cos(b.rotation),s=Math.sin(b.rotation);for(let k=0;k<vertices.length;k+=3){const[x,y,z]=vertices.slice(k,k+3);g.vertices.push(b.x+x*c+z*s,y,b.z-x*s+z*c);}g.indices.push(...indices.map(i=>i+base));}
 for(const b of buildings){
  const w=b.width,d=b.depth,h=b.height,rise=Math.min(h*.34,d*.33),wall=h-rise,gold=(Math.abs(b.x)<245&&b.z<145)||b.roof==='gold',x=w*.46,z=d*.435;
  mesh(gold?'vermilionDark':'greyBrick',[-x,0,-z,x,0,-z,x,0,z,-x,0,z,-x,wall,-z,x,wall,-z,x,wall,z,-x,wall,z],[0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0],b);
  const xx=w/2,zz=d/2,ridge=w*(gold?.275:.5);
  // Slopes and triangular hip/gable ends all have exterior winding. Underside omitted.
  mesh(gold?'roofGold':'roofGrey',[-xx,wall,-zz,xx,wall,-zz,xx,wall,zz,-xx,wall,zz,-ridge,h,0,ridge,h,0],[0,4,5,0,5,1,3,2,5,3,5,4,0,3,4,1,5,2],b);
 }
 for(const[m,g]of buckets)r.add(g,m,[0,0,0],[1,1,1],[0,0,0],'ultra-low actual palace subsidiary halls '+m);
 r.metadata.ultraLowMappedHalls=buildings.length;r.metadata.ultraLowTriangles=buildings.length*14;r.metadata.ultraLowRoofShapes='original six-triangle hipped/gabled approximations within mapped oriented dimensions';
}
