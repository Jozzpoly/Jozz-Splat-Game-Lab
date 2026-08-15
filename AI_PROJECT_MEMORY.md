# AI Project Memory — Jozz Splat Game Lab

Updated: 2026-08-15
Status: `W0.3 METRIC SCALE ACTIVE / OWNER GROUND TRUTH REQUIRED`

This is a router, not canonical truth. Current Git, executable evidence and direct owner validation outrank it.

## Accepted truth

- source SHA `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground SHA `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- PlayCanvas Engine `2.21.2` active; Spark/Three remains validated fallback;
- W0.1 picking VERIFIED;
- W0.2 gravity VERIFIED and accepted on `main` at `4cffaf3bd227fd66a0fd9fbbc8060118c5b6aea6`;
- accepted W0.2 correction quaternion `[-0.06969501109561521, 0, -0.01991354981873241, 0.9973695683957874]`;
- W0.3 metric scale ACTIVE;
- no accepted metres, origin, `ScanToWorld`, collision or Box3D yet.

## W0.3 implementation

Branch: `agent/w0-3-metric-scale`; draft PR #7.

- reuse `SpatialProbe` for A/B foreground endpoints;
- preserve raw source coordinates and source-space distance;
- display uses accepted W0.2 orientation only for easier inspection;
- owner provides real `knownMetres` plus provenance;
- decimal comma or dot accepted;
- minimum 2 complete independent measurements for candidate, prefer 3 for acceptance;
- common scale uses all valid measurements in origin-constrained least squares;
- each sample retains implied scale and residual;
- aggregate consistency is reported;
- no silent outlier removal;
- no automatic acceptance;
- no `ScanToWorld` promotion in W0.3.

## W0.3 hardening before owner test

Four issues were found internally before release and fixed:

1. residual-to-row identity after filtering incomplete measurements;
2. per-keystroke DOM rebuild/focus disruption;
3. Polish decimal comma parsing;
4. missing `scale.css` in initial local owner-package workspace.

Current preflight passes synthetic/conflict/row-identity/decimal tests, static contract, security-negative HTTP tests and exact F0 raw/foreground/environment stream hashes.

Evidence: `evidence/w0/w0-3-hardening-preflight-2026-08-15.json`.

## Current blocker is real-world knowledge, not code

Need at least 2 genuinely known real distances, preferably 3. For each: metres + clear A/B endpoints visible in the splat + how the value is known. Longer spans and different features/directions are preferred. Do not invent nominal dimensions.

## Next after W0.3 PASS

W0.4 should be staged:

1. explicit origin decision;
2. compose one versioned `ScanToWorld` using accepted baseline mapping + W0.2 orientation + W0.3 scale + origin;
3. round-trip/receipt validation.

Only after that may W0.5 Walk and C0 collision operate in metres.

## Read next

1. `docs/PROJECT_STATE.md`
2. `docs/W0_WORLD_GROUNDING.md`
3. `evidence/w0/w0-3-hardening-preflight-2026-08-15.json`
4. `evidence/w0/w0-2-owner-pass-2026-08-15.json`
5. `docs/EVIDENCE_CONTRACT.md`
6. `AGENTS.md`
