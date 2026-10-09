"""Exact two-sided Mann-Whitney U test and ranges, original vs new site.

For every paired batch folder given, compares the per-run values of the
original site against the new site for Performance and LCP, per profile.
With 5 runs per site, complete separation gives the smallest possible
p-value, 2/252 = 0.0079.

Usage: python compare.py paired-2026-10-07 paired-2026-10-08
"""
import glob
import json
import sys

from scipy.stats import mannwhitneyu

PAIRS = [
    ('mobile', 'original', 'new-hosted'),
    ('desktop', 'original', 'new-hosted'),
    ('desktop', 'original-std', 'new-hosted-std'),
]


def values(folder, label, device, metric):
    out = []
    for path in sorted(glob.glob(f'results/{folder}/{label}-{device}-*.json')):
        report = json.load(open(path, encoding='utf-8'))
        if metric == 'performance':
            out.append(round(report['categories']['performance']['score'] * 100))
        else:
            out.append(round(report['audits']['largest-contentful-paint']['numericValue']))
    return out


for folder in sys.argv[1:]:
    print(f'== {folder}')
    for device, orig, new in PAIRS:
        for metric in ('performance', 'lcp'):
            a, b = values(folder, orig, device, metric), values(folder, new, device, metric)
            if not a or not b:
                continue
            p = mannwhitneyu(a, b, alternative='two-sided', method='exact').pvalue
            sep = 'disjoint' if max(a) < min(b) or max(b) < min(a) else 'overlap'
            print(f'{device:7} {orig:13} vs {new:15} {metric:11} '
                  f'{min(a)}-{max(a)} vs {min(b)}-{max(b)}  n={len(a)}/{len(b)}  p={p:.4f}  {sep}')
