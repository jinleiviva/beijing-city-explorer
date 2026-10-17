import {attachTrafficDetail} from './cbd-people-vehicle-detail/index.js';
import {buildCommercialVariety} from './cbd-commercial-variety/index.js';
import {buildCbdTaikangCorrection,TAIKANG_ID,TAIKANG_HEIGHT} from './cbd-taikang-correction/index.js';
import {buildCbdForecourtRoute} from './cbd-forecourt-route/index.js';
import {buildCbdServiceDetails} from './cbd-service-details/index.js';
import {buildCbdChinalifeIdentity} from './cbd-chinalife-identity/index.js';
import {buildCbdMillenniumCorrection,MILLENNIUM_ID} from './cbd-millennium-correction/index.js';
import {buildCbdSecondIdentities,prepareSecondIdentityHost,ensureSecondIdentityHostMaterials} from './cbd-second-identities/index.js';
import {buildCbdPhotoStreet} from './cbd-photo-street/index.js';
import {buildCbdFacadeIdentities,hotelFacadePortal,prepareIdentityTowerHost,prepareHanweiGroundHost} from './cbd-facade-identities/index.js';
import {buildCbdContextDetails,CBD_CONTEXT_DETAIL_IDS} from './cbd-context-details/index.js';
import {buildMajorCbdFacades} from './cbd-major-facades/index.js';
import {applyCbdWarmGreyPalette} from './cbd-color-variant/index.js';
import {buildCommercialPosters} from './cbd-commercial-posters/index.js';
import {buildCbdRoofDetails} from './cbd-roof-details/index.js';
import {createMallLampDetail} from './cbd-mall-corner/street-lamps.js';
import {buildMallSignage} from './cbd-mall-corner/signage.js';
import {mallJunctionLayout,buildMallJunction,makeMallSurfaceSampler} from './cbd-mall-junction/index.js';
import * as THREE from '../../vendor/three.module.js';
import {createArchitectureKit,landmarkRecipe,buildingRecipe} from '../architecture/index.js';
import {Recipe} from '../architecture/geometry.js';
import {project} from '../geo.js';
import {buildTerrain} from '../terrain.js';
import {buildBridges} from '../bridges.js';
import {buildUrbanContext} from '../urban-context.js';
import {buildContextBuildings} from '../context-buildings.js';
import {buildLandscape} from '../landscape.js';
import {buildingIndex} from '../spatial.js';
import {buildStreetscape} from '../streetscape.js';
import {createTraffic} from '../traffic.js';
import {createTrafficSignals} from '../traffic-signals.js';
import {enhanceArchitectureMaterials} from '../surface-detail.js';
import {buildMallTreeBeds} from './cbd-mall-corner/tree-beds.js';
import {MALL_VISIBLE_TREE_RECORDS} from './cbd-mall-corner/visible-trees.js';
import {buildMallPlaza,mallPlazaWalkingRoutes} from './cbd-mall-corner/plaza.js';
import {prepareMallCornerHost,buildMallCorner} from './cbd-mall-corner/index.js';
import {buildKerryStreetFrontage} from './cbd-street-detail/kerry-frontage.js';
import {buildCbdStreetDetail} from './cbd-street-detail/index.js';
import {buildCbdFrontages} from './cbd-frontages/index.js';

