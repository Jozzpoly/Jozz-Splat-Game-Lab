# Project State

Date: 2026-08-15
Milestone: `F0 EVIDENCE FREEZE — VERIFIED`
Next executable gate: `R0 Renderer Bake-Off — Phase A`

## Source authority

Current Git is the repository source of truth. Raw capture binaries remain external immutable inputs identified by SHA-256 receipts.

The first Luma PLY has been independently reproduced from the exact uploaded binary. Detailed evidence is in `evidence/f0/luma-school-2026-08-15/reproduction.json` and `docs/F0_EVIDENCE_FREEZE.md`.

## VERIFIED

- Exact PLY SHA-256: `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`.
- Exact PLY size: 263,655,789 bytes.
- Layout: binary little-endian, 1,533-byte header, 1,063,122 records, 62 float32 fields, 248 bytes/record.
- Every float field is finite; all `nxx/ny/nz` values are zero.
- Exactly the final 50,000 records satisfy the recorded strict shell structure and form one contiguous tail.
- Structural partition at record 1,013,122 is verified.
- Generated foreground SHA-256: `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`.
- Generated environment SHA-256: `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`.
- Independent byte-range verification proved both output payloads are exact ordered subsets of the immutable source; no Gaussian record is rewritten.
- F0 implementation executed on supported Node `22.16.0` and was independently reproduced with Python/NumPy byte analysis.
- Current external technology baseline remains PlayCanvas Engine `2.21.2`, SplatTransform `3.1.7`, Spark `2.1.0`, Box3D `0.1.0` as recorded by the foundation research snapshot.

## LIKELY / STRONG INFERENCE

- The final 50,000 records are Luma environment/background rather than physical school geometry. Their structure is proven, their semantic label is not present in the exported PLY.
- The foreground is suitable for R0 renderer testing. Suitability for collision remains unproven.

## UNCERTAIN

- Source units per metre.
- Canonical runtime orientation/up axis after actual renderer import.
- Spark versus PlayCanvas decision.
- Collision reconstruction quality.
- Dynamic-mesh visual integration/relighting needs.
- First physics-sandbox product value.
- Redistribution rights for the source capture; therefore source/derived binaries remain outside public Git.

## Toolchain policy

Foundation/F0 supports Node `>=22.16.0`; npm version is not an evidence variable for these dependency-free binary tools.

Exact dependency/tool pins remain required when they affect experiment reproducibility. R0 therefore still pins Spark, Three.js and PlayCanvas candidates explicitly.

Owner-side checks should use normal browser/UI flows or double-clickable launchers with file pickers by default. Terminal workflows are developer tools, not the expected owner interface.

## Current decisions

1. Keep raw capture and large derived PLYs external to Git.
2. Structural split is source-specific and hash-gated; do not generalize it into a Luma detector yet.
3. Shell semantics remain `LIKELY`; collision policy excludes it unless later evidence proves physical meaning.
4. `ScanToWorld` remains draft/unmeasured. No metres, Box3D or collision tuning yet.
5. R0 still has two candidates. No renderer dependency is accepted into the project foundation.
6. F0 owner reproduction is optional additional evidence, not a blocker for technical gate closure.

## Immediate next action

Begin R0 Phase A with the exact same source PLY hash in Spark/Three and PlayCanvas. Keep the two experiments minimal and independent. Do not introduce renderer abstraction or gameplay while source compatibility and benchmark instrumentation are being established.
