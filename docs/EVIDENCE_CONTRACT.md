# Evidence Contract

## Why this exists

This project crosses capture, lossy appearance representations, generated geometry, browser rendering and physics. A plausible image can hide a wrong transform; a collision mesh can hide hallucinated surfaces. Evidence must therefore be typed and traceable.

## Evidence classes

### Source evidence

Facts directly reproducible from immutable inputs: hashes, byte counts, PLY header/layout, record counts and deterministic structural measurements.

### Build evidence

Exact package/tool versions, lockfiles, CLI help/version output, source commit and build configuration.

### Runtime evidence

Observed behaviour on a named runtime/device/browser/backend with an exact asset hash and configuration.

### Geometric/physics evidence

Overlay comparisons, raycasts, contacts, normals, drop tests and known-real-world measurements. A generated mesh is a candidate until validated by this evidence.

### Owner evidence

Direct human validation of visual correctness, playability, handling or emergent behaviour. Record separately from automated checks.

## Claim states

Use these labels where uncertainty matters:

- `VERIFIED` — reproduced by appropriate evidence;
- `LIKELY` — strong evidence but not direct proof;
- `UNCERTAIN` — insufficient evidence;
- `CONFLICT` — credible evidence disagrees;
- `OWNER_DECISION_REQUIRED` — technical evidence cannot decide the product/experience choice.

## Receipts

### Source receipt

Identifies an immutable external source by SHA-256 and records format/provenance observations without embedding the large binary.

### Derived asset receipt

Must identify:

- source/input hash(es);
- tool and exact version/commit where relevant;
- full meaningful parameters;
- `ScanToWorld` version when world-space interpretation is involved;
- output hash and size;
- evidence status.

### ScanToWorld

The only intended authority for converting source coordinates into game-world coordinates. It begins as `draft`; physical tuning may rely on it only after measured calibration promotes it to `calibrated`.

## Manual work

Manual edits are not forbidden, but they must be explicit. A manually repaired collision patch is different evidence from an automatic reconstruction and must not be described as if it came directly from the capture pipeline.

## No silent promotion

`generated` does not mean `verified`.

`loads` does not mean `correct`.

`builds` does not mean `runs`.

`runs` does not mean `playable`.

`playable` does not mean `interesting`.
