# AGENTS.md — Jozz Splat Game Lab

This repository is an evidence-driven R&D/game project. Fast progress is useful only when the identity of inputs, experiments and conclusions remains auditable.

## Start gate — required before implementation

Record or verify all of the following before changing code:

1. repository: `Jozzpoly/Jozz-Splat-Game-Lab`;
2. current branch and exact HEAD;
3. local worktree state when a local checkout is used;
4. current milestone in `docs/PROJECT_STATE.md`;
5. allowed files/paths for the task and any protected/generated inputs;
6. validation commands available on the current HEAD;
7. documentation conflicts or stale claims.

Current Git, executable evidence and direct owner validation outrank prose handoffs or historical chat summaries.

## Repository boundary

- Do not modify JV, HomeScan, JURE, VAW or any other repository while working here unless the owner explicitly asks for that separate write.
- Other repositories may be inspected for verified patterns. Copy only the smallest justified pieces and record provenance when code is actually reused.
- Do not make this repository depend on another personal project merely because useful code exists there.
- Keep accepted `main` history stable; use bounded branches and intentional commits for experiments.
- Do not create GitHub Actions without explicit owner approval.

## Evidence rules

Classify material claims as `VERIFIED`, `LIKELY`, `UNCERTAIN`, `CONFLICT` or `OWNER_DECISION_REQUIRED` when ambiguity matters.

A build is not runtime evidence. A rendered splat is not calibrated geometry. A generated collision mesh is not automatically physical truth. Owner visual/playtest evidence is a separate evidence class from automated checks.

Raw capture assets are immutable inputs. Do not hand-edit them. Large capture files stay outside Git by default and are identified by SHA-256 receipts under `evidence/`.

Every meaningful derived asset must eventually have a receipt containing source hash(es), tool identity/version, parameters, world-transform version and output hash. Manual repairs are allowed only when explicitly recorded as manual evidence, never hidden inside a pipeline.

## Current gate constraints

### F0 — Evidence Freeze — VERIFIED

The exact first Luma source and deterministic foreground/environment source-coordinate partition are verified. Do not reopen F0 without new contradictory evidence. The 50,000-record shell's structure is verified; its historical semantic label remains `LIKELY`.

### R0 — Renderer Bake-Off — CLOSED / REOPENABLE

PlayCanvas Engine `2.21.2` is the active runtime. Spark `2.1.0` + Three `0.185.1` is a validated fallback/reference path. Reopen R0 only on material contradictory evidence. Do not maintain a generic renderer abstraction merely to preserve both candidates.

### W0 — World Grounding — ACTIVE

W0 must create one measured world authority and is explicitly staged:

1. W0.1 stable foreground picking;
2. W0.2 gravity/up calibration;
3. W0.3 metric scale;
4. W0.4 authoritative `ScanToWorld`;
5. W0.5 human-scale navigation.

Do not collapse these stages for convenience. `ScanToWorld` remains `draft` until real orientation and scale evidence pass. Do not tune collision or integrate Box3D against uncalibrated units.

#### W0.1 hard boundaries

- PlayCanvas only;
- foreground is the only calibration authority;
- environment may render as appearance but must not be accepted as calibration evidence;
- persistent markers must remain visually attached to the selected surface under camera movement;
- preserve both runtime-world and raw source coordinates for every accepted probe;
- no gravity solver, metric scale, collision or physics in W0.1.

### Later gates

Collision, Box3D inhabitance and gameplay must not be pulled forward merely because they are interesting. See `docs/FOUNDATION_PLAN.md`.

## Owner workflow

The repository owner is not expected to operate this project like a software engineer. Prefer browser/GUI workflows and double-clickable Windows launchers with normal file pickers. Do not make terminal arguments, Git operations, npm setup or developer-style drag/drop the default owner interaction.

When owner evidence is genuinely needed, make the requested action small and explain what unique evidence it contributes. Do not use the owner as manual CI for checks the agent can reproduce independently.

## Engineering discipline

- Prefer small, falsifiable slices over broad frameworks.
- Do not create empty future systems, generic plugin architectures or speculative schemas that are not required by the active gate.
- Pin experimental tool versions. Capture `--version`/`--help` when a CLI contract matters; moving documentation is not a versioned binary contract.
- Preserve one canonical world transform. Visual, collision and gameplay layers must not invent independent scale/origin fixes.
- If required source files cannot be accessed reliably, ask the owner for the exact file/package instead of spending long effort bypassing access limitations.
- If a check cannot be run, state that explicitly. Never promote `PENDING` to `PASS` by inference.

## Publish discipline

Use bounded branches and intentional commits. Prefer a draft PR for substantive experiment changes. Keep `main` as accepted source truth. When a local worktree contains unrelated edits, confirm scope before staging or publishing.
