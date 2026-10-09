"""Co-change between layers, from git history.

Counts commits that touch the frontend source, the n8n workflow exports and the
backend source, and which of them touch two layers at once. A commit that
changes two layers together is a sign that those layers had to evolve together.

Run from the repo root:  python docs/research/co-change/co-change.py
"""
import subprocess

LAYERS = {
    'frontend': lambda f: f.startswith('frontend/src/') or f == 'frontend/index.html',
    'n8n': lambda f: f.startswith('n8n/workflows/') and f.endswith('.json') and '_archive' not in f,
    'backend': lambda f: f.startswith('backend/src/') or f.startswith('backend/prisma/'),
}

log = subprocess.run(
    ['git', 'log', '--name-only', '--format=@@%h %ad %s', '--date=short'],
    capture_output=True, text=True, encoding='utf-8', check=True,
).stdout

commits = []
for line in log.splitlines():
    if line.startswith('@@'):
        commits.append({'head': line[2:], 'files': []})
    elif line.strip() and commits:
        commits[-1]['files'].append(line.strip())

touches = {c['head']: {name for name, test in LAYERS.items() if any(map(test, c['files']))} for c in commits}

print(f'commits: {len(commits)}')
for name in LAYERS:
    print(f'{name}: {sum(name in t for t in touches.values())}')
for a, b in (('frontend', 'n8n'), ('frontend', 'backend'), ('n8n', 'backend')):
    both = [h for h, t in touches.items() if {a, b} <= t]
    print(f'{a} + {b}: {len(both)}')
    for h in both:
        print(f'    {h}')
