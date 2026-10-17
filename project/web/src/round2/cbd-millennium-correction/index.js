import {millenniumCorrectionRecipe,MILLENNIUM_LIMITS} from './recipe.js';
export {millenniumCorrectionRecipe,millenniumPlan,triangulateMillenniumRing,MILLENNIUM_ID,MILLENNIUM_EVIDENCE,MILLENNIUM_RING_HASH,MILLENNIUM_LIMITS} from './recipe.js';

/** Seven non-emissive shared materials; no texture, light, host registration,
 * data rewrite or baseline removal. The kit may be reused by the parent scene. Only the five massing shells cast shadows; all authored thin facade/letter parts opt out.
 */
export const MILLENNIUM_MATERIALS=Object.freeze({
  millenniumGlass:['glassBlue','#416a80',.36,.25],
  millenniumGlassLight:['glassPale','#4b7185',.42,.19],
  millenniumGlassDark:['glassDark','#3b6278',.42,.19],
  millenniumMetal:['metal','#86939c',.54,.28],
  millenniumStone:['stone','#baa98d',.88,.01],
  millenniumRoof:['metalDark','#606b72',.79,.09],
  millenniumLetter:['stoneLight','#edece5',.64,.08]
});

export function buildCbdMillenniumCorrection(kit,feature,options={}){
  for(const[name,[base,color,roughness,metalness]]of Object.entries(MILLENNIUM_MATERIALS)){
    if(kit.materials[name])continue;
    if(!kit.materials[base]?.clone)throw Error('Millennium requires existing kit material '+base);
    const material=kit.materials[base].clone();material.name='Beijing_'+name;material.color.set(color);material.roughness=roughness;material.metalness=metalness;material.emissiveIntensity=0;material.transparent=false;material.opacity=1;material.depthWrite=true;
    kit.materials[name]=material;
  }
  const recipe=millenniumCorrectionRecipe(feature,options),group=kit.buildMergedRecipe(recipe,{castShadow:options.castShadow??true});
  const stats=group.userData.architectureStats;
  if(stats.triangles>MILLENNIUM_LIMITS.maxTriangles||stats.drawCalls>MILLENNIUM_LIMITS.maxMaterialBatches)throw Error('Merged Millennium candidate exceeded its bounded geometry budget.');
  return group;
}
