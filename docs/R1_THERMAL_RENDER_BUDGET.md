# R1 — Thermal Render Budget

Status: `IMPLEMENTED / OWNER THERMAL EVIDENCE NEXT`

## Why this gate exists

The owner reports that the current full splat viewer makes the computer become very loud after running for a while. Earlier R0 evidence showed the application presenting at roughly the monitor refresh rate (~240 Hz) even when the scene was otherwise static.

R1 treats this as a product problem: reduce unnecessary CPU/GPU work while preserving useful visual quality and navigation.

## Evidence-first order

R1 deliberately does **not** begin by reducing splat quality.

### R1.1 — Idle Render Elimination

Use PlayCanvas `autoRender = false` and `renderNextFrame` so a static camera does not continuously redraw an unchanged 3DGS image.

Profiles:

- `Quiet 60` — on-demand rendering, at most ~60 requested render frames/s while camera activity is settling, then idle;
- `Balanced 120` — same policy with higher interaction render budget;
- `Continuous` — control condition reproducing continuous rendering behavior.

GSplat `frame:request` is bridged into the governor so engine-requested updates are still displayed while auto-render is disabled.

### R1.2 — Backend Load Shift

`Best` requests WebGPU first with WebGL2 fallback and keeps `app.scene.gsplat.renderer = GSPLAT_RENDERER_AUTO`.

Expected renderer resolution:

- WebGPU -> GPU sort;
- WebGL2 -> CPU sort.

The LAB reports the **actual** graphics backend and resolved GS renderer. No backend is treated as successful merely because it was requested.

### R1.3 — only if still needed

If R1.1/R1.2 do not sufficiently reduce sustained load, then test quality/performance tradeoffs separately:

1. render resolution scale;
2. Gaussian count/budget;
3. SOG / Streamed SOG LOD;
4. optional data cleanup / decimation.

Do not combine these with R1.1/R1.2 because that would obscure which mechanism reduced load.

## Invariants

R1.1/R1.2 keep:

- exact F0 source and foreground/environment partition;
- all 1,063,122 source records across foreground + environment;
- anti-aliasing disabled, as in the previous LAB;
- engine max pixel ratio = 1;
- accepted W0.2 orientation;
- owner-verified Survey navigation including `F` focus;
- no SOG, LOD, decimation or splat-budget quality reduction yet.

## Telemetry boundary

Browser telemetry records rendered-frame scheduling, actual backend/sorter, render counts and canvas pixel count. It does **not** measure GPU watts, CPU package power or hardware temperature.

Owner fan/noise behavior is therefore a separate evidence class and is required before claiming a thermal improvement.

## Pass question

Does `Quiet 60 + Best` materially reduce sustained machine/fan load while the scene is stationary, with no meaningful visual regression and with responsive camera interaction?

A strong technical signal is that after camera settling, rendered FPS falls to approximately zero while the displayed image remains correct.
