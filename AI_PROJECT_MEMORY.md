# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `W0.2 GRAVITY VERIFIED / W0.3 METRIC SCALE NEXT`

This is a router, not canonical truth. Current Git, executable evidence and direct owner validation outrank it.

## Accepted source/runtime truth

- source SHA `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground SHA `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- active runtime PlayCanvas Engine `2.21.2`;
- Spark `2.1.0` + Three `0.185.1` remains a validated fallback;
- W0.1 stable foreground picking VERIFIED;
- W0.2 gravity/up VERIFIED;
- no metric scale, collision or Box3D yet.

## W0 gate state

1. W0.1 picking — VERIFIED;
2. W0.2 gravity — VERIFIED;
3. W0.3 metric scale — NEXT;
4. W0.4 authoritative `ScanToWorld` — LOCKED;
5. W0.5 human-scale navigation — LOCKED.

## W0.2 accepted evidence

Two independent owner-device sampling runs reproduce the same gravity axis on the exact source.

Run A: 5 references, `99.939%` axis coherence, `7.6424°` tilt. It exposed two reversed endpoint pairs and caused the solver/evidence model to separate undirected axis agreement from directed bottom→top semantics.

Run B after hardening: 6 references, `6/6 AGREES`, `99.906%` axis coherence, `8.31336°` tilt, max residual `2.915°`, level preview applied.

The two solved UP vectors differ by only `0.7243°`. This cross-run repeatability is the main acceptance evidence. Owner-device screenshot after preview shows no obvious over-correction. Numeric evidence: `evidence/w0/w0-2-owner-pass-2026-08-15.json`.

W0.2 verifies orientation of the reconstruction coordinate frame, not perfect local geometric rigidity across the whole imperfect capture. Distant verticals remain a useful later falsification sample rather than a blocker for W0.2.

## Survey navigation

Owner-verified inspection controls:

- MMB orbit;
- Shift+MMB pan;
- scroll cursor-anchored zoom;
- Shift+scroll faster travel;
- F focus verified foreground under cursor while preserving camera position;
- Home fit; R reset;
- LMB/RMB remain available for world interaction;
- no initial-radius near/far zoom bounds beyond numerical safety.

Owner reported close building inspection is no longer a fight with the camera. This is still Survey, not W0.5 Walk.

## Local owner-lab security

Loopback Host allowlist, malformed-path handling, basic same-origin/no-sniff headers, exact known ZIP hash-before-extraction, exact PLY hash-before-serving and normal-exit temp cleanup are in the W0.2 branch.

## W0.3 direction

Build metric scale as another falsifiable spatial-evidence layer, reusing `SpatialProbe` rather than creating a second picking stack.

- pick A/B on verified foreground;
- record raw source distance;
- owner enters a genuinely known real distance in metres plus a short provenance note;
- compute per-measurement implied source-units-per-metre;
- solve a common scale without silently deleting outliers;
- report per-measurement residual/deviation and aggregate consistency;
- require at least 2 independent distances, prefer 3;
- no final `ScanToWorld` until W0.3 evidence passes.

Do not infer dimensions from nominal doors, roads, goals or objects unless the owner actually knows that site's dimension.

## Long-term direction

`immutable capture -> appearance -> spatial grounding -> physical evidence -> gameplay`

Future confidence/semantics/material systems should be justified by observed failure data rather than prebuilt speculatively.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/W0_WORLD_GROUNDING.md`
3. `evidence/w0/w0-2-owner-pass-2026-08-15.json`
4. `evidence/w0/w0-2-recovery-preflight-2026-08-15.json`
5. `docs/EVIDENCE_CONTRACT.md`
6. `AGENTS.md`
