#!/usr/bin/env python3
"""Chroma-key staff portraits to transparent PNG, then emit 320/640 web copies.

Samples the actual backdrop color from the corners because the generator
does not return a perfect #FF00FF field.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "art" / "staff"
WEB = ROOT / "public" / "images" / "staff"
ASSETS = Path.home() / ".cursor/projects/Users-nickcalcutti-Documents-Dev-Vibe-Dev-Tycoon/assets"
THRESH = 58
SOFT = 28


def sample_key(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    pad = max(16, min(h, w) // 24)
    corners = np.concatenate([
        rgb[:pad, :pad].reshape(-1, 3),
        rgb[:pad, -pad:].reshape(-1, 3),
        rgb[-pad:, :pad].reshape(-1, 3),
        rgb[-pad:, -pad:].reshape(-1, 3),
    ])
    return np.median(corners, axis=0)


def key_backdrop(im: Image.Image) -> Image.Image:
    rgba = np.array(im.convert("RGBA"))
    rgb = rgba[:, :, :3].astype(np.float32)
    key = sample_key(rgb)
    dist = np.sqrt(((rgb - key) ** 2).sum(axis=2))
    # Also treat high-R low-G backdrop variants as transparent.
    chroma = (rgb[:, :, 0] > 160) & (rgb[:, :, 1] < 70) & (rgb[:, :, 2] > 70)
    alpha = np.full(dist.shape, 255.0, dtype=np.float32)
    alpha[np.logical_or(dist < THRESH, chroma)] = 0
    band = np.logical_and(dist >= THRESH, dist < THRESH + SOFT)
    alpha[band] = np.minimum(alpha[band], 255.0 * (dist[band] - THRESH) / SOFT)
    rgba[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(rgba)


def resize(im: Image.Image, size: int) -> Image.Image:
    return im.resize((size, size), Image.Resampling.LANCZOS)


def process(staff_id: str, source: Path) -> None:
    keyed = key_backdrop(Image.open(source))
    original = ART / f"{staff_id}-v1.png"
    keyed.save(original, "PNG")
    WEB.mkdir(parents=True, exist_ok=True)
    resize(keyed, 320).save(WEB / f"{staff_id}.png", "PNG")
    resize(keyed, 640).save(WEB / f"{staff_id}-640.png", "PNG")
    alpha = np.array(keyed)[:, :, 3]
    print(f"{staff_id} transparent={alpha.mean()/255:.0%} source={source.name}")


def find_source(staff_id: str) -> Path:
    matches = sorted(ASSETS.glob(f"{staff_id}*.png"))
    if matches:
        return matches[-1]
    raw = ART / f"{staff_id}-v1-raw.png"
    if raw.exists():
        return raw
    raise SystemExit(f"missing source for {staff_id}")


def main(argv: list[str]) -> None:
    roster = json.loads((ART / "wave2-roster.json").read_text())
    ids = argv or [person["id"] for person in roster["people"]]
    for staff_id in ids:
        process(staff_id, find_source(staff_id))


if __name__ == "__main__":
    main(sys.argv[1:])
