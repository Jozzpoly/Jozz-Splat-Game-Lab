# Project State

Date: 2026-08-15
Milestone: `W0.2 GRAVITY — STRONG AXIS EVIDENCE / DIRECTION + LEVEL PREVIEW HARDENING`
Active branch: `agent/w0-2-gravity`

## Closed gates

### F0 — VERIFIED

Exact source and deterministic foreground/environment byte partition remain verified.

### R0 — CLOSED / REOPENABLE

PlayCanvas Engine `2.21.2` is active; Spark remains a validated fallback.

### W0.1 — VERIFIED

Owner evidence recovered seven foreground probes that remained spatially coherent across materially different camera views. Adaptive constant-screen-size marker hardening was merged with W0.1. Environment remains appearance-only and excluded from calibration authority.

## W0.2 owner evidence — 2026-08-15

Five real-world vertical references were collected on the school capture.

The original directed residual report contained two ~179.5° values and three low residuals. Reanalysis showed this was not contradictory physical geometry: all five references strongly agree on the same **undirected vertical axis**, while two endpoint pairs encode the opposite direction.

Reanalyzed evidence:

- reference count: `5`;
- solved baseline up: `[-0.0409047482, 0.9911173886, 0.1265429710]`;
- tilt from baseline runtime `+Y`: `7.6424°`;
- axis coherence: `0.9993936872` (`99.939%`);
- axis residual mean: `1.0751°`;
- axis residual RMS: `1.4111°`;
- axis residual median: `0.5149°`;
- axis residual max: `2.1871°`;
- endpoint direction consensus: `3 AGREES / 2 REVERSED`.

Technical owner evidence is stored in `evidence/w0/w0-2-owner-axis-2026-08-15.json`. The owner screenshot is intentionally not committed to the public repository.

## W0.2 hardening after real evidence

The model now distinguishes two facts that must not be conflated:

1. `axisResidual` — whether a reference belongs to the same physical vertical axis regardless of endpoint order;
2. `directionStatus` — whether the explicitly entered `BOTTOM → TOP` direction agrees with the oriented up candidate.

Implemented after the owner evidence:

- orientation-independent covariance/dominant-axis fit;
- `axisCoherence` as a direction-sign-independent geometric agreement metric;
- per-reference `axisResidualDeg` and `directedResidualDeg`;
- explicit `AGREES` / `REVERSED` classification;
- no silent endpoint reversal;
- explicit owner `Odwróć` action that swaps bottom/top markers and records `manualFlipCount`;
- level preview is blocked while unresolved reversed references remain;
- evidence schema version 2 records axis evidence, direction evidence and manual corrections separately;
- deterministic regression test embeds the five real owner references and verifies the recorded axis result.

## Survey navigation hardening

Owner navigation is now aligned with the established project/editor convention instead of the earlier coarse orbit prototype:

- `MMB` orbit;
- `Shift + MMB` view-plane pan;
- `LMB` and `RMB` remain free for model/world interaction;
- wheel uses cursor-anchored exponential zoom;
- the old `2.5% of initial radius` close-range zoom floor is removed and replaced with a very small safety floor;
- `F` fits the full scan while preserving current orientation;
- `R` restores the original survey view;
- camera near clip is reduced for close inspection.

This is Survey navigation only. It is not metric human movement and does not weaken the later W0.5 Walk gate.

## VERIFIED so far

- W0.2 pure gravity solver synthetic tests PASS;
- real owner evidence regression reproduces strong axis coherence and exactly two reversed endpoint pairs;
- explicit correction of those two directions leaves the solved physical axis unchanged within numerical tolerance;
- no automatic acceptance of the gravity candidate exists;
- no `unitsPerMetre`, collision or Box3D exists in W0.2;
- source/foreground/environment roles and F0 hashes remain unchanged by the W0.2 design.

## Still required to close W0.2

Run the hardened owner workflow once more, resolve only endpoint pairs that are visibly reversed according to the cyan-bottom / amber-top markers, then apply the reversible level preview.

W0.2 passes only if:

- at least three independent vertical axes remain coherent;
- no unresolved reversed direction remains in the intended bottom→top evidence;
- the level preview visibly corrects the observed reconstruction tilt without obvious over-correction.

## Next only after W0.2 PASS

W0.3 metric scale from 2–3 independently known real-world distances. The scale solver will reuse `SpatialProbe` and the hardened evidence/provenance pattern rather than creating a separate picking system.
