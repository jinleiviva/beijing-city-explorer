/** Contemporary Beijing commercial street architecture, researched from real frontage photos. */
import {Recipe,CHAMFER_BOX,CYLINDER,beam,seededRandom} from './geometry.js';

function choose(o,defaults) {
 const detail=o.detail==='high'?2:o.detail==='low'?0:Math.max(0,Math.min(2,o.detail??1));
 return {...defaults,...o,detail,width:Math.max(4,o.width??defaults.width),depth:Math.max(3,o.depth??defaults.depth),height:Math.max(3,o.height??defaults.height)};
}
function info(f,o,variant){return{family:f,width:o.width,depth:o.depth,height:o.height,detail:o.detail,seed:o.seed??1,variant,approx:true,footprintConvention:'width/depth are overall structural footprint; canopies/cornices project by up to 2 m'};}

/** A true recessed frontage: the solid core stops behind the glass and columns. */
function retailPodium(r,{w,d,h,detail=1,variant=0,stone=false}) {
 const trim=stone?'stoneLight':variant===2?'bronze':'metalDark',wall=stone?'stone':variant===3?'brick':'stoneLight';
 const front=d/2,recess=Math.min(1.7,d*.12),gf=Math.min(5.4,h*.58),entryW=Math.min(14,w*.27),entryH=Math.min(h-.5,7.8);
 r.box(wall,0,h/2,-recess/2,w,h,d-recess,'retail podium rear structural core');
 r.box('concrete',0,.16,front-recess/2,w,.32,recess,'covered retail arcade floor');
 r.box(wall,0,h-.28,0,w,.56,d,'podium roof slab');
 // Low-level glass is deliberately in front of the core but behind the piers.
 r.box('shopGlass',0,gf/2,front-recess+.15,w-.6,gf-.3,.16,'recessed retail display glazing');
 const n=Math.max(4,Math.round(w/6)),bay=w/n;
 for(let i=0;i<n;i++) {
  const x=-w/2+(i+.5)*bay,isEntrance=Math.abs(x)<entryW/2;
  if(!isEntrance) {
   r.box(trim,x,gf+.16,front-.15,bay-.25,.38,.24,'individual retail sign fascia');
   if(detail>0) {
    r.box('stoneDark',x,.42,front-recess+.25,bay-.60,.25,.65,'shop display stone plinth');
    r.box('glassPale',x,gf*.50,front-recess+.26,bay-.7,gf*.70,.04,'large clear shop display pane');
    for(const s of [-1,1])r.box(trim,x+s*bay*.42,gf*.5,front-recess+.33,.085,gf-.4,.16,'shopfront fine aluminium mullion');
    r.box('metal',x,gf*.72,front-recess+.36,bay-.3,.09,.14,'shopfront transom');
    if(i%3===variant%3)r.box('windowWarm',x,1.3,front-recess+.4,bay*.32,1.3,.16,'warm interior display panel');
   }
   r.metadata.signPanels??=[];
   r.metadata.signPanels.push({position:[x,gf+.16,front+.01],width:bay-.6,height:.26,rotation:[0,0,0],normal:[0,0,1]});
  }
  if(i>0&&Math.abs(x-bay/2)>entryW*.42)r.box(wall,x-bay/2,h*.5,front-.24,stone?.52:.26,h-.5,.65,'recessed arcade structural pier');
 }
 // Upper podium bays read as large commercial windows, not another tower grid.
 if(h>gf+2) {
  r.box('glassDark',0,(gf+h)/2,front-recess+.14,w-.5,h-gf-.5,.16,'upper retail mezzanine window ribbon');
  for(let i=0;i<=n;i++)r.box(trim,-w/2+i*bay,(gf+h)/2,front-.33,stone?.48:.22,h-gf,.46,'double-height podium window frame');
  r.box(trim,0,gf+.46,front-.15,w,.25,.36,'retail mezzanine belt');
 }
 // A wide recessed office lobby and two independently readable glass door banks.
 r.box('glassDark',0,entryH/2,front-.61,entryW,entryH,.13,'recessed double-height lobby portal');
 for(const s of [-1,1]) {
  r.box(trim,s*(entryW/2+.15),entryH/2,front-.05,stone?.68:.34,entryH,.80,'office entrance portal side');
  if(detail>0) {
   const x=s*entryW*.30;
   const dh=Math.min(3.1,entryH-.15);
   r.box('glassPale',x,dh/2,front-.32,entryW*.22,dh,.07,'clear lobby swing door');
   r.box('metal',x,dh/2,front-.24,.08,dh,.10,'lobby door centre stile');
   r.box('metal',x+.13,1.35,front-.15,.05,.7,.07,'lobby brushed metal pull handle');
  }
 }
 r.box(trim,0,entryH-.12,front-.05,entryW+.7,.26,.80,'office entrance portal head');
 const canopyW=Math.min(w*.56,24),canopyD=Math.min(4.3,d*.22),canopyY=Math.min(5.3,entryH-.45);
 r.box(variant===1?'metal':'glassPale',0,canopyY,front+canopyD*.34,canopyW,.23,canopyD,'projecting street lobby rain canopy');
 r.box(trim,0,canopyY-.18,front+canopyD*.82,canopyW,.19,.18,'canopy perimeter fascia');
 if(detail>0) {
  const cols=stone?2:4;
  for(let i=0;i<cols;i++) {
   const x=-canopyW*.42+i*canopyW*.84/(cols-1);
   r.box('metal',x,canopyY+.15,front+canopyD*.34,.12,.12,canopyD,'canopy glazing rib');
   if(variant===0&&!stone) {
    beam(r,'metal',[x,.1,front+.75],[x-.7,canopyY-.18,front+canopyD*.68],.10,'V-form canopy support');
    beam(r,'metal',[x,.1,front+.75],[x+.7,canopyY-.18,front+canopyD*.68],.10,'V-form canopy support');
   }
  }
  for(const side of [-1,1]) {
   const x=side*w*.38;
   r.box('stoneDark',x,.33,front+.43,w*.13,.66,1.05,'street entrance planter');
   r.box('foliage',x,.82,front+.43,w*.12,.40,.9,'clipped streetfront shrub');
  }
  // A glass revolving-door drum below a slim circular steel crown.
  const rh=Math.min(3.0,entryH-.2),rr=Math.min(1.2,entryW*.25);
  r.cylinder('metalDark',0,rh,front-.28,rr,.15,'revolving-door circular steel crown',24);
  for(let k=0;k<3;k++)r.box('glassPale',0,rh/2,front-.28,.05,rh-.12,rr*1.85,'revolving-door glass wing',k*Math.PI/3);
 }
 // Flanking side glazing and loading/service access create a legible back edge.
 for(const s of [-1,1]) {
  r.box('glassDark',s*(w/2+.025),h*.49,-.25,.08,h*.81,d*.78,'podium side display glazing');
  if(detail>0)for(let j=1;j<5;j++)r.box(trim,s*(w/2+.08),h*.5,-d*.38+j*d*.15,.12,h*.87,.16,'podium side glazing mullion');
 }
 if(detail>0) {
  r.box('metalDark',-w*.25,1.75,-d/2-.035,w*.19,3.5,.10,'rear loading and service door');
  for(let j=0;j<5;j++)r.box('metal',-w*.25,.55+j*.55,-d/2-.10,w*.18,.08,.10,'loading door horizontal seam');
 }
 r.metadata.entrance={position:[0,0,front],normal:[0,0,1],canopyWidth:canopyW};
}

