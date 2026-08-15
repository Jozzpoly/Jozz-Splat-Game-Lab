# Project State

Date: 2026-08-15
Milestone: `W0.2 GRAVITY — IMPLEMENTED / OWNER EVIDENCE NEXT`
Active branch: `agent/w0-2-gravity`

## Closed gates

### F0 — VERIFIED

Exact source and deterministic foreground/environment byte partition remain verified.

### R0 — CLOSED / REOPENABLE

PlayCanvas Engine `2.21.2` is active; Spark remains a validated fallback.

### W0.1 — VERIFIED

Owner evidence recovered seven foreground probes that remained spatially coherent across materially different camera views. Adaptive constant-screen-size marker hardening was merged with W0.1. Environment remains appearance-only and excluded from calibration authority.

## W0.2 implementation

Question: can multiple independently sampled real-world verticals produce one credible gravity/up direction before any metric scale is introduced?

Implemented:

- bottom→top vertical reference workflow using the verified foreground picker;
- separate cyan bottom / amber top endpoint markers with constant screen-space size;
- immediate world-space reference lines;
- pure-math `solveGravity()` module independent of PlayCanvas rendering;
- dominant-axis fit across all normalized vertical directions;
- signed residual angle for every reference, so reversed or contradictory verticals remain visible;
- mean/RMS/median/max angular residual statistics;
- tilt angle relative to baseline runtime +Y;
- minimal quaternion mapping the solved up vector to +Y;
- reversible `Draft Grounding Root` preview applied equally to foreground, environment and reference markers;
- preview automatically resets before collecting another vertical, keeping all evidence in one baseline coordinate frame;
- evidence export remains `DRAFT_ORIENTATION_CANDIDATE_NO_SCALE`;
- evidence export is disabled until at least three references exist;
- no automatic acceptance of solver output.

## VERIFIED preflight

- W0.2 static contract PASS;
- W0.2 gravity solver deterministic synthetic tests PASS;
- synthetic truth is recovered within the required angular tolerance;
- correction quaternion maps solved up to +Y;
- intentionally reversed vertical remains a large residual instead of being silently discarded;
- one reference remains insufficient;
- no `unitsPerMetre`, collision or Box3D code exists in W0.2;
- full source/server HTTP hash reproduction PASSes for raw, foreground and environment exact F0 SHA-256 values.

## Owner evidence required

Use at least three real vertical references, preferably on more than one structure and spread across the useful capture. For each reference click the lower point first and the upper point second. Do not use terrain, roofs or tree trunks unless their real-world verticality is genuinely known.

W0.2 should not pass from solver numbers alone. Owner evidence must include the copied gravity JSON plus a visual judgment of the reversible level preview.

## Next only after W0.2 PASS

W0.3 metric scale from 2–3 independently known real-world distances.
