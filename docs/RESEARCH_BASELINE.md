# Research Baseline — 2026-08-15

This is a dated snapshot used to ground the first experiments. Re-check current primary sources before changing pinned versions or making claims that depend on latest state.

## PlayCanvas Engine

- Current checked release: `2.21.2`, released 2026-07-28.
- `2.21.0` added `KHR_gaussian_splatting` glTF extension support and SPZ Gaussian splat support.
- Release source: https://github.com/playcanvas/engine/releases

## SplatTransform

- Current checked release: `3.1.7`, released 2026-07-26.
- Current collision documentation describes sparse voxelization and generated collision meshes. Default voxel edge length is `0.05` world units, which is why metric calibration must precede physically meaningful tuning.
- Current docs distinguish outdoor `--voxel-floor-fill` from interior/exterior sealing workflows.
- Release source: https://github.com/playcanvas/splat-transform/releases
- Collision manual: https://developer.playcanvas.com/user-manual/splat-transform/collision/

## SOG / Streamed SOG

- PLY is documented as uncompressed source/interchange.
- SOG is documented as lossy runtime/delivery and typically about 15–20x smaller than equivalent PLY.
- Streamed SOG spatially chunks multiple LODs and is aimed at very large scenes/tens of millions of Gaussians and progressive loading.
- Formats: https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/
- Streamed SOG: https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/streamed-sog/

## Spark

- Current checked stable release: `2.1.0`, released 2026-05-18.
- Peer dependency: Three.js `>=0.180.0`.
- Supports major splat formats including PLY and SOG and integrates conventional Three.js meshes with splats.
- Current open issue #394 (2026-07-09) reports failure with Three.js `WebGPURenderer` even with `forceWebGL`; therefore R0 uses `WebGLRenderer` as the safe Spark baseline unless new evidence changes this.
- Releases: https://github.com/sparkjsdev/spark/releases
- Repository/features: https://github.com/sparkjsdev/spark
- WebGPURenderer issue: https://github.com/sparkjsdev/spark/issues/394

## Box3D

- Current checked release: `0.1.0`, released 2026-06-30.
- Upstream explicitly calls the release alpha software.
- Triangle mesh shapes are intended for static bodies; mesh cooking builds a BVH and can identify shared edges for adjacency/smoother normals.
- Character mover exists but its API is explicitly experimental.
- Releases: https://github.com/erincatto/box3d/releases
- Collision docs: https://box2d.org/documentation3d/md_collision.html
- Character docs: https://box2d.org/documentation3d/md_character.html

## Public game feasibility evidence

PlayCanvas published `Turning a Gaussian Splat Into a Videogame` on 2026-04-22, documenting a browser FPS over a captured splat with a generated collision mesh, conventional dynamic/game entities, navmesh and lighting support. This proves broad feasibility but does not prove that our specific Luma capture has trustworthy collision geometry or that our desired sandbox experience is good.

Source: https://blog.playcanvas.com/turning-a-gaussian-splat-into-a-videogame/
