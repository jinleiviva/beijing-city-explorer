import * as THREE from '../../vendor/three.module.js';
import {OrbitControls} from '../../vendor/OrbitControls.js';
import {createArchitectureKit,LANDMARK_IDS,BUILDING_FAMILIES} from './index.js';
const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
if(query.has('clean'))document.body.classList.add('clean');
const ids=[...LANDMARK_IDS,...BUILDING_FAMILIES],canvas=$('scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e8db');
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,40000);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;
scene.add(new THREE.HemisphereLight('#fff3dc','#879182',1.15));
const sun=new THREE.DirectionalLight('#ffe8c5',2.5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.0001;scene.add(sun);scene.add(sun.target);
const fill=new THREE.DirectionalLight('#d0e7f5',.6);fill.position.set(900,500,-700);scene.add(fill);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({color:'#c7c4ad',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.2;ground.receiveShadow=true;scene.add(ground);
const kit=createArchitectureKit(THREE),normalMaterial=new THREE.MeshNormalMaterial();let current,span=100,center=new THREE.Vector3(),normalMode=false,manifest={};
function setView(front=false){const dir=front?new THREE.Vector3(0,.12,1):new THREE.Vector3(.95,.62,1.35);camera.position.copy(center).addScaledVector(dir.normalize(),span*(front?2.35:2.35));controls.target.copy(center);controls.update();}
function clear(){if(!current)return;scene.remove(current);current.traverse(o=>{if(o.isInstancedMesh)o.dispose();});}
function show(id){
  if(!ids.includes(id))id='china_zun';clear();const level=$('detail').value,options=level==='silhouette'?{lod:'silhouette',detail:-1}:{detail:Number(level)};
  if(query.has('variant'))options.variant=Number(query.get('variant'));
  current=LANDMARK_IDS.includes(id)?kit.createLandmark(id,options):kit.createBuilding(id,options);scene.add(current);$('building').value=id;
  const box=new THREE.Box3().setFromObject(current),size=box.getSize(new THREE.Vector3());box.getCenter(center);span=Math.max(size.x,size.y,size.z);
  ground.scale.set(span*3.4,span*3.4,1);ground.position.set(center.x,-.2,center.z);
  sun.position.copy(center).add(new THREE.Vector3(-span*1.3,span*2,span*1.4));sun.target.position.copy(center);
  const sh=sun.shadow.camera;sh.left=-span;sh.right=span;sh.top=span;sh.bottom=-span;sh.near=.1;sh.far=span*8;sh.updateProjectionMatrix();sun.shadow.normalBias=span*.0004;
  camera.near=Math.max(.05,span*.0002);camera.far=Math.max(1000,span*30);camera.updateProjectionMatrix();controls.minDistance=span*.15;controls.maxDistance=span*12;
  current.traverse(o=>{if(o.isMesh){o.userData.originalMaterial=o.material;if(normalMode)o.material=normalMaterial;}});
  const m=manifest[id],s=current.userData.architectureStats;$('name').textContent=m?.name??current.name;$('features').textContent=m?.recognizableFeatures??'';
  $('stats').textContent=`${Math.round(size.x)} × ${Math.round(size.z)} × ${Math.round(size.y)} m · ${s.parts.toLocaleString()} 部件 / ${s.drawCalls} draw calls`;
  $('reference').href=m?.photograph?.page??'#';$('reference').hidden=!m?.photograph?.page;
  setView(query.has('front'));history.replaceState(null,'',`${location.pathname}?id=${encodeURIComponent(id)}&detail=${level}${query.has('clean')?'&clean':''}`);
  window.ARCH_REVIEW.activeId=id;window.ARCH_REVIEW.stats=s;window.ARCH_REVIEW.ready=true;
}
window.ARCH_REVIEW={show,camera,scene,renderer,kit,ready:false,capture:()=>{renderer.render(scene,camera);return canvas.toDataURL('image/png');}};
for(const id of ids){const option=document.createElement('option');option.value=id;option.textContent=id;$('building').append(option);}
$('detail').value=query.get('detail')??'1';$('building').onchange=()=>show($('building').value);$('detail').onchange=()=>show($('building').value);
$('previous').onclick=()=>show(ids[(ids.indexOf($('building').value)+ids.length-1)%ids.length]);$('next').onclick=()=>show(ids[(ids.indexOf($('building').value)+1)%ids.length]);
$('front').onclick=()=>setView(true);$('isometric').onclick=()=>setView(false);$('normals').onclick=()=>{normalMode=!normalMode;current.traverse(o=>{if(o.isMesh)o.material=normalMode?normalMaterial:o.userData.originalMaterial;});};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();
try{const r=await fetch('../../../assets/architecture/landmark-manifest.json');manifest=Object.fromEntries((await r.json()).landmarks.map(x=>[x.id,x]));for(const option of $('building').options)option.textContent=manifest[option.value]?.name??option.value;}catch{}
try{show(query.get('id')??'china_zun');}catch(e){$('error').style.display='block';$('error').textContent=e.stack;throw e;}
