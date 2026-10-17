/** Original low-poly street-life design. Metres, +Z forward, ground y=0. */
import * as T from '../../../vendor/three.module.js';
export const TYPES=[{id:'sedan',w:1.82,l:4.55,h:1.42},{id:'taxi',w:1.82,l:4.65,h:1.49},{id:'bus',w:2.48,l:11.8,h:3.15},{id:'delivery',w:2.05,l:5.6,h:2.65},{id:'compact',w:1.72,l:3.9,h:1.52}];
const C={glass:'#354b55',rubber:'#252b2d',rim:'#a2a8a5',light:'#eee3b5',red:'#8b3e32',trim:'#4b5352'};
export function builder(){const positions=[],normals=[],colors=[];return {add(g,c='#ffffff',p=[0,0,0],s=[1,1,1],r=[0,0,0]){const a=g.index?g.toNonIndexed():g.clone();a.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...p),new T.Quaternion().setFromEuler(new T.Euler(...r)),new T.Vector3(...s)));const co=new T.Color(c);positions.push(...a.attributes.position.array);normals.push(...a.attributes.normal.array);for(let i=0;i<a.attributes.position.count;i++)colors.push(co.r,co.g,co.b);a.dispose();g.dispose();},finish(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeBoundingBox();return g;}};}
export function box(b,c,p,s,r){b.add(new T.BoxGeometry(1,1,1),c,p,s,r);}
export function ellipsoid(b,c,p,s){b.add(new T.SphereGeometry(1,10,7),c,p,s);}
function loft(b,c,rings){const v=[],ix=[];for(const [y,w,z0,z1] of rings){const q=.08;for(const [x,z]of[[-w/2+q,z0],[w/2-q,z0],[w/2,z0+q],[w/2,z1-q],[w/2-q,z1],[-w/2+q,z1],[-w/2,z1-q],[-w/2,z0+q]])v.push(x,y,z);}for(let j=0;j<rings.length-1;j++)for(let k=0;k<8;k++){let a=j*8+k,d=j*8+(k+1)%8;ix.push(a,a+8,d+8,a,d+8,d);}for(let k=1;k<7;k++){ix.push(0,k,k+1);const a=(rings.length-1)*8;ix.push(a,a+k+1,a+k);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();b.add(g,c);}
export function vehicleModel(t){const a=builder(),d=builder(),{w,l,h}=t,bus=t.id==='bus',van=t.id==='delivery',compact=t.id==='compact';
 // A continuous chamfered belt body, tapered bonnet and fitted roof: no block cabin.
 const belt=bus?.86:van?.88:.70;
 loft(a,'#ffffff',[[.24,w*.84,-l*.48,l*.48],[.42,w,-l*.5,l*.5],[belt,w*.97,-l*.47,l*.47],[belt+.11,w*.90,-l*.44,l*.40]]);
 if(bus||van){const z0=bus?-l*.47:-l*.47,z1=bus?l*.45:l*.12;loft(a,'#ffffff',[[belt,w*.94,z0,z1],[h-.09,w*.92,z0+.05,z1-.06],[h,w*.85,z0+.12,z1-.12]]);if(bus){for(const s of[-1,1]){box(d,C.glass,[s*w*.467,h*.67,-.15],[.025,h*.42,l*.85]);for(let j=0;j<8;j++)box(a,'#ffffff',[s*w*.481,h*.68,-l*.39+j*l*.112],[.035,h*.45,.10]);}box(d,C.glass,[0,h*.68,l*.456],[w*.83,h*.44,.024]);box(d,C.trim,[0,h*.91,l*.46],[w*.69,.21,.027]);}else{loft(d,C.glass,[[.91,w*.86,l*.14],[h*.78,w*.77,l*.13,l*.36]].map((r,i)=>r.length===3?[r[0],r[1],r[2],l*.45]:r));loft(a,'#ffffff',[[h*.78,w*.79,l*.13,l*.35],[h*.83,w*.74,l*.15,l*.32]]);for(const s of[-1,1])box(d,C.trim,[s*w*.472,h*.53,-l*.17],[.014,.018,l*.54]);}}
 else{const z0=-l*(compact?.29:.31),z1=l*(compact?.27:.24);loft(d,C.glass,[[belt+.035,w*.88,z0-.16,z1+.24],[belt+.14,w*.855,z0-.10,z1+.17],[h-.22,w*.745,z0+.15,z1-.21],[h-.095,w*.665,z0+.31,z1-.37]]);loft(a,'#ffffff',[[h-.105,w*.69,z0+.28,z1-.35],[h-.035,w*.66,z0+.32,z1-.39],[h,w*.60,z0+.39,z1-.46]]);for(const s of[-1,1]){box(a,'#ffffff',[s*w*.404,h*.72,-.18],[.06,h*.32,.105],[0,0,s*.12]);box(d,C.trim,[s*w*.485,.69,0],[.014,.025,l*.66]);box(d,C.rim,[s*w*.49,.83,-.55],[.018,.035,.19]);}}
 const R=bus?.46:van?.36:.31,axle=l*(bus?.31:.30);
 for(const s of[-1,1])for(const z of[-axle,axle]){d.add(new T.CylinderGeometry(R,R,.16,16),C.rubber,[s*(w/2-.08),R,z],[1,1,1],[0,0,Math.PI/2]);d.add(new T.CylinderGeometry(R*.59,R*.59,.014,12),C.rim,[s*(w/2-.010),R,z],[1,1,1],[0,0,Math.PI/2]);d.add(new T.CylinderGeometry(R*.21,R*.21,.02,10),C.trim,[s*(w/2-.010),R,z],[1,1,1],[0,0,Math.PI/2]);}
 for(const s of[-1,1]){box(d,C.light,[s*w*.32,bus?.72:.63,l*.481],[w*.23,.12,.025]);box(d,C.red,[s*w*.35,.65,-l*.481],[w*.17,.15,.025]);}for(const s of[-1,1])box(d,C.trim,[0,.37,s*l*.486],[w*.73,.085,.025]);box(d,C.trim,[0,.54,l*.489],[w*.40,.13,.02]);box(d,'#668a8c',[0,.43,l*.497],[.29,.09,.008]);if(t.id==='taxi'){box(d,'#c2a56c',[0,h+.07,0],[.45,.14,.20]);}
 return {paint:a.finish(),detail:d.finish()};}
export const OUTFITS=[{name:'slate commuter jacket',coat:'#465866',pants:'#39434b',bag:'#604d3e',skin:'#cda488'},{name:'sand overshirt backpack',coat:'#b7a489',pants:'#535a54',bag:'#455e55',skin:'#bd9379'},{name:'brick knit tote',coat:'#9c6354',pants:'#455665',bag:'#d2c5a9',skin:'#dab49b'}];
export function personModel(i){const b=builder(),o=OUTFITS[i]; // Normalized to 1.75m; true head height 0.23m.
 loft(b,o.coat,[[.83,.35,-.115,.115],[1.20,.42,-.13,.13],[1.40,.39,-.10,.12],[1.445,.24,-.085,.085]]);
 ellipsoid(b,o.skin,[0,1.46,0],[.061,.095,.063]);ellipsoid(b,o.skin,[0,1.605,.014],[.097,.125,.092]);
 // Hair cap only covers crown/back, leaving face and neck readable.
 b.add(new T.SphereGeometry(1,10,7,0,Math.PI*2,0,Math.PI*.53),'#322d29',[0,1.633,-.009],[.104,.108,.101]);ellipsoid(b,o.skin,[0,1.60,.099],[.022,.026,.024]);
 for(const s of[-1,1])ellipsoid(b,o.coat,[s*.205,1.365,0],[.085,.09,.10]);
 if(i===0){box(b,'#d6d3c7',[0,1.35,.112],[.09,.16,.014]);for(const s of[-1,1])box(b,'#394854',[s*.082,1.32,.132],[.045,.19,.017],[0,0,s*.3]);box(b,o.bag,[.29,.80,0],[.16,.24,.07]);}
 else if(i===1){ellipsoid(b,o.bag,[0,1.17,-.18],[.15,.21,.075]);for(const s of[-1,1])box(b,o.bag,[s*.15,1.26,.13],[.035,.29,.025]);}
 else{box(b,o.bag,[-.27,.90,.02],[.19,.30,.075]);for(const s of[-1,1])box(b,o.bag,[-.27+s*.06,1.11,.02],[.018,.15,.02]);}
 box(b,o.pants,[0,.84,0],[.32,.16,.21]);return b.finish();}
export function limbGeometry(){const b=builder();b.add(new T.CapsuleGeometry(.5,1,3,8),'#ffffff',[0,0,0],[1,.5,1]);return b.finish();}
