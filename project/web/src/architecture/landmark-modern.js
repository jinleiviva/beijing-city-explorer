import{peoplesDailyRefined}from'./peoples-daily.js';
import{beijingTvRefined}from'./beijing-tv.js';
import {mappedBody} from './site-massing.js';
import {YINTAI_PODIUMS} from './yintai-layout.js';
import {Recipe,rectangleRing,ellipseRing,loftGeometry,beam} from './geometry.js';

function ring(w,d,y,x=0,z=0,chamfer=.03) {return {y,points:rectangleRing(w,d,chamfer).map(([a,b])=>[a+x,b+z])};}
function loft(r,mat,rings,label){r.add(loftGeometry(rings),mat,[0,0,0],[1,1,1],[0,0,0],label);}
function bands(r,w,d,h,step=5,x=0,z=0,material='metal') {
  for(let y=5;y<h;y+=step) {
    for(const zz of [-d/2,d/2])r.box(material,x,y,z+zz,w,.3,.25,'horizontal floor joint');
    for(const xx of [-w/2,w/2])r.box(material,x+xx,y,z,.25,.3,d,'horizontal floor joint');
  }
}

const peoplesDaily=peoplesDailyRefined;

const beijingTV=beijingTvRefined;

function yintai(o) {
  const r=new Recipe('北京银泰中心 · Beijing Yintai Centre'),far=o.lod==='silhouette';
  for(const points of YINTAI_PODIUMS)mappedBody(r,points,0,16,'stoneDark','mapped separate low commercial podium');
  for(const [x,z,w,d,h] of [[0,0,37.28,39.64,249.9],[-77.487,55.426,41.97,41.70,186],[83.383,55.164,41.96,41.71,186]]) {
    const bottom=16,crown=h-30,shaft=crown-bottom,cw=w+3,cd=d+3;
    r.box('glassDark',x,bottom+shaft/2,z,w,shaft,d,'dark glazing behind pale square facade grid');
    const cols=far?6:13,rows=far?18:Math.round(shaft/4.0),pier=far?1.0:.85,band=far?1.1:.75;
    for(const side of [-1,1]) {
      for(let i=0;i<=cols;i++) {
        const u=-w/2+i*w/cols;
        r.box('silverFacade',x+u,bottom+shaft/2,z+side*(d/2+.22),pier,shaft,.48,'Yintai pale vertical facade grid');
        r.box('silverFacade',x+side*(w/2+.22),bottom+shaft/2,z+u*d/w,.48,shaft,pier,'Yintai pale vertical facade grid');
      }
      for(let j=0;j<=rows;j++) {
        const y=bottom+j*shaft/rows;
        r.box('silverFacade',x,y,z+side*(d/2+.22),w,band,.48,'Yintai pale horizontal facade grid');
        r.box('silverFacade',x+side*(w/2+.22),y,z,.48,band,d,'Yintai pale horizontal facade grid');
      }
    }
    // White open-square lanterns are the signature crown, not closed gold caps.
    r.box('glassDark',x,crown+13,z,w*.62,25,d*.62,'recessed rooftop technical core');
    for(let side=0;side<4;side++)for(let k=0;k<=4;k++) {
      const a=side*Math.PI/2,u=-.5+k/4;
      const xx=x+u*cw*Math.cos(a)+cw/2*Math.sin(a),zz=z-u*cd*Math.sin(a)+cd/2*Math.cos(a);
      r.box('silverFacade',xx,crown+15,zz,1.25,30,1.25,'open pale crown vertical frame');
    }
    for(const y of [crown,crown+7.5,crown+15,crown+22.5,h-.5])for(const side of [-1,1]) {
      r.box('silverFacade',x,y,z+side*cd/2,cw,1.15,1.25,'open pale crown horizontal frame');
      r.box('silverFacade',x+side*cw/2,y,z,1.25,1.15,cd,'open pale crown horizontal frame');
    }
  }
  r.metadata.approximation='White lattice facade and open lantern crown corrected from exterior photo; three towers follow actual OSM centres and footprints, main tower north of two side towers; podium16m height remains approximate';
  return r;
}

