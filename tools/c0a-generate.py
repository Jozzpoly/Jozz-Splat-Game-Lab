#!/usr/bin/env python3
"""Generate non-metric C0a geometry candidates from the exact verified Luma PLY.

This is an experimental structural proxy generator, not a collision-truth pipeline.
It intentionally works in immutable raw source coordinates and records every parameter.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from scipy import ndimage
from skimage.measure import marching_cubes
import trimesh

EXPECTED_SOURCE_SHA = "8e3d1e0b42d716d3f106ca86557c3c2bfbf034d5ee5905c1ed06aa265fabd5e3"
SOURCE_BYTES = 263_655_789
HEADER_BYTES = 1_533
RAW_SPLATS = 1_063_122
FOREGROUND_SPLATS = 1_013_122
FLOATS_PER_RECORD = 62

# Tightly bounded around the main school building. Units are raw source units.
ROI = np.array([
    [-1.90, 0.82],
    [1.08, 1.86],
    [-0.62, 0.52],
], dtype=np.float64)

CANDIDATES = {
    "conservative": {
        "voxel": 0.015,
        "alpha_min": 0.50,
        "max_scale": 0.04,
        "dilation": 1,
        "min_count": 1,
    },
    "balanced": {
        "voxel": 0.020,
        "alpha_min": 0.20,
        "max_scale": 0.04,
        "dilation": 1,
        "min_count": 1,
    },
    "permissive": {
        "voxel": 0.030,
        "alpha_min": 0.10,
        "max_scale": 0.06,
        "dilation": 1,
        "min_count": 1,
    },
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def verify_source(path: Path) -> None:
    if path.stat().st_size != SOURCE_BYTES:
        raise SystemExit(f"wrong source byte count: {path.stat().st_size} != {SOURCE_BYTES}")
    digest = sha256(path)
    if digest != EXPECTED_SOURCE_SHA:
        raise SystemExit(f"wrong source SHA-256: {digest}")


def build_candidate(roi_data: np.ndarray, cfg: dict) -> tuple[trimesh.Trimesh, dict]:
    points = roi_data[:, :3].astype(np.float64)
    opacity_raw = roi_data[:, 54].astype(np.float64)
    alpha = 1.0 / (1.0 + np.exp(-opacity_raw))
    scales = np.exp(roi_data[:, 55:58].astype(np.float64))
    max_scale = np.max(scales, axis=1)

    selected_mask = (alpha >= cfg["alpha_min"]) & (max_scale <= cfg["max_scale"])
    selected = points[selected_mask]

    voxel = float(cfg["voxel"])
    dims = np.ceil((ROI[:, 1] - ROI[:, 0]) / voxel).astype(int)
    indices = np.floor((selected - ROI[:, 0]) / voxel).astype(int)
    valid = np.all((indices >= 0) & (indices < dims), axis=1)
    indices = indices[valid]

    counts = np.zeros(tuple(dims), dtype=np.uint16)
    np.add.at(counts, (indices[:, 0], indices[:, 1], indices[:, 2]), 1)
    occupied = counts >= int(cfg["min_count"])
    occupied = ndimage.binary_dilation(occupied, iterations=int(cfg["dilation"]))

    labels, component_count = ndimage.label(occupied)
    sizes = np.bincount(labels.ravel())
    if component_count < 1:
        raise RuntimeError("candidate contains no connected occupied component")
    largest_label = 1 + int(np.argmax(sizes[1:]))
    occupied = labels == largest_label

    padded = np.pad(occupied.astype(np.float32), 1)
    vertices, faces, _, _ = marching_cubes(
        padded,
        level=0.5,
        spacing=(voxel, voxel, voxel),
    )
    vertices = vertices - voxel + ROI[:, 0]
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=True)

    stats = {
        "parameters": cfg,
        "selectedSplats": int(selected_mask.sum()),
        "gridDims": dims.tolist(),
        "occupiedVoxels": int(occupied.sum()),
        "vertices": int(len(mesh.vertices)),
        "faces": int(len(mesh.faces)),
        "watertight": bool(mesh.is_watertight),
        "boundsSource": mesh.bounds.tolist(),
    }
    return mesh, stats


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    source = args.source.resolve()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    verify_source(source)

    table = np.memmap(
        source,
        dtype="<f4",
        mode="r",
        offset=HEADER_BYTES,
        shape=(RAW_SPLATS, FLOATS_PER_RECORD),
    )
    foreground = table[:FOREGROUND_SPLATS]
    positions = foreground[:, :3]
    roi_mask = np.all((positions >= ROI[:, 0]) & (positions <= ROI[:, 1]), axis=1)
    roi_data = foreground[roi_mask]

    receipt = {
        "receiptVersion": 1,
        "gate": "C0a",
        "status": "EXPERIMENTAL_NON_METRIC_CANDIDATES",
        "sourceSha256": EXPECTED_SOURCE_SHA,
        "foregroundRecordCount": FOREGROUND_SPLATS,
        "metricStatus": "UNCALIBRATED_SOURCE_UNITS",
        "roiSourceBounds": {
            "x": ROI[0].tolist(),
            "y": ROI[1].tolist(),
            "z": ROI[2].tolist(),
        },
        "roiSplats": int(len(roi_data)),
        "roiDiagonalSource": float(np.linalg.norm(ROI[:, 1] - ROI[:, 0])),
        "generator": {
            "prototype": "CPU center-voxel union",
            "pythonPackages": {
                "numpy": np.__version__,
                "scipy": "1.17.0",
                "scikit-image": "0.26.0",
                "trimesh": trimesh.__version__,
            },
            "notes": [
                "Uses Gaussian centers, sigmoid(opacity), and maximum exp(scale) as structural filters.",
                "Does not use quaternion orientation or full anisotropic Gaussian density.",
                "Applies one binary dilation in raw source-unit voxel space.",
                "Meshes only the largest connected occupied voxel component.",
                "Outputs are geometry candidates, not collision truth.",
            ],
        },
        "candidates": {},
    }

    for name, cfg in CANDIDATES.items():
        mesh, stats = build_candidate(roi_data, cfg)
        path = output / f"{name}.glb"
        mesh.export(path)
        stats.update({
            "voxelFractionOfRoiDiagonal": float(cfg["voxel"] / np.linalg.norm(ROI[:, 1] - ROI[:, 0])),
            "bytes": path.stat().st_size,
            "sha256": sha256(path)
        })
        receipt["candidates"][name] = stats
        print(f"{name}: {stats['faces']} faces, {stats['sha256'][:12]}…")

    receipt_path = output / "c0a-candidates-receipt.json"
    receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(f"receipt: {receipt_path}")


if __name__ == "__main__":
    main()
