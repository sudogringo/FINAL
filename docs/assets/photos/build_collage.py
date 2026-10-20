"""Build the Golden Harvest hero collage and the five product images from the
downloaded originals (see docs/assets/photos/CREDITS.md for sources and licences).

Usage:
    python -I build_collage.py <raw_dir> <out_root>

<raw_dir>  folder with the original downloads, named as in CREDITS.md
<out_root> repo-shaped output root; the script writes
           frontend/src/assets/hero-banner.jpg
           frontend/public/products/<5 files>
           backend/uploads/<same 5 files, byte-identical>

Every image is cropped in "cover" mode: first a hand-picked region of interest
(fractions of the original width/height, to keep the subject centred and leave
out text or clutter), then a centred crop to the target aspect ratio and a
Lanczos resize. Requires Pillow (with WebP support).
"""
import os
import shutil
import sys

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None

# ---------------------------------------------------------------- hero collage
HERO_W, HERO_H = 1816, 908
GUTTER = 4
COLS, ROWS = 3, 2
HERO_QUALITY = 82
HERO_MAX_BYTES = 350 * 1024

# (cell, raw file, region of interest as (left, top, right, bottom) fractions)
HERO_CELLS = [
    ("A1", "hero1_peach_orchard.jpg", (0.00, 0.00, 0.64, 0.86)),
    ("B1", "hero2_tomato_vine.jpg", (0.00, 0.00, 1.00, 1.00)),
    ("C1", "hero3_peach_crates.jpg", (0.04, 0.05, 0.96, 0.94)),
    ("A2", "hero4_processing.jpg", (0.36, 0.30, 0.78, 0.615)),
    ("B2", "hero5_tomatoes_bulk.jpg", (0.00, 0.00, 1.00, 1.00)),
    ("C2", "hero6_peach_slices.jpg", (0.10, 0.17, 0.90, 0.93)),
]

# ------------------------------------------------------------- product images
# (output name, raw file, region of interest, size, format options)
PRODUCTS = [
    ("durazno-natural.webp", "prod_durazno_amarillo.jpg", (0.0, 0.0, 1.0, 1.0), (1000, 1000),
     dict(format="WEBP", quality=82, method=6)),
    ("durazno-trozos.png", "prod_durazno_trozos.jpg", (0.03, 0.0, 0.94, 1.0), (600, 600),
     dict(format="PNG", optimize=True)),
    ("tomate-cubetti.webp", "prod_cubetti.jpg", None, (800, 600),
     dict(format="WEBP", quality=82, method=6)),
    ("tomate-pure.jpg", "prod_pure.jpg", (0.225, 0.0, 0.975, 1.0), (1000, 1000),
     dict(format="JPEG", quality=85, optimize=True, progressive=True)),
    ("tomate-salsa.webp", "prod_salsa.jpg", "extend", (803, 1200),
     dict(format="WEBP", quality=82, method=6)),
]
# region for tomate-cubetti, set per source file
CUBETTI_ROI = {
    "prod_cubetti.jpg": (0.132, 0.055, 0.889, 0.927),
}


def load(raw_dir, name):
    im = Image.open(os.path.join(raw_dir, name))
    return ImageOps.exif_transpose(im).convert("RGB")


def roi(im, box):
    if box is None:
        return im
    w, h = im.size
    l, t, r, b = box
    return im.crop((round(l * w), round(t * h), round(r * w), round(b * h)))


def cover(im, size):
    """Centred crop to the target aspect, then resize (CSS object-fit: cover)."""
    return ImageOps.fit(im, size, method=Image.LANCZOS, centering=(0.5, 0.5))


def extend_vertical(im, target_aspect, sample_rows=30, fade=120):
    """Make a landscape photo with a plain dark backdrop taller by extending the
    backdrop above it: solid colour sampled from the top rows, blended in with a
    vertical fade. Used for the sauce jar so it stays whole in a portrait frame."""
    w, h = im.size
    new_h = round(w / target_aspect)
    if new_h <= h:
        return im
    strip = im.crop((0, 0, w, sample_rows)).resize((1, 1), Image.LANCZOS)
    colour = strip.getpixel((0, 0))
    canvas = Image.new("RGB", (w, new_h), colour)
    offset = new_h - h
    canvas.paste(im, (0, offset))
    # soften the seam: fade the first `fade` rows of the photo into the colour
    solid = Image.new("RGB", (w, fade), colour)
    band = im.crop((0, 0, w, fade))
    mask = Image.linear_gradient("L").resize((w, fade))  # 0 at top -> 255 at bottom
    canvas.paste(Image.composite(band, solid, mask), (0, offset))
    return canvas


def cell_sizes(total, n, gutter):
    """Split `total` px into n cells with gutters so the grid closes exactly."""
    free = total - gutter * (n - 1)
    base, extra = divmod(free, n)
    sizes = [base] * n
    for i in range(extra):  # spread leftover px symmetrically from the outside in
        sizes[i if i % 2 == 0 else n - 1 - i // 2] += 1
    return sizes


def build_hero(raw_dir, out_path):
    widths = cell_sizes(HERO_W, COLS, GUTTER)
    heights = cell_sizes(HERO_H, ROWS, GUTTER)
    canvas = Image.new("RGB", (HERO_W, HERO_H), (255, 255, 255))
    for cell, name, box in HERO_CELLS:
        col, row = "ABC".index(cell[0]), int(cell[1]) - 1
        x = sum(widths[:col]) + GUTTER * col
        y = sum(heights[:row]) + GUTTER * row
        tile = cover(roi(load(raw_dir, name), box), (widths[col], heights[row]))
        canvas.paste(tile, (x, y))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    q = HERO_QUALITY
    while True:
        canvas.save(out_path, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(out_path) <= HERO_MAX_BYTES or q <= 60:
            break
        q -= 2
    print(f"hero-banner.jpg {canvas.size} q={q} cells={widths}x{heights} {os.path.getsize(out_path)} B")


def build_products(raw_dir, out_root):
    pub = os.path.join(out_root, "frontend", "public", "products")
    up = os.path.join(out_root, "backend", "uploads")
    os.makedirs(pub, exist_ok=True)
    os.makedirs(up, exist_ok=True)
    for out_name, raw_name, box, size, opts in PRODUCTS:
        im = load(raw_dir, raw_name)
        if box == "extend":
            # keep the whole jar: crop around it, then extend the dark backdrop upwards
            w, h = im.size
            im = im.crop((round(0.38 * w), 0, round(0.97 * w), h))
            im = extend_vertical(im, size[0] / size[1])
        else:
            im = roi(im, box if out_name != "tomate-cubetti.webp" else CUBETTI_ROI[raw_name])
        im = cover(im, size)
        dst = os.path.join(pub, out_name)
        im.save(dst, **opts)
        shutil.copyfile(dst, os.path.join(up, out_name))
        print(f"{out_name} {im.size} {os.path.getsize(dst)} B")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    raw_dir, out_root = sys.argv[1], sys.argv[2]
    build_hero(raw_dir, os.path.join(out_root, "frontend", "src", "assets", "hero-banner.jpg"))
    build_products(raw_dir, out_root)


if __name__ == "__main__":
    main()
