/** Continuous approximate bridge approaches on actual shared road endpoints.
 * Bridge type/context supplies an approximate vertical separation, never a surveyed
 * elevation. No new horizontal road or junction is invented. */
import {project} from './geo.js';
import {roadElevationPolicy} from './road-elevation.js';
const nodeKey=p=>`${Math.round(p[0]*100)},${Math.round(p[1]*100)}`;
export const roadProfileKey=(id,points)=>`${id}|${nodeKey(points[0])}|${nodeKey(points.at(-1))}`;
export function createRoadElevationProfiles(features){
 const nodes=new Map(),lines=[],floor=.65;
 const node=p=>{const k=nodeKey(p);if(!nodes.has(k))nodes.set(k,{key:k,height:floor,ceiling:Infinity,edges:[]});return nodes.get(k);};
 for(const f of features){const p=f.properties;if(p.kind!=='road'||p.tunnel==='yes'||Number(p.layer)<0||p.heightProfile||p.customBridge||p.customDrapedPath||p.drapeTerrain)continue;for(const line of f.geometry.type==='MultiLineString'?f.geometry.coordinates:[f.geometry.coordinates]){const points=line.map(project);if(points.length<2)continue;const length=points.slice(1).reduce((n,b,j)=>n+Math.hypot(b[0]-points[j][0],b[1]-points[j][1]),0);if(length<.1)continue;const a=node(points[0]),b=node(points.at(-1)),base=p.class==='steps'||!roadElevationPolicy(p).mappedBridge?floor:roadElevationPolicy(p).height,grade=p.class==='steps'?.30:['footway','path','pedestrian','cycleway'].includes(p.class)?.08:.07;const entry={key:roadProfileKey(f.id,points),id:f.id,points,length,base,grade,a,b};lines.push(entry);a.edges.push({other:b,cost:length*grade});b.edges.push({other:a,cost:length*grade});a.height=Math.max(a.height,base);b.height=Math.max(b.height,base);}}
 // Explicit custom-bridge endpoint heights are fixed boundary conditions.
 // A neighboring generic bridge cannot lift a photographed low stone bridge.
 for(const f of features){const h=f.properties.bridgeEndpointHeights;if(!Array.isArray(h))continue;for(const line of f.geometry.type==='MultiLineString'?f.geometry.coordinates:[f.geometry.coordinates]){if(line.length<2)continue;for(const [i,p]of [project(line[0]),project(line.at(-1))].entries()){const n=node(p);n.ceiling=h[i];n.height=h[i];}}}
 const queue=[...nodes.values()].filter(n=>n.height>floor+.01);let cursor=0;while(cursor<queue.length){const n=queue[cursor++];for(const e of n.edges){const h=Math.min(e.other.ceiling,Math.max(floor,n.height-e.cost));if(h>e.other.height+.0001){e.other.height=h;queue.push(e.other);}}}
 const output=new Map();for(const s of lines){const start=s.a.height,end=s.b.height;if(start<=s.base+.01&&end<=s.base+.01)continue;const lengths=[0];for(let j=1;j<s.points.length;j++)lengths.push(lengths.at(-1)+Math.hypot(s.points[j][0]-s.points[j-1][0],s.points[j][1]-s.points[j-1][1]));output.set(s.key,{id:s.id,startHeight:start,endHeight:end,baseHeight:s.base,grade:Math.max(s.grade,Math.abs(start-end)/s.length),length:s.length,points:s.points,lengths,hasRamp:true,source:'Approximate continuous approach on actual shared endpoint topology;7% motor/8%walk/30%steps limits, not surveyed civil design'});}
 return output;
}
export function profileHeightAt(profile,x,z){if(!profile)return .65;let best=Infinity,chain=0;for(let j=1;j<profile.points.length;j++){const a=profile.points[j-1],b=profile.points[j],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2)),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d<best){best=d;chain=profile.lengths[j-1]+Math.sqrt(l2)*t;}}return Math.max(profile.baseHeight,profile.startHeight-profile.grade*chain,profile.endHeight-profile.grade*(profile.length-chain));}
export function densifyRoad(points,spacing=3){const dense=[];for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/spacing));for(let k=0;k<steps;k++)dense.push([a[0]+(b[0]-a[0])*k/steps,a[1]+(b[1]-a[1])*k/steps]);}dense.push(points.at(-1));return dense;}
/** Preserve the mapped horizontal polyline and insert only exact slope breakpoints.
 * Heights are max(base,start-g*s,end-g*(length-s)), so at most three extra
 * chainages are required. Equal-spaced tessellation adds no shape information. */
export function profiledRoadPoints(profile,points=profile.points){
 const g=profile.grade,L=profile.length,b=profile.baseHeight;
 const cuts=[(profile.startHeight-b)/g,L-(profile.endHeight-b)/g,(profile.startHeight-profile.endHeight+g*L)/(2*g)].filter(s=>s>.01&&s<L-.01).sort((a,b)=>a-b);
 const out=[];let chain=0;
 for(let i=1;i<points.length;i++){const a=points[i-1],c=points[i],len=Math.hypot(c[0]-a[0],c[1]-a[1]);out.push(a);for(const s of cuts)if(s>chain+.01&&s<chain+len-.01){const t=(s-chain)/len;out.push([a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t]);}chain+=len;}
 out.push(points.at(-1));return out.filter((p,i)=>!i||Math.hypot(p[0]-out[i-1][0],p[1]-out[i-1][1])>.001);
}
