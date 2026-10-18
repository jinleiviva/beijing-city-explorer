import {clippedLineSegments,clippedStrip} from './round2/cbd-mall-junction/clipping.js';
import {planPairedMedianBarriers} from './paired-median-barriers.js';
import {createCarriagewayGuard} from './tree-ground-guard.js';
import * as THREE from '../vendor/three.module.js';
import {hash,rng,unproject} from './geo.js';
import {GeometryBatch,strip,colorArray} from './geometry.js';

const PROFILES={
 ceremonial:{lamp:'ceremonial',lampSpacing:42,sidewalk:'#c9c6b4',bench:'#847d66',planter:false},
 civic_avenue:{lamp:'double',lampSpacing:48,sidewalk:'#b9b8aa',bench:'#7f8274',planter:true},
 cbd_boulevard:{lamp:'double',lampSpacing:40,sidewalk:'#aeb5b1',bench:'#8b928a',planter:true},
 cbd_local:{lamp:'modern',lampSpacing:32,sidewalk:'#b1b8b0',bench:'#9b9f91',planter:true},
 financial:{lamp:'modern',lampSpacing:35,sidewalk:'#c4c5b8',bench:'#8c8978',planter:true},
 historic_arterial:{lamp:'classic',lampSpacing:36,sidewalk:'#acae9b',bench:'#8e8065',planter:false},
 historic_commercial:{lamp:'classic',lampSpacing:29,sidewalk:'#b7b29e',bench:'#897251',planter:true},
 heritage_axis:{lamp:'classic',lampSpacing:42,sidewalk:'#b8b69f',bench:'#81735b',planter:false},
 pedestrian_heritage:{lamp:'heritage',lampSpacing:25,sidewalk:'#adae9a',bench:'#7e6449',planter:true},
 pedestrian_retail:{lamp:'modern',lampSpacing:28,sidewalk:'#c3c1ad',bench:'#8c8e7c',planter:true},
 retail_arterial:{lamp:'double',lampSpacing:34,sidewalk:'#b8b6a5',bench:'#7d857c',planter:true},
 mixed_arterial:{lamp:'double',lampSpacing:42,sidewalk:'#b0b39f',bench:'#868978',planter:false},
 nightlife_arterial:{lamp:'modern',lampSpacing:31,sidewalk:'#a8b0a5',bench:'#7e8e83',planter:true},
 hutong:{lamp:'classic',lampSpacing:32,sidewalk:'#aaa993',bench:'#7f6f58',planter:false},
 hutong_pedestrian:{lamp:'none',lampSpacing:28,sidewalk:'#a4aaa6',bench:'#7e6a53',planter:false},
 financial_district:{lamp:'modern',lampSpacing:35,sidewalk:'#c4c5b8',bench:'#8c8978',planter:false},
 retail_local:{lamp:'modern',lampSpacing:31,sidewalk:'#adb2ad',bench:'#8c8e7c',planter:false},
 park_boulevard:{lamp:'none',lampSpacing:46,sidewalk:'#b3b7af',bench:'#81765d',planter:false},
 campus_avenue:{lamp:'none',lampSpacing:44,sidewalk:'#aeb3ad',bench:'#898574',planter:false},
 olympic_boulevard:{lamp:'none',lampSpacing:48,sidewalk:'#c0c3bb',bench:'#90978d',planter:false},
};
function material(hex,roughness=.85,metalness=0){return new THREE.MeshStandardMaterial({color:hex,roughness,metalness});}
export function buildStreetscape(roads,catalog,{customStreetIds=[],styleOverrides={},detailZones=[],localRoadCuts=null,lampDetail=null,junctionDegrees=null}={}){
 const carriagewayGuard=createCarriagewayGuard(roads);let furnitureRoadRejects=0;
 const group=new THREE.Group();group.name='Named Beijing streetscapes';const byId=new Map(catalog.streets.map(s=>[s.id,s]));
 const materials={metal:material('#64746d',.58,.35),gold:material('#a0915e',.48,.35),light:material('#e5dec1',.4),wood:material('#8b785a'),stone:material('#b0b1a0'),leaf:material('#6e8d55'),lantern:material('#a74735'),dark:material('#3f514b'),rail:material('#929c91',.5,.3),medianRail:material('#d6d3bf',.78,.08)};
 const geometries={box:new THREE.BoxGeometry(1,1,1),sphere:new THREE.IcosahedronGeometry(1,1),cylinder:new THREE.CylinderGeometry(.5,.5,1,7)};
 const batches=new Map(),markBatches=new Map();const mtx=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3(),euler=new THREE.Euler();
 function part(type,mat,x,y,z,w,h,d,rotation=0){if(detailZones.some(b=>x>=b[0]&&z>=b[1]&&x<=b[2]&&z<=b[3]))return;const key=`${Math.floor(x/1300)},${Math.floor(z/1300)}|${type}|${mat}`;if(!batches.has(key))batches.set(key,{type,mat,matrices:[]});q.setFromEuler(euler.set(0,rotation,0));mtx.compose(p.set(x,y,z),q,s.set(w,h,d));batches.get(key).matrices.push(...mtx.elements);}
 function markBatch(x,z){const k=`${Math.floor(x/1400)},${Math.floor(z/1400)}`;if(!markBatches.has(k))markBatches.set(k,{white:new GeometryBatch(),yellow:new GeometryBatch(),walk:new GeometryBatch()});return markBatches.get(k);}
 function ribbon(batch,points,width,y,col,dashed=false,clipPolygons=[]){for(const {a,b,startDistance:dist,endDistance} of clippedLineSegments(points,clipPolygons)){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<.001)continue;const nx=-dz/l*width/2,nz=dx/l*width/2,ya=typeof y==='function'?y(...a):y,yb=typeof y==='function'?y(...b):y,A=[a[0]+nx,ya,a[1]+nz],B=[b[0]+nx,yb,b[1]+nz],C=[b[0]-nx,yb,b[1]-nz],D=[a[0]-nx,ya,a[1]-nz];batch.tri(A,B,C,col,[0,1,0],[dist,0,endDistance,0,endDistance,1]);batch.tri(A,C,D,col,[0,1,0],[dist,0,endDistance,1,dist,1]);}}

 function offsetLine(pts,off){return pts.map((a,i)=>{const b=pts[Math.min(pts.length-1,i+1)],c=pts[Math.max(0,i-1)],dx=b[0]-c[0],dz=b[1]-c[1],l=Math.hypot(dx,dz)||1;return[a[0]-dz/l*off,a[1]+dx/l*off];});}
 const junctionDegree=junctionDegrees||new Map();if(!junctionDegrees)for(const r of roads){for(const a of [r.points[0],r.points.at(-1)]){const k=`${Math.round(a[0])},${Math.round(a[1])}`;junctionDegree.set(k,(junctionDegree.get(k)||0)+1);}}
 const records=new Map(),crossings=[];let lamps=0,benches=0,lanterns=0,planters=0,detailedLamps=0;
 for(const road of roads){const st=byId.get(road.properties.streetId);if(!st)continue;const baseStyle=PROFILES[st.profile];if(!baseStyle)throw Error('Unmapped street profile: '+st.profile);const baseOverride=styleOverrides[st.id]||{},mid=road.points[Math.floor(road.points.length/2)],lon=unproject(...mid)[0],segment=(baseOverride.segmentOverrides||[]).find(s=>s.longitudeRange&&lon>=s.longitudeRange[0]&&lon<=s.longitudeRange[1])||{},override={...baseOverride,...segment,furniture:{...baseOverride.furniture,...segment.furniture}},style={...baseStyle},rr=rng(hash(road.id));if(!override.lampForm||override.lampForm==='unknown')style.lamp='none';else style.lamp=({single:'modern',double:'double',ceremonial:'ceremonial',heritage:'heritage'})[override.lampForm]||style.lamp;if(override.sidewalkSurface&&override.sidewalkSurface!=='unknown')style.sidewalk=({stone:'#b9bdb7','gray-brick':'#9da5a4',asphalt:'#778181',shared:'#a6aaa3'})[override.sidewalkSurface]||style.sidewalk;style.planter=override.furniture?.planter==='confirmed-in-view';
  if(!records.has(st.id))records.set(st.id,{id:st.id,name:st.name,profile:st.profile,segments:0,lamps:0,benches:0,planters:0,referenceStatus:st.visualEvidenceStatus,observedLamp:baseOverride.lampForm||'unknown',observedCenter:baseOverride.centerTreatment||'unknown',observedPaving:baseOverride.sidewalkSurface||'unknown',sourcePhotos:baseOverride.evidence?.map(e=>e.sourceUrl)||[],scope:baseOverride.applicationScope||'typological approximation'});const record=records.get(st.id);record.segments++;if(customStreetIds.includes(st.id)||road.properties.customBridge==='wanning'){record.customDetailedStreet=true;continue;}
  if(road.y>3||road.elevationProfile)continue;
  const pedestrian=['pedestrian','footway','living_street'].includes(road.class)||st.profile.startsWith('pedestrian');
  const pts=road.points,mark=markBatch(pts[0][0],pts[0][1]);
  if(!pedestrian&&road.width>8){
   const lanes=Math.max(2,Math.min(5,parseInt(road.properties.lanes)||Math.round(road.width/3.7)));
   for(let j=1;j<lanes;j++){const off=-road.width/2+j*road.width/lanes;ribbon(mark.white,offsetLine(pts,off),.16,(x,z)=>(road.surfaceHeightAt?.(x,z)??road.y)+.07,colorArray('#d5d3b9'),true,localRoadCuts?.lane?.[road.id]||[]);}
   if(road.oneway!=='yes'&&override.centerTreatment!=='none'){if(override.centerTreatment==='double-yellow')for(const side of [-1,1])ribbon(mark.yellow,offsetLine(pts,.18*side),.14,(x,z)=>(road.surfaceHeightAt?.(x,z)??road.y)+.09,colorArray('#d4b855'));else if(override.centerTreatment==='single-yellow')ribbon(mark.yellow,pts,.16,(x,z)=>(road.surfaceHeightAt?.(x,z)??road.y)+.09,colorArray('#c8b971'));}
  }
  // Distinct paving ribbons are local to each real mapped carriageway.
  for(const side of [-1,1]){const line=offsetLine(pts,side*(road.width/2+1.8)),cuts=localRoadCuts?.walk?.[road.id]||[];if(cuts.length)clippedStrip(mark.walk,line,3.6,(x,z)=>(road.surfaceHeightAt?.(x,z)??road.y)-.07,colorArray(style.sidewalk),cuts);else strip(mark.walk,line,3.6,(x,z)=>(road.surfaceHeightAt?.(x,z)??road.y)-.07,colorArray(style.sidewalk));}
  let carry=10+rr()*20;
  for(let i=1;i<pts.length;i++){
   const a=pts[i-1],b=pts[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1)continue;const yaw=Math.atan2(dx,dz),nx=-dz/length,nz=dx/length;
   for(let distance=carry;distance<length;distance+=style.lampSpacing){const t=distance/length;const bx=a[0]+dx*t,bz=a[1]+dz*t;
    for(const side of [-1,1]){const off=road.width/2+2.5,x=bx+nx*off*side,z=bz+nz*off*side;const ornate=style.lamp==='ceremonial',historic=['classic','heritage'].includes(style.lamp),height=ornate?12:historic?6.2:9;
     if(carriagewayGuard.blocked(x,z,.35)){furnitureRoadRejects++;continue;}
     if(style.lamp!=='none'){const detailed=lampDetail?.({x,z,roadY:road.y,height,form:style.lamp,nx,nz,side,yaw,roadId:road.id,streetId:st.id})===true;lamps++;record.lamps++;if(detailed)detailedLamps++;else{part('cylinder',ornate?'gold':'metal',x,road.y+height/2,z,.22,height,.22);part('cylinder','stone',x,road.y+.4,z,.5,.8,.5);
     if(ornate){part('box','gold',x,height-.6,z,6,.14,.18,yaw);for(const k of [-2,-1,0,1,2]){const xx=x+Math.cos(yaw)*k*1.15,zz=z-Math.sin(yaw)*k*1.15;part('cylinder','gold',xx,height-.3+(.3-Math.abs(k)*.1),zz,.1,.9,.1);part('sphere','light',xx,height+.2-Math.abs(k)*.12,zz,.38,.52,.38);}}
     else if(historic){part('box','metal',x,height-.5,z,1.6,.14,.14,yaw);for(const k of [-1,1])part('sphere','light',x+Math.cos(yaw)*k*.65,height-.2,z-Math.sin(yaw)*k*.65,.30,.45,.30);}
     else {for(const armSide of style.lamp==='double'?[-1,1]:[side]){part('box','metal',x-nx*.85*armSide,height,z-nz*.85*armSide,2.2,.14,.16,yaw+Math.PI/2);part('box','light',x-nx*1.8*armSide,height-.06,z-nz*1.8*armSide,.9,.16,.32,yaw+Math.PI/2);}}
     }}
     if(style.planter&&Math.floor(distance/style.lampSpacing)%3===0){const xx=x+dx/length*5,zz=z+dz/length*5;if(carriagewayGuard.blocked(xx,zz,1.3)){furnitureRoadRejects++;continue;}part('box','stone',xx,.65,zz,2.4,1.1,1.15,yaw);part('box','leaf',xx,1.25,zz,2.2,.42,.95,yaw);planters++;record.planters++;}
     if(override.furniture?.bench==='confirmed-in-view'&&Math.floor(distance/style.lampSpacing)%4===1){const xx=x-dx/length*5,zz=z-dz/length*5;if(carriagewayGuard.blocked(xx,zz,1.15)){furnitureRoadRejects++;continue;}part('box','wood',xx,.65,zz,2.1,.16,.66,yaw);part('box','wood',xx,.98,zz-.25,2.1,.55,.12,yaw);part('box','metal',xx,.28,zz,1.7,.56,.38,yaw);benches++;record.benches++;}
     if(override.furniture?.permanentLantern==='confirmed-in-view'){part('sphere','lantern',x,4.4,z,.55,.72,.55);part('cylinder','gold',x,3.95,z,.08,.28,.08);lanterns++;}
    }
   }
   if(!pedestrian&&road.oneway!=='yes'&&road.width>12&&override.centerTreatment==='low-metal-fence')for(let d=2;d<length-8;d+=3){const xx=a[0]+dx*d/length,zz=a[1]+dz*d/length;part('cylinder','rail',xx,road.y+.52,zz,.09,1.04,.09);for(const yy of [.27,.87])part('box','rail',xx+dx/length*1.5,road.y+yy,zz+dz/length*1.5,.055,.07,3,yaw);}
   carry=(carry-length)%style.lampSpacing;if(carry<0)carry+=style.lampSpacing;
  }
  if(!pedestrian&&!['motorway','motorway_link','trunk'].includes(road.class))for(const end of [0,pts.length-1]){
   const a=pts[end],k=`${Math.round(a[0])},${Math.round(a[1])}`;if((junctionDegree.get(k)||0)<3)continue;const b=pts[end===0?1:pts.length-2],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;const cx=a[0]+dx/l*9,cz=a[1]+dz/l*9,nx=-dz/l,nz=dx/l;
   const crossingWidth=Math.min(road.width-1,23);for(let j=-crossingWidth/2;j<crossingWidth/2;j+=1.25){const ax=cx+nx*j,az=cz+nz*j;strip(mark.white,[[ax-dx/l*2,az-dz/l*2],[ax+dx/l*2,az+dz/l*2]],.60,road.y+.11,colorArray('#dcdcc6'));}
   crossings.push({sourceRoadId:road.id,approachId:road.id+'|'+end+'|'+k,x:cx,z:cz,dx:nx,dz:nz,width:crossingWidth,roadWidth:road.width,roadAxis:Math.abs(dx)>Math.abs(dz)?0:1,streetId:st.id,y:road.y+.2,signalKey:k});
  }
 }
 const pairedMedian=planPairedMedianBarriers(roads,styleOverrides);for(const v of pairedMedian.pieces){const yaw=Math.atan2(v.dx,v.dz);part('cylinder','medianRail',v.x,v.y+.52,v.z,.075,1.04,.075);for(const yy of [.25,.89])part('box','medianRail',v.x+v.dx*v.length*.5,v.y+yy,v.z+v.dz*v.length*.5,.055,.065,v.length,yaw);for(let k=.5;k<v.length;k+=.6)part('box','medianRail',v.x+v.dx*k,v.y+.55,v.z+v.dz*k,.04,.6,.04,yaw);}
 for(const b of batches.values()){const mesh=new THREE.InstancedMesh(geometries[b.type],materials[b.mat],b.matrices.length/16);mesh.instanceMatrix.array.set(b.matrices);mesh.computeBoundingSphere();mesh.castShadow=false;mesh.receiveShadow=true;mesh.userData.streetMicroDetail=true;group.add(mesh);}
 const dashMaterial=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});dashMaterial.onBeforeCompile=s=>{s.vertexShader='varying vec2 vDashUV;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvDashUV=uv;');s.fragmentShader='varying vec2 vDashUV;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(vDashUV.y<.99 && mod(vDashUV.x,10.)>4.5) discard;');};
 const flat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
 const details=new THREE.Group();details.name='Lane markings and streetside paving';
 for(const [key,b] of markBatches){for(const name of ['white','yellow','walk']){const m=b[name].mesh(name==='white'?dashMaterial:flat);m.name=`${name} ${key}`;m.receiveShadow=true;details.add(m);}}
 group.add(details);group.userData={namedStreetCount:records.size,pairedMedianBarrierSegments:pairedMedian.pieces.length,pairedMedianTruncated:pairedMedian.truncated,furnitureRoadRejects,lamps,detailedLamps,benches,planters,lanterns,crossings:crossings.length,streets:[...records.values()],accuracy:'Mapped street paths with photo-informed approximate furniture and paving; lane widths and crossing layouts are illustrative'};
 return{group,crossings,stats:()=>group.userData,update:(camera,distance)=>{for(const m of group.children){if(m.userData.streetMicroDetail){const b=m.geometry.boundingSphere;m.visible=distance<2400;} }details.visible=distance<8000;}};
}
