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

PlayCanvas Engine `2.21.2` is the active runtime. Spark `2.1.0` + Three `0.185.1` is a validated fallback/reference path. Reopen R0 only on material contradictory evidence. Do not maintain a renderer abstraction merely to preserve both paths.

### W0.1 / W0.2 — VERIFIED

Foreground picking and reconstruction-frame gravity/up are accepted from owner-device evidence. Survey navigation is accepted for current engineering inspection needs.

### W0.3 — PARKED / NOT ACCEPTED

Metric scale has no trustworthy real-world ground truth for the current capture. The parked metric-scale branch may be resumed later, but no value from a visual/nominal estimate has authority.

Do not create `unitsPerMetre`, metric `ScanToWorld`, human-scale Walk or physics tuning from guessed dimensions.

### C0a — ACTIVE EXPERIMENT

C0a is **non-metric structural feasibility**, not accepted C0 collision. It is allowed before W0.3 only because its claims are invariant to a later uniform scale.

Hard boundaries:

- every result must carry `metricStatus: UNCALIBRATED_SOURCE_UNITS`;
- operate on a bounded ROI, never the whole capture by default;
- candidate meshes are hypotheses and remain derived external assets identified by receipts/hashes;
- evaluate visible topology/shape, missing surfaces, phantom surfaces and source-unit appearance-vs-mesh separation;
- preserve exact F0 source/foreground/environment identity;
- reuse accepted W0.2 orientation only; do not invent a second orientation correction;
- no Box3D, player body, physical gravity magnitude, metre-valued tolerance or gameplay tuning;
- do not silently choose one extraction candidate because it looks cleaner;
- record failure data before considering manual collision repair.

Current candidate generator is deliberately a simple CPU center-voxel prototype. Its use of centers/opacity/scale filters instead of full anisotropic Gaussian density is a known experimental limitation, not production architecture.

See `docs/C0A_NON_METRIC_STRUCTURAL_FEASIBILITY.md`.

#### Survey navigation contract

Survey is an inspection camera, not human-scale movement:

- `MMB` orbit;
- `Shift + MMB` pan;
- wheel cursor-anchored zoom; `Shift + wheel` accelerates long travel;
- `F` focuses the orbit pivot on verified foreground under the cursor;
- `Home` fits the current experiment view;
- `R` resets;
- `LMB` / `RMB` remain free for world/model interaction;
- no initial-scan-radius near/far lock beyond numerical safety.

#### Local owner-lab security contract

The local LAB can expose raw capture and derived geometry bytes and must remain fail-closed:

- bind only to loopback;
- accept only `127.0.0.1` / `localhost` Host headers;
- reject malformed/traversal request paths;
- preserve same-origin / no-sniff response hardening;
- verify the exact known F0 ZIP hash before extraction;
- verify exact PLY hash before serving;
- verify each derived candidate GLB against the committed receipt before serving;
- temporary ZIP extraction should be cleaned up after normal launcher exit.

### Later gates

Full C0/C1 collision acceptance, P0 physical inhabitance and G0 gameplay remain downstream. C0a may justify those gates; it cannot silently become them.

## Owner workflow

The repository owner is not expected to operate the project like a software engineer. Prefer browser/GUI workflows and double-clickable Windows launchers with normal file pickers. Ask for owner action only when perception, real-world knowledge or target hardware adds evidence unavailable to the agent.

## Engineering discipline

- Prefer small falsifiable slices over broad frameworks.
- Pin experiment versions; no `latest` aliases for evidence-producing runtime paths.
- Preserve one canonical world transform. Later layers must consume accepted evidence rather than invent local corrections.
- If required source files cannot be accessed reliably, ask the owner for the exact file/package rather than spending long effort bypassing constraints.
- If a check cannot be run, say so. Never promote `PENDING` to `PASS` by inference.

## Publish discipline

Use bounded branches and intentional commits. Prefer draft PRs for active experiments. Keep `main` as accepted source truth. Experimental branch commit noise must be squash-merged when the gate is accepted.
