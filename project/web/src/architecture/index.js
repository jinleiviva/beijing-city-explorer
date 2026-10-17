/**
 * Beijing architecture kit. No import of THREE: pass the application's instance.
 * Coordinates are metres: X east, Y up, Z south. Base centre is [0,0,0].
 */
import { makeMaterials, MATERIALS } from './palette.js';
import { meshGeometry } from './geometry.js';
import { buildingRecipe, BUILDING_FAMILIES, BUILDING_DEFAULTS } from './buildings.js';
import { landmarkRecipe, LANDMARK_IDS } from './landmarks.js';

export { buildingRecipe, landmarkRecipe, BUILDING_FAMILIES, BUILDING_DEFAULTS, LANDMARK_IDS, MATERIALS };
export {HERITAGE_CONTEXT_SITES} from './heritage-context-sites.js';
export {CBD_CONTEXT_SITES} from './cbd-context-sites.js';
export {STREET_CORNER_SITES} from './street-corner-sites.js';

/** Small decorative geometry remains visible but does not enter shadow passes. */
export function isMicroDecoration(part) {
  if(part.castShadow===false)return true;
  return /fine antique wooden window lattice|fine historic masonry horizontal mortar joint|fine projecting canopy rib|fine facade cladding seam|fine pink stone panel joint|individual commercial side window|fine .*mullion|fine pale stone cladding joint|individual blue recessed stone-building window|hotel narrow-end square window|upper inset retail window|silhouette silver vertical fin|silver facade rib|corner silver facade rib|fine curtain-wall|tile roll|tile end|window lattice|lattice (vertical|horizontal)|diamond window|signboard carved border|brick pier horizontal mortar|small hanging bronze|bell suspension|inscription stroke|door handle|pull handle|rooflight glazing bar/i.test(part.label??'');
}

