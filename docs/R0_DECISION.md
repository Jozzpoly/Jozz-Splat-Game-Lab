# R0 Renderer Decision — 2026-08-15

Status: `CLOSED / REOPENABLE`

## Decision

Use **PlayCanvas Engine 2.21.2** as the active runtime for the next implementation campaign.

Keep **Spark 2.1.0 + Three.js 0.185.1** as a validated fallback/reference path. Do not maintain a permanent renderer abstraction merely to keep both active.

## Evidence

Owner browser testing on the exact verified F0 source demonstrated:

- Spark 2.1.0 renders the exact foreground PLY successfully on WebGL2;
- PlayCanvas 2.21.2 renders the exact foreground and raw PLY successfully on WebGL2;
- PlayCanvas `Best` successfully selected WebGPU on the owner device;
- both candidates are sufficiently responsive for the current ~1.0M-splat experiment;
- current telemetry is presentation-interval evidence, not a GPU-cost benchmark and therefore is not used to rank candidates by FPS;
- the dominant observed defects are capture quality, scan tilt/world orientation and navigation scale rather than renderer compatibility.

Structured evidence: `evidence/r0/owner-browser-2026-08-15.json`.

## Why PlayCanvas is active

The choice is based on the cost of reaching the **next evidence**, not on an FPS victory.

Current PlayCanvas Gaussian Splatting supports depth-enabled picking with world-position recovery. W0 requires exactly that capability for calibration probes. The same ecosystem also provides the later SplatTransform collision pipeline, reducing integration discontinuity between world grounding and physical validation.

## What this decision does not claim

- PlayCanvas is not proven universally faster than Spark.
- WebGPU is not proven faster than WebGL2 for this source.
- Spark is not rejected as a renderer.
- The current capture is not accepted as final gameplay-quality data.
- R0 does not prove physical geometry, scale or a valid gravity direction.

## Reopen conditions

Reopen R0 only when new evidence materially changes the decision, for example:

- a later high-quality capture behaves incorrectly or materially worse in PlayCanvas;
- target mobile hardware reveals a major Spark advantage;
- a required Gaussian feature exists only or substantially better in Spark;
- PlayCanvas picking/world-space behavior proves unsuitable for W0;
- future delivery/streaming measurements create a material runtime difference.

## Deferred R0-B

Same-SOG comparison is deferred to the later delivery/performance gate. Raw/foreground PLY is already sufficient to unblock W0, and converting formats now would add work without reducing the primary uncertainty.

## Next gate

`W0 WORLD GROUNDING`

1. W0.1 — reliable splat world-point picking;
2. W0.2 — gravity/orientation references and solver;
3. W0.3 — metric scale measurements;
4. W0.4 — authoritative `ScanToWorld` calibration record;
5. W0.5 — human-scale navigation derived from calibrated metres.
