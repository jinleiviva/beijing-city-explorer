import{Recipe,latheGeometry,annulusGeometry,beam}from'./geometry.js';
import{OLYMPIC_DECKS}from'./olympic-tower-layout.js';
export function olympicTowerRefined(o={}){
 const far=o.lod==='silhouette',n=far?16:32;
 const r=new Recipe('北京奥林匹克塔 · Beijing Olympic Tower',{
  scope:'Five mapped observation crowns and supporting trumpet stems',
  deckComponents:OLYMPIC_DECKS,heightAccuracy:'Five component heights from OSM height/min_height tags;246.8m overall published height retained',
  horizontalAccuracy:'Each crown centre and diameter follows its actual OSM footprint;stem taper/ribs are photo-informed approximate'
 });
 r.cylinder('stoneLight',0,.7,0,30,1.4,'low shared Olympic tower forecourt',32);
 OLYMPIC_DECKS.forEach((d,i)=>{
  const[x,z]=d.center,h=d.height,R=d.dimensions[0]/2,stem=i===0?4.6:3.5,rise=i===0?30:23;
  r.cylinder('stoneLight',x,(h-rise)/2,z,stem,h-rise,'mapped Olympic stem '+d.osmId,far?8:16,.83);
  const profile=[[stem*.83,h-rise],[stem*1.1,h-rise*.7],[R*.38,h-rise*.42],[R*.72,h-rise*.16],[R,h-1.25],[R,h-.65],[0,h-.65]];
  r.add(latheGeometry(profile,n),'glassPale',[x,0,z],[1,1,1],[0,0,0],'differently sized flared crown '+d.osmId);
  r.cylinder('metal',x,h-.4,z,R,.8,'mapped top observation disc '+d.osmId,n);
  const ribs=far?6:12;
  for(let k=0;k<ribs;k++){
   const a=k/ribs*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
   beam(r,'stoneLight',[x+c*stem*.83,h-rise,z+s*stem*.83],[x+c*R,h-.95,z+s*R],far?.32:.24,'trumpet radial crown structure');
  }
  if(!far)for(let k=0;k<6;k++){
   const a=k/6*Math.PI*2;
   beam(r,'bronze',[x+Math.cos(a)*stem,1,z+Math.sin(a)*stem],[x+Math.cos(a)*stem*.83,h-rise,z+Math.sin(a)*stem*.83],.12,'fine vertical stem seam');
  }
  if(i===0&&!far)for(let k=0;k<5;k++)r.add(annulusGeometry(.85,16),'bronze',[x-2.8+k*1.4,h-1.5+(k%2?.5:0),z],[.8,.1,.8],[Math.PI/2,0,0],'five Olympic rings approximate emblem');
 });
 return r;
}
