/**North-facing museum at rotationPI; bronze gallery is east(local−X). */
import {Recipe} from './geometry.js';
import {stairs} from './landmark-utils.js';
export const CAPITAL_MUSEUM_MATERIALS={capitalBronzePatina:{color:'#7f968a',roughness:.77,metalness:.18},capitalRoofSilver:{color:'#bcc8cc',roughness:.62,metalness:.16},capitalBronzeInset:{color:'#536d62',roughness:.84,metalness:.12}};
export function capitalMuseumRefined(o={}){
 const r=new Recipe('首都博物馆 · Capital Museum',{approx:true,orientation:'local+Z front; site rotationPI faces north; bronze gallery local−X is real east',bronzeGeometry:'elliptical cylinder inclined18.3degrees toward front, embedded behind stone facade so only emerging upper oval is exposed',bronzeDimensionsAccuracy:'42m approximate maximum; inclination/diameters inferred from actual north-facade photograph, not measured',reference:'https://www.archdaily.com/886782/beijing-capital-museum-arep'});
 r.box('stoneLight',0,1.5,0,151,3,108,'museum plaza base');r.box('stone',19,17,0,102,31,89,'stone rectangular exhibition volume');r.box('glassDark',0,18,40,128,32,5,'transparent main foyer');
 // The lower part of the tilted cylinder is behind the facade. The curved
 // intersection is exposed naturally, without a floating arbitrary cutout.
 r.box('stone',-43,15,43.5,42,24,2,'eastern stone wall pierced by projecting bronze gallery');
 const tilt=.32,cy=21.5,cz=31,h=31;
 r.add({type:'cylinder',segments:o.lod==='silhouette'?32:64,topRadius:1},'capitalBronzePatina',[-39,cy,cz],[22,h,18],[tilt,0,0],'inclined partially embedded bronze elliptical gallery');
 r.add({type:'cylinder',segments:o.lod==='silhouette'?32:64,topRadius:1},'capitalBronzeInset',[-39,cy+h/2*Math.cos(tilt),cz+h/2*Math.sin(tilt)],[21.5,.3,17.5],[tilt,0,0],'inclined recessed bronze gallery top');
 r.box('capitalRoofSilver',0,34.3,-1,157,2.6,111,'oversized floating silver roof');for(const z of[-57.5,55.5])r.box('capitalBronzeInset',0,35.8,z,159,.5,.65,'thin dark roof perimeter edge');for(const x of[-79.5,79.5])r.box('capitalBronzeInset',x,35.8,-1,.65,.5,113,'thin dark roof perimeter edge');
 for(const x of [-66,-23,23,66])r.box('capitalRoofSilver',x,17,49,1.2,33,1.2,'foyer roof support');
 if(o.lod!=='silhouette'){
  for(let i=0;i<22;i++)r.box('stoneLight',66-i*4.1,17,45.2,.6,30,.16,'stone facade vertical joint');
  for(let j=0;j<7;j++)r.box('stoneDark',21,5+j*4.1,45.35,96,.14,.12,'stone facade horizontal joint');
  for(let j=0;j<6;j++)r.box('stoneDark',-43,5+j*4,44.55,42,.12,.10,'eastern stone facade horizontal joint');
  // Thin patinated engraved bands use original procedural linework, not copied sculpture.
  for(let j=0;j<3;j++){const yy=27+j*1.1;r.box('capitalBronzeInset',-39,yy,49.6+j*.35,35,.18,.1,'approximate bronze engraving band');}
 }
 stairs(r,124,57,3,15,6);return r;
}
