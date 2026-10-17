import{Recipe,BOX,beam as roundBeam}from'./geometry.js';
function beam(...args){roundBeam(...args);const p=args[0].parts.at(-1);p.geometry=BOX;p.scale[0]*=2;p.scale[2]*=2;}
import{mappedBody}from'./site-massing.js';
import{BTV_SITE}from'./beijing-tv-layout.js';
export function beijingTvRefined(o={}){
 const far=o.lod==='silhouette',detail=o.detail??1;
 const r=new Recipe('北京电视中心 · Beijing Television Center',{
  replacesOsmIds:[BTV_SITE.osmId],anchorWGS84:BTV_SITE.anchorWGS84,placementRotation:Math.PI,
  scope:'Single mapped61.12x68.16m tower; surrounding campus and low studios remain independent context',
  architecturalHeight:239,tipHeight:250,heightSource:'https://www.skyscrapercenter.com/building/beijing-television-center/1014',
  reference:'https://www.nikken.co.jp/en/about/projects_history/corporate_history/10_01.html',
  photo:'assets/architecture/research/btv-nikken-cyr.jpg',
  approximation:'Four-sided transfer openings, raked atrium glass and curved roof interpreted from architect photograph; individual frame heights and facade bay counts approximate'
 });
 mappedBody(r,BTV_SITE.points,0,2.2,'btvStone','actual single BTV tower footprint');
 r.box('btvGlass',0,72,0,49,140,55,'lower broadcasting office and central atrium mass');
 r.box('btvGlass',0,193,0,49,44,55,'upper suspended broadcasting volume');
 // Recesses stay open at the front and sides, not painted rectangles.
 for(const side of[-1,1]){
  r.box('btvGlass',side*25.4,147,0,1.4,10,55,'side office extension below transfer void');
  r.box('btvGlass',side*25.4,203,0,1.4,52,55,'taller side broadcasting facade');
 }
 r.box('btvGlass',0,203,-28.0,49,52,1.2,'rear taller broadcasting facade');
 for(const [x,z,h]of[[-27,27,221],[27,27,231],[-27,-27,239],[27,-27,231]]){
  r.box('btvStone',x,h/2,z,5.8,h,12,'asymmetrical full-height corner blade');
  r.box('silverFacade',x-Math.sign(x)*3.1,h/2,z,0.55,h,11.7,'inner blade silver edge');
 }
 // Transfer trusses occur on every visible facade in the architect's oblique photo.
 function facadePoint(side,u,y){return side<2?[u,y,(side===0?1:-1)*28.35]:[(side===2?1:-1)*26.2,y,u];}
 for(let side=0;side<4;side++)for(const y of(side===0?[142,171,216]:[152,177,229])){
  const width=side<2?47:54,n=far?5:8;
  for(const dy of[-2.0,2.0]){
   const a=facadePoint(side,-width/2,y+dy),b=facadePoint(side,width/2,y+dy);beam(r,'btvStone',a,b,.42,'BTV expressed transfer-truss chord');
  }
  for(let i=0;i<n;i++){
   const u=-width/2+i*width/n,mid=u+width/(2*n),v=u+width/n;
   beam(r,'btvStone',facadePoint(side,u,y-2),facadePoint(side,mid,y+2),.32,'BTV visible triangular transfer brace');
   beam(r,'btvStone',facadePoint(side,mid,y+2),facadePoint(side,v,y-2),.32,'BTV visible triangular transfer brace');
  }
 }
 const roof={type:'mesh',vertices:[-24,217,27,24,216,27,24,229,-27,-24,234,-27],indices:[0,1,2,0,2,3],flatShading:true};
 // Roof winding must point upward for single-sided materials.
 r.add(roof,'btvGlass',[0,0,0],[1,1,1],[0,0,0],'raked glass atrium crown');
 // Thin curved canopy at the rear crown, within the mapped tower envelope.
 const cap={type:'mesh',vertices:[0,233.8,-8],indices:[],flatShading:true},segments=24;
 for(let i=0;i<=segments;i++){const a=Math.PI+i*Math.PI/segments;cap.vertices.push(Math.cos(a)*24,233.8,-8+Math.sin(a)*24);}
 for(let i=1;i<=segments;i++)cap.indices.push(0,i+1,i);
 r.add(cap,'btvStone',[0,0,0],[1,1,1],[0,0,0],'thin semicircular rear crown canopy');
 r.cylinder('metalDark',-27,244.5,-27,.30,11,'antenna to published250m tip',8);
 if(!far){
  const step=detail>0?4.5:10,cols=detail>0?15:7;
  for(let side=0;side<4;side++){
   const width=side<2?47:54;
   for(const [bottom,top]of[[8,140],[179,side===0?214:227]]){
    for(let y=bottom;y<top;y+=step){const a=facadePoint(side,-width/2,y),b=facadePoint(side,width/2,y);beam(r,'silverFacade',a,b,.10,'BTV fine curtain-wall floor joint');}
    for(let i=0;i<=cols;i++){const u=-width/2+i*width/cols;beam(r,'silverFacade',facadePoint(side,u,bottom),facadePoint(side,u,top),.08,'BTV fine curtain-wall vertical mullion');}
   }
  }
 }
 return r;
}