function curtain(r,{w,d,y,h,detail,material='glass',trim='metal',stone=false,variant=0,x=0,z=0}) {
 r.add(CHAMFER_BOX,material,[x,y+h/2,z],[w,h,d],[0,0,0],'faceted main tower envelope');
 const cols=detail===0?4:Math.min(detail===2?26:15,Math.max(5,Math.round(w/3.2))),rows=Math.max(2,Math.round(h/4.1)),step=detail===0?Math.max(1,Math.ceil(rows/4)):1;
 for(const side of [-1,1]) {
  for(let i=0;i<=cols;i++) {
   const xx=x-w*.43+i*w*.86/cols;
   r.box(trim,xx,y+h/2,z+side*(d/2+.05),stone?.52:variant===1?.25:.14,h,stone?.38:.28,'tower vertical curtain-wall fin');
  }
  for(let j=step;j<rows;j+=step)r.box(stone?'stone':variant===2?'metalDark':trim,x,y+j*h/rows,z+side*(d/2+.04),w*.91,stone?.60:.17,.17,'tower articulated floor spandrel');
 }
 const sideCols=Math.max(3,Math.round(cols*d/w));
 for(const side of [-1,1]) {
  for(let i=0;i<=sideCols;i++)r.box(trim,x+side*(w/2+.05),y+h/2,z-d*.43+i*d*.86/sideCols,stone?.38:.28,h,stone?.52:.14,'tower side vertical fin');
  for(let j=step;j<rows;j+=step)r.box(stone?'stone':trim,x+side*(w/2+.04),y+j*h/rows,z,.17,stone?.60:.17,d*.91,'tower side floor spandrel');
 }
 if(detail>0&&variant===2)for(const side of [-1,1])for(let i=0;i<3;i++)r.box('glassPale',x+side*w*.485,y+h/2,z-d*.25+i*d*.25,.12,h*.97,d*.16,'contrasting corner glazing strip');
}

