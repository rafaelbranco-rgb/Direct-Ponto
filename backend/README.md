# Contato — Backend (login do colaborador)

API do canal **Contato**: login do colaborador por **CPF/matrícula**, com os
cadastros vindos do **RM Labore**. Cada colaborador nasce com **senha provisória
aleatória** e é obrigado a **trocar a senha no primeiro acesso**.

## Stack
- Node.js + Express
- PostgreSQL (driver `pg`, SQL puro)
- JWT (autenticação) + bcrypt (hash de senha)
- Dev sem instalar nada: cai em **Postgres na memória** (`pg-mem`)

## Banco
- **Produção (servidor on-premise):** defina `DATABASE_URL` apontando para o
  PostgreSQL. Tem um `docker-compose.yml` pronto: `docker compose up -d`.
- **Dev/validação local:** sem `DATABASE_URL`, a API usa `pg-mem` (memória) e
  semeia 2 colaboradores de teste (senha provisória `Contato@123`).

## Rodar
```bash
cd backend
npm install
cp .env.example .env      # ajuste DATABASE_URL/JWT_SECRET em produção
npm run dev               # http://localhost:3333
npm test                  # smoke test do fluxo (em memória)
```

## Importar os CPFs do RM Labore
Exporte do RM um CSV `cpf;matricula;nome` (com ou sem cabeçalho) e rode:
```bash
DATABASE_URL=postgres://contato:contato@localhost:5432/contato \
  node src/import-rm.js colaboradores.csv
```
- Cria cada colaborador com **senha provisória aleatória** (hash no banco).
- Gera `senhas-provisorias.csv` (`cpf;matricula;nome;senha_provisoria`) para o
  DP **distribuir** — o colaborador troca a senha no 1º acesso.
- É **idempotente**: CPF já existente não é recriado.

> Quando o RM Labore liberar API, troca-se o import por CSV por uma chamada
> direta à API do RM (mesma função `criarComSenhaProvisoria`).

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| GET  | `/health` | status + qual banco está em uso |
| POST | `/auth/login` | `{ identificador, senha }` → `{ token, precisaTrocarSenha, colaborador }` |
| POST | `/auth/trocar-senha` | (Bearer token) `{ novaSenha }` → troca e limpa a flag de provisória |
| GET  | `/me` | (Bearer token) dados do colaborador logado |

### Exemplo
```bash
# login com a senha provisória
curl -s localhost:3333/auth/login -H 'content-type: application/json' \
  -d '{"identificador":"03583026250","senha":"Contato@123"}'
# → { token, precisaTrocarSenha: true, ... }  →  app abre a tela de trocar senha

# trocar a senha (1º acesso)
curl -s localhost:3333/auth/trocar-senha -H "authorization: Bearer <TOKEN>" \
  -H 'content-type: application/json' -d '{"novaSenha":"MinhaSenha#1"}'
```
