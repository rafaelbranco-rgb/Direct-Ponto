import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));

/**
 * Cria o pool de conexão.
 *  - Com DATABASE_URL  → PostgreSQL real (produção / servidor on-premise).
 *  - Sem DATABASE_URL  → Postgres em memória (pg-mem) para dev/validação local
 *    sem precisar instalar nada. Mesma SQL nos dois casos.
 */
export async function criarPool() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: url });
    return { pool, emMemoria: false };
  }
  const { newDb } = await import('pg-mem');
  const mem = newDb();
  const pg = mem.adapters.createPg();
  const pool = new pg.Pool();
  return { pool, emMemoria: true };
}

/** Aplica o schema (idempotente). */
export async function aplicarSchema(pool) {
  const sql = readFileSync(join(aqui, 'schema.sql'), 'utf8');
  await pool.query(sql);
}
