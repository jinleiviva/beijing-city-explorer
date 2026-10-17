import {Recipe} from './geometry.js';
/** Photo-constrained approximation of three terracotta-clad curved supports.
 * The architect describes an ellipsoid cut by three hyperboloids. The exact
 * section functions and support bearings are not published in our source pack.
 * These sampled surfaces reproduce that topology, not an engineering model.
 */
export const PEOPLES_DAILY_MATERIALS={
 dailyTerracotta:{color:'#d9d8c9',roughness:.72,metalness:.015},
 dailyTerracottaJoint:{color:'#b3b5af',roughness:.86,metalness:0},
 dailyGlass:{color:'#72939e',roughness:.48,metalness:.10},
 dailyMullion:{color:'#abb9b9',roughness:.65,metalness:.06},
};
const H=179.7,GLASS_TOP=151,AXIS=.0925;
const centres=[-Math.PI/2,Math.PI/6,Math.PI*5/6];
function mesh(){return{type:'mesh',vertices:[],indices:[]};}
function add(g,p){const i=g.vertices.length/3;g.vertices.push(...p);return i;}
function quad(g,a,b,c,d){g.indices.push(a,b,c,a,c,d);}
function rad(y){const t=Math.max(0,Math.min(1,y/H));return Math.max(.003,Math.sqrt(Math.max(0,1-t**4)))*(.93+.07*Math.sin(Math.PI*t));}
function half(y){return (.27+.055*(y/H)**3+.71*(y/H)**15);}
function pt(y,a,inset=0){
 const k=rad(y),lobed=1+.075*Math.cos(3*(a+Math.PI/2)),factor=Math.max(.18,1-inset/(31*k));
 const x=47.25*k*lobed*Math.cos(a)*factor,z=29.05*k*lobed*Math.sin(a)*factor;
 return[x*Math.cos(AXIS)-z*Math.sin(AXIS),y,x*Math.sin(AXIS)+z*Math.cos(AXIS)];
}
// Four outward faces around a curved support strip, plus actual end caps.
function support(index,ny,na){
 const g=mesh(),rows=[],c=centres[index];
 for(let j=0;j<=ny;j++){
  const y=H*j/ny,w=half(y),outer=[],inner=[];
  for(let k=0;k<=na;k++){const a=c-w+2*w*k/na;outer.push(add(g,pt(y,a)));inner.push(add(g,pt(y,a,2.25)));}
  rows.push({outer,inner});
 }
 for(let j=0;j<ny;j++){
  const a=rows[j],b=rows[j+1];
  for(let k=0;k<na;k++){
   quad(g,a.outer[k],b.outer[k],b.outer[k+1],a.outer[k+1]);
   quad(g,a.inner[k+1],b.inner[k+1],b.inner[k],a.inner[k]);
  }
  quad(g,a.inner[0],b.inner[0],b.outer[0],a.outer[0]);
  quad(g,a.outer[na],b.outer[na],b.inner[na],a.inner[na]);
 }
 const bottom=rows[0],top=rows.at(-1);
 for(let k=0;k<na;k++){
  quad(g,bottom.outer[k],bottom.outer[k+1],bottom.inner[k+1],bottom.inner[k]);
  quad(g,top.inner[k],top.inner[k+1],top.outer[k+1],top.outer[k]);
 }
 return g;
}
function angleAt(side,y,u){const a=centres[side],b=centres[(side+1)%3]+(side===2?2*Math.PI:0),w=half(y);return a+w+(b-a-2*w)*u;}
function glassPoint(side,y,u,offset=0){return pt(y,angleAt(side,y,u),.40-offset);}
function surfaceQuad(g,a,b,c,d){quad(g,add(g,a),add(g,b),add(g,c),add(g,d));}
export function peoplesDailyRefined(o={}){
 const far=o.lod==='silhouette',near=!far&&o.detail>0,ny=far?18:near?38:26,na=far?6:near?14:9,ng=far?10:near?24:16;
 const r=new Recipe('人民日报社新媒体大厦 · Three curved terracotta supports',{
  approx:true,architecturalHeight:H,occupiedHeight:144,cladding:'Glazed terracotta, based on design team publication; local original material',
  primarySources:['https://www.seu.edu.cn/english/2016/0419/c34221a156192/page.htm','https://rsc.seu.edu.cn/rsc_en/2016/0219/c22025a145194/page.htm'],
  exteriorSupportCount:3,plan:'Rounded triangular plan, elongated approximately east-west',
  approximation:'Three curved supports and three convex glazed faces follow the architect-described topology. Exact support azimuths, section curvature, glazing top151m and panel spacing are photographic approximations, not measured structural geometry. Outer major-axis bearing95.3deg follows mapped footprint;179.7m total and144m occupied height follow CTBUH.',
  crownOpeningHeightApprox:H-GLASS_TOP,sourceOsmId:'osm-way-786151472',
 });
 // No fictitious rectangular full-site podium: low entrance landing only.
 r.box('stoneLight',0,.32,0,72,.64,49,'low media building entrance landing');
 for(let i=0;i<3;i++)r.add(support(i,ny,na),'dailyTerracotta',[0,0,0],[1,1,1],[0,0,0],`curved terracotta exterior support ${i+1}`);
 const glass=mesh(),grid=mesh(),joints=mesh();
 for(let side=0;side<3;side++){
  for(let j=0;j<ny;j++)for(let k=0;k<ng;k++){
   const y0=.65+(GLASS_TOP-.65)*j/ny,y1=.65+(GLASS_TOP-.65)*(j+1)/ny,u=k/ng,v=(k+1)/ng;
   surfaceQuad(glass,glassPoint(side,y0,u),glassPoint(side,y1,u),glassPoint(side,y1,v),glassPoint(side,y0,v));
  }
  // Top glazing is a recessed horizontal technical roof below the open crown.
  const centre=add(glass,[0,GLASS_TOP,0]);
  for(let k=0;k<ng;k++)glass.indices.push(centre,add(glass,glassPoint(side,GLASS_TOP,(k+1)/ng)),add(glass,glassPoint(side,GLASS_TOP,k/ng)));
  const floors=far?12:33,cols=far?5:near?20:11;
  for(let j=1;j<=floors;j++)for(let k=0;k<ng;k++){
   const y=GLASS_TOP*j/floors,dy=far?.34:.15;
   surfaceQuad(grid,glassPoint(side,y-dy,k/ng,.08),glassPoint(side,y,k/ng,.08),glassPoint(side,y,(k+1)/ng,.08),glassPoint(side,y-dy,(k+1)/ng,.08));
  }
  for(let k=1;k<cols;k++)for(let j=0;j<ny;j++){
   const y0=.8+(GLASS_TOP-.8)*j/ny,y1=.8+(GLASS_TOP-.8)*(j+1)/ny,u=k/cols,du=far?.003:.0017;
   surfaceQuad(grid,glassPoint(side,y0,u-du,.08),glassPoint(side,y1,u-du,.08),glassPoint(side,y1,u+du,.08),glassPoint(side,y0,u+du,.08));
  }
 }
 r.add(glass,'dailyGlass',[0,0,0],[1,1,1],[0,0,0],'three convex glazed facades below open crown');
 r.add(grid,'dailyMullion',[0,0,0],[1,1,1],[0,0,0],'curved glazing horizontal floor bands and vertical mullions');
 if(!far){
  for(let side=0;side<3;side++){
   const c=centres[side];
   for(let y=9;y<170;y+=near?4.5:9)for(let k=0;k<na;k++){
    const a=c-half(y)+2*half(y)*k/na,b=c-half(y)+2*half(y)*(k+1)/na;
    surfaceQuad(joints,pt(y-.065,a,-.04),pt(y+.065,a,-.04),pt(y+.065,b,-.04),pt(y-.065,b,-.04));
   }
   if(near)for(let i=1;i<8;i++)for(let j=0;j<ny;j++){
    const y0=H*j/ny,y1=H*(j+1)/ny,u=-1+2*i/8,d=.0012;
    surfaceQuad(joints,pt(y0,c+half(y0)*u-d,-.04),pt(y1,c+half(y1)*u-d,-.04),pt(y1,c+half(y1)*u+d,-.04),pt(y0,c+half(y0)*u+d,-.04));
   }
  }
  r.add(joints,'dailyTerracottaJoint',[0,0,0],[1,1,1],[0,0,0],'restrained terracotta baguette panel joints');
 }
 return r;
}
