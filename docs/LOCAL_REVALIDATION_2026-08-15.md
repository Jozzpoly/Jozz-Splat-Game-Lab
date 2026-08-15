# Local revalidation — 2026-08-15

This short record captures the post-fix F0 revalidation performed after an owner-side run exposed a stale evidence-check invariant.

## Trigger

The Windows owner helper reached Node `24.16.0`, passed `tools/check-foundation.mjs`, then failed `tools/check-f0-records.mjs` because that checker still required the removed historical field `execution.canonicalToolchainReplay === "PENDING"` while the accepted reproduction report had already moved to `status: "VERIFIED"` and the evidence-based Node `>=22.16.0` policy.

This was classified as a repository consistency defect, not a PLY, Windows or Node 24 failure.

## Correction

`tools/check-f0-records.mjs` now validates the actual F0 contract:

- source/report identity and byte counts;
- finite source fields and recorded layout;
- VERIFIED structural partition;
- LIKELY semantic environment interpretation;
- supported Node baseline metadata without npm as an evidence variable;
- foreground/environment receipt status;
- output and payload hashes;
- source-coordinate preservation (`scanToWorldVersion: null`).

The owner helper was renamed to `SPRAWDZ_F0.cmd` and remains optional reproduction evidence, not a gate-closing ritual.

## Full post-fix execution

The corrected checker passed locally.

The complete F0 path was then rerun against the exact immutable PLY, not a fixture:

- source SHA-256: `8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3`;
- foreground SHA-256: `a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`;
- environment SHA-256: `b92d3782374dd945619a96024d7918252b5762d5e26c91fb67c21adafeca496c`;
- foreground payload SHA-256: `033c03b71eb9c9e294732d596d299862289c0543aad1381cf18446917d59800b`;
- environment payload SHA-256: `6fe1c7db98a3cdd61fec3b53999fb559730bcb289f389d3b049b99f60b196281`;
- independent byte-range verifier: `PASS`.

Observed local timings on the assistant Node `22.16.0` environment were approximately 1.62 s inspect, 2.54 s split and 0.57 s independent verification. These timings are diagnostic only and are not performance claims for target hardware.

## Owner evidence

The owner's Windows run independently established that the GUI/file-picker path starts correctly, ZIP extraction succeeds, Node `24.16.0` is found and `tools/check-foundation.mjs` passes before reaching the stale checker defect. That defect has been removed from the clean source line.
