# W0 World Grounding

Status: `W0.2 GRAVITY — STRONG AXIS EVIDENCE / LEVEL PREVIEW NEXT`

## Purpose

W0 converts an appearance reconstruction into one measured spatial contract. It is deliberately decomposed so bad picking, bad gravity and bad metric scale cannot hide inside one transform.

## Gate sequence

### W0.1 — Spatial Probe — VERIFIED

Foreground GSplat picking recovers persistent source/runtime positions. Environment is appearance-only. Owner evidence verified seven stable probes.

### W0.2 — Gravity — ACTIVE

Question: do multiple real vertical structures agree on one gravity/up axis, and can endpoint direction be resolved explicitly before orientation is accepted?

#### Why axis and direction are separate

A physical vertical line is an **axis**: reversing its endpoints does not make it a different vertical. But `bottom → top` is directional evidence. W0.2 therefore records both instead of allowing endpoint order to contaminate geometric agreement.

For every reference the solver reports:

- `axisResidualDeg` — smallest angle to the solved vertical axis, independent of endpoint direction;
- `directedResidualDeg` — signed bottom→top disagreement with the oriented up candidate;
- `directionStatus` — `AGREES` or `REVERSED`;
- reference length in source units.

Across the full set it reports:

- orientation-independent `axisCoherence` from the dominant covariance eigenvalue;
- mean/RMS/median/max axis residual;
- explicit bottom→top direction consensus;
- tilt from baseline runtime `+Y`;
- reversible correction quaternion;
- `automaticAcceptance: false`.

No outlier or endpoint is silently reversed.

#### Real owner evidence — 2026-08-15

Five building-edge references produced:

- axis coherence: `99.939%`;
- axis residual median: `0.515°`;
- axis residual max: `2.187°`;
- candidate tilt: `7.642°`;
- three endpoint directions agreeing and two reversed.

The two original ~179.5° residuals were therefore not evidence of two physically contradictory verticals; after direction-independent reanalysis they were `0.515°` and `0.502°` from the common axis. Raw technical evidence is recorded in `evidence/w0/w0-2-owner-axis-2026-08-15.json`.

This real evidence changed the implementation: the UI now flags `REVERSED`, preserves the mismatch, and offers an explicit owner `Odwróć` action that swaps the recorded bottom/top endpoints and marker roles while incrementing `manualFlipCount`.

#### Hardened owner workflow

1. stay in Survey;
2. choose `Dodaj pion`;
3. click the **bottom** of a genuinely vertical edge — cyan marker;
4. click the **top** of the same vertical — amber marker;
5. repeat at least three times, preferably across different structures and regions;
6. inspect `axis residual` independently from `UP / REVERSED`;
7. if a pair is visibly stored backwards, use its explicit `Odwróć` control; do not delete it merely because the directed residual is ugly;
8. `Podgląd poziomu` remains blocked until intended bottom→top direction has no unresolved reversed references;
9. visually confirm that the reversible preview corrects the reconstruction tilt without obvious over-correction;
10. copy gravity evidence.

Do not use terrain slope as vertical evidence. Avoid vegetation unless its real orientation is genuinely known. Long, sharp building corners, poles and frame edges are preferable to tiny features because endpoint picking error creates less angular error on longer references.

#### Preview boundary

The preview rotates only the temporary `Draft Grounding Root`. It is not `ScanToWorld`, does not set an origin and does not introduce metres. Preview resets before new references are collected so evidence remains in one baseline frame.

W0.2 PASS remains an evidence decision, not a magic numerical threshold. Require at least three independent coherent axes, resolved direction semantics and owner visual confirmation of level preview.

### Survey navigation hardening

Survey is an engineering inspection camera, not W0.5 human movement. It now follows the established editor convention:

- `MMB` orbit;
- `Shift + MMB` view-plane pan;
- wheel cursor-anchored zoom;
- `F` fit full scan while preserving view orientation;
- `R` reset initial survey view;
- `LMB` and `RMB` reserved for world/model interaction.

The old close-range floor tied to `2.5%` of the initial scan radius is removed. Zoom may approach surfaces down to a very small numerical safety radius and the camera near clip is reduced for close inspection. This improves evidence collection without pretending world units are metres.

### W0.3 — Scale — LOCKED

After gravity passes, measure 2–3 independently known real distances. Do not assume standard doors, roads or sports fixtures unless their actual dimensions are known for this site.

Scale evidence will reuse `SpatialProbe`, explicit provenance and independent residual reporting rather than introducing another picking system.

### W0.4 — ScanToWorld — LOCKED

Promote one versioned transform only after gravity and scale evidence agree.

### W0.5 — Human Navigation — LOCKED

Only after metric calibration may movement use metres/second and human camera height. Survey freedom does not weaken this gate.

## Safety boundary

No collision, Box3D or gameplay tuning before W0.4. Appearance is still not physical truth.
