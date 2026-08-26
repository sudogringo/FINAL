// Simulated product/contact data for VD2 latency runs. All synthetic — no real
// Golden Harvest customer data, per the project's "no real access" constraint.

export const PRODUCTS = [
  { id: 'malbec-750',       name: 'Malbec Reserva',        line: 'Reserva',   size: '750ml' },
  { id: 'cabernet-750',     name: 'Cabernet Sauvignon',    line: 'Clásica',   size: '750ml' },
  { id: 'torrontes-750',    name: 'Torrontés',             line: 'Clásica',   size: '750ml' },
  { id: 'blend-magnum-1500',name: 'Gran Blend',            line: 'Premium',   size: '1500ml' },
  { id: 'chardonnay-750',   name: 'Chardonnay',            line: 'Clásica',   size: '750ml' },
  { id: 'malbec-magnum',    name: 'Malbec Reserva',        line: 'Reserva',   size: '1500ml' },
];

const FIRST_NAMES = ['Lucía', 'Martín', 'Sofía', 'Diego', 'Valentina', 'Nicolás', 'Camila', 'Federico'];
const LAST_NAMES  = ['Fernández', 'Gómez', 'Rodríguez', 'Pérez', 'Álvarez', 'Suárez', 'Romero', 'Ledesma'];
const EMPRESAS    = ['Distribuidora del Sur SRL', 'Vinoteca Norte', 'Almacén Gourmet SA', null];

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
