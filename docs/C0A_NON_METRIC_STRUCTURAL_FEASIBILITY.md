# C0a — Non-Metric Structural Feasibility

Status: `IMPLEMENTED / OWNER OVERLAY + PROBE EVIDENCE NEXT`

## Why this gate exists

W0.3 metric scale is parked because the current capture has no trustworthy real-world distance measurements. That must not be bypassed with guessed metres.

At the same time, a later **uniform scale** does not change whether a candidate surface has the right topology, whether a wall is missing, whether a phantom slab exists, or whether a ray hits candidate geometry near the visible splat surface. Those scale-invariant questions are valuable now.

C0a therefore studies structural feasibility in immutable raw **source units** only. It is not accepted C0 collision, not Box3D integration, and not metric physics.

## Hard boundary

Every C0a result must carry:

`metricStatus: UNCALIBRATED_SOURCE_UNITS`

C0a may evaluate:

- visible shape agreement;
- missing candidate surfaces;
- phantom candidate surfaces;
- local source-unit distance between appearance and candidate hits;
- candidate sensitivity to bounded extraction parameters;
- topology/connectivity inside a bounded ROI.

C0a may **not** claim:

- metres;
- player height/speed;
- physical gravity magnitude;
- Box3D tolerances;
- authoritative collision;
- accepted `ScanToWorld`.

## ROI

The first ROI is tightly bounded around the main school building in raw source coordinates:

- X: `[-1.90, 0.82]`
- Y: `[1.08, 1.86]`
- Z: `[-0.62, 0.52]`
- diagonal: about `3.05064` source units.

The ROI was selected because it contains multiple high-value structural cases at once: long walls, corners, roof transitions and nearby ground while remaining small enough for repeated candidate generation.

## Candidate generator — prototype only

`tools/c0a-generate.py` is a bounded CPU reference prototype. It verifies the exact F0 source hash, memmaps only the verified foreground records and then:

1. crops the fixed ROI;
2. converts raw opacity through sigmoid;
3. filters by opacity and maximum `exp(scale)`;
4. bins Gaussian centers into a source-unit voxel grid;
5. applies one binary dilation;
6. retains the largest connected occupied voxel component;
7. extracts an isosurface with marching cubes;
8. exports a GLB plus a complete receipt.

The prototype deliberately does **not** use full anisotropic Gaussian density or quaternion orientation. This limitation is part of the experiment, not hidden debt. If the proxy performs poorly, that is evidence to improve/replace extraction rather than tune gameplay around a bad mesh.

## Three competing hypotheses

The first run produces:

- `conservative` — stricter opacity / small-splat support, fine grid;
- `balanced` — middle candidate;
- `permissive` — broader support, coarser grid.

Voxel sizes are recorded both in source units and as `voxel / ROI diagonal`, so the experiment remains interpretable before metric calibration.

No candidate is preselected as correct.

## Collision Inspector

The C0a browser LAB loads the verified foreground and environment plus all three candidate GLBs under the accepted W0.2 orientation.

Owner controls include:

- candidate switching;
- wireframe / solid overlay;
- candidate opacity;
- foreground/environment visibility;
- accepted Survey navigation and focus-under-cursor;
- ROI focus.

### Compare Probe

A compare probe deliberately performs two separate depth picks for the same screen pixel:

1. candidate hidden → foreground GSplat hit;
2. foreground hidden → active candidate mesh hit.

The evidence records one of:

- `HIT_BOTH`;
- `APPEARANCE_ONLY`;
- `CANDIDATE_ONLY`;
- `MISS_BOTH`.

When both hit, the LAB records source-unit separation and camera-depth delta. These values are explicitly non-metric.

The owner may classify a sample as `GOOD`, `FALSE_POSITIVE`, `MISSING` or `UNCERTAIN`. Classification is never inferred silently from a numeric threshold.

## Pass question

C0a passes only if at least one candidate is structurally useful enough to justify deeper collision work:

> Does a candidate preserve useful walls/ground/corners with a manageable and understandable pattern of missing and phantom surfaces inside the ROI?

No fixed numeric threshold is imposed before seeing real failure data.

## After C0a

If all candidates are poor, stop and improve the extraction model rather than integrating physics.

If one is promising, the next step is **C1a evidence hardening**: expand systematic appearance-vs-candidate probes and failure labels across the ROI, then benchmark the winning/interesting prototype against the pinned official SplatTransform collision pipeline when the required GPU execution path is available.

Metric W0.3 remains parked and can be resumed later without invalidating source-unit shape evidence.
