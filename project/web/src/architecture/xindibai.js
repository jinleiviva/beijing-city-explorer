/** Xindibai / Di'anmen Mall: 2022 east-low / west-high renovation, approximate. */
import {Recipe,GABLE_ROOF,HIP_ROOF,beam} from './geometry.js';

function roof(r,cx,z,length,depth,y,rise,detail,label='grey-tile roof') {
  const q=new Recipe(label);
  q.add(GABLE_ROOF,'roofGrey',[0,y,0],[length,rise,depth],[0,0,0],label);
  q.box('roofGreyRidge',0,y+rise+.08,0,length,.18,.24,'rounded long roof ridge');
  if(detail>0) {
    const n=Math.min(80,Math.round(length/.72));
    for(let i=0;i<=n;i++)for(const s of [-1,1]) {
      const x=-length*.49+i*length*.98/n;
      beam(q,'roofGreyLight',[x,y+rise+.02,0],[x,y+.06,s*depth*.43],.038,'grey roof tile roll');
      beam(q,'roofGreyLight',[x,y+.06,s*depth*.43],[x,y+rise*.08+.03,s*depth*.5],.038,'kicked grey roof tile end');
    }
  }
  r.merge(q,[cx,0,z],Math.PI/2);
}

function facade(r,length,height,floors,detail,offset,angle,entrance=false) {
  const q=new Recipe('wood-lattice commercial frontage'),bay=5.0,count=Math.max(4,Math.round(length/bay)),bw=length/count;
  q.box('shopGlass',0,height*.5,.06,length-.4,height-.7,.18,'continuous recessed dark shop glazing');
  for(let f=0;f<floors;f++) {
    const y0=f*height/floors,h=height/floors;
    q.box('timber',0,y0+h-.24,.23,length,.42,.40,'dark timber floor cornice');
    for(let i=0;i<count;i++) {
      const x=-length/2+(i+.5)*bw;
      q.box('timber',x,y0+h*.5,.27,.22,h-.35,.30,'timber facade bay post');
      if(detail>0) {
        q.box('timber',x,y0+.45,.31,bw-.3,.55,.20,'wood lower window apron');
        for(const s of [-1,1])q.box('paintedWood',x+s*bw*.34,y0+h*.52,.38,.09,h*.68,.13,'wood lattice side mullion');
        for(const t of [.35,.66])q.box('paintedWood',x,y0+h*t,.40,bw-.45,.09,.13,'wood lattice horizontal');
        if(f>0) {
          q.box('stoneDark',x,y0+.76,.63,bw-.25,.10,.12,'second-floor balcony handrail');
          for(let j=0;j<5;j++)q.box('timber',x-bw*.38+j*bw*.19,y0+.42,.63,.065,.69,.08,'second-floor balcony spindle');
        }
      }
    }
  }
  for(let i=0;i<=count;i++) {
    const x=-length/2+i*bw;
    if(i%3===0||i===count) {
      q.box('greyBrick',x,height*.5,.40,.52,height,.54,'grey-brick vertical facade division');
      q.box('stoneDark',x,.27,.45,.70,.54,.66,'stone pier foot');
      if(detail>0)for(let j=1;j<8;j++)q.box('greyBrickDark',x,j*height/8,.68,.51,.035,.035,'grey brick pier course');
    }
  }
  q.box('paintedWood',0,height-.04,.46,length,.22,1.02,'deep grey-roof eave fascia');
  if(detail>0)for(let i=0;i<Math.round(length/.55);i++)q.box('timber',-length/2+.28+i*.55,height-.05,.90,.10,.18,.45,'projecting timber eave rafter');
  if(entrance) {
    const ew=length*.15;
    q.box('signDark',0,height*.64,.79,ew,1.35,.21,'Di an men mall blank entrance plaque');
    for(const s of [-1,1]) {
      q.box('greyBrick',s*(ew/2+.55),height*.5,.69,.95,height+.30,1.05,'tall paired entrance stone piers');
      q.box('stoneLight',s*(ew/2+.55),height*.39,1.25,1.13,.34,.16,'carved entrance pier capital');
    }
    q.box('vermilionDark',0,2.35,.30,ew-.25,4.7,.13,'recessed main entrance doors');
    for(let i=-2;i<=2;i++)q.box('metalDark',i*(ew-.8)/5,2.15,.43,.08,3.8,.10,'entrance door frame');
    q.box('stoneDark',0,.10,.95,ew+1,.20,1.55,'broad entrance threshold');
    q.add(HIP_ROOF,'roofGrey',[0,height+.08,.62],[ew+1.5,1.05,2.5],[0,0,0],'projecting entrance portico grey-tile hood');
    if(detail>0)for(let i=-3;i<=3;i++) {
      q.box('timber',i*ew/8,height-.46,.85,.18,.57,.75,'entrance timber bracket vertical');
      q.box('bronze',i*ew/8,height-.38,1.05,.65,.12,.20,'entrance simplified painted bracket');
    }
  }
  r.merge(q,offset,angle);
}

