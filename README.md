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

Candidate 17 builds on the preserved candidate 15 Sites source commit `3c68ecbba61f08d4b5aed6d8a23243a4e811af89`. Both entrances share the refined CBD assembly.

## Current release and known issues

Candidate 14 integrates the shared CBD into the full-city viewer and corrects winding in 16 neighboring cached tiles. Candidate 15 partitions overlapping CBD/Guomao ground and removes covered land beneath the mall paving. Candidate 12 roof and candidate 13 bounded-road repairs remain enabled. See [shared scene details](docs/CBD_SHARED_WORLD_CANDIDATE14.md) and [plaza repair details](docs/CBD_PLAZA_CANDIDATE15.md).

CPU structural and same-position still-image checks were recorded in the preserved release. Live WebGL temporal flicker remains unverified; historical winding issues in 205 other background cache tiles remain outside this repair.

The original complete base data archive is preserved. Updated runtime resources are ordinary complete files at their actual project paths, not split archive parts. GitHub Pages extracts the base archive first and overlays the tracked project files. The assembled runtime is checked against the preserved candidate 15 source.

## Candidate 17: geometry-safe rendering near plane

Candidate 17 preserves candidate 15's complete geometry. It does not contain candidate 16's road-backing cutouts. A separate rendering-camera copy uses the empty space between the camera and conservative visible-mesh bounds to improve distant standard depth precision. The original control/simulation/picking camera is unchanged. Both entries share the implementation; the full-city entry checks the entire scene while focused on CBD.

The known oblique mall ray remains intact. Static and moving-camera CPU regressions pass, including unchanged complete traffic records and 625 meshes. Actual WebGL zoom-flicker and GPU performance acceptance remain blocked; this is not a claim that flicker is eliminated. Use `nearClip=baseline` to compare the original near plane. See [method, evidence, scope and remaining risks](docs/CBD_SAFE_NEAR_CANDIDATE17.md).

- [CBD candidate 17](https://jinleiviva.github.io/beijing-city-explorer/project/web/cbd-preview.html?diagnostics=1)
- [CBD original near-plane comparison](https://jinleiviva.github.io/beijing-city-explorer/project/web/cbd-preview.html?nearClip=baseline&diagnostics=1)
- [Full-city original near-plane comparison](https://jinleiviva.github.io/beijing-city-explorer/project/web/index.html?nearClip=baseline)
