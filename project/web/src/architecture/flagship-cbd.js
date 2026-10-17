/** Photo-researched flagship CBD forms; all geometry original and approximate. */
import {Recipe,BOX,loftGeometry,rectangleRing,beam as cylindricalBeam} from './geometry.js';
// Facade fins and steel bracing have rectangular sections, not 12-sided pipes.
// This is more faithful and reduces their triangle count by four times.
function beam(r,material,a,b,radius,label) {
 cylindricalBeam(r,material,a,b,radius,label);
 const p=r.parts[r.parts.length-1];p.geometry=BOX;p.scale[0]*=2;p.scale[2]*=2;
}

function roundSquare(width,corner=.16,steps=5) {
 const half=width/2,rr=width*corner,pts=[];
 for(let k=0;k<4;k++) {
  const centers=[[half-rr,-half+rr],[half-rr,half-rr],[-half+rr,half-rr],[-half+rr,-half+rr]],start=-Math.PI/2+k*Math.PI/2;
  for(let j=0;j<=steps;j++){const a=start+j*Math.PI/(2*steps);pts.push([centers[k][0]+rr*Math.cos(a),centers[k][1]+rr*Math.sin(a)]);}
 }
 return pts;
}
function meshFromRings(rings,capBottom=false,capTop=false) {
 const n=rings[0].length,vertices=rings.flat(2),indices=[];
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++) {
  const a=j*n+i,b=(j+1)*n+i,c=(j+1)*n+(i+1)%n,d=j*n+(i+1)%n;indices.push(a,b,c,a,c,d);
 }
 if(capBottom)for(let i=1;i<n-1;i++)indices.push(0,i,i+1);
 if(capTop){const b=(rings.length-1)*n;for(let i=1;i<n-1;i++)indices.push(b,b+i+1,b+i);}
 return{type:'mesh',vertices,indices};
}

