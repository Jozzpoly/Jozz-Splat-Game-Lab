# Project State

Date: 2026-08-15
Milestone: `C0a NON-METRIC STRUCTURAL FEASIBILITY — REJECTED / PRESERVED`
Accepted main: `4cffaf3bd227fd66a0fd9fbbc8060118c5b6aea6` (W0.2)
Experiment branch: `agent/c0a-structural-feasibility`

## Accepted gates

- F0 source/split — VERIFIED.
- R0 renderer choice — CLOSED / REOPENABLE; PlayCanvas `2.21.2` active.
- W0.1 foreground picking — VERIFIED.
- W0.2 gravity/up — VERIFIED from two independent owner sampling runs.
- Survey navigation — OWNER VERIFIED for current inspection needs.

## Parked metric gate

W0.3 Metric Scale is **PARKED / NOT ACCEPTED**. No trustworthy real-world distance ground truth is currently available for this capture. No `unitsPerMetre`, metric `ScanToWorld`, human-scale Walk or metric physics tuning exists.

## C0a result

C0a tested whether a simple deterministic geometry candidate derived directly from the verified splat could provide a useful structural proxy before metric calibration. The experiment produced three bounded non-metric candidates and a Collision Inspector, but owner visual evaluation found the collision geometry **unacceptably poor** for continued development of this extraction path.

Result: `REJECTED_METHOD / PRESERVE_EVIDENCE`.

Do not merge C0a into `main`, do not tune Box3D around these meshes, and do not spend further effort parameter-tuning this generator unless new evidence specifically justifies reopening it.

The branch and receipts remain useful negative evidence showing that a simple center/opacity/scale voxel proxy is insufficient for this capture.

## Future structural direction

The owner has identified a stronger future capture workflow using MipMap or a similar reconstruction system that can produce both a conventional textured mesh and Gaussian Splat from the same reconstruction. The intended architectural hypothesis is:

- mesh/model: structural and collision authority after independent validation;
- Gaussian splat: visual appearance authority;
- both aligned by one reconstruction/world transform.

This is a future integration hypothesis, not yet an accepted project dependency.

## Next active direction

Renderer thermal/performance optimization. The owner reports that the current splat viewer causes the computer to become very loud after running for a while. Treat this as a product problem: reduce unnecessary CPU/GPU work while preserving useful visual quality and navigation.

Start from accepted `main`, not from C0a or parked W0.3. First investigate render scheduling and graphics backend before introducing lossy asset/LOD changes.
