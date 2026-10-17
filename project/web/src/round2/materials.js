/**
 * Round 2 sample-only materials. Original procedural surfaces; no image assets.
 * THREE r186, MeshStandardMaterial / WebGL2. X east, Y up, Z south; metres.
 * Installing this module never traverses the scene or replaces existing materials.
 */

const VERSION = 'r2-meter-surfaces-v1';
const FAMILY = Object.freeze({ brick: 1, roof: 2, ridge: 3, wood: 4, paint: 5, stone: 6, paving: 7, metal: 8, glass: 9, fabric: 10, clay: 11, leaf: 12, interior: 13, sign: 14 });

/** Hex colours are sRGB input. Three converts them to its linear working space. */
export const ROUND2_MATERIAL_SPECS = Object.freeze(Object.fromEntries(Object.entries({
  r2Brick:     { family:'brick',    color:'#a39f91', roughness:.89, metalness:0,    relief:.0014 },
  r2BrickDark: { family:'brick',    color:'#787b73', roughness:.92, metalness:0,    relief:.0013 },
  r2Roof:      { family:'roof',     color:'#596165', roughness:.83, metalness:0,    relief:.0026 },
  r2RoofRidge: { family:'ridge',    color:'#747973', roughness:.86, metalness:0,    relief:.0010 },
  r2Wood:      { family:'wood',     color:'#514437', roughness:.67, metalness:0,    relief:.00035 },
  r2WoodPaint: { family:'paint',    color:'#4d6053', roughness:.50, metalness:0,    relief:.00020 },
  r2Stone:     { family:'stone',    color:'#b1ab99', roughness:.83, metalness:0,    relief:.00065 },
  r2Paving:    { family:'paving',   color:'#a19e90', roughness:.88, metalness:0,    relief:.0017 },
  r2Metal:     { family:'metal',    color:'#515c59', roughness:.54, metalness:.55, relief:.00007 },
  r2Glass:     { family:'glass',    color:'#4c666c', roughness:.25, metalness:.04, relief:.000015 },
  r2Fabric:    { family:'fabric',   color:'#985d4d', roughness:.94, metalness:0,    relief:.00015 },
  r2Clay:      { family:'clay',     color:'#92745d', roughness:.88, metalness:0,    relief:.00035 },
  r2Leaf:      { family:'leaf',     color:'#687a51', roughness:.85, metalness:0,    relief:.00006 },
  r2Interior:  { family:'interior', color:'#393a34', roughness:.97, metalness:0,    relief:0 },
  r2Sign:      { family:'sign',     color:'#b2a07a', roughness:.72, metalness:0,    relief:.00012 },
}).map(([name, spec]) => [name, Object.freeze(spec)])));

const VERTEX_DECLARATIONS = /* glsl */`
varying vec3 vR2MetricPosition;
varying vec3 vR2MetricNormal;
uniform float r2WorldSpace;
uniform vec3 r2ProjectionOrigin;
uniform mat3 r2ProjectionRotation;
`;

