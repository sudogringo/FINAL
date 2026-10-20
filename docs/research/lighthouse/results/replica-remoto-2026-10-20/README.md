# Replication of measurement D on another day (20/10/2026)

**Status: exploratory replication.** Not preregistered; it reuses the protocol of measurement D
(`../prereg-remoto-2026-10-16/`, PRERREGISTRO_R39.md, https://osf.io/fu58z) on a different day,
to address the pseudo-replication objection: the 16/10 runs were technical repetitions
in a single session.

- **Protocol (same as 16/10).** Index i runs original `/productos`, then `/api/health`
  (Render warm-up, `warmup.txt`), then the new `/catalogo`. Mobile uses the legacy profile
  (4× CPU), desktop uses `--profile=standard` (1× CPU). 5 runs per profile and Lighthouse 12.8.2,
  between 11:34 and 11:41 ART (`started.txt`, `finished.txt`).
- **Not the same artefact as 16/10.** The published site changed in between: free-licensed
  photos, text ≥14 px, consent and privacy notice (`commit.txt`, `deployed-assets.txt`).
  So this replicates the comparison, not the build.
- **Analysis.** `analysis.txt` is the unedited output of `prereg_analysis.py`, run with
  `PYTHONIOENCODING=utf-8`; the first attempt failed on the cp1252 console.

| | 16/10 original → new | 20/10 original → new |
|---|---|---|
| Mobile Performance | 57 → 96 | 47 → 94 |
| Mobile LCP (ms) | 14329 → 2302 | 13783 → 2373 |
| Desktop Performance | 72 → 98 | 72 → 98 |
| Desktop LCP (ms) | 3079 → 891 | 2858 → 930 |
| One-sided p (each of 4) | 0.0040 | 0.0040 |

The direction and size of all four differences repeat on the second day, and the mobile
LCP of the new page is again ≤ 2500 ms («Bueno»). These are still technical repetitions of
one pair of pages, now from two sessions on two days. They are not a sample of pages or of
users.
