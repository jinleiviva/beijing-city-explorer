import * as THREE from '../vendor/three.module.js';
/** Procedural daylight reflection, no photograph or downloaded HDR asset. */
export function createDaylightEnvironment(renderer){
 const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
 const grad=g.createLinearGradient(0,0,0,512);grad.addColorStop(0,'#8db5c4');grad.addColorStop(.35,'#c7d8d7');grad.addColorStop(.49,'#e1e4d3');grad.addColorStop(.52,'#9eaa9a');grad.addColorStop(.72,'#a4a28a');grad.addColorStop(1,'#858b77');g.fillStyle=grad;g.fillRect(0,0,1024,512);
 for(let i=0;i<48;i++){const x=i*23,h=15+((i*37)%57);g.fillStyle=i%3===0?'#a4b7b5':'#bdc7b9';g.fillRect(x,260-h,14+(i%4)*3,h);}
 const glow=g.createRadialGradient(190,110,1,190,110,68);glow.addColorStop(0,'rgba(255,251,225,.95)');glow.addColorStop(.3,'rgba(255,247,215,.45)');glow.addColorStop(1,'rgba(255,248,220,0)');g.fillStyle=glow;g.fillRect(100,20,180,180);
 const texture=new THREE.CanvasTexture(c);texture.mapping=THREE.EquirectangularReflectionMapping;texture.colorSpace=THREE.SRGBColorSpace;
 const pmrem=new THREE.PMREMGenerator(renderer);const target=pmrem.fromEquirectangular(texture);texture.dispose();pmrem.dispose();return target;
}
