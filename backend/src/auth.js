import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-contato-troque-em-producao';
const JWT_EXPIRA = process.env.JWT_EXPIRA || '8h';

/** Só dígitos (CPF aceita com ou sem máscara). */
export function normalizarCpf(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

/** Gera senha provisória aleatória (sem caracteres ambíguos como O/0, l/1). */
export function gerarSenhaProvisoria(tamanho = 10) {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  const bytes = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
  for (let i = 0; i < tamanho; i++) {
    const n = parseInt(bytes.slice(i * 2, i * 2 + 2), 16);
    s += alfabeto[n % alfabeto.length];
  }
  return s;
}

export function novoId() {
  return randomUUID();
}

export async function hashSenha(senha) {
  return bcrypt.hash(senha, 10);
}

export async function conferirSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

export function assinarToken(colaborador) {
  return jwt.sign(
    { sub: colaborador.id, cpf: colaborador.cpf, nome: colaborador.nome },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRA },
  );
}

export function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/** Política mínima de senha na troca. */
export function senhaValida(senha) {
  return typeof senha === 'string' && senha.trim().length >= 6;
}
