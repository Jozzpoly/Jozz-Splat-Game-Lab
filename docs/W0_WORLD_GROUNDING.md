# W0 World Grounding

Status: `W0.1 IMPLEMENTED / OWNER PICK STABILITY EVIDENCE NEXT`

## Mission

Convert a visually plausible reconstruction into one measured world authority. W0 does not infer physical truth from appearance; it establishes a traceable transform from source coordinates into the coordinate system later consumed by collision, physics and gameplay.

## Gate structure

### W0.1 — Spatial Probe / Picking

Question: can a click on foreground appearance recover a stable 3D point that remains attached to the same visible surface as the camera moves?

Implementation boundaries:

- PlayCanvas 2.21.2 only (R0 active runtime);
- exact F0 source hash required;
- foreground is calibration authority;
- environment shell is rendered as appearance but explicitly excluded from picking;
- no metric scale, gravity solver, collision or Box3D;
- picked runtime-world points are converted back to raw source coordinates through the foreground entity transform;
- persistent marker entities provide direct visual stability evidence;
- evidence export records both source and runtime-world coordinates.

Pass requires owner observation that several markers placed on distinct foreground surfaces remain visually attached after substantial orbit, pan and zoom. A successful API call without stable visual attachment is not sufficient.

### W0.2 — Gravity

Blocked until W0.1 passes. Collect several real structures known to be vertical, each represented by two W0.1 points. Solve a best-fit common vertical direction and report angular residuals/outliers. Do not level from terrain appearance alone.

### W0.3 — Scale

Blocked until W0.2 passes. Create distance measurements from W0.1 points and attach owner-known real distances. Require at least two, preferably three independent measurements. Report each units-per-metre estimate and disagreement rather than hiding it in an average.

### W0.4 — ScanToWorld

Blocked until orientation and scale evidence pass. Promote exactly one versioned `ScanToWorld` record from `draft` to `calibrated`. Later layers must consume this authority and may not invent local transform fixes.

### W0.5 — Human-scale navigation

Blocked until W0.4. Keep Survey controls for scan inspection, then add a separate Walk mode whose camera height, speed, acceleration and interaction ranges are specified in metres.

## Current appearance layering

The exact source is served as two deterministic source-coordinate ranges:

- foreground: 1,013,122 records / calibration authority;
- environment: 50,000 records / appearance only / no calibration or physical authority.

Both are rendered as separate PlayCanvas GSplat components. The current PlayCanvas renderer globally sorts splats from multiple components, allowing this semantic separation without forcing independent visual ordering.

## W0.1 owner test

1. Open `URUCHOM_W0_WORLD_GROUNDING.cmd` and choose the same exact Luma ZIP/PLY.
2. Use Survey to frame the school or another recognisable foreground feature.
3. Click `Dodaj punkt`, then click a sharp recognisable surface (roof corner, wall edge, road marking, etc.).
4. Repeat for at least three spatially separated surfaces.
5. Orbit, pan and zoom aggressively.
6. PASS only if the markers remain attached to the same visual locations. Any systematic drift, mirrored coordinates, picking of background/environment, or unstable points is evidence to stop and diagnose.
7. Use `Kopiuj evidence` and provide the JSON plus screenshots if useful.

## Stop conditions

- environment/background can be picked as calibration evidence;
- markers drift relative to the selected surface under camera motion;
- returned source coordinates are inconsistent with the known source transform;
- WebGPU/WebGL-specific behavior creates conflicting picks (later comparison if needed);
- W0.1 starts accumulating gravity/scale/physics logic before its own pass condition is satisfied.
