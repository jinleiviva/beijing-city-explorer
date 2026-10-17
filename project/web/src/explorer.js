/** Small searchable index for the actual 45 landmark / 60 named street records. */
export function createExplorer({landmarks,streets,onSelect}){
 const open=document.getElementById('explore-places'),panel=document.getElementById('explorer'),search=document.getElementById('place-search'),list=document.getElementById('place-results');
 const items=[...landmarks.map(f=>({id:f.id,name:f.properties.name,type:'landmark',label:'地标建筑',coordinates:f.geometry.coordinates,feature:f})),...streets.map(s=>({id:s.id,name:s.name,type:'street',label:'主要街道',coordinates:s.coordinates,street:s}))];
 let tab='all';
 function render(){const term=search.value.trim().toLowerCase();list.replaceChildren();for(const item of items.filter(x=>(tab==='all'||x.type===tab)&&(!term||(x.name+' '+x.id).toLowerCase().includes(term)))){const button=document.createElement('button');const name=document.createElement('strong'),label=document.createElement('span');name.textContent=item.name;label.textContent=item.label;button.append(name,label);button.onclick=()=>{panel.hidden=true;onSelect(item);};list.append(button);}document.getElementById('place-count').textContent=`${list.children.length} 个可探索地点`;}
 open.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden){render();search.focus();}};document.getElementById('close-explorer').onclick=()=>panel.hidden=true;search.oninput=render;
 for(const button of document.querySelectorAll('[data-place-tab]'))button.onclick=()=>{tab=button.dataset.placeTab;document.querySelectorAll('[data-place-tab]').forEach(b=>b.classList.toggle('active',b===button));render();};
 document.addEventListener('keydown',e=>{if(e.key==='Escape')panel.hidden=true;});render();return{items,selectById:id=>{const item=items.find(i=>i.id===id);if(item){panel.hidden=true;onSelect(item);return true;}return false;},open:()=>{panel.hidden=false;render();}};
}
