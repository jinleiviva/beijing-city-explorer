/** National Centre for the Performing Arts. Original approximate surface model. */
import {Recipe} from './geometry.js';
export const NCPA_MATERIALS={
 ncpaTitanium:{color:'#c7ced0',roughness:.54,metalness:.22},
 ncpaGlass:{color:'#7198af',roughness:.42,metalness:.10},
 ncpaSeam:{color:'#b9ccd5',roughness:.58,metalness:.10},
};
export function ncpaEllipsoidPatch(rx,ry,rz,t0,t1,segments=40,rows=18){
 const vertices=[],indices=[];
 for(let j=0;j<=rows;j++){const p=j/rows*Math.PI/2;for(let i=0;i<=segments;i++){const t=t0+(t1-t0)*i/segments;vertices.push(rx*Math.sin(p)*Math.cos(t),ry*Math.cos(p),rz*Math.sin(p)*Math.sin(t));}}
 for(let j=0;j<rows;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
 return{type:'mesh',vertices,indices};
}
export function ncpaRefined(o={}){
 const far=o.lod==='silhouette',r=new Recipe('国家大剧院 · National Centre for the Performing Arts',{approx:true,surfaceFix:'all ellipsoid shell normals point outward; local dielectric-leaning silver/blue stylization',publishedDimensionsMetres:[212.2,46.68,143.64]}),rx=106.1,ry=46.68,rz=71.82,a=.72,f=Math.PI/2;
 r.box('stoneLight',0,.15,0,280,.3,215,'lake-edge terrace');r.box('water',0,.35,0,260,.24,195,'reflecting pool');
 for(const[s,e,m]of[[f+a,f+Math.PI-a,'ncpaTitanium'],[f+Math.PI+a,f+2*Math.PI-a,'ncpaTitanium'],[f-a,f+a,'ncpaGlass'],[f+Math.PI-a,f+Math.PI+a,'ncpaGlass']])r.add(ncpaEllipsoidPatch(rx,ry,rz,s,e,far?20:o.detail===0?32:56,far?12:20),m,[0,0,0],[1,1,1],[0,0,0],'outward ellipsoid titanium and glass shell');
 // Shared thin surface ribbons, not thousands of cylindrical tubes. Each is
 // offset0.10m along the ellipsoid normal, and does not cast micro shadows.
 const g={type:'mesh',vertices:[],indices:[]},rows=far?8:16,n=far?16:o.detail===0?24:44;
 const point=(t,p)=>{const v=[rx*Math.sin(p)*Math.cos(t),ry*Math.cos(p),rz*Math.sin(p)*Math.sin(t)],nn=[v[0]/rx**2,v[1]/ry**2,v[2]/rz**2],l=Math.hypot(...nn);return v.map((x,i)=>x+nn[i]/l*.10);};
 for(let k=0;k<n;k++)for(let j=0;j<rows;j++){
  const t=k/n*Math.PI*2,dt=.00065,p0=(j+.025)/rows*Math.PI/2,p1=(j+1)/rows*Math.PI/2,b=g.vertices.length/3;
  g.vertices.push(...point(t-dt,p0),...point(t+dt,p0),...point(t+dt,p1),...point(t-dt,p1));g.indices.push(b,b+1,b+2,b,b+2,b+3);
 }
 const latitudes=far?4:o.detail===0?10:20,around=far?32:o.detail===0?64:88;
 for(let j=1;j<=latitudes;j++)for(let k=0;k<around;k++){
  const p=j/(latitudes+1)*Math.PI/2,dp=.0010,t0=k/around*Math.PI*2,t1=(k+1)/around*Math.PI*2,b=g.vertices.length/3;
  g.vertices.push(...point(t0,p-dp),...point(t1,p-dp),...point(t1,p+dp),...point(t0,p+dp));g.indices.push(b,b+1,b+2,b,b+2,b+3);
 }
 r.add(g,'ncpaSeam',[0,0,0],[1,1,1],[0,0,0],'fine NCPA shell panel seam');r.parts.at(-1).castShadow=false;
 r.box('ncpaGlass',0,.7,87,25,.5,55,'underwater north-south entrance route');return r;
}
