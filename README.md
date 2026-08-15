# Jozz Splat Game Lab

Evidence-driven R&D and gameplay laboratory for turning real-world Gaussian Splatting captures into physically coherent, genuinely playable worlds.

**Current status:** `R0-A LAB IMPLEMENTED / OWNER BROWSER EVIDENCE NEXT`

The first campaign remains deliberately gated: **F0 Evidence Freeze → R0 Renderer Bake-Off → W0 World Contract**. No collision recipe, physics integration, streaming strategy or game mechanic is considered chosen until the relevant gate produces evidence.

F0 has verified the exact first Luma source and a deterministic source-coordinate foreground/environment partition. The structural split is `VERIFIED`; the semantic interpretation of the 50,000-record shell as Luma environment remains `LIKELY`.

R0-A now has an owner-testable local LAB containing two pinned renderer candidates over the same verified source: Spark 2.1.0 + Three.js 0.185.1 and PlayCanvas Engine 2.21.2. **No renderer has been selected yet.** Actual browser/GPU evidence is the next gate.

This repository is intentionally separate from JV, HomeScan, JURE, VAW and other projects. Those repositories may provide verified patterns and evidence, but they are not dependencies or writable workspaces for Splat Game Lab.

Raw capture assets and large derived PLYs remain outside Git and are identified by SHA-256 receipts.

Start with `AI_PROJECT_MEMORY.md` and `docs/PROJECT_STATE.md`. To run the current R0 LAB on Windows, double-click `URUCHOM_R0_LAB.cmd`, choose the original Luma ZIP/PLY in the normal file picker, and use the browser UI. No terminal commands or npm install are required.
