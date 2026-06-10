-- Tabela núcleo do login do colaborador.
-- CPFs vêm do RM Labore (import via CSV); cada um nasce com senha provisória
-- aleatória e precisa trocar no primeiro acesso (senha_provisoria = true).
CREATE TABLE IF NOT EXISTS colaborador (
  id               TEXT PRIMARY KEY,
  cpf              TEXT UNIQUE NOT NULL,
  matricula        TEXT,
  nome             TEXT NOT NULL,
  senha_hash       TEXT NOT NULL,
  senha_provisoria BOOLEAN NOT NULL DEFAULT TRUE,
  ativo            BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em        TEXT NOT NULL,
  senha_trocada_em TEXT
);

CREATE INDEX IF NOT EXISTS idx_colaborador_matricula ON colaborador (matricula);
