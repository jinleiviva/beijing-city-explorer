/** Two original, additive CBD entrance candidates. Metres, X east / Z south.
 * Existing tower/mall recipes, source footprints and public materials stay untouched.
 * No textures, brand marks, browser startup, renderer, or automatic scene mutation.
 */
import {Recipe} from '../../architecture/geometry.js';
import {footprintEdges} from '../../architecture/site-massing.js';
import {MASSING_LAYOUT} from '../../architecture/massing-layout.js';
import {CBD_CONTEXT_SITES} from '../../architecture/cbd-context-sites.js';
import {project} from '../../geo.js';

export const CBD_FRONTAGE_IDS = Object.freeze(['china_world_3_west', 'cwtc_mall_north_nw']);
export const CBD_FRONTAGE_LIMITS = Object.freeze({triangles:15000, mergedMaterialBatches:12, textureBytes:0});
// Both entrances and both hedge groups are inside the actual commercial
// land-use surfaces. urban-context.js emits those surfaces at Y=-.02, not .8.
export const CBD_FRONTAGE_GROUND_Y = -.02;
export const CBD_SHRUB_BEDS = Object.freeze([
  Object.freeze({id:'mall_north_low_hedge_west',center:Object.freeze([11.5,-32.4]),length:5.8,depth:1.45}),
  Object.freeze({id:'mall_north_low_hedge_east',center:Object.freeze([22.5,-32.4]),length:5.8,depth:1.45}),
]);
export const CBD_FRONTAGE_REFERENCES = Object.freeze({
  threeA:'https://www.som.com/projects/china-world-trade-center-3a/',
  threeAEntranceSide:'https://www.somchina.cn/story/%E7%94%A8%E4%B8%80%E5%BA%A7%E6%A5%BC%EF%BC%8C%E5%AE%9A%E4%B9%89%E4%B8%80%E5%BA%A7%E5%9F%8E%EF%BC%9Asom%E5%85%A8%E7%90%83%E6%91%A9%E5%A4%A9%E5%A4%A7%E6%A5%BC%E5%B7%A1%E7%A4%BC/',
  threeB:'https://www.som.com/projects/china-world-trade-center-3b/',
  mall:'https://commons.wikimedia.org/wiki/File:Intersection_of_Guanghua_Road_and_Jintong_East_Road_20260719151718.jpg',
  kerry:'https://www.kerryprops.com/en/property-details/68/beijing-kerry-centre?location=1',
});

/** Return a copied binding, so no caller can mutate the shared source layout. */
export function getCBDFrontageBinding(id) {
  let footprint, anchorWGS84, edge, sourceId, width, portalWidth, portalHeight, canopyHeight;
  if (id==='china_world_3_west') {
    const site=MASSING_LAYOUT.china_world_3;
    footprint=site.polygons[0][0].map(p=>[...p]); anchorWGS84=[...site.anchor];
    edge=footprintEdges(footprint).filter(e=>e.nx<-.98).sort((a,b)=>b.length-a.length)[0];
    sourceId='osm-way-116944490'; width=24; portalWidth=9.6; portalHeight=6.3; canopyHeight=5.4;
  } else if (id==='cwtc_mall_north_nw') {
    const site=CBD_CONTEXT_SITES.cwtc_mall_north;
    footprint=site.points.map(p=>[...p]); anchorWGS84=[...site.anchorWGS84];
    // The short north-facing edge in the west half is the mapped L-shaped recess.
    // Do not substitute the longer east/north roof edge or re-centre the footprint.
    edge=footprintEdges(footprint).filter(e=>e.nz<-.98&&e.center[0]<0).sort((a,b)=>b.length-a.length)[0];
    sourceId=site.osmId; width=16; portalWidth=6.8; portalHeight=5.8; canopyHeight=4.65;
  } else throw new Error(`Unknown CBD frontage candidate: ${id}`);
  if (!edge) throw new Error(`Expected mapped frontage edge missing: ${id}`);
  const along=id==='china_world_3_west'?.5:.35, t=along;
  const edgeOrigin=[edge.a[0]+(edge.b[0]-edge.a[0])*t, edge.a[1]+(edge.b[1]-edge.a[1])*t];
  return {
    id, sourceId, parentId:id==='china_world_3_west'?'china_world_3':'cwtc_mall_north',
    anchorWGS84, footprint, edge:{...edge,a:[...edge.a],b:[...edge.b],center:[...edge.center]},
    edgeOrigin, along, width, portalWidth, portalHeight, canopyHeight,
    rotation:0, moduleRotation:edge.rotation, normal:[edge.nx,edge.nz],
    hostHeight:id==='china_world_3_west'?330:27.5,
    source:id==='china_world_3_west'?CBD_FRONTAGE_REFERENCES.threeAEntranceSide:CBD_FRONTAGE_REFERENCES.mall,
    evidence:id==='china_world_3_west'
      ? {footprint:'existing actual OSM tower footprint',side:'SOM text: office west / hotel east',detail:'authored candidate; exact 3A opening, canopy and steps unverified; 3B photo is only a typology comparison'}
      : {footprint:'existing actual OSM L-shaped mall footprint',side:'NW corner visible in July 2026 street photograph',detail:'glazed recessed ground floor and pale frame photo-supported; exact bay count, entrance centre, canopy and steps inferred'},
  };
}

