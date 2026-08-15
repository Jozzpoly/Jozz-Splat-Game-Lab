# W0 World Grounding

Status: `W0.3 METRIC SCALE ACTIVE / OWNER GROUND TRUTH REQUIRED`

## Purpose

W0 converts appearance reconstruction into one measured spatial contract. It stays decomposed so picking, orientation, scale and origin failures cannot hide inside one transform.

## Gate sequence

### W0.1 — Spatial Probe — VERIFIED

Foreground GSplat picking recovers persistent raw-source positions. Environment is appearance-only and excluded from calibration authority.

### W0.2 — Gravity — VERIFIED

Two independent owner-device runs reproduce the same reconstruction UP axis within `0.7243°`. Accepted repeat-run orientation:

- UP baseline runtime `[-0.0397223372, 0.9894921119, 0.1390233663]`;
- tilt `8.31336°`;
- correction quaternion `[-0.0696950111, 0, -0.0199135498, 0.9973695684]`.

The evidence model distinguishes undirected physical-axis agreement from bottom→top endpoint direction and never silently reverses/deletes references. See `evidence/w0/w0-2-owner-pass-2026-08-15.json`.

W0.2 proves coordinate-frame orientation for this reconstruction, not perfect local geometric rigidity everywhere.

### W0.3 — Metric Scale — ACTIVE

Question: can independently known real distances agree on one metric scale strongly enough to justify the scale component of a later `ScanToWorld`?

#### W0.3a — Distance Probe — IMPLEMENTED

Reuse the verified `SpatialProbe`. Pick foreground endpoints A and B and preserve:

- raw `aSource` / `bSource`;
- raw source-space Euclidean `sourceLength`;
- persistent visual marker/line evidence.

The displayed draft grounding root uses accepted W0.2 orientation for easier inspection. Source evidence remains raw because picking inverts the complete foreground world transform.

#### W0.3b — Metric provenance — IMPLEMENTED

For each measurement the owner enters:

- the genuinely known real distance in metres;
- a short provenance note explaining how the value is known.

Both `12,5` and `12.5` decimal forms are accepted. Zero/negative/non-finite values are not evidence.

Nominal dimensions are weak/invalid evidence unless the actual site value is known. Do not infer scale from a door, road, goal or other apparently standard object merely from appearance.

#### W0.3c — Scale solver — IMPLEMENTED

At least 2 complete measurements are required for a candidate; 3 are preferred for acceptance.

Fit all valid measurements using origin-constrained least squares:

`sourceLength ~= unitsPerMetre * knownMetres`

Report:

- common `unitsPerMetre`;
- reciprocal `metresPerSourceUnit`;
- each sample's implied scale;
- each sample's predicted source/metre length and relative residual;
- ratio mean/median/stddev/CV;
- RMS/median/max relative residual.

No valid sample is silently trimmed. `silentOutlierRemoval=false` and `automaticAcceptance=false` remain explicit. A conflicting measurement is evidence requiring investigation, not something to hide.

#### W0.3 hardening before owner release

Adversarial self-review caught and fixed:

- residual mapping could lose original visible row identity after filtering incomplete measurements;
- per-keystroke recomputation could rebuild form fields and interrupt typing;
- Polish decimal comma was initially rejected;
- initial local owner workspace lacked `scale.css` even though the page referenced it.

Regression/static/full-source HTTP preflight now covers these issues. See `evidence/w0/w0-3-hardening-preflight-2026-08-15.json`.

#### W0.3d — Owner consistency evidence — PENDING

Need at least 2 independent genuinely known real distances, preferably 3. Each must include recognisable A/B endpoints and provenance.

Prefer:

- longer spans where practical, reducing relative endpoint-pick error;
- different features/directions rather than repeated estimates of one object;
- measured/documented values over assumptions.

W0.3 PASS is an evidence decision after inspecting individual implied scales/residuals and aggregate consistency. It is not a numerical threshold that self-accepts.

### Survey navigation — VERIFIED FOR CURRENT LAB NEEDS

- `MMB` orbit;
- `Shift+MMB` pan;
- wheel cursor-anchored zoom;
- `Shift+wheel` faster travel;
- `F` focus verified foreground under cursor without moving the camera;
- `Home` fit;
- `R` reset;
- `LMB` / `RMB` remain reserved for world interaction.

Owner testing confirmed close building inspection is no longer a fight with the camera. This remains Survey, not metric W0.5 movement.

### Local owner-lab security

The local server streams capture bytes and remains a trust boundary: loopback binding/Host allowlist, safe malformed-path handling, basic no-sniff/same-origin/no-frame/no-referrer headers, exact F0 ZIP hash before extraction, exact PLY hash before serving and normal-exit temp cleanup.

### W0.4 — ScanToWorld — LOCKED

W0.4 must not be a single opaque transform write. After W0.3 PASS:

#### W0.4a — Origin

Choose and document an explicit world origin with owner-visible evidence. Do not silently use source origin, bbox centre or camera start merely because they are convenient.

#### W0.4b — Compose contract

Create one versioned `ScanToWorld` from:

- fixed source/baseline coordinate mapping;
- accepted W0.2 orientation;
- accepted W0.3 metric scale;
- accepted world origin.

#### W0.4c — Verify contract

Round-trip representative source/world points, validate distances/up direction, update derived-asset receipts and prove visual/collision/gameplay consumers use exactly the same transform.

### W0.5 — Human Navigation — LOCKED

Only after W0.4 may movement use metres/second and human camera height.

## Safety boundary

No collision, Box3D or metre-valued gameplay tuning before W0.4. Appearance remains separate from physical truth.
