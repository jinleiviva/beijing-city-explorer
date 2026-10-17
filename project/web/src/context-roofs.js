/** Bounded rectangular traditional roof approximation, never covering courtyard holes. */
import * as THREE from '../vendor/three.module.js';import {polygonArea} from './geo.js';import {strip} from './geometry.js';
export function planContextRoof(ring,height,shape='gabled'){
 if(shape==='flat'||height<3.5||height>24)return null;let longest=0,angle=0;
 for(let i=1;i<ring.length;i++){const dx=ring[i][0]-ring[i-1][0],dz=ring[i][1]-ring[i-1][1],length=Math.hypot(dx,dz);if(length>longest){longest=length;angle=Math.atan2(dz,dx);}}
 function extent(a){const cs=Math.cos(a),sn=Math.sin(a);let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity;for(const[x,z]of ring){const u=x*cs+z*sn,v=-x*sn+z*cs;minU=Math.min(minU,u);maxU=Math.max(maxU,u);minV=Math.min(minV,v);maxV=Math.max(maxV,v);}return{cs,sn,minU,maxU,minV,maxV,w:maxU-minU,d:maxV-minV};}
 let e=extent(angle);if(e.w<e.d)e=extent(angle+Math.PI/2);if(e.w<4||e.d<3||e.d>42||e.w>160||polygonArea(ring)/(e.w*e.d)<.87)return null;
 const rise=Math.min(5,Math.max(1.1,e.d*.24),height*.35);return{...e,rise,pyramidal:shape==='pyramidal',hipped:['hipped','half-hipped','pyramidal'].includes(shape),accuracy:'Bounded approximate pitch/ridge inside real footprint orientation; no courtyard-hole spanning'};
}
export function addContextRoof(batch,plan,height,color){const{cs,sn,minU,maxU,minV,maxV,w,d,rise,hipped,pyramidal}=plan,midV=(minV+maxV)/2,baseY=height-rise,overhang=.32;
 const v=(u,vv,y)=>[u*cs-vv*sn,y,u*sn+vv*cs],a=v(minU-overhang,minV-overhang,baseY),b=v(maxU+overhang,minV-overhang,baseY),c=v(maxU+overhang,maxV+overhang,baseY),dd=v(minU-overhang,maxV+overhang,baseY),inset=pyramidal?w*.5:hipped?Math.min(d*.43,w*.32):0,r0=v(minU+inset,midV,height),r1=v(maxU-inset,midV,height);
 function face(A,B,C,D,col){let n=new THREE.Vector3().fromArray(B).sub(new THREE.Vector3().fromArray(A)).cross(new THREE.Vector3().fromArray(C).sub(new THREE.Vector3().fromArray(A))).normalize().toArray();if(n[1]<0){[B,D]=[D,B];n=n.map(v=>-v);}batch.quad(A,B,C,D,col,n,[0,0,w,0,w,d/2,0,d/2]);}
 face(a,b,r1,r0,color);face(r0,r1,c,dd,color.map(x=>x*.94));batch.tri(a,dd,r0,color.map(x=>x*.88));batch.tri(b,r1,c,color.map(x=>x*.92));
 strip(batch,[a,b,c,dd,a].map(p=>[p[0],p[2]]),.24,baseY-.06,color.map(x=>x*.58));if(!pyramidal)strip(batch,[[r0[0],r0[2]],[r1[0],r1[2]]],.24,height+.07,color.map(x=>x*1.04));
}
export function mappedRoofColor(value){if(!value)return null;const text=String(value).toLowerCase();if(/^#[0-9a-f]{6}$/.test(text))return text;return({grey:'#646d70',gray:'#646d70',black:'#4d595e',blue:'#436879',green:'#4f7761',yellow:'#b58b3c',gold:'#b58b3c',red:'#875c4c',brown:'#776452'})[text]||null;}