function box(r,m,x,y,z,w,h,d,label,structural=false) {
  r.box(m,x,y,z,w,h,d,`cbd frontage ${label}`);
  // Stable material/shadow grouping. Windows do not become a second shadow pass.
  r.parts.at(-1).castShadow=structural;
}
function frame(r,x,y,z,w,h,d=.16) {
  for (const s of [-1,1]) {
    box(r,'silverFacade',x+s*w/2,y,z,.105,h+.105,d,'vertical glazing frame',true);
    box(r,'silverFacade',x,y+s*h/2,z,w,.105,d,'horizontal glazing frame',true);
  }
}

/** Closed eight-vertex wedge: high at back z0, meets the apron at front z1. */
function rampGeometry(x0,x1,z0,z1,low,high) {
  return {type:'mesh',flatShading:true,
    vertices:[x0,low,z0, x1,low,z0, x1,low,z1, x0,low,z1,
      x0,high,z0, x1,high,z0, x1,low+.014,z1, x0,low+.014,z1],
    indices:[4,7,6,4,6,5, 0,1,2,0,2,3, 0,4,5,0,5,1,
      3,2,6,3,6,7, 0,3,7,0,7,4, 1,5,6,1,6,2]};
}

function makeEntrance(binding, quality) {
  const r=new Recipe(binding.id),w=binding.width,pw=binding.portalWidth;
  const tower=binding.parentId==='china_world_3', fine=quality==='std';
  const datum=.02, landing=.26, head=binding.portalHeight, reveal=tower?.92:.76;
  const back=.075, glass=.13, canopyD=tower?3.15:2.55, canopyW=pw+(tower?4.6:3.5);
  const mullionTop=tower?9.3:7.45, doorH=3.08;

  // Opaque shallow backing is in front of the existing host: no hidden Boolean
  // cut, no coplanar duplicate wall. Recess is measured from the new jamb plane.
  box(r,'glassDark',0,(landing+head)/2,back,w,head-landing,.05,'recessed dark lobby backing');
  box(r,'paving',0,datum/2,1.85,w+.7,datum,3.7,'grounded entrance apron');
  box(r,'paving',0,landing/2,.53,w,landing,1.06,'raised lobby landing');
  box(r,'metalDark',0,datum+.045,.065,w,.09,.12,'wall foot contact strip');

  // Adjacent fixed lights have full reveals and caps, rather than painted strips.
  const wing=(w-pw)/2, wingN=tower?3:2;
  for(const sign of [-1,1]) for(let i=0;i<wingN;i++) {
    const bayW=(wing-.24)/wingN, x=sign*(pw/2+.12+bayW*(i+.5));
    const sill=landing+.42, h=head-sill-.12, cy=sill+h/2;
    box(r,'glassPale',x,cy,glass,bayW-.18,h,.045,'recessed side window');
    frame(r,x,cy,reveal,bayW-.12,h,.15);
    for(const s of [-1,1])box(r,'silverFacade',x+s*(bayW-.12)/2,cy,(reveal+glass)/2,.11,h,reveal-glass,'window jamb return',true);
    box(r,'stoneLight',x,landing+.19,.53,bayW-.12,.38,1.06,'side window stone plinth',true);
    box(r,'stoneLight',x,sill-.035,.61,bayW+.03,.07,1.2,'projecting window sill',true);
    if(fine)box(r,'silverFacade',x,cy,reveal+.015,.055,h,.12,'secondary glazing subdivision',true);
  }

  // A pair of distinct double-door units; no invented tenant name or logo.
  const unitW=tower?3.35:2.65, units=[-pw*.25,pw*.25];
  for(const cx of units) {
    const cy=landing+doorH/2;
    box(r,'glassDark',cx,cy,.11,unitW+.18,doorH+.12,.045,'door recess shadow');
    for(const s of [-1,1]) {
      const x=cx+s*unitW/4;
      box(r,'glassPale',x,cy,.18,unitW/2-.08,doorH-.07,.045,'recessed double glass door');
      frame(r,x,cy,.245,unitW/2-.03,doorH,.10);
      if(fine)box(r,'metalDark',cx+s*.19,landing+1.20,.34,.036,.48,.06,'door pull handle');
    }
    box(r,'silverFacade',cx,landing+doorH+.10,.32,unitW+.36,.20,.34,'door transom head',true);
    box(r,'metalDark',cx,landing+.018,.38,unitW+.12,.036,.56,'flush door threshold');
    const fanH=head-(landing+doorH)-.31;
    box(r,'glassPale',cx,head-fanH/2-.12,glass,unitW,fanH,.05,'recessed transom glazing');
  }
  for(const x of [-pw/2,0,pw/2]) {
    box(r,'silverFacade',x,(landing+head)/2,(reveal+glass)/2,.20,head-landing,reveal-glass,'portal deep jamb',true);
    box(r,'stoneLight',x,landing+.09,reveal-.10,.32,.18,.32,'portal jamb foot',true);
  }
  box(r,'silverFacade',0,head-.13,(reveal+glass)/2,pw+.25,.26,reveal-glass+.13,'deep portal soffit',true);
  box(r,'metalDark',0,head+.11,reveal-.09,pw+.5,.22,.20,'blank unbranded entrance lintel');

  // Restrained canopy: a pale underside, slim opaque glazed infill, perimeter
  // frame and real projecting beams. Posts reach the landing, not open air.
  const cy=binding.canopyHeight, cz=.40+canopyD/2;
  box(r,'glassPale',0,cy,cz,canopyW,.075,canopyD,'canopy glazed infill');
  box(r,'silverFacade',0,cy-.105,cz,canopyW+.22,.14,canopyD+.08,'canopy underside tray',true);
  for(const s of [-1,1]) {
    box(r,'silverFacade',s*(canopyW/2+.02),cy+.01,cz,.16,.24,canopyD+.19,'canopy side fascia',true);
    box(r,'silverFacade',0,cy+.01,cz+s*canopyD/2,canopyW,.24,.16,'canopy edge fascia',true);
    const px=s*(canopyW/2-.65),pz=canopyD-.18;
    box(r,'silverFacade',px,(cy+landing)/2,pz,.18,cy-landing,.18,'canopy supported post',true);
    box(r,'stoneLight',px,.13,pz,.36,.26,.36,'canopy post ground socket',true);
  }
  const ribs=fine?7:3;
  for(let i=0;i<ribs;i++)box(r,'silverFacade',-canopyW*.43+i*canopyW*.86/(ribs-1),cy-.19,cz,.12,.13,canopyD-.12,'canopy structural cross rib',true);

  // Readable human-scale first-floor rhythm survives low quality.
  for(let i=0;i<=(fine?10:5);i++) {
    const n=fine?10:5,x=-w/2+i*w/n;
    box(r,'silverFacade',x,(mullionTop+head)/2,.38,.15,mullionTop-head,.42,'upper lobby vertical blade',true);
  }
  box(r,'silverFacade',0,head+.05,.43,w,.13,.40,'continuous first-floor head',true);
  box(r,'glassPale',0,(head+mullionTop)/2,.095,w,mullionTop-head,.035,'upper lobby glazing overlay');

  // Two broad 12 cm risers, a 1:12.5 side ramp, and landing/apron all physically
  // meet. Dimensions are an authored access treatment, not a surveyed staircase.
  const stairW=pw+.8;
  box(r,'paving',0,.07,1.91,stairW,.14,1.64,'outer low entrance step');
  box(r,'paving',0,.20,1.36,stairW-.34,.12,.65,'inner entrance step');
  for(const [y,z] of [[.145,2.70],[.265,1.66]])box(r,'metalDark',0,y,z,stairW-.45,.009,.045,'subtle step nosing');
  const rampX=stairW/2+.98;
  r.add(rampGeometry(rampX-.78,rampX+.78,.66,3.66,datum,landing),'paving',[0,0,0],[1,1,1],[0,0,0],'cbd frontage side access ramp');
  r.parts.at(-1).castShadow=false;
  // Edge blocks are interrupted across the entrance and ramp, so no full-width
  // curb traps the access route. This is a local apron edge, not a relocated road.
  const clear=stairW/2+2.0;
  for(const s of [-1,1]) {
    const available=w/2+.35-clear;
    if(available>0)box(r,'stoneLight',s*(clear+available/2),.075,3.62,available,.15,.16,'short apron edge curb',true);
  }
  box(r,'metalDark',0,datum+.007,3.32,stairW,.014,.12,'flush entrance drainage channel');
  if(fine)for(let i=0;i<12;i++)box(r,'paving',-stairW*.46+i*stairW*.92/11,datum+.015,3.32,.045,.008,.12,'drain transverse slot');
  r.metadata={landingHeight:landing,apronHeight:datum,doorRecess:reveal-.245,windowRecess:reveal-glass,
    portalFront:reveal,glassPlane:glass,canopyClearance:cy-.26-landing,maxProjection:3.70,
    doorClearWidthPerUnit:unitW-.18,accessRamp:{width:1.56,length:3,rise:landing-datum,slope:1/12.5},
    inferredDetails:['opening count','entrance centre along mapped edge','canopy dimensions','door profiles','step/ramp dimensions','local apron edge'],
    groundContact:'apron bottom at local 0; structural feet touch their support; world ground must be checked against the target street surface'};
  return r;
}

