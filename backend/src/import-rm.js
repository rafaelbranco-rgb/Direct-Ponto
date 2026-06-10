import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';

import { gerarSenhaProvisoria, normalizarCpf } from './auth.js';
import { aplicarSchema, criarPool } from './db.js';
import { criarComSenhaProvisoria } from './repo.js';

/**
 * Importa colaboradores a partir de um CSV exportado do RM Labore.
 *
 *   node src/import-rm.js caminho/para/colaboradores.csv
 *
 * Formato do CSV (com ou sem cabeçalho), separador ; ou ,:
 *   cpf;matricula;nome
 *
 * Cada colaborador é criado com uma SENHA PROVISÓRIA ALEATÓRIA (hash no banco)
 * e marcado para troca obrigatória no primeiro acesso. As senhas geradas são
 * gravadas em `senhas-provisorias.csv` para o DP distribuir com segurança.
 */

function parseCsv(texto) {
  const linhas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sep = (linhas[0]?.includes(';') ? ';' : ',');
  const registros = [];
  for (const linha of linhas) {
    const partes = linha.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''));
    const cpf = normalizarCpf(partes[0]);
    if (cpf.length < 11) continue; // pula cabeçalho/linhas inválidas
    registros.push({ cpf, matricula: partes[1] || null, nome: partes[2] || `Colaborador ${cpf.slice(-4)}` });
  }
  return registros;
}

async function main() {
  const arquivo = process.argv[2];
  if (!arquivo) {
    console.error('Uso: node src/import-rm.js <arquivo.csv>');
    process.exit(1);
  }

  const registros = parseCsv(readFileSync(arquivo, 'utf8'));
  if (registros.length === 0) {
    console.error('Nenhum CPF válido encontrado no CSV.');
    process.exit(1);
  }

  const { pool, emMemoria } = await criarPool();
  await aplicarSchema(pool);
  if (emMemoria) {
    console.warn('AVISO: sem DATABASE_URL — rodando em memória; nada será persistido. Defina DATABASE_URL para gravar no Postgres.');
  }

  const distribuir = [['cpf', 'matricula', 'nome', 'senha_provisoria']];
  let criados = 0;
  let existentes = 0;
  for (const reg of registros) {
    const senhaProvisoria = gerarSenhaProvisoria();
    const r = await criarComSenhaProvisoria(pool, { ...reg, senhaProvisoria });
    if (r.criado) {
      criados++;
      distribuir.push([reg.cpf, reg.matricula ?? '', reg.nome, senhaProvisoria]);
    } else {
      existentes++;
    }
  }

  const saida = 'senhas-provisorias.csv';
  writeFileSync(saida, distribuir.map((l) => l.join(';')).join('\n'), 'utf8');
  console.log(`Importação concluída: ${criados} criados, ${existentes} já existiam.`);
  console.log(`Senhas provisórias dos novos gravadas em: ${saida} (entregar a cada colaborador; trocam no 1º acesso).`);
  await pool.end?.();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
