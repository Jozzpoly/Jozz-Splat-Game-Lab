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

### W0 — ACTIVE

W0 must create one measured world authority. It is explicitly staged:

- W0.1 picking;
- W0.2 gravity/up calibration;
- W0.3 metric scale;
- W0.4 authoritative `ScanToWorld`;
- W0.5 human-scale navigation.

Do not collapse these stages for convenience. `ScanToWorld` remains `draft` until real orientation and scale evidence pass. No collision, Box3D or metre-valued gameplay tuning before W0.4.

#### W0.2 hard boundaries

- W0.1 picking is accepted and reused; do not redesign the picker while solving gravity unless contradictory evidence appears;
- collect references as **bottom → top** pairs on genuinely vertical foreground structures;
- preserve raw source coordinates and one baseline runtime coordinate frame for every endpoint;
- all vertical references contribute to the candidate solver; never silently delete or trim outliers;
- report residual angle for every reference and keep `automaticAcceptance=false`;
- level correction is a reversible preview on a temporary draft grounding root, not accepted `ScanToWorld`;
- reset preview before collecting new evidence so coordinate frames cannot mix;
- require at least three references before owner evidence export;
- no metric scale, collision, Box3D or gameplay in W0.2.

### Later gates

C0/C1 collision evidence, P0 physical inhabitance and G0 gameplay remain downstream. See `docs/FOUNDATION_PLAN.md`.

## Owner workflow

The repository owner is not expected to operate the project like a software engineer. Prefer browser/GUI workflows and double-clickable Windows launchers with normal file pickers. Ask for owner action only when perception, real-world knowledge or target hardware adds evidence unavailable to the agent.

## Engineering discipline

- Prefer small falsifiable slices over broad frameworks.
- Pin experiment versions; no `latest` aliases for evidence-producing runtime paths.
- Preserve one canonical world transform. Later layers must consume `ScanToWorld`, never invent independent corrections.
- If required files cannot be accessed reliably, ask the owner for the exact file/package rather than spending long effort bypassing constraints.
- If a check cannot be run, say so. Never promote `PENDING` to `PASS` by inference.

## Publish discipline

Use bounded branches and intentional commits. Prefer draft PRs for active experiments. Keep `main` as accepted source truth.
