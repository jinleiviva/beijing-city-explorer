import {Recipe,latheGeometry} from './geometry.js';
import {polygonPrism,footprintEdges,edgePanel} from './site-massing.js';
import {SCIENCE_OUTLINE,SCIENCE_MAIN_OUTLINE,SCIENCE_SPHERE} from './science-museum-layout.js';
function clip(points,axis,bound,greater) {
 const inside=p=>greater?p[axis]>=bound-1e-8:p[axis]<=bound+1e-8,out=[];
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],aa=inside(a),bb=inside(b);if(aa)out.push(a);if(aa!==bb){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,k)=>v+(b[k]-v)*t));}}
 return out;
}
export function scienceMuseumRefined(o={}) {
 const far=o.lod==='silhouette',r=new Recipe('中国科学技术馆 · China Science and Technology Museum',{
  approximate:true,source:'https://www.openstreetmap.org/way/161298694',placementRotation:Math.PI/2,
  geometryScope:'Actual mapped outer footprint split into nearly-square exhibition body, west connector and southwest rounded cinema',
  architecturalSource:'https://www.atd.com.cn/UploadFiles/Soft/2010/9/201009021630436489.pdf',
  facadeReference:'assets/architecture/research/china_science_museum.jpg',
  gatewayPolicy:'Deep monumental east AND west portals; operational west-entry/east-exit is not a unique architectural front',
  sphere:{...SCIENCE_SPHERE,modelHeightApprox:34,heightSource:'Unverified provisional stylized profile; NOT derived from internal30m screen diameter'},
 });
 const add=(pts,y0,y1,mat,label)=>r.add(polygonPrism(pts,y0,y1),mat,[0,0,0],[1,1,1],[0,0,0],label);
 add(SCIENCE_OUTLINE,0,2.4,'stoneLight','science museum actual outer footprint plinth');
 const left=-36,right=50,main=SCIENCE_MAIN_OUTLINE;
 add(clip(main,0,left,false),2.4,42,'silverFacade','science museum southern interlocking solid block');
 add(clip(main,0,right,true),2.4,39.5,'silverFacade','science museum northern offset solid block');
 let center=clip(clip(main,0,left,true),0,right,false);
 add(center,29,42,'silverFacade','science museum upper bridge creates bilateral gateway voids');
 const inner=clip(clip(center,1,-57,true),1,76,false);
 add(inner,2.4,29,'silverFacade','science museum recessed central gallery core');
 add(clip(main,0,right,false),41.98,42.08,'concrete','science museum main thin mapped roof coping');
 add(clip(main,0,right,true),39.48,39.58,'concrete','science museum lower north-block roof coping');
 for(const side of[-1,1]) {
  const plane=side>0?76.22:-57.22,zOuter=side>0?90:-71.8,n=far?9:19,cx=(left+right)/2,w=right-left;
  r.box('scienceGlass',cx,15.6,plane,w-1,26.1,.18,'science museum recessed east-west gateway glazing');
  r.box('metalDark',cx,2.53,(plane+zOuter)/2,w,.18,Math.abs(zOuter-plane),'science museum gateway shaded threshold');
  for(let i=0;i<n;i++)r.box('glassMullion',left+1.3+i*(w-2.6)/(n-1),15.7,plane+side*.16,.42,26.2,.48,'science museum vertical portal glazing fin');
  r.box('stoneDark',cx,34,side>0?90.12:-71.72,w*.64,.55,.08,'science museum unlettered inscription baseline');
 }
 // Actual west-side connecting arc belongs to this museum, unlike north-side MCC.
 r.box('scienceGlass',-53,12.2,-80,25,19.6,20,'science museum west glazed cinema connector');
 const [sx,sz]=SCIENCE_SPHERE.center,rad=SCIENCE_SPHERE.mappedPlanDiameter/2;
 r.add(latheGeometry([[rad*.64,2.4],[rad*.88,7],[rad,15.5],[rad*.95,23],[rad*.73,29.5],[rad*.39,33],[.1,34]],far?20:40),'metal',[sx,0,sz],[1,1,1],[0,0,0],'southwest cinema rounded shell approximate external height');
 if(!far) {
  const edges=footprintEdges(main);
  for(const edge of edges.filter(e=>e.length>24)) {
   const n=Math.max(1,Math.floor(edge.length/23));
   for(let i=1;i<n;i++)edgePanel(r,edge,'stoneDark',i*edge.length/n,23,.09,35,.04,'science museum large white-panel joint',.04);
  }
  for(const x of[-57,-23,11,45])r.box('stoneDark',x,28.8,90.07,31,.07,.05,'science museum east facade panel seam');
  for(const y of[14.2,25.7])r.box('scienceGlass',88.5,y,35,.09,4.7,33,'science museum recessed northern green glass strip');
  for(const z of[-54,-11,32])r.box('scienceGlass',-73,ySafe(z),z,.12,18,10,'science museum southern exposed green block face');
 }
 return r;
}
function ySafe(z){return z<-30?13.5:24;}
