# AGENTS.md — Jozz Splat Game Lab

This repository is an evidence-driven R&D/game project. Fast progress is useful only when the identity of inputs, experiments and conclusions remains auditable.

## Start gate — required before implementation

Record or verify repository identity, current branch/HEAD, active milestone in `docs/PROJECT_STATE.md`, allowed paths, available validation commands and any documentation conflicts before changing code. Current Git, executable evidence and direct owner validation outrank prose handoffs or historical chat summaries.

## Repository boundary

- Do not modify JV, HomeScan, JURE, VAW or another repository unless the owner explicitly asks for that separate write.
- Other repositories may provide verified patterns, never implicit dependencies.
- Do not force-push, rewrite accepted history or create GitHub Actions without explicit owner approval.
- Raw capture assets stay external/immutable and are identified by receipts.

## Evidence rules

Classify material claims as `VERIFIED`, `LIKELY`, `UNCERTAIN`, `CONFLICT` or `OWNER_DECISION_REQUIRED` when ambiguity matters.

A build is not runtime evidence. A rendered splat is not calibrated geometry. A generated collision mesh is not automatically physical truth. Owner visual/playtest evidence is a separate evidence class from automated checks.

## Gate state

### F0 — VERIFIED

Exact first source and deterministic foreground/environment source-coordinate partition are verified. The shell structure is verified; the historical semantic label remains `LIKELY`.

### R0 — CLOSED / REOPENABLE

PlayCanvas Engine `2.21.2` is the active runtime. Spark `2.1.0` + Three `0.185.1` is a validated fallback/reference path. Reopen only on material contradictory evidence.

### W0 — ACTIVE

W0 must create one measured world authority:

- W0.1 picking — VERIFIED;
- W0.2 gravity/up — VERIFIED;
- W0.3 metric scale — ACTIVE;
- W0.4 authoritative `ScanToWorld` — LOCKED;
- W0.5 human-scale navigation — LOCKED.

Do not collapse these gates. No collision, Box3D or metre-valued gameplay tuning before W0.4.

#### W0.3 hard boundaries

- reuse the accepted `SpatialProbe`; do not create a second picking stack;
- keep picked evidence in immutable raw source coordinates even though the display uses the accepted W0.2 orientation;
- each scale sample is A/B foreground endpoints + `sourceLength` + explicitly known real metres + a provenance note;
- do not treat visually plausible or nominal standard dimensions as strong evidence unless the owner actually knows that site's value;
- require at least 2 valid independent metric measurements for a scale candidate and prefer 3 for owner acceptance;
- preserve original visible measurement-row identity when filtering incomplete rows for the solver;
- accept ordinary owner decimal input with comma or dot; reject zero, negative and non-finite values;
- do not rebuild owner input fields on every keystroke; commit edits on change/blur;
- fit all valid scale measurements and expose each implied scale/residual; never silently trim outliers;
- `automaticAcceptance` remains false; numerical consistency is evidence, not a magic acceptance threshold;
- provenance is part of evidence and must survive export;
- W0.3 may produce a scale **candidate**, never a final `ScanToWorld` or physical authority.

#### Accepted W0.2 orientation

W0.3 consumes `evidence/w0/w0-2-owner-pass-2026-08-15.json`. Its accepted correction quaternion may level the draft grounding root for measurement, but source-coordinate recovery must continue to invert the complete foreground world transform. Do not recompute or silently replace W0.2 gravity inside W0.3.

#### Survey navigation contract

Survey is an inspection camera, not human-scale movement:

- `MMB` orbit;
- `Shift + MMB` pan;
- wheel cursor-anchored zoom; `Shift + wheel` faster travel;
- `F` focus verified foreground under cursor without teleporting the camera;
- `Home` fit full scan;
- `R` reset;
- `LMB` and `RMB` remain free for world interaction.

#### Local owner-lab security contract

The local LAB can expose raw capture bytes and must remain fail-closed:

- bind only to loopback;
- accept only `127.0.0.1` / `localhost` Host headers;
- reject malformed paths safely;
- preserve same-origin / no-sniff response hardening;
- verify the exact F0 ZIP hash before extraction;
- direct PLY input must pass exact F0 byte/hash validation before serving;
- clean temporary ZIP extraction after normal launcher exit where possible.

### Later gates

W0.4 must define one versioned `ScanToWorld`, including an explicit origin decision as well as accepted orientation/scale. W0.5 metric Walk and C0/C1 collision remain downstream.

## Owner workflow

The repository owner is not expected to operate the project like a software engineer. Prefer browser/GUI workflows and double-clickable Windows launchers with normal file pickers. Ask for owner action only when perception, real-world knowledge or target hardware adds evidence unavailable to the agent.

## Engineering discipline

- Prefer small falsifiable slices over broad frameworks.
- Pin experiment versions; no `latest` aliases for evidence-producing runtime paths.
- Preserve one canonical world transform. Later layers must consume `ScanToWorld`, never invent independent corrections.
- If required files cannot be accessed reliably, ask the owner for the exact file/package rather than spending long effort bypassing constraints.
- If a check cannot be run, say so. Never promote `PENDING` to `PASS` by inference.

## Publish discipline

Use bounded branches and intentional commits. Prefer draft PRs for active experiments. Keep `main` as accepted source truth. Experimental branch commit noise must be squash-merged when the gate is accepted.