function equipment(r,w,d,y,h,detail,style='metalDark') {
 const sw=w*.62,sd=d*.58;
 r.box('concrete',0,y+h*.34,0,sw*.68,h*.68,sd*.67,'recessed roof mechanical penthouse');
 for(const side of [-1,1]) {
  r.box(style,0,y+h/2,side*sd/2,sw,h,.20,'rooftop equipment screen');
  r.box(style,side*sw/2,y+h/2,0,.20,h,sd,'rooftop equipment screen');
  if(detail>0)for(let j=1;j<6;j++) {
   r.box('metal',0,y+j*h/6,side*(sd/2+.04),sw,.055,.08,'equipment-screen horizontal louvre');
   r.box('metal',side*(sw/2+.04),y+j*h/6,0,.08,.055,sd,'equipment-screen side louvre');
  }
 }
 if(detail>0)for(const side of [-1,1]) {
  const xx=side*sw*.23;
  r.box('metal',xx,y+.70,sd*.11,sw*.24,1.4,sd*.32,'screened rooftop air handling unit');
  r.cylinder('metalDark',xx,y+1.43,sd*.11,Math.min(sw,sd)*.09,.10,'circular rooftop fan grille',12);
 }
}

export function contemporaryCbd(options={}) {
 if(options.height!==undefined&&options.height<25)return contemporaryCommercial(options);
 const o=choose(options,{width:44,depth:42,height:160}),{width:w,depth:d,height:h,detail}=o,random=seededRandom(o.seed??1),v=(o.variant??Math.floor(random()*4))%4;
 const r=new Recipe('北京CBD · articulated glass tower and retail podium',info('cbd',o,v));
 const ph=Math.min(14,Math.max(6,h*.11)),crown=Math.min(5,h*.045),top=h-crown,body=top-ph,tw=w*(v===3?.76:.72),td=d*(v===1?.68:.73);
 retailPodium(r,{w,d,h:ph,detail,variant:v});
 const stages=v===0?3:v===3?2:1;
 for(let j=0;j<stages;j++) {
  const shrink=1-j*(v===0?.11:.14),ww=tw*shrink,dd=td*shrink,y=ph+j*body/stages,hh=body/stages;
  curtain(r,{w:ww,d:dd,y,h:hh,detail,variant:v,material:v===1?'glassBlue':v===2?'glassPale':'glass',trim:v===1?'metalDark':'metal'});
  r.box('metalDark',0,y+hh-.15,0,ww+.24,.30,dd+.24,'tower setback terrace rim');
  if(j<stages-1&&detail>0)for(const s of [-1,1])r.box('foliage',s*ww*.43,y+hh+.18,0,.8,.3,dd*.7,'setback terrace planting');
 }
 if(v===2)for(const s of [-1,1])r.box('stoneLight',s*tw*.38,ph+body/2,s*td*.48,tw*.09,body,.90,'expressed pale stone facade blade');
 if(v===3)r.box('metalDark',0,ph+body*.54,td/2+.11,tw*.17,body*.92,.22,'dark vertical recessed tower slot');
 equipment(r,tw*(1-(stages-1)*.11),td*(1-(stages-1)*.11),top,crown,detail);
 if(detail>0)for(const s of [-1,1]) {
  r.box('paving',s*w*.42,ph+.05,0,w*.12,.10,d*.74,'podium roof maintenance deck');
  r.box('metalDark',s*w*.47,ph+.45,0,.10,.9,d*.72,'podium terrace safety railing');
 }
 return r;
}

export function contemporaryFinancial(options={}) {
 if(options.height!==undefined&&options.height<18)return contemporaryCommercial(options);
 const o=choose(options,{width:52,depth:35,height:90}),{width:w,depth:d,height:h,detail}=o,v=(o.variant??Math.floor(seededRandom(o.seed??1)()*3))%3;
 const r=new Recipe('北京金融街 · limestone office and recessed commercial arcade',info('financial',o,v));
 const ph=Math.min(12,h*.19),crown=Math.min(5,h*.05),tw=w*.93,td=d*.89,body=h-ph-crown;
 retailPodium(r,{w,d,h:ph,detail,variant:v,stone:true});
 curtain(r,{w:tw,d:td,y:ph,h:body,detail,material:v===1?'glassDark':'window',trim:'stoneLight',stone:true,variant:v});
 for(const side of [-1,1])for(const x of [-tw*.43,0,tw*.43])r.box('stone',x,ph+body/2,side*(td/2+.20),v===2?1.25:.8,body,.65,'deep limestone vertical pilaster');
 for(const y of [ph,h-crown])r.box('stoneLight',0,y,0,tw+.9,.75,td+.9,'stone office deep horizontal cornice');
 equipment(r,tw,td,h-crown,crown,detail,'stoneDark');
 if(v===1)r.box('stoneLight',0,h-.3,0,tw*.73,.6,td*.73,'formal stepped stone crown cap');
 return r;
}