export function chinaZunRefined(o) {
 const r=new Recipe('中国尊 · CITIC Tower'),far=o.lod==='silhouette',rows=far?12:o.detail===0?18:30,cornerSteps=far?3:5;
 const width=t=>t<.48?54+24*Math.pow(1-t/.48,2):54+15*Math.pow((t-.48)/.52,1.9);
 const ringAt=(t,offset=0)=>roundSquare(width(t)+offset,.17,cornerSteps).map(([x,z])=> {
  const w=width(t),corner=Math.min(1,Math.pow(Math.min(Math.abs(x),Math.abs(z))/(w*.32),2));
  // The vase lip rises at its rounded corners, while its centre bows down.
  const crownDip=6*(1-corner)*Math.pow(t,22),entryLift=12*(1-corner)*Math.exp(-t*140);
  return[x,528*t-crownDip+entryLift,z];
 });
 const rings=[];for(let j=0;j<=rows;j++)rings.push(ringAt(j/rows));
 r.add(meshFromRings(rings,false,false),'zunGlass',[0,0,0],[1,1,1],[0,0,0],'rounded flared zun-shaped curtain wall');
 // A genuinely recessed crown, with no opaque square cap over the lip.
 const lip=ringAt(1,.30),inner=lip.map(([x,y,z])=>[x*.975,y-.30,z*.975]),floor=inner.map(([x,y,z])=>[x*.94,516,z*.94]);
 r.add(meshFromRings([lip,inner,floor],false,true),'silverFacade',[0,0,0],[1,1,1],[0,0,0],'curved open vase-mouth crown with recessed roof');
 r.box('zunDark',0,515.8,0,52,.25,52,'deep recessed crown mechanical deck');
 const bottom=ringAt(0,.25),skirtInner=bottom.map(([x,y,z])=>[x*.965,y+.45,z*.965]);
 r.add(meshFromRings([bottom,skirtInner]),'silverFacade',[0,0,0],[1,1,1],[0,0,0],'flared and arched lower entrance skirt');
 r.add(loftGeometry([{y:.7,points:roundSquare(58,.13,4)},{y:16,points:roundSquare(58,.13,4)}]),'glassPale',[0,0,0],[1,1,1],[0,0,0],'recessed transparent entrance pavilion');
 // Seven mechanically screened storey groups are visibly darker, but only the
 // middle of each facade is opaque; the vertical silver ribs continue over them.
 for(const y of [82,151,225,300,375,449,494]) {
  const w=width(y/528),bw=w*.52;
  for(const side of [-1,1]) {
   r.box('zunDark',0,y,side*(w/2+.08),bw,6.2,.14,'dark mechanical ventilation storey');
   r.box('zunDark',side*(w/2+.08),y,0,.14,6.2,bw,'dark mechanical ventilation storey');
  }
 }
 if(far) {
  // At city scale retain the silver vertical reading, not only black ventilation
  // dashes. All far fins share one thin mesh, rather than hundreds of draw parts.
  const vertices=[],indices=[];
  for(let side=0;side<4;side++)for(let k=0;k<=9;k++) {
   const u=-.32+.64*k/9,a=side*Math.PI/2,tx=Math.cos(a)*.45,tz=-Math.sin(a)*.45;
   const points=[];
   for(let j=0;j<=rows;j++) {
    const t=j/rows,w=width(t)+.5,x=u*w,z=w/2,corner=Math.min(1,Math.pow(Math.abs(x)/(w*.32),2));
    points.push([x*Math.cos(a)+z*Math.sin(a),528*t-6*(1-corner)*Math.pow(t,22)+12*(1-corner)*Math.exp(-t*140),-x*Math.sin(a)+z*Math.cos(a)]);
   }
   for(let j=0;j<rows;j++) {
    const p=points[j],q=points[j+1],base=vertices.length/3;
    vertices.push(p[0]-tx,p[1],p[2]-tz,p[0]+tx,p[1],p[2]+tz,q[0]+tx,q[1],q[2]+tz,q[0]-tx,q[1],q[2]-tz);
    indices.push(base,base+1,base+2,base,base+2,base+3);
   }
  }
  r.add({type:'mesh',vertices,indices},'silverFacade',[0,0,0],[1,1,1],[0,0,0],'silhouette silver vertical fin ribbons');
 }
 if(!far) {
  const ribCount=o.detail===0?9:o.detail===2?21:15;
  for(let side=0;side<4;side++)for(let k=0;k<=ribCount;k++) {
   const u=-.32+.64*k/ribCount,a=side*Math.PI/2;
   for(let j=0;j<rows;j++) {
    const pts=[j,j+1].map(jj=> {
     const t=jj/rows,w=width(t)+.5,xx=u*w,zz=w/2,corner=Math.min(1,Math.pow(Math.abs(xx)/(w*.32),2));
     const yy=528*t-6*(1-corner)*Math.pow(t,22)+12*(1-corner)*Math.exp(-t*140);
     return[xx*Math.cos(a)+zz*Math.sin(a),yy,-xx*Math.sin(a)+zz*Math.cos(a)];
    });
    beam(r,'silverFacade',pts[0],pts[1],o.detail===0?.22:.26,'continuous silver facade rib');
   }
  }
  // Corner ribs follow the true rounded-square profile rather than a sharp box.
  for(let k=0;k<rings[0].length;k+=2)for(let j=0;j<rows;j++)beam(r,'silverFacade',rings[j][k],rings[j+1][k],.19,'curved corner silver facade rib');
  const step=o.detail===0?28:12;
  for(let y=22;y<514;y+=step) {
   const w=width(y/528),span=w*.65;
   for(const side of [-1,1]) {
    r.box('glassMullion',0,y,side*(w/2+.04),span,.14,.10,'fine curtain-wall floor joint');
    r.box('glassMullion',side*(w/2+.04),y,0,.10,.14,span,'fine curtain-wall floor joint');
   }
  }
  for(const side of [-1,1])for(const u of [-20,0,20]) {
   r.box('silverFacade',u,7.2,side*28.8,.24,13,.26,'entrance pavilion vertical mullion');
   r.box('silverFacade',side*28.8,7.2,u,.26,13,.24,'entrance pavilion side mullion');
  }
 }
 r.box('stoneLight',0,.35,0,91,.70,91,'plaza plinth');
 r.metadata.referenceFeatures=['rounded-square vase profile','corner-raised open crown','seven dark equipment storeys','silver vertical fins','arched flaring lobby skirt'];
 return r;
}

