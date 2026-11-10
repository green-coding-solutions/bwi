#!/usr/bin/env python3
"""Generate the display-size versions of the demo photos for the branch lab/c-images.

Reads the large PNG files in public/photos/ and writes one AVIF and one WebP file per
photo next to them. Needs Pillow 11.3 or newer with AVIF support (pip install pillow).

Usage: python3 scripts/make-small-photos.py
"""
from pathlib import Path

from PIL import Image

WIDTH = 800
PHOTOS = Path(__file__).resolve().parent.parent / "public" / "photos"
FORMATS = {
    "avif": {"quality": 60, "speed": 6},
    "webp": {"quality": 75, "method": 6},
}


def main():
    for png in sorted(PHOTOS.glob("foto-?.png")):
        with Image.open(png) as img:
            height = round(img.height * WIDTH / img.width)
            small = img.convert("RGB").resize((WIDTH, height), Image.LANCZOS)
        for extension, options in FORMATS.items():
            path = png.with_name(f"{png.stem}-{WIDTH}.{extension}")
            small.save(path, **options)
            print(f"{path.name}: {path.stat().st_size / 1e3:.0f} kB")


if __name__ == "__main__":
    main()