export function contemporaryCommercial(options={}) {
 const o=choose(options,{width:72,depth:45,height:26}),{width:w,depth:d,height:h,detail}=o,v=(o.variant??Math.floor(seededRandom(o.seed??1)()*4))%4;
 const r=new Recipe('北京城市商业 · layered retail frontage and rooftop services',info('commercial',o,v));
 if(h<8) {retailPodium(r,{w,d,h:h-.2,detail,variant:v,stone:v===1});r.box('stoneLight',0,h-.1,0,w,.2,d,'single-storey commercial roof coping');return r;}
 const ph=Math.min(10,h*.43),top=h-1.6,upperH=top-ph,uw=w*(v===3?.78:.95),ud=d*(v===3?.75:.89),shift=v===3?-d*.09:-d*.025;
 retailPodium(r,{w,d,h:ph,detail,variant:v,stone:v===1});
 r.box(v===2?'brick':'stoneLight',0,ph+upperH/2,shift,uw,upperH,ud,'setback upper shopping floors');
 const front=shift+ud/2,n=Math.max(4,Math.round(uw/9)),bay=uw/n;
 for(let i=0;i<n;i++) {
  const x=-uw/2+(i+.5)*bay;
  r.box('glassDark',x,ph+upperH*.48,front+.05,bay*.79,upperH*.75,.13,'large upper commercial window bay');
  r.box(v===2?'brick':'stone',x+bay/2-.2,ph+upperH/2,front+.19,.45,upperH,.48,'projecting upper commercial pier');
  if(detail>0)for(let j=1;j<=Math.ceil(upperH/4);j++)r.box('metal',x,ph+j*upperH/(Math.ceil(upperH/4)+1),front+.15,bay*.79,.12,.16,'retail window transom');
 }
 for(const s of [-1,1])r.box('glassDark',s*(uw/2+.025),ph+upperH*.5,shift,.07,upperH*.75,ud*.81,'upper commercial side glazing');
 r.box('stoneLight',0,ph,0,w,.65,d,'deep retail belt course');
 r.box(v===2?'brick':'stoneLight',0,top+.16,shift,uw+.45,.32,ud+.45,'upper commercial parapet coping');
 r.box('concrete',0,top+.335,shift,uw-.45,.04,ud-.45,'flat commercial roof paving');
 // Skylight, real terrace surface, and screened equipment sit inside the roofline.
 r.box('glassPale',-uw*.20,top+.52,shift,uw*.32,.65,ud*.35,'long atrium rooflight');
 if(detail>0)for(let i=0;i<6;i++)r.box('metal',-uw*.36+i*uw*.32/5,top+.87,shift,.15,.08,ud*.35,'rooflight glazing bar');
 const mech=new Recipe('screened commercial rooftop plant');equipment(mech,uw*.33,ud*.56,top,1.6,detail);r.merge(mech,[uw*.27,0,shift-ud*.12]);
 if(v===3||detail>0) {
  r.box('paving',0,ph+.10,d*.39,w*.88,.18,d*.16,'outdoor upper retail terrace');
  r.box('metalDark',0,ph+.70,d*.47,w*.90,.10,.10,'outdoor retail terrace handrail');
  if(detail>0)for(const s of [-1,1]) {
   r.box('stoneDark',s*w*.34,ph+.37,d*.39,w*.16,.6,d*.09,'retail terrace planter');
   r.box('foliage',s*w*.34,ph+.79,d*.39,w*.15,.3,d*.08,'retail terrace hedge');
  }
 }
 if(v===0||v===2) {
  r.box('metalDark',uw*.26,ph+upperH*.57,front+.25,uw*.22,upperH*.68,.35,'large vertical retail sign frame');
  r.box(v===2?'awning':'windowWarm',uw*.26,ph+upperH*.57,front+.45,uw*.20,upperH*.64,.08,'abstract advertising panel without invented text');
 }
 return r;
}
