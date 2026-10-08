// Simulated product/contact data for VD2 latency runs. All synthetic — no real
// Golden Harvest customer data, per the project's "no real access" constraint.

// Productos del catálogo que crea backend/src/seed.ts (id = 'seed-' + nombre en
// minúsculas con guiones). Desde el 08/10/2026 POST /api/quotes rechaza ids
// inexistentes. El lote del 25/08/2026 usó ids de una plantilla anterior
// (vinos), que el backend de entonces aceptaba sin validar.
export const PRODUCTS = [
  { id: 'seed-tomate-entero-pelado', name: 'Tomate Entero Pelado', line: 'roja',   size: '1kg'  },
  { id: 'seed-salsa-clásica',        name: 'Salsa Clásica',        line: 'roja',   size: '250g' },
  { id: 'seed-doble-concentrado',    name: 'Doble Concentrado',    line: 'roja',   size: '4kg'  },
  { id: 'seed-mitades-en-almíbar',   name: 'Mitades en Almíbar',   line: 'dorada', size: '1kg'  },
  { id: 'seed-durazno-light',        name: 'Durazno Light',        line: 'dorada', size: '250g' },
  { id: 'seed-durazno-al-natural',   name: 'Durazno al Natural',   line: 'dorada', size: '4kg'  },
];

const FIRST_NAMES = ['Lucía', 'Martín', 'Sofía', 'Diego', 'Valentina', 'Nicolás', 'Camila', 'Federico'];
const LAST_NAMES  = ['Fernández', 'Gómez', 'Rodríguez', 'Pérez', 'Álvarez', 'Suárez', 'Romero', 'Ledesma'];
const EMPRESAS    = ['Distribuidora del Sur SRL', 'Almacén Norte', 'Almacén Gourmet SA', null];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Builds one synthetic quote payload, varying contact + items per run. */
export function buildQuotePayload(runIndex) {
  const nombre = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const email = `quote-latency-test-${runIndex}-${Date.now()}@example.test`;
  const itemCount = randomInt(1, 3);
  const items = Array.from({ length: itemCount }, () => {
    const p = pick(PRODUCTS);
    return { id: p.id, name: p.name, line: p.line, size: p.size, qty: randomInt(1, 12) };
  });

  return {
    sessionId: `latency-test-session-${runIndex}-${Date.now()}`,
    contact: {
      nombre,
      empresa: pick(EMPRESAS) ?? undefined,
      telefono: `+54911${randomInt(10000000, 99999999)}`,
      email,
      notas: 'Solicitud generada por script de medición VD2 (docs/research/quote-latency) — no es un lead real.',
    },
    items,
  };
}
