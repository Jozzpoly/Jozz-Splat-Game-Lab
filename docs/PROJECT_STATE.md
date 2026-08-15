# Project State

Date: 2026-08-15
Milestone: `W0.3 METRIC SCALE — IMPLEMENTED / OWNER METRIC GROUND TRUTH REQUIRED`
Active branch: `agent/w0-3-metric-scale`
Base `main`: `4cffaf3bd227fd66a0fd9fbbc8060118c5b6aea6`

## Closed gates

### F0 — VERIFIED

Exact source and deterministic foreground/environment byte partition remain verified.

### R0 — CLOSED / REOPENABLE

PlayCanvas Engine `2.21.2` is active; Spark remains a validated fallback.

### W0.1 — VERIFIED

Foreground spatial probes are owner-device verified. Environment remains appearance-only and excluded from calibration authority.

### W0.2 — VERIFIED

Two independent owner-device gravity sampling runs reproduced the same UP axis within `0.7243°`. Accepted repeat-run orientation:

- UP baseline runtime `[-0.0397223372, 0.9894921119, 0.1390233663]`;
- tilt `8.31336°`;
- correction quaternion `[-0.0696950111, 0, -0.0199135498, 0.9973695684]`;
- 6/6 endpoint directions agree;
- axis coherence `99.906%`.

Survey focus-under-cursor / close-range navigation is owner verified for current LAB work.

## Active gate — W0.3 METRIC SCALE

### Implemented

W0.3 is decomposed into a small evidence pipeline:

1. A/B points are selected only through the existing verified foreground `SpatialProbe`;
2. raw source coordinates and raw source Euclidean distance are preserved;
3. owner enters a genuinely known real distance in metres and a short provenance note;
4. at least 2 complete measurements create a scale candidate; 3 are preferred for acceptance;
5. all valid measurements enter an origin-constrained least-squares fit `sourceLength ~= unitsPerMetre * knownMetres`;
6. every sample keeps its own implied units/metre and relative residual;
7. aggregate ratio CV and RMS/median/max relative residual are reported;
8. conflicting measurements remain visible; no silent trimming and no automatic acceptance.

W0.3 displays the scene with the accepted W0.2 orientation but source-coordinate evidence still comes from the inverse complete foreground transform.

### Pre-owner hardening

Adversarial review found and fixed four issues before an owner package was released:

- incomplete rows could cause residuals to attach to the wrong visible measurement row after filtering;
- recomputation on every keystroke could rebuild form fields and disturb typing/focus;
- Polish decimal-comma input such as `12,5` was not accepted;
- the first local package workspace was missing `scale.css` although the published page referenced it.

Current fixes preserve original row indices before filtering, commit fields on `change`/blur, normalize comma/dot decimal input and include `scale.css` in the static/package contract.

Evidence: `evidence/w0/w0-3-hardening-preflight-2026-08-15.json`.

### VERIFIED preflight

Against the exact 263,655,789-byte source:

- scale synthetic truth test PASS;
- conflicting-measurement visibility test PASS;
- sparse row-identity regression PASS;
- decimal-comma input regression PASS;
- JS/MJS/static metric-scale contract PASS;
- all W0.3 runtime/CSS routes HTTP 200;
- foreign Host 403;
- encoded traversal not served;
- raw/foreground/environment HTTP streams reproduce the exact F0 SHA-256 hashes.

## OWNER METRIC GROUND TRUTH REQUIRED

No scale can be accepted from the splat alone. W0.3 now needs at least **2 genuinely known independent real distances**, preferably **3**.

For each measurement we need:

- exact real distance in metres;
- two recognisable endpoints A/B that can be clicked in the splat;
- provenance: how the distance is actually known.

Prefer longer spans and different features/directions when practical. Do not substitute assumed door/road/goal standards for real knowledge.

## Next only after W0.3 PASS

W0.4 should be decomposed rather than treated as one write:

- W0.4a explicit world-origin decision/evidence;
- W0.4b compose versioned `ScanToWorld` from accepted baseline mapping + W0.2 orientation + W0.3 scale + origin;
- W0.4c round-trip/world-coordinate verification and derived-asset receipt integration.

Only then may W0.5 metric Walk and C0 collision use metres. No Box3D/gameplay tuning before the W0.4 world contract exists.
