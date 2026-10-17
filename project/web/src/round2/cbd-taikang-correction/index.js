/** Evidence-led Taikang correction. No photographic textures or third-party logo. */
import {Recipe,loftGeometry,beam} from '../../architecture/geometry.js';
import {project,hash} from '../../geo.js';
import {triangulateMillenniumRing} from '../cbd-millennium-correction/recipe.js';
export const TAIKANG_ID='osm-way-764434360';
export const TAIKANG_HEIGHT=223.4;
export const TAIKANG_EVIDENCE=Object.freeze({
 height:{metres:223.4,kind:'architectural top',sources:['https://www.skyscrapercenter.com/building/id/26846','https://www.jangho.com/jituanxinwen/2020/0713/711.html'],confidence:'Two explicit numerical sources; 216/220m in other publications remain unexplained, not assigned invented datums.'},
 identity:{name:'泰康集团大厦',source:'https://www.openstreetmap.org/way/764434360',note:'Existing named OSM footprint; CTBUH coordinate was not exposed for independent comparison.'},
 photo:{sources:['https://www.jangho.com/jituanxinwen/2020/0713/711.html','https://www.ltech.cn/html/en_news/taikang.html'],viewedUTC:'2026-10-17T09:59:43Z',observed:'Glass tower with recessed staggered horizontal stainless bands, central facade recesses, rounded crown, tall glazed lobby. Jangho illustration is explicitly a rendering; LTECH night photo and Jangho construction photo were also viewed.'},
 lobby:{glassHeight:17,maxPanelWidth:3.1,glassFinDepth:1.02,source:'https://www.jangho.com/jituanxinwen/2020/0713/711.html'},
 inference:'Upper taper, corner rounding, crown diameter/height, floor-band spacing, mullion count, south entry location and door dimensions are authored approximations. No separately mapped podium exists; no new podium/roof logo/helipad added.',
 license:'Original procedural geometry; photos viewed only, not copied or distributed. Geographic base © OpenStreetMap contributors, ODbL.'
});
const MATS={taikangGlass:['glassBlue','#7898ac',.32,.20],taikangRecess:['glassDark','#405b6a',.40,.15],taikangSilver:['silverFacade','#c4ced0',.48,.25],taikangStone:['stoneLight','#d4d0c7',.84,.02],taikangLobby:['glassPale','#abc4cd',.20,.05],taikangInterior:['stone','#a8a498',.86,.02]};
export function taikangPlan(feature){
 if(feature?.id!==TAIKANG_ID||hash(JSON.stringify(feature.geometry.coordinates[0]))!==661286344)throw Error('Taikang original named footprint changed');
 const ring=feature.geometry.coordinates[0].slice(0,-1).map(project),center=ring.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);
 // Bilinear map preserves the four original surveyed-data corners, without rotating a guessed bbox.
 const at=(u,v)=>{const w=[(1+u)*(1+v),(1-u)*(1+v),(1-u)*(1-v),(1+u)*(1-v)];return[ring.reduce((a,p,i)=>a+p[0]*w[i]/4,0)-center[0],ring.reduce((a,p,i)=>a+p[1]*w[i]/4,0)-center[1]];};
 return{ring,center,at,width:Math.hypot(ring[0][0]-ring[1][0],ring[0][1]-ring[1][1]),depth:Math.hypot(ring[1][0]-ring[2][0],ring[1][1]-ring[2][1])};
}
function roundedRing(plan,scale=1,recess=.022,steps=3){
 const points=[],c=.115;
 // Positive XZ winding: north edge, east, south, west. Central shallow notch is visible on source photos.
 for(let side=0;side<4;side++){
  const rotate=([x,z])=>side===0?[x,z]:side===1?[-z,x]:side===2?[-x,-z]:[z,-x];
  for(const[x,z]of[[-1+c,-1],[-.075,-1],[-.04,-1+recess],[.04,-1+recess],[.075,-1],[1-c,-1]]){const p=rotate([x*scale,z*scale]);points.push(plan.at(...p));}
  for(let j=1;j<steps;j++){const a=-Math.PI/2+j/steps*Math.PI/2,p=rotate([(1-c+c*Math.cos(a))*scale,(-1+c+c*Math.sin(a))*scale]);points.push(plan.at(...p));}
 }
 return points;
}
function closedLoft(rings){const g=loftGeometry(rings,false),n=rings[0].points.length,last=(rings.length-1)*n;for(const[a,b,c]of triangulateMillenniumRing(rings[0].points))g.indices.push(a,b,c);for(const[a,b,c]of triangulateMillenniumRing(rings.at(-1).points))g.indices.push(last+a,last+c,last+b);return{...g,flatShading:true};}
function slab(points,y0,y1){return closedLoft([{y:y0,points},{y:y1,points}]);}
function panel(r,material,points,label,shadow=false){r.add({type:'mesh',vertices:points.flat(),indices:[0,1,2,0,2,3],flatShading:true},material,[0,0,0],[1,1,1],[0,0,0],label);r.parts.at(-1).castShadow=shadow;}
export function taikangCorrectionRecipe(feature,{quality='standard',groundAt=()=>-.02}={}){
 const p=taikangPlan(feature),fine=quality!=='low',ground=Math.max(...p.ring.map(v=>groundAt(...v)),groundAt(...p.center)),r=new Recipe('Taikang 223.4m evidence-led replacement',{sourceId:TAIKANG_ID,height:TAIKANG_HEIGHT,quality,evidence:TAIKANG_EVIDENCE,sourceRingHash:661286344,groundY:ground,topY:ground+TAIKANG_HEIGHT,previousFallbackHeight:66.55728413490579,footprintPreserved:true,originalCollisionRetained:true});
 const plinth=p.ring.map(v=>[v[0]-p.center[0],v[1]-p.center[1]]);if(plinth.reduce((s,a,i)=>{const b=plinth[(i+1)%plinth.length];return s+a[0]*b[1]-b[0]*a[1];},0)<0)plinth.reverse();
 r.add(slab(plinth,-.10,.22),'taikangStone',[0,0,0],[1,1,1],[0,0,0],'exact mapped footprint foundation');
 const lower=17.22,upper=217.4,levels=44;
 r.add(closedLoft([{y:lower,points:roundedRing(p,.943,.033,4)},{y:80,points:roundedRing(p,.953,.028,4)},{y:155,points:roundedRing(p,.975,.025,4)},{y:upper,points:roundedRing(p,1,.022,4)}]),'taikangGlass',[0,0,0],[1,1,1],[0,0,0],'223.4m tower body with conservative upward flare');
 for(let i=0;i<=levels;i++){const y=lower+(upper-lower)*i/levels,s=.943+.057*(i/levels),notch=.022+.012*(.5+.5*Math.sin(i*.7));r.add(slab(roundedRing(p,s,notch,fine?4:2),y-.24,y+.16),'taikangSilver',[0,0,0],[1,1,1],[0,0,0],'photo-informed recessed stainless floor ribbon');r.parts.at(-1).castShadow=false;}
 // Sparse true glazing joints on upper tower, instead of painted high-contrast checkerboards.
 for(let side=0;side<4;side++)for(let u=-.82;u<=.82;u+=fine?.13:.26){if(Math.abs(u)<.09)continue;const rot=([a,b])=>side===0?[a,b]:side===1?[-b,a]:side===2?[-a,-b]:[b,-a],a=p.at(...rot([u*.943,-.943])),b=p.at(...rot([u,-1]));beam(r,'taikangRecess',[a[0],lower,a[1]],[b[0],upper,b[1]],fine?.035:.045,'fine vertical glazing joint');r.parts.at(-1).castShadow=false;}
 const ellipse=(y,scale)=>({y,points:Array.from({length:fine?48:24},(_,i)=>{const a=i/(fine?48:24)*Math.PI*2;return p.at(Math.cos(a)*scale,Math.sin(a)*scale);})});
 r.add({...loftGeometry([ellipse(217.35,.82),ellipse(223.4,.82)],true),flatShading:true},'taikangRecess',[0,0,0],[1,1,1],[0,0,0],'photo-confirmed circular crown, inferred dimensions within official total height');
 for(let i=0;i<(fine?48:24);i++){const a=i/(fine?48:24)*Math.PI*2,pt=p.at(Math.cos(a)*.821,Math.sin(a)*.821);r.box('taikangSilver',pt[0],220.3,pt[1],.14,6.2,.14,'crown vertical metal rib');r.parts.at(-1).castShadow=false;}
 // Tall glass envelope; front panels stop at the doorway. Interior is recessed, never a solid host behind the entrance.
 const lobbyScale=.918,lobbyBottom=.22,lobbyTop=17.22,lobbyRing=roundedRing(p,lobbyScale,0,3);
 r.add(slab(roundedRing(p,.73,0,3),.22,16.9),'taikangInterior',[0,0,0],[1,1,1],[0,0,0],'recessed lobby core behind transparent glass');
 for(let side=0;side<4;side++){
  const rot=([a,b])=>side===0?[a,b]:side===1?[-b,a]:side===2?[-a,-b]:[b,-a];
  const coord=(u,y)=>{const[x,z]=p.at(...rot([u*lobbyScale,-lobbyScale]));return[x,y,z];};
  const width=side%2?p.depth:p.width,bays=Math.ceil(width*lobbyScale/3.1);
  const doorHalf=3.2/(width*lobbyScale/2),cuts=Array.from({length:bays+1},(_,j)=>-1+2*j/bays);if(side===2)cuts.push(-doorHalf,doorHalf);cuts.sort((a,b)=>a-b);
  for(let j=0;j<cuts.length-1;j++){let u0=cuts[j],u1=cuts[j+1];const isEntry=side===2&&u0>=-doorHalf-1e-8&&u1<=doorHalf+1e-8;
   const a=coord(u0,lobbyBottom),b=coord(u0,lobbyTop),c=coord(u1,lobbyTop),d=coord(u1,lobbyBottom);panel(r,'taikangLobby',isEntry?[coord(u0,4.1),b,c,coord(u1,4.1)]:[a,b,c,d],'17m tall lobby glazing; 3.1m max nominal bays');
   const mid=coord(u0,(lobbyTop+lobbyBottom)/2);beam(r,'taikangSilver',a,b,.035,'fine lobby silicone joint');r.parts.at(-1).castShadow=false;
   if(fine){const inner=p.at(...rot([u0*lobbyScale,-lobbyScale+.034]));panel(r,'taikangLobby',[a,b,[inner[0],lobbyTop,inner[1]],[inner[0],lobbyBottom,inner[1]]],'glass-fin depth approximately 1.02m');}
  }
 }
 // Selected south portal is an explicit orientation inference. Six metres clear opening, slightly recessed doors and paving sill.
 const front=p.at(0,lobbyScale),portalYaw=Math.atan2(-(p.ring[0][1]-p.ring[1][1]),p.ring[0][0]-p.ring[1][0]),entry=new Recipe('authored south doorway within verified tall-glass lobby');
 for(const x of[-3.1,3.1])entry.box('taikangSilver',x,2.17,0,.18,3.9,.25,'lobby entry side frame');entry.box('taikangSilver',0,4.17,0,6.4,.22,.32,'lobby portal head');
 for(const x of[-1.5,1.5])entry.box('taikangLobby',x,2.15,-.35,2.9,3.8,.055,'recessed transparent double door');entry.box('taikangSilver',0,2.12,-.31,.085,3.8,.08,'door centre meeting stile');
 for(const x of[-.22,.22])entry.box('taikangSilver',x,1.65,-.23,.045,.85,.06,'door pull handle');entry.box('taikangStone',0,.25,-.65,6.4,.08,1.5,'door sill contacting mapped foundation');r.merge(entry,[front[0],0,front[1]],portalYaw);
 // Inboard structural columns visible through glass, with warm-grey stone ground contact.
 for(const [u,v]of[[-.72,-.72],[.72,-.72],[-.72,.72],[.72,.72]]){const[x,z]=p.at(u,v);r.cylinder('taikangSilver',x,8.72,z,.63,17,'inboard lobby support column',16);}
 const out=new Recipe(r.name,r.metadata);out.merge(r,[p.center[0],ground,p.center[1]]);out.metadata.partCount=out.parts.length;out.metadata.entry={center:[p.center[0]+front[0],ground,p.center[1]+front[1]],width:6.4,height:4.1,orientation:'south; illustrative, not surveyed'};return out;
}
export function buildCbdTaikangCorrection(kit,feature,options={}){
 for(const[name,[base,color,roughness,metalness]]of Object.entries(MATS))if(!kit.materials[name]){const m=kit.materials[base].clone();m.name='Beijing_'+name;m.color.set(color);m.roughness=roughness;m.metalness=metalness;m.emissiveIntensity=0;if(name==='taikangLobby'){m.transparent=true;m.opacity=.24;m.depthWrite=false;}kit.materials[name]=m;}
 const g=kit.buildMergedRecipe(taikangCorrectionRecipe(feature,options));if(g.userData.architectureStats.triangles>24000||g.userData.architectureStats.drawCalls>10)throw Error('Taikang bounded geometry budget exceeded');return g;
}
