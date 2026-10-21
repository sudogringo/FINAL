"""Commits with a Claude co-author trailer, from git history.

Counts the commits whose message carries a "Co-Authored-By: Claude ..." trailer
(any Claude model), over the whole history of a ref. The trailer records that
an AI assistant took part in the change; it does not measure how many lines it
wrote, so the count is a proportion of commits, not of code or text.

Equivalent one-liners:
    git rev-list --count HEAD
    git rev-list --count -i --grep="Co-Authored-By: Claude" HEAD

Also breaks the counts down by month and by author name (%an), as git records them.

Run from the repo root:  python docs/research/ai-coauthorship/ai-coauthorship.py [ref]
"""
import re
import subprocess
import sys
from collections import Counter

ref = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
TRAILER = re.compile(r'^Co-Authored-By:\s*Claude\b', re.I | re.M)

log = subprocess.run(
    ['git', 'log', ref, '--format=%h%x1f%ad%x1f%an%x1f%B%x1e', '--date=format:%Y-%m'],
    capture_output=True, text=True, encoding='utf-8', check=True,
).stdout

total, ai = Counter(), Counter()
by_author, ai_author = Counter(), Counter()
for rec in log.split('\x1e'):
    if not rec.strip():
        continue
    _sha, month, author, body = rec.strip('\n').split('\x1f', 3)
    total[month] += 1
    by_author[author] += 1
    if TRAILER.search(body):
        ai[month] += 1
        ai_author[author] += 1

head = subprocess.run(['git', 'rev-parse', '--short', ref], capture_output=True, text=True, check=True).stdout.strip()
n, k = sum(total.values()), sum(ai.values())
print(f'ref {ref} ({head})')
print(f'commits: {n}')
print(f'con coautoria de Claude: {k} ({100 * k / n:.1f} %)')
print(f'sin coautoria de Claude: {n - k}')
for month in sorted(total):
    print(f'  {month}: {ai[month]} de {total[month]}')
print('por autor (nombre registrado en git):')
for author, count in by_author.most_common():
    print(f'  {author}: {count} commits, {ai_author[author]} con coautoria de Claude')
