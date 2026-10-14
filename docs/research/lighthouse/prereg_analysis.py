"""Análisis prerregistrado (docs/research/prerregistro-2026-10/PRERREGISTRO.md §2.4).

Mann-Whitney U exacta y unilateral en la dirección de la hipótesis (nueva mejor que original:
mayor Performance, menor LCP), k = 4 comparaciones, Bonferroni α = 0,05 / 4 = 0,0125.
Informa además medianas, rangos y las categorías no decisorias (Accessibility, CLS, TBT, LCP móvil).

Uso: python prereg_analysis.py <carpeta> <label_original> <label_nueva>
     python prereg_analysis.py prereg-catalogo-2026-10-14 original-productos new-catalogo
"""
import glob
import json
import statistics
import sys

from scipy.stats import mannwhitneyu

ALPHA = 0.05 / 4
folder, orig, new = sys.argv[1:4]


def runs(label, device):
    out = []
    for path in sorted(glob.glob(f'results/{folder}/{label}-{device}-*.json')):
        r = json.load(open(path, encoding='utf-8'))
        out.append({
            'performance': round(r['categories']['performance']['score'] * 100),
            'accessibility': round(r['categories']['accessibility']['score'] * 100),
            'lcp': round(r['audits']['largest-contentful-paint']['numericValue']),
            'cls': round(r['audits']['cumulative-layout-shift']['numericValue'], 3),
            'tbt': round(r['audits']['total-blocking-time']['numericValue']),
            'version': r['lighthouseVersion'],
        })
    return out


def lcp_category(ms):
    return 'Bueno' if ms <= 2500 else 'Necesita mejora' if ms <= 4000 else 'Pobre'


significant = 0
contrary = False
print(f'== {folder}: {new} vs {orig} (α por comparación = {ALPHA:.4f})')
for device in ('mobile', 'desktop'):
    a, b = runs(orig, device), runs(new, device)
    print(f'-- {device}: n = {len(a)}/{len(b)}, Lighthouse {sorted({x["version"] for x in a + b})}')
    for metric, alt in (('performance', 'greater'), ('lcp', 'less')):
        va, vb = [x[metric] for x in a], [x[metric] for x in b]
        p = mannwhitneyu(vb, va, alternative=alt, method='exact').pvalue
        ma, mb = statistics.median(va), statistics.median(vb)
        wrong_way = (mb < ma) if alt == 'greater' else (mb > ma)
        contrary |= wrong_way
        ok = p <= ALPHA and not wrong_way
        significant += ok
        print(f'   {metric:12} original {ma:>7} [{min(va)}–{max(va)}]  nueva {mb:>7} [{min(vb)}–{max(vb)}]'
              f'  p unilateral = {p:.4f}  {"SIGNIFICATIVA" if ok else "no significativa"}'
              f'{"  (DIRECCIÓN CONTRARIA)" if wrong_way else ""}')
    for metric in ('accessibility', 'cls', 'tbt'):
        print(f'   {metric:12} original {statistics.median([x[metric] for x in a])}'
              f'  nueva {statistics.median([x[metric] for x in b])}  (no decisoria)')
    if device == 'mobile':
        m = statistics.median([x['lcp'] for x in b])
        print(f'   LCP móvil de la página nueva: {m} ms → {lcp_category(m)} (no decisoria)')

verdict = ('REFUTADA' if contrary or significant == 0
           else 'CONFIRMADA' if significant == 4 else 'CONFIRMADA PARCIALMENTE')
print(f'== Comparaciones significativas: {significant}/4 → hipótesis {verdict}')
