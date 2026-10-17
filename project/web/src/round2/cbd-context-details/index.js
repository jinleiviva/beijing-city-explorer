import {cbdContextDetailsRecipe} from './recipe.js';
export {cbdContextDetailRecipe,cbdContextDetailsRecipe,contextDetailHost,contextDetailEdges,contextWindowCandidates,contextDetailObstacles,FACADE_PROFILES} from './recipe.js';
export {CBD_CONTEXT_DETAIL_IDS,CBD_CONTEXT_SAMPLE_IDS,CBD_MAIN_DETAIL_RESERVED_IDS} from './selection.js';

/** At most four shared-material merged meshes; no per-building draw calls.
 * Scene integration and palette remain solely with the parent production task.
 */
export function buildCbdContextDetails(kit,data,options={}){
  const recipe=cbdContextDetailsRecipe(data,options);
  return kit.buildMergedRecipe(recipe,{castShadow:false});
}
