# 北京城市漫游 / Beijing City Explorer

Independent interactive Beijing city panorama and CBD streetscape.

- Website: https://jinleiviva.github.io/beijing-city-explorer/
- Panorama: `project/web/index.html`
- CBD: `project/web/cbd-preview.html`

## Run locally

Extract `runtime-data.zip` into the repository root, then run `python3 -m http.server 8000`. Open http://localhost:8000/. No build tools or remote CDNs are required. The archive contains the shared geographic data, cached geometry, and architectural source manifest. All rendering JavaScript is available directly in `project/web/`.

## Deployment

GitHub Actions unpacks the data archive and publishes the static site to GitHub Pages. All paths are relative and work under the repository Pages path.

## Sources and rights

See [attribution](docs/ATTRIBUTION.md), the vendored Three.js MIT license and eight SIL font license notices alongside the procedural label geometry. OSM-derived data is distributed under ODbL 1.0. Reference photographs and videos are not redistributed. Models, landscaping and traffic are stylized approximations, not surveying or navigation data. This independent project is not affiliated with the represented institutions, businesses or building owners. Third-party trademarks remain their owners' property. Public availability does not imply unrestricted commercial clearance.

Published from the reviewed CBD candidate 13 snapshot. The full-city viewer retains its previous CBD implementation; these two entrances do not yet share the new CBD geometry.

## Current release and known issues

Candidate 13 partitions overlapping asphalt and curb surfaces on four bounded carriageways and clips two median infills to their uncovered gaps. The folded diagnostic panel offers original local roads for comparison. Candidate 12's targeted roof repair and tree-LOD hysteresis remain enabled. Road center lines, elevations, routes and signals are preserved. See [release details](docs/CBD_ROAD_OWNERSHIP_CANDIDATE13.md).

CPU structural and same-position still-image checks passed. These checks do not prove that road flicker during zooming is eliminated. Original WebGL temporal validation remains pending. The full-city CBD integration (candidate 14) is not included.
