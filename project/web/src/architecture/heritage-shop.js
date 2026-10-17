/** Photo-researched Yandai Xiejie shopfront modules; all geometry original. */
import {Recipe,GABLE_ROOF,HIP_ROOF,beam,seededRandom} from './geometry.js';
import {addMappedHeritageRoof} from './frontage-roof.js';

function tiledRoof(r,w,d,y,rise,detail,rotation=0,coarse=false) {
  r.add(GABLE_ROOF,'roofGrey',[0,y,0],[w,rise,d],[0,rotation,0],'heritage swept grey-tile roof');
  const local=new Recipe('roof tile detail');
  local.box('roofGreyRidge',0,y+rise+.065,0,w+.08,.13,.21,'rounded grey ridge cap');
  if(detail>0) {
    const n=coarse?Math.min(10,Math.max(6,Math.round(w/.85))):Math.min(detail>1?42:30,Math.max(12,Math.round(w/.28)));
    for(let i=0;i<=n;i++) {
      const x=-w*.49+i*w*.98/n;
      for(const sign of [-1,1]) {
        const pts=[[x,y+rise+.025,0],[x,y+rise*.48,sign*d*.2],[x,y+.025,sign*d*.43],[x,y+rise*.08+.025,sign*d*.5]];
        for(let j=0;j<3;j++){beam(local,i%4===0?'roofGreyRidge':'roofGreyLight',pts[j],pts[j+1],coarse?.038:.029,coarse?'coarse grey-tile roll':'individual grey-tile roll');if(coarse){const p=local.parts.at(-1);p.geometry={type:'box'};p.scale[0]*=2;p.scale[2]*=2;}}
        if(!coarse)local.sphere('roofGreyRidge',x,y+rise*.08+.025,sign*(d*.5+.012),.045,.045,.035,'semicircular eave tile end');
      }
    }
  }
  r.merge(local,[0,0,0],rotation);
}
function border(r,x,y,z,w,h,color='bronze',th=.045) {
  for(const sx of [-1,1])r.box(color,x+sx*w/2,y,z,th,h+.02,.045,'signboard carved border');
  for(const sy of [-1,1])r.box(color,x,y+sy*h/2,z,w,th,.045,'signboard carved border');
}
function latticePanel(r,x,y,z,w,h,detail,pattern) {
  r.box('shopGlass',x,y,z,w,h,.09,'recessed dark shop window');
  if(detail===0)return;
  const vertical=pattern?4:3,horizontal=pattern?3:2;
  for(let i=0;i<=vertical;i++)r.box('paintedWood',x-w/2+i*w/vertical,y,z+.07,.045,h,.065,'wood lattice vertical');
  for(let j=0;j<=horizontal;j++)r.box('paintedWood',x,y-h/2+j*h/horizontal,z+.075,w,.045,.065,'wood lattice horizontal');
  if(pattern) {
    const s=Math.min(w*.25,h*.22),cy=y+.05;
    const p=[[x,cy+s,z+.12],[x+s,cy,z+.12],[x,cy-s,z+.12],[x-s,cy,z+.12]];
    for(let i=0;i<4;i++)beam(r,'timber',p[i],p[(i+1)%4],.023,'central diamond window lattice');
  }
}

