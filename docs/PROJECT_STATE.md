# Project State

Date: 2026-08-15
Milestone: `C0a NON-METRIC STRUCTURAL FEASIBILITY — IMPLEMENTED / OWNER EVIDENCE NEXT`
Accepted main: `4cffaf3bd227fd66a0fd9fbbc8060118c5b6aea6` (W0.2)
Active experiment branch: `agent/c0a-structural-feasibility`

## Accepted gates

- F0 source/split — VERIFIED.
- R0 renderer choice — CLOSED / REOPENABLE; PlayCanvas `2.21.2` active.
- W0.1 foreground picking — VERIFIED.
- W0.2 gravity/up — VERIFIED from two independent owner sampling runs.
- Survey navigation — OWNER VERIFIED for current inspection needs.

## Parked metric gate

W0.3 Metric Scale is **PARKED / NOT ACCEPTED**. The owner currently has no trustworthy real-world distance ground truth for this capture. The parked branch preserves the metric-scale instrument, but no scale value from it has authority.

No `unitsPerMetre`, metric `ScanToWorld`, human-scale Walk or Box3D tuning exists.

## Active pivot — C0a

Lack of metric ground truth must not be bypassed, but it also does not invalidate scale-invariant structural questions. C0a therefore investigates candidate geometry in raw source units only.

First ROI: main school building, source bounds X `[-1.90, 0.82]`, Y `[1.08, 1.86]`, Z `[-0.62, 0.52]`.

Implemented locally/preflighted before publication:

- deterministic CPU prototype generator;
- three parameter-bounded GLB candidates: conservative / balanced / permissive;
- complete hashes/receipts, derived assets kept outside Git;
- accepted W0.2 orientation applied to splat + mesh display;
- candidate wireframe/solid overlay and visibility controls;
- retained owner-verified Survey controls;
- dual-depth compare probe: foreground appearance vs candidate mesh at one screen pixel;
- explicit owner classifications `GOOD`, `FALSE_POSITIVE`, `MISSING`, `UNCERTAIN`;
- evidence export in raw source units;
- exact F0 raw/foreground/environment hashes replayed through the new server;
- all three GLB hashes verified before serving;
- loopback/Host/traversal security boundary retained.

Evidence: `evidence/c0/c0a-preflight-2026-08-15.json`.
Candidate receipt: `evidence/c0/c0a-candidates-2026-08-15.json`.
Protocol: `docs/C0A_NON_METRIC_STRUCTURAL_FEASIBILITY.md`.

## Evidence boundary

C0a is not accepted collision. Candidate geometry is explicitly a hypothesis. Source-unit distances are not metres. No physics behavior may be tuned from them as if they were metric values.

## Next owner evidence

Inspect all three candidate overlays on the real GPU. Focus on long walls, corners, ground transitions and obvious empty space. Collect a small set of compare probes and manual classifications.

If none is structurally useful, stop and improve extraction. If one is promising, harden C1a appearance-vs-candidate evidence before any physics integration.
