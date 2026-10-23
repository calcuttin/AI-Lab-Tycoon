#!/usr/bin/env python3
"""Copy generated PNGs into art/ and public JPEG sizes."""
from pathlib import Path
import subprocess, sys
ASSETS = Path.home() / ".cursor/projects/Users-nickcalcutti-Documents-Dev-Vibe-Dev-Tycoon/assets"
ROOT = Path(__file__).resolve().parents[2]

def sips(src, out, *args):
    subprocess.run(["sips", *args, str(src), "--out", str(out)], check=True, stdout=subprocess.DEVNULL)

def staff(staff_id: str):
    src = ASSETS / f"{staff_id}-v1.png"
    dest = ROOT / "art/staff" / f"{staff_id}-v1.png"
    dest.write_bytes(src.read_bytes())
    web = ROOT / "public/images/staff"
    sips(src, web / f"{staff_id}.jpg", "-z", "320", "320", "-s", "format", "jpeg", "-s", "formatOptions", "80")
    sips(src, web / f"{staff_id}-640.jpg", "-z", "640", "640", "-s", "format", "jpeg", "-s", "formatOptions", "80")
    for extra in (web / f"{staff_id}.png", web / f"{staff_id}-640.png"):
        extra.unlink(missing_ok=True)

def event(event_id: str):
    src = ASSETS / f"{event_id}-v1.png"
    dest = ROOT / "art/events" / f"{event_id}-v1.png"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(src.read_bytes())
    web = ROOT / "public/images/events"
    web.mkdir(parents=True, exist_ok=True)
    sips(src, web / f"{event_id}-1600.jpg", "-Z", "1600", "-s", "format", "jpeg", "-s", "formatOptions", "80")
    sips(src, web / f"{event_id}-640.jpg", "-Z", "640", "-s", "format", "jpeg", "-s", "formatOptions", "80")

if __name__ == "__main__":
    kind, *ids = sys.argv[1:]
    for item in ids:
        (staff if kind == "staff" else event)(item)
        print(item)
