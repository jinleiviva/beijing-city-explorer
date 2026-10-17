import{Recipe,hipRoofGeometry,latheGeometry}from'./geometry.js';
import{mappedBody,footprintEdges,edgePanel}from'./site-massing.js';
import{AGRICULTURE_SIDE_SITES}from'./agriculture-side-layout.js';
const PYRAMID=hipRoofGeometry({ridge:.01,sweep:.15});
export function agricultureSideHall(o={}){
 const site=AGRICULTURE_SIDE_SITES[o.siteId]??AGRICULTURE_SIDE_SITES.agriculture_hall_2,far=o.lod==='silhouette',near=!far&&o.detail>0,drum=site.number===3?3.2:0,[cx,cz]=site.entranceCentre;
 const r=new Recipe('全国农业展览馆 '+site.name+' · Mapped low exhibition wing',{...site,approx:true,extraContextNotCountedIn45:true,replacesOsmIds:[site.osmId],heightAccuracy:'Wing9.6m;Hall2 crown18.8m/Hall3 crown22m photo estimates. Official6m is exhibition operational clearance, not exterior total.'});
 mappedBody(r,site.points,0,.5,'stoneDark','actual L-shaped hall foundation');
 mappedBody(r,site.points,.5,9.25,'stone','low cream exhibition hall;no office storey stack');
 mappedBody(r,site.points,9.25,9.6,'roofGreyLight','mapped shallow long-wing roof');
 const q=new Recipe('photo-informed west-facing foyer'),fw=site.number===3?25:26.4;
 q.box('stone',0,6.6,1.2,fw,12.2,26.4,'tall cream tiled entry body');
 q.box('stoneLight',0,12.7,1.2,fw+1,.55,27.4,'thick low buff foyer cornice');
 q.box('greenBeam',0,11.85,14.49,21.6,.52,.18,'painted beam above three glazed entrance bays');
 for(let i=-1;i<=1;i++){
  q.box('window',i*6.0,6.1,14.44,5.5,10.0,.10,'three tall entrance glass bays');
  q.box('metal',i*6.0,6.1,14.54,.11,10.0,.08,'tall entrance mullion');
  for(const y of[3.5,7.2,10.4])q.box('metal',i*6.0,y,14.55,5.5,.10,.10,'entrance glazing horizontal division');
  if(!far)q.box('greyBrickDark',i*6,1.8,14.56,3.0,2.5,.12,'recessed entrance doorway');
 }
 for(const sign of[-1,1])for(const y of[4.4,8.7])q.box('window',sign*11.5,y,14.47,1.1,1.15,.12,'isolated small square foyer side window');
 if(near)for(let i=-1;i<=1;i++){
  q.box('greenBeam',i*6,12.0,14.72,.45,1.75,.60,'painted projecting entry bracket');
  q.box('roofGoldLight',i*6,12.25,14.85,2.0,.18,.55,'buff bracket cap');
 }
 if(drum){q.box('stone',0,14.3,0,20.4,2.65,20.4,'Hall3 additional short pavilion storey');for(const sign of[-1,1]){q.box('paintedWood',0,14.5,sign*10.24,16.8,1.2,.10,'Hall3 small upper window gallery');for(let i=-2;i<=2;i++)q.box('stone',i*3.7,14.5,sign*10.32,.40,1.3,.10,'Hall3 upper window pier');}q.box('stoneLight',0,15.9,0,22.0,.4,22.0,'Hall3 thin upper cornice');}
 q.box('stone',0,13.20+drum,0,21.2,.38,21.2,'buff square crown eave');
 q.add(PYRAMID,'roofGreen',[0,13.35+drum,0],[20.6,4.15,20.6],[0,0,0],'deep green upturned pyramidal pavilion crown');
 q.add(latheGeometry([[.34,0],[.38,.32],[.25,.63],[.31,.92],[.20,1.1],[0,1.3]],far?6:10),'roofGreen',[0,17.50+drum,0],[1,1,1],[0,0,0],'green pavilion roof finial');
 for(let i=0;i<3;i++)q.box('stoneDark',0,.12+i*.15,14.8+i*.16,17.0-2*i,.18,.32,'shallow entrance step');
 r.merge(q,[cx,0,cz],site.entranceRotation);
 if(!far)for(const e of footprintEdges(site.points)){
  if(e.length<18)continue;const n=Math.max(1,Math.floor(e.length/7.5));
  for(let i=0;i<n;i++){
   const u=(i+.5)*e.length/n,x=e.a[0]+(e.b[0]-e.a[0])*u/e.length,z=e.a[1]+(e.b[1]-e.a[1])*u/e.length;
   if(Math.abs(x-cx)<14&&Math.abs(z-cz)<15)continue;
   edgePanel(r,e,'window',u,4.8,3.8,5.1,.10,'single tall exhibition-wing window',.10);
   if(near){edgePanel(r,e,'stoneLight',u,4.8,.12,5.1,.12,'fine wing window mullion',.18);edgePanel(r,e,'stoneLight',u,4.7,3.8,.12,.12,'fine wing window crossbar',.18);}
  }
 }
 return r;
}
