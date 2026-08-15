# Jozz Splat Game Lab

Evidence-driven R&D and gameplay laboratory for turning real-world Gaussian Splatting captures into physically coherent, genuinely playable worlds.

**Current status:** `F0 VERIFIED / R0 PHASE A NEXT`

The first implementation campaign is deliberately narrow: **F0 Evidence Freeze → R0 Renderer Bake-Off → W0 World Contract**. No renderer, collision recipe, physics integration, streaming strategy or game mechanic is considered chosen until the relevant gate produces evidence.

F0 has verified the exact first Luma source and a deterministic source-coordinate foreground/environment partition. The semantic interpretation of the 50,000-record shell as Luma environment remains `LIKELY`, not `VERIFIED`.

This repository is intentionally separate from JV, HomeScan, JURE, VAW and other projects. Those repositories may provide verified patterns and evidence, but they are not dependencies or writable workspaces for Splat Game Lab.

Raw capture assets and large derived PLYs remain outside Git and are identified by SHA-256 receipts.

Start with `AI_PROJECT_MEMORY.md` and `docs/PROJECT_STATE.md`. For an optional owner-side F0 reproduction on Windows, double-click `SPRAWDZ_F0.cmd`; no terminal commands are required.
