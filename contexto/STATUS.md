# Status & Roadmap

Atualizado em: 09/06/2026 (fim do dia 1 de desenvolvimento).

## ✅ Pronto (protótipo mobile, dados em memória)
- **Login** do colaborador (CPF/matrícula) — mock, redesenhado com cores CONTATO.
- **Caixa de entrada** com os 9 assuntos (prévia da última mensagem + horário).
- **Chat por assunto** estilo Nexti Direct: balões (colaborador/atendente/sistema),
  anexos (foto/galeria/PDF), protocolos.
- **Triagem inicial** antes do chat livre (data → horário → descrição; atestado pede anexo).
- **Liquid glass** (translúcido) + cabeçalho sólido da marca; tema **claro/escuro/sistema**.
- **Gaveta lateral** em 2 níveis: Menu (perfil + Configurações + Sair) → tema.
- Identidade **CONTATO** (azul + dourado) aplicada.

## ⏳ Pendências imediatas
1. ✅ Erros do React Compiler corrigidos (lint: 0 problemas). Validar visualmente no navegador.
2. ✅ **Logo real** aplicada: `assets/images/logo-contato.png` (brasão recortado) +
   `logo-contato-full.png` (completa) + favicon web. Usada no login e no header.
3. ✅ **Tema persiste** (web/localStorage via useSyncExternalStore). Native (AsyncStorage)
   fica para quando houver build nativo.
4. Paleta unificada em família navy (combina com o azul); login redesenhado.

## 🔜 Próximos grandes passos
1. **Backend**: banco PostgreSQL (migrations) + API NestJS + **login real** (RF-01).
2. **Integração Nexti** (leitura de marcações/inconsistências — RF-02).
3. **Plataforma Web** (gestor/RH): filas de aprovação 1º e 2º nível (RF-04/05).
4. **Notificações** ao colaborador (RF-07) e **exportação RM Labore** (RF-08).
5. **Integração Monday** (webhook) e **relatórios** (RF-09/10).
6. Testes em homologação (10 casos), implantação + treinamento, documentação.

## Histórico de commits (principais)
- `4f9ff0d` App mobile Contato (chat de atendimento)
- `fe807df` Liquid glass, ícones (sem emojis) e gaveta de configurações
- `5cc0129` Corrige liquid glass e aplica identidade da Contato (azul + dourado)
- `bb0b416` Gaveta em dois níveis e redesign da tela de login (cores CONTATO)
