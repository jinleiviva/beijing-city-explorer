import {beam} from './geometry.js';

export function windowGrid(r,{width,height,z,y=0,x=0,columns=12,rows=4,material='window',trim='stoneLight',detail=1}) {
  if(detail===0) {
    r.box(material,x,y+height/2,z,width,height,.15,'recessed window field');
    for(let i=1;i<columns;i++)r.box(trim,x-width/2+i*width/columns,y+height/2,z+.1,.55,height,.18,'window pier');
    for(let j=1;j<rows;j++)r.box(trim,x,y+j*height/rows,z+.12,width,.6,.2,'window floor band');
  } else {
    const bw=width/columns,fh=height/rows;
    for(let j=0;j<rows;j++)for(let i=0;i<columns;i++)r.box(material,x-width/2+(i+.5)*bw,y+(j+.5)*fh,z,bw*.56,fh*.62,.18,'individual recessed window');
  }
}

export function stairs(r,width,z,height=3,depth=12,steps=7,x=0,material='stoneLight') {
  for(let i=0;i<steps;i++) {
    const h=height*(1-i/steps),d=depth/steps;
    r.box(material,x,h/2,z+(i+.5)*d,width,h,d+.03,'monumental entrance stair');
  }
}

export function portico(r,{width,depth=12,height=24,z,y=0,columns=12,material='stoneLight',round=true,roof=true}) {
  for(let i=0;i<columns;i++) {
    const x=-width/2+i*width/(columns-1);
    if(round) {
      r.cylinder(material,x,y+height/2,z,1,height,'colonnade column',12,.91);
      r.cylinder(material,x,y+.25,z,1.4,.5,'column plinth',12);
      r.cylinder(material,x,y+height-.25,z,1.25,.5,'column capital',12);
    }else r.box(material,x,y+height/2,z,1.1,height,1.1,'square colonnade pier');
  }
  if(roof) {
    r.box(material,0,y+height+1.2,z-depth*.3,width+7,2.4,depth,'portico entablature');
    r.box(material,0,y+height+2.7,z-depth*.3,width+9,.6,depth+2,'overhanging classical cornice');
  }
}

export function star(r,x,y,z,radius=2,material='roofGoldLight') {
  const vertices=[x,y,z+.3,x,y,z-.3],indices=[];
  for(let side=0;side<2;side++)for(let i=0;i<10;i++) {
    const a=Math.PI/2+i*Math.PI/5,rr=i%2?radius*.42:radius;
    vertices.push(x+Math.cos(a)*rr,y+Math.sin(a)*rr,z+(side?-.3:.3));
  }
  for(let i=0;i<10;i++) {indices.push(0,2+i,2+(i+1)%10,1,12+(i+1)%10,12+i,2+i,12+i,12+(i+1)%10,2+i,12+(i+1)%10,2+(i+1)%10);}
  r.add({type:'mesh',vertices,indices},material,[0,0,0],[1,1,1],[0,0,0],'five-point star finial');
}

export function flagpole(r,x,y,z,height=12) {
  r.cylinder('metal',x,y+height/2,z,.1,height,'flagpole',8);
  r.box('vermilion',x+2.3,y+height-1.2,z,4.5,2.7,.04,'red flag');
}

export function clockFace(r,x,y,z,radius=2.5) {
  r.add({type:'cylinder',segments:32,topRadius:1},'stoneLight',[x,y,z],[radius,.22,radius],[Math.PI/2,0,0],'clock face');
  beam(r,'metalDark',[x,y,z+.2],[x+radius*.52,y+radius*.55,z+.2],.1,'clock minute hand');
  beam(r,'metalDark',[x,y,z+.2],[x-radius*.4,y+radius*.2,z+.2],.13,'clock hour hand');
}
