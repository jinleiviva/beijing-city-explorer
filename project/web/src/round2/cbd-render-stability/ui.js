import {readCbdRenderStability} from './index.js';
export function readDiagnosticPose(search=''){
 const q=search instanceof URLSearchParams?search:new URLSearchParams(search),raw=q.get('diagPose');if(!raw)return null;
 const a=raw.split(',').map(Number);if(a.length!==7||a.some(v=>!Number.isFinite(v)))return null;
 const [x,y,z,tx,ty,tz,fov]=a,d=Math.hypot(x-tx,y-ty,z-tz);
 if(a.slice(0,3).some(v=>Math.abs(v)>20000)||tx<4200||tx>5800||ty<0||ty>550||tz< -1000||tz>350||fov<15||fov>75||d<11.99||d>3600.01)return null;
 return{position:a.slice(0,3),target:a.slice(3,6),fov,paused:q.get('diagPaused')==='1'};
}
export function diagnosticHref(href,selection,state={},reset=false){
 const u=new URL(href),q=u.searchParams,config=readCbdRenderStability(new URLSearchParams(selection));
 for(const key of['depth','shadows','treeLod','roofs','roads','plaza'])q.delete(key);
 if(!reset){if(config.depth!=='standard')q.set('depth',config.depth);if(config.shadows!=='dynamic')q.set('shadows',config.shadows);if(config.treeLodHysteresis===0)q.set('treeLod','baseline');if(!config.roofSurfaceOwnership)q.set('roofs','baseline');if(!config.roadSurfaceOwnership)q.set('roads','baseline');if(!config.plazaSurfaceOwnership)q.set('plaza','baseline');}
 q.set('diagnostics','1');
 if(state.quality==='low'||state.quality==='standard')q.set('quality',state.quality);
 if(state.view)q.set('view',String(state.view));
 if(state.position&&state.target){const a=[...state.position,...state.target,state.fov].map(v=>Number(Number(v).toFixed(4))),probe=new URLSearchParams({diagPose:a.join(',')});if(readDiagnosticPose(probe))q.set('diagPose',a.join(','));}
 q.set('diagPaused',state.paused?'1':'0');return u.href;
}
const DEPTH={standard:'标准',logarithmic:'对数（实验）',reversed:'反向（实验）'},SHADOW={dynamic:'动态范围',off:'关闭',fixed:'固定范围（实验）'};
export function mountStabilityPanel(doc,config,{href,getState,navigate}){
 const el=id=>doc.getElementById(id),panel=el('diagnostics'),depth=el('diagnostic-depth'),shadows=el('diagnostic-shadows'),trees=el('diagnostic-trees'),roofs=el('diagnostic-roofs'),roads=el('diagnostic-roads'),plaza=el('diagnostic-plaza'),status=el('diagnostic-status');
 depth.value=config.depth;shadows.value=config.shadows;trees.value=config.treeLodHysteresis?'hysteresis':'baseline';roofs.value=config.roofSurfaceOwnership?'single-owner':'baseline';roads.value=config.roadSurfaceOwnership?'single-owner':'baseline';plaza.value=config.plazaSurfaceOwnership?'single-owner':'baseline';
 panel.open=new URL(href).searchParams.get('diagnostics')==='1';
 const requested=`请求：${DEPTH[config.depth]}深度 · 阴影${SHADOW[config.shadows]} · 屋顶${config.roofSurfaceOwnership?'单面归属':'原叠面'} · 局部路口${config.roadSurfaceOwnership?'单面归属':'原道路'} · 商城铺地${config.plazaSurfaceOwnership?'单面归属':'原叠面'} · 树LOD${config.treeLodHysteresis?'迟滞':'原阈值'}`;
 status.textContent=requested+'。图形上下文尚未建立。';
 el('diagnostic-apply').addEventListener('click',()=>navigate(diagnosticHref(href,{depth:depth.value,shadows:shadows.value,treeLod:trees.value,roofs:roofs.value,roads:roads.value,plaza:plaza.value},getState())));
 el('diagnostic-reset').addEventListener('click',()=>navigate(diagnosticHref(href,{},getState(),true)));
 return{update(report){status.textContent=requested+`。实际：${DEPTH[report.activeDepth]}深度，阴影${report.shadowEnabled?'开':'关'}，${report.depthBits??'未知'}位深度。`+(report.requestedDepthSupported?'':'此设备未启用所选深度，已回退。')+' 闪烁尚未完成动态验收。';},unavailable(){status.textContent=requested+'。此浏览器未建立WebGL，不能进行缩放画面对照。';}};
}
