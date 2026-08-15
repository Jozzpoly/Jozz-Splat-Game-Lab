# R0 Renderer Bake-Off Protocol

Status: `PLANNED — NOT EXECUTED`

## Purpose

Choose the renderer/runtime foundation from evidence, not familiarity or feature marketing.

## Candidate pins at foundation time

### Spark path

- `@sparkjsdev/spark`: `2.1.0`
- Three.js experiment baseline: `0.185.1`
- renderer baseline: `THREE.WebGLRenderer`

Spark 2.1.0 supports Three.js >=0.180.0 and major formats including PLY and SOG. Its current WebGPU/Three `WebGPURenderer` path must not be assumed equivalent to the stable WebGLRenderer path.

### PlayCanvas path

- PlayCanvas Engine: `2.21.2`
- renderer selection: use the engine's supported automatic/runtime choice, but record the actual backend on every run.

## Phase A — source compatibility

Both candidates receive the exact same immutable PLY hash.

Minimum pass criteria:

- load succeeds without silent source mutation;
- orientation and bounds are explainable;
- rendered appearance is visually credible against an independent reference;
- reload/disposal does not leave obvious stale state;
- failures are surfaced rather than hidden.

If exactly one candidate passes source compatibility, R0 may stop early and select it unless the failure is demonstrably a bounded import adapter issue worth fixing.

## Phase B — same runtime asset

Only if both pass Phase A, generate one SOG with a pinned SplatTransform binary. Record the complete conversion receipt and feed the exact same SOG hash to both candidates.

Do not compare an optimized format in one runtime with a raw PLY in the other and call it renderer evidence.

## Deterministic camera replay

Create a renderer-independent data fixture containing timestamps and camera pose/FOV only. This is benchmark input data, not a generic renderer abstraction.

The same replay must run at:

- same CSS viewport;
- same device pixel ratio cap;
- same browser build;
- same machine/device and power mode;
- same asset origin;
- explicit cold-cache and warm-cache runs.

## Required measurements

Record at minimum:

- runtime and exact package versions;
- browser/OS/device/GPU when available;
- actual graphics backend;
- asset hash and bytes transferred;
- time to first meaningful image;
- time to stable/ready state as defined by each experiment;
- frame-time samples and mean/p50/p95/p99;
- visible hitching or incorrect frames during fast camera movement;
- memory observations when a reliable API/tool is available;
- quality/correctness screenshots at fixed camera poses;
- conventional mesh compositing test;
- reload/disposal behaviour;
- implementation complexity and failure modes.

## Interpretation

R0 is a product-foundation decision, not a scientific claim that WebGPU and WebGL2 perform the same work. If PlayCanvas wins partly because it can use a better backend on target hardware, that is legitimate, but the report must say so.

Small FPS differences are not decisive. Prefer the candidate that gives the stronger combination of correctness, target-device performance, maintainability, debugging access and compatibility with the later physics/game pipeline.

## Exit

Write a short decision record containing:

- selected candidate;
- rejected candidate;
- exact evidence set;
- known limitations;
- conditions that would justify reopening the decision.

Then freeze/remove the losing active experiment. Do not preserve both behind an abstraction layer by default.
