/** One source-priority rule for near footprints, far proxies and rich-building selection. */
export function applyBuildingSemantics(features,document){let count=0;for(const f of features){const t=document.overrides[f.id];if(!t)continue;const p=f.properties;p.buildingType=t.building||p.buildingType;for(const [key,name] of Object.entries({historic:'historic',heritage:'heritage',amenity:'amenity',religion:'religion',denomination:'denomination',man_made:'manMade','tower:type':'towerType',min_height:'minHeight','building:min_level':'minLevel','roof:shape':'roofShape','roof:colour':'roofColour','roof:material':'roofMaterial','roof:height':'roofHeight',layer:'layer',location:'location',covered:'covered',ruins:'ruins'}))if(t[key]!==undefined)p[name]=t[key];p.semanticSource=t.source;count++;}return count;}
export function hasTrustedHeight(p){return Number.isFinite(Number(p.height))&&Number(p.height)>0&&!/fallback|generic/i.test(p.heightSource||'');}
export function semanticClass(p){
 const type=p.buildingType||'',name=p.name||'',historic=p.historic||'';
 if(type==='bridge'||Number.parseFloat(p.minHeight)>0||Number.parseFloat(p.minLevel)>0)return'elevated_structure';
 if(p.photoContextClass)return p.photoContextClass;
 if(type==='ruins'||p.ruins==='yes'||historic==='ruins')return'ruins';
 if(type==='wall'||historic==='citywalls')return'wall';
 if(type==='roof'||/长廊|游廊|回廊/.test(name))return'covered_walk';
 if(['gate','gatehouse'].includes(type)||historic==='city_gate')return'gate';
 if(type==='pavilion'||/亭$/.test(name))return'pavilion';
 if(['tower','pagoda'].includes(type)||['tower','obelisk'].includes(p.manMade))return'monument_tower';
 if(['temple','palace','shrine','monastery','religious'].includes(type)||p.religion==='buddhist'||/^(殿|堂)$/.test(type))return'traditional_hall';
 if(['church','chapel','cathedral','mosque'].includes(type)||p.amenity==='place_of_worship')return'worship';
 if((p.historic||p.heritage)&&['hipped','gabled','half-hipped'].includes(p.roofShape))return'traditional_hall';
 if(p.historic||p.heritage)return'heritage_unspecified';
 if(p.precinctContext==='traditional')return'precinct_traditional';
 if(p.precinctContext==='religious')return'precinct_religious';
 return'ordinary';
}
export function semanticHeight(p,random,area){
 if(p.photoContextHeightRange){const[lo,hi]=p.photoContextHeightRange;return lo+(hi-lo)*random();}
 const type=semanticClass(p);
 const ranges={elevated_structure:[8,15],ruins:[.8,2.2],wall:[2.5,5],covered_walk:area>1600?[4.5,8]:[3.0,5.0],gate:[4.5,9],pavilion:[4.5,8],traditional_hall:[5.5,11],worship:[9,17],monument_tower:[14,28],heritage_unspecified:[6,14],precinct_traditional:[5.5,10.5],precinct_religious:[7,15]};
 if(!ranges[type])return null;const [lo,hi]=ranges[type];return lo+(hi-lo)*random();
}
export function contextFacadeMode(p){const type=semanticClass(p);return ['ruins','wall','covered_walk','monument_tower','elevated_structure','photo_low_ancillary','photo_exhibition_hall','photo_underground'].includes(type)?3:['gate','pavilion','traditional_hall','precinct_traditional'].includes(type)?1:['worship','heritage_unspecified','precinct_religious'].includes(type)?2:0;}
export function allowModernDistrictKit(p){return !isUndergroundStructure(p)&&semanticClass(p)==='ordinary';}

