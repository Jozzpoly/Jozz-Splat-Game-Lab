# AGENTS.md — Jozz Splat Game Lab

This repository is an evidence-driven R&D/game project. Current Git, executable evidence and direct owner validation outrank prose handoffs.

## Repository boundary

- Work only in `Jozzpoly/Jozz-Splat-Game-Lab` unless the owner explicitly requests a separate repository change.
- Other projects may provide verified patterns but are not implicit dependencies.
- Raw capture assets remain external immutable inputs identified by receipts.
- Keep accepted `main` history stable and use bounded experiment branches.

## Evidence rules

Use `VERIFIED`, `LIKELY`, `UNCERTAIN`, `CONFLICT` and `OWNER_DECISION_REQUIRED` when uncertainty matters. A rendered splat is not calibrated geometry. A generated collision mesh is not automatically physical truth.

## Gate state

### F0 — VERIFIED

The exact source and deterministic foreground/environment partition are verified. Environment semantics remain `LIKELY` even though its appearance role has strong runtime evidence.

### R0 — CLOSED / REOPENABLE

PlayCanvas Engine `2.21.2` is active. Spark `2.1.0` + Three `0.185.1` is a validated fallback. Reopen only on material contradictory evidence. Do not maintain a generic renderer abstraction just to preserve both paths.

### W0 — ACTIVE

W0 is split into independently falsifiable stages:

1. W0.1 picking;
2. W0.2 gravity/up calibration;
3. W0.3 metric scale;
4. W0.4 authoritative `ScanToWorld`;
5. W0.5 human-scale navigation.

Do not collapse these stages. `ScanToWorld` remains `draft` until measured orientation and scale evidence pass. No collision, Box3D or metre-valued gameplay tuning before W0.4.

#### W0.1 boundaries

- PlayCanvas only;
- foreground is the only calibration authority;
- environment may render but must not be accepted as calibration evidence;
- preserve runtime-world and raw-source coordinates for accepted probes;
- persistent markers must remain visually attached under camera movement;
- no gravity solver, metric scale, collision or physics in W0.1.

## Owner workflow

Prefer browser/GUI workflows and double-clickable Windows launchers with file pickers. Ask for owner action only where perception, real-world knowledge or target hardware adds evidence the agent cannot reproduce independently.

## Engineering discipline

Prefer small falsifiable slices over broad frameworks. Pin evidence-producing runtime versions. Preserve one canonical world transform. If required files cannot be accessed reliably, ask the owner for the exact file/package. Never promote `PENDING` to `PASS` by inference.
