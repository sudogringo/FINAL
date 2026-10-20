# Exploratory re-measure of the published home page (20/10/2026)

**Status: exploratory.** Not preregistered and with no decision rule. It describes the
home page as delivered after R48 and is compared against the 14/10 batch
(`../prereg-portada-2026-10-14/`, `new-hosted-*`) only descriptively.

- **URL:** https://sudogringo.github.io/FINAL/ (GitHub Pages). See `deployed-assets.txt`
  and `commit.txt` (c0fc89b).
- **What changed since 14/10:**
  - free-licensed hero photo collage (318 KB, was 601 KB);
  - fade-in removed from the hero `h1` (the LCP element);
  - text ≥14 px;
  - "Mendoza · Argentina" and an academic notice.
- **Method:** `run-audit.mjs` with the same settings as the 14/10 batch and Lighthouse 12.8.2,
  5 runs per profile on the same build:
  - **mobile:** legacy profile, 4× CPU, Slow 4G;
  - **desktop:** `--profile=standard`, 1× CPU, which is what the 14/10 desktop batch used.
- **Discarded desktop runs:** `new-hosted-legacy-desktop-*` were run first with the legacy
  profile (4× CPU) by mistake. They are not comparable with 14/10 and are kept only for
  transparency.

| | 14/10 median | 20/10 median |
|---|---|---|
| Mobile Performance | 76 | 86 |
| Mobile LCP (ms) | 5815 | 3851 |
| Desktop Performance | 93 | 96 |
| Desktop LCP (ms) | 1589 | 1094 |
| Accessibility (both) | 100 | 100 |

The LCP element is still the hero `h1` («SILVIA»). In mobile run 2 the LCP render delay
falls from about 5.2 s (14/10 runs 3–5) to about 3.2 s. Mobile LCP is still «Necesita
mejora» (>2500 ms), and five technical repetitions of one page do not support inference.
