"""Ilustraciones propias del catálogo y de la portada, generadas por código.

Reemplazan las fotografías de producto y el collage de la portada, que provenían de terceros
(sitio de la empresa y publicaciones de Mercado Libre) y se publicaban sin autorización (§3.6 de la
tesis). No usan ninguna imagen externa: solo formas geométricas, la paleta del sitio
(frontend/src/index.css) y una fuente del sistema.

Uso, desde la raíz del repositorio:  python docs/assets/illustrations/generate.py
Escribe los mismos nombres de archivo que ya referencian la base y el frontend, de modo que no hace
falta tocar los imageUrl guardados:
  backend/uploads/<archivo>  y  frontend/public/products/<archivo>  (cinco productos)
  frontend/src/assets/hero-banner.jpg                           (portada)
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SS = 2  # supermuestreo para bordes suaves

CREAM = (251, 251, 251)
PAPER = (244, 241, 230)
GOLD = (202, 188, 107)
GOLD_LIGHT = (233, 228, 195)
GOLD_DARK = (168, 157, 79)
DARK = (27, 27, 27)
DARK2 = (45, 45, 45)
RED = (192, 57, 43)
RED_DARK = (150, 40, 30)
GREEN = (86, 130, 60)
PEACH = (240, 160, 75)
PEACH_BLUSH = (226, 110, 70)
SYRUP = (250, 214, 140)


def font(size, bold=True):
    names = ['arialbd.ttf', 'Arial Bold.ttf', 'DejaVuSans-Bold.ttf'] if bold else ['arial.ttf', 'Arial.ttf', 'DejaVuSans.ttf']
    for n in names:
        for d in ('C:/Windows/Fonts', '/usr/share/fonts/truetype/dejavu', '/Library/Fonts'):
            p = os.path.join(d, n)
            if os.path.exists(p):
                return ImageFont.truetype(p, size * SS)
    return ImageFont.load_default()


def s(*v):
    return tuple(int(round(x * SS)) for x in v)


def tomato(d, cx, cy, r):
    d.ellipse(s(cx - r, cy - r * 0.9, cx + r, cy + r * 0.9), fill=RED)
    d.ellipse(s(cx - r * 0.55, cy - r * 0.6, cx - r * 0.15, cy - r * 0.25), fill=(220, 110, 95))  # brillo
    for a in range(5):
        ang = math.radians(a * 72 - 90)
        x2, y2 = cx + math.cos(ang) * r * 0.45, cy - r * 0.8 + math.sin(ang) * r * 0.25
        d.line(s(cx, cy - r * 0.8, x2, y2), fill=GREEN, width=int(r * 0.12 * SS))
    d.ellipse(s(cx - r * 0.1, cy - r * 0.9, cx + r * 0.1, cy - r * 0.7), fill=GREEN)


def peach(d, cx, cy, r, half=False):
    d.ellipse(s(cx - r, cy - r, cx + r, cy + r), fill=PEACH)
    d.pieslice(s(cx - r, cy - r, cx + r, cy + r), 200, 320, fill=PEACH_BLUSH)
    if half:
        d.ellipse(s(cx - r * 0.82, cy - r * 0.82, cx + r * 0.82, cy + r * 0.82), fill=SYRUP)
        d.ellipse(s(cx - r * 0.28, cy - r * 0.32, cx + r * 0.28, cy + r * 0.32), fill=(170, 85, 50))
    else:
        d.arc(s(cx - r * 0.2, cy - r, cx + r * 0.6, cy + r), 200, 300, fill=(205, 120, 60), width=int(r * 0.06 * SS))
        d.ellipse(s(cx + r * 0.05, cy - r * 1.25, cx + r * 0.65, cy - r * 0.85), fill=GREEN)


def can(d, x0, y0, x1, y1, jar=False):
    w = x1 - x0
    if jar:
        d.rounded_rectangle(s(x0 + w * 0.18, y0 - 70, x1 - w * 0.18, y0 + 10), radius=18 * SS, fill=GOLD_DARK)  # tapa
        d.rounded_rectangle(s(x0, y0, x1, y1), radius=90 * SS, fill=(205, 70, 55))
        d.rounded_rectangle(s(x0 + 18, y0 + 30, x0 + 48, y1 - 60), radius=14 * SS, fill=(225, 120, 105))
    else:
        d.rectangle(s(x0, y0, x1, y1), fill=DARK2)
        d.ellipse(s(x0, y0 - 38, x1, y0 + 38), fill=(120, 120, 120))
        d.ellipse(s(x0 + 14, y0 - 28, x1 - 14, y0 + 28), fill=(165, 165, 165))
        d.ellipse(s(x0, y1 - 38, x1, y1 + 38), fill=DARK2)
        d.rectangle(s(x0 + 22, y0 + 20, x0 + 46, y1 - 10), fill=(70, 70, 70))  # reflejo


def label(d, x0, y0, x1, y1, title, subtitle):
    d.rectangle(s(x0, y0, x1, y1), fill=GOLD)
    d.rectangle(s(x0, y0, x1, y0 + 10), fill=GOLD_DARK)
    d.rectangle(s(x0, y1 - 10, x1, y1), fill=GOLD_DARK)
    cx = (x0 + x1) / 2
    ft, fs = font(54), font(34, bold=False)
    d.text(s(cx, y1 - 92), title, font=ft, fill=DARK, anchor='mm')
    d.text(s(cx, y1 - 40), subtitle, font=fs, fill=DARK, anchor='mm')


def product(fname, title, subtitle, fruit, extra, jar=False):
    W = H = 1000
    im = Image.new('RGB', s(W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.ellipse(s(110, 110, 890, 890), fill=GOLD_LIGHT)
    x0, x1, y0, y1 = (310, 690, 250, 820) if not jar else (300, 700, 230, 830)
    can(d, x0, y0, x1, y1, jar=jar)
    label(d, x0, y0 + 150, x1, y0 + 470, title, subtitle)
    if fruit == 'tomato':
        tomato(d, 500, y0 + 255, 70)
    else:
        peach(d, 500, y0 + 255, 66, half=(extra == 'halves'))
    if extra == 'cubes':
        for i, (cx, cy) in enumerate([(200, 820), (250, 860), (770, 840), (820, 800), (735, 880)]):
            d.rounded_rectangle(s(cx - 26, cy - 26, cx + 26, cy + 26), radius=8 * SS, fill=RED if i % 2 else RED_DARK)
    elif extra == 'whole':
        tomato(d, 200, 800, 85)
        tomato(d, 800, 815, 70)
    elif extra == 'sauce':
        d.ellipse(s(130, 800, 330, 880), fill=RED_DARK)
        d.ellipse(s(150, 805, 310, 860), fill=RED)
        tomato(d, 820, 800, 75)
    elif extra == 'halves':
        peach(d, 190, 810, 75, half=True)
        peach(d, 815, 815, 70, half=True)
    elif extra == 'slices':
        for cx, cy, a in [(190, 820, 200), (260, 860, 230), (780, 830, 300), (830, 790, 330)]:
            d.pieslice(s(cx - 70, cy - 70, cx + 70, cy + 70), a, a + 70, fill=PEACH)
            d.pieslice(s(cx - 52, cy - 52, cx + 52, cy + 52), a + 4, a + 66, fill=SYRUP)
    im = im.resize((W, H), Image.LANCZOS)
    for folder in ('backend/uploads', 'frontend/public/products'):
        path = os.path.join(ROOT, folder, fname)
        ext = os.path.splitext(fname)[1].lower()
        if ext in ('.jpg', '.jpeg'):
            im.save(path, quality=88, optimize=True)
        elif ext == '.webp':
            im.save(path, quality=85, method=6)
        else:
            im.convert('P', palette=Image.ADAPTIVE, colors=128).save(path, optimize=True)
        print('ok', os.path.relpath(path, ROOT), os.path.getsize(path) // 1024, 'KiB')


def hero():
    W, H = 1816, 908
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    for y in range(H):  # degradé vertical crema → dorado claro
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(PAPER[i] * (1 - t) + GOLD_LIGHT[i] * t) for i in range(3)))
    big = Image.new('RGB', s(W, H), (0, 0, 0))
    big.paste(im.resize(s(W, H)))
    d = ImageDraw.Draw(big)
    # hileras de frutos en los bordes; el centro queda despejado para el óvalo de la marca
    for row in range(5):
        for col in range(14):
            cx = 70 + col * 130 + (65 if row % 2 else 0)
            cy = 80 + row * 190
            if 470 < cx < 1350 and 140 < cy < 780:
                continue
            if (row + col) % 3 == 0:
                peach(d, cx, cy, 52, half=(col % 2 == 0))
            else:
                tomato(d, cx, cy, 55)
    im = big.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    path = os.path.join(ROOT, 'frontend/src/assets/hero-banner.jpg')
    im.save(path, quality=82, optimize=True, progressive=True)
    print('ok', os.path.relpath(path, ROOT), os.path.getsize(path) // 1024, 'KiB')


if __name__ == '__main__':
    product('tomate-pure.jpg', 'TOMATE', 'Entero / puré', 'tomato', 'whole')
    product('tomate-cubetti.webp', 'TOMATE', 'En cubos', 'tomato', 'cubes')
    product('tomate-salsa.webp', 'SALSA', 'De tomate', 'tomato', 'sauce', jar=True)
    product('durazno-natural.webp', 'DURAZNO', 'En mitades', 'peach', 'halves')
    product('durazno-trozos.png', 'DURAZNO', 'En trozos', 'peach', 'slices')
    hero()
