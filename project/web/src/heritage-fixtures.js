import * as THREE from '../vendor/three.module.js';
import {Recipe,HIP_ROOF,beam} from './architecture/geometry.js';
import {project,rng} from './geo.js';

/** Original geometry from the viewed 2016/2023 street photographs.
 * Dimensions and placement of portable merchandise remain illustrative. */
export function buildHeritageFixtures(kit,plan){
 const group=new THREE.Group();group.name='Yandai photo-informed gate and shop-edge objects';
 const fixtures=new Recipe('Yandai street-edge fixtures');
 let lamps=0,racks=0,bicycles=0;
 for(const shop of plan.instances){
  const random=rng(shop.seed),r=new Recipe('shop edge');const front=shop.depth/2+.10;
  // These fixtures stay within 0.55 m of the shop edge, leaving the main walking channel clear.
  if(random()<.37){const x=shop.width*.31,y=2.7;beam(r,'metalDark',[x,y,front],[x,y,front+.50],.035,'black wall lamp bracket');r.box('metalDark',x,y-.20,front+.50,.25,.42,.25,'small black box shop lamp');r.box('sign',x,y-.20,front+.632,.16,.26,.015,'cream lamp pane');lamps++;}
  if(random()<.49){const x=-shop.width*.32,z=front+.25;
   for(const sx of [-.62,.62])r.box('metalDark',x+sx,1.53,z,.045,1.42,.045,'display rack upright');
   r.box('metalDark',x,2.22,z,1.30,.045,.045,'display rack rail');
   for(let k=0;k<5;k++){const xx=x-.49+k*.245,material=['vermilion','sign','glassBlue','awning','stoneLight'][(k+shop.seed)%5];r.box(material,xx,1.77,z,.20,.63,.11,'varied hanging cloth');r.box(material,xx,1.99,z,.32,.16,.10,'shirt sleeve silhouette');}
   racks++;
  }else if(random()<.45){const x=-shop.width*.29,z=front+.24;r.box('paintedWood',x,1.15,z,1.15,.72,.44,'small merchandise counter');
   for(let k=0;k<8;k++){const xx=x-.46+k%4*.30,zz=z-.12+Math.floor(k/4)*.23;r.cylinder(k%2?'stoneLight':'roofBlue',xx,1.60,zz,.09,.18,'ceramic shop display',8);}
   racks++;
  }
  if(random()<.12){const x=shop.width*.23,z=front+.35,frame=new Recipe('parked bicycle');
   // Low-poly open hoops, not solid wheel discs.
   for(const xx of [-.60,.60])for(let k=0;k<12;k++){const a=k/12*Math.PI*2,b=(k+1)/12*Math.PI*2;beam(frame,'metalDark',[xx+Math.cos(a)*.33,.37+Math.sin(a)*.33,0],[xx+Math.cos(b)*.33,.37+Math.sin(b)*.33,0],.025,'bicycle tyre');}
   for(const [a,b] of [[[-.60,.37,0],[-.13,.40,0]],[[-.60,.37,0],[-.25,.87,0]],[[-.25,.87,0],[-.13,.40,0]],[[-.25,.87,0],[.35,.91,0]],[[.35,.91,0],[-.13,.40,0]],[[.35,.91,0],[.60,.37,0]]])beam(frame,'glassBlue',a,b,.025,'bicycle frame');
   frame.box('metalDark',-.24,.95,0,.27,.065,.16,'saddle');beam(frame,'metalDark',[.35,.91,0],[.42,1.15,0],.025,'handlebar stem');beam(frame,'metalDark',[.42,1.15,-.18],[.42,1.15,.18],.025,'handlebar');r.merge(frame,[x,.84,z]);bicycles++;
  }
  fixtures.merge(r,[shop.x,0,shop.z],shop.rotation);
 }
 // Stone spheres are visible at both entrances. Their radius is plausible, not surveyed.
 for(const path of plan.paths)for(const end of [0,path.points.length-1]){const p=path.points[end],next=path.points[end===0?1:end-1],dx=next[0]-p[0],dz=next[1]-p[1],length=Math.hypot(dx,dz);for(const side of [-1,1]){const x=p[0]-dz/length*1.65*side,z=p[1]+dx/length*1.65*side;fixtures.cylinder('concrete',x,.86,z,.37,.13,'stone bollard base',12);fixtures.sphere('concrete',x,1.20,z,.37,.37,.37,'entrance stone sphere bollard');}}
 const f=kit.buildRecipe(fixtures);group.add(f);
 // The east entrance has one bay and two columns, unlike the generic three-bay monumental paifang.
 const gate=new Recipe('Yandai east entrance two-column painted paifang');
 for(const x of [-2.75,2.75]){gate.cylinder('vermilion',x,3.8,0,.22,6.1,'red gate column',16);gate.cylinder('greenBeam',x,6.25,0,.23,1.10,'painted column upper sleeve',16);gate.sphere('bronze',x,7.1,0,.31,.24,.31,'gold finial');gate.box('greyBrick',x,.96,0,.61,.28,.61,'gray column foot');}
 gate.box('greenBeam',0,4.50,0,6.18,.54,.44,'lower painted beam');gate.box('roofBlue',0,5.69,0,6.12,.54,.48,'upper blue-green beam');
 for(const y of [4.23,4.78,5.42,5.96])gate.box('bronze',0,y,.25,6.13,.025,.025,'gold beam line');
 for(let i=-5;i<=5;i++){gate.box('vermilionDark',i*.51,6.12,0,.16,.27,.66,'timber bracket upright');gate.box('greenBeam',i*.51,6.22,0,.36,.12,.82,'painted bracket arm');}
 gate.add(HIP_ROOF,'roofGrey',[0,6.22,0],[7.1,.80,1.68],[0,0,0],'gray upturned gate roof');gate.box('roofGreyRidge',0,7.03,0,4.75,.11,.17,'gray roof ridge');
 for(let i=-11;i<=11;i++)for(const side of [-1,1])gate.sphere('roofGreyRidge',i*.29,6.36,side*.82,.055,.055,.07,'round eave tile cap');
 gate.box('signDark',0,5.1,.30,2.75,.78,.12,'black street-name plaque');
 const endpoint=plan.paths[0]?.points.at(-1)||project([116.3897594,39.9378822]),gateObject=kit.buildRecipe(gate);gateObject.position.set(endpoint[0]-1.4,0,endpoint[1]);gateObject.rotation.y=Math.PI/2;group.add(gateObject);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const ctx=canvas.getContext('2d');ctx.fillStyle='#292e29';ctx.fillRect(0,0,768,192);ctx.strokeStyle='#92774d';ctx.lineWidth=5;ctx.strokeRect(8,8,752,176);ctx.fillStyle='#d5b87a';ctx.font='bold 132px "Noto Serif CJK SC",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('烟袋斜街',384,100,690);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const plaque=new THREE.Mesh(new THREE.PlaneGeometry(2.60,.65),new THREE.MeshStandardMaterial({map:texture,roughness:.9,side:THREE.DoubleSide}));plaque.position.set(0,5.1,.368);gateObject.add(plaque);
 group.userData={lamps,merchandiseDisplays:racks,bicycles,stoneBollards:4,eastGate:'two-column single-bay paifang, viewed photo reference; approximate dimensions',accuracy:'Original photo-informed geometry; portable displays and individual positions inferred; no claim about current tenants'};
 return group;
}