/** ID-specific, photo/typology informed garden overrides; no surveyed heights claimed. */
export function applyHeritageBuildingOverrides(features,document){let count=0;const byId=new Map(document.buildingOverrides.filter(o=>o.applyContextOverride).map(o=>[o.id,o]));for(const f of features){const o=byId.get(f.id);if(!o||hasTrustedHeight(f.properties))continue;const gallery=o.role==='connected-waterfront-gallery-and-pavilions';Object.assign(f.properties,{height:o.suggestedHeightMetres,heightSource:'photo/typology approximate height; beihai-building-overrides.json',historic:'building',buildingType:gallery?'roof':o.role.includes('pavilion')?'pavilion':'temple',roofShape:o.roofTreatment==='hipped'?'hipped':f.properties.roofShape,contextOverride:o.reason,terrainDrape:gallery,contextRole:o.role});count++;}return count;}

/** OSM min_height is an absolute above-ground underside, not an extra offset on top height. */
export function buildingMinHeight(p,top){const direct=Number.parseFloat(p.minHeight),levels=Number.parseFloat(p.minLevel);const base=Number.isFinite(direct)?direct:Number.isFinite(levels)?levels*3.3:.8;return Math.max(.8,Math.min(Math.max(.8,top-.25),base));}

/** Exact mapped precinct membership informs fallback type only; never copies a religion onto a building. */
export function applyReligiousPrecinctContext(features,document){let count=0;for(const f of features){const o=document.overrides[f.id],p=f.properties;if(!o||!o.suppressDistrictOfficeResidentialFallback)continue;if(['apartments','residential','commercial','office','hotel','hospital','school','university'].includes(p.buildingType))continue;p.precinctContext=o.allowTraditionalContextFallback?'traditional':'religious';p.precinctContextSource=o.source;p.precinctContextAccuracy=o.accuracy;count++;}return count;}

/** Exact named roof evidence fills missing tags only; measured heights and raw tags always win. */
export function applyNamedRoofEvidence(features,document){let count=0;const forms={'hip-and-gable':'half-hipped','square-pyramidal':'pyramidal','flush-gable':'gabled'};for(const f of features){const o=document.overrides[f.id],p=f.properties;if(!o?.applyToGeneric)continue;for(const key of ['roofColour','roofMaterial'])if(!p[key]&&o[key])p[key]=o[key];if(!p.roofShape&&o.roofShape)p.roofShape=forms[o.roofShape]||o.roofShape;p.roofEvidence={sourceIds:o.sourceIds,status:o.evidenceStatus,scope:'exact ID; forms approximate in generic geometry',eaveLevels:o.eaveLevels};count++;}return count;}

/** Modern facade family encoded into existing mode slot:4 glass,5 stone,6 housing,7 low podium. */
export function contextRenderFacadeMode(p,district,height){const semantic=contextFacadeMode(p);if(semantic)return semantic;const type=p.buildingType||'',name=p.name||'';if(['retail','warehouse','industrial','hangar'].includes(type)||/商场|商城|购物|展览馆|展厅/.test(name))return 7;if(['apartments','residential','house'].includes(type))return 6;if(height>40&&(district==='cbd'||['office','commercial'].includes(type)))return 4;return height<13?7:5;}

/** Underground station/parking envelopes are not above-ground buildings. Entrances remain separate features. */
export function isUndergroundStructure(p){return p.photoContextUnderground===true||p.location==='underground'||Number(p.layer)<0&&(['train_station','transportation'].includes(p.buildingType)||p.amenity==='parking');}

/** Exact photo/source-backed use correction. Original source tags/footprints stay intact. */
export function applyPhotoContextOverrides(features,document){let count=0;for(const f of features){const o=document.overrides[f.id];if(!o)continue;const p=f.properties;p.photoContextClass=o.semanticClass;p.photoContextUnderground=!!o.suppressAboveGround;p.photoContextHeightRange=o.fallbackRangeMetres;p.photoContextEvidence={sources:o.sources,accuracy:o.accuracy,identityConfidence:o.identityConfidence};if(!p.roofShape&&o.roofShape)p.roofShape=o.roofShape;count++;}return count;}
