# Foundation Plan

## Mission

Turn real-world Gaussian Splatting captures into worlds that are not merely viewable but physically coherent enough to inhabit and open-ended enough to invite unscripted play.

The project deliberately distinguishes a technology proof from a game proof. Public projects already demonstrate browser games rendered over Gaussian splats. Our first meaningful product proof is whether a real capture can become a small physics sandbox that provokes the player to invent actions without a quest or checklist.

## Core world model

```text
REAL CAPTURE
    |
    v
SOURCE EVIDENCE
    |-----------------> APPEARANCE ----------> Gaussian runtime
    |-----------------> PHYSICAL EVIDENCE ---> validated collision
    `-----------------> SEMANTICS/CONFIDENCE -> later interaction authority
                                             \
                                              -> GAMEPLAY
```

A Gaussian appearance that looks like a wall is not by itself evidence that a wall collider should exist there.

## Product modes

### LAB

Engineering surface for source identity, transforms, renderer telemetry, collision overlays, probes, contact evidence and manual error classification.

### PLAY

The same world without engineering chrome. Minimal HUD. Its purpose is to answer whether the environment and interactions feel like a game rather than a viewer.

LAB and PLAY may share runtime code later, but they serve different evidence goals and should not be visually conflated.

## Gate sequence

### F0 — Evidence Freeze

**Question:** can the first capture and every derived representation be reproduced from an immutable identified source?

Deliverables:

- independent PLY inspection;
- source receipt with hashes and structure;
- deterministic validation of the suspected Luma environment shell;
- foreground/environment split that refuses to run when expected invariants fail;
- output receipts with hashes;
- no hand-editing of the source.

Pass requires reproducible agreement with the source binary, not with historical prose.

### R0 — Renderer Bake-Off

**Question:** which runtime is the best actual foundation for this project now?

Candidates at foundation time:

- Spark 2.1.0 + Three.js 0.185.1 baseline on WebGL2;
- PlayCanvas Engine 2.21.2 using its supported renderer selection.

Two phases:

1. source compatibility using the exact same PLY;
2. runtime/delivery comparison using the exact same generated SOG hash, if both candidates pass phase 1.

Use deterministic camera replay, fixed viewport/DPR, same browser/device, same asset host and explicit cold/warm cache runs. Record backend. Do not pretend WebGPU and WebGL2 are identical workloads; product capability is still a legitimate decision factor.

Pass means one runtime is selected and the losing experiment is frozen rather than hidden behind an abstraction layer.

### W0 — World Contract

**Question:** can all later layers share one measured interpretation of the capture?

Create one `ScanToWorld` authority containing source hash, coordinate convention, origin, rotation, uniform scale and units-per-metre.

Calibrate using at least two preferably three independent known real-world distances. Promote the contract from `draft` to `calibrated` only when measurements are internally credible.

No Box3D or metre-valued collision tuning before W0 passes.

### C0 — Collision Candidate

**Question:** can a bounded representative ROI produce useful physical geometry without broad manual remodelling?

Pipeline concept:

```text
immutable source
  -> verified foreground
  -> optional spatial cleanup
  -> representative ROI
  -> voxelization in calibrated units
  -> appropriate fill strategy
  -> collision candidate
```

Test multiple bounded parameters rather than one magic recipe. Background/environment data must be excluded by evidence, not hope.

### C1 — Collision Evidence

**Question:** where exactly does the candidate disagree with appearance or expected physical reality?

LAB adds overlay, ray probes, normals and manual labels such as `GOOD`, `FALSE_POSITIVE`, `MISSING`, `UNCERTAIN`. These examples become the seed of any future geometry-confidence research.

### P0 — Physical Inhabitance

**Question:** can simple Box3D bodies and then a player exist stably in the validated ROI?

Start with drop/raycast/contact fixtures, then a simple mover/body. Use a fixed physics step and render interpolation. Do not begin with the JV vehicle.

### G0 — Game Proof

**Question:** does the world cause unscripted player experimentation?

Add only a few conventional dynamic objects and a minimal manipulation loop such as grab/carry/throw. No progression tree, inventory system, NPC stack or quest chain.

Technical pass: stable interactions and credible contacts.

Product pass: owner playtest finds multiple self-directed actions the game did not explicitly instruct. If the experience is exhausted immediately, treat that as a game-design failure even when rendering is excellent.

### D0 — Delivery

**Question:** what delivery representation is justified by measured startup/network/memory/frame behaviour?

Raw PLY remains authoring/evidence source. Compare simple SOG with streamed representations only after the playable baseline exists. Do not adopt streaming because the technology is available.

### M0 — Mobile Proof

Desktop is the first controlled baseline. Mobile becomes a separate measured gate with real-device validation, touch input and quality policy after the core experience is stable.

### R&D1 — Expansion after proof

Potential directions include confidence-certified geometry, local collision patches, relighting, material/contact inference, guided rescanning, vehicles, destruction and dynamic splats. None is a blocker for G0.

## Anti-goals

The foundation explicitly rejects:

- building a general-purpose engine before a game exists;
- making Gaussian primitives responsible for every dynamic gameplay object;
- treating generated watertight geometry as automatically true;
- copying whole architectures from older projects;
- renderer abstraction created solely because R0 has two candidates;
- feature explosion as a substitute for emergent interaction;
- performance claims without recorded device/backend/cache conditions.
