import{Recipe,rectangleRing,loftGeometry,beam}from'./geometry.js';
import{mappedBody}from'./site-massing.js';
import{MASSING_LAYOUT}from'./massing-layout.js';
export function chinaWorldRefined(o={},phaseB=false){
 const id=phaseB?'china_world_3b':'china_world_3',site=MASSING_LAYOUT[id],far=o.lod==='silhouette',detail=o.detail??1,h=phaseB?296:330;
 const r=new Recipe(phaseB?'国贸三期B座 · China World3B':'国贸三期A座 · China World3A',{
  scope:'Mapped tower only; independent neighbouring mall footprints remain separate',replacesOsmIds:['osm-'+site.osmRef.replace('/','-')],
  mappedFootprint:site.dimensions,heightAccuracy:phaseB?'296m adopted; primary SOM288m conflict retained in geographic data':'330m SOM official',
  horizontalAccuracy:'Actual mapped lobby footprint; taper/crown section dimensions photo-proportioned approximate'
 });
 mappedBody(r,site.polygons[0][0],0,18,'glassPale','actual tower-only glazed entrance base');
 const w0=phaseB?55.8:52.0,d0=phaseB?59.2:57.4,top=phaseB?268:300,n=phaseB?12:5;
 function size(j){return[w0-j*(phaseB?.16:1.5),d0-j*(phaseB?.16:1.5)];}
 for(let j=0;j<n;j++){
  const [w,d]=size(j),y=18+(top-18)*j/n,y1=18+(top-18)*(j+1)/n,delta=phaseB?1.15:-.4;
  const g=loftGeometry([{y,points:rectangleRing(w,d,phaseB?.14:.04)},{y:y1,points:rectangleRing(w+delta,d+delta,phaseB?.14:.04)}]);g.flatShading=true;
  r.add(g,phaseB?'glassPale':'zunGlass',[0,0,0],[1,1,1],[0,0,0],phaseB?'subtle canted rounded-corner facade section':'slender tapering office shaft');
  if(!far)r.box('silverFacade',0,y1,0,w+.2,.22,d+.2,'thin section edge');
 }
 const [tw,td]=size(n-1),fins=detail>0?18:9;
 if(!far){
  for(let side=0;side<4;side++)for(let i=0;i<=fins;i++){
   const u=-.46+.92*i/fins,p=(w,d,y)=>side<2?[u*w,y,(side===0?1:-1)*(d/2+.10)]:[(side===2?1:-1)*(w/2+.10),y,u*d];
   beam(r,'silverFacade',p(w0,d0,18),p(tw,td,top),phaseB?.12:.17,'vertical solar shading fin');
  }
  for(let y=22;y<top;y+=detail>0?4.5:11){
   const t=(y-18)/(top-18),w=w0+(tw-w0)*t,d=d0+(td-d0)*t;
   for(const sign of[-1,1]){r.box('silverFacade',0,y,sign*(d/2+.12),w,.12,.14,'fine curtain-wall floor joint');r.box('silverFacade',sign*(w/2+.12),y,0,.14,.12,d,'fine curtain-wall floor joint');}
  }
 }
 if(phaseB){
  const cw=52,cd=55.5,topW=44,topD=47.5;
  r.box('metalDark',0,267.5,0,cw,1,cd,'recessed crown roof');
  for(let side=0;side<4;side++){
   const width=side<2?cw:cd,depth=side<2?cd:cw,upper=side<2?topW:topD,upperDepth=side<2?topD:topW;
   const p=(u,y,a)=>side<2?[u,y,(side===0?1:-1)*a]:[(side===2?1:-1)*a,y,u];
   for(let j=0;j<4;j++){
    const a=-width/2+j*width/4,b=a+width/4,c=-upper/2+(j+.5)*upper/4;
    beam(r,'silverFacade',p(a,268,depth/2),p(c,295.5,upperDepth/2),.45,'exposed crown diagonal');beam(r,'silverFacade',p(c,295.5,upperDepth/2),p(b,268,depth/2),.45,'exposed crown diagonal');
   }
   beam(r,'silverFacade',p(-upper/2,295.5,upperDepth/2),p(upper/2,295.5,upperDepth/2),.42,'open crown top frame');
  }
 }else{
  r.box('zunDark',0,312,0,32,24,37,'inset mechanical crown core');
  const count=far?7:12;
  for(let side=0;side<4;side++)for(let i=0;i<=count;i++){
   const u=-.5+i/count,p=(w,d,y)=>side<2?[u*w,y,(side===0?1:-1)*d/2]:[(side===2?1:-1)*w/2,y,u*d];
   beam(r,'silverFacade',p(tw,td,300),p(tw-1.5,td-1.5,329.55),.35,'open silver rooftop crown upright');
  }
  for(const y of[300.4,318.0,329.55])for(const sign of[-1,1]){
   r.box('silverFacade',0,y,sign*(td-1.5)/2,tw-1.5,.5,.5,'bright crown horizontal frame');r.box('silverFacade',sign*(tw-1.5)/2,y,0,.5,.5,td-1.5,'bright crown horizontal frame');
  }
 }
 return r;
}
