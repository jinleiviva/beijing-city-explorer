/** Pure geometry preparation for mapped Qionghua paths and steps.
 * No filesystem, no web imports and no mutation of supplied features.
 * World axes X east / Y up / Z south, metres. Heights are approximate relief.
 */
const R=6378137, D=Math.PI/180;
const defaultProject=([lon,lat])=>[(lon-116.3975)*D*R*Math.cos(39.9087*D),-(lat-39.9087)*D*R];
export function densifyPathXZ(points,maxSegmentM=2){
 if(!(maxSegmentM>0))throw new Error('maxSegmentM must be positive');
 const clean=points.filter((p,i)=>i===0||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>1e-8);
 if(!clean.length)return [];
 const out=[[...clean[0]]];for(let i=1;i<clean.length;i++){const a=clean[i-1],b=clean[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/maxSegmentM));for(let j=1;j<=n;j++)out.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}return out;
}
/** Returns 27 mapped path features and 8 stair features, split only if GeoJSON is MultiLineString.
 * heightAt must return the shared relative relief once; baseY is added here once.
 * Bridges/tunnels are not terrain-draped. Original source geometries remain untouched.
 */
export function prepareBeihaiPathDrape(geojson, options={}){
 const project=options.project||defaultProject,heightAt=options.heightAt||(()=>0),baseY=options.baseY??.65,maxSegmentM=options.maxSegmentM??2,stepPitchM=options.stepPitchM??.35;
 const paths=[],skipped=[];let sourcePathFeatures=0,sourceStepFeatures=0;
 for(const f of geojson.features){const p=f.properties||{},role=p.role;if(!['mapped-path','mapped-steps'].includes(role))continue;
  const tags=p.tags||{},isSteps=role==='mapped-steps'||tags.highway==='steps';if(isSteps)sourceStepFeatures++;else sourcePathFeatures++;
  if(Number(tags.layer||0)!==0||tags.bridge==='yes'||tags.tunnel==='yes'){skipped.push({id:f.id,reason:'Elevated bridge or tunnel needs its own level profile; do not drape.'});continue;}
  const lines=f.geometry.type==='MultiLineString'?f.geometry.coordinates:[f.geometry.coordinates];
  lines.forEach((line,part)=>{if(line.length<2)return;const raw=line.map(project),points=densifyPathXZ(raw,isSteps?stepPitchM:maxSegmentM),widthTag=parseFloat(tags.width),width=Number.isFinite(widthTag)&&widthTag>0?widthTag:(isSteps?2.4:tags.highway==='service'?4:2.5),distances=[0];
   for(let i=1;i<points.length;i++)distances.push(distances.at(-1)+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
   const profile=points.map(([x,z],i)=>({x,z,y:baseY+heightAt(x,z),distanceM:distances[i]}));
   const stepSegments=isSteps?points.slice(1).map((b,i)=>{const a=points[i],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
    // Approximate tread sits just above the highest terrain corner. Exact historical stair counts are unknown.
    const corners=[[a[0]+nx*width/2,a[1]+nz*width/2],[a[0]-nx*width/2,a[1]-nz*width/2],[b[0]+nx*width/2,b[1]+nz*width/2],[b[0]-nx*width/2,b[1]-nz*width/2]];
    return{startXZ:a,endXZ:b,centerXZ:[mx,mz],widthM:width,depthM:len,treadY:baseY+Math.max(...corners.map(q=>heightAt(...q))),approximateRiseM:profile[i+1].y-profile[i].y};}):null;
   const maxGrade=profile.slice(1).reduce((v,q,i)=>Math.max(v,Math.abs(q.y-profile[i].y)/(q.distanceM-profile[i].distanceM||1)),0);
   paths.push({id:f.id+(lines.length>1?'-part-'+part:''),sourceFeatureId:f.id,osmRef:p.osmRef,source:p.source,role,isSteps,tags:{...tags},widthM:width,widthAccuracy:Number.isFinite(widthTag)?'OSM width tag':'Type-based approximate rendering width; not measured from photograph',originalVertexCount:raw.length,pointsXZ:points,profile,stepSegments,lengthM:distances.at(-1),maxGrade,maxSegmentM:isSteps?stepPitchM:maxSegmentM,heightSource:'Caller shared approximate island relief, added once',accuracy:'Mapped horizontal centerline; vertical profile and stair subdivision inferred. No surveyed stair counts or terrace heights.',warnings:maxGrade>.7?['Steep inferred terrain profile: inspect terrace/steps in render; do not claim surveyed gradient.']:[]});
  });
 }
 return{paths,skipped,metadata:{sourcePathFeatures,sourceStepFeatures,renderParts:paths.length,pointCount:paths.reduce((n,p)=>n+p.profile.length,0),coordinateSystem:'Scene east/up/south metres',baseY,maxSegmentM,stepPitchM,stairPitchApproximate:true,notVisualAcceptance:true}};
}
/** Lightweight smooth ribbon arrays for paths. Use stepSegments for actual tread construction.
 * Edge vertices are sampled independently, avoiding burial on a cross-slope.
 */
export function buildDrapedRibbonArrays(path,heightAt,options={}){
 const points=path.pointsXZ,width=options.widthM??path.widthM,baseY=options.baseY??.65,positions=[],indices=[];
 for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len;
  for(const side of[-1,1]){const x=points[i][0]+nx*width*.5*side,z=points[i][1]+nz*width*.5*side;positions.push(x,baseY+heightAt(x,z),z);}
  if(i){const a=(i-1)*2,b=a+1,c=i*2,d=c+1;indices.push(a,c,b,b,c,d);}
 }
 // Ensure every triangle faces upward, irrespective of source path direction.
 for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3,cross=(positions[b]-positions[a])*(positions[c+2]-positions[a+2])-(positions[b+2]-positions[a+2])*(positions[c]-positions[a]);if(cross>0)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];}
 return{positions:new Float32Array(positions),indices:new Uint32Array(indices),metadata:{sourceFeatureId:path.sourceFeatureId,isSteps:path.isSteps,warning:path.isSteps?'Smooth ribbon is support only; render approximate treads using stepSegments if stair detail required.':null}};
}
