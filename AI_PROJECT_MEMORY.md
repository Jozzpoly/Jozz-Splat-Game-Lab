# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `FOUNDATION GROUNDING / F0 NEXT`

This file is a router, not canonical truth. Current Git, executable evidence and direct owner validation outrank it.

## Repository truth

- repository: `Jozzpoly/Jozz-Splat-Game-Lab`;
- default branch: `main`;
- initialization commit: `6baac6336ceadb47ca991120d87f8ce47238e2d9`;
- foundation work is proposed on `agent/foundation-grounding`;
- no application runtime is accepted yet;
- no renderer is selected;
- no collision representation is accepted;
- no Box3D integration exists here;
- no raw scan asset is tracked in Git.

## Project purpose

The near-term goal is not to prove that a Gaussian splat can be displayed with WASD controls. Public work already demonstrates that. The project asks whether real captures can become physically coherent, open-ended worlds that are enjoyable to inhabit and experiment with.

The working first-game hypothesis is a very small physics sandbox in a captured real place: exploration plus a few conventional dynamic objects that can be picked up, thrown, stacked or otherwise recombined. This remains a gameplay hypothesis until G0 owner playtesting.

## World model

Keep these concerns distinct:

- `source evidence` — what was actually captured/exported;
- `appearance` — Gaussian representation;
- `physical evidence` — collision representation that must be validated;
- `semantics/confidence` — later evidence about what interactions are justified;
- `gameplay` — entities and rules built on verified world coordinates.

Do not equate appearance with physical truth.

## First campaign

1. `F0 Evidence Freeze` — reproduce source inspection, implement deterministic source split and receipts.
2. `R0 Renderer Bake-Off` — same PLY, then same SOG, Spark/Three versus PlayCanvas; choose one runtime from evidence.
3. `W0 World Contract` — calibrate orientation/scale and promote one `ScanToWorld` transform from draft to measured authority.

Box3D and collision generation are intentionally after W0.

## Known source

The first external source is a user-provided Luma AI Gaussian PLY export. Its currently recorded hashes and structural observations live in `evidence/sources/luma-school-2026-08-15.json`. The binary itself remains external.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/FOUNDATION_PLAN.md`
3. `docs/EVIDENCE_CONTRACT.md`
4. `docs/R0_RENDERER_BAKEOFF.md`
5. `docs/RESEARCH_BASELINE.md`
6. `AGENTS.md`
