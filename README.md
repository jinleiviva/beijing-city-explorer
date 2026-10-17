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

Published from the reviewed CBD candidate 12 snapshot. The full-city viewer retains its previous CBD implementation; these two entrances do not yet share the new CBD geometry.

## Current release and known issues

Candidate 12 removes specific overlapping roof caps under known roof slabs and enables tree-LOD hysteresis in the independent CBD viewer. A collapsed diagnostic panel provides depth mode, shadow and original-roof comparisons; standard depth remains the default. See [release details](docs/CBD_STABILITY_CANDIDATE12.md).

Road flicker remains unresolved. CPU structural checks support the targeted roof correction, but do not establish that live temporal flicker is eliminated. Original WebGL visual/performance and dynamic stability acceptance remain pending because the verification cloud browser cannot create a WebGL context. The full-city CBD integration is not included in this release.
