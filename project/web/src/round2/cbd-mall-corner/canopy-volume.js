/**
 * Texture-free grouped foliage for the eight opt-in mall trees.
 * Five overlapping, asymmetric leaf masses carry the distant silhouette; smaller
 * shoulder lobes are rooted inside those masses, never isolated balls or cards.
 * Main geometry and its envelope are identical at standard and low quality.
 */
const TAU = Math.PI * 2;
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const sub = (a, b) => a.map((v, i) => v - b[i]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function random(seed) {
  let state = 2166136261;
  for (const c of String(seed)) state = Math.imul(state ^ c.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function lobeVertices(lobe, sides, rings) {
  const { center: c, extent: e, phase } = lobe;
  // Broad shoulders, a tapered underside and an offset top avoid ellipsoid balls.
  const profile = [[-1, 0], [-.64, .62], [-.18, .98], [.36, 1], [.76, .71], [1, 0]];
  const sections = rings === 4 ? profile.slice(1, -1) : [profile[1], profile[2], profile[4]];
  const vertex = (y, radius, a) => {
    const scallop = 1 + .085 * Math.sin(a * 3 + phase) + .045 * Math.cos(a * 5 - phase * .7);
    const x = Math.cos(a) * radius * scallop;
    const z = Math.sin(a) * radius * (1 + .065 * Math.sin(a * 4 + phase * .6));
    return [c[0] + e[0] * (x + .10 * y), c[1] + e[1] * (y + .045 * radius * Math.sin(a * 2 + phase)), c[2] + e[2] * (z - .07 * y)];
  };
  const rows = sections.map(([y, radius], k) => Array.from({ length: sides }, (_, j) => {
    const a = phase + j / sides * TAU + .035 * Math.sin(j * 2.1 + phase) + (k % 2) * .035;
    return vertex(y, radius, a);
  }));
  const bottom = vertex(-1, 0, phase), top = vertex(1, 0, phase);
  const faces = [];
  for (let j = 0; j < sides; j++) {
    const next = (j + 1) % sides;
    faces.push([bottom, rows[0][j], rows[0][next]]);
    for (let k = 1; k < rows.length; k++) {
      faces.push([rows[k - 1][j], rows[k][j], rows[k - 1][next]]);
      faces.push([rows[k - 1][next], rows[k][j], rows[k][next]]);
    }
    faces.push([rows.at(-1)[j], top, rows.at(-1)[next]]);
  }
  return faces;
}

function appendLobe(out, lobe, faces, palette, height, ranges) {
  const startTriangle = out.position.length / 9;
  for (const face of faces) {
    let [a, b, c] = face;
    let n = cross(sub(b, a), sub(c, a));
    const center = a.map((v, i) => (v + b[i] + c[i]) / 3);
    if (dot(n, sub(center, lobe.center)) < 0) {
      [b, c] = [c, b];
      n = n.map(v => -v);
    }
    const magnitude = Math.hypot(...n);
    if (magnitude < 1e-10) throw new Error('Grouped canopy contains a degenerate face.');
    n = n.map(v => v / magnitude);
    // Large readable shade zones; no independent random color per tiny triangle.
    const lift = clamp((center[1] / height - .49) / .51, 0, 1);
    const base = lift < .64 ? mix(palette.shade, palette.middle, .27 + lift * 1.1)
      : mix(palette.middle, palette.light, (lift - .64) * 1.25);
    const shade = lobe.tone * (.94 + .055 * n[1] + .035 * n[0]);
    const color = base.map(v => v * shade);
    out.position.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++) { out.normal.push(...n); out.color.push(...color); }
  }
  ranges.push({ id: lobe.id, tier: lobe.tier, parent: lobe.parent, center: [...lobe.center], extent: [...lobe.extent], startTriangle, triangles: out.position.length / 9 - startTriangle });
}

/** Pure CPU leaf geometry. Radius and height are the existing source envelope. */
export function createGroupedCanopy({ height, radius, seed, azimuth, quality, palette }) {
  const r = random(`${seed}:grouped-canopy-v3`), low = quality === 'low';
  const out = { position: [], normal: [], color: [] }, ranges = [];
  const main = [];
  for (let i = 0; i < 4; i++) {
    const a = azimuth + i * TAU / 4 + (r() - .5) * .24;
    main.push({ id: `main-${i}`, tier: 'main', parent: 'main-4',
      center: [Math.cos(a) * radius * (.34 + r() * .045), height * (.735 + r() * .055), Math.sin(a) * radius * (.34 + r() * .045)],
      extent: [radius * (.62 + r() * .065), height * (.20 + r() * .035), radius * (.60 + r() * .065)],
      phase: a + .18, tone: .96 + r() * .065 });
  }
  main.push({ id: 'main-4', tier: 'main', parent: null,
    center: [Math.cos(azimuth + 1) * radius * .065, height * .825, Math.sin(azimuth + 1) * radius * .065],
    extent: [radius * .63, height * .19, radius * .60], phase: azimuth + .8, tone: 1.015 });
  const mainFaces = main.map(lobe => lobeVertices(lobe, 12, 4));
  let maxY = 0, maxRadius = 0;
  for (const faces of mainFaces) for (const face of faces) for (const p of face) {
    maxY = Math.max(maxY, p[1]); maxRadius = Math.max(maxRadius, Math.hypot(p[0], p[2]));
  }
  // Only the shared main masses determine the fit. Both qualities hit precisely
  // the existing h/r envelope, and all additional lobes are kept inside it.
  const scale = [radius / maxRadius, height / maxY, radius / maxRadius];
  for (let i = 0; i < main.length; i++) {
    for (const key of ['center', 'extent']) main[i][key] = main[i][key].map((v, k) => v * scale[k]);
    for (const face of mainFaces[i]) for (let k = 0; k < 3; k++) face[k] = face[k].map((v, axis) => v * scale[axis]);
    appendLobe(out, main[i], mainFaces[i], palette, height, ranges);
  }
  // Children are rooted within a parent mass and partly overlap its shoulder.
  // Lower LOD removes subordinate lobes, never the five silhouette-setting ones.
  for (let i = 0; i < main.length; i++) {
    const parent = main[i];
    for (let j = 0; j < 5; j++) {
      const medium = j < 2, a = parent.phase + j * 2.399963 + .2;
      const lobe = { id: `${medium ? 'medium' : 'small'}-${i}-${j}`, tier: medium ? 'medium' : 'small', parent: parent.id,
        center: [parent.center[0] + Math.cos(a) * parent.extent[0] * (medium ? .66 : .75),
          parent.center[1] + parent.extent[1] * (medium ? .18 + j * .19 : -.16 + (j - 2) * .29),
          parent.center[2] + Math.sin(a) * parent.extent[2] * (medium ? .66 : .75)],
        extent: parent.extent.map(v => v * (medium ? .37 : .205)), phase: a + .4,
        tone: parent.tone * (medium ? 1.015 : 1.03) };
      if (low && j !== 0 && j !== 3) continue;
      const faces = lobeVertices(lobe, medium ? (low ? 8 : 10) : (low ? 6 : 8), medium ? 4 : 3);
      // Uniformly shrink around the attachment center, never clip individual
      // vertices (which would distort winding or create flat cylindrical edges).
      let fit = 1;
      for (const face of faces) for (const p of face) {
        const d = sub(p, lobe.center), c = lobe.center;
        if (d[1] > 0) fit = Math.min(fit, (height - c[1]) / d[1]);
        const A = d[0] ** 2 + d[2] ** 2, B = 2 * (c[0] * d[0] + c[2] * d[2]);
        const C = c[0] ** 2 + c[2] ** 2 - radius ** 2;
        if (A > 1e-12) fit = Math.min(fit, (-B + Math.sqrt(Math.max(0, B * B - 4 * A * C))) / (2 * A));
      }
      fit = Math.max(.01, Math.min(1, fit));
      lobe.extent = lobe.extent.map(v => v * fit);
      for (const face of faces) for (let k = 0; k < 3; k++) face[k] = face[k].map((v, axis) => lobe.center[axis] + (v - lobe.center[axis]) * fit);
      appendLobe(out, lobe, faces, palette, height, ranges);
    }
  }
  return { leaves: out, summary: { crownStyle: 'grouped', mainClusterCount: 5,
    mediumClusterCount: low ? 5 : 10, smallClusterCount: low ? 5 : 15,
    clusterCount: low ? 15 : 30, crownClusters: ranges } };
}
