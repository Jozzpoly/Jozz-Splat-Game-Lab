# Project State

Date: 2026-08-15
Milestone: `R0 RUNTIME LAB — SOURCE/STATIC PREFLIGHT VERIFIED`
Next executable gate: `R0-A owner browser/GPU evidence`

## Source authority

Current Git is the repository source of truth. Raw capture binaries remain external immutable inputs identified by SHA-256 receipts.

F0 is technically closed. The first Luma PLY and its deterministic source-coordinate foreground/environment partition have been independently reproduced and verified.

## VERIFIED

### F0 source

- exact PLY SHA-256: `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- exact PLY size: 263,655,789 bytes;
- layout: binary little-endian, 1,533-byte header, 1,063,122 records, 62 float32 fields, 248 bytes/record;
- every float field finite; all `nxx/ny/nz` values zero;
- structural partition at record 1,013,122 verified;
- foreground SHA-256: `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA-256: `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`.

### R0 preflight

- R0 LAB exists as a dependency-free local Node server plus browser surface; no npm install is required for owner execution.
- Exact candidate pins: Spark `2.1.0`, Three.js `0.185.1`, PlayCanvas Engine `2.21.2`.
- Static contract check passes and rejects unpinned `latest` aliases.
- R0 server fails closed unless the selected source is the exact F0 PLY hash and byte length.
- Raw HTTP asset was re-hashed through the actual server route and reproduced the exact source SHA-256.
- Virtual foreground HTTP asset was re-hashed through the actual server route and reproduced the exact verified foreground SHA-256; no extra 251 MiB derived file is required on disk.
- Both candidates receive one benchmark Reset camera defined in source coordinates and transformed into their runtime import convention.
- Spark backend mode is normalized to WebGL2 and cannot be misreported as `Best`.
- PlayCanvas `Best` explicitly tries WebGPU then WebGL2 and records the actual resulting backend.
- Owner report export records source/runtime/backend/load timing and presentation-frame interval telemetry.

Detailed preflight evidence: `evidence/r0/preflight-2026-08-15.json`.

## LIKELY / STRONG INFERENCE

- The final 50,000 source records are Luma environment/background rather than physical school geometry. Their structure is proven; the exported PLY carries no authoritative semantic label.
- The foreground is suitable for R0 renderer testing. Suitability for collision remains unproven.

## PENDING / OWNER EVIDENCE REQUIRED

- Whether Spark 2.1.0 actually renders this exact PLY correctly on the owner's browser/GPU.
- Whether PlayCanvas 2.21.2 actually renders this exact PLY correctly on the owner's browser/GPU.
- Visual comparison at the same Reset viewpoint.
- Fast Orbit/Fly sorting stability and hitching.
- Real owner-device load/FPS/p95 observations.
- Renderer selection.

The assistant execution environment cannot resolve the external pinned CDN hosts, so a GPU/browser PASS is deliberately **not inferred** from static/API checks.

## UNCERTAIN / LATER GATES

- source units per metre;
- canonical gameplay orientation/origin;
- collision reconstruction quality;
- dynamic-mesh visual integration/relighting needs;
- first physics-sandbox product value;
- capture redistribution rights.

## Current decisions

1. F0 stays closed unless contradictory evidence appears.
2. R0 is the only active implementation gate.
3. No renderer is selected yet.
4. The LAB is experiment infrastructure, not a generic renderer abstraction for the future game.
5. Raw capture and large derived PLYs remain external to Git.
6. `ScanToWorld` remains draft/unmeasured. No metres, collision or Box3D tuning yet.
7. Owner-side R0 execution is justified because visual/GPU behavior cannot be reproduced in the current assistant environment.

## Immediate next action

Run `URUCHOM_R0_LAB.cmd` on owner Windows hardware, compare Spark and PlayCanvas from the same Reset view, move rapidly in Orbit/Fly, and use `Kopiuj raport` for each meaningful run. Record screenshots plus direct owner perception before selecting or rejecting either runtime.
