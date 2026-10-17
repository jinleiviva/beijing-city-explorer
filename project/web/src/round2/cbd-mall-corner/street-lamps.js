/** Three existing Guanghua Road lamp stations, with modern photo-informed heads.
 * Positions are inherited from the existing street generator, not surveyed pole
 * coordinates. The reference supports a slim silver single-arm road fixture;
 * taper, service panel, fasteners and dimensions are authored approximations.
 * No PointLight or extra shadow map is created. The lens is a daylight surface.
 */
import {Recipe,beam,CHAMFER_BOX} from '../../architecture/geometry.js';
import {MALL_CORNER_SOURCE} from './index.js';

export function createMallLampDetail(){
 const stations=[];
 return {
  stations,
  replace(p){
   if(p.form!=='modern'||p.roadId!=='osm-way-1147350758'||p.x<4640||p.x>4725||p.z< -366||p.z> -357)return false;
   stations.push({...p});return true;
  },
  build(kit,groundAt){
   const materials={mallLampSilver:['silverFacade','#a4acad',.52,.38],mallLampHousing:['metalDark','#39454a',.65,.20],mallLampLens:['marble','#dce1cf',.68,0]};
   for(const[name,[base,color,roughness,metalness]]of Object.entries(materials))if(!kit.materials[name]){const m=kit.materials[base].clone();m.name=name;m.color.set(color);m.roughness=roughness;m.metalness=metalness;if(name==='mallLampLens'){m.emissive.set('#cbd8c2');m.emissiveIntensity=.035;}kit.materials[name]=m;}
   const r=new Recipe('Guanghua mall three grounded modern single-arm lamps',{buildings:0,source:MALL_CORNER_SOURCE,accuracy:'Photo-informed fixture family; existing procedural road-side stations retained. Exact dimensions and service hardware authored, not surveyed.',replacesExistingStations:true,placements:[],noNewLightObjects:true,daylightLensOnly:true});
   for(const p of stations){
    const groundY=groundAt(p.x,p.z),dx=-p.nx*p.side,dz=-p.nz*p.side,yaw=Math.atan2(dx,dz),local=new Recipe('One tapered single-arm streetlight');
    const b=(m,x,y,z,w,h,d,label,shadow=true)=>{local.box(m,x,y,z,w,h,d,'Mall lamp '+label);local.parts.at(-1).castShadow=shadow;};
    b('stoneDark',0,.07,0,.48,.14,.48,'grounded pavement socket');
    b('mallLampHousing',0,.158,0,.29,.036,.29,'anchored base plate');
    local.cylinder('mallLampSilver',0,4.45,0,.112,8.62,'Mall lamp tapered 224mm base shaft',12,.58);local.parts.at(-1).castShadow=true;
    for(const x of[-.10,.10])for(const z of[-.10,.10]){local.cylinder('mallLampHousing',x,.188,z,.019,.025,'Mall lamp base fastener',6);local.parts.at(-1).castShadow=false;}
    b('mallLampHousing',0,.69,.108,.115,.34,.018,'flush maintenance cover',false);
    b('mallLampSilver',0,.69,.119,.076,.25,.008,'maintenance panel inset',false);
    // A supported, softly bent steel arm, rather than a flat floating bar.
    const arm=[[0,8.65,0],[0,8.89,.28],[0,9.10,.85],[0,9.12,1.64]];
    for(let i=1;i<arm.length;i++){beam(local,'mallLampSilver',arm[i-1],arm[i],.056,'Mall lamp connected single swept arm');local.parts.at(-1).castShadow=true;}
    local.add(CHAMFER_BOX,'mallLampHousing',[0,9.10,1.88],[.37,.20,1.08],[0,0,0],'Mall lamp chamfered LED head housing');local.parts.at(-1).castShadow=true;
    b('mallLampLens',0,8.992,1.94,.29,.018,.78,'recessed daylight diffuser',false);
    for(const x of[-.075,0,.075])b('mallLampSilver',x,8.979,1.94,.014,.012,.67,'lens cell divider',false);
    b('mallLampSilver',0,9.215,1.86,.25,.025,.69,'head upper cooling panel',false);
    r.merge(local,[p.x,groundY,p.z],yaw);
    r.metadata.placements.push({roadId:p.roadId,streetId:p.streetId,base:[p.x,groundY,p.z],head:[p.x+dx*1.88,groundY+9.10,p.z+dz*1.88],headSize:[.37,.20,1.08],armDirection:[dx,dz],poleDiameterBase:.224,poleHeight:8.76,fullHeight:9.24,originalHeight:p.height,sameStation:true});
   }
   const group=kit.buildMergedRecipe(r);group.name='Three photo-informed Guanghua streetlights';return group;
  }
 };
}
