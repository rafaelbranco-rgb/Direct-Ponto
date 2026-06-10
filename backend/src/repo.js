import { hashSenha, normalizarCpf, novoId } from './auth.js';

/** Acesso a dados de colaborador (SQL portável: Postgres real e pg-mem). */

export async function buscarPorIdentificador(pool, identificador) {
  const cpf = normalizarCpf(identificador);
  const termo = String(identificador ?? '').trim();
  const { rows } = await pool.query(
    `SELECT * FROM colaborador WHERE ativo = TRUE AND (cpf = $1 OR matricula = $2) LIMIT 1`,
    [cpf, termo],
  );
  return rows[0] ?? null;
}

export async function buscarPorId(pool, id) {
  const { rows } = await pool.query(`SELECT * FROM colaborador WHERE id = $1 LIMIT 1`, [id]);
  return rows[0] ?? null;
}

/**
 * Cria (ou reativa) um colaborador a partir do RM Labore com senha provisória.
 * Idempotente por CPF: se já existe, não recria (retorna existente).
 * Retorna { colaborador, criado, senhaProvisoria? }.
 */
export async function criarComSenhaProvisoria(pool, { cpf, matricula, nome, senhaProvisoria }) {
  const cpfNorm = normalizarCpf(cpf);
  const existente = await buscarPorIdentificador(pool, cpfNorm);
  if (existente) return { colaborador: existente, criado: false };

  const hash = await hashSenha(senhaProvisoria);
  const id = novoId();
  const criadoEm = new Date().toISOString();
  await pool.query(
    `INSERT INTO colaborador (id, cpf, matricula, nome, senha_hash, senha_provisoria, ativo, criado_em)
     VALUES ($1, $2, $3, $4, $5, TRUE, TRUE, $6)`,
    [id, cpfNorm, matricula ?? null, nome, hash, criadoEm],
  );
  const colaborador = await buscarPorId(pool, id);
  return { colaborador, criado: true, senhaProvisoria };
}

export async function definirNovaSenha(pool, id, novoHash) {
  await pool.query(
    `UPDATE colaborador SET senha_hash = $1, senha_provisoria = FALSE, senha_trocada_em = $2 WHERE id = $3`,
    [novoHash, new Date().toISOString(), id],
  );
}

export async function contar(pool) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM colaborador`);
  return rows[0]?.n ?? 0;
}
