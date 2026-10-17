/**
 * Original, texture-free hero trees for the Round 2 sample streets.
 * No placement generation: callers must replace existing guarded tree records.
 * Default crowns use folded leaf sprays; opt-in grouped crowns use leafy masses.
 * Both preserve the forked wood and grounded roots, with no sphere primitives.
 * createHeroTree -> { group, stats, dispose }; batch -> two shared draw calls.
 */

import { createGroupedCanopy } from './cbd-mall-corner/canopy-volume.js';

const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const length = v => Math.hypot(...v);
const norm = v => mul(v, 1 / (length(v) || 1));

function random(seed) {
  // Hash floats as strings too: existing landscape seeds live between zero and one.
  let state = 2166136261;
  for (const c of String(seed)) state = Math.imul(state ^ c.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function frame(direction) {
  const y = norm(direction);
  const x = norm(cross(Math.abs(y[1]) < .92 ? [0, 1, 0] : [0, 0, 1], y));
  return [x, y, norm(cross(x, y))];
}

function bucket() { return { position: [], normal: [], color: [] }; }
function triangle(out, a, b, c, color) {
  const normal = norm(cross(sub(b, a), sub(c, a)));
  if (length(normal) < .5) return;
  out.position.push(...a, ...b, ...c);
  out.normal.push(...normal, ...normal, ...normal);
  for (let i = 0; i < 3; i++) out.color.push(...color);
}

function makePalette(THREE, type) {
  const rgb = hex => new THREE.Color(hex).toArray();
  return {
    bark: rgb('#73624d'), base: rgb('#443c30'),
    shade: rgb(type === 'pine' || type === 'cypress' ? '#304b3c' : '#344d37'),
    middle: rgb(type === 'willow' ? '#647b46' : type === 'pine' || type === 'cypress' ? '#476b47' : '#597443'),
    light: rgb(type === 'pine' || type === 'cypress' ? '#7f925b' : '#92a35f'),
  };
}

function appendTube(out, a, b, ra, rb, sides, palette, phase = 0) {
  const [u, , v] = frame(sub(b, a));
  const ring = (p, radius, angle) => add(p, add(mul(u, Math.cos(angle) * radius), mul(v, Math.sin(angle) * radius)));
  for (let j = 0; j < sides; j++) {
    const theta = phase + j / sides * TAU, next = theta + TAU / sides;
    const a0 = ring(a, ra, theta), a1 = ring(a, ra, next);
    const b0 = ring(b, rb, theta), b1 = ring(b, rb, next);
    const color = mul(palette.bark, .84 + .16 * (.5 + .5 * Math.sin(theta * 2.1 + .4)));
    // The ring basis winds clockwise looking down the branch; these faces point out.
    triangle(out, a0, b0, a1, color);
    triangle(out, a1, b0, b1, color);
    triangle(out, b, b1, b0, color);
    // Base is embedded in its parent branch (or ground): omit the hidden cap.
  }
}

function appendLeaf(out, center, direction, size, width, twist, color, low, pendant) {
  const [baseX, axis, baseZ] = frame(direction);
  const lateral = add(mul(baseX, Math.cos(twist)), mul(baseZ, Math.sin(twist)));
  const normal = norm(cross(lateral, axis));
  const point = (along, across, depth) => add(center, add(mul(axis, along * size), add(mul(lateral, across * width), mul(normal, depth * width))));
  // Closed, folded leaf volumes. Even low keeps a real side profile, not billboards.
  // Standard's two shoulder vertices refine the edge, not the crown's outer extent.
  const outline = low
    ? [[-.5, 0], [-.04, -.5], [.5, 0], [-.04, .5]]
    : [[-.5, 0], [-.29, -.36], [-.04, -.5], [.5, 0], [-.04, .5], [-.29, .36]];
  const top = point(-.015, 0, pendant ? .16 : .24), bottom = point(-.015, 0, -.12);
  const ring = outline.map(([y, x]) => point(y, x, 0));
  for (let j = 0; j < ring.length; j++) {
    const next = (j + 1) % ring.length;
    // Reverse the top winding so the broad face points toward local normal.
    triangle(out, top, ring[next], ring[j], mul(color, 1 + (j % 2) * .055));
    triangle(out, bottom, ring[j], ring[next], mul(color, .78));
  }
}

function canonicalType(type) {
  if (type === 'willow') return 'willow';
  if (type === 'pine' || type === 'conifer') return 'pine';
  if (type === 'cypress') return 'cypress';
  return 'broad';
}

function generateTree(THREE, options = {}) {
  const height = Number(options.height ?? options.h ?? 10);
  const radius = Number(options.radius ?? options.r ?? 3.8);
  if (!Number.isFinite(height) || height <= 0 || !Number.isFinite(radius) || radius <= 0) {
    throw new RangeError('Hero tree height and radius must be finite positive metres.');
  }
  const type = canonicalType(options.type), quality = options.quality === 'low' ? 'low' : 'standard';
  const low = quality === 'low', seed = options.seed ?? 1;
  // Separate morphology and tessellation RNGs: LOD never re-rolls the tree's shape.
  const r = random(seed), wood = bucket(), leaves = bucket(), palette = makePalette(THREE, type);
  const azimuth = r() * TAU, lean = (.04 + r() * .035) * radius;
  const leanX = Math.cos(azimuth) * lean, leanZ = Math.sin(azimuth) * lean;
  const baseRadius = clamp(height * .026, .09, .42);
  let branchSegments = 0, leafCount = 0, leafSprays = 0;
  const sprays = [];
  const branch = (a, b, ra, rb, major = false) => {
    appendTube(wood, a, b, ra, rb, major ? (low ? 5 : 7) : (low ? 3 : 5), palette, azimuth);
    branchSegments++;
  };
  const stemPoint = t => [leanX * t * t, height * t, leanZ * t * t];
  const stemLevels = [0, .09, .30, .47, .63, type === 'pine' || type === 'cypress' ? .91 : .76];
  for (let k = 1; k < stemLevels.length; k++) {
    const a = stemLevels[k - 1], b = stemLevels[k];
    branch(stemPoint(a), stemPoint(b), baseRadius * (1 - a * .93) * (k === 1 ? 1.65 : 1), baseRadius * (1 - b * .93), true);
  }
  // Root buttresses terminate on the ground and taper into it; no floating trunk gap.
  for (let k = 0; k < 6; k++) {
    const a = azimuth + k * TAU / 6 + (r() - .5) * .36;
    const reach = baseRadius * (2.1 + r() * 1.4);
    const p = [Math.cos(a) * reach * .55, baseRadius * .28, Math.sin(a) * reach * .55];
    const end = [Math.cos(a) * reach, .012, Math.sin(a) * reach];
    branch([Math.cos(a) * baseRadius * .6, baseRadius * .65, Math.sin(a) * baseRadius * .6], p, baseRadius * .34, baseRadius * .19);
    branch(p, end, baseRadius * .19, .012);
  }
  // A small faceted root collar adds earth contact without inventing a new tree pit.
  const collarR = baseRadius * 1.75;
  for (let k = 0; k < 9; k++) {
    const a = azimuth + k / 9 * TAU, b = azimuth + (k + 1) / 9 * TAU;
    triangle(wood, [0, .008, 0], [Math.cos(b) * collarR, .008, Math.sin(b) * collarR], [Math.cos(a) * collarR, .008, Math.sin(a) * collarR], palette.base);
  }
  const needle = type === 'pine' || type === 'cypress';
  for (let i = 0; i < 7; i++) {
    // Deliberately unequal sectors and crown heights leave oblique-through-view gaps.
    const a = azimuth + i * 2.399963 + (r() - .5) * .38;
    const level = needle ? .35 + i * .074 : .37 + (i % 3) * .065 + r() * .035;
    const widthFactor = type === 'cypress' ? .60 * (1 - i * .064) : needle ? 1 - i * .076 : .76 + r() * .20;
    const reach = radius * widthFactor;
    const start = stemPoint(level);
    const bend = [Math.cos(a) * reach * .37 + leanX, height * (level + (needle ? .05 : .145)), Math.sin(a) * reach * .37 + leanZ];
    const end = [Math.cos(a) * reach * .74 + leanX, height * (needle ? level + .09 : .66 + (i % 3) * .065 + r() * .055), Math.sin(a) * reach * .74 + leanZ];
    branch(start, bend, baseRadius * (.53 - i * .025), baseRadius * .32);
    branch(bend, end, baseRadius * .32, baseRadius * .12);
    for (let j = 0; j < 3; j++) {
      const forkAngle = a + (j - 1) * (.58 + r() * .19);
      const forkStart = lerp(bend, end, .43 + j * .16);
      const forkReach = reach * (.20 + r() * .11);
      const tip = [end[0] + Math.cos(forkAngle) * forkReach,
        end[1] + height * (needle ? .025 + r() * .045 : type === 'willow' ? -.01 + r() * .045 : .045 + r() * .08),
        end[2] + Math.sin(forkAngle) * forkReach];
      const elbow = lerp(forkStart, tip, .57);
      elbow[1] += height * .025;
      branch(forkStart, elbow, baseRadius * .13, baseRadius * .065);
      branch(elbow, tip, baseRadius * .065, baseRadius * .025);
      for (let k = 0; k < 3; k++) {
        const theta = forkAngle + (k - 1) * .72 + (r() - .5) * .3;
        const spread = radius * (.075 + r() * .085);
        const anchor = add(tip, [Math.cos(theta) * spread, height * (type === 'willow' ? -.035 - k * .053 - r() * .025 : needle ? (k - 1) * .017 : -.025 + k * .035), Math.sin(theta) * spread]);
        branch(lerp(elbow, tip, .72), anchor, baseRadius * .034, baseRadius * .012);
        sprays.push({ anchor, angle: theta, size: .83 + r() * .29, shade: r(), phase: r() * TAU });
      }
    }
    // Offset terminal leaves overlap one fork only; do not fill the central holes.
    const terminal = add(end, [Math.cos(a + .8) * radius * .13, height * .05, Math.sin(a + .8) * radius * .13]);
    branch(end, terminal, baseRadius * .035, baseRadius * .012);
    sprays.push({ anchor: terminal, angle: a + .8, size: .84 + r() * .13, shade: r(), phase: r() * TAU });
  }
  if (needle) sprays.push({ anchor: stemPoint(.94), angle: azimuth, size: .68, shade: .65, phase: 1 });
  // Six shared major leaves set each spray's outline. Standard adds three inner leaves.
  const arrangement = [[0, 0, .47], [-.44, -.08, .12], [.44, -.05, .17], [-.39, .04, -.35], [.38, -.03, -.32], [0, .19, -.10], [-.14, -.16, -.02], [.18, .12, .04], [0, .07, .20]];
  for (const spray of sprays) {
    const sr = random(`${seed}:spray:${leafSprays}`);
    const { anchor, angle, size, shade, phase } = spray;
    const direction = [Math.cos(angle) * .78, type === 'willow' ? -.95 : needle ? .19 : .43, Math.sin(angle) * .78];
    const [side, axis, up] = frame(direction);
    const span = radius * (needle ? .30 : .32) * size;
    for (let k = 0; k < arrangement.length; k++) {
      // Consume the same per-leaf randomness on both LODs.
      const [across, lift, along] = arrangement[k];
      const jitter = (sr() - .5) * .12, leafScale = .89 + sr() * .22, twist = (sr() - .5) * .8 + phase * .13;
      if (low && k >= 6) continue;
      const center = add(anchor, add(mul(side, across * span), add(mul(up, lift * span), mul(axis, along * span))));
      const growth = norm(add(mul(axis, .55), add(mul(side, across * 1.65 + jitter), mul(up, type === 'willow' ? -.14 : .23 + lift))));
      const t = clamp((center[1] / height - .43) / .57, 0, 1);
      const base = t < .5 ? lerp(palette.shade, palette.middle, t * 2) : lerp(palette.middle, palette.light, (t - .5) * 2);
      const color = mul(base, .92 + shade * .10);
      appendLeaf(leaves, center, growth, radius * (needle ? .245 : .205) * size * leafScale,
        radius * (needle ? .082 : type === 'willow' ? .076 : .105) * size, twist, color, low, type === 'willow');
      leafCount++;
    }
    leafSprays++;
  }
  // Fit to the EXISTING height/radius envelope, identically for both LODs.
  // All outline leaves exist at both qualities; internal leaves cannot set the fit.
  const outer = leaves.position;
  let maxY = 0, maxRadius = 0;
  // Use the same standard silhouette for the scale by relying only on shared leaves.
  const perLeaf = (low ? 8 : 12) * 9, perSpray = (low ? 6 : 9) * perLeaf;
  for (let i = 0; i < outer.length; i += 3) {
    const inSpray = i % perSpray;
    if (!low && inSpray >= 6 * perLeaf) continue;
    maxY = Math.max(maxY, outer[i + 1]);
    maxRadius = Math.max(maxRadius, Math.hypot(outer[i], outer[i + 2]));
  }
  const sx = radius / Math.max(radius, maxRadius), sy = height / Math.max(height, maxY);
  for (const part of [wood, leaves]) {
    for (let i = 0; i < part.position.length; i += 3) {
      part.position[i] *= sx; part.position[i + 1] *= sy; part.position[i + 2] *= sx;
      const n = norm([part.normal[i] / sx, part.normal[i + 1] / sy, part.normal[i + 2] / sx]);
      part.normal[i] = n[0]; part.normal[i + 1] = n[1]; part.normal[i + 2] = n[2];
    }
  }
  // Keep legacy construction and its wood fit byte-identical. Grouped mode
  // replaces the leaf bucket rather than layering masses onto the fine sprays.
  if (options.crownStyle === 'grouped') {
    const grouped = createGroupedCanopy({ height, radius, seed, azimuth, quality, palette });
    return { wood, leaves: grouped.leaves, summary: { type, quality, seed, height, radius, branchSegments,
      leafSprays: 0, leafCount: 0, groundAnchor: [0, 0, 0], ...grouped.summary } };
  }
  return { wood, leaves, summary: { type, quality, seed, height, radius, branchSegments, leafSprays, leafCount, groundAnchor: [0, 0, 0], crownStyle: 'sprays', mainClusterCount: 0, mediumClusterCount: 0, smallClusterCount: 0, clusterCount: 0 } };
}

function geometry(THREE, part) {
  const g = new THREE.BufferGeometry();
  for (const key of ['position', 'normal', 'color']) g.setAttribute(key, new THREE.Float32BufferAttribute(part[key], 3));
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

function createGroup(THREE, parts, treeStats, name) {
  const group = new THREE.Group(); group.name = name;
  const materials = [
    new THREE.MeshStandardMaterial({ name: 'Hero tree shared bark', color: 0xffffff, vertexColors: true, roughness: 1, metalness: 0 }),
    new THREE.MeshStandardMaterial({ name: 'Hero tree shared thick foliage', color: 0xffffff, vertexColors: true, roughness: .92, metalness: 0 }),
  ];
  for (let k = 0; k < parts.length; k++) {
    if (!parts[k].position.length) continue;
    const mesh = new THREE.Mesh(geometry(THREE, parts[k]), materials[k]);
    mesh.name = k ? 'Fork-attached closed leaf sprays' : 'Tapered forks and grounded buttress roots';
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh);
  }
  const stats = {
    trees: treeStats.length, drawCalls: group.children.length, materials: group.children.length,
    triangles: group.children.reduce((sum, m) => sum + m.geometry.attributes.position.count / 3, 0),
    woodTriangles: parts[0].position.length / 9, leafTriangles: parts[1].position.length / 9,
    vertices: parts.reduce((sum, part) => sum + part.position.length / 3, 0),
    geometryBytes: group.children.reduce((sum, m) => sum + Object.values(m.geometry.attributes).reduce((n, a) => n + a.array.byteLength, 0), 0),
    texturePixels: 0, textureBytes: 0, alphaTest: false, transparent: false,
    branchSegments: treeStats.reduce((sum, s) => sum + s.branchSegments, 0),
    leafSprays: treeStats.reduce((sum, s) => sum + s.leafSprays, 0),
    leafCount: treeStats.reduce((sum, s) => sum + s.leafCount, 0),
    crownStyles: [...new Set(treeStats.map(s => s.crownStyle))],
    mainClusterCount: treeStats.reduce((sum, s) => sum + s.mainClusterCount, 0),
    mediumClusterCount: treeStats.reduce((sum, s) => sum + s.mediumClusterCount, 0),
    smallClusterCount: treeStats.reduce((sum, s) => sum + s.smallClusterCount, 0),
    clusterCount: treeStats.reduce((sum, s) => sum + s.clusterCount, 0),
    treeStats,
  };
  group.userData.heroTreeStats = stats;
  let disposed = false;
  return { group, stats, dispose() {
    if (disposed) return;
    disposed = true;
    for (const mesh of group.children) mesh.geometry.dispose();
    for (const material of materials) material.dispose();
    group.removeFromParent();
  } };
}

/** Pure CPU; metres, base y=0. crownStyle:'grouped' opts into dense mall foliage. */
export function createHeroTree(THREE, options = {}) {
  const tree = generateTree(THREE, options);
  return createGroup(THREE, [tree.wood, tree.leaves], [tree.summary], `Round 2 original ${tree.summary.type} tree`);
}

/**
 * Merge 1–8 EXISTING placement records into two meshes, regardless of tree type.
 * Coordinates are local to origin. Set y explicitly or pass heightAt(x,z).
 * Caller must exclude these exact records from the old near-LOD meshes.
 */
export function createHeroTreeBatch(THREE, records, { quality = 'standard', origin = [0, 0, 0], heightAt = () => 0 } = {}) {
  if (!Array.isArray(records) || records.length > 8) throw new RangeError('Hero tree batches contain at most eight existing tree records.');
  if (!Array.isArray(origin) || origin.length !== 3 || !origin.every(Number.isFinite)) throw new TypeError('Batch origin must be three finite numbers.');
  const parts = [bucket(), bucket()], summaries = [];
  for (const record of records) {
    const x = Number(record.x ?? 0), z = Number(record.z ?? 0), y = Number(record.y ?? heightAt(x, z));
    if (![x, y, z].every(Number.isFinite)) throw new TypeError('Hero tree placement must be finite.');
    const tree = generateTree(THREE, { ...record, quality });
    for (const [k, source] of [tree.wood, tree.leaves].entries()) {
      for (let i = 0; i < source.position.length; i += 3) parts[k].position.push(source.position[i] + x - origin[0], source.position[i + 1] + y - origin[1], source.position[i + 2] + z - origin[2]);
      // Avoid argument-spread limits when one tree has tens of thousands of vertices.
      for (const value of source.normal) parts[k].normal.push(value);
      for (const value of source.color) parts[k].color.push(value);
    }
    summaries.push({ ...tree.summary, x, y, z, sourceId: record.id ?? null });
  }
  return createGroup(THREE, parts, summaries, 'Round 2 same-position hero tree batch');
}
