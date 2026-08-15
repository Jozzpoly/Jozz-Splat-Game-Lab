# W0 World Grounding

Status: `W0.2 GRAVITY VERIFIED / W0.3 METRIC SCALE NEXT`

## Purpose

W0 converts an appearance reconstruction into one measured spatial contract. It is deliberately decomposed so bad picking, bad gravity and bad metric scale cannot hide inside one transform.

## Gate sequence

### W0.1 — Spatial Probe — VERIFIED

Foreground GSplat picking recovers persistent source/runtime positions. Environment is appearance-only. Owner evidence verified stable probes.

### W0.2 — Gravity — VERIFIED

Question: do multiple real vertical structures agree on one gravity/up axis, and can endpoint direction be resolved explicitly before orientation is accepted?

#### Accepted evidence model

A physical vertical line is an **axis**: reversing endpoints does not create a different vertical. `bottom → top` is separate directional evidence. W0.2 therefore reports both:

- `axisResidualDeg` — smallest angle to the solved physical vertical axis, independent of endpoint direction;
- `directedResidualDeg` — bottom→top disagreement with the oriented up candidate;
- `directionStatus` — `AGREES` or `REVERSED`;
- `axisCoherence` — global sign-independent agreement of all vertical directions;
- tilt, residual statistics and reversible correction quaternion;
- `automaticAcceptance: false`.

No endpoint/outlier is silently deleted or reversed. Explicit manual reversal remains auditable.

#### First owner run

Five references produced `99.939%` axis coherence and a `7.6424°` tilt candidate. Two endpoint pairs were reversed even though their undirected axis residuals were only about half a degree. This finding changed the solver/evidence model rather than being hidden as bad data.

Evidence: `evidence/w0/w0-2-owner-axis-2026-08-15.json`.

#### Independent repeat run after hardening

Six freshly collected references produced:

- all `6 / 6` directions `AGREES`;
- UP `[-0.0397223372, 0.9894921119, 0.1390233663]` in baseline runtime coordinates;
- tilt `8.31336°`;
- axis coherence `99.906%`;
- residual mean `1.6225°`, RMS `1.7537°`, median `1.5838°`, max `2.9150°`;
- reversible level preview applied on owner hardware.

The solved UP axis differs from the first independent run by only `0.7243°`. That cross-run repeatability is the main acceptance evidence. Owner-device screenshot after preview shows no obvious over-correction and is intentionally not committed because it depicts the real location.

Evidence: `evidence/w0/w0-2-owner-pass-2026-08-15.json`.

#### Scope of the claim

W0.2 verifies the gravity/up direction of the current reconstruction coordinate frame. It does **not** assert that every local reconstructed surface across this imperfect capture is metrically rigid or perfectly vertical. Sampling a trustworthy distant vertical remains a useful later falsification check for local reconstruction drift, especially before broad collision use, but it is not a blocker for coordinate-frame orientation.

### Survey navigation — VERIFIED FOR CURRENT LAB NEEDS

Survey remains an engineering inspection camera, not W0.5 human movement.

Controls:

- `MMB` orbit;
- `Shift+MMB` pan in camera view plane;
- wheel cursor-anchored zoom;
- `Shift+wheel` faster travel;
- `F` focus the orbit pivot on a verified foreground point under the cursor while preserving current camera position;
- `Home` fit full scan;
- `R` reset original survey view;
- `LMB` / `RMB` reserved for world/model interaction.

Owner testing confirmed focus-under-cursor works very well, faster travel works and close inspection of building surfaces is no longer a fight with the camera. Fuller navigation combinations may be useful later, but current Survey is sufficient for W0 evidence collection.

### Local owner-lab security

Because the local server can stream raw capture bytes, it is treated as a trust boundary:

- binds loopback only;
- rejects non-loopback Host headers;
- malformed paths are handled safely;
- basic no-sniff / same-origin / no-frame / no-referrer headers are present;
- known Luma ZIP byte count + SHA-256 are checked before extraction;
- exact PLY size/hash are checked before serving;
- temporary extraction cleanup is attempted on normal launcher exit.

The pinned PlayCanvas CDN remains an explicit external supply-chain dependency until later durable/offline delivery work.

### W0.3 — Metric Scale — NEXT

Question: can at least 2 independently known real distances, preferably 3, agree on one metric scale strongly enough to justify a later `ScanToWorld` scale component?

W0.3 is intentionally sliced:

#### W0.3a — Distance Probe

Reuse `SpatialProbe`. Pick foreground endpoints A and B and record raw source coordinates plus raw source-space Euclidean distance. Do not add a second picking implementation.

#### W0.3b — Real-distance provenance

For each A/B measurement the owner explicitly enters the known real distance in metres and a short provenance note describing how that value is known. Nominal/assumed dimensions are not accepted as strong evidence merely because an object resembles a standard size.

#### W0.3c — Scale Solver

For each measurement report:

- `sourceLength`;
- `knownMetres`;
- implied `sourceUnitsPerMetre`;
- deviation from the common scale candidate;
- explicit measurement status.

Solve one common scale without silently dropping outliers. The solver must expose aggregate consistency and individual residuals; it must not self-accept.

#### W0.3d — Owner consistency evidence

Require at least 2 independent known distances, preferably 3 from different spans/features. Longer spans are preferable where practical because endpoint picking error has less relative effect. W0.3 PASS remains an evidence decision, not a magic threshold.

### W0.4 — ScanToWorld — LOCKED

Only after gravity and metric scale pass may one versioned authoritative `ScanToWorld` be promoted. Visual, collision and gameplay layers must consume that same transform rather than inventing local fixes.

### W0.5 — Human Navigation — LOCKED

Only after metric calibration may movement use metres/second and human camera height. Survey freedom does not weaken this gate.

## Safety boundary

No collision, Box3D or metre-valued gameplay tuning before W0.4. Appearance remains separate from physical truth.
