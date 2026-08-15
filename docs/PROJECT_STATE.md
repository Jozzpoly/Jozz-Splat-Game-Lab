# Project State

Date: 2026-08-15
Milestone: `R1 THERMAL RENDER BUDGET — IMPLEMENTED / OWNER EVIDENCE NEXT`
Accepted main: `4cffaf3bd227fd66a0fd9fbbc8060118c5b6aea6` (W0.2)
Active experiment branch: `agent/r1-thermal-render-budget`

## Accepted gates

- F0 source/split — VERIFIED.
- R0 renderer compatibility — CLOSED / REOPENABLE; PlayCanvas `2.21.2` active.
- W0.1 foreground picking — VERIFIED.
- W0.2 gravity/up — VERIFIED from two independent owner-device sampling runs.
- Survey navigation — OWNER VERIFIED for current inspection needs.

## Parked / rejected branches

- W0.3 metric scale — PARKED / NOT ACCEPTED because trustworthy real-world distance ground truth is unavailable.
- C0a simple splat-derived collision extraction — REJECTED METHOD / PRESERVE EVIDENCE after owner testing found the generated geometry unacceptably poor.

No `unitsPerMetre`, metric `ScanToWorld`, accepted collision mesh, Box3D tuning or human-scale Walk exists.

## Active problem — sustained renderer load

Owner reports that after the full splat runs for a while, the computer becomes very loud. Earlier R0 screenshots showed presentation near a ~240 Hz display refresh rate even for a static scene. The accepted W0.2 browser runtime also explicitly used WebGL2/high-performance graphics and rendered continuously.

R1 treats thermal/noise behavior as a product-quality constraint rather than merely chasing peak FPS.

## R1.1 — Idle Render Elimination

Implemented:

- PlayCanvas `autoRender=false` for Quiet/Balanced profiles;
- explicit `renderNextFrame` governor;
- `Quiet 60`: at most ~60 requested render frames/s during interaction/settling, then idle;
- `Balanced 120`: same policy with a higher interaction budget;
- `Continuous`: control condition preserving continuous rendering;
- GSplat `frame:request` is bridged into the governor so engine-requested updates remain visible;
- actual rendered-frame telemetry over 2 s / 10 s windows;
- idle-state and idle-render-count telemetry.

R1.1 does not reduce Gaussian count or render resolution.

## R1.2 — Backend Load Shift

Implemented:

- `Best` requests WebGPU first with WebGL2 fallback;
- `WebGL2` forces the old graphics backend for comparison;
- GS renderer remains `GSPLAT_RENDERER_AUTO`;
- UI reports the actual graphics backend and resolved CPU/GPU sorting mode.

R1.1/R1.2 preserve:

- exact F0 source and foreground/environment split;
- all 1,063,122 records across both appearance layers;
- anti-aliasing disabled;
- engine max pixel ratio = 1;
- accepted W0.2 orientation;
- owner-verified Survey navigation including focus-under-cursor.

## Preflight

Local preflight against the exact 263,655,789-byte source passed:

- JS/MJS syntax;
- R1 static contract;
- browser/API routes;
- loopback/Host/traversal security checks;
- exact raw / foreground / environment F0 SHA-256 replay.

Actual WebGPU/WebGL browser rendering and machine/fan behavior still require owner-device evidence.

## Evidence boundary

Browser telemetry does not measure watts or hardware temperature. Do not claim a thermal win merely because FPS is lower. Owner fan/noise behavior and visual/navigation quality are separate required evidence.

## Next owner question

Does `Quiet 60 + Best` materially reduce sustained machine/fan load while preserving correct image and responsive navigation, and does the render rate fall near zero once the camera settles?

Only if R1.1/R1.2 are insufficient should the next slice introduce quality-affecting controls such as render resolution, Gaussian budgets, SOG or Streamed SOG LOD.
