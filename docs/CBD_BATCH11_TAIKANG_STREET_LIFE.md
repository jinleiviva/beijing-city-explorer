# CBD candidate 11: bounded massing and street-life update

This is a new bounded improvement batch begun on 17 October 2026 at 09:37:35 UTC. The earlier eight-hour production window closed at 09:31:39 UTC. A platform interruption from 09:44:50 to 09:56:50 was blocked time, not effective production. A second interruption from approximately 10:20:28 to 10:27:11 was also excluded.

## Changes

- Added a distant skyline preset at `[5040,700,2500]` looking at `[5040,180,-310]`, 24-degree field of view. It preserves actual building dimensions and free orbit/zoom. The orbit maximum is 3,600 m, so selecting this preset does not silently clamp the reviewed 2,857.709 m camera distance.
- Replaced the named Taikang fallback mass, previously 66.557 m, with an independently supported 223.4 m tower. The exact existing OSM footprint and collision footprint are retained. A 17 m glass entrance enclosure, shallow recessed facade strips, horizontal bands and rounded crown are included. This is photo-informed reconstruction, not a survey or interior replica.
- Added five bounded low-polygon vehicle forms and three adult outfit forms using the existing traffic and pedestrian pools. Routes, counts, signal control and simulation records remain owned by the existing traffic implementation.
- Added three original commercial campaign designs. Their texts and pictures are authored illustrations, labelled 风貌示意; they are not real tenants or commissioned campaigns. All 27 full-scene support rays passed after the red and green panels were moved to the actual lower opaque wall band. The previous upper positions intersected the projecting corner glazing and were rejected. The original upper amber placement remains.

## Taikang evidence and limits

CTBUH lists architectural and tip height as 223.4 m: https://www.skyscrapercenter.com/building/id/26846

The facade contractor Jangho independently reports 223.4 m and a 17 m glass lobby, 3.1 m maximum glass width and 1.02 m glass fins: https://www.jangho.com/jituanxinwen/2020/0713/711.html

The existing named source footprint is https://www.openstreetmap.org/way/764434360 . Its coordinates were retained; no independent surveyed building-to-parcel registration was obtained. The crown profile, upper proportions and shallow recesses are photo-informed. Door position and small opening rhythm are inferred. No unsupported rooftop logo, helipad or new annex was added. Lobby interiors remain simplified and the opaque inner core is visually prominent.

The reconstructed top measured directly from the immutable rendered vertices is 223.40000488 m above the source ground. This numerical match validates the implementation of the height, not all architectural proportions.

Kerry office north/south identity binding and Fortune A main-tower versus adjacent-annex footprint binding remain unresolved. Those masses were not silently resized.

## Resource and simulation checks

Standard Taikang module: 13,792 triangles, nine material batches, 1,095,328 geometry bytes. Low quality: 10,676 triangles, nine batches, 844,600 bytes. Both retain the tower envelope and principal entrance form. Finite coordinates, nondegenerate triangles, winding/normal agreement and height tests passed.

New street-life geometry is 825,768 bytes plus 106,240 bytes of instance-matrix capacity for the existing 88-car/52-person pools. Sixteen near-view batches use one shared vertex-color material. Ten principal batches cast shadows; small lamp/wheel/glazing detail and hands do not create additional shadow batches. Beyond 1,800 m, the existing simpler objects are displayed instead. Hidden old geometry remains allocated because it also supplies simulation transforms.

An integrated 120-second, 30-Hz vehicle simulation passed with all five vehicle types, both directions, no full-envelope building collisions, no sampled full-envelope departure from the carriageway, no visible instantaneous jumps, no empty-flow seconds and a minimum same-edge bumper gap of 1.801594 m. These are CPU geometry and trajectory checks, not measured browser frame rate.

The pedestrian models are wider than the old simple torso. Original pedestrian movement has no person-to-person avoidance. Equal route records do not prove that bags or arms never brush nearby people. The forecourt route has a bounded ground/building/road clearance audit; global pedestrian contact and natural gait are not claimed.

## Rendering and publication limits

CPU images use the actual Three.js geometry, world and instance matrices, camera, source colors, source shadow flags and source time. Blender Cycles approximates the browser's custom shaders, environment reflections and lighting behavior. These images are geometry and composition evidence; they do not establish original WebGL performance or browser interaction acceptance.

No reference photograph or video is distributed as a texture. Text outlines reuse the existing licensed font glyph data and its accompanying license. Other code and asset attributions remain in ATTRIBUTION.md and the existing runtime license files.

This candidate is an aggregate update to the existing private preview. Public repository synchronization is a separate operation performed only after this candidate is verified and frozen. No unreviewed working directory is a release artifact.

## Coverage accounting

The tracked geometric-detail count is now 116 of the 200 bounded building footprints. This adds Taikang to the previous 115; it does not mean 116 fully reconstructed facades. Evidence-supported building-name text remains on ten buildings, with zero new enterprise emblem graphics. The north mall contains the two previous large original posters and three additional original compositions.

## Temporal rendering issue still open

A user-reported zoom-out flicker is under a separate stability investigation. The current conventional depth range and centimeter-spaced mounted graphic layers, subpixel facade lines, unsnapped shadow frustum and a tree LOD transition are plausible contributors. CPU static pictures do not reproduce or resolve this issue. Candidate 11 does not claim a flicker fix.

## Final bounded image review

Three Taikang/entry/skyline images plus the final mall and service-forecourt images were rendered and inspected. The mall image shows the three added campaign fields supported by the opaque host wall and the new vehicle roof silhouettes. The forecourt image shows two near figures with articulated limbs and grounded shoes; both use the same brick outfit instance, so it does not demonstrate all three outfits or natural walking. Three outfit forms were separately reviewed in the small controlled model sample. Existing tree-trunk occlusion of part of the bookstore sign remains.
