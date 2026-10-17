import * as THREE from '../vendor/three.module.js';
/** One ray test on a stationary click/tap; ordinary orbit drags never select. */
export function enableLandmarkPicking({canvas,camera,landmarks,contextGroups,onSelect}){
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,multiTouch=false;const activePointers=new Set();const stats={clickTests:0,selections:0,lastId:null};
 canvas.addEventListener('pointerdown',e=>{activePointers.add(e.pointerId);if(activePointers.size>1){multiTouch=true;down=null;}else if(e.button===0&&!multiTouch)down={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),moved:false};});
 canvas.addEventListener('pointermove',e=>{if(down?.id===e.pointerId&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)down.moved=true;});
 canvas.addEventListener('pointercancel',e=>{activePointers.delete(e.pointerId);down=null;if(!activePointers.size)multiTouch=false;});
 canvas.addEventListener('pointerup',e=>{const start=down;down=null;activePointers.delete(e.pointerId);const wasMulti=multiTouch;if(!activePointers.size)multiTouch=false;if(wasMulti||!start||start.moved||e.pointerId!==start.id||e.button!==0||performance.now()-start.t>750||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6||!landmarks.visible)return;
  const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);stats.clickTests++;
  const candidates=[];landmarks.traverseVisible(o=>{if(o.isMesh)candidates.push(o);});const hit=raycaster.intersectObjects(candidates,false)[0];if(!hit)return;
  // Opaque context in front blocks selection rather than picking through a tower.
  const blockers=[];for(const g of contextGroups())g?.traverseVisible(o=>{if(o.isMesh)blockers.push(o);});raycaster.far=Math.max(0,hit.distance-.1);const blocked=raycaster.intersectObjects(blockers,false).length>0;raycaster.far=Infinity;if(blocked)return;
  let node=hit.object;while(node&&!node.userData.geographicFeature)node=node.parent;const feature=node?.userData.geographicFeature;if(feature){stats.selections++;stats.lastId=feature.id;onSelect(feature.id);}
 });return stats;
}
