# R0 Runtime Lab — owner-testable Phase A harness

Status: implementation candidate; browser/runtime evidence still required on owner hardware.

## Purpose

This is a deliberately small laboratory surface for the R0 renderer bake-off. It is not the game architecture and it is not a reusable renderer abstraction.

The harness holds only the pieces that must be common for a fair comparison:

- exact source identity;
- the same source-coordinate foreground byte range or the same raw PLY;
- the same viewport and DPR=1 baseline;
- the same source-space benchmark camera transformed into each runtime;
- the same lightweight Orbit/Fly navigation state;
- the same presentation-frame telemetry.

Spark and PlayCanvas remain separate candidate modules. The losing candidate is expected to be removed/frozen after R0.

## Pinned runtime candidates

- Spark 2.1.0 + Three.js 0.185.1, WebGL2.
- PlayCanvas Engine 2.21.2, WebGL2 baseline or optional `Best` mode (WebGPU first, WebGL2 fallback).

CDN URLs are version-pinned. They are intentionally runtime dependencies of this R0 experiment rather than permanent project architecture.

## Owner workflow

Double-click `URUCHOM_R0_LAB.cmd`.

A normal Windows file picker asks for the exact original Luma ZIP or PLY. The helper extracts a ZIP to a temporary directory when necessary and starts a dependency-free local Node server. The server verifies the complete PLY SHA-256 before exposing the LAB.

The browser opens automatically.

## Source modes

### Foreground

Default owner-facing mode. The server creates the already-verified foreground PLY as a virtual HTTP response: it changes only the vertex count in the header and streams exactly the first 1,013,122 source records. It does not create another ~251 MiB file on disk.

Expected foreground SHA-256 remains:

`a734ce660a9bfd08ad11605fb45f1691fee3fa0bfe87fbbdb32f4acc7748d112`

### Raw PLY

Streams the exact immutable 263,655,789-byte source. This is the strict source-compatibility mode and includes the 50,000-record shell whose structure is VERIFIED but semantic role is still only LIKELY.

## Interaction

- `Orbit`: left drag rotate, right-drag or Shift-drag pan, wheel zoom.
- `Fly`: click the viewport for pointer lock, WASD move, Q/E down/up, Shift faster, Esc releases the mouse.
- `Reset`: deterministic initial camera for the selected candidate.

The initial Reset view is defined once in source coordinates and transformed by each candidate, so both runtimes begin from the same source-space viewpoint. The navigation code is temporary benchmark input/control code and is intentionally shared only to reduce interaction bias between candidates.

## What the owner should evaluate

Do not reduce the test to FPS. For each runtime, note:

1. does the exact school scene load at all;
2. is the visual reconstruction credible or visibly corrupted;
3. does fast Orbit/Fly movement expose sorting glitches, hitching or transient bad frames;
4. does navigation remain responsive after the scene stabilizes;
5. what backend/load/FPS/p95 presentation-interval values are shown;
6. which runtime feels like the safer base for the later physically inhabited world.

A screenshot is useful, but direct owner perception is a separate evidence class and should be recorded explicitly.

## Known limitation before owner run

The assistant execution environment cannot resolve the external CDN hosts, so full browser rendering cannot be truthfully marked PASS here. Static syntax/server/source-stream checks can be performed locally, but actual Spark/PlayCanvas GPU evidence must come from a browser with network access.

This is an environment limitation, not evidence that either runtime works or fails.
