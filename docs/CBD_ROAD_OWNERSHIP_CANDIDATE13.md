# Candidate 13: bounded road-surface ownership

This version preserves candidate 12's roof repair and diagnostics. The owner reported that roof flicker improved substantially in an actual browser. That report does not establish complete elimination or identify a particular diagnostic mode.

## Changed

Four mapped carriageways on Guanghua Road and East Jintong Road now have one asphalt owner where their strips overlap. Covered curb underlay is removed, and duplicate curb surfaces are partitioned. The two existing narrow median crossing infills are clipped to their actual uncovered gap and meet the road plane without the previous tiny overlapping margin.

Road centre lines, widths, elevations, traffic routes, signals, existing paint and surrounding buildings are retained. The bounded change does not replace the rest of Beijing's roads. The shared full-city CBD integration is still a separate candidate and is not included here.

The folded “缩放闪烁诊断” panel has a “光华/金桐局部路口” selector. Single ownership is the default; the original roads remain available for comparison. Applying it preserves camera, quality and pause state, but restarts simulation time. Standard depth and dynamic shadows remain the defaults. Experimental depth and shadow choices are separate from this geometric repair.

## Evidence

- Pure four-road partition tests: 41 asphalt triangle-pair overlaps reduced to zero, with 5,608 boundary/coverage samples reporting no gap or new outside coverage.
- Actual Float32 GeometryBatch fixture: 52 triangles became 162; no reversed or degenerate triangles. The new buffer is 24,300 bytes. Road elevation, color and surface classes remain unchanged.
- Two separate scene processes, each advanced for 30 seconds: 622 other meshes, road/profile records, and full vehicle/pedestrian/signal records at 8 and 30 seconds match exactly. Peak CPU-process RSS was about 405 MiB. This is not browser performance.
- In the actual merged junction geometry, summed asphalt overlap area decreased from 827.292 to 0.002525 m²; curb/curb overlap from 2,617.924 to 0.0000605 m². Tiny Float32 edge residuals are disclosed rather than claimed to be exactly zero.
- A real 800×500 CPU bridge frame at the unchanged mall camera and 8-second simulation time shows continuous asphalt, retained crossings and vehicles, and no obvious new road hole. Its 24.69-second rendering time is offline CPU cost, not real-time FPS.

## Limits

The CPU bridge approximates the WebGL environment, lighting and custom shaders. A still frame cannot establish that roads no longer flicker while zooming. Centimetre-separated paint, sidewalk/curb layering, shadow-map movement and other roads remain possible contributors. No blanket polygon offset, road height increase, exposure change or forced draw-order workaround was applied.

For the actual browser comparison, keep the same camera and zoom direction, first compare the local-road selector alone. Only then test shadow or depth modes one at a time. The panel reports unavailable WebGL or unsupported depth modes rather than treating a requested setting as proof it is active.
