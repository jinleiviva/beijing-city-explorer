/** Fixed mapped cross-plan; roof/height subdivisions are photo-informed approximations. */
import{Recipe,HIP_ROOF,GABLE_ROOF,latheGeometry}from'./geometry.js';
import{mappedBody}from'./site-massing.js';
export const LAMA_FALUN_SITE={family:'lama_falun_hall',osmId:'osm-way-377843160',anchorWGS84:[116.41096099575623,39.94702097123803],rotation:0,width:36.19,depth:29.65,height:17.65,source:'https://www.openstreetmap.org/way/377843160',photo:'https://www.yonghegong.cn/2017-05/31/0019b91ec9231a9878f621.jpg',reference:'https://www.yonghegong.cn/node_7249373.htm',accuracy:'Actual mapped cross-plan; roof partitions and heights approximate',points:[[13.715,-14.642],[-13.185,-14.063],[-13.091,-9.499],[-18.203,-9.387],[-17.811,8.602],[-13.467,8.502],[-13.33,15.003],[12.759,14.435],[12.64,9.025],[17.982,8.902],[17.564,-10.367],[13.809,-10.289]]};
// Rounded central ridge, shallow upturned eave, hipped ends. No hard ridge bar.
const ROLLED_ROOF=(()=>{
 const vertices=[],indices=[],rows=[[-.5,.12],[-.43,0],[-.30,.46],[-.15,.83],[0,1],[.15,.83],[.30,.46],[.43,0],[.5,.12]];
 for(const[z,y]of rows)for(const[x,h]of[[-.5,0],[-.5+.16*y,y],[.5-.16*y,y],[.5,0]])vertices.push(x,h,z);
 for(let j=0;j<rows.length-1;j++)for(let k=0;k<3;k++){const a=j*4+k,b=a+1,c=a+5,d=a+4;indices.push(a,c,b,a,d,c);}
 return{type:'mesh',vertices,indices};
})();
export function lamaFalunHall(o={}){
 const far=o.lod==='silhouette',detail=far?0:o.detail??1,site=LAMA_FALUN_SITE;
 const r=new Recipe('雍和宫法轮殿 · Yonghe FalunHall',{...site,approx:true,replacesOsmIds:[site.osmId],extraContextNotCountedIn45:true,skylightCount:5,roofEvidence:'Temple authority confirms five skylights and gilded tops; tourism authority confirms cross-plan and rolled-roof extensions',heightAccuracy:'All vertical dimensions approximate photo proportions;not surveyed'});
 mappedBody(r,site.points,0,.65,'marble','actual FalunHall cross-shaped plinth');
 mappedBody(r,site.points.map(([x,z])=>[x*.93,z*.93]),.65,7.65,'vermilionDark','inset cross-plan red timber walls below mapped roof envelope');
 const q=new Recipe('aligned FalunHall timber roof assembly');
 q.box('greenBeam',0,7.55,-.5,35.2,.70,18.4,'blue-green transverse temple beam course');
 q.add(HIP_ROOF,'roofGold',[0,7.8,-.5],[35.7,4.3,19.3],[0,0,0],'main yellow hipped seven-bay roof');
 for(const sign of[-1,1]){
  const z=sign*9.8;
  q.box('greenBeam',0,7.5,z,25.8,.6,9.0,'painted five-bay extension beam');
  q.add(ROLLED_ROOF,'roofGold',[0,7.75,z],[26.4,2.25,9.3],[0,0,0],'front-back yellow rolled-ridge hipped roof');
  q.box('roofGoldLight',0,8.0,sign*14.45,26.3,.24,.32,'golden temple eave fascia');
  for(let i=0;i<6;i++)q.box('vermilion',-12.7+i*5.08,4.12,sign*14.1,.45,7,.45,'red five-bay porch column');
  if(!far)for(let i=0;i<5;i++){
   const x=-10.16+i*5.08;
   q.box('paintedWood',x,3.9,sign*14.26,4.4,5.8,.1,'five-bay dark door recess');
   for(const dx of[-1.1,0,1.1])q.box('vermilion',x+dx,3.9,sign*14.35,.12,5.8,.10,'red wooden door divider');
   q.box('roofGoldLight',x,4.7,sign*14.42,4.25,.08,.08,'fine gilded door panel line');
  }
 }
 const skylights=[[0,-.5,6.1,4.5,11.6,2.6],[-10.3,-.5,3.9,3.6,10.1,1.5],[10.3,-.5,3.9,3.6,10.1,1.5],[0,-8.8,4.4,3.4,9.8,1.5],[0,8.5,4.4,3.4,9.8,1.5]];
 for(const[i,[x,z,w,d,y,h]]of skylights.entries()){
  q.box('vermilionDark',x,y+h/2,z,w,h,d,'raised skylight pavilion '+i);
  for(const sign of[-1,1])q.box('window',x,y+h*.57,z+sign*(d/2+.015),w*.83,h*.53,.05,'skylight glazing '+i);
  q.box('greenBeam',x,y+h-.15,z,w+.35,.35,d+.35,'skylight painted beam '+i);
  q.add(i===0?HIP_ROOF:GABLE_ROOF,'roofGold',[x,y+h,z],[w+.85,i===0?1.35:.95,d+.85],[0,0,0],'five yellow skylight roofs '+i);
  const bottom=y+h+(i===0?1.35:.95),profile=[[.38,0],[.45,.18],[.25,.45],[.30,.65],[.21,.9],[.14,1.2],[.10,1.45],[0,1.85]];
  q.add(latheGeometry(profile,far?8:12),'roofGoldLight',[x,bottom,z],[1,1,1],[0,0,0],'five gilded Tibetan-style skylight finials '+i);
 }
 // Internal timber axes follow the slightly rotated source outline; no geographic reorientation.
 r.merge(q,[0,0,0],.0218);
 r.metadata.highestApproximatePoint=17.4;
 return r;
}
