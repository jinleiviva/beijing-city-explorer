import * as T from '../../../vendor/three.module.js';
import {TYPES,OUTFITS,vehicleModel,personModel,limbGeometry,builder,box,ellipsoid} from './models.js';
/** Add after original traffic construction; simulation remains entirely owned by traffic.js. */
export function attachTrafficDetail(traffic){
 if(traffic.detail) return traffic.detail;
 const originals=traffic.group.children.slice(),byName=new Map(originals.map(m=>[m.name,m]));
 const body=byName.get('chamfered vehicle bodies'),heads=byName.get('pedestrian heads'),torsos=byName.get('pedestrian coats and shirts'),oldShoes=byName.get('individual shoes');
 if(!body||!heads||!torsos||!oldShoes)throw Error('Street detail source contract changed');
 const carCapacity=body.instanceMatrix.count,personCapacity=heads.instanceMatrix.count;
 const material=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.65,metalness:.08});material.name='CBD refined street-life shared vertex-color material';
 const meshes=[];function batch(g,n,name){const m=new T.InstancedMesh(g,material,n);m.name=name;m.count=0;m.frustumCulled=false;m.castShadow=true;m.receiveShadow=true;m.instanceMatrix.setUsage(T.DynamicDrawUsage);traffic.group.add(m);meshes.push(m);return m;}
 const vehicles=TYPES.map(t=>{const g=vehicleModel(t);return{paint:batch(g.paint,carCapacity,'refined '+t.id+' paint'),detail:batch(g.detail,carCapacity,'refined '+t.id+' glazing lamps wheels')};});
 const people=OUTFITS.map((o,i)=>batch(personModel(i),personCapacity,'refined '+o.name));
 const limbs=batch(limbGeometry(),personCapacity*8,'refined articulated upper lower limbs');
 const sb=builder();box(sb,'#3b4140',[0,.065,.04],[.13,.13,.25]);const shoes=batch(sb.finish(),personCapacity*2,'refined grounded shoes');
 const hb=builder();ellipsoid(hb,'#ffffff',[0,0,0],[.043,.060,.035]);const hands=batch(hb.finish(),personCapacity*2,'refined hands');
 const p=new T.Vector3(),s=new T.Vector3(),q=new T.Quaternion(),m=new T.Matrix4(),base=new T.Matrix4(),local=new T.Matrix4(),inverse=new T.Matrix4(),color=new T.Color(),temp=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),up=new T.Vector3(0,1,0),identity=new T.Quaternion(),one=new T.Vector3(1,1,1),footPositions=[new T.Vector3(),new T.Vector3()];
 const colors=OUTFITS.map(o=>({coat:new T.Color(o.coat),pants:new T.Color(o.pants),skin:new T.Color(o.skin)}));
 function put(mesh,i,x,y,z,sx=1,sy=1,sz=1){local.compose(temp.set(x,y,z),identity,s.set(sx,sy,sz));m.multiplyMatrices(base,local);mesh.setMatrixAt(i,m);}
 function segment(i,x0,y0,z0,x1,y1,z1,width,c){a.set(x0,y0,z0);b.set(x1,y1,z1);const len=a.distanceTo(b);q.setFromUnitVectors(up,temp.subVectors(b,a).normalize());local.compose(a.add(b).multiplyScalar(.5),q,s.set(width,len,width));m.multiplyMatrices(base,local);limbs.setMatrixAt(i,m);limbs.setColorAt(i,c);}
 let lastTime=-1,near=true;
 function sync(distance=0){const nextNear=distance<1800;if(lastTime===traffic.time&&near===nextNear)return;lastTime=traffic.time;near=nextNear;
  // Revert to existing inexpensive shapes only at distant overview; no new entities.
  for(const o of originals)o.visible=!near;for(const o of meshes)o.visible=near;if(!near)return;
  for(const o of meshes)o.count=0;
  for(let i=0;i<body.count;i++){body.getMatrixAt(i,m);m.decompose(p,q,s);let k=0,err=Infinity;for(let j=0;j<TYPES.length;j++){const e=Math.abs(s.z-TYPES[j].l);if(e<err){err=e;k=j;}}const t=TYPES[k],v=vehicles[k],n=v.paint.count++;v.detail.count++;p.y-=t.h*.35;base.compose(p,q,one);v.paint.setMatrixAt(n,base);v.detail.setMatrixAt(n,base);body.getColorAt(i,color);v.paint.setColorAt(n,color);}
  for(let i=0;i<heads.count;i++){heads.getMatrixAt(i,m);m.decompose(p,q,s);const h=s.x/.09,ratio=h/1.75,ground=p.y-h*.91+.0125;torsos.getMatrixAt(i,m);m.decompose(temp,q,s);p.set(temp.x,ground,temp.z);base.compose(p,q,one);inverse.copy(base).invert();
   torsos.getColorAt(i,color);const k=Math.abs(Math.round(color.r*127+color.g*251+color.b*73))%3,c=colors[k],pm=people[k],n=pm.count++;local.makeScale(ratio,ratio,ratio);m.multiplyMatrices(base,local);pm.setMatrixAt(n,m);
   for(let j=0;j<2;j++){oldShoes.getMatrixAt(i*2+j,m);footPositions[j].setFromMatrixPosition(m).applyMatrix4(inverse).divideScalar(ratio);}
   // Two-segment legs end at actual source shoe travel. Plant both soles at source ground;
   // gentle knee flexion supplies walk articulation without changing path or stride phase.
   for(let j=0;j<2;j++){const sign=j?1:-1,f=footPositions[j],x=sign*.10,z=f.z-.045,hip=.87,ankle=.12,kneeY=.49,kneeZ=(z*.48)+.055;
    const n=limbs.count;segment(n,x*ratio,hip*ratio,0,x*ratio,kneeY*ratio,kneeZ*ratio,.135*ratio,c.pants);segment(n+1,x*ratio,kneeY*ratio,kneeZ*ratio,x*ratio,ankle*ratio,z*ratio,.115*ratio,c.pants);limbs.count+=2;
    put(shoes,shoes.count++,x*ratio,0,z*ratio,ratio,ratio,ratio);
    const az=-z*.62,elbowZ=az*.45-.035,handZ=az+.025,armX=sign*.25;
    segment(limbs.count++,armX*ratio,1.36*ratio,0,armX*ratio,1.10*ratio,elbowZ*ratio,.10*ratio,c.coat);segment(limbs.count++,armX*ratio,1.10*ratio,elbowZ*ratio,armX*ratio,.88*ratio,handZ*ratio,.085*ratio,c.coat);const hi=hands.count++;put(hands,hi,armX*ratio,.845*ratio,handZ*ratio,ratio,ratio,ratio);hands.setColorAt(hi,c.skin);
   }
  }
  for(const o of meshes){o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;}
 }
 const originalUpdate=traffic.update;traffic.update=(dt,target,distance,camera)=>{originalUpdate.call(traffic,dt,target,distance,camera);sync(distance);};
 const detail={sync,meshes,stats(){return{version:'street-life-v1',carCapacity,personCapacity,batches:meshes.length,visibleBatches:meshes.filter(m=>m.visible&&m.count).length,triangles:meshes.reduce((n,m)=>n+(m.visible?m.geometry.attributes.position.count/3*m.count:0),0),geometryBytes:meshes.reduce((n,m)=>n+Object.values(m.geometry.attributes).reduce((a,v)=>a+v.array.byteLength,0),0),matrixCapacityBytes:meshes.reduce((n,m)=>n+m.instanceMatrix.array.byteLength,0),near,farFallbackMetres:1800,updateGeometryAllocations:0,originalSimulationUnchanged:true,FPS:'not measured'};}};traffic.detail=detail;sync();return detail;
}