function parkview(o) {
  const r=new Recipe('侨福芳草地 · Parkview Green');
  r.box('stoneDark',0,1.5,0,156,3,132,'retail plinth');
  // Architect-attributed section: the low eave is elevated, not at street level.
  // Four terraced buildings remain entirely inside the sloping climate envelope.
  const roofY=z=>55-z*58/132;
  for(const [cx,cz,base] of [[-38,-31,56],[38,-31,56],[-38,34,25],[38,34,25]]) {
    r.box('glassDark',cx,base/2,cz,48,base,43,'interior mixed-use tower base');
    bands(r,48,43,base,o.detail===0?10:5,cx,cz,'metal');
    for(let j=0;j<4;j++) {
      const z=cz-21.5+(j+.5)*43/4,top=Math.min(cz<0?79:49,roofY(z+43/8)-4),hh=top-base;
      if(hh>0)r.box('glassDark',cx,base+hh/2,z,48,hh,43/4+.03,'interior upper terrace fitted below roof');
      r.box('foliage',cx,top+.12,z,43,.24,1.7,'internal terrace planting strip');
      if(o.detail>0)for(let y=base+4;y<top;y+=4)r.box('metal',cx,y,z+43/8+.04,48,.20,.15,'terraced upper floor band');
    }
  }
  const v=[-78,0,66,78,0,66,78,0,-66,-78,0,-66,-78,26,66,78,26,66,78,84,-66,-78,84,-66];
  const walls=[0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0];
  r.add({type:'mesh',vertices:v,indices:walls},'glassEnvelope',[0,0,0],[1,1,1],[0,0,0],'sloping microclimatic glass enclosure');
  r.add({type:'mesh',vertices:v,indices:[4,7,6,4,6,5]},'etfeMembrane',[0,0,0],[1,1,1],[0,0,0],'sloping translucent ETFE climate roof');
  for(const [a,b] of [[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],[7,4]])beam(r,'metal',v.slice(a*3,a*3+3),v.slice(b*3,b*3+3),.65,'envelope perimeter steel');
  for(const side of [-1,1]) {
    const x=side*78;
    for(let j=0;j<6;j++) {
      const z0=-66+j*22,z1=z0+22,h0=roofY(z0),h1=roofY(z1);
      beam(r,'metal',[x,0,z0],[x,h0,z0],.40,'side facade vertical truss');
      beam(r,'metal',[x,0,z0],[x,h1,z1],.55,'side facade diagonal exoskeleton');
      beam(r,'metal',[x,h0,z0],[x,0,z1],.55,'side facade diagonal exoskeleton');
    }
    for(const y of [22,44,66]) {
      const end=Math.min(66,(55-y)*132/58);
      if(end>-66)beam(r,'metal',[x,y,-66],[x,y,end],.35,'side facade horizontal truss');
    }
  }
  for(const z of [-66,66]) {
    const h=roofY(z);
    for(let i=0;i<6;i++) {
      const x0=-78+i*26,x1=x0+26;
      beam(r,'metal',[x0,0,z],[x1,h,z],.48,'end facade diagonal exoskeleton');
      beam(r,'metal',[x0,h,z],[x1,0,z],.48,'end facade diagonal exoskeleton');
    }
  }
  const n=o.detail===0?5:9,m=o.detail===0?5:9;
  for(let j=0;j<=n;j++) {
    const z=-66+j*132/n,y=roofY(z)+.22;
    beam(r,'metal',[-78,y,z],[78,y,z],.27,'ETFE roof cross seam');
  }
  for(let i=0;i<=m;i++) {
    const x=-78+i*156/m;beam(r,'metal',[x,84.22,-66],[x,26.22,66],.27,'ETFE roof longitudinal seam');
  }
  if(o.detail>0)for(let j=0;j<n;j++)for(let i=0;i<m;i++) {
    const x0=-78+i*156/m,x1=x0+156/m,z0=-66+j*132/n,z1=z0+132/n;
    beam(r,'metal',[x0,roofY(z0)+.25,z0],[x1,roofY(z1)+.25,z1],.18,'ETFE triangular cushion seam');
  }
  for(const y of [12,24])r.box('vermilionDark',0,y,4,116,1.4,4,'red internal atrium bridge');
  for(const x of [-78,78])r.cylinder('metal',x,86,-66,.18,4,'two high-corner finials',8);
  return r;
}

export function registerModernLandmarks(register) {
  register('peoples_daily','人民日报社新媒体大厦',179.7,peoplesDaily);
  register('beijing_tv','北京电视中心',239,beijingTV);
  register('yintai_center','北京银泰中心',250,yintai);
  register('parkview_green','侨福芳草地',88,parkview);
}
