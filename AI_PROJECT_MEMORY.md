# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `W0.1 SPATIAL PROBE IMPLEMENTED / OWNER EVIDENCE NEXT`

This is a router, not canonical truth. Current Git, executable evidence and direct owner validation outrank it.

## Source and runtime truth

- F0 source SHA: `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground SHA: `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA: `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- R0 is closed/reopenable;
- active runtime: PlayCanvas Engine `2.21.2`;
- Spark `2.1.0` + Three `0.185.1` is a validated fallback;
- no collision or Box3D exists yet.

## Active campaign — W0 World Grounding

The raw reconstruction is visibly tilted and navigation is non-metric. Treat that as expected evidence that appearance is not yet a world contract.

W0 stages:

1. W0.1 stable world-point picking;
2. W0.2 gravity/up solver from known vertical references;
3. W0.3 metric scale from 2–3 known distances;
4. W0.4 one calibrated `ScanToWorld` authority;
5. W0.5 separate metric human navigation from Survey navigation.

## W0.1 current implementation

Branch: `agent/w0-1-spatial-probe`.

- PlayCanvas only;
- foreground and environment render as separate GSplat components;
- environment is appearance-only and explicitly excluded from calibration picking;
- depth-enabled PlayCanvas Picker recovers runtime world point;
- selection must identify the foreground GSplat component;
- inverse foreground transform records raw source coordinates;
- each accepted pick creates a persistent 3D marker;
- owner evidence export includes both coordinate spaces;
- Survey only; no Fly/WASD in this gate;
- scale/gravity/physics remain absent.

W0.1 PASS requires visual marker stability under camera movement, not merely successful API calls.

## Long-term architecture

Keep the direction:

`immutable capture -> appearance -> spatial grounding -> physical evidence -> gameplay`

Later high-value research can add confidence, semantics, material/contact fields, guided capture and dynamic splats, but only when evidence from the simpler pipeline justifies them.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/W0_WORLD_GROUNDING.md`
3. `evidence/w0/w0-1-preflight-2026-08-15.json`
4. `docs/R0_DECISION.md`
5. `docs/EVIDENCE_CONTRACT.md`
6. `AGENTS.md`
