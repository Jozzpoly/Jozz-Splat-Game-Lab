# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `R1 THERMAL RENDER BUDGET — IMPLEMENTED / OWNER EVIDENCE NEXT`

This is a router, not canonical truth. Current Git, executable evidence and direct owner validation outrank it.

## Accepted source/runtime truth

- accepted `main`: `4cffaf3bd227fd66a0fd9fbbc8060118c5b6aea6` (W0.2);
- source SHA `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground SHA `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- PlayCanvas Engine `2.21.2` active;
- W0.1 picking VERIFIED;
- W0.2 gravity/up VERIFIED;
- Survey navigation owner-verified;
- no metric scale, accepted collision or Box3D tuning exists.

## Parked / rejected evidence

W0.3 metric scale is parked because trustworthy real-world distances are unavailable. Do not invent metres.

C0a simple splat-derived collision extraction was owner-tested and rejected as structurally unacceptable. Preserve the branch as negative evidence; do not tune physics around those candidates.

Future structural hypothesis: use a capture/reconstruction workflow that produces both a conventional mesh and Gaussian Splat aligned to the same reconstruction, with mesh as structural/collision authority after validation and splat as appearance authority. This is not yet an accepted dependency.

## Active experiment — R1

Branch: `agent/r1-thermal-render-budget`.

Owner reports sustained fan/noise load when the full splat runs. Earlier R0 evidence showed presentation near a ~240 Hz monitor refresh rate. R1 first removes unnecessary rendering without degrading splat quality.

### R1.1 Idle Render Elimination

- initial load stays continuous until the GS system reports a ready frame (with bounded timeout fallback);
- `Quiet 60`: `autoRender=false`, up to ~60 requested render frames/s during interaction/settling, then idle;
- `Balanced 120`: same with higher active render budget;
- `Continuous`: control condition using continuous rendering;
- GSplat `frame:request` requests required on-demand frames;
- telemetry counts actual rendered frames and idle renders.

### R1.2 Backend Load Shift

- `Best` requests WebGPU first and WebGL2 as fallback;
- `WebGL2` is an explicit comparison path;
- GS renderer remains `AUTO`;
- LAB reports actual graphics backend and actual resolved CPU/GPU sort mode.

R1.1/R1.2 retain exact F0 data, all splats, AA off, max pixel ratio 1, accepted W0.2 orientation and owner-verified Survey navigation. No resolution reduction, splat budget, SOG or LOD is introduced yet.

Final pre-owner evidence: `evidence/r1/preflight-2026-08-15.json`.

## Evidence boundary

Browser telemetry does not measure watts or temperature. Owner-device fan/noise and visual/navigation quality are required before accepting a thermal improvement.

If Quiet + Best is insufficient, only then open R1.3 quality/performance experiments: resolution scale, Gaussian budgets, SOG / Streamed SOG and possibly low-power graphics preference as separately measurable slices.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/R1_THERMAL_RENDER_BUDGET.md`
3. `evidence/r1/preflight-2026-08-15.json`
4. `docs/R0_DECISION.md`
5. `evidence/w0/w0-2-owner-pass-2026-08-15.json`
6. `AGENTS.md`