/** A recipe in the unchanged host anchor's coordinates. quality: std | low. */
export function cbdFrontageRecipe(id, options={}) {
  const quality=options.quality??(options.detail===0?'low':'std');
  if(!['std','low'].includes(quality))throw new Error('CBD entrance quality must be std or low.');
  const b=getCBDFrontageBinding(id),entrance=makeEntrance(b,quality);
  const r=new Recipe(`CBD candidate / ${id}`,{
    candidateOnly:true,visualReview:'pending actual browser review',quality,buildings:1,
    binding:b,sourceFootprintUnchanged:true,hostHeightUnchanged:true,hostOrientationUnchanged:true,
    noBranding:true,noTextures:true,constructionAccuracy:'photo-informed authored candidate; not surveyed',
    ...entrance.metadata,
    // Recommendations only. No vegetation geometry or landscape mutation occurs.
    plantingRecommendations:{
      confirmed:'July 2026 mall photograph shows street trees, low continuous hedges, rooftop planting; SOM 3B photograph shows layered roadside planting',
      preserveClearOpeningWidth:b.portalWidth+4.8,
      suggestedLayersM:{groundcover:[.08,.20],lowShrubs:[.45,.80],streetTreeCrowns:[3.2,9.0]},
      note:'Use existing landscape/tree batching; resolve against actual sidewalk, crossing, utilities and road masks. Exact species, counts and planting beds are not established.'
    }
  });
  r.merge(entrance,[b.edgeOrigin[0],options.localGroundY??0,b.edgeOrigin[1]],b.moduleRotation);
  return r;
}

