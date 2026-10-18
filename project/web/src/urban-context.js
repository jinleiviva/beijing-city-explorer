import * as THREE from '../vendor/three.module.js';
import {decorateGround} from './ground-surfaces.js';
import {project,hash,rng} from './geo.js';
import {GeometryBatch,polygonGeometry,strip,colorArray} from './geometry.js';

export function buildUrbanContext(features,{landuseSurfaceOverrides,landuseSurfaceAppender}={}){
 const surfaces=new Map((landuseSurfaceOverrides?.features||[]).map(f=>[f.properties.sourceLanduseId||f.id,f.geometry])),emptySurfaces=new Set(landuseSurfaceOverrides?.metadata?.emptySurfaceLanduseIds||[]);
 const group=new THREE.Group();group.name='Mapped land-use and surface railways';
 const land=new GeometryBatch(),beds=new GeometryBatch(),rails=new GeometryBatch(),platforms=new GeometryBatch();
 for(const b of [land,beds,rails,platforms])b.setSurfaceKind(0);platforms.setSurfaceKind(2);
 const colors={residential:['#a4ad95','#afb7a0','#a9b19a'],commercial:['#b9b6aa','#afb0a5'],retail:['#b9b3a2','#b7b4a8'],industrial:['#aaa99b'],railway:['#9e9c8e'],construction:['#b9ae91']};
 let landCount=0,railCount=0;
 for(const f of features){const p=f.properties,g=f.geometry;if(!g)continue;
  if(p.kind==='landuse'&&colors[p.class]){
   const surface=emptySurfaces.has(f.id)?null:(surfaces.get(f.id)||g);const polys=!surface?[]:surface.type==='MultiPolygon'?surface.coordinates:surface.type==='Polygon'?[surface.coordinates]:[];
   const random=rng(hash(f.id)),palette=colors[p.class],color=colorArray(palette[Math.floor(random()*palette.length)]);
   for(const polygon of polys){const rings=polygon.map(r=>r.map(project));if(rings[0].length<4)continue;if(!landuseSurfaceAppender?.({batch:land,id:f.id,rings,y:-.02,color})){const geom=polygonGeometry(rings,-.02);land.addGeometry(geom,new THREE.Matrix4(),color);geom.dispose();}landCount++;}
  }
  if(p.kind==='railway'&&p.tunnel!=='yes'&&Number(p.layer||0)>=0){
   const lines=g.type==='MultiLineString'?g.coordinates:g.type==='LineString'?[g.coordinates]:[];
   for(const line of lines){const pts=line.map(project);if(pts.length<2)continue;const y=.8+Number(p.layer||0)*6;
    if(p.class==='platform'){strip(platforms,pts,7.5,y+1,colorArray('#c6c3b4'));continue;}
    if(!['rail','tram'].includes(p.class))continue;
    strip(beds,pts,3.6,y-.2,colorArray('#8e8c7c'));for(const side of [-1,1]){const offset=pts.map((a,i)=>{const b=pts[Math.min(i+1,pts.length-1)],c=pts[Math.max(0,i-1)],dx=b[0]-c[0],dz=b[1]-c[1],l=Math.hypot(dx,dz)||1;return[a[0]-dz/l*.72*side,a[1]+dx/l*.72*side];});strip(rails,offset,.20,y,colorArray('#b4b5a7'));}railCount++;
   }
  }
 }
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
 decorateGround(material);
 for(const [name,batch] of [['mapped land-use',land],['rail ballast',beds],['rail tracks',rails],['platforms',platforms]]){const m=batch.mesh(material);m.name=name;m.receiveShadow=true;group.add(m);}
 group.userData={landusePolygons:landCount,landuseSurfaceOverrides:surfaces.size,visibleRailFeatures:railCount,source:'Geofabrik / OpenStreetMap, WGS84; tunnels omitted'};return group;
}
