# Plano da Plataforma Web (Gestor / RH) — Contato

> Subelemento **#9 — Planejar Plataforma Web**. Define telas, fluxo de aprovação,
> stack, rotas, modelo de dados e fases. O app mobile é **só do colaborador**;
> **toda aprovação acontece nesta plataforma web**.

## 1. Objetivo e usuários
Plataforma web interna para a liderança tratar as justificativas enviadas pelo
colaborador no app. Perfis:

| Perfil | Quem | O que faz |
|---|---|---|
| **Gestor** (1º nível) | Liderança imediata do colaborador | Vê a fila da sua equipe; **aprova/recusa** com justificativa; conversa pelo atendimento. |
| **RH / DP** (2º nível) | Subsetor Ponto | **Análise final** do que o gestor aprovou; aplica no **RM Labore**; relatórios. |
| **Admin** (opcional) | TI/DP | Gerencia usuários/perfis e parâmetros. |

> Decisão de produto já alinhada: **mobile = colaborador**; **web = gestor/RH**.

## 2. Fluxo de aprovação (2 níveis) — máquina de estados
Espelha o que está em `ARQUITETURA.md` (backend):

```
RASCUNHO → ENVIADA → EM_ANALISE_GESTOR → APROVADA_GESTOR
        → EM_ANALISE_DP → APROVADA_DP → APLICADA_LABORE
```
Ramos de recusa em cada nível:
- Gestor recusa → `RECUSADA_GESTOR` (motivo obrigatório) → colaborador é avisado.
- DP recusa → `RECUSADA_DP` (motivo obrigatório) → colaborador é avisado.

Regras:
- Recusa **sempre exige motivo** (vai para o colaborador via notificação — subelemento #17).
- Toda transição gera **evento de auditoria** (quem, quando, de/para, motivo) — LGPD.
- Só `APROVADA_DP` pode virar `APLICADA_LABORE` (exportação para o RM — #18).

## 3. Telas / rotas
| Rota | Tela | Perfil |
|---|---|---|
| `/login` | Login (CPF/matrícula + senha; mesmo backend do app) | Todos |
| `/trocar-senha` | Troca obrigatória no 1º acesso | Todos |
| `/` | **Fila de aprovação** (cards/tabela, filtros por status/equipe/período, busca) | Gestor/RH |
| `/solicitacao/:id` | **Detalhe**: dados da ocorrência, anexos, histórico do chat, **Aprovar / Recusar (motivo)** | Gestor/RH |
| `/rh` | **Painel do RH**: fila de 2º nível (aprovadas pelo gestor) + **aplicar no RM Labore** | RH/DP |
| `/relatorios` | **Relatórios**: volume por status/categoria/período, tempo médio de resposta, export CSV | RH/DP |
| `/usuarios` | (opcional) gestão de usuários/perfis | Admin |

Cada subelemento de construção mapeia direto:
- #12 Iniciar a plataforma web → projeto + layout + rotas + auth guard.
- #13 Login do gestor e do RH → `/login` + `/trocar-senha` (reusa backend #8).
- #14 Tela do gestor para aprovar → `/` (fila) + `/solicitacao/:id`.
- #15 Painel do RH → `/rh`.
- #16 Relatórios → `/relatorios`.

## 4. Stack (recomendação)
**App web separado** (não dentro do Expo), consumindo a **mesma API** do backend `#8`:

- **Vite + React 19 + TypeScript** · **Tailwind CSS v4** + **shadcn/ui**
- **react-router-dom v7** · **@tanstack/react-query** (cache/estado servidor) · **date-fns**

Por quê separado do app mobile:
- Console de gestor/RH é **desktop-first**, denso em **tabelas/filtros** — ergonomia melhor em React web puro que em react-native-web.
- A empresa **já tem essa base** pronta (projeto `plano-intermitentes`: Vite/React/Tailwind/shadcn) — reaproveita padrão visual, `PageTransition`, `glass`, etc. (ver `MAPEAMENTO_FRONTEND_DESIGN`).
- Mantém o app mobile leve; os dois compartilham **backend + identidade visual** (azul `#2B57AD` + dourado `#F2B63D`, navy escuro).

Trade-off: dois frontends. Mitigado por backend único e tokens de marca compartilhados.

## 5. Backend — o que falta além do #8
A API de login (#8) já existe. A plataforma web precisa estender com:

- **Perfis/roles** no `colaborador`/`usuario` (gestor, dp, admin) → claim no JWT; middleware de autorização por rota.
- `GET /solicitacoes` com filtros (status, equipe, período, busca) e paginação → fila.
- `GET /solicitacoes/:id` (dados + anexos + histórico do chat).
- `POST /solicitacoes/:id/decidir` `{ nivel: 'gestor'|'dp', decisao: 'aprovar'|'recusar', motivo? }` → transiciona a máquina de estados + auditoria + dispara notificação ao colaborador (#17).
- `POST /solicitacoes/:id/aplicar-labore` (só DP, só `APROVADA_DP`) → exportação RM (#18).
- `GET /relatorios?...` (agregações).
- Tabelas novas: `solicitacao`, `aprovacao` (nível, decisor, decisão, motivo, data), `anexo`, `evento_auditoria`, `usuario_perfil`.

## 6. Identidade visual
- Reusar a marca da Contato: **navy escuro** de base, **azul** como ação, **dourado** para confirmação/destaque, **verde** sucesso, **vermelho** perigo.
- Visual "console de operação" sóbrio (alinhado ao `MAPEAMENTO_FRONTEND_DESIGN`): vidro sutil, sem exagero, mobile-first e desktop refinado.

## 7. Segurança / LGPD
- **On-premise** (dados de colaboradores no ambiente interno).
- Autorização por perfil em **toda** rota sensível; JWT curto + refresh.
- **Auditoria** de todas as decisões; anexos servidos com checagem de permissão.

## 8. Fases de implementação (ordem sugerida)
1. **#12** Esqueleto: projeto Vite, layout, rotas, auth guard, cliente da API (react-query), tokens de marca.
2. **#13** Login + troca de senha (reusa `/auth/*` do backend).
3. Backend: roles + `GET /solicitacoes`/`:id` + `POST /decidir` (+ seed de dados de exemplo).
4. **#14** Fila do gestor + detalhe + aprovar/recusar.
5. **#15** Painel do RH (2º nível) + aplicar no RM Labore (stub até a integração #18).
6. **#16** Relatórios.
7. Integrações: **#17** avisar colaborador (notificação — base já existe no app), **#18** RM Labore, **#19** Monday (webhook).

## 9. Riscos / dependências
- **RM Labore**: aplicação na folha depende de API/arquivo do RM (hoje CSV no #8). Bloqueia o "fim" do #15/#18, não o início.
- **Dados reais de equipe** (quem é gestor de quem) precisam vir do RM/estrutura organizacional.
- Construir com **dados mock** primeiro (igual ao mobile) e plugar no backend conforme as rotas ficam prontas.
