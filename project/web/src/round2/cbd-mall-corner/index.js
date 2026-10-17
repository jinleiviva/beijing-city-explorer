/** National Trade North Mall NW corner, original photo-informed geometry.
 * Source footprint/upper mass remain the existing OSM660651177 recipe.
 * The July 2026 NW street photograph supports recessed glazed lower floor,
 * slender columns and deep underside of the upper stone mass, not the former
 * speculative freestanding entrance canopy. Exact bay and door counts inferred.
 */
import {Recipe} from '../../architecture/geometry.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {footprintEdges,mappedBody,edgePanel} from '../../architecture/site-massing.js';
import {project} from '../../geo.js';
export const MALL_CORNER_SOURCE='https://commons.wikimedia.org/wiki/File:Intersection_of_Guanghua_Road_and_Jintong_East_Road_20260719151718.jpg';
export const MALL_CORNER_GROUND=-.02;
const GLASS_PLANE={type:'mesh',vertices:[-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],indices:[0,1,2,0,2,3],flatShading:true};
const LEAF={type:'mesh',vertices:[0,0,-.5,-.5,0,0,0,0,.5,.5,0,0,0,.2,0,0,-.1,0],indices:[4,0,1,4,1,2,4,2,3,4,3,0,5,1,0,5,2,1,5,3,2,5,0,3],flatShading:true};
const box=(r,m,x,y,z,w,h,d,label,shadow=false)=>{r.box(m,x,y,z,w,h,d,'Mall corner '+label);r.parts.at(-1).castShadow=shadow;};
const panel=(r,e,m,u,y,w,h,d,label,offset=.1,shadow=false)=>{edgePanel(r,e,m,u,y,w,h,d,'Mall corner '+label,offset);r.parts.at(-1).castShadow=shadow;};
/** Remove only old uniform first-floor fill/mullions and blocky roof leaves.
 * Never mutate the original recipe or the shared mapped footprint. */