// Both kit paths produce the same intermediate coordinates: buildMergedRecipe
// bakes each part matrix into position; buildRecipe supplies that matrix here.
const VERTEX_COORDINATES = /* glsl */`
vec4 r2PartPosition = vec4(transformed, 1.0);
vec3 r2PartNormal = objectNormal;
#ifdef USE_BATCHING
  mat3 r2BatchBasis = mat3(batchingMatrix);
  r2PartNormal /= max(vec3(dot(r2BatchBasis[0], r2BatchBasis[0]), dot(r2BatchBasis[1], r2BatchBasis[1]), dot(r2BatchBasis[2], r2BatchBasis[2])), vec3(1e-8));
  r2PartNormal = r2BatchBasis * r2PartNormal;
  r2PartPosition = batchingMatrix * r2PartPosition;
#endif
#ifdef USE_INSTANCING
  mat3 r2InstanceBasis = mat3(instanceMatrix);
  r2PartNormal /= max(vec3(dot(r2InstanceBasis[0], r2InstanceBasis[0]), dot(r2InstanceBasis[1], r2InstanceBasis[1]), dot(r2InstanceBasis[2], r2InstanceBasis[2])), vec3(1e-8));
  r2PartNormal = r2InstanceBasis * r2PartNormal;
  r2PartPosition = instanceMatrix * r2PartPosition;
#endif
vec3 r2ModelScale = max(vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz)), vec3(1e-4));
vec3 r2LocalMetric = r2PartPosition.xyz * r2ModelScale;
vec3 r2WorldMetric = (modelMatrix * r2PartPosition).xyz;
vec3 r2LocalNormal = r2PartNormal / r2ModelScale;
vec3 r2WorldNormal = mat3(modelMatrix) * (r2PartNormal / (r2ModelScale * r2ModelScale));
vR2MetricPosition = r2ProjectionRotation * (mix(r2LocalMetric, r2WorldMetric, r2WorldSpace) - r2ProjectionOrigin);
vR2MetricNormal = normalize(r2ProjectionRotation * mix(r2LocalNormal, r2WorldNormal, r2WorldSpace));
`;

