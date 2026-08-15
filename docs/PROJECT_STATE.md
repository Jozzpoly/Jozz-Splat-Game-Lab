# Project State

Date: 2026-08-15
Milestone: `W0.2 GRAVITY — VERIFIED / W0.3 METRIC SCALE NEXT`
Active branch: `agent/w0-2-gravity`

## Closed gates

### F0 — VERIFIED

Exact source and deterministic foreground/environment byte partition remain verified.

### R0 — CLOSED / REOPENABLE

PlayCanvas Engine `2.21.2` is active; Spark remains a validated fallback.

### W0.1 — VERIFIED

Owner-device evidence verified stable foreground spatial probes. Environment remains appearance-only and excluded from calibration authority.

### W0.2 — VERIFIED

W0.2 now has two independent owner-device gravity sampling runs on the exact F0 source.

First run:

- 5 real vertical references;
- tilt candidate `7.6424°`;
- axis coherence `99.939%`;
- axis residual median `0.5149°`;
- axis residual max `2.1871°`;
- 3 entered directions agreed and 2 were reversed, which exposed the need to separate physical-axis agreement from endpoint direction semantics.

The implementation was hardened accordingly: `axisResidualDeg` is independent of `directedResidualDeg`; `REVERSED` is explicit; endpoints are never silently swapped/deleted; manual reversal is auditable; preview cannot proceed with unresolved reversed direction evidence.

Second independent run after hardening:

- 6 freshly collected vertical references;
- all `6 / 6` bottom→top directions agree;
- solved baseline up `[-0.0397223372, 0.9894921119, 0.1390233663]`;
- tilt `8.31336°`;
- axis coherence `99.906%`;
- residual mean `1.6225°`, RMS `1.7537°`, median `1.5838°`, max `2.9150°`;
- level preview applied on owner hardware.

The two independently recollected solved UP axes differ by only `0.7243°`; tilt differs by `0.6710°`. This repeatability is stronger evidence than either single fit alone.

Owner-device screenshot after level preview was reviewed and shows no obvious over-correction; main-building verticals remain visually credible. The screenshot/location image is intentionally not committed to this public repository. Exact numeric evidence is stored in `evidence/w0/w0-2-owner-pass-2026-08-15.json`.

### Spatial interpretation boundary

W0.2 verifies the gravity/up direction of the current reconstruction coordinate frame. It does **not** claim that every local surface across this imperfect splat is metrically rigid or free of local reconstruction distortion. A distant-structure gravity sample remains a useful later falsification check before broad physical use, but it is no longer a blocker for the coordinate-frame orientation gate.

## Survey navigation — OWNER VERIFIED

Recovered Survey controls materially improved close-range inspection:

- `MMB` orbit;
- `Shift+MMB` view-plane pan;
- cursor-anchored wheel zoom;
- `Shift+wheel` faster travel;
- `F` focuses the orbit pivot on the verified foreground point under the cursor without teleporting the camera;
- `Home` fits the full scan;
- `R` resets the original view;
- initial-radius near/far navigation limits are removed except for a tiny numerical floor;
- `LMB` / `RMB` remain free for world interaction.

Owner feedback explicitly confirmed focus-under-cursor works very well, Shift+wheel works, and approaching/inspecting building surfaces is no longer a fight with the camera. This remains Survey inspection, not W0.5 metric human movement.

## Recovery/security state

The interrupted W0.2 session was recovered without modifying accepted `main`. Recovery validation repeated source/server/hash checks and hardened the owner LAB:

- loopback-only HTTP;
- Host allowlist (`127.0.0.1` / `localhost`);
- malformed paths handled safely;
- basic no-sniff/no-frame/no-referrer/same-origin response headers;
- exact known F0 ZIP size + SHA-256 verified before extraction;
- exact PLY size/hash still verified before serving;
- temporary extracted capture cleanup attempted on normal launcher exit.

Raw/foreground/environment streams continue to reproduce the exact F0 hashes.

## Next gate — W0.3 METRIC SCALE

W0.3 must infer one metric scale from independently known real-world distances while preserving raw source evidence.

Planned bounded stages:

1. W0.3a — two-point foreground distance measurement;
2. W0.3b — explicit entry of known real metres + provenance note;
3. W0.3c — scale solver with per-measurement implied units/metre and residuals, no silent outlier removal;
4. W0.3d — repeatability/consistency owner evidence from at least 2 measurements, preferably 3;
5. only after W0.3 PASS may W0.4 promote a versioned `ScanToWorld`.

Do not assume standard doors, roads, goals or other nominal dimensions unless their actual dimension for this site is known. No collision, Box3D or metre-valued gameplay tuning before W0.4.
