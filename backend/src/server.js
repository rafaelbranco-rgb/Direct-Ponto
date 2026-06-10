import 'dotenv/config';
import express from 'express';

import {
  assinarToken,
  conferirSenha,
  hashSenha,
  senhaValida,
  verificarToken,
} from './auth.js';
import { aplicarSchema, criarPool } from './db.js';
import {
  buscarPorId,
  buscarPorIdentificador,
  contar,
  criarComSenhaProvisoria,
  definirNovaSenha,
} from './repo.js';

const PORTA = process.env.PORT || 3333;

export async function criarApp() {
  const { pool, emMemoria } = await criarPool();
  await aplicarSchema(pool);

  // Em memória (dev): semeia uns colaboradores para testar o login.
  if (emMemoria && (await contar(pool)) === 0) {
    const exemplos = [
      { cpf: '03583026250', matricula: '1001', nome: 'RAFAEL MARTINIANO BARBOSA BRANCO' },
      { cpf: '11122233344', matricula: '1002', nome: 'MARIA SOUZA' },
    ];
    for (const e of exemplos) {
      const r = await criarComSenhaProvisoria(pool, { ...e, senhaProvisoria: 'Contato@123' });
      if (r.criado) console.log(`[seed] ${e.nome} (CPF ${e.cpf}) senha provisória: Contato@123`);
    }
  }

  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true, banco: emMemoria ? 'memoria' : 'postgres' }));

  // Login por CPF ou matrícula + senha.
  app.post('/auth/login', async (req, res) => {
    try {
      const { identificador, senha } = req.body ?? {};
      if (!identificador || !senha) return res.status(400).json({ erro: 'Informe identificador e senha.' });

      const col = await buscarPorIdentificador(pool, identificador);
      if (!col || !(await conferirSenha(senha, col.senha_hash))) {
        return res.status(401).json({ erro: 'CPF/matrícula ou senha inválidos.' });
      }
      return res.json({
        token: assinarToken(col),
        precisaTrocarSenha: col.senha_provisoria === true,
        colaborador: { id: col.id, cpf: col.cpf, nome: col.nome, matricula: col.matricula },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: 'Erro interno.' });
    }
  });

  // Troca de senha (primeiro acesso ou a pedido). Requer token.
  app.post('/auth/trocar-senha', autenticar, async (req, res) => {
    try {
      const { novaSenha } = req.body ?? {};
      if (!senhaValida(novaSenha)) {
        return res.status(400).json({ erro: 'A nova senha deve ter ao menos 6 caracteres.' });
      }
      const col = await buscarPorId(pool, req.colaboradorId);
      if (!col) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

      await definirNovaSenha(pool, col.id, await hashSenha(novaSenha));
      return res.json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: 'Erro interno.' });
    }
  });

  app.get('/me', autenticar, async (req, res) => {
    const col = await buscarPorId(pool, req.colaboradorId);
    if (!col) return res.status(404).json({ erro: 'Não encontrado.' });
    return res.json({
      id: col.id,
      cpf: col.cpf,
      nome: col.nome,
      matricula: col.matricula,
      precisaTrocarSenha: col.senha_provisoria === true,
    });
  });

  function autenticar(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ erro: 'Token ausente.' });
    try {
      req.colaboradorId = verificarToken(token).sub;
      next();
    } catch {
      return res.status(401).json({ erro: 'Token inválido.' });
    }
  }

  return { app, pool, emMemoria };
}

// Sobe o servidor quando executado diretamente.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server.js')) {
  criarApp().then(({ app, emMemoria }) => {
    app.listen(PORTA, () => {
      console.log(`Contato API em http://localhost:${PORTA}  (banco: ${emMemoria ? 'memória (pg-mem)' : 'postgres'})`);
    });
  });
}