export function xindibai(options={}) {
  const w=Math.max(35,options.width??60),d=Math.max(45,options.depth??85),h=Math.max(13,options.height??19.5),detail=Math.max(0,Math.min(2,options.detail??1));
  const floor=h/4.6,low=2*floor,middle=3*floor,high=4*floor;
  const r=new Recipe('新地佰 · 地安门商场',{family:'xindibai',width:w,depth:d,height:h,detail,approx:true,frontFacing:'east',fixedGeographicOrientation:true,eastFloors:2,westFloors:4,source:'https://www.visitbeijing.com.cn/article/4B9SWu5iWru',approximationNote:'East two-storey facade and west four-storey terrace are documented; exact terrace setbacks and rear details are inferred from photos.'});
  // All three stepped volumes remain within the real supplied E-W / N-S footprint.
  r.box('greyBrick',0,low/2,0,w,low,d,'two-storey full-footprint commercial podium');
  r.box('greyBrick',-w*.18,(low+middle)/2,0,w*.64,middle-low,d*.94,'third-floor western setback');
  r.box('greyBrick',-w*.32,(middle+high)/2,-d*.035,w*.36,high-middle,d*.80,'fourth-floor west viewing wing');
  r.box('paving',w*.31,low+.12,0,w*.36,.24,d*.96,'east lower viewing terrace');
  r.box('paving',-w*.04,middle+.12,0,w*.22,.24,d*.89,'middle open viewing terrace');
  // Long grey rooflines parallel to Di'anmen Outer Street, broken into three bays.
  for(const [z,len,rise] of [[0,d*.38,h*.10],[-d*.335,d*.27,h*.085],[d*.335,d*.27,h*.085]])roof(r,w*.40,z,len,w*.20,low,rise,detail,'two-storey street-facing grey tile roof');
  roof(r,-w*.34,-d*.035,d*.78,w*.32,high,h*.12,detail,'four-storey western grey-tile roof');
  facade(r,d,low,2,detail,[w/2,0,0],Math.PI/2,true);
  facade(r,d*.79,high,4,detail,[-w/2,0,-d*.035],-Math.PI/2,false);
  // North and south returns disclose the stepped section without a tall blank wall.
  for(const side of [-1,1]) {
    const angle=side>0?0:Math.PI;
    facade(r,w,low,2,Math.min(detail,1),[0,0,side*(d/2+.02)],angle,false);
    facade(r,w*.64,middle-low,1,Math.min(detail,1),[-w*.18,low,side*d*.47],angle,false);
    facade(r,w*.36,high-middle,1,Math.min(detail,1),[-w*.32,middle,-d*.035+side*d*.40],angle,false);
  }
  // The lakeside terraces are open, with thin balustrades rather than solid roofs.
  for(const [x,y,zz,len] of [[w*.17,low,0,d*.92],[-w*.15,middle,0,d*.86],[-w*.48,high,-d*.035,d*.78]]) {
    r.box('metalDark',x,y+1.03,zz,.10,.10,len,'open terrace long handrail');
    if(detail>0)for(let i=0;i<=Math.ceil(len/3);i++)r.box('metalDark',x,y+.54,zz-len/2+i*len/Math.ceil(len/3),.075,1.08,.075,'terrace slender railing upright');
    if(detail>0)for(const s of [-1,1]) {
      r.box('stoneDark',x-1.3,y+.30,zz+s*len*.35,1.4,.60,3.5,'terrace rectangular planter');
      r.box('foliage',x-1.3,y+.69,zz+s*len*.35,1.15,.35,3.20,'terrace clipped planting');
    }
  }
  r.metadata.signPanels=[{position:[w/2+.83,low*.64,0],width:d*.15-.2,height:1.15,rotation:[0,Math.PI/2,0],normal:[1,0,0]}];
  return r;
}
