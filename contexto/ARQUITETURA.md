# Arquitetura

## Stack
| Camada | Escolha |
|---|---|
| App (colaborador + futuro nativo) | **Expo SDK 56** + **expo-router** + **react-native-web** (TypeScript) |
| Painel Web (gestor/RH) | a construir (mesmo backend) |
| Backend/API | planejado: **Node.js (NestJS)** |
| Banco | planejado: **PostgreSQL** (on-premise) |
| Anexos | disco interno / MinIO (só o caminho no banco) |
| Auth | planejado: JWT, login por **CPF/matrícula** (RF-01) |

### Libs já instaladas no app
- `expo-image-picker`, `expo-document-picker` — anexos (câmera/galeria/PDF)
- `expo-linear-gradient` — fundos/gradiente da marca
- `@expo/vector-icons` (Ionicons) — ícones (sem emojis)
- `expo-blur` — instalada, **não usada** no momento (vidro feito por translucidez)

## Estrutura de pastas (`src/`)
```
src/
  app/                      # rotas (expo-router)
    _layout.tsx             # providers (tema, auth) + Stack
    login.tsx               # login do colaborador (mock)
    index.tsx               # caixa de entrada (lista de assuntos)
    categoria/[codigo].tsx  # CHAT do assunto + triagem
  components/
    brand-header.tsx        # cabeçalho com cor sólida da marca (gradiente)
    glass.tsx               # GlassSurface (liquid glass translúcido)
    screen-bg.tsx           # gradiente de fundo da tela
    settings-drawer.tsx     # gaveta lateral (Menu → Configurações → tema)
    category-row.tsx        # linha de assunto na caixa de entrada
    search-bar.tsx          # busca
    themed-text.tsx / themed-view.tsx  # texto/view com tema (do template)
  constants/
    brand.ts                # cores e nome da marca (CONTATO)
    glass.ts                # gradiente + tinturas do vidro
    theme.ts                # paleta light/dark + espaçamentos (do template)
  context/
    auth.tsx                # AuthProvider/useAuth (login em memória — mock)
    theme-pref.tsx          # ThemePrefProvider (claro/escuro/sistema)
  data/
    types.ts                # tipos de domínio (Categoria, etc.)
    mock.ts                 # categorias (9 assuntos) — dados de exemplo
    chat.ts                 # modelo + store das conversas + triagem
  hooks/
    use-theme.ts            # cores resolvidas do tema
    use-color-scheme.ts/.web.ts  # esquema efetivo (via ThemePref)
```

## Modelo de dados (mobile, hoje em memória)
Na integração estes viram chamadas à API/banco.

### Conversa (chat) — `src/data/chat.ts`
- `Conversa { categoria, remetente, triada, mensagens[] }`
- `Mensagem { id, autor: 'COLABORADOR'|'ATENDENTE'|'SISTEMA', texto, horario?, data?, anexo?, lida? }`
- Mensagens de **SISTEMA** = ciclo do protocolo (solicitado/iniciado/finalizado).
- **Triagem** por categoria via `passosTriagem(codigo)`:
  - categorias de horário: data → horário correto → descrição
  - Atestado: data → descrição → anexo
  - Falta / Banco de Horas: data → descrição

### Categorias (assuntos) — `src/data/mock.ts`
9 assuntos do Nexti Direct: Atraso, Falta, Entrada Antecipada, Envio de Atestado,
Saída Tardia, Saída Antecipada, Esquecimento, Saída Durante o Expediente, Banco de Horas.
Cada uma tem `icone` (Ionicons) e, no caso do Atestado, `exigeAnexo`.

## Esquema do banco (planejado para o backend)
Tabelas-núcleo desenhadas no início (a virar migrations PostgreSQL):
`colaborador`, `tipo_ocorrencia`, `solicitacao`, `anexo`, `aprovacao` (2 níveis:
gestor e DP), `evento_auditoria`, `notificacao`, `exportacao_labore`.
Máquina de estados: RASCUNHO → ENVIADA → EM_ANALISE_GESTOR → APROVADA_GESTOR →
EM_ANALISE_DP → APROVADA_DP → APLICADA_LABORE (com ramos de recusa).
