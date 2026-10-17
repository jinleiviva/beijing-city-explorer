/** WGS84 → local metric tangent approximation. X east, Z south. */
export const ORIGIN=[116.3975,39.9087];
export const BOUNDS=[116.30,39.85,116.49,40.015];
const DEG=Math.PI/180, R=6378137, K=R*DEG, C=Math.cos(ORIGIN[1]*DEG);
export function project(p){return [(p[0]-ORIGIN[0])*K*C,-(p[1]-ORIGIN[1])*K];}
export function unproject(x,z){return [x/(K*C)+ORIGIN[0],-z/K+ORIGIN[1]];}
export function projectRing(ring){return ring.map(project);}
export function polygonArea(ring){let a=0;for(let i=0,j=ring.length-1;i<ring.length;j=i++)a+=ring[j][0]*ring[i][1]-ring[i][0]*ring[j][1];return Math.abs(a)*.5;}
export function centroid(ring){let x=0,z=0;const n=ring.length>1&&ring[0][0]===ring.at(-1)[0]&&ring[0][1]===ring.at(-1)[1]?ring.length-1:ring.length;for(let i=0;i<n;i++){x+=ring[i][0];z+=ring[i][1];}return [x/n,z/n];}
export function bounds(ring){const b=[Infinity,Infinity,-Infinity,-Infinity];for(const p of ring){b[0]=Math.min(b[0],p[0]);b[1]=Math.min(b[1],p[1]);b[2]=Math.max(b[2],p[0]);b[3]=Math.max(b[3],p[1]);}return b;}
export function pointInRing(x,z,ring){let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if(((a[1]>z)!=(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
export function distanceToSegment(x,z,a,b){let dx=b[0]-a[0],dz=b[1]-a[1];const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
export function hash(v){let h=2166136261;for(const c of String(v)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function yieldFrame(){return new Promise(r=>setTimeout(r,0));}
