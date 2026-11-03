#!/usr/bin/env python3
"""Generate the four large demo photos in public/photos/.

The images are synthetic: a colour gradient, a few shapes, a label and
fine noise. The noise is what makes PNG compress badly, so every file
ends up at roughly 2 MB. Needs Pillow (pip install pillow).

Usage: python3 scripts/make-photos.py
"""
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

WIDTH, HEIGHT = 2400, 1600
NOISE = 4  # grain amplitude, higher means bigger files
OUT = Path(__file__).resolve().parent.parent / "public" / "photos"

# (sky top, sky bottom, ground) per photo
PALETTES = [
    ((40, 90, 170), (250, 200, 140), (60, 120, 60)),
    ((20, 30, 80), (200, 110, 150), (90, 70, 50)),
    ((120, 180, 230), (230, 240, 250), (150, 170, 90)),
    ((70, 40, 110), (250, 150, 80), (40, 70, 90)),
]


def mix(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def make_photo(number, palette, rng):
    top, bottom, ground = palette
    img = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    for y in range(HEIGHT):
        draw.line([(0, y), (WIDTH, y)], fill=mix(top, bottom, y / HEIGHT))

    sun_x, sun_y = rng.randint(1200, WIDTH - 300), rng.randint(200, 600)
    draw.ellipse([sun_x - 150, sun_y - 150, sun_x + 150, sun_y + 150], fill=(255, 235, 180))

    for layer in range(3):
        base = HEIGHT - 500 + layer * 150
        points = [(0, HEIGHT)]
        for x in range(0, WIDTH + 200, 200):
            points.append((x, base + rng.randint(-120, 120)))
        points.append((WIDTH, HEIGHT))
        draw.polygon(points, fill=mix(ground, (0, 0, 0), layer * 0.2))

    font = ImageFont.load_default(size=220)
    label = f"Foto {number}"
    draw.text((123, 103), label, font=font, fill=(0, 0, 0))
    draw.text((115, 95), label, font=font, fill=(255, 255, 255))

    # Film grain in 2x2 blocks, centred on 128 and added with an offset of -128.
    size = (WIDTH // 2, HEIGHT // 2)
    raw = Image.frombytes("RGB", size, rng.randbytes(size[0] * size[1] * 3))
    noise = raw.point(lambda v: 128 + (v - 128) * NOISE // 128).resize((WIDTH, HEIGHT), Image.NEAREST)
    return ImageChops.add(img, noise, 1.0, -128)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for number, palette in enumerate(PALETTES, start=1):
        path = OUT / f"foto-{number}.png"
        make_photo(number, palette, random.Random(number)).save(path)
        print(f"{path.name}: {path.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
