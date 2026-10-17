# Sources and attribution

## Geographic database

© OpenStreetMap contributors. The included OSM-derived geographic data is made available under the [Open Data Commons Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Keep the visible attribution and license links when redistributing the scene or data. See the [OpenStreetMap copyright notice](https://www.openstreetmap.org/copyright).

- Extract provider: [Geofabrik Beijing](https://download.geofabrik.de/asia/china/beijing.html).
- Original extract: `beijing-261015.osm.pbf`.
- Source data timestamp: 2026-10-15 20:21 UTC; retrieved 2026-10-16.
- Original SHA256: `aa3287876485aae1e0a109277fa0b25b47558fe2764c43918218d449fbe94490`.
- Rendering region: 116.30–116.49° E, 39.85–40.015° N.
- Source OSM object references are retained in feature properties and exact replacement manifests. Geometries use WGS84, with a local metre-based rendering projection. No GCJ-02 or BD-09 coordinates are mixed into this dataset.
- Derived source geometry accompanies the rebuilding supplement. The large original PBF and intermediate conversions are omitted from the compact delivery; the dated source URL and hash are retained.

The data has uneven building coverage. Approximate heights, procedural courtyard infill, inferred planting and illustrative traffic are labeled separately from mapped positions. These additions are not new surveyed OpenStreetMap observations.

## Software

Three.js and OrbitControls, version 0.186.0: MIT license. The complete vendor license and pinned file checksums are included in `web/vendor/`. See [the Three.js project](https://threejs.org/) and [upstream license](https://github.com/mrdoob/three.js/blob/dev/LICENSE).

The application uses locally vendored modules and does not load a CDN, analytics service, map-tile service or paid asset service at runtime. Python serves the local files; Node is needed for regeneration, not ordinary viewing. Blender is used for the editable rebuilding source.

## Architectural and street references

Public architectural, institutional, tourism and Wikimedia photographs were inspected during modelling. Source URLs, visual observations and uncertainty are recorded in:

- `assets/architecture/landmark-manifest.json` and associated reference records
- `data/street-reference-manifest.json`
- `data/unified-acceptance-manifest.json`
- Per-site evidence documents in `data/` and geography reports

Research photographs are not runtime textures and are not included in the redistribution package. Their respective copyrights and licenses remain with their source owners. The models and materials are procedural interpretations; photographic reference does not imply permission to republish the photographs.

The user-supplied Pine & Parcel video is a visual quality reference, not Beijing geographic evidence. Its video file and extracted frames are excluded from the delivery package.

## Verification distinction

Source inspection, geometric construction, actual browser rendering and visual acceptance are separate fields. A completed model entry or a screenshot file is not, on its own, a quality pass. Consult the dated acceptance and performance reports for the delivered revision.

## Redistribution and commercial-use boundary

At21:10UTC on2026-10-16, the official OpenStreetMap copyright page and upstream Three.js license were rechecked. The data and software licenses are different; preserve both. Public photograph availability is not a blanket commercial-reuse license. This delivery does not certify unrestricted commercial clearance of every architectural likeness, business mark or reference image. Review the applicable data/software terms and any relevant third-party rights before external publication. No permission is inferred from a photograph having been inspected.
