# F0 Evidence Freeze — first Luma school capture

Status: `VERIFIED`

## Purpose

F0 freezes what the first source actually is before renderer or world-space interpretation can mutate the question. The raw PLY is immutable and external to Git. The split performed here is source-coordinate partitioning only; it does not establish metres, game orientation or collision truth.

## Exact source

`gs_GG_Szko_a.ply`

SHA-256:

`8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`

The containing ZIP is recorded in the source receipt. Do not substitute another export with the same human-readable scene name.

## Reproduced structure

The 2026-08-15 F0 run independently reproduced:

- binary little-endian PLY;
- 1,533-byte header;
- 1,063,122 vertex records;
- 62 float32 fields / 248 bytes per record;
- exact file-size equation;
- no NaN/Inf in any float field;
- all `nxx/ny/nz` values equal to zero;
- exactly 50,000 contiguous shell-like records at indices 1,013,122..1,063,121;
- shell radius mean `171.86853029004345`, standard deviation `5.57845221440865e-6`;
- shell raw opacity `4.595120906829834` throughout;
- shell quaternions exactly `[1,0,0,0]`;
- shell scales isotropic per record.

The shell's **structure and location are VERIFIED**. Its semantic interpretation as Luma background/environment remains **LIKELY**, not VERIFIED.

## Tooling

Developer commands remain available:

```text
node tools/f0-luma-source.mjs inspect <path-to-gs_GG_Szko_a.ply>
node tools/f0-luma-source.mjs split <path-to-gs_GG_Szko_a.ply> <output-dir>
node tools/f0-verify-split.mjs <source.ply> <scene.foreground.ply> <scene.environment.ply>
```

They are not the expected owner workflow.

For optional owner-side reproduction on Windows, double-click `SPRAWDZ_F0.cmd`. It opens a normal file picker for the original ZIP/PLY, runs the checks automatically and shows a simple PASS/FAIL dialog. No drag-and-drop onto scripts, command-line arguments or npm knowledge are required. Successful runs remove their temporary extracted/split copies automatically.

The splitter is intentionally source-specific. It requires the exact source SHA-256 and refuses to operate when the recorded PLY layout or shell invariants differ. It is not a general Luma background detector.

## Generated external artifacts

The verified F0 execution produced:

- foreground: `scene.foreground.ply`, 251,255,789 bytes, SHA-256 `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment: `scene.environment.ply`, 12,401,531 bytes, SHA-256 `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`.

The binaries remain outside Git. Their receipts are committed under `evidence/f0/luma-school-2026-08-15/`.

An independent verifier confirmed that the foreground and environment payloads are the exact first 1,013,122 and final 50,000 raw records from the source. Only the PLY vertex-count headers differ.

## Execution qualification

Foundation/F0 supports Node `>=22.16.0` and has no npm-version evidence requirement. The F0 implementation ran on Node `22.16.0`, which is inside the supported range.

The result was also cross-checked independently with Python `3.13.5` + NumPy `2.3.5` and raw byte-range comparison. A subsequent full revalidation again reproduced the source, foreground, environment and payload hashes exactly.

The earlier exact Node `24.16.0` / npm `11.13.0` gate was removed after review because it had been inherited from another project without evidence that those exact versions affect this binary-processing gate.

Owner-side replay is optional additional reproduction evidence, not a prerequisite for closing F0.

## Exit to R0

F0 is technically closed. R0 Phase A may begin after the clean foundation/F0 source line is accepted.

R0 must use the exact source PLY hash above in both renderer candidates. R0 Phase B may compare the exact same generated SOG hash only if both candidates pass source compatibility.