export function heritageShop(options={}) {
  const w=Math.max(4,options.width??6.8),d=Math.max(5,options.depth??8.6),h=Math.max(4,options.height??5.3);
  const seed=options.seed??1,random=seededRandom(seed),detail=options.lod==='silhouette'?0:options.detail==='high'?2:options.detail==='low'?0:Math.max(0,Math.min(2,options.detail??1));
  const coarse=options.tileDetail==='coarse';
  const variant=(options.variant??Math.floor(random()*4))%4,front=d/2,roofRise=Math.min(1.8,h*.29),wallH=h-roofRise;
  const r=new Recipe('烟袋斜街灰瓦店铺 · Heritage hutong shop',{family:'heritage_shop',width:w,depth:d,height:h,seed,variant,detail,tileDetail:coarse?'coarse':'full',approx:true,sourceReference:'docs/geography/street-references/yandai_xiejie.jpg'});
  const post=variant===0||variant===3?'vermilionDark':'paintedWood';
  // The entire shop front is a recessed open structural bay, rather than windows
  // painted onto a solid street-facing box. Adjacent units form a continuous wall.
  r.box('greyBrick',0,wallH/2,-.5,w,wallH,d-1,'grey-brick rear shop volume');
  for(const side of [-1,1])r.box('greyBrick',side*(w/2-.18),wallH/2,front-.43,.36,wallH,.86,'solid grey-brick street pier');
  r.box('stoneDark',0,.17,0,w+.08,.34,d+.08,'worn stone shop footing');
  r.box('shopGlass',0,1.6,front-.38,w-.7,2.75,.08,'recessed shadow behind timber shopfront');
  const bays=w<5.2?3:w<8.3?4:5,bw=(w-.78)/bays,door=variant===1?bays-2:Math.floor(bays/2),panelH=Math.min(1.65,wallH*.43),panelY=.95+panelH/2;
  for(let i=0;i<bays;i++) {
    const x=-(w-.78)/2+(i+.5)*bw;
    if(i===door) {
      r.box('paintedWood',x,.28,front-.1,bw*.91,.16,.36,'raised timber door threshold');
      r.box('stoneLight',x,.10,front+.27,bw*1.18,.20,.63,'stone entrance step');
      if(detail>0) {
        for(const side of [-1,1]) {
          const xx=x+side*bw*.39;
          r.box(post,xx,1.47,front-.1,bw*.16,2.4,.12,'folded timber door leaf');
          r.box('bronze',xx-side*.04,1.36,front+.005,.045,.23,.045,'bronze door handle');
        }
        r.box('stoneDark',x,.055,front+.65,bw*1.35,.11,.25,'worn outer doorstep');
      }
    } else {
      r.box('timber',x,.59,front-.09,bw-.13,.75,.12,'solid lower timber shop panel');
      if(detail>0)border(r,x,.59,front-.015,bw-.28,.49,'paintedWood',.035);
      latticePanel(r,x,panelY,front-.11,bw-.13,panelH,detail,(i+variant)%2);
    }
  }
  for(let i=0;i<=bays;i++) {
    const x=-(w-.78)/2+i*bw;
    r.box(post,x,wallH*.47,front+.035,.14,wallH*.94,.20,'streetfront timber post');
    if(detail>0)r.box('stoneLight',x,.23,front+.035,.22,.25,.27,'small stone post foot');
  }
  r.box(post,0,wallH-.37,front+.08,w-.45,.22,.22,'thick timber lintel');
  r.box('paintedWood',0,wallH-.08,front+.22,w+.12,.19,.58,'deep shadowed eave fascia');
  r.box('timber',0,wallH-.25,front+.18,w+.04,.12,.48,'lower projecting eave course');
  const signY=Math.min(wallH-.69,3.12),signW=w*(variant===2?.76:.67),signH=Math.min(.58,h*.11),signZ=front+.16;
  r.box('signDark',0,signY,signZ,signW,signH,.13,'blank timber shop-name board');
  if(detail>0)border(r,0,signY,signZ+.09,signW-.10,signH-.08,variant===3?'vermilion':'bronze');
  r.metadata.signPanels=[{position:[0,signY,signZ+.12],width:signW-.18,height:signH-.12,rotation:[0,0,0],normal:[0,0,1]}];
  r.metadata.lanternHooks=[];
  if(detail>0) {
    const n=Math.max(12,Math.round(w/.3));
    for(let i=0;i<=n;i++)r.box('timber',-w*.48+i*w*.96/n,wallH-.035,front+.39,.07,.11,.26,'exposed eave rafter tail');
    for(const side of [-1,1]) {
      const x=side*w*.39,y=wallH-.24;
      beam(r,'metalDark',[x,y,front+.16],[x,y,front+.66],.025,'lantern suspension arm');
      r.cylinder('metalDark',x,y-.16,front+.64,.02,.32,'lantern hanging hook',6);
      r.metadata.lanternHooks.push({position:[x,y-.32,front+.64],radius:.22});
      for(let j=0;j<Math.min(11,Math.floor(wallH/.25));j++)r.box('greyBrickDark',side*(w/2-.18),.48+j*.25,front+.012,.34,.018,.024,'brick pier horizontal mortar joint');
    }
  }
  if(variant===0) {
    tiledRoof(r,w+.18,d+.82,wallH,roofRise,detail,0,coarse);
  } else if(variant===1) {
    // Hard-gable parapet walls rise just above the grey tiles at the two ends.
    tiledRoof(r,w-.25,d+.72,wallH,roofRise*.92,detail,0,coarse);
    for(const side of [-1,1]) {
      const x=side*(w/2-.03),n=8;
      for(let j=0;j<n;j++) {
        const z=-d/2+(j+.5)*d/n,t=Math.abs(z/(d/2)),top=wallH+roofRise*(1-t)*.95+.17;
        r.box('greyBrick',x,(wallH+top)/2,z,.23,top-wallH,d/n+.02,'stepped hard-gable firewall');
        r.box('stoneDark',x,top+.035,z,.30,.07,d/n+.08,'hard-gable stone coping');
      }
    }
  } else if(variant===2) {
    // A low tile roof is concealed behind a modest stepped shop-front parapet.
    tiledRoof(r,w-.2,d-.3,wallH+.01,roofRise*.58,Math.min(detail,1),0,coarse);
    r.box('greyBrick',0,wallH+.23,front-.10,w,.62,.27,'streetfront brick parapet');
    r.box('greyBrick',0,wallH+.63,front-.10,w*.46,.42,.27,'raised central parapet panel');
    r.box('stoneDark',0,wallH+.90,front-.10,w*.49,.12,.37,'central parapet stone coping');
    for(const side of [-1,1])r.box('stoneDark',side*w*.365,wallH+.59,front-.10,w*.29,.12,.37,'lower parapet stone coping');
    if(detail>0)border(r,0,wallH+.44,front+.06,w*.33,.28,'greyBrickDark',.04);
  } else {
    // Front-facing gable with a narrow projecting canopy and exposed roof ridge.
    tiledRoof(r,d+.14,w+.16,wallH,roofRise,detail,Math.PI/2,coarse);
    r.add(HIP_ROOF,'roofGrey',[0,wallH-.48,front+.34],[w+.35,.45,1.32],[0,0,0],'small streetfront rain canopy');
    r.box('paintedWood',0,wallH-.49,front+.88,w+.28,.13,.16,'rain canopy dark fascia');
    if(detail>0)for(let j=0;j<4;j++) {
      const ww=w*.62*(1-j/4);
      r.box('greyBrickDark',0,wallH+.15+j*roofRise*.19,front+.03,ww,.035,.045,'front gable brick course');
    }
  }
  if(detail>1) {
    r.box('stoneDark',-w*.37,.26,front+.38,.43,.52,.43,'stone doorstep drum');
    r.cylinder('bronze',w*.38,.36,front+.4,.27,.72,'small shop-front ceramic vessel',16,.7);
  }
  addMappedHeritageRoof(r,options,w,d,h,variant);
  if(coarse){let rafters=0;r.parts=r.parts.filter(p=>!(/central diamond window lattice|signboard carved border|brick pier horizontal mortar joint/.test(p.label??''))&&(p.label!=='exposed eave rafter tail'||(rafters++%2===0)));}
  return r;
}
