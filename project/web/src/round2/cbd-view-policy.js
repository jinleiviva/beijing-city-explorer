/** Keep the reviewed 2857m skyline preset outside the old 2600m clamp.
 * These limits do not lock orbit, zoom or panning; atmospheric settings stay unchanged.
 */
export const CBD_ORBIT_LIMITS=Object.freeze({minDistance:12,maxDistance:3600,minPolarAngle:.12,maxPolarAngle:Math.PI*.5-.001});
export function configureCbdOrbit(controls){Object.assign(controls,CBD_ORBIT_LIMITS,{enableDamping:true,dampingFactor:.075,screenSpacePanning:false});return controls;}

export const CBD_CAMERA_DEPTH=Object.freeze({near:.35,far:6000});
