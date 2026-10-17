/** Exact terrace context replacement; not part of the45 landmark quota. */
import {Recipe,loftGeometry,rectangleRing} from './geometry.js';
import {polygonPrism} from './site-massing.js';
import {PEOPLES_HEROES_SITE,PEOPLES_HEROES_APRON} from './peoples-heroes-layout.js';
export {PEOPLES_HEROES_SITE};
export function peoplesHeroesMonument(o={}){
 const far=o.lod==='silhouette',near=!far&&o.detail>0,r=new Recipe('人民英雄纪念碑 · Monument to the People’s Heroes',{approx:true,extraContextNotCountedIn45:true,scope:'exact relation8847722 terrace and stele only',replacesOsmIds:PEOPLES_HEROES_SITE.replacesOsmIds,heightVerifiedMetres:37.94,publishedPlatformMetres:[50.44,61.54],front:'local+Z north after site rotation PI',inscription:{text:'人民英雄永垂不朽',front:'north',position:[0,24.35,2.115],width:2.9,height:14.7,rendering:'original text overlay to be supplied by host; no invented glyph strokes'},proportionAccuracy:'Stele width/depth, tier heights and relief subdivision are photographic approximations',sources:['https://tamgw.beijing.gov.cn/diqufuwu/zjtam/201912/t20191219_1321036.html','https://www.bjdch.gov.cn/mldc/bglj/hswh/202304/t20230408_2993341.html']});
 r.add(polygonPrism(PEOPLES_HEROES_APRON,0,.18),'paving',[0,0,0],[1,1,1],[0,0,0],'actual mapped outer terrace apron');
 const xs=PEOPLES_HEROES_APRON.map(p=>p[0]),zs=PEOPLES_HEROES_APRON.map(p=>p[1]),w=Math.max(...xs)-Math.min(...xs),d=Math.max(...zs)-Math.min(...zs);
 const flower=PEOPLES_HEROES_APRON.map(([x,z])=>[x*50.44/w,z*61.54/d]);
 r.add(polygonPrism(flower,.18,1.35),'marble',[0,0,0],[1,1,1],[0,0,0],'published50.44 by61.54 lower crabapple terrace');
 r.box('marble',0,1.95,0,30.4,1.2,35.6,'upper rectangular terrace');
 // Two Sumeru bases: broad relief plinth, narrowing lotus waist, and smaller upper base.
 const tiers=[[2.55,3.15,15.2,12.4],[3.15,3.65,16.2,13.4],[3.65,6.15,14.4,11.4],[6.15,6.65,15.4,12.4],[6.65,7.3,16.0,13.0],[7.3,8.2,11.1,8.0],[8.2,9.1,10.0,7.2],[9.1,9.6,10.8,8.0],[9.6,10.7,8.6,6.2],[10.7,11.35,9.1,6.8],[11.35,11.85,8.2,5.8]];
 for(const[y0,y1,tw,td]of tiers)r.box('marble',0,(y0+y1)/2,0,tw,y1-y0,td,'stepped Sumeru base molding');
 const body=loftGeometry([{y:11.85,points:rectangleRing(6.6,4.4,.025)},{y:34.45,points:rectangleRing(5.8,3.8,.025)}]);body.flatShading=true;r.add(body,'stoneLight',[0,0,0],[1,1,1],[0,0,0],'slender tapered granite stele shaft');
 r.box('marble',0,34.7,0,6.5,.5,4.4,'stele top cornice lower');r.box('stoneLight',0,35.65,0,6.9,1.4,4.8,'stele top rectangular head');
 const cap=loftGeometry([{y:36.35,points:rectangleRing(7.7,5.6,.025)},{y:37.32,points:rectangleRing(6.65,4.55,.025)},{y:37.94,points:rectangleRing(6.4,4.3,.025)}]);cap.flatShading=true;r.add(cap,'marble',[0,0,0],[1,1,1],[0,0,0],'truncated traditional luding crown');
 // The inscription stone remains a real-size recessed panel until a host Canvas text overlay is attached.
 r.box('marble',0,24.35,2.075,2.9,14.7,.10,'north inscription stone14.7 by2.9');
 if(!far){
  for(const s of [-1,1])for(let i=-1;i<=1;i++)r.box('stoneLight',i*4.5,4.9,s*5.72,4.1,2.0,.12,'original simplified relief panel, sculpture detail omitted');
  for(const s of [-1,1])for(let i=-1;i<=1;i++)r.box('stoneLight',s*7.22,4.9,i*3.5,.12,2,3.1,'side simplified relief panel');
  for(let k=0;k<16;k++){const h=2.55*(k+1)/16;r.box('marble',0,h/2,26.5-k*.54,12,h,.62,'north terrace stair');r.box('marble',0,h/2,-26.5+k*.54,12,h,.62,'south terrace stair');}
  const rail=(axis,fixed,start,end,y)=>{for(let q=start;q<=end+.01;q+=near?2:4){const x=axis==='x'?q:fixed,z=axis==='x'?fixed:q;r.box('marble',x,y+.5,z,.28,1,.28,'white marble balustrade post');}const mid=(start+end)/2,len=end-start;r.box('marble',axis==='x'?mid:fixed,y+.8,axis==='x'?fixed:mid,axis==='x'?len:.18,.18,axis==='x'?.18:len,'terrace balustrade rail');};
  for(const s of [-1,1]){rail('z',s*15,-17.5,17.5,2.55);for(const a of [[-15,-6.3],[6.3,15]])rail('x',s*17.5,...a,2.55);}
 }
 return r;
}