/** Two short, lobed hedge groups outside the existing north mall footprint.
 * Group locations are authored within the photo-supported planting zone, not
 * claimed surveyed planting beds. CPU collision checks use data/cbd-scene.json.
 * No tree is added, no existing landscape function or total tree count changes.
 */
export function cbdMallLowShrubRecipe(options={}) {
  const quality=options.quality??'std';
  if(!['std','low'].includes(quality))throw new Error('CBD shrub quality must be std or low.');
  const fine=quality==='std',site=CBD_CONTEXT_SITES.cwtc_mall_north;
  const r=new Recipe('CBD north mall layered low shrubs',{
    candidateOnly:true,visualReview:'pending actual browser review',quality,buildings:0,
    source:CBD_FRONTAGE_REFERENCES.mall,anchorWGS84:[...site.anchorWGS84],
    photoEvidence:'North mall July 2026 photo shows low continuous green hedges and street trees.',
    inference:'Two short bed locations, leaf masses, species-neutral shapes and counts are authored. No exact shrub or planting survey exists.',
    noNewTrees:true,noTextures:true,treeCountDelta:0,
    sceneMaskInput:'data/cbd-scene.json: ground and collisionBuildings',
    footwayClearanceIntent:'At least 2.7m between shrub envelope and north building face; no crossing of entrance apron or approach.',
    beds:CBD_SHRUB_BEDS.map(b=>({...b,center:[...b.center]})),
  });
  const lobe={type:'sphere',widthSegments:7,heightSegments:5};
  const lowLobe={type:'sphere',widthSegments:6,heightSegments:4};
  for(const bed of CBD_SHRUB_BEDS) {
    const n=fine?7:4;
    for(let i=0;i<n;i++) {
      const x=bed.center[0]-bed.length/2+.48+(bed.length-.96)*i/(n-1);
      const z=bed.center[1]+Math.sin(i*2.7)*.10, top=.48+(i%3)*.085;
      // Three nonuniform overlapping ellipsoids create a clipped-hedge silhouette
      // with individual leaf masses and a dark lower tier, avoiding green cuboids.
      const lobes=fine?[[-.19,.0,.40,top*.49,.43],[.23,-.12,.38,top*.44,.38],[.08,.20,.31,top*.34,.33]]
        :[[-.13,.0,.54,top*.48,.49],[.25,.11,.39,top*.36,.37]];
      for(let j=0;j<lobes.length;j++) {
        const [dx,dz,rx,ry,rz]=lobes[j],y=.13+ry+(j===2?.11:0);
        r.add(lobe,j===2?'grass':'foliage',[x+dx,y,z+dz],[rx,ry,rz],[0,i*.17+j*.55,0],`cbd shrub ${bed.id} leaf cluster ${i}-${j}`);
        r.parts.at(-1).castShadow=true;
      }
      r.cylinder('metalDark',x,.105,z,.018,.21,`cbd shrub ${bed.id} recessed stem`,6,.78);
      r.parts.at(-1).castShadow=false;
    }
    const lowN=fine?9:5;
    for(let i=0;i<lowN;i++) {
      const x=bed.center[0]-bed.length/2+.30+(bed.length-.60)*i/(lowN-1),z=bed.center[1]+.47+(i%2)*.03;
      r.add(lowLobe,'grass',[x,.085,z],[.36,.085,.28],[0,i*.62,0],`cbd shrub ${bed.id} low groundcover cluster ${i}`);
      r.parts.at(-1).castShadow=true;
    }
  }
  return r;
}

