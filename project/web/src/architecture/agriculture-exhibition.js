// Hall1 measured footprint layout; approximate photo-researched exterior.
// All vertical proportions remain photo-based approximate reconstructions.
import {Recipe,HIP_ROOF} from './geometry.js';
import {stairs} from './landmark-utils.js';

export function agricultureExhibitionRefined(o={}) {
 const far=o.lod==='silhouette',r=new Recipe('全国农业展览馆1号馆 · National Agricultural Exhibition Hall1',{
  approximate:true,scope:'Hall1 only; preserve detached Halls2/3 and other mapped campus buildings',
  replacesOsmIds:['osm-way-164587493'],anchorWGS84:[116.458767725371,39.939968742059],placementRotation:-Math.PI/2,
  mappedWidth:86.19,mappedDepth:69.98,heightAccuracy:'Photo-proportioned central roof34m approximate; published8m is exhibition interior, not overall height',
  referencePhoto:'assets/architecture/research/agriculture_exhibition.jpg',
 });
 const w=86.19,d=69.98,front=d/2;
 r.box('stoneLight',0,1.05,0,w,2.1,d,'Hall1 mapped footprint terrace');
 r.box('stoneLight',0,8.15,-4.2,w-2,12.1,d-8.4,'Hall1 rear exhibition volume');
 r.box('concrete',0,14.27,-9.3,w-3,.14,d-19,'approximate rear exhibition roof deck');
 r.box('glassDark',0,8.8,front-7.4,w-7,13.4,.24,'Hall1 recessed west entrance glazing');
 const cols=far?12:18;
 for(let i=0;i<cols;i++) {
  const x=-w*.455+i*w*.91/(cols-1);
  r.box('stoneLight',x,8.75,front-2.5,.90,13.3,1.04,'Hall1 slender rectangular portico pier');
  if(!far){r.box('stoneLight',x,2.35,front-2.5,1.22,.5,1.35,'Hall1 column base');r.box('roofGoldLight',x,15.25,front-2.5,1.12,.44,1.25,'Hall1 restrained painted capital');}
 }
 r.box('vermilionDark',0,15.7,front-4,w-.8,.48,8,'Hall1 dark under-eave fascia');
 r.add(HIP_ROOF,'roofGreen',[0,15.9,front-10.1],[w,2.6,20.2],[0,0,0],'Hall1 continuous green glazed front eave');
 r.box('roofGoldLight',0,16.15,front-.05,w,.28,.13,'Hall1 yellow glazed eave trim');
 r.box('stoneLight',0,21.15,front-11,58,8.5,13.2,'Hall1 raised pale inscription attic');
 r.box('stone',0,22,front-4.28,54,2.15,.14,'Hall1 unlettered inscription panel');
 r.box('stoneLight',0,25.55,front-10.8,59,.45,13.7,'Hall1 attic pale parapet coping');
 for(const side of[-1,1]) {
  const x=side*26.1;
  r.box('stoneLight',x,26.7,front-11,9.2,3.5,9,'Hall1 side rooftop pavilion body');
  r.box('glassDark',x,26.5,front-6.42,6.3,2.4,.12,'Hall1 side pavilion three-window field');
  r.add(HIP_ROOF,'roofGreen',[x,28.1,front-11],[12.8,2.5,12.6],[0,0,0],'Hall1 separate side pavilion green roof');
  r.box('roofGoldLight',x,28.32,front-4.7,12.8,.16,.12,'Hall1 side pavilion yellow eave trim');
 }
 r.box('stoneLight',0,27,front-11,15,5,13,'Hall1 tall central rooftop pavilion');
 r.box('glassDark',0,27.1,front-4.42,10.6,3.4,.12,'Hall1 central pavilion dark glazing');
 for(const x of[-5.3,0,5.3])r.box('stoneLight',x,27.1,front-4.30,.45,3.7,.30,'Hall1 central pavilion window mullion');
 for(const [y,rw,rd,rise]of[[27.8,22,19,2.1],[30.1,17.8,16,1.8],[32.1,13.5,12.7,1.9]]) {
  r.add(HIP_ROOF,'roofGreen',[0,y,front-11],[rw,rise,rd],[0,0,0],'Hall1 central three-tier green pavilion roof');
  if(!far)r.box('roofGoldLight',0,y+.2,front-11+rd/2,rw,.16,.13,'Hall1 central pavilion gold eave trim');
 }
 if(!far)for(let i=1;i<cols-1;i++)r.box('metalDark',-w*.455+i*w*.91/(cols-1),8.8,front-7.20,.12,13.4,.14,'Hall1 recessed glazing vertical mullion');
 stairs(r,76,front+.05,2.1,7,far?3:6);
 return r;
}

