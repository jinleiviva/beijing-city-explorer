/** Visible, user-operated review controls. No browser automation or hidden injection. */
import {PILOT_CAMERA,PILOT_SHOP_IDS} from './heritage-pilot.js';
export const SIDE_CAMERA={position:[-809.930846609,30,-3207.021699428],target:[-815.892607784,2.2,-3241.145846358]};
export function installPilotReview(city){
 const box=document.createElement('aside');box.id='r2-sample-tools';box.setAttribute('aria-label','第二轮烟袋样板验收');
 const title=document.createElement('strong');title.textContent='第二轮 · 烟袋三店试制';box.append(title);
 const note=document.createElement('small');note.textContent='云端实图验收受阻；当前为待验收增量，不计街道完成数。';box.append(note);
 const row=document.createElement('div');box.append(row);
 const button=(label,action)=>{const b=document.createElement('button');b.textContent=label;b.onclick=action;row.append(b);return b;};
 button('样板正面',()=>{city.pause();city.freezeSimulation(false);city.setCamera(PILOT_CAMERA.position,PILOT_CAMERA.target);});
 button('侧向检查',()=>{city.pause();city.freezeSimulation(false);city.setCamera(SIDE_CAMERA.position,SIDE_CAMERA.target);});
 button('冻结画面',()=>{city.pause();city.freezeSimulation(true);city.setCaptureClock(true);});
 button('继续人车',()=>{city.freezeSimulation(false);city.setCaptureClock(false);});
 const status=document.createElement('output');status.id='r2-review-status';status.textContent='等待场景完成加载';box.append(status);
 const pilotReady=()=>window.detailStreamer.entries.some(e=>e.name==='Yandai photo-referenced street'&&e.detail&&e.detail.visible);
 const download=(name,blob)=>{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.download=name;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 button('保存场景图',()=>{const s=city.stats();if(!s.ready||!pilotReady()||s.errors.length||s.shaderErrors.length||s.streaming.failures.length){status.textContent='样板细节尚未就绪或有运行错误，请先保存记录';return;}city.renderer.domElement.toBlob(b=>b&&download(`beijing-round2-${s.quality}.png`,b),'image/png');});
 button('保存验收记录',async()=>{const build=await fetch('./round2-build.json').then(r=>r.json()).catch(()=>({status:'missing build identity'}));const data={capturedAt:new Date().toISOString(),build,scope:'three inferred shopfronts, one same-position hero tree',pilotDetailVisible:pilotReady(),shopIds:PILOT_SHOP_IDS,stats:city.stats(),simulationTime:city.traffic?.time,loadedDetailEntries:window.detailStreamer.entries.filter(e=>e.detail).map(e=>({name:e.name,distance:e.distance,wanted:e.wanted})),acceptance:'A screenshot and technical stats do not automatically establish visual quality.'};download('beijing-round2-review.json',new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));});
 document.body.append(box);
 const refresh=()=>{if(!city.ready){setTimeout(refresh,500);return;}const s=city.stats();status.textContent=`${pilotReady()?'样板已加载':'等待样板细节'} · ${s.quality} · ${s.viewport.join('×')} · ${s.drawCalls} calls · ${Math.round(s.triangles/1000)}k tris · 错误 ${s.errors.length+s.shaderErrors.length+s.streaming.failures.length}`;setTimeout(refresh,2000);};refresh();
 return box;
}
