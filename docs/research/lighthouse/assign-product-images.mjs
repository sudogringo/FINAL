// Assigns the five seed product photos to the eight catalogue products through
// the admin API (PUT /api/products/admin/:id), the same path the admin panel uses.
// The original assignment (commit fd3018f, 26/06/2026) was made directly in the
// database and not recorded; this mapping is by product name and reuses photos,
// as that commit did (3 tomato photos, 2 peach photos for 8 products).
//
// Usage (stack up, seed loaded):
//   ADMIN_EMAIL=admin@goldenharvest.com ADMIN_PASSWORD=... node assign-product-images.mjs

const API = process.env.API_URL ?? 'http://localhost:3001';
const UPLOADS = `${API}/uploads`;

export const IMAGE_BY_PRODUCT = {
  'seed-tomate-entero-pelado': 'tomate-pure.jpg',
  'seed-cubetti-di-pomodoro': 'tomate-cubetti.webp',
  'seed-salsa-clásica': 'tomate-salsa.webp',
  'seed-doble-concentrado': 'tomate-pure.jpg',
  'seed-mitades-en-almíbar': 'durazno-natural.webp',
  'seed-trozos-en-almíbar': 'durazno-trozos.png',
  'seed-durazno-light': 'durazno-natural.webp',
  'seed-durazno-al-natural': 'durazno-natural.webp',
};

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD');

const login = await fetch(`${API}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
const { token } = await login.json();
if (!token) throw new Error(`Login failed (${login.status})`);

for (const [id, file] of Object.entries(IMAGE_BY_PRODUCT)) {
  const res = await fetch(`${API}/api/products/admin/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ imageUrl: `${UPLOADS}/${file}` }),
  });
  const saved = await res.json();
  console.log(`${id} -> ${saved.imageUrl ?? `FAILED (${res.status})`}`);
}
