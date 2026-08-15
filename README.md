# Jozz Splat Game Lab

Evidence-driven R&D and gameplay laboratory for turning real-world Gaussian Splatting captures into physically coherent, genuinely playable worlds.

**Current status:** `W0.2 GRAVITY IMPLEMENTED / OWNER EVIDENCE NEXT`

Accepted gates: **F0 source integrity → R0 renderer selection → W0.1 stable spatial probes**. Active runtime is PlayCanvas Engine `2.21.2`; Spark remains a validated fallback.

W0 is intentionally staged: **W0.1 Picking → W0.2 Gravity → W0.3 Scale → W0.4 ScanToWorld → W0.5 Human Navigation**. No collision or Box3D is accepted before the world transform has measured orientation and scale.

Raw capture assets remain outside Git and are identified by SHA-256 receipts. The 50,000-record environment tail renders as appearance only and has no calibration/physical authority.

Windows owner workflow: double-click `URUCHOM_W0_WORLD_GROUNDING.cmd`, choose the original verified Luma ZIP/PLY, and use the browser UI. No terminal or npm setup is required.
