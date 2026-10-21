# -*- coding: utf-8 -*-
"""Diferencia de medianas de Hodges-Lehmann (nueva - original) con su intervalo exacto, para los contrastes del catálogo.

Con 5 + 5 corridas hay 25 diferencias por pares. El estimador es su mediana, y el intervalo [d(3), d(23)] es el que
corresponde a la prueba exacta de Mann-Whitney bilateral con U crítico = 2: su confianza exacta es
1 - 2 * P(U <= 2) = 1 - 2 * 4/252 = 96,8 %. Describe la estabilidad de las repeticiones técnicas de un par de páginas,
no una población de sitios (tesis, §3.7).

Uso: python hodges_lehmann.py   (lee results/<lote>/*.json y escribe en la salida estándar)
"""
import glob, json, os, statistics, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
LOTES = [('prereg-catalogo-2026-10-14', 'new-catalogo'), ('prereg-remoto-2026-10-16', 'new-catalogo-remoto'),
         ('replica-remoto-2026-10-20', 'new-catalogo-remoto')]
METRICS = [('performance', lambda j: round(j['categories']['performance']['score'] * 100)),
           ('lcp', lambda j: j['audits']['largest-contentful-paint']['numericValue'])]


def runs(lote, prefix, profile, f):
    files = sorted(glob.glob(os.path.join(HERE, 'results', lote, f'{prefix}-{profile}-[0-9].json')))
    assert len(files) == 5, (lote, prefix, profile, len(files))
    return [f(json.load(open(p, encoding='utf-8'))) for p in files]


print('Hodges-Lehmann (nueva - original), intervalo exacto del 96,8 % = [d(3), d(23)] de las 25 diferencias')
for lote, new in LOTES:
    print(f'== {lote}')
    for profile in ('mobile', 'desktop'):
        for name, f in METRICS:
            a = runs(lote, 'original-productos', profile, f)
            b = runs(lote, new, profile, f)
            d = sorted(y - x for x in a for y in b)
            hl = statistics.median(d)
            fmt = (lambda v: f'{v:.0f}')
            print(f'   {profile:7s} {name:11s} HL = {fmt(hl):>7s}   IC 96,8 % [{fmt(d[2])}, {fmt(d[22])}]'
                  f'   medianas {fmt(statistics.median(a))} → {fmt(statistics.median(b))}')