export function prepareMallCornerHost(source){const r=new Recipe(source.name,{...source.metadata,round2FirstFloor:'replaced by bounded NW-corner geometry',sourcePhotograph:MALL_CORNER_SOURCE});r.parts=source.parts.filter(p=>!/^recessed tall glazed retail ground floor$|^retail glass vertical mullion$|^fine retail horizontal mullion$|^roof terrace low planting$/.test(p.label)).map(p=>({...p,position:[...p.position],scale:[...p.scale],rotation:[...p.rotation]}));r.metadata.removedUniformFirstFloorParts=source.parts.length-r.parts.length;return r;}
export function mallCornerRecipe({quality='std'}={}){
 const site=CBD_CONTEXT_SITES.cwtc_mall_north,edges=footprintEdges(site.points),r=new Recipe('Mapped north mall recessed street-level gallery',{buildings:0,quality,sourceId:site.osmId,source:MALL_CORNER_SOURCE,sourceFootprintUnchanged:true,upperVolumeUnchanged:true,heightAccuracy:'Existing 27.5m main wall is photo-estimated, not surveyed.',placementAccuracy:'Recess/column rhythm photo-supported; exact opening count, entrance position and small fixtures authored.',groundY:MALL_CORNER_GROUND,noTextures:true}),fine=quality!=='low',ground=MALL_CORNER_GROUND-.8,top=8.0,clear=top-ground;
 mappedBody(r,site.points,ground-.10,ground,'paving','Mall corner grounded continuous internal floor');r.parts.at(-1).castShadow=false;
 mappedBody(r,site.points,top-.24,top,'stoneDark','Mall corner continuous deep structural soffit');r.parts.at(-1).castShadow=true;
 for(const e of edges){const hero=e.nx<-.98||e.nz<-.98,cols=Math.max(2,Math.round(e.length/(hero?5.5:7.5))),bay=e.length/cols;
  // Opaque inner lining behind a real 2.1m gallery-depth interval. No hidden
  // solid glass box remains directly behind the clear front glazing.
  panel(r,e,'glassDark',e.length/2,ground+clear*.5,e.length-.8,clear-.25,.07,'inset interior depth backing',-3.45,false);
  panel(r,e,'stoneLight',e.length/2,top-.42,e.length,.36,2.95,'supported perimeter ceiling return',-1.50,true);
  panel(r,e,'metalDark',e.length/2,ground+.10,e.length-.2,.20,.20,'recessed wall foot',-1.23,false);
  for(let i=0;i<=cols;i++){const u=Math.min(e.length-.28,Math.max(.28,i*bay));panel(r,e,'silverFacade',u,ground+clear*.5,.44,clear,.72,'structural lower-floor column',-.38,true);panel(r,e,'stoneDark',u,ground+.13,.56,.26,.80,'column ground socket',-.42,true);}
  const glazedCols=cols*(fine?2:1),gw=e.length/glazedCols;
  for(let i=0;i<glazedCols;i++){const u=(i+.5)*gw,t=u/e.length,x=e.a[0]+(e.b[0]-e.a[0])*t+e.nx*-1.22,z=e.a[1]+(e.b[1]-e.a[1])*t+e.nz*-1.22;r.add(GLASS_PLANE,'glassEnvelope',[x,ground+clear*.5,z],[gw-.10,clear-.22,1],[0,e.rotation,0],'Mall corner single-sheet recessed clear glazing');r.parts.at(-1).castShadow=false;panel(r,e,'metal',u-gw/2,ground+clear*.5,.07,clear-.12,.12,'slender recessed glass mullion',-1.16,false);}
  for(const y of [ground+3.2,ground+6.3])panel(r,e,'metal',e.length/2,y,e.length,.085,.14,'glazing cross transom',-1.13,false);
  if(hero&&e.length>25){const u=e.length*(e.nz<-.98?.39:.52),doorW=3.15,doorH=3.05;
   panel(r,e,'glassDark',u,ground+doorH*.5,doorW+.18,doorH+.10,.05,'unbranded entrance backing',-1.33,false);
   for(const side of [-1,1]){panel(r,e,'glassPale',u+side*doorW/4,ground+doorH/2,doorW/2-.08,doorH-.05,.035,'double entrance door',-1.10,false);panel(r,e,'silverFacade',u+side*doorW/2,ground+doorH/2,.075,doorH,.13,'door perimeter jamb',-1.04,true);if(fine)panel(r,e,'metalDark',u+side*.13,ground+1.12,.035,.48,.08,'door pull handle',-.96,false);}
   panel(r,e,'metalDark',u,ground+.022,doorW+.18,.044,1.18,'flush accessible threshold',-.65,false);
   panel(r,e,'stoneLight',u,ground+doorH+.15,doorW+.35,.22,.26,'entrance head return',-1.13,true);
  }
  // A controlled stone cladding rhythm on the visible side below the existing
  // upper glazing. These shallow joints do not invent a second facade skin.
  if(hero){for(let y=9.3;y<27.2;y+=1.5)panel(r,e,'stoneDark',e.length/2,y,e.length,.027,.035,'recess-tone stone course',.021,false);}
 }
 // Existing roof planter locations and size are retained; original green boxes
 // become compact three-dimensional leaf sprays, not new trees or new roof area.
 for(let i=0;i<6;i++){const x=-site.width*.20+i*site.width*.09,z=site.depth*.28;for(let j=0;j<(fine?12:7);j++){const a=j*2.399+i*.4,cx=x+Math.cos(a)*site.width*.022,cz=z+Math.sin(a)*.39,cy=28.08+(j%3)*.17;for(let k=0;k<3;k++){r.add(LEAF,k===2?'grass':'foliage',[cx,cy+k*.09,cz],[.66,.35,.9],[(k-1)*.65,a+k*.7,0],'Mall corner existing roof-bed leaf spray');r.parts.at(-1).castShadow=k===0;}}}
 const out=new Recipe(r.name,r.metadata),a=project(site.anchorWGS84);out.merge(r,[a[0],.8,a[1]]);return out;
}
export const buildMallCorner=(kit,options={})=>kit.buildMergedRecipe(mallCornerRecipe(options));
