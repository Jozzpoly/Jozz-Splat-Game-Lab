# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `R0 CLOSED / W0.1 PICKING NEXT`

This file is a router, not canonical truth. Current Git, executable evidence and direct owner validation outrank it.

## Repository truth

- repository: `Jozzpoly/Jozz-Splat-Game-Lab`;
- default branch: `main`;
- F0 source integrity is VERIFIED;
- R0 runtime compatibility is VERIFIED;
- active runtime for W0: PlayCanvas Engine `2.21.2`;
- Spark `2.1.0` + Three `0.185.1` is a validated fallback/reference path;
- no collision representation is accepted;
- no Box3D integration exists;
- raw/large derived scan binaries are external to Git.

## Product/research purpose

Turn real captures into physically coherent, open-ended worlds rather than merely displaying Gaussian splats. The long-term architecture intentionally separates appearance, spatial/world evidence, physical evidence and gameplay.

## F0 — VERIFIED

- source PLY SHA-256 `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground 1,013,122 records / SHA-256 `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment tail 50,000 records / SHA-256 `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- output payloads are exact source byte ranges;
- semantic label of environment tail remains `LIKELY`, while its runtime appearance role is strongly supported.

## R0 — CLOSED / REOPENABLE

Owner browser tests on package commit `46c788598a7963a5bbeb8b2648d8b91b91f92fcf` verified both candidates:

- Spark WebGL2: PASS;
- PlayCanvas WebGL2: PASS;
- PlayCanvas Best selecting WebGPU: PASS;
- raw and foreground PlayCanvas loading: PASS.

Current FPS/p95 UI measures presentation intervals and is not a GPU-cost benchmark. Do not rank renderers from those numbers.

PlayCanvas is active because W0 now needs reliable GSplat picking/world-position recovery and later benefits from the same ecosystem's collision tooling. Spark stays available if new evidence warrants reopening R0.

Decision: `docs/R0_DECISION.md`.
Owner evidence: `evidence/r0/owner-browser-2026-08-15.json`.

## W0 World Grounding — NEXT

The current capture is visibly tilted and current navigation is non-metric. This is expected evidence that the raw reconstruction is not yet a game world.

Execute W0 as separate gates:

- **W0.1 Picking:** PlayCanvas-only, foreground-only calibration authority, persistent 3D markers, source/world coordinate readout, marker stability test.
- **W0.2 Gravity:** multiple known-vertical references -> best-fit gravity/up vector + residual error.
- **W0.3 Scale:** 2–3 owner-known real distances -> units-per-metre + consistency error.
- **W0.4 ScanToWorld:** one authoritative calibrated transform/receipt.
- **W0.5 Human Navigation:** survey vs metric walk navigation; speed/camera height defined in metres only after calibration.

Do not combine these gates merely for speed. Each must be independently falsifiable.

## Architecture rule

Treat the project increasingly as a spatial reconstruction/game-world system:

`immutable capture -> appearance -> spatial grounding -> physical evidence -> gameplay`

Future higher-value research may add confidence/semantics/material/accessibility fields, but none should be implemented until current evidence makes them necessary.

## Owner workflow

Owner-facing interactions should be browser/GUI/double-click workflows. Ask for owner action only where perception, real-world knowledge or target hardware contributes evidence unavailable to the agent.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/R0_DECISION.md`
3. `evidence/r0/owner-browser-2026-08-15.json`
4. `docs/FOUNDATION_PLAN.md`
5. `docs/EVIDENCE_CONTRACT.md`
6. `AGENTS.md`