export function createArchitectureKit(THREE, kitOptions={}) {
  if(!THREE?.Group||!THREE?.InstancedMesh) throw new Error('Pass the THREE namespace into createArchitectureKit(THREE).');
  const materials=makeMaterials(THREE,kitOptions.materials??{});
  const geometries=new Map(),geometryKeys=new WeakMap(),mergedGeometries=new Set();
  const matrix=new THREE.Matrix4(),local=new THREE.Matrix4(),world=new THREE.Matrix4();
  const position=new THREE.Vector3(),scale=new THREE.Vector3(),quaternion=new THREE.Quaternion(),euler=new THREE.Euler();

  function materialFor(name) {
    const material=materials[name];
    if(!material)throw new Error(`Unknown Beijing architecture material "${name}"; register it explicitly instead of silently substituting stone.`);
    return material;
  }

  function geometryKey(spec) {
    if(geometryKeys.has(spec)) return geometryKeys.get(spec);
    const key=JSON.stringify(spec);geometryKeys.set(spec,key);return key;
  }
  function getGeometry(spec) {
    const key=geometryKey(spec);
    if(!geometries.has(key)) {const geo=meshGeometry(THREE,spec);geo.name=`Beijing_geometry_${geometries.size}`;geo.computeBoundingSphere();geometries.set(key,geo);}
    return geometries.get(key);
  }
  function compose(target,p,r,s) {
    position.fromArray(p);scale.fromArray(s);quaternion.setFromEuler(euler.set(r[0],r[1],r[2],'XYZ'));
    return target.compose(position,quaternion,scale);
  }

  function buildRecipe(recipe,options={}) {
    // Instancing within a single near-view building keeps detailed façades inexpensive.
    const group=new THREE.Group();group.name=options.name??recipe.name;
    group.userData={...recipe.metadata,architectureRecipe:recipe.name};
    const buckets=new Map();
    for(const part of recipe.parts) {
      const geometry=getGeometry(part.geometry),castShadow=(options.castShadow??kitOptions.castShadow??true)&&!isMicroDecoration(part),key=`${geometry.uuid}|${part.material}|shadow:${castShadow}`;
      if(!buckets.has(key)) buckets.set(key,{geometry,material:part.material,castShadow,parts:[]});
      buckets.get(key).parts.push(part);
    }
    for(const bucket of buckets.values()) {
      const mesh=new THREE.InstancedMesh(bucket.geometry,materialFor(bucket.material),bucket.parts.length);
      mesh.name=`${recipe.name} / ${bucket.material}`;
      mesh.castShadow=bucket.castShadow;
      mesh.receiveShadow=options.receiveShadow??kitOptions.receiveShadow??true;
      bucket.parts.forEach((part,i)=>{compose(matrix,part.position,part.rotation,part.scale);mesh.setMatrixAt(i,matrix);});
      mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
      mesh.userData.partLabels=bucket.parts.map(p=>p.label);
      group.add(mesh);
    }
    group.userData.architectureStats={buildings:1,parts:recipe.parts.length,drawCalls:group.children.length,shadowParts:group.children.filter(m=>m.castShadow).reduce((n,m)=>n+m.count,0),shadowDrawCalls:group.children.filter(m=>m.castShadow).length};
    return group;
  }

  /** Bake a far-view recipe into one indexed mesh per material/shadow class.
   * Owns its output geometry; dispose it when unloading, unlike shared instanced geometry.
   * No BufferGeometryUtils dependency or per-part geometry clones are required.
   */
  function buildMergedRecipe(recipe,options={}) {
    const group=new THREE.Group();group.name=options.name??recipe.name;
    group.userData={...recipe.metadata,architectureRecipe:recipe.name,mergedArchitecture:true};
    const buckets=new Map(),normalMatrix=new THREE.Matrix3(),v=new THREE.Vector3(),n=new THREE.Vector3();
    for(const part of recipe.parts){
      const geometry=getGeometry(part.geometry),castShadow=(options.castShadow??kitOptions.castShadow??true)&&!isMicroDecoration(part),key=`${part.material}|shadow:${castShadow}`;
      if(!buckets.has(key))buckets.set(key,{material:part.material,castShadow,parts:[],vertices:0,indexCount:0,hasUV:false});
      const b=buckets.get(key);b.parts.push({part,geometry});b.vertices+=geometry.attributes.position.count;b.indexCount+=geometry.index?.count??geometry.attributes.position.count;b.hasUV||=!!geometry.attributes.uv;
    }
    let totalVertices=0,totalTriangles=0,bufferBytes=0;
    for(const b of buckets.values()){
      const positions=new Float32Array(b.vertices*3),normals=new Float32Array(b.vertices*3),uvs=b.hasUV?new Float32Array(b.vertices*2):null;
      const indices=b.vertices>65535?new Uint32Array(b.indexCount):new Uint16Array(b.indexCount);let vertexOffset=0,indexOffset=0;
      const ranges=[];
      for(const {part,geometry} of b.parts){
        compose(matrix,part.position,part.rotation,part.scale);normalMatrix.getNormalMatrix(matrix);
        const p=geometry.attributes.position,norm=geometry.attributes.normal,uv=geometry.attributes.uv,idx=geometry.index;
        for(let i=0;i<p.count;i++){
          v.fromBufferAttribute(p,i).applyMatrix4(matrix);positions.set([v.x,v.y,v.z],(vertexOffset+i)*3);
          if(norm){n.fromBufferAttribute(norm,i).applyNormalMatrix(normalMatrix);normals.set([n.x,n.y,n.z],(vertexOffset+i)*3);}
          if(uvs&&uv)uvs.set([uv.getX(i),uv.getY(i)],(vertexOffset+i)*2);
        }
        const count=idx?.count??p.count,start=indexOffset,reverse=matrix.determinant()<0;
        for(let i=0;i<count;i+=3){const a=vertexOffset+(idx?idx.getX(i):i),bb=vertexOffset+(idx?idx.getX(i+1):i+1),c=vertexOffset+(idx?idx.getX(i+2):i+2);indices[indexOffset++]=a;indices[indexOffset++]=reverse?c:bb;indices[indexOffset++]=reverse?bb:c;}
        ranges.push({label:part.label,firstTriangle:start/3,triangleCount:count/3});vertexOffset+=p.count;
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.BufferAttribute(normals,3));if(uvs)geo.setAttribute('uv',new THREE.BufferAttribute(uvs,2));geo.setIndex(new THREE.BufferAttribute(indices,1));geo.computeBoundingBox();geo.computeBoundingSphere();
      geo.name=`Merged architecture / ${b.material}`;mergedGeometries.add(geo);geo.addEventListener('dispose',()=>mergedGeometries.delete(geo));
      const mesh=new THREE.Mesh(geo,materialFor(b.material));mesh.name=`${recipe.name} / merged ${b.material}`;mesh.castShadow=b.castShadow;mesh.receiveShadow=options.receiveShadow??kitOptions.receiveShadow??true;mesh.userData={ownedArchitectureGeometry:true,partRanges:ranges};group.add(mesh);
      totalVertices+=b.vertices;totalTriangles+=b.indexCount/3;bufferBytes+=positions.byteLength+normals.byteLength+indices.byteLength+(uvs?.byteLength??0);
    }
    group.userData.architectureStats={buildings:recipe.metadata.buildings??1,parts:recipe.parts.length,drawCalls:group.children.length,vertices:totalVertices,triangles:totalTriangles,bufferBytes,merged:true,shadowParts:[...buckets.values()].filter(b=>b.castShadow).reduce((n,b)=>n+b.parts.length,0),shadowDrawCalls:group.children.filter(m=>m.castShadow).length};
    return group;
  }

  function createBuilding(family='slab',options={}) {return buildRecipe(buildingRecipe(family,options),options);}
  function createLandmark(name,options={}) {return buildRecipe(landmarkRecipe(name,options),options);}

  /** Three automatic distance LOD levels; thresholds scale with actual dimensions. */
  function createLandmarkLOD(name,options={}) {
    const lod=new THREE.LOD();lod.name=`Beijing landmark LOD / ${name}`;
    const near=createLandmark(name,{...options,detail:options.detail??1});
    const middle=createLandmark(name,{...options,detail:0});
    const far=createLandmark(name,{...options,lod:'silhouette',detail:0,castShadow:false});
    const size=new THREE.Box3().setFromObject(middle).getSize(new THREE.Vector3());
    const span=Math.max(size.x,size.y,size.z);
    const nearDistance=options.nearDistance??Math.max(300,span*3.5);
    const farDistance=options.farDistance??Math.max(900,span*9);
    lod.addLevel(near,0);lod.addLevel(middle,nearDistance,.08);lod.addLevel(far,farDistance,.08);
    lod.userData={...near.userData,lodDistances:[0,nearDistance,farDistance],lodStats:[near,middle,far].map(x=>x.userData.architectureStats)};
    lod.updateMatrixWorld(true);return lod;
  }

  /**
   * instances: [{id?,family,x,z,y?,width,depth,height,rotation?,seed?,variant?,detail?}]
   * Landmarks may use {landmark:'china_zun',...}. Rotation is radians around Y.
   * Returns ONE Group of spatially chunked InstancedMeshes, never a Group per building.
   */
  function createBatch(instances,options={}) {
    const group=new THREE.Group();group.name=options.name??'Beijing instanced architecture';
    const chunkSize=options.chunkSize??900,buckets=new Map(),buildings=[];
    let parts=0;
    for(let bi=0;bi<instances.length;bi++) {
      const instance=instances[bi],family=instance.family??'slab';
      const recipeOptions={...instance,detail:instance.detail??options.detail??0,lod:instance.lod??options.lod};
      const recipe=instance.landmark?landmarkRecipe(instance.landmark,recipeOptions):buildingRecipe(family,recipeOptions);
      const x=instance.x??0,y=instance.y??0,z=instance.z??0;
      const chunk=chunkSize>0?`${Math.floor(x/chunkSize)},${Math.floor(z/chunkSize)}`:'all';
      compose(world,[x,y,z],[0,instance.rotation??0,0],[1,1,1]);
      buildings.push({id:instance.id??bi,family:instance.landmark??family,x,y,z,...recipe.metadata});
      for(const part of recipe.parts) {
        const geometry=getGeometry(part.geometry),castShadow=(instance.castShadow??options.castShadow??kitOptions.castShadow??true)&&!isMicroDecoration(part),key=`${chunk}|${geometry.uuid}|${part.material}|shadow:${castShadow}`;
        if(!buckets.has(key)) buckets.set(key,{geometry,material:part.material,castShadow,matrices:[],buildingIndices:[]});
        const bucket=buckets.get(key);
        compose(local,part.position,part.rotation,part.scale);matrix.multiplyMatrices(world,local);
        bucket.matrices.push(...matrix.elements);bucket.buildingIndices.push(bi);parts++;
      }
    }
    for(const bucket of buckets.values()) {
      const mesh=new THREE.InstancedMesh(bucket.geometry,materialFor(bucket.material),bucket.buildingIndices.length);
      mesh.name=`Architecture batch / ${bucket.material}`;
      mesh.instanceMatrix.array.set(bucket.matrices);mesh.instanceMatrix.needsUpdate=true;
      mesh.castShadow=bucket.castShadow;
      mesh.receiveShadow=options.receiveShadow??kitOptions.receiveShadow??true;
      mesh.userData.buildingIndices=new Uint32Array(bucket.buildingIndices);
      mesh.computeBoundingSphere();group.add(mesh);
    }
    group.userData.buildings=buildings;
    group.userData.architectureStats={buildings:instances.length,parts,drawCalls:group.children.length,geometries:geometries.size,shadowParts:group.children.filter(m=>m.castShadow).reduce((n,m)=>n+m.count,0),shadowDrawCalls:group.children.filter(m=>m.castShadow).length};
    return group;
  }

  /** Read-only geometry-cache accounting. Excludes InstancedMesh matrices and JS recipes. */
  function geometryStats() {
    function measure(pool) {
      const seen=new Set(),attributeBytes={},result={count:0,typedArrayBytes:0,attributeBytes};
      const add=(name,attribute)=>{const array=attribute?.isInterleavedBufferAttribute?attribute.data?.array:attribute?.array;if(!array||seen.has(array))return;seen.add(array);const bytes=array.byteLength??0;result.typedArrayBytes+=bytes;attributeBytes[name]=(attributeBytes[name]??0)+bytes;};
      for(const geometry of pool){result.count++;for(const[name,attribute]of Object.entries(geometry.attributes??{}))add(name,attribute);add('index',geometry.index);for(const[name,attrs]of Object.entries(geometry.morphAttributes??{}))for(const a of attrs)add('morph:'+name,a);}
      return result;
    }
    const shared=measure(geometries.values()),merged=measure(mergedGeometries);
    return{sharedGeometries:shared.count,sharedBytes:shared.typedArrayBytes,mergedGeometries:merged.count,mergedBytes:merged.typedArrayBytes,totalBytes:shared.typedArrayBytes+merged.typedArrayBytes,attributeBytes:{shared:shared.attributeBytes,merged:merged.attributeBytes},cacheKeyUtf16BytesApprox:[...geometries.keys()].reduce((n,key)=>n+key.length*2,0),excludes:'Instance matrices, object metadata, JS recipe arrays, driver/GPU overhead; shared and live merged geometry only'};
  }

  function dispose() {
    for(const geo of mergedGeometries)geo.dispose();
    for(const geo of geometries.values()) geo.dispose();
    for(const material of Object.values(materials)) material.dispose();
    geometries.clear();
  }

  return {materials,createBuilding,createLandmark,createLandmarkLOD,createBatch,buildRecipe,buildMergedRecipe,geometryStats,dispose,getGeometry};
}
