# 北京城市漫游 / Beijing City Explorer

Independent interactive Beijing city panorama and CBD streetscape.

- Website: https://jinleiviva.github.io/beijing-city-explorer/
- Panorama: `project/web/index.html`
- CBD: `project/web/cbd-preview.html`

## Run locally

Create a fresh `_site` directory, extract `runtime-data.zip` into `_site`, then copy `project`, `docs`, `index.html` and `.nojekyll` from the repository into `_site`, overwriting the extracted base files with the current tracked files. Run `python3 -m http.server 8000 --directory _site` and open http://localhost:8000/. Do not extract the base archive over the tracked project: the tracked native runtime files contain the candidate 14/15 updates. No build tools or remote CDNs are required. The archive contains the shared geographic data, cached geometry, and architectural source manifest. All rendering JavaScript is available directly in `project/web/`.

## Deployment

GitHub Actions unpacks the data archive and publishes the static site to GitHub Pages. All paths are relative and work under the repository Pages path.

## Sources and rights

See [attribution](docs/ATTRIBUTION.md), the vendored Three.js MIT license and eight SIL font license notices alongside the procedural label geometry. OSM-derived data is distributed under ODbL 1.0. Reference photographs and videos are not redistributed. Models, landscaping and traffic are stylized approximations, not surveying or navigation data. This independent project is not affiliated with the represented institutions, businesses or building owners. Third-party trademarks remain their owners' property. Public availability does not imply unrestricted commercial clearance.

Published from candidate 15, preserved Sites source commit `3c68ecbba61f08d4b5aed6d8a23243a4e811af89`. Both entrances share the refined CBD assembly.

## Current release and known issues

Candidate 14 integrates the shared CBD into the full-city viewer and corrects winding in 16 neighboring cached tiles. Candidate 15 partitions overlapping CBD/Guomao ground and removes covered land beneath the mall paving. Candidate 12 roof and candidate 13 bounded-road repairs remain enabled. See [shared scene details](docs/CBD_SHARED_WORLD_CANDIDATE14.md) and [plaza repair details](docs/CBD_PLAZA_CANDIDATE15.md).

CPU structural and same-position still-image checks were recorded in the preserved release. Live WebGL temporal flicker remains unverified; historical winding issues in 205 other background cache tiles remain outside this repair.

The original complete base data archive is preserved. Updated runtime resources are ordinary complete files at their actual project paths, not split archive parts. GitHub Pages extracts the base archive first and overlays the tracked project files. The assembled runtime is checked against the preserved candidate 15 source.