const FRAGMENT_DECLARATIONS = /* glsl */`
varying vec3 vR2MetricPosition;
varying vec3 vR2MetricNormal;
uniform float r2Relief;
uniform float r2DetailStrength;
uniform vec3 r2GrainAxis;
const float R2_TAU = 6.28318530718;

struct R2Surface {
  vec3 tint;
  float height;
  float roughnessDelta;
  float cavity;
};

float r2Hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float r2Noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(r2Hash(i), r2Hash(i + vec2(1.0, 0.0)), u.x),
             mix(r2Hash(i + vec2(0.0, 1.0)), r2Hash(i + vec2(1.0)), u.x), u.y);
}
float r2Visibility(vec2 unwrapped) {
  float footprint = max(length(dFdx(unwrapped)), length(dFdy(unwrapped)));
  return 1.0 - smoothstep(.18, .68, footprint);
}
float r2FilteredNoise(vec2 p) {
  return (r2Noise(p) - .5) * r2Visibility(p);
}
float r2FilteredCos(float phase) {
  // phase is in cycles. Filter the unwrapped coordinate, never fract(phase).
  float footprint = max(abs(dFdx(phase)), abs(dFdy(phase)));
  return cos(R2_TAU * phase) * (1.0 - smoothstep(.16, .62, footprint));
}
vec2 r2Plane(vec3 p, vec3 n) {
  vec3 a = abs(n);
  return a.y > max(a.x, a.z) ? p.xz : (a.x > a.z ? p.zy : p.xy);
}
vec2 r2WoodPlane(vec3 p, vec3 n) {
  vec3 axis = normalize(r2GrainAxis);
  vec3 tangent = axis - n * dot(axis, n);
  // End grain still uses a well-defined tangent, without a near-zero normalize.
  if (dot(tangent, tangent) < .01) {
    vec3 fallback = abs(n.y) < .9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    tangent = fallback - n * dot(fallback, n);
  }
  tangent = normalize(tangent);
  return vec2(dot(p, normalize(cross(n, tangent))), dot(p, tangent));
}

R2Surface r2SampleSurface(vec3 p, vec3 n) {
  R2Surface s;
  s.tint = vec3(1.0); s.height = 0.0; s.roughnessDelta = 0.0; s.cavity = 1.0;
  vec2 uv = r2Plane(p, n);

#if R2_KIND == 1 || R2_KIND == 7
  // Actual small grey brick, or rectangular paving. Joints are recessed;
  // bevels alter the normal, and the walked stone centre is slightly smoother.
  #if R2_KIND == 1
    vec2 cellSize = vec2(.29, .09);
    float halfJoint = .0032, bevelWidth = .0035;
  #else
    vec2 cellSize = vec2(.62, .34);
    float halfJoint = .0045, bevelWidth = .010;
  #endif
  vec2 raw = uv / cellSize;
  float row = floor(raw.y);
  #if R2_KIND == 1
    float stagger = mod(row, 2.0) * .5;
  #else
    float stagger = floor(r2Hash(vec2(row, 7.0)) * 4.0) * .25;
  #endif
  vec2 cell = vec2(raw.x + stagger, raw.y);
  vec2 cellId = floor(cell);
  vec2 within = fract(cell) * cellSize;
  vec2 edge2 = min(within, cellSize - within);
  float edge = min(edge2.x, edge2.y);
  float aa = max(max(fwidth(uv.x), fwidth(uv.y)) * .65, .0002);
  float visible = r2Visibility(raw);
  float mortar = (1.0 - smoothstep(max(0.0, halfJoint - aa), halfJoint + aa, edge)) * visible;
  float face = smoothstep(halfJoint, halfJoint + bevelWidth + aa, edge);
  float block = (r2Hash(cellId + vec2(12.0, 3.0)) - .5) * visible;
  float grain = r2FilteredNoise(uv / .018);
  float weather = r2FilteredNoise(uv / 1.65);
  float centerWear = smoothstep(.025, .105, edge) * visible;
  #if R2_KIND == 1
    s.tint = vec3(1.0 + block * .11 + grain * .045 + weather * .045 - mortar * .13);
    s.roughnessDelta = grain * .055 + mortar * .035;
  #else
    s.tint = vec3(1.0 + block * .13 + grain * .045 + weather * .065 - mortar * .20 + centerWear * .015);
    s.roughnessDelta = grain * .06 + mortar * .055 - centerWear * .055;
  #endif
  s.height = r2Relief * ((face - .5) * visible + grain * .13);
  s.cavity = 1.0 - mortar * .08;

#elif R2_KIND == 2
  // Ridge runs along local X. 235 mm cover rolls; 330 mm tile overlap in plan.
  // Colour contrast is deliberately tiny: shape/light, not white stripes.
  // The pilot includes a front-facing gable as well as parallel street roofs.
  // Compare slope components in the shared street-aligned material frame.
  vec3 roofPlaneNormal = cross(dFdx(p), dFdy(p));
  uv = abs(roofPlaneNormal.x) > abs(roofPlaneNormal.z) ? p.zx : p.xz;
  vec2 raw = uv / vec2(.235, .33);
  float visible = r2Visibility(raw);
  float roll = .5 + .5 * r2FilteredCos(raw.x);
  float runEdge = min(fract(raw.y), 1.0 - fract(raw.y));
  float aa = max(fwidth(raw.y) * .65, .001);
  float lap = (1.0 - smoothstep(max(0.0, .018 - aa), .048 + aa, runEdge)) * visible;
  float tile = (r2Hash(floor(raw) + vec2(11.0, 29.0)) - .5) * visible;
  float pores = r2FilteredNoise(uv / .014);
  float weather = r2FilteredNoise(uv / .95);
  s.tint = vec3(1.0 + tile * .07 + (roll - .5) * .035 - lap * .085 + weather * .05);
  s.height = r2Relief * ((roll - .5) - lap * .32 + pores * .07);
  s.roughnessDelta = pores * .05 + weather * .055 + lap * .035;
  s.cavity = 1.0 - lap * .035;

#elif R2_KIND == 3
  // Ridge/roll orientation varies between the three preserved roof forms.
  // Let authored geometry supply direction; no misleading cross-axis joints.
  float grain = r2FilteredNoise(uv / .025);
  s.tint = vec3(1.0 + grain * .06);
  s.height = r2Relief * grain * .18;
  s.roughnessDelta = grain * .06;
  s.cavity = 1.0;

#elif R2_KIND == 4 || R2_KIND == 5 || R2_KIND == 14
  uv = r2WoodPlane(p, n);
  float broad = r2FilteredNoise(uv / vec2(.065, .75));
  float fiber = r2FilteredNoise(uv / vec2(.009, .28));
  float strand = r2FilteredCos(uv.x / .019 + r2Noise(uv / vec2(.19, .6)) * .45);
  float worn = smoothstep(.20, .36, broad) * (.5 + .5 * r2FilteredCos(uv.y / .72));
  #if R2_KIND == 4
    s.tint = vec3(1.0 + broad * .14 + fiber * .06 + strand * .025);
    s.roughnessDelta = broad * .075 + fiber * .045;
    s.height = r2Relief * (fiber * .65 + strand * .18);
  #elif R2_KIND == 5
    s.tint = mix(vec3(1.0 + broad * .06 + fiber * .02), vec3(.91, .88, .81), worn * .32);
    s.roughnessDelta = worn * .10 + fiber * .025;
    s.height = r2Relief * (fiber * .3 - worn * .15);
  #else
    s.tint = vec3(1.0 + broad * .065 + fiber * .025);
    s.roughnessDelta = fiber * .025;
    s.height = r2Relief * fiber * .25;
  #endif

#elif R2_KIND == 6
  // Fine dressed limestone/granite-like mineral texture; no invented slabs.
  float grain = r2FilteredNoise(uv / .018);
  float mineral = r2FilteredNoise(uv / .16);
  float toolMark = r2FilteredCos(uv.y / .047 + r2Noise(uv / .37) * .4);
  s.tint = vec3(1.0 + mineral * .075 + grain * .05);
  s.height = r2Relief * (grain * .5 + toolMark * .12);
  s.roughnessDelta = grain * .07 + mineral * .035;

#elif R2_KIND == 8
  float patina = r2FilteredNoise(uv / .23);
  float brush = r2FilteredNoise(uv / vec2(.006, .12));
  s.tint = vec3(1.0 + patina * .065);
  s.roughnessDelta = patina * .08 + brush * .045;
  s.height = r2Relief * brush;

#elif R2_KIND == 9
  // Opaque low-cost shop-glass proxy. No fake white reflection stripes.
  float waviness = r2FilteredNoise(uv / .43);
  s.tint = vec3(1.0 + waviness * .012);
  s.roughnessDelta = waviness * .018;
  s.height = r2Relief * waviness;

#elif R2_KIND == 10
  // Woven cloth. The weave averages away instead of becoming distant moire.
  float warp = r2FilteredCos(uv.x / .006), weft = r2FilteredCos(uv.y / .006);
  float dye = r2FilteredNoise(uv / .19);
  s.tint = vec3(1.0 + dye * .075 + (warp + weft) * .012);
  s.height = r2Relief * (warp + weft) * .25;
  s.roughnessDelta = (warp + weft) * .012 + dye * .025;

#elif R2_KIND == 11
  float pores = r2FilteredNoise(uv / .014);
  float fired = r2FilteredNoise(uv / .21);
  float turning = r2FilteredCos(p.y / .035);
  s.tint = vec3(1.0 + fired * .09 + pores * .035);
  s.height = r2Relief * (pores * .5 + turning * .09);
  s.roughnessDelta = fired * .045 + pores * .055;

#elif R2_KIND == 12
  // Modest leaf-surface variation. Crown holes, branch hierarchy and top/bottom
  // colour grouping must come from geometry/instances, never this shader.
  float wax = r2FilteredNoise(uv / .035);
  s.tint = vec3(1.0 + wax * .045);
  s.height = r2Relief * wax;
  s.roughnessDelta = wax * .065;
#endif
  return s;
}

vec3 r2PerturbNormal(vec3 viewPosition, vec3 baseNormal, float height) {
  // Surface-gradient bump, in metres. No UV/tangent dependency; scale remains
  // stable on merged meshes, ordinary meshes and non-uniformly scaled instances.
  vec3 dx = dFdx(viewPosition), dy = dFdy(viewPosition);
  vec3 rx = cross(dy, baseNormal), ry = cross(baseNormal, dx);
  float determinant = dot(dx, rx);
  vec2 dh = vec2(dFdx(height), dFdy(height));
  vec3 gradient = vec3(0.0);
  if (abs(determinant) > 1e-12) {
    gradient = (dh.x * rx + dh.y * ry) / determinant;
  }
  // Restrained relief: cap the normal deflection at atan(.28), about 15.6 deg.
  gradient *= min(1.0, .28 / max(length(gradient), 1e-5));
  return normalize(baseNormal - gradient);
}
`;

