import {mountStabilityPanel,readDiagnosticPose} from './cbd-render-stability/ui.js';
import {readCbdRenderStability,cbdRendererDepthOptions,cbdShadowRange,cbdRenderStabilityReport} from './cbd-render-stability/index.js';
import {configureCbdOrbit,CBD_CAMERA_DEPTH} from './cbd-view-policy.js';
import {applyCbdWarmGreyPalette} from './cbd-color-variant/index.js';
import * as THREE from '../../vendor/three.module.js';
import {OrbitControls} from '../../vendor/OrbitControls.js';
import {createDaylightEnvironment} from '../environment.js';
import {buildCbdScene,CBD_VIEWS} from './cbd-scene.js';

const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
if(query.has('clean'))document.body.classList.add('clean');
const CODE_BUILD_ID='beijing-r2-cbd-candidate-15-plaza-single-owner';
const stability=readCbdRenderStability(query),diagnosticPose=readDiagnosticPose(query);
let diagnosticState=()=>({quality:query.get('quality'),view:query.get('view'),...(diagnosticPose||{})});
const diagnosticPanel=mountStabilityPanel(document,stability,{href:location.href,getState:()=>diagnosticState(),navigate:href=>location.assign(href)});
const errors=[],shaderErrors=[],contextEvents=[];let buildIdentity=CODE_BUILD_ID,manifestBuildIdentity=null,palette=query.get('palette')==='baseline'?'baseline':'warm-grey';
window.addEventListener('error',e=>errors.push(e.message));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
const scene=new THREE.Scene();scene.background=new THREE.Color('#d5e2e7');scene.fog=new THREE.Fog('#d5e2e7',2200,4400);
const renderer=(()=>{try{return new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true,...cbdRendererDepthOptions(stability)});}catch(e){diagnosticPanel.unavailable();$('loading').classList.add('done');$('error').hidden=false;$('error').textContent='当前浏览器未能建立 WebGL 图形上下文，场景尚未开始渲染。\n请在支持 WebGL2 的正常浏览器中重新打开；此页面不会改变浏览器安全设置。\n'+e.message;throw e;}})();
renderer.setSize(innerWidth,innerHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.98;
renderer.shadowMap.enabled=stability.shadows!=='off';renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.debug.onShaderError=(gl,p,v,f)=>shaderErrors.push({program:gl.getProgramInfoLog(p),vertex:gl.getShaderInfoLog(v),fragment:gl.getShaderInfoLog(f)});
renderer.domElement.addEventListener('webglcontextlost',()=>contextEvents.push({event:'lost',utc:new Date().toISOString()}));
renderer.domElement.addEventListener('webglcontextrestored',()=>contextEvents.push({event:'restored',utc:new Date().toISOString()}));
const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,CBD_CAMERA_DEPTH.near,CBD_CAMERA_DEPTH.far);
const controls=new OrbitControls(camera,renderer.domElement);configureCbdOrbit(controls);
const hemisphere=new THREE.HemisphereLight('#d4e6f1','#99917e',.65);scene.add(hemisphere);
const sun=new THREE.DirectionalLight('#fff0d5',2.7);sun.castShadow=true;sun.shadow.bias=-.00006;sun.shadow.normalBias=.08;scene.add(sun,sun.target);
const fill=new THREE.DirectionalLight('#c5dce8',.16);fill.position.set(600,500,-900);scene.add(fill);
const environment=createDaylightEnvironment(renderer);scene.environment=environment.texture;scene.environmentIntensity=.32;
let cbd=null,ready=false,paused=query.get('diagPaused')==='1',quality=query.get('quality')==='low'||innerWidth<700?'low':'standard',activeView='block',sunMode='afternoon',last=performance.now(),simRemainder=0,droppedSimulationSeconds=0,lastStatus=0;
const frameTimes=[],movementWindow=[];
diagnosticState=()=>({position:camera.position.toArray(),target:controls.target.toArray(),fov:camera.fov,quality,view:activeView,paused});
$('motion').textContent=paused?'继续车流':'暂停车流';
diagnosticPanel.update(cbdRenderStabilityReport(renderer,camera,stability));

