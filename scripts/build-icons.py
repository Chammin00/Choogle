#!/usr/bin/env python3
"""
Deterministic generator for the Choogle Browser icon suite.
Renders a supersampled 2048x2048 geometric compass-aperture 'C' emblem
and exports multi-resolution Windows .ico, PNG assets, and SVG master.
"""

import math
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "icons"
OUT_DIR.mkdir(parents=True, exist_ok=True)

SIZE = 2048
CENTER = SIZE / 2.0


def ring_arc_points(cx, cy, r_outer, r_inner, start_deg, end_deg, steps=240):
    pts = []
    for i in range(steps + 1):
        a = math.radians(start_deg + (end_deg - start_deg) * (i / steps))
        pts.append((cx + r_outer * math.cos(a), cy + r_outer * math.sin(a)))
    for i in range(steps, -1, -1):
        a = math.radians(start_deg + (end_deg - start_deg) * (i / steps))
        pts.append((cx + r_inner * math.cos(a), cy + r_inner * math.sin(a)))
    return pts


def draw_choogle_emblem(size=SIZE):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")

    # Outer squircle background (#0B1120) with crisp chamfered corners
    pad = int(size * 0.045)
    radius = int(size * 0.225)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=radius,
        fill=(11, 17, 32, 255),
    )

    # Inner deep navy plate (#131E36)
    pad2 = int(size * 0.085)
    radius2 = int(size * 0.195)
    draw.rounded_rectangle(
        [pad2, pad2, size - pad2, size - pad2],
        radius=radius2,
        fill=(19, 30, 54, 255),
    )

    # Subtle outer gold hairline border (#C8A96E)
    border_w = max(8, int(size * 0.018))
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=radius,
        outline=(200, 169, 110, 210),
        width=border_w,
    )

    # Subtle inner geometric precision guide ring (#1B2A4A / #2C4170)
    guide_r_out = size * 0.365
    guide_r_in = size * 0.352
    draw.polygon(
        ring_arc_points(CENTER, CENTER, guide_r_out, guide_r_in, 0, 360, steps=240),
        fill=(44, 65, 112, 160),
    )

    # Primary geometric 'C' compass ring in warm gold (#DFBA73)
    # Gap on right side from -38 deg to +38 deg -> draw from 38 deg to 322 deg
    c_outer = size * 0.325
    c_inner = size * 0.205
    draw.polygon(
        ring_arc_points(CENTER, CENTER, c_outer, c_inner, 38, 322, steps=300),
        fill=(223, 186, 115, 255),
    )

    # Inner shadow bevel along C interior (#C8A96E)
    c_mid_in = size * 0.205
    c_mid_out = size * 0.232
    draw.polygon(
        ring_arc_points(CENTER, CENTER, c_mid_out, c_mid_in, 38, 322, steps=300),
        fill=(185, 146, 79, 255),
    )

    # Compass needle / aperture prism pointing right inside the C core
    # 4-point asymmetric compass diamond centered slightly left-to-right for search optics
    cx = CENTER + size * 0.03
    cy = CENTER
    tip_r = size * 0.145
    tip_l = size * 0.095
    tip_v = size * 0.095
    diamond = [
        (cx + tip_r, cy),       # Right focal pointer
        (cx - size * 0.01, cy + tip_v),
        (cx - tip_l, cy),
        (cx - size * 0.01, cy - tip_v),
    ]
    draw.polygon(diamond, fill=(240, 212, 150, 255))

    # Inner navy precision core inside compass needle
    inner_r = size * 0.042
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        fill=(11, 17, 32, 255),
    )
    pin_r = size * 0.018
    draw.ellipse(
        [cx - pin_r, cy - pin_r, cx + pin_r, cy + pin_r],
        fill=(223, 186, 115, 255),
    )

    return img


def write_svg_master():
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none">
  <defs>
    <linearGradient id="choogle-bg" x1="24" y1="20" x2="232" y2="236" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#172442"/>
      <stop offset="100%" stop-color="#090E1A"/>
    </linearGradient>
    <linearGradient id="choogle-gold" x1="48" y1="48" x2="208" y2="208" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F2D492"/>
      <stop offset="55%" stop-color="#DFBA73"/>
      <stop offset="100%" stop-color="#B9924F"/>
    </linearGradient>
  </defs>
  <rect x="12" y="12" width="232" height="232" rx="56" fill="url(#choogle-bg)" stroke="#C8A96E" stroke-width="4.5" stroke-opacity="0.82"/>
  <rect x="22" y="22" width="212" height="212" rx="48" fill="#131E36" fill-opacity="0.72"/>
  <circle cx="128" cy="128" r="92" stroke="#2C4170" stroke-width="3" stroke-opacity="0.7"/>
  <path d="M193.6 179.4A83.2 83.2 0 1 1 193.6 76.6L169.3 95.8A52.5 52.5 0 1 0 169.3 160.2Z" fill="url(#choogle-gold)"/>
  <polygon points="172.8,128 133.1,152.3 111.4,128 133.1,103.7" fill="#F0D496"/>
  <circle cx="135.7" cy="128" r="10.8" fill="#0B1120"/>
  <circle cx="135.7" cy="128" r="4.6" fill="#DFBA73"/>
</svg>
"""
    (OUT_DIR / "choogle-mark.svg").write_text(svg, encoding="utf-8")


def main():
    master = draw_choogle_emblem(SIZE)

    png_sizes = [512, 256, 128, 32]
    for s in png_sizes:
        resized = master.resize((s, s), Image.Resampling.LANCZOS)
        resized.save(OUT_DIR / f"choogle-{s}.png", format="PNG", optimize=True)

    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_frames = [master.resize(sz, Image.Resampling.LANCZOS) for sz in ico_sizes]
    # Pillow multi-size ICO export saves all appended frames cleanly when passed via append_images from 256px base
    ico_base = ico_frames[-1]
    ico_rest = ico_frames[:-1]
    ico_base.save(
        OUT_DIR / "choogle.ico",
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_rest,
    )

    write_svg_master()
    print(f"Generated Choogle icon suite in {OUT_DIR}")


if __name__ == "__main__":
    main()
