# Project State

Date: 2026-08-15
Milestone: `W0.1 SPATIAL PROBE — VERIFIED / W0.2 GRAVITY NEXT`
Active branch: `agent/w0-1-spatial-probe` until W0.1 merge

## Closed evidence gates

### F0 — VERIFIED

- source SHA-256 `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground 1,013,122 records / SHA-256 `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment tail 50,000 records / SHA-256 `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- derived payloads are exact source byte ranges.

### R0 — CLOSED / REOPENABLE

Owner browser testing verified Spark WebGL2, PlayCanvas WebGL2 and PlayCanvas WebGPU (`Best`) can render the exact source. PlayCanvas `2.21.2` is active for W0; Spark remains a validated fallback. Current presentation-interval telemetry is not a GPU benchmark ranking.

## W0.1 implementation

Goal: prove stable foreground world-point picking before adding any calibration solver.

Implemented:

- PlayCanvas `2.21.2` WebGL2 baseline;
- `app.scene.gsplat.enableIds = true` before splat rendering;
- depth-enabled `Picker`;
- foreground and environment loaded as separate GSplat components;
- deterministic environment endpoint reproduces exact F0 SHA-256;
- environment metadata explicitly sets `physicalAuthority=false` and `calibrationAuthority=false`;
- picker disables environment and existing marker entities while preparing the ID/depth buffer;
- accepted pick requires the returned selection to contain the foreground GSplat component;
- `getWorldPointAsync()` records runtime-world point;
- inverse foreground transform records raw source point;
- persistent 3D marker created at each accepted runtime-world point;
- Survey-only navigation; no WASD/Fly while units are uncalibrated;
- evidence export records source/runtime coordinates and the W0.1 pass question.

Preflight: `evidence/w0/w0-1-preflight-2026-08-15.json`.
Protocol: `docs/W0_WORLD_GROUNDING.md`.

## VERIFIED preflight

- local JS/MJS syntax checks PASS;
- W0.1 static contract PASS;
- static root/app/styles HTTP 200;
- raw HTTP SHA matches F0 source;
- foreground HTTP SHA matches F0 foreground;
- environment HTTP SHA matches F0 environment;
- no metric scale, gravity solver, collision or Box3D exists in W0.1.

## W0.1 owner evidence — VERIFIED

Owner testing produced seven foreground probes and screenshots from materially different camera views. Marker persistence/parallax is consistent with the same recovered surfaces, so the core W0.1 question passes. Screenshot evidence remains outside the public repository because it exposes a real-world location.

A visualization defect was found: world-unit marker spheres became too large at close range. Adaptive constant-screen-size marker scaling is now part of W0.1 hardening; it changes marker presentation, not recovered coordinates.

Environment pick rejection was not explicitly demonstrated in the supplied owner report. The runtime still excludes environment from the picker contract and this safeguard should be incidentally rechecked in later owner runs.

Evidence: `evidence/w0/w0-1-owner-2026-08-15.json`.

## Next gate

W0.2 gravity/up calibration from multiple known-vertical references. Do not infer level from terrain or manually type a correction angle.