function applyQuality(){renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='low'?1:1.5));const size=quality==='low'?1024:2048;if(sun.shadow.mapSize.x!==size){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(size,size);}cbd?.setQuality(quality);$('quality').textContent='画质 · '+(quality==='low'?'轻量':'标准');}
function updateSun(){const t=controls.target,d=controls.getDistance(),range=cbdShadowRange(d,stability);sun.target.position.set(t.x,0,t.z);sun.position.set(t.x-700,sunMode==='afternoon'?1050:1700,t.z+800);const c=sun.shadow.camera;c.left=c.bottom=-range;c.right=c.top=range;c.near=10;c.far=2900;c.updateProjectionMatrix();}
function setView(id){const v=CBD_VIEWS[id]||CBD_VIEWS.block;activeView=id in CBD_VIEWS?id:'block';const damp=controls.enableDamping;controls.enableDamping=false;controls.update();camera.position.fromArray(v.position);controls.target.fromArray(v.target);camera.fov=v.fov;camera.updateProjectionMatrix();controls.update();controls.enableDamping=damp;updateSun();$('view-label').textContent=v.name;for(const b of $('views').children)b.classList.toggle('active',b.dataset.view===activeView);}
for(const [id,v]of Object.entries(CBD_VIEWS)){const b=document.createElement('button');b.textContent=v.name;b.dataset.view=id;b.onclick=()=>setView(id);$('views').append(b);}
$('quality').onclick=()=>{quality=quality==='standard'?'low':'standard';applyQuality();};
$('motion').onclick=()=>{paused=!paused;simRemainder=0;$('motion').textContent=paused?'继续车流':'暂停车流';};
$('sun').onclick=()=>{sunMode=sunMode==='afternoon'?'high':'afternoon';sun.intensity=sunMode==='afternoon'?2.7:2.15;hemisphere.intensity=sunMode==='afternoon'?.65:.85;$('sun').textContent='光照 · '+(sunMode==='afternoon'?'午后':'高日');updateSun();};
const zoom=f=>{camera.position.sub(controls.target).multiplyScalar(f).add(controls.target);controls.update();updateSun();};
$('zoom-in').onclick=()=>zoom(.8);$('zoom-out').onclick=()=>zoom(1.25);
$('hide').onclick=()=>{const hide=document.body.classList.toggle('minimal');$('hide').textContent=hide?'显示面板':'收起面板';};
$('palette').onclick=()=>{if(!cbd)return;if(palette==='warm-grey'){cbd.colorVariant.restore();palette='baseline';}else{applyCbdWarmGreyPalette(cbd);palette='warm-grey';}$('palette').textContent='配色 · '+(palette==='warm-grey'?'暖灰蓝灰':'原版');};
$('performance').onclick=()=>$('stats').hidden=!$('stats').hidden;
function stats(){const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),sorted=[...frameTimes].sort((a,b)=>a-b);return{utc:new Date().toISOString(),ready,build:buildIdentity,manifestBuild:manifestBuildIdentity,buildIdentityMatchesManifest:manifestBuildIdentity===CODE_BUILD_ID,palette,quality,renderStability:cbdRenderStabilityReport(renderer,camera,stability),viewport:[innerWidth,innerHeight],pixelRatio:renderer.getPixelRatio(),camera:camera.position.toArray(),target:controls.target.toArray(),fov:camera.fov,view:activeView,paused,simulationSeconds:cbd?.traffic.time||0,droppedSimulationSeconds,traffic:cbd?.traffic.stats(),streetLifeDetail:cbd?.streetLifeDetail?.stats(),frameSamples:sorted.length,frameMedianMs:sorted[Math.floor(sorted.length*.5)]||0,frameP95Ms:sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))]||0,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,programs:renderer.info.programs?.length,heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),lighting:{sunMode,sun:sun.intensity,hemisphere:hemisphere.intensity,environment:scene.environmentIntensity,shadowEnabled:renderer.shadowMap.enabled,shadowMap:sun.shadow.mapSize.toArray()},scene:cbd?.metadata,architectureBuffers:cbd?.kit.geometryStats(),errors:[...errors],shaderErrors:[...shaderErrors],contextEvents:[...contextEvents],scope:'Independent CBD candidate. No visual acceptance inferred from these statistics.'};}
function download(name,blob){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('save-image').onclick=()=>{if(!ready||errors.length||shaderErrors.length){$('status').textContent='场景未就绪或存在错误，请保存运行记录';return;}renderer.domElement.toBlob(b=>b&&download('beijing-cbd-'+quality+'.png',b),'image/png');};
$('save-record').onclick=async()=>{const build=await fetch('./cbd-build.json').then(r=>r.json()).catch(()=>({status:'build identity missing'}));download('beijing-cbd-review.json',new Blob([JSON.stringify({build,stats:stats(),vehicles:cbd?.traffic.records(),pedestrians:cbd?.traffic.pedestrianRecords(),recentMovement:movementWindow},null,2)],{type:'application/json'}));};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);});
document.addEventListener('visibilitychange',()=>{last=performance.now();simRemainder=0;});
applyQuality();setView(query.get('view')||'mall');
if(diagnosticPose){const damping=controls.enableDamping;controls.enableDamping=false;camera.position.fromArray(diagnosticPose.position);controls.target.fromArray(diagnosticPose.target);camera.fov=diagnosticPose.fov;camera.updateProjectionMatrix();controls.update();controls.enableDamping=damping;updateSun();}
async function init(){try{const r=await fetch('./data/cbd-scene.json');if(!r.ok)throw new Error('CBD 数据 HTTP '+r.status);const data=await r.json();cbd=await buildCbdScene(data,label=>$('loading-label').textContent=label,{palette,treeLodHysteresis:stability.treeLodHysteresis,roofSurfaceOwnership:stability.roofSurfaceOwnership,roadSurfaceOwnership:stability.roadSurfaceOwnership,plazaSurfaceOwnership:stability.plazaSurfaceOwnership});manifestBuildIdentity=await fetch('./cbd-build.json',{cache:'no-store'}).then(r=>r.json()).then(b=>b.buildID).catch(()=>null);if(manifestBuildIdentity&&manifestBuildIdentity!==CODE_BUILD_ID)errors.push('页面版本与发布记录不一致，请正常刷新页面。');$('palette').textContent='配色 · '+(palette==='warm-grey'?'暖灰蓝灰':'原版');scene.add(cbd.root);applyQuality();ready=true;last=performance.now();$('loading').classList.add('done');console.log('CBD_READY',stats());}catch(e){errors.push(String(e));$('loading').classList.add('done');$('error').hidden=false;$('error').textContent='CBD 尚未完成加载：\n'+e.message;console.error(e);}}
function animate(now){requestAnimationFrame(animate);const raw=Math.max(0,(now-last)/1000);last=now;if(!ready)return;
 controls.update();controls.target.x=THREE.MathUtils.clamp(controls.target.x,4200,5800);controls.target.z=THREE.MathUtils.clamp(controls.target.z,-1000,350);controls.target.y=THREE.MathUtils.clamp(controls.target.y,0,550);updateSun();
 if(!paused&&!document.hidden){droppedSimulationSeconds+=Math.max(0,raw-2);simRemainder+=Math.min(2,raw);let steps=0;while(simRemainder>=1/30&&steps++<60){cbd.traffic.update(1/30,controls.target,controls.getDistance(),camera);simRemainder-=1/30;}}
 cbd.streetLifeDetail?.sync(controls.getDistance());
 cbd.terrain.update(cbd.traffic.time);cbd.signals.update(cbd.traffic.time,controls.target,controls.getDistance());cbd.streetscape.update(camera,controls.getDistance());renderer.render(scene,camera);
 frameTimes.push(raw*1000);if(frameTimes.length>120)frameTimes.shift();
 if(now-lastStatus>1000){lastStatus=now;const s=stats();$('status').textContent=`${paused?'车流暂停':'实时车流'} · 模拟 ${s.simulationSeconds.toFixed(1)} 秒 · ${quality==='low'?'轻量':'标准'} · 投影${renderer.shadowMap.enabled?'开启':'关闭'} · 错误 ${errors.length+shaderErrors.length}`;$('stats').textContent=`${s.renderer}\n${s.viewport.join('×')} · ${s.drawCalls} calls · ${Math.round(s.triangles/1000)}k tris\n中位 ${s.frameMedianMs.toFixed(1)}ms · P95 ${s.frameP95Ms.toFixed(1)}ms\n模拟 ${s.simulationSeconds.toFixed(2)}s · ${s.scene.mappedBuildingCount} 栋足迹\n${s.scene.treeCount} 树位，其中 ${s.scene.heroTreeCount} 近树精修`;
  movementWindow.push({utc:s.utc,time:s.simulationSeconds,view:activeView,visibleVehicles:cbd.traffic.records().filter(c=>c.visible)});if(movementWindow.length>30)movementWindow.shift();
 }
}
requestAnimationFrame(animate);init();
