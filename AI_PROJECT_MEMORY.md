# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `W0.2 GRAVITY RECOVERED / HARDENED OWNER REPLAY NEXT`

This is a router, not canonical truth. Current Git, executable evidence and direct owner validation outrank it.

## Accepted source/runtime truth

- source SHA `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground SHA `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- active runtime PlayCanvas Engine `2.21.2`;
- Spark `2.1.0` + Three `0.185.1` validated fallback;
- W0.1 stable foreground picking VERIFIED;
- accepted `main` remains W0.1 commit `489cd24d047910de63239c7e22935a3906864fa5`;
- W0.2 remains draft PR #6 on `agent/w0-2-gravity`;
- no collision or Box3D yet.

## W0 World Grounding

1. W0.1 picking — VERIFIED;
2. W0.2 gravity — ACTIVE / RECOVERED;
3. W0.3 metric scale — LOCKED;
4. W0.4 authoritative `ScanToWorld` — LOCKED;
5. W0.5 human-scale navigation — LOCKED.

## W0.2 real evidence

Five owner-selected building-edge references support one strong local vertical axis:

- tilt candidate `7.6424°`;
- axis coherence `99.939%`;
- axis residual median `0.5149°`;
- axis residual max `2.1871°`;
- three entered bottom→top directions agree, two are reversed.

Therefore the physical axis around the main school building is strongly supported; the original huge directed mean/RMS came mainly from endpoint-order semantics. Technical evidence: `evidence/w0/w0-2-owner-axis-2026-08-15.json`.

The five references are spatially concentrated on the main building. Global capture orientation remains pending until at least one preferably two trustworthy distant verticals confirm/falsify the same axis. If no distant feature is trustworthy, preserve this as uncertainty rather than inventing a global proof.

## Hardened W0.2 model

- sign-independent physical-axis fitting;
- separate `axisResidualDeg`, `directedResidualDeg`, `directionStatus`;
- no silent reversal/outlier deletion;
- explicit `Odwróć` and `manualFlipCount`;
- preview blocked while `REVERSED` remains;
- owner evidence regression test preserves the exact five real references;
- no automatic acceptance or metric scale.

## Survey navigation

Inspection navigation now uses:

- MMB orbit;
- Shift+MMB view-plane pan;
- cursor-anchored wheel zoom; Shift+wheel faster;
- F = focus verified foreground under cursor while preserving camera position and changing the orbit pivot;
- Home = fit full scan;
- R = reset;
- no initial-radius near/far zoom ceiling beyond a tiny numerical safety floor;
- LMB/RMB remain free for spatial/world interaction;
- near clip `0.003`.

This is not W0.5 human navigation.

## Local security boundary

The owner LAB validates loopback Host headers, rejects malformed paths safely, adds basic same-origin/no-sniff headers, hashes the exact known ZIP before extraction and attempts temp cleanup after normal exit. Raw/foreground/environment F0 hashes remain the authority.

## Immediate next evidence

Run the final hardened W0.2 owner build. Include a distant trustworthy vertical if possible, resolve only genuinely reversed endpoint roles, apply the reversible level preview, verify the corrected level visually, and judge the new close-range navigation. Then copy schema-v2 gravity evidence.

If this passes, squash PR #6 and begin W0.3 metric scale. Do not start collision or Box3D before W0.4.

## Long-term direction

`immutable capture -> appearance -> spatial grounding -> physical evidence -> gameplay`

Future confidence/semantics/material systems should be justified by observed failure data rather than prebuilt speculatively.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/W0_WORLD_GROUNDING.md`
3. `evidence/w0/w0-2-owner-axis-2026-08-15.json`
4. `evidence/w0/w0-2-recovery-preflight-2026-08-15.json`
5. `docs/R0_DECISION.md`
6. `AGENTS.md`
