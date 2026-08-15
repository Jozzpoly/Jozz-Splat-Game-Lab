# W0 World Grounding

Status: `W0.2 GRAVITY — IMPLEMENTED / OWNER EVIDENCE NEXT`

## Purpose

W0 converts an appearance reconstruction into one measured spatial contract. It is deliberately decomposed so bad picking, bad gravity and bad metric scale cannot hide inside one transform.

## Gate sequence

### W0.1 — Spatial Probe — VERIFIED

Foreground GSplat picking recovers persistent source/runtime positions. Environment is appearance-only. Owner evidence verified seven stable probes.

### W0.2 — Gravity — ACTIVE

Question: do multiple real vertical structures agree on one gravity direction?

Owner workflow:

1. stay in Survey;
2. choose `Dodaj pion`;
3. click the **bottom** of a genuinely vertical edge/structure;
4. click the **top** of that same vertical;
5. repeat at least three times, preferably across different structures and spatial regions;
6. inspect each residual;
7. use `Podgląd poziomu`;
8. judge whether the world visibly becomes more physically plausible without over-correction;
9. copy gravity evidence.

Do not use terrain slope as vertical evidence. Avoid vegetation unless its real orientation is genuinely known. Long, sharp building corners, poles and frame edges are preferable to tiny features because endpoint picking error creates less angular error on longer references.

Solver behavior:

- each bottom→top pair becomes one normalized baseline-runtime direction;
- all directions contribute to a symmetric outer-product matrix;
- power iteration extracts the dominant axis;
- bottom→top sign orients the axis;
- every signed angular residual is reported;
- no automatic outlier removal;
- no automatic acceptance;
- the correction quaternion is the minimum rotation from candidate up to runtime +Y.

A reversed reference should remain obvious as a very large residual.

The preview rotates a temporary `Draft Grounding Root`. It is not `ScanToWorld`, does not set an origin and does not introduce metres. Preview is reset before new references are collected so evidence remains in a single baseline frame.

W0.2 PASS is an evidence decision, not a hard-coded threshold. Require at least three references and evaluate: spatial diversity, residual consistency, obvious outliers, capture quality and owner visual confirmation of the level preview.

### W0.3 — Scale — LOCKED

After gravity passes, measure 2–3 independently known real distances. Do not assume standard doors, roads or sports fixtures unless their actual dimensions are known for this site.

### W0.4 — ScanToWorld — LOCKED

Promote one versioned transform only after gravity and scale evidence agree.

### W0.5 — Human Navigation — LOCKED

Only after metric calibration may movement use metres/second and human camera height.

## Safety boundary

No collision, Box3D or gameplay tuning before W0.4. Appearance is still not physical truth.
