# Project State

Date: 2026-08-15
Milestone: `FOUNDATION GROUNDING`
Next executable gate: `F0 Evidence Freeze`

## Source authority

Current Git is the repository source of truth. This repository was intentionally created as a clean project rather than as a branch of JV, HomeScan, JURE or VAW.

The raw Luma capture is not stored in Git. Its known identity and observations are recorded separately in `evidence/sources/luma-school-2026-08-15.json` and must be revalidated against the binary before F0 can pass.

## VERIFIED

- The repository is a new, separate project with no inherited runtime architecture.
- The initial repository commit is `6baac6336ceadb47ca991120d87f8ce47238e2d9`.
- The user-provided history identifies the first Luma PLY as a full 3DGS-style binary PLY with 1,063,122 records and a 50,000-record highly regular trailing shell; exact recorded values are in the source evidence receipt.
- Current external baseline checked on 2026-08-15: PlayCanvas Engine `2.21.2`, SplatTransform `3.1.7`, Spark `2.1.0`, Box3D `0.1.0`.
- Box3D `0.1.0` is explicitly described upstream as alpha software.
- Current Box3D triangle meshes are intended for static geometry.
- Current Box3D character mover API is explicitly experimental.

## LIKELY / STRONG INFERENCE

- The final 50,000 Luma records are an environment/background shell rather than physical school geometry. Their regularity strongly supports this, but the exported PLY does not retain an authoritative semantic label proving origin.
- The school capture is suitable for a first renderer and collision experiment. Suitability for a good physical world is not yet established.

## UNCERTAIN

- Source units per metre.
- Exact canonical up axis/orientation after runtime import.
- Whether Spark or PlayCanvas is the better runtime for this project.
- Whether an automatically derived collision representation is sufficiently faithful in a useful ROI.
- Whether conventional dynamic meshes can be visually integrated well enough without a dedicated relighting pass.
- Whether the first physics-sandbox concept produces genuine open-ended play rather than a short technology demo.

## Accepted foundation decisions

1. Keep the project independent from existing repositories.
2. Preserve raw captures as immutable external inputs identified by hashes.
3. Separate appearance from physical evidence.
4. Do not choose Spark or PlayCanvas before R0 evidence.
5. Do not choose a streaming format before measurement.
6. Do not tune collision or Box3D before measured `ScanToWorld` calibration.
7. Keep `LAB` diagnostics conceptually separate from a low-UI `PLAY` experience.
8. Avoid feature-count development; G0 must test emergent player behaviour with very few systems.

## Current stop conditions

Stop and diagnose rather than advancing when:

- the source binary does not reproduce the recorded structure/hash;
- both R0 candidates render the source incorrectly;
- calibration evidence is internally inconsistent;
- collision requires broad manual remodelling to become usable;
- a later gate depends on an unverified earlier representation.

## Immediate next action

F0 should obtain the exact raw PLY, independently reproduce its structural analysis and implement a deterministic, receipt-producing split only after the expected shell invariants are verified. If the binary is not accessible in the execution environment, request the exact source ZIP/PLY from the owner rather than substituting another capture.