function prism(r,base,top,w,d,detail,label,bridge=false,far=false) {
 const ring=(p)=>({y:p[1],points:rectangleRing(w,d,0).filter((_,i)=>i%2===0).map(([x,z])=>[x+p[0],z+p[2]])});
 const geom=loftGeometry([ring(base),ring(top)]);geom.flatShading=true;
 r.add(geom,'cctvGlass',[0,0,0],[1,1,1],[0,0,0],label);
 const levels=far?(bridge?1:4):bridge?2:detail===0?6:9;
 const faces=[[[-w/2,-d/2],[w/2,-d/2],[0,-1]],[[w/2,-d/2],[w/2,d/2],[1,0]],[[w/2,d/2],[-w/2,d/2],[0,1]],[[-w/2,d/2],[-w/2,-d/2],[-1,0]]];
 const at=(e,t,u,off=.16)=>[base[0]+(top[0]-base[0])*t+e[0][0]+(e[1][0]-e[0][0])*u+e[2][0]*off,base[1]+(top[1]-base[1])*t,base[2]+(top[2]-base[2])*t+e[0][1]+(e[1][1]-e[0][1])*u+e[2][1]*off];
 for(const edge of faces) {
  const length=Math.hypot(edge[1][0]-edge[0][0],edge[1][1]-edge[0][1]),cols=far?(bridge?Math.max(2,Math.round(length/45)):2):bridge?Math.max(2,Math.round(length/20)):3;
  for(let j=0;j<levels;j++) {
   const t0=j/levels,t1=(j+1)/levels;
   for(let i=0;i<cols;i++) {
    beam(r,'cctvSteel',at(edge,t0,i/cols),at(edge,t1,(i+1)/cols),far?.65:.34,far?'CCTV silhouette diagonal frame':'continuous CCTV exterior structural diagonal');
    beam(r,'cctvSteel',at(edge,t1,i/cols),at(edge,t0,(i+1)/cols),far?.65:.34,far?'CCTV silhouette diagonal frame':'continuous CCTV exterior structural diagonal');
    // Denser diagonal cells at the stressed tower-to-overhang transition.
    if(!far&&detail>0&&(bridge||j>=levels-2||j===0)) {
     const tm=(t0+t1)/2,um=(i+.5)/cols;
     beam(r,'cctvSteel',at(edge,t0,um),at(edge,tm,(i+1)/cols),.23,'denser transition-zone secondary diagonal');
     beam(r,'cctvSteel',at(edge,tm,i/cols),at(edge,t1,um),.23,'denser transition-zone secondary diagonal');
     beam(r,'cctvSteel',at(edge,t1,um),at(edge,tm,(i+1)/cols),.23,'denser transition-zone secondary diagonal');
     beam(r,'cctvSteel',at(edge,tm,i/cols),at(edge,t0,um),.23,'denser transition-zone secondary diagonal');
    }
   }
  }
  if(!far&&detail>0) {
   const n=Math.max(8,Math.round(length/3.1));
   for(let i=1;i<n;i++)beam(r,'glassMullion',at(edge,0,i/n,.08),at(edge,1,i/n,.08),.055,'fine curtain-wall vertical mullion');
   const floors=Math.round((top[1]-base[1])/4.8);
   for(let j=1;j<floors;j++)beam(r,'glassMullion',at(edge,j/floors,0,.08),at(edge,j/floors,1,.08),.045,'fine curtain-wall floor joint');
  }
 }
 if(bridge&&!far) {
  // The underside is also part of the continuous tube: never leave it blank.
  const y=base[1]-.12,n=Math.max(3,Math.round(w/18));
  for(let i=0;i<n;i++) {
   const x0=base[0]-w/2+i*w/n,x1=x0+w/n;
   beam(r,'cctvSteel',[x0,y,base[2]-d/2],[x1,y,base[2]+d/2],.30,'cantilever underside diagonal');
   beam(r,'cctvSteel',[x1,y,base[2]-d/2],[x0,y,base[2]+d/2],.30,'cantilever underside diagonal');
  }
 }
}
export function cctvRefined(o) {
 const r=new Recipe('中央电视台总部 · CCTV Headquarters'),far=o.lod==='silhouette';
 r.box('stone',0,3,0,190,6,160,'broadcasting podium');
 r.box('cctvGlass',-25,12,20,145,18,94,'broadcast production base');
 prism(r,[-55,6,38],[-32,198,12],52,54,o.detail,'inclined southwest tower',false,far);
 prism(r,[57,6,-33],[34,234,-18],48,58,o.detail,'inclined northeast tower',false,far);
 prism(r,[-31,180,-15],[-26,218,-15],50,108,o.detail,'southwest cantilever arm',true,far);
 prism(r,[4,193,-42],[4,234,-42],109,53,o.detail,'upper cantilever connecting arm',true,far);
 r.cylinder('cctvSteel',34,234.12,-18,9.5,.24,'rooftop helipad',far?16:32);
 if(!far&&o.detail>0) {
  r.box('glassPale',-35,7.5,68,46,.35,13,'south production lobby canopy');
  for(const x of [-56,-35,-14])r.cylinder('cctvSteel',x,3.7,71,.20,7.4,'south canopy support',8);
 }
 r.metadata.referenceFeatures=['two leaning towers','three-dimensional continuous loop','all-face and underside diagonal tube grid','denser transition bracing','grey fritted glass curtain wall'];
 return r;
}
