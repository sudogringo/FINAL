"""Acuerdo de la codificación del Estudio 1: exacto por unidad y κ de Cohen por presencia de código.

Uso (desde esta carpeta): python kappa.py > kappa.txt
- Unidad: empresa × pregunta (25). Acuerdo exacto: mismo conjunto de códigos.
- κ: cada celda unidad × código de la pregunta (120 celdas) se trata como presencia/ausencia.
  La mayoría de las celdas son ausencias en ambos codificadores, lo que eleva el acuerdo observado;
  κ corrige ese efecto por azar.
- consenso_previo_control.csv es el consenso de la sección 4 de LIBRO_CODIGOS.md antes del
  control humano (commit 333d431). La propuesta NUEVO del autor cuenta como desacuerdo en el acuerdo
  exacto y se excluye del κ, porque el código no existía.
"""
import csv, re, sys
sys.stdout.reconfigure(encoding="utf-8")


def load(fn):
    return {(r['id'], r['pregunta']): {c.strip() for c in r['codigos'].split(';') if c.strip()}
            for r in csv.DictReader(open(fn, encoding='utf-8'))}


lib = open('../LIBRO_CODIGOS.md', encoding='utf-8').read().split('## 2.')[0]
Q, q = {}, None
for line in lib.splitlines():
    m = re.match(r'### (\S+) —', line)
    if m:
        q = m.group(1)
    m = re.match(r'\| `([A-Z-]+)` \|', line)
    if m:
        Q.setdefault(q, []).append(m.group(1))
Q['P13'] = [c for c in Q['P13'] if c != 'SEGUIMIENTO']  # creado después del control humano


def report(X, Y, label, X_exact=None):
    """X_exact: conjuntos para el acuerdo exacto (con la propuesta NUEVO); X, para κ (sin ella)."""
    Xe = X_exact or X
    units = sorted(Y)
    exact = sum(Xe[k] == Y[k] for k in units)
    nonempty = [k for k in units if Xe[k] or Y[k]]
    exact_ne = sum(Xe[k] == Y[k] for k in nonempty)
    a = b = c = d = 0
    for k in units:
        for code in Q[k[1]]:
            x, y = code in X[k], code in Y[k]
            a += x and y; b += x and not y; c += y and not x; d += not x and not y
    n = a + b + c + d
    po = (a + d) / n
    pe = ((a + b) * (a + c) + (c + d) * (b + d)) / n ** 2
    print(f'{label}: exacto {exact}/{len(units)}; sin unidades vacías en ambos {exact_ne}/{len(nonempty)}; '
          f'κ (presencia de código, {n} celdas) = {(po - pe) / (1 - pe):.2f}')


A, B = load('codificador_A.csv'), load('codificador_B.csv')
H_raw = load('codificador_autor.csv')
H = {k: {c for c in v if not c.startswith('NUEVO')} for k, v in H_raw.items()}
C = load('consenso_previo_control.csv')
report(A, B, 'IA (A) frente a IA (B)')
report(H, C, 'Autor frente al consenso previo', X_exact=H_raw)
