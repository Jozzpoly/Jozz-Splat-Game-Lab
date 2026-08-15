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
- Do not force-push, rewrite history or silently replace an accepted source line.
- Do not create GitHub Actions without explicit owner approval.

## Evidence rules

Classify material claims as `VERIFIED`, `LIKELY`, `UNCERTAIN`, `CONFLICT` or `OWNER_DECISION_REQUIRED` when ambiguity matters.

A build is not runtime evidence. A screenshot is not physics evidence. A generated collision mesh is not automatically geometric truth. Owner playtest evidence is a separate evidence class from automated checks.

Raw capture assets are immutable inputs. Do not hand-edit them. Large capture files stay outside Git by default and are identified by SHA-256 receipts under `evidence/`.

Every meaningful derived asset must eventually have a receipt containing source hash(es), tool identity/version, parameters, world-transform version and output hash. Manual repairs are allowed only when explicitly recorded as manual evidence, never hidden inside a pipeline.

## Current gate constraints

### F0 — Evidence Freeze — VERIFIED

The exact first Luma source and deterministic foreground/environment source-coordinate partition are verified. Do not reopen F0 without new contradictory evidence. The 50,000-record shell's **structure** is verified; its semantic interpretation as Luma environment remains `LIKELY`.

### R0 — Renderer Bake-Off — ACTIVE

Spark/Three and PlayCanvas are the only active candidates. The R0 LAB is an experiment harness, not accepted game architecture.

Rules:

- same exact verified PLY/foreground bytes for both candidates;
- same source-space Reset camera transformed into each runtime;
- exact runtime pins; no `latest` aliases;
- Spark baseline is WebGL2;
- PlayCanvas baseline is WebGL2, with a separately recorded `Best` mode allowed to try WebGPU then fall back to WebGL2;
- do not build a renderer-agnostic product abstraction around the two candidates;
- browser/GPU evidence and owner visual validation are required before selecting a winner;
- do not silently tune one candidate after looking at the other without recording the asymmetry;
- the losing active candidate is expected to be frozen/removed after the decision.

### W0 — World Contract

`ScanToWorld` is draft-only until real calibration evidence exists. Do not assume `1 source unit = 1 metre`. Do not tune collision or integrate Box3D against uncalibrated units.

### Later gates

Collision, Box3D inhabitance and gameplay must not be pulled forward merely because they are interesting. See `docs/FOUNDATION_PLAN.md`.

## Owner workflow

The repository owner is not expected to operate this project like a software engineer. Prefer browser/GUI workflows and double-clickable Windows launchers with normal file pickers. Do not make terminal arguments, Git operations, npm setup or developer-style drag/drop the default owner interaction.

When owner evidence is genuinely needed, make the requested action small and explain what unique evidence it contributes. Do not use the owner as manual CI for checks the agent can reproduce independently.

## Engineering discipline

- Prefer small, falsifiable slices over broad frameworks.
- Do not create empty future systems, generic plugin architectures or speculative schemas that are not required by the active gate.
- Pin experimental tool versions. Capture `--version`/`--help` when a CLI contract matters; moving `main` documentation is not a versioned binary contract.
- Preserve one canonical world transform. Visual, collision and gameplay layers must not invent independent scale/origin fixes.
- If required source files cannot be accessed reliably, ask the owner for the exact file/package instead of spending long effort bypassing access limitations.
- If a check cannot be run, state that explicitly. Never promote `PENDING` to `PASS` by inference.

## Publish discipline

Use bounded branches and intentional commits. Prefer a draft PR for substantive experiment changes. Keep `main` as accepted source truth. When a local worktree contains unrelated edits, never use broad staging such as `git add .` without confirming scope.
