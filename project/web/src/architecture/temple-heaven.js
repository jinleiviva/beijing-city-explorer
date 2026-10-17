import {Recipe,latheGeometry,annulusGeometry,BOX,beam} from './geometry.js';

/** Photo-constrained proportions; 38 m altar-to-finial height, approx. 32 m eaves.
 * Painted patterns are original geometric abstractions, not copied photographs.
 */
export function templeHeavenRefined(o) {
  const r=new Recipe('天坛祈年殿 · Hall of Prayer for Good Harvests');
  const far=o.lod==='silhouette',segments=far?32:o.detail>0?72:48;
  const tangent=(material,a,rad,y,w,h,t,label)=>r.add(BOX,material,[Math.sin(a)*rad,y,Math.cos(a)*rad],[w,h,t],[0,a,0],label);
  const rod=(material,a,b,width,label)=>{
    const count=r.parts.length;beam(r,material,a,b,width,label);
    r.parts[count].geometry=BOX;
  };
  for(const [radius,base,height] of [[45.15,0,1.9],[39.65,1.9,1.8],[34.1,3.7,1.9]]) {
    const top=base+height;
    r.cylinder('marble',0,base+height/2,0,radius,height,'three-tier circular marble altar',segments);
    if(!far) {
      r.add(annulusGeometry(.990,segments),'stoneLight',[0,top-.12,0],[radius,.24,radius],[0,0,0],'marble altar projecting cornice');
      const count=o.detail>0?96:48;
      for(let i=0;i<count;i++) {
        const a=i/count*Math.PI*2,b=(i+1)/count*Math.PI*2;
        // Leave real cardinal access passages, instead of rails across stairs.
        if(Math.abs(Math.sin(2*a))<.12||Math.abs(Math.sin(2*b))<.12)continue;
        const rad=radius-.45;
        r.cylinder('marble',Math.sin(a)*rad,top+.65,Math.cos(a)*rad,.16,1.3,'marble balustrade post',6);
        for(const yy of [top+.38,top+1.03])rod('marble',[Math.sin(a)*rad,yy,Math.cos(a)*rad],[Math.sin(b)*rad,yy,Math.cos(b)*rad],.16,'marble terrace rail');
      }
    }
  }
  // The visible red doors occupy the lower ~5.6 m; upper wall is painted blue/green.
  r.cylinder('vermilionDark',0,8.4,0,12,5.6,'red circular timber hall',segments);
  r.cylinder('greenBeam',0,12.35,0,12.65,2.3,'lower painted bracket and beam belt',segments);
  r.cylinder('greenBeam',0,19.0,0,10.95,3.0,'middle painted circular drum',segments);
  r.cylinder('greenBeam',0,25.7,0,8.55,3.4,'upper painted circular drum',segments);
  if(!far) {
    for(let i=0;i<28;i++) {
      const a=i/28*Math.PI*2,rad=12.08;
      r.cylinder('vermilion',Math.sin(a)*rad,8.5,Math.cos(a)*rad,.21,5.8,'red exterior timber column',8);
      const doorAngle=a+Math.PI/28,opening=i%7===0;
      tangent(opening?'paintedWood':'vermilion',doorAngle,12.02,8.35,2.16,5.3,.12,'radial red door panel');
      if(o.detail>0) {
        const z=12.13;
        for(const offset of [-.82,.82]) {
          const aa=doorAngle+offset/z;
          tangent('roofGoldLight',aa,z,8.35,.065,5.15,.08,'fine gilt door stile');
        }
        for(const y of [5.9,8.15,10.85])tangent('roofGoldLight',doorAngle,z,y,1.7,.075,.08,'fine gilt door rail');
        if(!opening)tangent('paintedWood',doorAngle,12.16,9.55,1.55,2.1,.06,'dark upper door lattice window');
      }
    }
    for(const [radius,y,height,count] of [[12.72,12.28,1.64,28],[11.02,18.98,1.85,28],[8.62,25.68,2.2,24]]) {
      const width=2*Math.PI*radius/count*.83;
      for(let i=0;i<count;i++) {
        const a=i/count*Math.PI*2;
        tangent('roofBlueLight',a,radius,y,width,height,.12,'painted ceremonial frieze panel');
        if(o.detail>0) {
          for(const yy of [y-height*.43,y+height*.43])tangent('roofGoldLight',a,radius+.09,yy,width*.96,.065,.07,'fine painted panel gold border');
          tangent('roofGreen',a,radius+.11,y,width*.60,height*.55,.06,'painted panel green centre');
          tangent('roofGoldLight',a,radius+.16,y,.16,height*.55,.05,'abstract painted gold motif');
        }
      }
    }
  }
  // Lower two roofs terminate at their next drum. No hidden conical tip or gaps.
  const roofs=[
    [[16.0,14.2],[15.70,13.85],[14.2,14.35],[12.5,15.3],[10.8,17.55]],
    [[13.45,20.7],[13.14,20.3],[11.8,20.85],[10.1,22.0],[8.35,24.25]],
    [[10.15,27.65],[9.88,27.22],[8.4,27.9],[6.1,29.5],[3.5,31.65],[1.2,34.65],[.76,35.25]],
  ];
  for(const profile of roofs) {
    const [rad,y]=profile[0];
    r.add(latheGeometry(profile,segments),'roofBlue',[0,0,0],[1,1,1],[0,0,0],'curved blue glazed ceremonial roof');
    r.add(annulusGeometry(.978,segments),'roofBlueLight',[0,y-.08,0],[rad,.26,rad],[0,0,0],'blue glazed heavy eave rim');
    if(o.detail>0&&!far)for(let i=0;i<72;i++) {
      const a=i/72*Math.PI*2;
      for(let j=0;j<profile.length-1;j++) {
        const p=profile.slice(j,j+2).map(([rr,yy])=>[Math.sin(a)*(rr+.025),yy+.04,Math.cos(a)*(rr+.025)]);
        rod('roofBlueLight',p[0],p[1],.045,'radial glazed tile roll');
      }
    }
  }
  r.cylinder('roofBlue',0,35.5,0,1.13,.72,'blue finial neck',segments,.82);
  r.cylinder('roofGoldLight',0,36.1,0,.67,.55,'golden finial pedestal',24,.67);
  r.add(latheGeometry([[.36,36.3],[.70,36.65],[.81,37.15],[.64,37.7],[.1,38]],far?16:32),'roofGoldLight',[0,0,0],[1,1,1],[0,0,0],'rounded golden roof finial');
  // Blank imperial plaque: text is deliberately not pseudo-written.
  r.box('roofGoldLight',0,26.0,8.91,2.70,3.65,.22,'gilded imperial plaque frame');
  r.box('roofBlue',0,26.0,9.05,2.22,3.13,.10,'blue imperial inscription plaque');
  if(!far)for(let side=0;side<4;side++) {
    const stairs=new Recipe('cardinal altar access');
    for(let k=0;k<15;k++)stairs.box('marble',0,.2+k*.37,46.7-k*.83,7.6,.4,1.15,'cardinal ceremonial stair');
    r.merge(stairs,[0,0,0],side*Math.PI/2);
  }
  r.metadata={photoProportions:'Three separated blue roof curves, painted drum belts, red-and-gold ground-level doors; altar-to-finial 38 m',approx:true};
  return r;
}
