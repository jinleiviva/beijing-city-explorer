/** Bounded, original 70m Guanghua Road pavement/planting study.
 * Mapped carriageway and existing tree positions are immutable. Furniture and
 * paving are photo-informed authored placements, not an as-built survey.
 * Every visible detail here is geometry, not a shader or photographic texture.
 */
import {Recipe,beam} from '../../architecture/geometry.js';
import {insideBuilding} from '../../spatial.js';
import {distanceToSegment} from '../../geo.js';

export const CBD_STREET_DETAIL_SCOPE=Object.freeze({roadId:'osm-way-1147352145',startX:4763,length:70,innerOffset:7.06,outerOffset:15.15,pavingY:.65,curbTop:.78});
const LEAF={type:'mesh',flatShading:true,vertices:[0,0,-.5,-.5,0,0,0,0,.5,.5,0,0,0,.18,0,0,-.08,0],indices:[4,0,1,4,1,2,4,2,3,4,3,0,5,1,0,5,2,1,5,3,2,5,0,3]};
const polyHash=(i)=>((Math.sin(i*78.233+33.7)*43758.5453)%1+1)%1;
function box(r,m,x,y,z,w,h,d,label,shadow=false,angle=0){r.box(m,x,y,z,w,h,d,'CBD street '+label,angle);r.parts.at(-1).castShadow=shadow;}
function leaf(r,mat,x,y,z,l,w,az,tilt,label){r.add(LEAF,mat,[x,y,z],[w,l*.33,l],[tilt,az,0],'CBD street '+label);r.parts.at(-1).castShadow=true;}
function shrub(r,u,v,length,depth,fine){
 box(r,'greyBrickDark',u,.045,v,length,.07,depth,'low planting soil');
 const n=fine?15:8;
 for(let i=0;i<n;i++){const x=u-length*.46+length*.92*i/(n-1),z=v+(polyHash(i+u)-.5)*depth*.55,h=.32+polyHash(i*2+u)*.22;for(let k=0;k<(fine?10:6);k++){const a=k*2.399+i*.4,reach=.18+.12*polyHash(i+k+v),y=.09+h*(.35+(k%4)*.16);leaf(r,k%4===0?'grass':'foliage',x+Math.cos(a)*reach,y,z+Math.sin(a)*reach,.30+polyHash(k+i)*.15,.20,a,(k%3-1)*.6,'low shrub folded leaf');}r.cylinder('timber',x,h*.4,z,.018,h*.8,'CBD street shrub stem',5,.6);r.parts.at(-1).castShadow=false;}
 for(let i=0;i<(fine?24:12);i++){const x=u-length*.46+length*.92*i/(fine?23:11),z=v+depth*.38;for(let k=0;k<3;k++)leaf(r,'grass',x+.06*(k-1),.09,z,.28,.065,k*2.1+i*.7,-.6,'low grass tuft');}
}
function bench(r,u,v){
 for(const du of [-.74,.74]){box(r,'metalDark',u+du,.23,v,.075,.46,.47,'bench grounded leg',true);box(r,'metalDark',u+du,.73,v+.24,.075,.62,.065,'bench back support',true);}
 for(let i=0;i<5;i++)box(r,'timber',u,.48,v-.24+i*.12,1.92,.075,.10,'individual seat slat',true);
 for(let i=0;i<3;i++)box(r,'timber',u,.69+i*.105,v+.25,1.92,.085,.06,'individual back slat',true);
 for(const du of [-.84,.84]){box(r,'metalDark',u+du,.66,v,.055,.055,.56,'bench armrest',true);box(r,'metalDark',u+du,.56,v-.19,.055,.22,.055,'bench arm support',true);}
}
function bike(r,u,v,angle,paint,fine){const b=new Recipe('parked bicycle'),wheelR=.33;
 for(const x of [-.58,.58]){const n=fine?16:10;for(let k=0;k<n;k++){const a=k/n*Math.PI*2,c=(k+1)/n*Math.PI*2;beam(b,'metalDark',[x+Math.cos(a)*wheelR,.34+Math.sin(a)*wheelR,0],[x+Math.cos(c)*wheelR,.34+Math.sin(c)*wheelR,0],.025,'CBD street bicycle tire');if(fine&&k%2===0)beam(b,'metal',[x,.34,0],[x+Math.cos(a)*.30,.34+Math.sin(a)*.30,0],.006,'CBD street bicycle spoke');}}
 const points=[[-.58,.34,0],[-.10,.34,0],[-.25,.84,0],[.36,.85,0],[.58,.34,0]];for(const[a,bp]of [[0,1],[1,2],[2,0],[2,3],[3,1],[3,4]])beam(b,paint,points[a],points[bp],.027,'CBD street bicycle tubular frame');
 beam(b,'metalDark',[-.25,.78,0],[-.25,.98,0],.018,'CBD street saddle post');box(b,'metalDark',-.25,1.0,0,.28,.06,.18,'bicycle saddle',true);beam(b,'metalDark',[.37,.83,0],[.42,1.08,0],.02,'CBD street handlebar stem');beam(b,'metalDark',[.42,1.08,-.22],[.42,1.08,.22],.022,'CBD street handlebar');beam(b,'metalDark',[-.10,.34,0],[-.23,.04,.19],.012,'CBD street bicycle parked stand');
 for(const p of b.parts)p.castShadow=!/spoke/.test(p.label);r.merge(b,[u,0,v],angle);
}
/** Pure recipe, including an explicit geometric footprint audit manifest. */
export function cbdStreetDetailRecipe(roads,treeRecords,collision,{quality='std'}={}){
 const road=roads.find(r=>r.id===CBD_STREET_DETAIL_SCOPE.roadId);if(!road)throw Error('Mapped Guanghua carriageway unavailable');
 const a=road.points[0],b=road.points[1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len,nx=-dz,nz=dx;
 const startT=(CBD_STREET_DETAIL_SCOPE.startX-a[0])/dx,origin=[a[0]+dx*startT,a[1]+dz*startT],rotation=Math.atan2(-dz,dx),ground=CBD_STREET_DETAIL_SCOPE.pavingY,fine=quality!=='low';
 const world=(u,v)=>[origin[0]+dx*u+nx*v,origin[1]+dz*u+nz*v],local=t=>[(t.x-origin[0])*dx+(t.z-origin[1])*dz,(t.x-origin[0])*nx+(t.z-origin[1])*nz];
 const trees=treeRecords.map(t=>({...t,uv:local(t)})).filter(t=>t.uv[0]>0&&t.uv[0]<70&&t.uv[1]>9&&t.uv[1]<14);
 const r=new Recipe('Guanghua 70m human-scale pavement and planting',{buildings:0,quality,scope:CBD_STREET_DETAIL_SCOPE,noTextures:true,sourceRoad:road.id,sourceTreeCount:trees.length,sourceTreePositions:trees.map(t=>[t.x,t.z]),placements:[],accuracy:'Original photo-informed street furniture, sizes and exact locations inferred; mapped road and tree records unchanged.'});
 const vehicles=roads.filter(r=>r.y<4&&!['footway','path','pedestrian','steps','cycleway'].includes(r.class));
 function safe(u,v,ru=.2,rv=.2){for(const du of [-ru,ru])for(const dv of [-rv,rv]){const[x,z]=world(u+du,v+dv);if(insideBuilding(collision,x,z,.08))return false;for(const road of vehicles)for(let k=1;k<road.points.length;k++)if(distanceToSegment(x,z,road.points[k-1],road.points[k])<road.width/2+.02)return false;}return true;}
 const pit=(u,v,pad=0)=>trees.some(t=>Math.abs(u-t.uv[0])<1.05+pad&&Math.abs(v-t.uv[1])<1.05+pad);
 const pitEnvelope=(u,v,ru,rv)=>trees.some(t=>Math.abs(u-t.uv[0])<1.15+ru&&Math.abs(v-t.uv[1])<1.15+rv);
 // Real stone slabs with visible 12mm open joints; no dense decal texture.
 const pw=fine?1.2:2.4,pd=fine?.81:1.62;
 let slabCount=0;for(let v=7.1+pd/2;v<15.1;v+=pd)for(let u=pw/2;u<70;u+=pw){if(pit(u,v,Math.max(pw,pd)*.5)||!safe(u,v,pw*.49,pd*.49))continue;box(r,Math.floor(u/pw+v/pd)%9===0?'stoneDark':'paving',u,-.035,v,pw-.012,.07,pd-.012,'individual pavement slab');slabCount++;}
 // Narrow longitudinal tactile strip, broken at tree pits and utility locations.
 for(let u=.3;u<70;u+=.6){const v=9.2;if(!safe(u,v,.29,.16)||pit(u,v,.25))continue;box(r,'stoneDark',u,.009,v,.59,.018,.32,'tactile guidance base');if(fine)for(let k=0;k<4;k++)box(r,'stoneLight',u,.023,v-.12+k*.08,.56,.022,.028,'raised tactile rib');}
 for(let u=.5;u<70;u+=1){if(safe(u,7.16,.49,.10))box(r,'stoneLight',u,.035,7.16,.985,.19,.20,'segmented grounded curb',true);}
 // Existing trees receive soil, edging and two open grate wings, never a new tree.
 for(const t of trees){const[u,v]=t.uv;box(r,'greyBrickDark',u,-.018,v,2.12,.035,2.12,'tree pit soil');for(const s of [-1,1]){box(r,'stoneDark',u+s*1.08,.035,v,.13,.14,2.29,'tree pit border',true);box(r,'stoneDark',u,.035,v+s*1.08,2.16,.14,.13,'tree pit border',true);}if(fine)for(const s of [-1,1])for(let k=0;k<7;k++)box(r,'metalDark',u+s*.72,.019,v-.87+k*.29,.49,.038,.032,'open tree grate bar');r.metadata.placements.push({type:'tree-pit',world:world(u,v),envelope:[2.29,2.29]});}
 // Grouped street amenities leave >2m clear along the guidance/walking band.
 for(const [u,v]of [[32,12.5],[55,13.7]])if(safe(u,v,1.05,.4)&&!pitEnvelope(u,v,1.05,.4)){bench(r,u,v);r.metadata.placements.push({type:'bench',world:world(u,v),envelope:[2.1,.8]});}
 for(const [u,v]of [[18,14.5],[43.5,14.5]])if(safe(u,v,2.55,.51)&&!pitEnvelope(u,v,2.55,.51)){shrub(r,u,v,5.0,.9,fine);r.metadata.placements.push({type:'low-layered-bed',world:world(u,v),envelope:[5,.9]});}
 if(safe(35,14.1,.65,.35)&&!pitEnvelope(35,14.1,.65,.35)){for(const s of [-1,1]){box(r,'metalDark',35+s*.33,.43,14.1,.55,.86,.48,'paired litter bin body',true);box(r,'stoneLight',35+s*.33,.91,14.1,.59,.10,.54,'litter bin lid',true);box(r,'glassDark',35+s*.33,.72,13.847,.34,.16,.016,'bin opening recess');box(r,s<0?'bronze':'glassBlue',35+s*.33,.53,13.845,.12,.12,.02,'bin sorting pictogram color');}r.metadata.placements.push({type:'paired-bin',world:world(35,14.1),envelope:[1.3,.7]});}
 // Photo-supported shared-cycle presence, neutral bicycle shapes without brands.
 for(let i=0;i<5;i++){const u=53+i*1.7,v=11.8;if(safe(u,v,.85,.6)&&!pit(u,v,1.2)){bike(r,u,v,.20+(i%2)*.12,i%2?'glassBlue':'roofGold',fine);r.metadata.placements.push({type:'parked-cycle',world:world(u,v),envelope:[1.7,1.2]});}}
 for(const u of [8,38,67])if(safe(u,7.8,.3,.20)){box(r,'metalDark',u,.008,7.8,.58,.016,.38,'storm drain inset');if(fine)for(let k=0;k<8;k++)box(r,'metal',u-.24+k*.068,.019,7.8,.023,.012,.35,'storm drain bars');}
 // A few flush rectangular service covers with inset double frames.
 for(const u of [14.5,44.5]){const v=10.3;if(!safe(u,v,.55,.4)||pit(u,v,.8))continue;box(r,'metalDark',u,.011,v,1.0,.022,.70,'service cover border');box(r,'paving',u,.017,v,.92,.022,.62,'service cover inset');}
 r.metadata.pavingSlabs=slabCount;r.metadata.groundY=ground;r.metadata.treeCountDelta=0;r.metadata.collisionPolicy='All furniture envelopes and paving corners outside unchanged mapped buildings and vehicle roads; explicit walking band v=8.2..10.4 stays free of furniture.';
 const out=new Recipe(r.name,r.metadata);out.merge(r,[origin[0],ground,origin[1]],rotation);return out;
}
export function buildCbdStreetDetail(kit,roads,trees,collision,options={}){return kit.buildMergedRecipe(cbdStreetDetailRecipe(roads,trees,collision,options));}

// Shared original street props; callers choose a verified local ground datum.
export {bike as appendParkedBike,bench as appendStreetBench};
