/** TVCC: actual site, north-up OMA plan, photo-informed folded envelope. */
import {Recipe} from './geometry.js';
import {mappedBody,polygonPrism} from './site-massing.js';
import {CBD_CONTEXT_SITES} from './cbd-context-sites.js';

// OMA landscape plan establishes east hotel / west theatre. Fold stations,
// room counts and sub-footprint dimensions are approximate, not OSM surveys.
export const TVCC_FOLD=[[-72,3],[-45,39],[4,26],[17,78],[22,159],[67,156],[70,57],[83,3]];
function north(x){return -51.298+(x+71.686)*41.177/170.455+1.4;}
function south(x){return 29.053+(x+85.612)*7.926/173.563-1.4;}
function strip(a,b,z0a,z1a,z0b,z1b,offset=0){
 const vertices=[a[0],a[1]+offset,z0a,b[0],b[1]+offset,z0b,b[0],b[1]+offset,z1b,a[0],a[1]+offset,z1a];
 // X progresses west-to-east; +Y outward on rising/falling roof segments.
 return {type:'mesh',vertices,indices:[0,3,2,0,2,1],flatShading:true};
}
export function tvccContext(o={}){
 const site=CBD_CONTEXT_SITES.tvcc_context,far=o.lod==='silhouette'||o.detail===-1,detail=far?0:(o.detail??1);
 const r=new Recipe('TVCC · 电视文化中心',{
  family:'tvcc_context',approx:true,fixedGeographicOrientation:true,rotation:0,
  osmId:site.osmId,anchorWGS84:site.anchorWGS84,width:site.width,depth:site.depth,height:159,
  replacesOsmIds:[site.osmId],countedAmong45Landmarks:false,
  heightSource:'https://www.skyscrapercenter.com/building/id/3418',
  layoutSource:'https://cdn.archilovers.com/projects/97aa0fed-c5a7-4c2e-bb7a-f632aefde458.pdf',
  layoutAccuracy:'East tower / west theatre verified in OMA north-up landscape plan; internal stations photo-proportioned approximate',
  unknowns:['Exact hotel footprint','Podium roof heights','Roof fold stations and glazing module count'],
  scope:'Full actual combined ground footprint; only eastern hotel rises159m',lod:far?'silhouette':detail?'detailed':'medium'
 });
 mappedBody(r,site.points,0,1.2,'concrete','TVCC actual combined site low plinth');
 // Use a closed glazed cross-section with locally tapering north/south edges.
 // Swapping extrusion Y/Z reverses orientation, so reverse each triangle.
 const profile=[[-72,1.2],...TVCC_FOLD.map(([x,y])=>[x,Math.max(2,y-1.15)]),[83,1.2]],g=polygonPrism(profile,0,1);
 for(let i=0;i<g.vertices.length;i+=3){const x=g.vertices[i],t=g.vertices[i+1],y=g.vertices[i+2];g.vertices[i+1]=y;g.vertices[i+2]=north(x)+(south(x)-north(x))*t;}
 for(let i=0;i<g.indices.length;i+=3)[g.indices[i+1],g.indices[i+2]]=[g.indices[i+2],g.indices[i+1]];
 r.add(g,'tvccGlass',[0,0,0],[1,1,1],[0,0,0],'TVCC tapered glazed theatre and eastern hotel core');
 // One continuous folded metal ribbon, with a distinct top overhang.
 for(let i=0;i<TVCC_FOLD.length-1;i++){
  const a=TVCC_FOLD[i],b=TVCC_FOLD[i+1],na=north(a[0])-.65,nb=north(b[0])-.65,sa=south(a[0])+.65,sb=south(b[0])+.65;
  r.add(strip(a,b,na,sa,nb,sb),'tvccMetal',[0,0,0],[1,1,1],[0,0,0],'TVCC continuous titanium-zinc folded skin');
  const count=far?0:detail>0?38:17;
  for(let j=0;j<count;j++){
   const t=(j+.5)/count,th=detail>0?.12:.20;
   r.add(strip(a,b,na+(sa-na)*t-th,na+(sa-na)*t+th,nb+(sb-nb)*t-th,nb+(sb-nb)*t+th,.12),'silverFacade',[0,0,0],[1,1,1],[0,0,0],'TVCC thin standing seam metal rib');
  }
 }
 // The south hotel facade is pixellated; north stays predominantly flat.
 const cols=far?4:detail>0?8:5,rows=far?4:detail>0?17:9;
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const bw=39/cols,fh=98/rows,x=25+(i+.5)*bw,y=44+(j+.5)*fh,z=south(x),push=((i*7+j*3)%5===0?2.5:1.15);
  r.box('tvccGlass',x,y,z+push*.5,bw-.28,fh-.28,push,'TVCC irregular south hotel room projection');
  if(!far&&detail>0)r.box('silverFacade',x,y-fh/2+.1,z+push,bw-.15,.12,.12,'TVCC south hotel module silver sill');
 }
 // Large dark upper atrium recess under a thick roof edge remains visible at all LODs.
 for(const sign of[-1,1]){
  const z=sign<0?north(45):south(45);
  r.box('tvccGlass',44.5,149.5,z+sign*.08,41,12,.22,'TVCC upper recessed atrium glass');
  r.box('tvccMetal',44.5,156.7,z+sign*.32,44,1.25,1.0,'TVCC thick upper metal frame');
 }
 if(!far){
  for(let j=0;j<14;j++)r.box('silverFacade',44.3,47+j*7.1,north(44.3)-.10,40,.13,.14,'TVCC restrained flat north glazing transom');
  for(let i=0;i<8;i++)r.box('silverFacade',25+i*5.4,96,north(25+i*5.4)-.11,.12,98,.14,'TVCC restrained flat north glazing mullion');
  r.box('tvccGlass',79,5.3,12,8,8,18,'TVCC east hotel drop-off entrance');
  r.box('tvccMetal',81,9.6,12,11,.5,20,'TVCC east entrance canopy');
 }
 // Bake raw unit-transform skin/rib quads once per material, not one draw per seam.
 const buckets=new Map(),keep=[];
 for(const p of r.parts){
  if(!/continuous titanium-zinc folded skin|thin standing seam metal rib/.test(p.label)){keep.push(p);continue;}
  if(!buckets.has(p.material))buckets.set(p.material,{type:'mesh',vertices:[],indices:[],flatShading:true});
  const g=buckets.get(p.material),base=g.vertices.length/3;g.vertices.push(...p.geometry.vertices);g.indices.push(...p.geometry.indices.map(i=>i+base));
 }
 r.parts=keep;
 for(const [material,g]of buckets){
  const rib=material==='silverFacade';
  r.add(g,material,[0,0,0],[1,1,1],[0,0,0],rib?'TVCC merged fine standing-seam rib field':'TVCC merged continuous folded metal envelope');
  if(rib)r.parts[r.parts.length-1].castShadow=false;
 }
 return r;
}
