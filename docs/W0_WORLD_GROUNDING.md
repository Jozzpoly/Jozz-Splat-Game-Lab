# W0 World Grounding

Status: `W0.2 GRAVITY — RECOVERED / HARDENED OWNER REPLAY NEXT`

## Purpose

W0 converts an appearance reconstruction into one measured spatial contract. It is deliberately decomposed so bad picking, bad gravity and bad metric scale cannot hide inside one transform.

## Gate sequence

### W0.1 — Spatial Probe — VERIFIED

Foreground GSplat picking recovers persistent source/runtime positions. Environment is appearance-only. Owner evidence verified seven stable probes.

### W0.2 — Gravity — ACTIVE

Question: do multiple real vertical structures agree on one gravity/up axis, and can endpoint direction be resolved explicitly before orientation is accepted?

#### Axis and direction are separate

A physical vertical line is an **axis**: reversing its endpoints does not create a different vertical. `bottom → top` is separate directional evidence. W0.2 therefore records both.

For every reference the solver reports:

- `axisResidualDeg` — smallest angle to the solved vertical axis, independent of endpoint direction;
- `directedResidualDeg` — bottom→top disagreement with the oriented up candidate;
- `directionStatus` — `AGREES` or `REVERSED`;
- reference length in source units.

Across the set it reports orientation-independent `axisCoherence`, residual statistics, explicit direction consensus, tilt from baseline `+Y`, a reversible correction quaternion and `automaticAcceptance: false`.

No outlier or endpoint is silently deleted or reversed.

#### Real owner evidence — 2026-08-15

Five building-edge references produced:

- axis coherence `99.939%`;
- axis residual median `0.515°`;
- axis residual max `2.187°`;
- candidate tilt `7.642°`;
- three endpoint directions agreeing and two reversed.

The two original ~179.5° residuals were direction-order conflicts, not physically contradictory vertical axes. Technical evidence: `evidence/w0/w0-2-owner-axis-2026-08-15.json`.

The UI flags `REVERSED`, preserves the conflict and offers explicit `Odwróć`, which swaps the stored endpoint roles and increments `manualFlipCount`.

The five supplied references are concentrated on the main school building. They therefore provide strong local-axis evidence, but not yet a complete proof that the same orientation holds across the entire reconstruction. Before global gravity acceptance, add at least one preferably two trustworthy vertical references at a materially distant location if the capture contains suitable features. This is a drift/falsification sample, not a request for many more measurements.

#### Owner workflow

1. stay in Survey;
2. choose `Dodaj pion`;
3. click the **bottom** of a genuinely vertical edge — cyan marker;
4. click the **top** — amber marker;
5. repeat at least three times and include a spatially distant trustworthy vertical if available;
6. inspect axis residual separately from `UP / REVERSED`;
7. use `Odwróć` only when the endpoint colors prove a pair was stored backwards;
8. if marker roles are physically correct but a row still reports `REVERSED`, preserve the conflict rather than forcing it;
9. preview remains blocked until no unresolved reversed pair remains;
10. apply `Podgląd poziomu` and visually confirm the correction;
11. copy schema-v2 gravity evidence.

Do not use terrain slope as vertical evidence. Long, sharp building corners, poles and frame edges are preferable to short noisy features.

#### Preview boundary

Preview rotates only the temporary `Draft Grounding Root`. It is not `ScanToWorld`, does not set origin and does not introduce metres. Preview resets before new references are collected so frames cannot mix.

W0.2 PASS remains an evidence decision, not a magic threshold.

### Survey navigation hardening

Survey is an engineering inspection camera, not W0.5 human movement.

Controls:

- `MMB` orbit;
- `Shift+MMB` pan in the camera view plane;
- wheel = cursor-anchored exponential zoom;
- `Shift+wheel` = faster travel across the scan;
- `F` = focus the orbit pivot on the verified **foreground** surface under the cursor while preserving the current camera position;
- `Home` = fit the full scan while preserving orientation;
- `R` = reset the original survey view;
- `LMB` / `RMB` remain reserved for world/model interaction.

The old close/far bounds tied to initial scan radius are removed; only a tiny numerical radius floor remains. Camera near clip is `0.003`. This deliberately makes close approach to building walls easy without claiming metric movement.

### Local owner-lab security

Because the local server can stream raw capture bytes, it is treated as a trust boundary:

- binds to loopback only;
- rejects non-loopback Host headers;
- malformed request paths return errors rather than crashing;
- basic no-sniff / same-origin / no-frame headers are added;
- known Luma ZIP size + SHA-256 are checked before extraction;
- the Node server still verifies the exact PLY size/hash before serving anything;
- temporary extraction is cleaned on normal launcher exit.

### W0.3 — Scale — LOCKED

After gravity passes, measure 2–3 independently known real distances. Do not assume standard dimensions unless they are actually known for this site.

Scale evidence will reuse `SpatialProbe`, explicit provenance and independent residual reporting rather than introducing another picking system.

### W0.4 — ScanToWorld — LOCKED

Promote one versioned transform only after gravity and scale evidence agree.

### W0.5 — Human Navigation — LOCKED

Only after metric calibration may movement use metres/second and human camera height. Survey freedom does not weaken this gate.

## Recovery validation boundary

Static, solver, full-source HTTP and security-negative tests pass on the recovered hardening tree. Rendered QA of the newest focus/navigation build remains owner evidence because this execution host lacks a reliable browser path to the pinned PlayCanvas CDN/runtime.

## Safety boundary

No collision, Box3D or gameplay tuning before W0.4. Appearance is still not physical truth.