function inject(shader, anchor, code, stage) {
  if (!shader.includes(anchor)) throw new Error(`${VERSION}: missing ${stage} shader anchor ${anchor}`);
  return shader.replace(anchor, `${anchor}\n${code}`);
}

function finiteNumber(value, fallback, label, minimum = -Infinity, maximum = Infinity) {
  const n = value === undefined ? fallback : value;
  if (!Number.isFinite(n) || n < minimum || n > maximum) throw new TypeError(`${label} must be finite in [${minimum}, ${maximum}].`);
  return n;
}
function finiteVector(value, fallback, label) {
  const v = value === undefined ? fallback : value;
  if (!Array.isArray(v) || v.length !== 3 || !v.every(Number.isFinite)) throw new TypeError(`${label} must be a finite [x,y,z] array.`);
  return v;
}

/**
 * Change one material's projection, without shader recompilation.
 * projection='local': instance-baked mesh-local metres, following the group.
 * projection='world': absolute world metres. origin uses the selected frame.
 * rotationY rotates the projection frame, not geometry. grainAxis uses that frame.
 * Settings are shared by every mesh using this material. Use a variant if needed.
 */
export function configureRound2Material(material, options = {}) {
  const data = material?.userData?.round2;
  if (!data?.uniforms) throw new TypeError('Expected a round2 material created by installRound2Materials.');
  const u = data.uniforms;
  if (options.projection !== undefined) {
    if (!['local', 'world'].includes(options.projection)) throw new TypeError('projection must be local or world.');
    u.r2WorldSpace.value = options.projection === 'world' ? 1 : 0;
  }
  if (options.origin !== undefined) u.r2ProjectionOrigin.value.fromArray(finiteVector(options.origin, [0,0,0], 'origin'));
  if (options.rotationY !== undefined) {
    const a = finiteNumber(options.rotationY, 0, 'rotationY');
    const c = Math.cos(a), s = Math.sin(a);
    u.r2ProjectionRotation.value.set(c, 0, s, 0, 1, 0, -s, 0, c);
  }
  if (options.grainAxis !== undefined) {
    const axis = finiteVector(options.grainAxis, [0,1,0], 'grainAxis');
    if (Math.hypot(...axis) < 1e-6) throw new TypeError('grainAxis must not be zero.');
    u.r2GrainAxis.value.fromArray(axis).normalize();
  }
  if (options.detailStrength !== undefined) u.r2DetailStrength.value = finiteNumber(options.detailStrength, 1, 'detailStrength', 0, 1);
  if (options.relief !== undefined) u.r2Relief.value = finiteNumber(options.relief, data.spec.relief, 'relief', 0, .006);
  return material;
}

