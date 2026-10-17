import{Recipe,annulusGeometry,beam}from'./geometry.js';
import{mappedBody,footprintEdges,edgePanel}from'./site-massing.js';
import{COMPOUND_COMPONENTS as C}from'./compound-layout.js';
export function ancientObservatoryRefined(o={}){
 const site=C['osm-way-412429961'],[cx,cz]=site.platformCenterXZ,far=o.lod==='silhouette';
 const r=new Recipe('北京古观象台 · Beijing Ancient Observatory',{
  replacesOsmIds:['osm-way-412429961'],anchorWGS84:site.anchorWGS84,placementRotation:0,
  scope:'Mapped T-shaped rampart/platform only; preserve independent western museum buildings',
  platformTopDimensions:[23.9,20.4],platformCenterXZ:[cx,cz],platformCenterAccuracy:site.platformCenterAccuracy,
  heightAccuracy:'Approximate13.4m deck/14m parapet; instrument heights and positions photo-proportioned',
  referencePhoto:'assets/architecture/research/ancient_observatory.jpg'
 });
 mappedBody(r,site.points,0,13.4,'greyBrick','actual T-shaped observatory platform and narrow eastern rampart');
 for(const edge of footprintEdges(site.points))edgePanel(r,edge,'greyBrickDark',edge.length/2,13.7,edge.length,.6,.75,'mapped rampart low parapet',-.40);
 r.box('stoneDark',cx,13.43,cz,23.9,.06,20.4,'published observatory top dimensions at inferred center');
 const ring=annulusGeometry(.91,far?12:32),positions=[[-7.5,-6],[0,-6],[7.5,-6],[-7.5,6],[0,6],[7.5,6],[-3,0],[4,0]];
 positions.forEach(([dx,dz],i)=>{
  const x=cx+dx,z=cz+dz,rad=i%3===0?1.7:1.35,cy=16.9;
  r.box('stoneDark',x,14.15,z,2.7,1.4,2.7,'astronomical instrument stone pedestal');
  for(const sign of[-1,1])r.cylinder('bronze',x+sign*.65,15.2,z,.15,1.6,'paired bronze instrument stand',8);
  if(i===4){r.sphere('bronze',x,16.4,z,1.35,1.35,1.35,'celestial globe approximate bronze sphere');return;}
  if(i===1||i===6){
   for(const sx of[-1,1])beam(r,'bronze',[x+sx*rad,15,z],[x+sx*rad,18,z],.12,'quadrant instrument tall side frame');
   beam(r,'bronze',[x-rad,18,z],[x+rad,18,z],.11,'quadrant upper crossbar');
   r.add(ring,'bronze',[x,16.5,z],[rad,.07,rad],[Math.PI/2,0,0],'quadrant measuring circle');
  }else{
   for(let k=0;k<(far?2:3);k++)r.add(ring,'bronze',[x,cy,z],[rad,.075,rad],[Math.PI/2,k*Math.PI/3,0],'bronze armillary great circle');
   r.add(ring,'bronze',[x,cy,z],[rad,.075,rad],[.25,0,0],'instrument celestial equator');
   beam(r,'bronze',[x-rad,cy-.8,z],[x+rad,cy+.8,z],.08,'astronomical instrument axis');
  }
 });
 return r;
}
