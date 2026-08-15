# Jozz Splat Game Lab

Evidence-driven R&D for turning real Gaussian Splatting captures into spatially grounded, physically testable game worlds.

**Accepted `main`:** F0 source integrity → R0 renderer selection → W0.1 stable spatial probes.

**Active draft:** W0.2 Gravity on PlayCanvas Engine `2.21.2`. Spark remains a validated fallback.

W0.2 now distinguishes physical **vertical-axis agreement** from entered **bottom→top direction**. Real owner evidence from five building edges shows `99.939%` axis coherence with a `7.642°` tilt candidate, while two endpoint pairs were direction-reversed. The hardened workflow exposes that conflict explicitly instead of treating good vertical axes as ~180° geometry errors.

Survey navigation is hardened for close inspection: **MMB orbit · Shift+MMB pan · cursor-anchored wheel zoom · F fit · R reset**. LMB/RMB remain free for world interactions. This is an inspection camera, not W0.5 metric human movement.

W0 remains intentionally staged: **W0.1 Picking → W0.2 Gravity → W0.3 Scale → W0.4 ScanToWorld → W0.5 Human Navigation**. No collision or Box3D is accepted before the world transform has measured orientation and scale.

Raw capture assets remain outside Git and are identified by SHA-256 receipts. The 50,000-record environment tail renders as appearance only and has no calibration/physical authority.

Windows owner workflow: double-click `URUCHOM_W0_WORLD_GROUNDING.cmd`, choose the original verified Luma ZIP/PLY, and use the browser UI. No terminal or npm setup is required.

Start with `AI_PROJECT_MEMORY.md`, `docs/PROJECT_STATE.md` and `docs/W0_WORLD_GROUNDING.md`.