function makeMaterial(THREE, name, spec, options = {}) {
  const {family, relief, ...parameters} = spec;
  const material = new THREE.MeshStandardMaterial(parameters);
  material.name = `Beijing_Round2_${name}`;
  if (family === 'leaf') material.side = THREE.DoubleSide;
  const uniforms = {
    r2WorldSpace: {value:0},
    r2ProjectionOrigin: {value:new THREE.Vector3()},
    r2ProjectionRotation: {value:new THREE.Matrix3()},
    r2GrainAxis: {value:new THREE.Vector3(0,1,0)},
    r2Relief: {value:relief},
    r2DetailStrength: {value:1},
  };
  material.userData.round2 = {
    version:VERSION, source:'original procedural code', scope:'explicit sample assignment only',
    spec:{...spec}, textureCount:0, decodedTextureBytes:0, uniforms,
  };
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = VERTEX_DECLARATIONS + shader.vertexShader;
    shader.vertexShader = inject(shader.vertexShader, '#include <project_vertex>', VERTEX_COORDINATES, 'vertex');
    shader.fragmentShader = `#define R2_KIND ${FAMILY[family]}\n` + FRAGMENT_DECLARATIONS + shader.fragmentShader;
    shader.fragmentShader = inject(shader.fragmentShader, '#include <color_fragment>', /* glsl */`
      R2Surface r2SurfaceValue = r2SampleSurface(vR2MetricPosition, normalize(vR2MetricNormal));
      diffuseColor.rgb *= mix(vec3(1.0), r2SurfaceValue.tint, r2DetailStrength);
    `, 'fragment colour');
    shader.fragmentShader = inject(shader.fragmentShader, '#include <roughnessmap_fragment>',
      'roughnessFactor = clamp(roughnessFactor + r2SurfaceValue.roughnessDelta * r2DetailStrength, .18, 1.0);', 'fragment roughness');
    shader.fragmentShader = inject(shader.fragmentShader, '#include <normal_fragment_maps>',
      'normal = r2PerturbNormal(-vViewPosition, normal, r2SurfaceValue.height * r2DetailStrength);', 'fragment normal');
    shader.fragmentShader = inject(shader.fragmentShader, '#include <aomap_fragment>',
      'reflectedLight.indirectDiffuse *= mix(1.0, r2SurfaceValue.cavity, r2DetailStrength);', 'fragment cavity');
  };
  material.customProgramCacheKey = () => `${VERSION}/${family}`;
  configureRound2Material(material, options);
  return material;
}

