/** Original, closed folded-leaf clusters for a bounded mid-distance street band.
 * Only replaces existing broadleaf crowns. Trunks, mapped placement, height,
 * radius and total tree count stay unchanged; no textures or transparency.
 */
import {GeometryBatch} from '../../geometry.js';
import {rng,hash} from '../../geo.js';
export function createMidFoliageBatch(THREE,records,{origin=[0,0,0],heightAt=()=>0,quality='std'}={}){
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.5,-.5,0,0,0,0,.5,.5,0,0,0,.17,0,0,-.07,0],3));g.setIndex([4,0,1,4,1,2,4,2,3,4,3,0,5,1,0,5,2,1,5,3,2,5,0,3]);g.computeVertexNormals();
 const b=new GeometryBatch(),matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(),q=new THREE.Quaternion(),e=new THREE.Euler(),fine=quality!=='low',pal=['#445e3e','#5d7747','#84965b'].map(s=>new THREE.Color(s).toArray());
 for(const t of records){const startVertex=b.positions.length/3;for(let k=0;k<24;k++){const rr=rng(hash('mid-leaf:'+t.seed+':'+k)),a=k*2.399+rr()*.35,band=k%4,reach=t.r*(.58-band*.08+rr()*.18),cy=t.h*(.52+band*.12)+(rr()-.5)*.32,cx=Math.cos(a)*reach,cz=Math.sin(a)*reach;
   for(let j=0;j<8;j++){const az=a+j*2.399,spread=t.r*.20*(j===0?0:.65+rr()*.4),x=cx+Math.cos(az)*spread,z=cz+Math.sin(az)*spread,y=cy+(j%3-1)*t.r*.10;position.set(x,y,z);scale.set(t.r*(.28+rr()*.07),t.r*.50,t.r*(.56+rr()*.13));q.setFromEuler(e.set((rr()-.5)*2.0,az,(rr()-.5)*1.4));if(!fine&&![0,1,3,5,7].includes(j))continue;matrix.compose(position,q,scale);b.addGeometry(g,matrix,pal[band===3?2:(band+j)%2]);}}
  // Same centres and retained leaves in both qualities. The unchanged record's
  // radius/height remain hard bounds, rather than shrinking to a thin crown band.
  for(let i=startVertex*3;i<b.positions.length;i+=3){const radius=Math.hypot(b.positions[i],b.positions[i+2]);if(radius>t.r){b.positions[i]*=t.r/radius;b.positions[i+2]*=t.r/radius;}b.positions[i]+=t.x-origin[0];b.positions[i+1]=Math.min(t.h,b.positions[i+1])+heightAt(t.x,t.z)-origin[1];b.positions[i+2]+=t.z-origin[2];}
 }
 g.dispose();const geometry=b.geometry();geometry.computeVertexNormals();const material=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.95,metalness:0}),mesh=new THREE.Mesh(geometry,material);mesh.name='Bounded CBD mid-distance folded foliage '+quality;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={treeCount:records.length,quality,triangles:b.triangles,noNewTrees:true,textureBytes:0};return mesh;
}
