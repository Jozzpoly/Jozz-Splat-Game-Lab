# Project State

Date: 2026-08-15
Milestone: `R0 CLOSED / W0 WORLD GROUNDING NEXT`
Next executable gate: `W0.1 reliable splat world-point picking`

## Source authority

Current Git is repository source truth. Raw capture binaries remain external immutable inputs identified by SHA-256 receipts.

## VERIFIED

### F0 source

- exact PLY SHA-256: `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- exact PLY size: 263,655,789 bytes;
- layout: binary little-endian, 1,533-byte header, 1,063,122 records, 62 float32 fields, 248 bytes/record;
- structural foreground/environment partition at record 1,013,122 verified;
- foreground SHA-256: `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA-256: `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`.

### R0 runtime compatibility

Owner browser/GPU testing on the exact R0 package/commit verified:

- Spark `2.1.0` + Three.js `0.185.1` renders foreground on WebGL2;
- PlayCanvas Engine `2.21.2` renders foreground and raw PLY on WebGL2;
- PlayCanvas `Best` selected WebGPU successfully on the owner device;
- both runtime paths are responsive enough for the current ~1.0M-splat source;
- foreground-only appearance removes the distant/environment shell while raw restores it visually;
- the source is visibly tilted relative to a useful gameplay world and requires explicit calibration;
- current navigation is not metric/human-scale and must not become gameplay navigation by inertia.

Structured evidence: `evidence/r0/owner-browser-2026-08-15.json`.
Decision record: `docs/R0_DECISION.md`.

## ACTIVE DECISION

- **PlayCanvas 2.21.2 is the active W0 runtime.**
- Spark remains a validated fallback/reference implementation.
- The decision is reopenable on material contradictory evidence; no generic runtime abstraction should be maintained by default.
- R0-B same-SOG comparison is deferred until delivery/performance evidence is actually needed.

## LIKELY / STRONG INFERENCE

- The final 50,000 records function as an environment/background appearance layer. Their structure is verified; the original exported PLY contains no authoritative semantic label.
- The current Luma scan is a useful R&D stress specimen but is not final gameplay-quality capture data.

## UNCERTAIN / UNPROVEN

- exact gravity/up direction for gameplay;
- source units per metre;
- authoritative world origin/yaw;
- reliability of PlayCanvas world-point picking on this exact PLY under all useful camera views;
- collision reconstruction quality;
- close-range quality requirements for a future production capture;
- dynamic-mesh integration and relighting requirements;
- final game loop/product value.

## W0 World Grounding campaign

W0 is deliberately split into independently falsifiable stages:

1. **W0.1 Picking** — click foreground appearance and recover a stable 3D world/source point; marker remains attached to the same visual surface under camera movement.
2. **W0.2 Gravity** — collect multiple known-vertical references, solve a best-fit gravity/up direction and expose residual error. Do not level by terrain appearance alone.
3. **W0.3 Scale** — collect at least two, preferably three known real-world distances; compute units-per-metre and measurement disagreement.
4. **W0.4 ScanToWorld** — promote one transform from `draft` to `calibrated` only when orientation/scale evidence passes defined thresholds.
5. **W0.5 Human navigation** — derive camera height and movement speed from calibrated metres. Keep survey navigation separate.

## Current stop conditions

Stop W0 progression if:

- picking does not return visually stable points on the foreground;
- picked environment/background can contaminate calibration;
- gravity references disagree beyond explainable capture/picking error;
- metric measurements disagree materially;
- calibration requires unexplained hand-authored offsets;
- a later gate begins inventing independent transforms instead of consuming `ScanToWorld`.

## Immediate next action

Implement W0.1 on a new branch from accepted R0: PlayCanvas-only world-point picking, foreground-only calibration authority, persistent markers, source/world coordinate readout and a small owner test proving marker stability under camera movement. No gravity solver, metres, collision or Box3D in W0.1.
