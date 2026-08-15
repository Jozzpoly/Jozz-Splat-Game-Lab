# Project State

Date: 2026-08-15
Milestone: `W0.2 GRAVITY — RECOVERED / HARDENED OWNER REPLAY NEXT`
Active branch: `agent/w0-2-gravity`

## Recovery checkpoint

After an interrupted session, repository identity was revalidated before continuing:

- accepted `main`: `489cd24d047910de63239c7e22935a3906864fa5` (W0.1);
- W0.2 remains isolated on `agent/w0-2-gravity` / draft PR #6;
- no accidental W0.2 merge reached `main`;
- source roles and F0 hashes remain unchanged.

Recovery did not restart the project. It resumed the already-hardened W0.2 gate and revalidated its actual source tree rather than trusting PR prose.

## Closed gates

### F0 — VERIFIED

Exact source and deterministic foreground/environment byte partition remain verified.

### R0 — CLOSED / REOPENABLE

PlayCanvas Engine `2.21.2` is active; Spark remains a validated fallback.

### W0.1 — VERIFIED

Owner evidence recovered seven foreground probes that remained spatially coherent across materially different camera views. Adaptive constant-screen-size marker hardening was merged with W0.1. Environment remains appearance-only and excluded from calibration authority.

## W0.2 owner evidence — 2026-08-15

Five real-world vertical references were collected on the school capture. Reanalysis showed all five strongly agree on one **undirected vertical axis** while two endpoint pairs encode the opposite bottom→top direction.

Reanalyzed evidence:

- reference count: `5`;
- solved baseline up: `[-0.0409047482, 0.9911173886, 0.1265429710]`;
- tilt from baseline runtime `+Y`: `7.6424°`;
- axis coherence: `99.939%`;
- axis residual mean: `1.0751°`;
- axis residual RMS: `1.4111°`;
- axis residual median: `0.5149°`;
- axis residual max: `2.1871°`;
- endpoint direction consensus: `3 AGREES / 2 REVERSED`.

Technical evidence is stored in `evidence/w0/w0-2-owner-axis-2026-08-15.json`. Owner screenshots/location images are intentionally not committed.

## W0.2 model hardening

- orientation-independent dominant-axis fit;
- `axisCoherence` and axis residuals separated from directed endpoint residuals;
- explicit `AGREES` / `REVERSED` classification;
- explicit owner `Odwróć` action with `manualFlipCount`;
- no silent endpoint reversal or outlier deletion;
- level preview blocked while unresolved reversed pairs remain;
- evidence schema v2 preserves axis, direction and manual-correction provenance;
- exact owner reference set is covered by deterministic regression tests;
- no automatic acceptance and no metric scale.

## Survey navigation hardening

Survey now prioritizes easy inspection rather than coarse whole-scan orbiting:

- `MMB` orbit;
- `Shift+MMB` view-plane pan;
- cursor-anchored wheel zoom with faster `Shift+wheel` travel;
- old initial-radius close/far bounds removed in favor of a tiny numerical floor only;
- `F` focuses on a verified foreground point under the cursor and changes the orbit pivot without teleporting the camera;
- `Home` fits the full scan;
- `R` resets the original view;
- `LMB` / `RMB` stay free for world interaction;
- camera near clip remains `0.003` for close inspection.

This is still Survey. It does not claim W0.5 metric human movement.

## Recovery security hardening

A Codex Security-style diff review treated the local PLY, selected ZIP and loopback server as trust boundaries. Two unnecessary exposures were removed before the next owner package:

- loopback HTTP now validates `Host` (`127.0.0.1` / `localhost`) to reduce DNS-rebinding exposure of raw capture bytes;
- malformed URL decoding returns `400` instead of being able to throw through the request handler;
- responses add `nosniff`, `DENY` framing, no-referrer and same-origin resource policy headers;
- the Windows launcher validates exact F0 ZIP byte count + SHA-256 before `Expand-Archive` and attempts cleanup on normal exit.

No high-severity security finding remains identified in the W0.2 diff. The pinned CDN module remains an explicit external supply-chain dependency; this is not changed by W0.2.

## Recovery preflight

The recovered/hardened local tree passed:

- JS/MJS syntax checks;
- gravity synthetic + exact owner-evidence regression;
- W0 static/navigation/security contract;
- real-source server startup on the exact 263,655,789-byte PLY;
- HTTP 200 for UI/runtime modules;
- foreign Host rejected with `403`;
- malformed encoded URI rejected with `400`;
- encoded traversal does not expose repository files;
- raw/foreground/environment streams reproduce exact F0 SHA-256 hashes.

Rendered browser QA of the **new** focus/security build remains owner evidence: the Browser plugin is unavailable in this host, Playwright is not installed, and outbound DNS to the pinned CDN is unavailable. Do not infer rendered PASS from static checks.

## Still required to close W0.2

Use the hardened owner build once more:

1. collect at least three strong verticals (or repeat five if convenient);
2. resolve only visibly reversed cyan-bottom / amber-top endpoint pairs using `Odwróć`;
3. confirm no unresolved `REVERSED` row remains;
4. apply `Podgląd poziomu`;
5. visually confirm the ~7.6° candidate corrects the reconstruction tilt without obvious over-correction;
6. verify the new close-range Survey navigation is materially easier near building surfaces;
7. copy schema-v2 gravity evidence.

## Next only after W0.2 PASS

W0.3 metric scale from 2–3 independently known real-world distances, reusing `SpatialProbe` and the same explicit evidence/provenance pattern.