export const CBD_VIEWS={
 taikang:{name:'泰康 · 223.4m有据体量',position:[5380,150,255],target:[5481.08,112,-137.35],fov:37},
 taikangEntry:{name:'泰康 · 17m玻璃大堂',position:[5519,3.1,-65],target:[5481.8,8.1,-109.4],fov:47},
 skyline:{name:'CBD · 远距天际线',position:[5040,700,2500],target:[5040,180,-310],fov:24},
 services:{name:'光华路 · 行人与街边设施',position:[4638,2.4,-363.4],target:[4668,4.6,-346],fov:50},
 signalDetail:{name:'路口 · 横杆小设备',position:[4617,5.5,-373],target:[4631.06,6.63,-365.7],fov:42},
 chinalife:{name:'国寿金融中心 · 有据双语字',position:[5639.186012021151,182.89073953043481,-120.58346357835312],target:[5594.186572019311,181.89073953043481,-120.80796195430545],fov:34},
 millenniumSign:{name:'千禧酒店 · 有据白字近看',position:[4621,109,-798],target:[4678,92,-783],fov:43},
 millennium:{name:'千禧酒店 · 104m估值候选',position:[4520,108,-820],target:[4703,50,-786],fov:42},
 streetProps:{name:'光华路 · 北京街边设施',position:[4634,2.4,-360],target:[4641,2.4,-350],fov:60},
 samsung:{name:'三星大厦 · 低区有据文字',position:[5201.5,2.5,-281.5],target:[5201.713,9.2,-269.704],fov:60},
 cpPair:{name:'正大南北塔 · 有据双语文字',position:[5415,240,-280],target:[5481,229.5,-280],fov:55},
 hanwei:{name:'汉威 · 实景楼名与入口',position:[4345,2.6,-396],target:[4356.58,11,-420],fov:52},
 bea:{name:'东亚银行 · 顶部文字',position:[4636,112,-370],target:[4571.48,91,-437.92],fov:42},
 hotel:{name:'中国大饭店 · 南立面',position:[4765,12,83],target:[4776,18,26],fov:48},
 ffc:{name:'FFC · 有据顶部文字',position:[5010,285,-697],target:[4849.2,248,-860.8],fov:36},
 heights:{name:'三高楼 · 实际尺度核验',position:[5040,520,1750],target:[5040,245,-310],fov:25},
 mall:{name:'国贸北商城 · 街角总览',position:[4530,40,-385],target:[4681,12,-326],fov:45},
 zunRoof:{name:'中国尊 · 有据停机坪与尊口',position:[5274.975735615,607,-215.805893712],target:[5356.975735615,520,-311.805893712],fov:40},
 kerryRoof:{name:'嘉里酒店 · 顶部标识',position:[4608,103,-386],target:[4664.081863467,66,-450.933036785],fov:36},
 block:{name:'CBD 街块',position:[5650,540,440],target:[4900,145,-310],fov:43},
 street:{name:'光华路 · 来往车流',position:[4701.200193410583,2.4,-395.1258534203153],target:[4776.200193410583,2.2,-374.1258534203153],fov:44},
 shops:{name:'国贸北商城 · 店招与路灯',position:[4633,2.4,-362],target:[4667,4.8,-346],fov:50},
 frontage:{name:'国贸北商城 · 店招与首层',position:[4640,2.35,-348],target:[4665,4,-318],fov:44},
 zun:{name:'中国尊 · 北侧街景',position:[5298.92732723279,2.35,-417.6182177759449],target:[5373.92732723279,2.5,-386.6182177759449],fov:44},
};
export async function buildCbdScene(data,progress=()=>{},options={}){
 const root=new THREE.Group();root.name='Independent bounded Beijing CBD';
 const millenniumEnabled=options.millenniumCorrection!==false,millenniumFeature=data.contextBuildings.find(f=>f.id===MILLENNIUM_ID);
 if(millenniumEnabled&&!millenniumFeature)throw Error('Missing original Millennium context footprint');
 const taikangEnabled=options.taikangCorrection!==false,taikangFeature=data.collisionBuildings.find(f=>f.id===TAIKANG_ID);if(taikangEnabled&&!taikangFeature)throw Error('Missing original named Taikang footprint');
 const detailedIds=CBD_CONTEXT_DETAIL_IDS.filter(id=>!millenniumEnabled||id!==MILLENNIUM_ID),contextInput=millenniumEnabled?data.contextBuildings.filter(f=>f.id!==MILLENNIUM_ID):data.contextBuildings,detailHeightOverrides={...(millenniumEnabled?{[MILLENNIUM_ID]:104}:{}),...(taikangEnabled?{[TAIKANG_ID]:TAIKANG_HEIGHT}:{})};
 progress('铺设 CBD 真实路网');
 const terrain=await buildTerrain(data.ground,undefined,{parkSurfaceOverrides:data.parkOverrides});
 // The support slab is a scene boundary, not a change to any geographic feature.
 const [w,s,e,n]=data.boundsWGS84,sw=project([w,s]),ne=project([e,n]);
 for(let i=0;i<2;i++){const slab=terrain.group.children[i];slab.geometry.dispose();slab.geometry=new THREE.BoxGeometry(ne[0]-sw[0]+500,i?28:60,sw[1]-ne[1]+500);slab.position.x=(sw[0]+ne[0])/2;slab.position.z=(sw[1]+ne[1])/2;}
 const urbanContext=buildUrbanContext(data.landuse,{landuseSurfaceOverrides:data.landuseOverrides});root.add(terrain.group,buildBridges(terrain.roads),urbanContext);
 progress('建立四座地标与真实商业街块');
 const kit=createArchitectureKit(THREE);
 for(const [name,color] of Object.entries({glass:'#7898a4',glassBlue:'#618794',glassDark:'#334e59',glassPale:'#9cafb3',zunGlass:'#8fa9b5',cctvGlass:'#92a5ab',stone:'#b9ae98',stoneLight:'#d0c5b0',concrete:'#b7b6ab',silverFacade:'#bdc8c8'}))kit.materials[name].color.set(color);
 for(const name of ['glass','glassBlue','glassPale','glassDark','zunGlass','cctvGlass']){kit.materials[name].roughness=.28;kit.materials[name].metalness=.18;kit.materials[name].envMapIntensity=.75;}
 enhanceArchitectureMaterials(kit.materials);
 ensureSecondIdentityHostMaterials(kit);
 const entryGround=makeMallSurfaceSampler([terrain.group,urbanContext]);
 const architecture=new THREE.Group();architecture.name='Mapped CBD architecture';
 for(const f of data.landmarks){const id=f.properties.model||f.id,model=kit.buildMergedRecipe(landmarkRecipe(id,{detail:1}));const [x,z]=project(f.geometry.coordinates);model.position.set(x,f.properties.baseElevation||1,z);model.rotation.y=f.properties.rotation||0;model.name=f.properties.name;model.userData.sourceFeature=f;architecture.add(model);}
 for(const site of data.sites){const recipe=buildingRecipe(site.family,{detail:1});const model=kit.buildMergedRecipe(site.family==='cwtc_mall_north'?prepareMallCornerHost(recipe):site.family==='hanwei_plaza'?prepareHanweiGroundHost(recipe,{groundAt:entryGround}):recipe);const [x,z]=project(site.anchorWGS84);model.position.set(x,.8,z);model.userData.sourceSite=site;architecture.add(model);}
 const richRecipe=new Recipe('Preserved nearby CBD building families');
 for(const i of data.rich.filter(i=>!taikangEnabled||i.id!==TAIKANG_ID))richRecipe.merge(prepareSecondIdentityHost(i,prepareIdentityTowerHost(i,buildingRecipe(i.family,{...i,detail:1}))),[i.x,i.y||0,i.z],i.rotation||0);
 architecture.add(kit.buildMergedRecipe(richRecipe));root.add(architecture);
 const roofDetails=buildCbdRoofDetails(kit,data);root.add(roofDetails);
 const frontageGroup=new THREE.Group();frontageGroup.name='Mapped first-floor and layered planting candidates';
 const frontageStd=buildCbdFrontages(kit,{quality:'std',groundWorldY:-.02,ids:['china_world_3_west']}),frontageLow=buildCbdFrontages(kit,{quality:'low',groundWorldY:-.02,ids:['china_world_3_west']});
 frontageStd.name='CBD frontages standard';frontageLow.name='CBD frontages low';frontageLow.visible=false;frontageGroup.add(frontageStd,frontageLow);root.add(frontageGroup);
 const kerryStd=buildKerryStreetFrontage(kit,{quality:'std'}),kerryLow=buildKerryStreetFrontage(kit,{quality:'low'});frontageStd.add(kerryStd);frontageLow.add(kerryLow);
 const mallStd=buildMallCorner(kit,{quality:'std'}),mallLow=buildMallCorner(kit,{quality:'low'});frontageStd.add(mallStd);frontageLow.add(mallLow);
 const signageStd=buildMallSignage(kit,{quality:'std'}),signageLow=buildMallSignage(kit,{quality:'low'});frontageStd.add(signageStd);frontageLow.add(signageLow);
 const postersStd=buildCommercialPosters(kit,{quality:'std'}),postersLow=buildCommercialPosters(kit,{quality:'low'});frontageStd.add(postersStd);frontageLow.add(postersLow);
 const varietyStd=buildCommercialVariety(kit,{quality:'standard'}),varietyLow=buildCommercialVariety(kit,{quality:'low'});frontageStd.add(varietyStd);frontageLow.add(varietyLow);
 const contextDetailsStd=buildCbdContextDetails(kit,data,{quality:'standard',ids:detailedIds,heightOverrides:detailHeightOverrides}),contextDetailsLow=buildCbdContextDetails(kit,data,{quality:'low',ids:detailedIds,heightOverrides:detailHeightOverrides});frontageStd.add(contextDetailsStd);frontageLow.add(contextDetailsLow);
 const majorFacadesStd=buildMajorCbdFacades(kit,data,{quality:'standard',groundAt:entryGround}),majorFacadesLow=buildMajorCbdFacades(kit,data,{quality:'low',groundAt:entryGround});frontageStd.add(majorFacadesStd);frontageLow.add(majorFacadesLow);
 const identitiesStd=buildCbdFacadeIdentities(kit,data,{quality:'standard',groundAt:entryGround}),identitiesLow=buildCbdFacadeIdentities(kit,data,{quality:'low',groundAt:entryGround});frontageStd.add(identitiesStd);frontageLow.add(identitiesLow);
 const secondIdentitiesStd=buildCbdSecondIdentities(kit,data,{quality:'standard'}),secondIdentitiesLow=buildCbdSecondIdentities(kit,data,{quality:'low'});frontageStd.add(secondIdentitiesStd);frontageLow.add(secondIdentitiesLow);
 const chinalifeStd=buildCbdChinalifeIdentity(kit,data,{quality:'standard'}),chinalifeLow=buildCbdChinalifeIdentity(kit,data,{quality:'low'});frontageStd.add(chinalifeStd);frontageLow.add(chinalifeLow);
 const millenniumStd=millenniumEnabled?buildCbdMillenniumCorrection(kit,millenniumFeature,{quality:'standard',groundAt:entryGround}):null,millenniumLow=millenniumEnabled?buildCbdMillenniumCorrection(kit,millenniumFeature,{quality:'low',groundAt:entryGround}):null;
 if(millenniumEnabled){frontageStd.add(millenniumStd);frontageLow.add(millenniumLow);millenniumStd.userData.status=millenniumLow.userData.status='bounded CPU geometry stage reviewed; external estimated height; WebGL pending';}
 const taikangStd=taikangEnabled?buildCbdTaikangCorrection(kit,taikangFeature,{quality:'standard',groundAt:entryGround}):null,taikangLow=taikangEnabled?buildCbdTaikangCorrection(kit,taikangFeature,{quality:'low',groundAt:entryGround}):null;if(taikangEnabled){frontageStd.add(taikangStd);frontageLow.add(taikangLow);}
 const treeBedsStd=buildMallTreeBeds(kit,{quality:'std'}),treeBedsLow=buildMallTreeBeds(kit,{quality:'low'});frontageStd.add(treeBedsStd);frontageLow.add(treeBedsLow);
 const hotelPortalBase=hotelFacadePortal(data),hotelEdge=hotelPortalBase.edge,hotelGround=entryGround((hotelEdge.a[0]+hotelEdge.b[0])/2,(hotelEdge.a[1]+hotelEdge.b[1])/2),hotelRing=data.contextBuildings.find(f=>f.id==='osm-way-33459419').geometry.coordinates[0].map(project),hotelBaseGround=Math.min(...hotelRing.flatMap((a,i)=>{if(!i)return[entryGround(...a)];const b=hotelRing[i-1],n=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/5));return Array.from({length:n+1},(_,j)=>entryGround(b[0]+(a[0]-b[0])*j/n,b[1]+(a[1]-b[1])*j/n));}));
 const context=await buildContextBuildings(contextInput,undefined,{baseElevationCandidates:{'osm-way-33459419':{baseY:hotelBaseGround,reason:'Close the diagnosed 0.8m generic wall-base gap downward to actual arrival ground; original footprint/roof retained.'}},facadeOpenings:{'osm-way-33459419':[hotelFacadePortal(data,{baseY:hotelGround})]},heightCandidates:{'osm-way-156061546':{height:7,reason:'Original source fallback retained conservatively; no measured height, identity unresolved; do not re-randomize to office height.'}}});root.add(context);
 progress('建立路缘、树冠与道路设施');
 const collision=buildingIndex(data.collisionBuildings);
 const mallPlazaStd=buildMallPlaza(kit,terrain.roads,collision,{quality:'std'}),mallPlazaLow=buildMallPlaza(kit,terrain.roads,collision,{quality:'low'});frontageStd.add(mallPlazaStd);frontageLow.add(mallPlazaLow);
 const landscape=await buildLandscape(terrain.roads,terrain.parks,{maxTrees:1600,buildingMask:collision,waters:terrain.waters,styleOverrides:data.streetStyles.overrides,midTreeZones:[{minX:4740,maxX:4880,z:-384,halfDepth:27,count:16}],heroTreeLimit:20,heroTreeRecords:MALL_VISIBLE_TREE_RECORDS,heroTreeZones:[{x:4701.2,z:-396.826,radius:85,count:4,forward:[75,21]},{x:5298.927,z:-417.618,radius:100,count:4,forward:[75,31]},{x:4655,z:-350,radius:85,count:4,forward:[1,0]}]});root.add(landscape);
 const streetDetailGroup=new THREE.Group();streetDetailGroup.name='Guanghua visible street detail quality levels';const streetDetailStd=buildCbdStreetDetail(kit,terrain.roads,landscape.userData.round2HeroSourceRecords,collision,{quality:'std'}),streetDetailLow=buildCbdStreetDetail(kit,terrain.roads,landscape.userData.round2HeroSourceRecords,collision,{quality:'low'});streetDetailLow.visible=false;streetDetailGroup.add(streetDetailStd,streetDetailLow);root.add(streetDetailGroup);
 const junctionLayout=mallJunctionLayout(terrain.roads),mallLampDetail=createMallLampDetail(),streetscape=buildStreetscape(terrain.roads,data.streetCatalog,{styleOverrides:data.streetStyles.overrides,localRoadCuts:junctionLayout.localRoadCuts,lampDetail:mallLampDetail.replace});root.add(streetscape.group);
 const mallStreetLamps=mallLampDetail.build(kit,makeMallSurfaceSampler([terrain.group,urbanContext,streetscape.group]));root.add(mallStreetLamps);
 const mallJunction=buildMallJunction(kit,terrain.roads,makeMallSurfaceSampler([terrain.group,urbanContext,streetscape.group]));root.add(mallJunction.group);
 const photoGround=makeMallSurfaceSampler([terrain.group,urbanContext,streetscape.group]),photoStreetStd=buildCbdPhotoStreet(kit,terrain.roads,collision,photoGround,{quality:'standard'}),photoStreetLow=buildCbdPhotoStreet(kit,terrain.roads,collision,photoGround,{quality:'low'});frontageStd.add(photoStreetStd);frontageLow.add(photoStreetLow);
 const serviceStd=buildCbdServiceDetails(kit,terrain.roads,collision,photoGround,{quality:'standard'}),serviceLow=buildCbdServiceDetails(kit,terrain.roads,collision,photoGround,{quality:'low'});frontageStd.add(serviceStd);frontageLow.add(serviceLow);
 const baseSignals=createTrafficSignals(streetscape.crossings);root.add(baseSignals.group);
 const focusRoadIds=['osm-way-1147350758','osm-way-1147352145','osm-way-175394482','osm-way-175394489','osm-way-25761584','osm-way-223865804'];
 const forecourtRoute=buildCbdForecourtRoute(terrain.roads,collision,photoGround);
 const traffic=createTraffic(terrain.roads,{carCount:88,pedestrianCount:52,buildingMask:collision,crossings:streetscape.crossings,focusRoadIds,pedestrianDisplayRoutes:[...mallPlazaWalkingRoutes(),forecourtRoute],stopControls:mallJunction.stopControls});
 // Keep only four bounded solid instance batches in the shadow pass. Legs/shoes connect near walkers to real paving.
 const trafficShadowNames=new Set(['chamfered vehicle bodies','pedestrian coats and shirts','walking legs','individual shoes']);
 for(const m of traffic.group.children)m.castShadow=trafficShadowNames.has(m.name);
 const streetLifeDetail=options.streetLifeDetail===false?null:attachTrafficDetail(traffic);
 if(streetLifeDetail)for(const m of streetLifeDetail.meshes)if(/glazing lamps wheels|refined hands/.test(m.name))m.castShadow=false;
 root.add(traffic.group);
 const signals={group:baseSignals.group,stats:()=>({legacy:baseSignals.stats(),mallJunction:mallJunction.stats()}),update:(time,target,distance)=>{baseSignals.update(time,target,distance);mallJunction.update(traffic.junctionState());}};
 const setQuality=q=>{landscape.userData.setQuality(q);frontageStd.visible=q!=='low';frontageLow.visible=q==='low';streetDetailStd.visible=q!=='low';streetDetailLow.visible=q==='low';};
 const result={streetLifeDetail,commercialVariety:{standard:varietyStd,low:varietyLow},taikang:taikangEnabled?{standard:taikangStd,low:taikangLow}:null,forecourtRoute,serviceDetails:{standard:serviceStd,low:serviceLow},chinalifeIdentity:{standard:chinalifeStd,low:chinalifeLow},millennium:millenniumEnabled?{standard:millenniumStd,low:millenniumLow}:null,secondIdentities:{standard:secondIdentitiesStd,low:secondIdentitiesLow},photoStreet:{standard:photoStreetStd,low:photoStreetLow},facadeIdentities:{standard:identitiesStd,low:identitiesLow},contextDetails:{standard:contextDetailsStd,low:contextDetailsLow},majorFacades:{standard:majorFacadesStd,low:majorFacadesLow},root,terrain,architecture,frontageGroup,streetDetailGroup,kit,context,landscape,streetscape,signals,traffic,mallJunction,roofDetails,mallStreetLamps,commercialPosters:{standard:postersStd,low:postersLow},mallSignage:{standard:signageStd,low:signageLow},collision,setQuality,
  metadata:{streetLifeDetail:streetLifeDetail?{...streetLifeDetail.stats(),accuracy:'Original procedural low-poly vehicle/person shapes; original simulation routes/pools retained. Integrated motion appearance pending.',nearShadowBatches:10,farShadowBatches:4,mutuallyExclusiveLOD:true}:null,commercialVariety:{...varietyStd.userData,standard:varietyStd.userData.architectureStats,low:varietyLow.userData.architectureStats},taikangCorrection:taikangEnabled?{...taikangStd.userData,standard:taikangStd.userData.architectureStats,low:taikangLow.userData.architectureStats,oldRichFallbackSuppressed:true,collisionFootprintUnchanged:true}:{enabled:false},trafficShadowBatches:{sourceFallbackNames:[...trafficShadowNames],sourceFallbackCount:4,nearDetailNames:streetLifeDetail?.meshes.filter(m=>m.castShadow).map(m=>m.name)||[],nearDetailCount:streetLifeDetail?10:0,mutuallyExclusiveLOD:true,lightChanges:0,performanceStatus:'GPU cost not measured; near and far shadows are not summed as simultaneous passes'},forecourtWalking:forecourtRoute,serviceDetails:{...serviceStd.userData,standard:serviceStd.userData.architectureStats,low:serviceLow.userData.architectureStats},chinalifeIdentity:{...chinalifeStd.userData,standard:chinalifeStd.userData.architectureStats,low:chinalifeLow.userData.architectureStats},millenniumCorrection:millenniumEnabled?{...millenniumStd.userData,standard:millenniumStd.userData.architectureStats,low:millenniumLow.userData.architectureStats,previousGenericContextSuppressed:true,previousAttachedDetailsSuppressed:true,collisionFootprintUnchanged:true,collisionPolicy:'All existing street/camera collisions use 2D original footprints, no height field; 104m height applied to neighboring detail clearance and actual ray geometry. No source data rewrite.'}:{enabled:false},secondIdentities:{...secondIdentitiesStd.userData,standard:secondIdentitiesStd.userData.architectureStats,low:secondIdentitiesLow.userData.architectureStats},photoStreet:{...photoStreetStd.userData,standard:photoStreetStd.userData.architectureStats,low:photoStreetLow.userData.architectureStats},facadeIdentities:{standard:identitiesStd.userData.architectureStats,low:identitiesLow.userData.architectureStats,...identitiesStd.userData},facadeCoverage:{backgroundIds:contextDetailsStd.userData.coveredSourceIds,backgroundCount:contextDetailsStd.userData.coverageCount,principalIds:majorFacadesStd.userData.sourceIds,principalCount:majorFacadesStd.userData.buildingCount,backgroundStats:contextDetailsStd.userData.architectureStats,principalStats:majorFacadesStd.userData.architectureStats,accuracy:'Selected background buildings receive sparse typological window hardware (99 when the Millennium replacement is enabled, otherwise 100); eight principal buildings receive secondary entrance/glazing geometry. These counts do not represent verified facade names or logos, or pixel-visible approval.'},commercialPosters:{standard:postersStd.userData.architectureStats,low:postersLow.userData.architectureStats,placements:postersStd.userData.placements,accuracy:postersStd.userData.accuracy},roofDetails:{...roofDetails.userData},mallStreetLamps:{...mallStreetLamps.userData,lightObjectsAdded:0},mallSignage:{standard:signageStd.userData.architectureStats,low:signageLow.userData.architectureStats,placements:signageStd.userData.placements,accuracy:'Original neutral illustrative retail names/posters, not verified real tenants; text is actual mesh geometry'},mallJunction:{sourceRoadIds:mallJunction.stopControls.map(c=>c.sourceRoadId),crosswalks:4,vehicleControls:4,signalPlanAccuracy:'Illustrative shared 40-second plan with actual vehicle clearance interlock; not a surveyed signal schedule'},mallVisibleTreeBeds:{standard:treeBedsStd.userData.architectureStats,low:treeBedsLow.userData.architectureStats,placements:treeBedsStd.userData.placements},mallPlaza:{standard:mallPlazaStd.userData.architectureStats,low:mallPlazaLow.userData.architectureStats,placements:mallPlazaStd.userData.placements},mallCorner:{standard:mallStd.userData.architectureStats,low:mallLow.userData.architectureStats,sourceId:'osm-way-660651177',heightAccuracy:'27.5m is the existing photo-estimated height, not surveyed'},kerryStreetDetail:{standard:kerryStd.userData.architectureStats,low:kerryLow.userData.architectureStats,placement:'Known south edge; door/bay counts authored, not measured'},unresolvedAncillary:{id:'osm-way-156061546',height:7,status:'Original unmeasured fallback, conservative placeholder; real building identity and height still unresolved'},streetDetail:{standard:streetDetailStd.userData.architectureStats,low:streetDetailLow.userData.architectureStats,placements:streetDetailStd.userData.placements,groundY:.65},scopeWGS84:data.boundsWGS84,fullCityCacheLoaded:false,sourceInputs:data.sourceInputs,landmarks:data.landmarks.map(f=>({id:f.id,height:f.properties.height,position:f.geometry.coordinates})),mappedBuildingCount:data.collisionBuildings.length,contextCount:data.contextBuildings.length,contextRenderedCount:contextInput.length,richCount:data.rich.length,siteCount:data.sites.length,treeCount:landscape.userData.trees,heroTreeCount:landscape.userData.round2HeroTreeCount,midTreeCount:landscape.userData.round2MidTreeCount,frontageCandidates:{entrances:1,groundY:-.02,visualReview:'pending',note:'Former speculative north-mall entrance canopy removed; mapped column/recess study replaces it.'}}};
 if(options.palette==='warm-grey')applyCbdWarmGreyPalette(result);
 return result;
}
