import { randomBytes } from 'node:crypto'

const MIN_LENGTH = 12

// Contraseña del administrador que crea el seed. Sale de SEED_ADMIN_PASSWORD;
// si no está definida, se genera una al azar para esa corrida. No hay valor por
// defecto conocido.
export function resolveAdminPassword(
  env: Record<string, string | undefined>,
  generate: () => string = () => randomBytes(12).toString('base64url'),
): { password: string; source: 'env' | 'generated' } {
  const fromEnv = env.SEED_ADMIN_PASSWORD
  if (!fromEnv) return { password: generate(), source: 'generated' }
  if (fromEnv.length < MIN_LENGTH) {
    throw new Error(`SEED_ADMIN_PASSWORD debe tener al menos ${MIN_LENGTH} caracteres`)
  }
  return { password: fromEnv, source: 'env' }
}
