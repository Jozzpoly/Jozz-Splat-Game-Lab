# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `W0.2 GRAVITY — STRONG AXIS EVIDENCE / DIRECTION + PREVIEW NEXT`

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
3. W0.3 metric scale — LOCKED;
4. W0.4 authoritative `ScanToWorld` — LOCKED;
5. W0.5 human-scale navigation — LOCKED.

## W0.2 real evidence

Owner collected five building-edge references on 2026-08-15. Reanalysis of the raw coordinates shows:

- tilt candidate `7.6424°` from baseline `+Y`;
- axis coherence `99.939%`;
- axis residual median `0.5149°`;
- axis residual max `2.1871°`;
- three entered bottom→top directions agree and two are reversed.

Therefore the physical vertical **axis** is strongly supported; the original huge mean/RMS directed residuals were mostly an endpoint-direction semantics problem, not contradictory geometry. Technical evidence: `evidence/w0/w0-2-owner-axis-2026-08-15.json`.

## W0.2 hardened model

- `gravity.mjs` fits an orientation-independent dominant axis and reports `axisCoherence`;
- each reference records `axisResidualDeg`, `directedResidualDeg` and `directionStatus`;
- no silent reversal/outlier deletion;
- explicit owner `Odwróć` swaps endpoint roles and increments `manualFlipCount`;
- preview stays blocked while intended bottom→top evidence has unresolved reversed pairs;
- evidence schema v2 preserves axis, direction and manual-correction provenance;
- real owner evidence is embedded in deterministic solver regression tests;
- still no automatic acceptance or metric scale.

## Survey navigation

Inspection navigation was hardened after owner feedback:

- MMB orbit;
- Shift+MMB view-plane pan;
- cursor-anchored wheel zoom with close-range floor reduced from `2.5%` of initial radius to a tiny numerical safety radius;
- F fit; R reset;
- LMB/RMB remain available for spatial/world interaction;
- camera near clip reduced for close inspection.

This is not W0.5 human navigation.

## Immediate next evidence

Run the hardened W0.2 workflow, resolve only visibly reversed endpoint pairs, then inspect the reversible level preview. If it visibly corrects the tilt without over-correction, W0.2 can be squash-merged and W0.3 may begin.

## Long-term direction

`immutable capture -> appearance -> spatial grounding -> physical evidence -> gameplay`

Future confidence/semantics/material systems should be justified by observed failure data rather than prebuilt speculatively.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/W0_WORLD_GROUNDING.md`
3. `evidence/w0/w0-2-owner-axis-2026-08-15.json`
4. `evidence/w0/w0-2-preflight-2026-08-15.json`
5. `docs/R0_DECISION.md`
6. `AGENTS.md`
