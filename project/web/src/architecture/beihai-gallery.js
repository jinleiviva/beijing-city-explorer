import{Recipe}from'./geometry.js';
import{BEIHAI_GALLERY_SITE as SITE}from'./beihai-gallery-layout.js';

function inRing(x,z,ring){let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
export function galleryContains(x,z){return inRing(x,z,SITE.rings[0])&&!SITE.rings.slice(1).some(r=>inRing(x,z,r));}
function safeRect(x,z,w,d,angle){const c=Math.cos(angle),s=Math.sin(angle);for(const u of[-.5,0,.5])for(const v of[-.5,0,.5])if(!galleryContains(x+u*w*c+v*d*s,z-u*w*s+v*d*c))return false;return true;}
/** Geographically draped thin gallery; dimensions/pavilion cuts remain approximate. */
export function beihaiNorthGallery(o={}){
 const far=o.lod==='silhouette',near=!far&&o.detail>0,ground=typeof o.groundAt==='function'?o.groundAt:()=>0;
 const groundAt=(x,z)=>{const h=Number(ground(x,z));return Number.isFinite(h)?h:0;};
 const r=new Recipe('北海北岸弧形游廊 · Three mapped open courtyards',{family:SITE.family,approx:true,extraContextNotCountedIn45:true,replacesOsmIds:[SITE.osmId],anchorWGS84:SITE.anchorWGS84,drapeTerrain:true,courtyardCount:3,source:SITE.source,reference:SITE.reference,accuracy:SITE.accuracy,terrain:'Each roof/floor vertex and each post base samples supplied groundAt; no compound-wide maximum plinth',pavilionAttribution:'Two double-storey roof accents inferred from aerial, not separately mapped named structures',heightAccuracy:'Photo-proportioned 4.7m galleries and 8.35m pavilions, approximate'});
 // The floor and all upward roof faces have been clipped against the original
 // polygon plus three inner rings. No large box or triangle can close a court.
 const f=SITE.floorGeometry,vertices=f.vertices.map((v,i,a)=>i%3===1?v+groundAt(a[i-1],a[i+1]):v);
 r.add({...f,vertices},'stoneDark',[0,0,0],[1,1,1],[0,0,0],'actual three-hole draped gallery paving');
 const rv=[],ri=[];
 for(const seg of SITE.segments){const g=seg.roofGeometry,n=rv.length/3;for(let i=0;i<g.vertices.length;i+=3){const[x,y,z]=g.vertices.slice(i,i+3);rv.push(x,y+groundAt(x,z),z);}ri.push(...g.indices.map(i=>i+n));}
 r.add({type:'mesh',vertices:rv,indices:ri},'roofGrey',[0,0,0],[1,1,1],[0,0,0],'clipped continuous grey gallery roof with three actual open courts');
 const posts=new Set();
 function post(x,z,top){const key=[Math.round(x*10),Math.round(z*10)].join(',');if(posts.has(key)||!safeRect(x,z,.26,.26,0))return;posts.add(key);const base=groundAt(x,z)+.22,h=top-.22;if(near)r.cylinder('greenBeam',x,base+h/2,z,.13,h,'round green open-gallery column',8);else r.box('greenBeam',x,base+h/2,z,.25,h,.25,'green open-gallery column');}
 function box(material,x,y,z,w,h,d,label,angle=0){if(!safeRect(x,z,w,d,angle))return;r.box(material,x,y+groundAt(x,z),z,w,h,d,label,angle);}
 for(const seg of SITE.segments){
  const[cx,cz]=seg.center,c=Math.cos(seg.angle),s=Math.sin(seg.angle),w=seg.length,dep=seg.width,top=seg.roofY;
  if(seg.type==='pavilion-upper'){
   // Upper storey set back under the thinner roof; preserve the lower colonnade.
   box('vermilionDark',cx,5.7,cz,w*.75,1.9,dep*.50,'approximate two-storey pavilion upper enclosure',seg.angle);
   for(const sign of[-1,1]){
    const z=sign*dep*.26;box('paintedWood',cx+z*s,5.8,cz+z*c,w*.70,1.4,.08,'pavilion upper red lattice band',seg.angle);
    for(let j=0;j<=6;j++){const x=(j/6-.5)*w*.70;box('greenBeam',cx+x*c+z*s,5.8,cz-x*s+z*c,.10,1.8,.10,'pavilion upper wooden pilaster',seg.angle);}
   }
   continue;
  }
  const count=Math.max(1,Math.ceil(w/(far?7:3.6))),edge=dep*.35;
  for(const sign of[-1,1]){
   const z=sign*edge;
   for(let j=0;j<=count;j++){const x=(j/count-.5)*w;post(cx+x*c+z*s,cz-x*s+z*c,top-.12);}
   box('greenBeam',cx+z*s,top-.28,cz+z*c,w,.32,.22,'continuous painted gallery eave beam',seg.angle);
   // Open lake edge rail, not a solid wall. More detailed red crossrails only near.
   if(!far){box('greenBeam',cx+z*s,.87,cz+z*c,w,.10,.10,'open gallery low handrail',seg.angle);if(near)box('vermilionDark',cx+z*s,.43,cz+z*c,w,.08,.08,'fine gallery red rail',seg.angle);}
  }
  // A few short landward screens give the photographed red/white lattice rhythm.
  // They remain sparse, preserving clear views through the main arcade.
  if(near&&seg.type==='gallery'&&seg.width<4.5){const z=dep*.30;box('vermilionDark',cx+z*s,1.35,cz+z*c,w*.32,2.2,.10,'partial landward historic screen',seg.angle);for(const u of[-.11,0,.11])box('stone',cx+u*w*c+z*s,1.65,cz-u*w*s+z*c,.055,1.3,.12,'fine white lattice vertical',seg.angle);}
 }
 r.metadata.postCount=posts.size;return r;
}
