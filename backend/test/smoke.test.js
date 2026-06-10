import assert from 'node:assert';

import { conferirSenha, gerarSenhaProvisoria, hashSenha, normalizarCpf } from '../src/auth.js';
import { aplicarSchema, criarPool } from '../src/db.js';
import {
  buscarPorIdentificador,
  criarComSenhaProvisoria,
  definirNovaSenha,
} from '../src/repo.js';

/** Valida o fluxo: importar (senha provisória) → login → trocar senha → login com a nova. */
async function main() {
  // Garante modo em memória.
  delete process.env.DATABASE_URL;
  const { pool, emMemoria } = await criarPool();
  assert.equal(emMemoria, true, 'deveria usar pg-mem sem DATABASE_URL');
  await aplicarSchema(pool);

  // normalização de CPF
  assert.equal(normalizarCpf('035.830.262-50'), '03583026250');

  // cria colaborador com senha provisória aleatória
  const senhaProv = gerarSenhaProvisoria();
  const r = await criarComSenhaProvisoria(pool, {
    cpf: '035.830.262-50',
    matricula: '1001',
    nome: 'RAFAEL TESTE',
    senhaProvisoria: senhaProv,
  });
  assert.equal(r.criado, true);
  assert.equal(r.colaborador.senha_provisoria, true, 'nasce com senha provisória');

  // login com CPF mascarado e a senha provisória
  const col = await buscarPorIdentificador(pool, '03583026250');
  assert.ok(col, 'encontra por CPF normalizado');
  assert.equal(await conferirSenha(senhaProv, col.senha_hash), true, 'senha provisória confere');
  assert.equal(await conferirSenha('errada', col.senha_hash), false);

  // login por matrícula também
  const porMatricula = await buscarPorIdentificador(pool, '1001');
  assert.ok(porMatricula, 'encontra por matrícula');

  // troca de senha → some a flag de provisória
  await definirNovaSenha(pool, col.id, await hashSenha('MinhaSenha#1'));
  const depois = await buscarPorIdentificador(pool, '03583026250');
  assert.equal(depois.senha_provisoria, false, 'após troca, não é mais provisória');
  assert.equal(await conferirSenha('MinhaSenha#1', depois.senha_hash), true, 'login com a nova senha');
  assert.equal(await conferirSenha(senhaProv, depois.senha_hash), false, 'senha antiga não vale mais');

  // idempotência do import (mesmo CPF não duplica)
  const r2 = await criarComSenhaProvisoria(pool, {
    cpf: '03583026250',
    nome: 'RAFAEL DUPLICADO',
    senhaProvisoria: 'x',
  });
  assert.equal(r2.criado, false, 'CPF existente não recria');

  console.log('SMOKE OK — importar → login → trocar senha → login novo: tudo passou.');
}

main().catch((e) => {
  console.error('SMOKE FALHOU:', e);
  process.exit(1);
});
