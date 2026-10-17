import{Recipe}from'./geometry.js';
import{GALAXY_LAYOUT as L}from'./galaxy-layout.js';
function bucket(){return{type:'mesh',vertices:[],indices:[]};}
function quad(g,a,b,c,d){g.indices.push(a,b,c,a,c,d);}
function point(g,x,y,z){const n=g.vertices.length/3;g.vertices.push(x,y,z);return n;}
export function galaxySohoRefined(o={}){
 const far=o.lod==='silhouette',near=!far&&o.detail>0,N=far?24:near?64:32,slices=far?6:near?18:10;
 const r=new Recipe('银河SOHO · Four asymmetric flowing volumes',{approx:true,source:L.source,anchorWGS84:L.anchorWGS84,geometryEvidence:L.accuracy,groundCourtyardCount:2,upperAtriumCount:4,heightAccuracy:'67m overall and individual67/65/58/54m peaks are approximate aerial proportions;no independent verified tower heights',replacesOsmIds:['osm-relation-6096147'],footprintScope:'Mapped149m east-west ×248m north-south; independent northwest low appendix retained'});
 for(const[i,g]of L.podiumGeometries.entries()){
  const h=i===0?12:9.2;r.add(g,'galaxyGlass',[0,0,0],[1,h,1],[0,0,0],i===0?'mapped continuous podium with two real courts':'separate northwest low retail appendix');
  for(const y of i===0?[.5,4.3,8.1,11.6]:[.5,4.2,8.7])r.add(g,'galaxyWhite',[0,y,0],[1,.5,1],[0,0,0],'actual-plan continuous lower white ribbon');
 }
 const glass=bucket(),white=bucket();
 for(const p of L.pods){
  const[cx,cz]=p.center,rx=p.upperRx,rz=p.upperRz;
  function baseRadius(a){const u=(a/(Math.PI*2)*64+64)%64,i=Math.floor(u),t=u-i;return p.radii[i]*(1-t)+p.radii[(i+1)%64]*t;}
  function radius(t,a){const b=baseRadius(a),e=1/Math.sqrt((Math.cos(a)/rx)**2+(Math.sin(a)/rz)**2),f=t*t;return Math.min(b*.85,b*(.85-.32*t)*(1-f)+e*f);}
  function outer(t,a){const rad=radius(t,a);return[cx+Math.cos(a)*rad,12+(p.heightApprox-12)*t,cz+Math.sin(a)*rad];}
  function inner(t,a){return[cx+Math.cos(a)*rx*.43,12+(p.heightApprox-12)*t,cz+Math.sin(a)*rz*.43];}
  const rings=[];
  for(let j=0;j<=slices;j++){const t=j/slices,oo=[],ii=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2;oo.push(point(glass,...outer(t,a)));ii.push(point(glass,...inner(t,a)));}rings.push({oo,ii});}
  for(let j=0;j<slices;j++)for(let i=0;i<N;i++){const k=(i+1)%N;quad(glass,rings[j].oo[i],rings[j+1].oo[i],rings[j+1].oo[k],rings[j].oo[k]);quad(glass,rings[j].ii[k],rings[j+1].ii[k],rings[j+1].ii[i],rings[j].ii[i]);}
  const floors=far?5:near?Math.round((p.heightApprox-12)/4):9;
  for(let j=0;j<=floors;j++){
   const t=j/floors,y=12+(p.heightApprox-12)*t,bandHeight=j===floors?.65:far?3.0:near?1.35:1.85,ring=[];
   for(let i=0;i<N;i++){const a=i/N*Math.PI*2,q=outer(t,a),bottom=outer(Math.max(0,t-bandHeight/(p.heightApprox-12)),a),rad=radius(t,a),isRoof=j===floors,ir=isRoof?1/Math.sqrt((Math.cos(a)/(rx*.43))**2+(Math.sin(a)/(rz*.43))**2):rad*.965,topX=cx+(q[0]-cx)*1.0005,topZ=cz+(q[2]-cz)*1.0005,baseX=cx+(bottom[0]-cx)*1.0005,baseZ=cz+(bottom[2]-cz)*1.0005;ring.push([point(white,baseX,y-bandHeight,baseZ),point(white,topX,y,topZ),point(white,cx+Math.cos(a)*ir,y,cz+Math.sin(a)*ir)]);}
   for(let i=0;i<N;i++){const k=(i+1)%N;quad(white,ring[i][0],ring[i][1],ring[k][1],ring[k][0]);quad(white,ring[i][1],ring[i][2],ring[k][2],ring[k][1]);}
  }
 }
 r.add(glass,'galaxyGlass',[0,0,0],[1,1,1],[0,0,0],'four asymmetric curved glass shells and upper atrium walls');
 r.add(white,'galaxyWhite',[0,0,0],[1,1,1],[0,0,0],'continuous flowing white upper ribbons and four open roof mouths');
 // Curved connections between lobes are low and slender; original ground courts stay open.
 if(!far){for(const[a,b,y,w]of[[[24,-22],[27,-11],20,12],[[-43,0],[-42,12],18,11],[[-19,-48],[-28,-41],24,10]]){
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx);r.box('galaxyWhite',(a[0]+b[0])/2,y,(a[1]+b[1])/2,len,1.0,w,'approximate elevated connecting ribbon',angle);
 }}
 return r;
}

export const GALAXY_MATERIALS={galaxyWhite:{color:'#e6e8df',roughness:.82,metalness:.02},galaxyGlass:{color:'#9caeac',roughness:.58,metalness:.06}};
