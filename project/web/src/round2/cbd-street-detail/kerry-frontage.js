/** Original shallow facade geometry bound to the known Kerry mall south edge.
 * Retains the existing source footprint, height and glazed-base setback.
 * Window/door counts and this 44m focus band are authored, not surveyed.
 */
import {Recipe} from '../../architecture/geometry.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {footprintEdges} from '../../architecture/site-massing.js';
import {project} from '../../geo.js';
const box=(r,m,x,y,z,w,h,d,label,shadow=false)=>{r.box(m,x,y,z,w,h,d,'CBD Kerry '+label);r.parts.at(-1).castShadow=shadow;};
export function kerryStreetFrontageRecipe({quality='std'}={}){
 const site=CBD_CONTEXT_SITES.kerry_mall_hotel,edge=footprintEdges(site.points).filter(e=>e.nz>.98).sort((a,b)=>b.length-a.length)[0],anchor=project(site.anchorWGS84),fine=quality!=='low',w=44,h=6.5,base=.8,faceZ=-.13,glassZ=-1.08;
 const r=new Recipe('Kerry south street-facing detail',{quality,buildings:0,sourceId:site.osmId,anchorWGS84:site.anchorWGS84,footprintUnchanged:true,heightUnchanged:true,bandWidth:w,source:'https://www.kerryprops.com/en/property-details/112/beijing-kerry-centre?location=1',evidence:'Owner exterior photograph: pale stone surround, bronze/dark metal grille, glazed ground-floor and slim canopy; known mapped mall footprint. Exact facade bay/door locations remain authoring assumptions.',noTextures:true});
 // Align the framed strip with the actual south edge, centred in the current
 // default street view. The dark backing sits in front of the old inset glass.
 box(r,'glassDark',0,base+h/2,glassZ,w,h,.055,'recessed first-floor shadow backing');
 const bw=w/8;
 for(let i=0;i<8;i++){const x=-w/2+(i+.5)*bw,door=i===2||i===6;
  box(r,i%3===0?'glassPale':'glass',x,base+h/2,glassZ+.04,bw-.28,h-.12,.055,'shopfront glass pane');
  for(const s of [-1,1]){box(r,'stoneLight',x+s*bw/2,base+h/2,(faceZ+glassZ)/2,.24,h,faceZ-glassZ+.1,'full-depth stone pier',true);box(r,'bronze',x+s*(bw-.25)/2,base+h/2,glassZ+.12,.075,h-.10,.12,'bronze inner glazing jamb');}
  if(!door)box(r,'stoneLight',x,base+.20,(faceZ+glassZ)/2,bw-.28,.40,faceZ-glassZ+.14,'shopfront grounded stone plinth',true);else for(const side of [-1,1])box(r,'stoneLight',x+side*(2.65+(bw-2.65)/2)/2,base+.20,(faceZ+glassZ)/2,(bw-2.65)/2-.15,.40,faceZ-glassZ+.14,'interrupted door-side stone plinth',true);
  box(r,'bronze',x,base+3.25,glassZ+.12,bw-.26,.11,.16,'glazing transom');
  if(fine)for(const sx of [-.25,.25])box(r,'bronze',x+sx*bw,base+4.85,glassZ+.12,.055,3.08,.13,'upper slender glazing mullion');
  if(door){const dw=2.45;box(r,'glassDark',x,base+1.61,glassZ+.11,dw+.18,3.22,.09,'paired door recess');for(const s of [-1,1]){box(r,'glassPale',x+s*dw/4,base+1.60,glassZ+.20,dw/2-.07,3.15,.055,'double door glazing');box(r,'bronze',x+s*dw/2,base+1.62,glassZ+.26,.075,3.24,.12,'door metal jamb',true);if(fine)box(r,'metalDark',x+s*.15,base+1.18,glassZ+.32,.032,.50,.055,'door pull handle');}box(r,'stoneDark',x,base+.025,glassZ+.43,dw+.25,.05,.66,'flush entrance threshold');const x0=x-dw/2-.30,x1=x+dw/2+.30,z0=glassZ+.30,z1=2.05,lo=.58,front=.65;const ramp={type:'mesh',flatShading:true,vertices:[x0,lo,z0,x1,lo,z0,x1,lo,z1,x0,lo,z1,x0,base,z0,x1,base,z0,x1,front,z1,x0,front,z1],indices:[4,7,6,4,6,5,0,1,2,0,2,3,0,4,5,0,5,1,3,2,6,3,6,7,0,3,7,0,7,4,1,5,6,1,6,2]};r.add(ramp,'paving',[0,0,0],[1,1,1],[0,0,0],'CBD Kerry gentle datum transition apron');r.parts.at(-1).castShadow=false;}
 }
 box(r,'stoneLight',0,base+h+.13,-.56,w+.12,.27,1.25,'continuous supported shopfront head',true);
 box(r,'metalDark',0,base-.06,-.55,w,.12,1.25,'wall-foot contact strip');
 // Upper grille has real gaps, projecting ribs and pale stone panel joints.
 // The existing bronze plane is the dark backing; no new wall or height added.
 const grilleBottom=8.05,grilleTop=17.1,rows=fine?33:17;
 for(let j=0;j<rows;j++)box(r,'bronze',0,grilleBottom+(grilleTop-grilleBottom)*j/(rows-1),.19,w-.55,fine?.105:.15,.22,'upper horizontal louver',true);
 const cols=fine?16:8;for(let i=0;i<=cols;i++)box(r,'metalDark',-w/2+i*w/cols,(grilleBottom+grilleTop)/2,.29,.055,grilleTop-grilleBottom,.16,'upper vertical grille tie',false);
 for(let i=0;i<=8;i++)box(r,'stoneLight',-w/2+i*bw,(grilleBottom+grilleTop)/2,.44,.26,grilleTop-grilleBottom+.3,.48,'projecting upper stone blade',true);
 for(const y of [7.5,17.5])box(r,'stoneDark',0,y,.14,w,.045,.06,'horizontal stone joint');
 const out=new Recipe(r.name,r.metadata),cx=edge.center[0]-3,cz=edge.center[1];out.merge(r,[anchor[0]+cx,0,anchor[1]+cz],edge.rotation);return out;
}
export const buildKerryStreetFrontage=(kit,options={})=>kit.buildMergedRecipe(kerryStreetFrontageRecipe(options));
