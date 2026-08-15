# F0 Evidence Freeze — first Luma school capture

Status: `SOURCE + STRUCTURAL SPLIT VERIFIED / CANONICAL TOOLCHAIN REPLAY PENDING`

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

Inspect the exact source:

```text
npm run f0:inspect -- <path-to-gs_GG_Szko_a.ply>
```

Create the source-coordinate split:

```text
npm run f0:split -- <path-to-gs_GG_Szko_a.ply> <output-dir>
```

Independently verify that output payloads are exact source byte ranges:

```text
npm run f0:verify-split -- <source.ply> <scene.foreground.ply> <scene.environment.ply>
```

The splitter is intentionally source-specific. It requires the exact source SHA-256 and refuses to operate when the recorded PLY layout or shell invariants differ. It is not a general Luma background detector.

## Generated external artifacts

The verified F0 execution produced:

- foreground: `scene.foreground.ply`, 251,255,789 bytes, SHA-256 `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment: `scene.environment.ply`, 12,401,531 bytes, SHA-256 `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`.

The binaries remain outside Git. Their receipts are committed under `evidence/f0/luma-school-2026-08-15/`.

An independent verifier confirmed that the foreground and environment payloads are the exact first 1,013,122 and final 50,000 raw records from the source. Only the PLY vertex-count headers differ.

## Execution qualification

The current assistant execution environment exposed Node `22.16.0` / npm `10.9.2`, not the project canonical Node `24.16.0` / npm `11.13.0`.

The source/split result was additionally cross-checked with Python `3.13.5` + NumPy `2.3.5` and byte-range comparison, so the **binary evidence is accepted**. The repository implementation still requires one canonical Node/npm replay before F0 implementation is considered fully closed.

Do not lower the project toolchain to make the current executor canonical.

## Exit to R0

R0 may be prepared, but the first accepted renderer benchmark should be executed only after:

1. foundation PR is accepted;
2. F0 branch is accepted;
3. canonical toolchain replay of the committed F0 tools passes;
4. the exact source/derived hashes above are available to the renderer experiments.