/** Opt-in merged group for the independent CBD scene. Never installs itself.
 * Default -.02 m matches this independent scene's verified commercial surface.
 * For a different isolated-scene origin pass projectPoint returning [east,south].
 */
export function buildCBDFrontages(kit, options={}) {
  if(typeof kit?.buildMergedRecipe!=='function')throw new Error('Existing architecture kit with buildMergedRecipe is required.');
  const ids=options.ids??CBD_FRONTAGE_IDS, projectPoint=options.projectPoint??project;
  const r=new Recipe('CBD two mapped entrance candidates',{candidateOnly:true,visualReview:'pending actual browser review',buildings:ids.length,quality:options.quality??'std',bindings:[]});
  for(const id of ids) {
    const b=getCBDFrontageBinding(id),[x,z]=projectPoint(b.anchorWGS84);
    const y=typeof options.groundWorldY==='function'?options.groundWorldY(b):options.groundWorldY??CBD_FRONTAGE_GROUND_Y;
    if(![x,y,z].every(Number.isFinite))throw new Error(`Non-finite CBD placement: ${id}`);
    const candidate=cbdFrontageRecipe(id,options);
    r.merge(candidate,[x,y,z],0);
    r.metadata.bindings.push({id,anchorWGS84:b.anchorWGS84,sourceId:b.sourceId,worldPlacement:[x,y,z],moduleRotation:b.moduleRotation,evidence:b.evidence});
  }
  if(options.includeShrubs!==false&&ids.includes('cwtc_mall_north_nw')) {
    const b=getCBDFrontageBinding('cwtc_mall_north_nw'),[x,z]=projectPoint(b.anchorWGS84);
    const y=typeof options.groundWorldY==='function'?options.groundWorldY(b):options.groundWorldY??CBD_FRONTAGE_GROUND_Y;
    r.merge(cbdMallLowShrubRecipe(options),[x,y,z],0);
    r.metadata.shrubBeds=CBD_SHRUB_BEDS.map(bed=>({...bed,center:[...bed.center]}));
    r.metadata.treeCountDelta=0;
  }
  return kit.buildMergedRecipe(r,{name:r.name});
}

// Lower-camel integration alias requested by the independent CBD scene owner.
export const buildCbdFrontages=buildCBDFrontages;
