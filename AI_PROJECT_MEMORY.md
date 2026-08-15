# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `W0.2 GRAVITY IMPLEMENTED / OWNER EVIDENCE NEXT`

This is a router, not canonical truth. Current Git, executable evidence and direct owner validation outrank it.

## Accepted source/runtime truth

- source SHA `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground SHA `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- active runtime PlayCanvas Engine `2.21.2`;
- Spark `2.1.0` + Three `0.185.1` validated fallback;
- W0.1 stable foreground picking VERIFIED;
- no collision or Box3D yet.

## W0 World Grounding

1. W0.1 picking — VERIFIED;
2. W0.2 gravity — ACTIVE;
3. W0.3 metric scale;
4. W0.4 authoritative `ScanToWorld`;
5. W0.5 human-scale navigation.

## W0.2 design

The owner samples multiple genuinely vertical structures as bottom→top point pairs. Solver logic lives in `world-lab/gravity.mjs` and is independent of renderer state. It computes a dominant vertical axis, exposes every angular residual, and produces a reversible correction quaternion. It never auto-accepts the candidate.

All reference evidence is stored in raw source coordinates plus baseline runtime coordinates. Any preview rotation is applied only to a draft grounding root and is reset before new picks so measurements never mix coordinate frames. Metric scale remains absent.

Minimum evidence export: 3 vertical references. Strong evidence should use references from multiple structures/locations, have reasonably tight residuals, and visibly improve level when previewed. Do not invent a numeric residual threshold before seeing the actual capture noise.

## Long-term direction

`immutable capture -> appearance -> spatial grounding -> physical evidence -> gameplay`

Future confidence/semantics/material systems should be justified by observed failure data rather than prebuilt speculatively.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/W0_WORLD_GROUNDING.md`
3. `evidence/w0/w0-2-preflight-2026-08-15.json`
4. `evidence/w0/w0-1-owner-2026-08-15.json`
5. `docs/R0_DECISION.md`
6. `AGENTS.md`
