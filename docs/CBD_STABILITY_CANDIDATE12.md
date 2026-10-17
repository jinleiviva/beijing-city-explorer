# CBD rooftop stability candidate 12

Based on verified candidate 11. This revision combines a bounded, structurally checked rooftop correction with explicit comparison controls. Live WebGL temporal stability remains unverified.

## Roof and road evidence, before changes

The user located the issue at building tops and street surfaces. A read-only audit of the immutable candidate-11 skyline snapshot checked 27,183 upward horizontal architecture triangles over 7 m. It found actual coplanar overlap, including 11 triangle pairs between China World B’s last glass cap and dark crown roof (summed intersection area about 2,844 m²), and broad generic CBD glass caps beneath full dark terrace slabs. Counts also include hidden internal and same-material overlaps, so the total is not a visible-artifact area.

Separate road evidence found four roughly 196 m² coincident asphalt crossings. Same-color asphalt overlap alone does not prove visible flicker. Junction paint is only 10–11 mm above the road, and a median patch only 2 mm. Main support slab and road are separated by 1.65 m, so their direct coplanarity is excluded. Conventional-depth quantization at distance and shadow movement remain independent contributors. No road geometry or global depth settings are silently changed here.

## Targeted roof repair

- Remove only upward cap portions exactly covered by known roof slabs. Keep all source facade/lower triangles and uncovered roof-ring portions.
- On China World B, clip the last glass cap against the existing dark roof rectangle. Convert the last silver full plate into four perimeter bars, preserving its outer extents and height so the intended recessed roof is visible through the crown.
- The repair is applied in the bounded CBD recipe assembly, without changing the global recipe library. It is shared automatically when the same CBD assembly is later embedded into the city.
- Fifteen recipe variants pass area-conservation and boundary checks. Forty-nine top-down B roof rays find a surface; 35 directly hit its dark roof. These are structural checks, not proof of temporal flicker elimination.
- The diagnostic panel can switch back to original roofs for comparison. This fallback is not the default.

## Other implemented and CPU-tested

- Only the independent CBD explicitly enables the following tree policy; the global city generator’s legacy defaults are retained. The 750 m inner tree LOD has 0.12 hysteresis: it enters the far tier above 750 m and returns below 660 m. Repeated 749/751 m recrossing no longer alternates every sample.
- Initialize far groups hidden before their first real camera update. The first CPU test caught that Three's hysteresis reads previous object visibility; leaving a newly added far group visible would prematurely select it at 740 m. The corrected bounded real-tree fixture preserves all geometry and instance bytes exactly.
- Keep the old standard depth and dynamic shadow policy as defaults. Experimental renderer options are mutually exclusive and do not silently combine depth methods.
- Add diagnostic telemetry for actual depth bits, MSAA samples/context attributes, drawing-buffer size, active versus requested depth support, camera planes, and shadow state.

## Independent diagnostic routes

Once a permitted WebGL-enabled preview is available, use the same page, camera, quality, paused traffic and camera route:

- `?view=mall&depth=standard&shadows=dynamic&treeLod=baseline`: old inner tree boundary policy.
- `?view=mall&depth=standard&shadows=dynamic`: tree hysteresis only.
- `?view=mall&depth=logarithmic&shadows=dynamic`: log-depth experiment.
- `?view=mall&depth=reversed&shadows=dynamic`: reversed-depth experiment; verify actual capability, since EXT_clip_control is required.
- `?view=mall&depth=standard&shadows=off`: isolate shadow contribution.
- `?view=mall&depth=standard&shadows=fixed`: fixed 1,350 m half-extent isolates continuously changing shadow scale; target-following remains active, so this is not a complete texel-snapped shadow solution.

These are parameter examples, not links to a deployed candidate. Neither the renderer nor the browser security configuration is changed outside normal supported page options.

## Acceptance still required

Original WebGL shader compilation, full near/far zoom-and-orbit sequence, facade/advertising pixels, tree transitions, ground/contact shadows, high/low quality and measured median/P95 GPU-frame behavior remain unverified because the available cloud browser reports WebGL disabled. Static CPU images cannot substitute for these temporal tests. The user-reported zoom-out flicker is not claimed fixed.

The strongest source-supported risk is precision loss from the .35–6000 m conventional perspective depth range combined with millimeter/centimeter-separated advertising faces. Subpixel trim and continuously rescaled shadows are independent plausible contributors. The small tree LOD fix addresses a reproducible transition weakness, not all these risks.

## User-facing comparison

A collapsed “缩放闪烁诊断” panel offers depth, shadows, roof ownership and tree-LOD selections, plus Apply and Restore Defaults. It is initialized before WebGL creation so unsupported-browser status remains readable. Rebuilding a renderer preserves camera, quality and pause state, but restarts traffic time; this is stated in the panel. Source event/query tests pass, including invalid pose rejection and unsupported requested-depth reporting. Browser layout and actual dynamic pixels still need a supported rendering browser.

## Final CPU check

The new 800×500 source-geometry image shows China World B’s dark roof continuously inside its open crown. The immutable geometry audit covers the same 107 architecture batches: targeted glass-to-dark-roof coplanarity disappears, while all counted upward coplanar triangle pairs decline from 8,910 to 623. Remaining counts include hidden or same-material joints. This is not a claim that every intersecting surface is corrected or every flicker is gone.
