/** Qionghua Island relief. Public-source height reference, not a surveyed DEM.
 * Pure geometry module; performs no I/O.
 * Coordinates: existing scene X east, Y up, Z south, in metres.
 */
const EARTH = 6378137;
const DEG = Math.PI / 180;
let state = null;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function distanceToSegment(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1), 0, 1);
  return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t);
}
function inside(x, z, ring) {
  let value = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if (((a[1] > z) !== (b[1] > z)) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) value = !value;
  }
  return value;
}
/** Configure explicitly; metadata records the uncertainty in the height datum. */
export function configureBeihaiRelief(document, geojson) {
  const feature = geojson.features.find(f => f.id === document.islandBoundaryFeature);
  if (!feature || feature.geometry.type !== 'Polygon') throw new Error('Qionghua island polygon is required.');
  const origin = document.metadata?.origin || [116.3975, 39.9087];
  const project = ([lon, lat]) => [(lon - origin[0]) * DEG * EARTH * Math.cos(origin[1] * DEG), -(lat - origin[1]) * DEG * EARTH];
  const rings = feature.geometry.coordinates.map(r => {
    const points = r.map(project);
    if (Math.hypot(points[0][0] - points.at(-1)[0], points[0][1] - points.at(-1)[1]) < 1e-6) points.pop();
    return points;
  });
  const recipe = document.terrainRecipe;
  const peak = project(recipe.summitCoordinatesWGS84);
  if (!inside(...peak, rings[0])) throw new Error('Summit anchor is outside the island.');
  state = {rings, peak, height: document.heightReference.recommendedReliefM,
    plateau: recipe.summitPlateauRadiusM, shore: recipe.shoreFlatBandM,
    metadata: {siteId: document.siteId, source: document.heightReference.source,
      relativeHeightM: document.heightReference.recommendedReliefM,
      relativeHeightUncertaintyM: document.heightReference.renderingUncertaintyRangeM,
      sourceDatumExplicit: document.heightReference.sourceDatumExplicit,
      absoluteAltitudeM: null, surveyedDEM: false,
      accuracy: 'Approximate radial island relief. Height datum is not explicitly stated by the source. Shape, summit pad and shore flat band are modelling estimates.',
      islandSource: feature.properties.source, origin, shorelineClipped: true, shoreBlendWidthM: 8}};
  return {...state.metadata};
}
/** Relative hill height only. Add the shared ground datum once in the caller. */
export function beihaiHeightAt(x, z) {
  if (!state || !inside(x, z, state.rings[0]) || state.rings.slice(1).some(r => inside(x, z, r))) return 0;
  let shoreDistance = Infinity;
  for (const ring of state.rings) for (let i = 0; i < ring.length; i++) shoreDistance = Math.min(shoreDistance, distanceToSegment(x, z, ring[i], ring[(i + 1) % ring.length]));
  if (shoreDistance <= state.shore + 1e-7) return 0;
  const dx = x - state.peak[0], dz = z - state.peak[1], distance = Math.hypot(dx, dz);
  if (distance <= state.plateau) return state.height;
  const ux = dx / distance, uz = dz / distance;
  let boundaryRadius = Infinity;
  for (let i = 0; i < state.rings[0].length; i++) {
    const a = state.rings[0][i], b = state.rings[0][(i + 1) % state.rings[0].length];
    const ex = b[0] - a[0], ez = b[1] - a[1], ax = a[0] - state.peak[0], az = a[1] - state.peak[1];
    const determinant = ux * ez - uz * ex;
    if (Math.abs(determinant) < 1e-12) continue;
    const ray = (ax * ez - az * ex) / determinant, edge = (ax * uz - az * ux) / determinant;
    if (ray > 0 && edge >= -1e-8 && edge <= 1 + 1e-8) boundaryRadius = Math.min(boundaryRadius, ray);
  }
  if (!Number.isFinite(boundaryRadius)) return 0;
  const q = clamp((distance - state.plateau) / Math.max(1, boundaryRadius - state.shore - state.plateau), 0, 1);
  const shoreT = clamp((shoreDistance - state.shore) / 8, 0, 1);
  const shoreBlend = shoreT * shoreT * (3 - 2 * shoreT);
  return state.height * Math.pow(Math.max(0, 1 - q * q), 1.5) * shoreBlend;
}
/** Triangulate the exact island, then refine shared edges. No rectangular lake-covering mesh. */
export function createBeihaiHeightGeometry(THREE, options = {}) {
  if (!state) throw new Error('Call configureBeihaiRelief first.');
  const maxEdgeM = options.maxEdgeM || 8, groundY = options.groundY ?? 0.38;
  const vertices = state.rings.flat().map(p => [...p]);
  let triangles = THREE.ShapeUtils.triangulateShape(state.rings[0].map(p => new THREE.Vector2(...p)), state.rings.slice(1).map(r => r.map(p => new THREE.Vector2(...p))));
  // All triangles sharing an edge use the same midpoint, avoiding elevation cracks.
  for (let iteration = 0; iteration < 12; iteration++) {
    const mids = new Map();
    const key = (a, b) => a < b ? `${a}:${b}` : `${b}:${a}`;
    for (const tri of triangles) for (let e = 0; e < 3; e++) {
      const a = tri[e], b = tri[(e + 1) % 3], pa = vertices[a], pb = vertices[b];
      if (Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) > maxEdgeM && !mids.has(key(a, b))) {
        mids.set(key(a, b), vertices.length); vertices.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]);
      }
    }
    if (!mids.size) break;
    const next = [];
    for (const tri of triangles) {
      const m = tri.map((a, e) => mids.get(key(a, tri[(e + 1) % 3])));
      const count = m.filter(i => i !== undefined).length;
      if (count === 0) {next.push(tri); continue;}
      if (count === 3) {
        const [a, b, c] = tri, [ab, bc, ca] = m;
        next.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]);
      } else if (count === 1) {
        const e = m.findIndex(i => i !== undefined), a = tri[e], b = tri[(e + 1) % 3], c = tri[(e + 2) % 3];
        next.push([a, m[e], c], [m[e], b, c]);
      } else {
        const e = m.findIndex((i, k) => i !== undefined && m[(k + 1) % 3] !== undefined);
        const a = tri[e], b = tri[(e + 1) % 3], c = tri[(e + 2) % 3], ab = m[e], bc = m[(e + 1) % 3];
        next.push([b, bc, ab], [a, ab, c], [ab, bc, c]);
      }
    }
    triangles = next;
  }
  const positions = new Float32Array(vertices.length * 3);
  vertices.forEach(([x, z], i) => positions.set([x, groundY + beihaiHeightAt(x, z), z], i * 3));
  const indices = [];
  for (const [a, b, c] of triangles) {
    const p = vertices[a], q = vertices[b], r = vertices[c];
    const cross = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
    indices.push(...(cross > 0 ? [a, c, b] : [a, b, c]));
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  geometry.userData = {...state.metadata, maxEdgeM, groundY, vertices: vertices.length, triangles: triangles.length};
  return geometry;
}
export function getBeihaiReliefMetadata() {return state ? {...state.metadata} : null;}