/**
 * Register exactly the 15 r2 materials; no scene edits. Safe to call repeatedly.
 * Call AFTER the legacy enhanceArchitectureMaterials(kit.materials), whose broad
 * brick-name matcher would otherwise overwrite r2Brick's onBeforeCompile hook.
 * options: projection/origin/rotationY/grainAxis/detailStrength; perMaterial overrides.
 * Returns the registered {r2Brick,...} subset. kit.dispose() owns their disposal.
 */
export function installRound2Materials(THREE, kit, options = {}) {
  if (!THREE?.MeshStandardMaterial || !THREE?.Matrix3 || !kit?.materials) throw new TypeError('Pass THREE and a createArchitectureKit result.');
  const registered = {};
  // Check collisions before changing the registry. Never replace another module's material.
  for (const name of Object.keys(ROUND2_MATERIAL_SPECS)) {
    const existing = kit.materials[name];
    if (existing && existing.userData?.round2?.version !== VERSION) throw new Error(`Material ${name} already exists outside ${VERSION}.`);
  }
  for (const [name, spec] of Object.entries(ROUND2_MATERIAL_SPECS)) {
    if (!kit.materials[name]) kit.materials[name] = makeMaterial(THREE, name, spec, {...options, ...options.perMaterial?.[name]});
    registered[name] = kit.materials[name];
  }
  return registered;
}

/**
 * Build a separately configurable variant (e.g. horizontal timber or rotated roof).
 * MeshStandardMaterial.clone() does NOT copy onBeforeCompile, so use this factory.
 * The caller may register it under another r2 name for kit recipes, and owns disposal
 * unless it is registered in kit.materials. No implicit scene or palette changes.
 */
export function createRound2MaterialVariant(THREE, sourceName, options = {}) {
  const source = ROUND2_MATERIAL_SPECS[sourceName];
  if (!source) throw new Error(`Unknown round2 source material ${sourceName}.`);
  const spec = {...source};
  if (options.color !== undefined) spec.color = options.color;
  if (options.roughness !== undefined) spec.roughness = finiteNumber(options.roughness, spec.roughness, 'roughness', .18, 1);
  if (options.metalness !== undefined) spec.metalness = finiteNumber(options.metalness, spec.metalness, 'metalness', 0, 1);
  return makeMaterial(THREE, options.name ?? `${sourceName}_variant`, spec, options);
}

export const ROUND2_MATERIAL_BUDGET = Object.freeze({
  materialCount:15, textureCount:0, decodedTextureBytes:0, mipTextureBytes:0,
  projectedVaryingFloats:6, uniformFloats:18,
  scope:'Shader cost only; program/driver memory is implementation-dependent and not claimed as zero.',
});
