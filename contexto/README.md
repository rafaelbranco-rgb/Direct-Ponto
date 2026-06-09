# Contexto do Projeto — Contato (Canal de Justificativa de Ponto)

> Pasta de contexto para retomar o projeto a qualquer momento. Leia este índice
> primeiro; os detalhes estão nos arquivos ao lado.

## Índice
- [ARQUITETURA.md](./ARQUITETURA.md) — stack, estrutura de pastas, modelo de dados
- [STATUS.md](./STATUS.md) — o que está pronto, o que falta, roadmap
- [MONDAY.md](./MONDAY.md) — board, subelementos e IDs no Monday.com

---

## Visão geral

**Projeto "Contato"** (O.S. `OS-DP-TI-2026-001` / Projeto `DP-AUTO-002`): solução
interna para **substituir o módulo "Direct" do Nexti** (que ficou caro). Permite ao
colaborador justificar atrasos/faltas/atestados e à liderança aprovar.

- **Empresa:** CONTATO — Serviços de Conservação e Manutenção LTDA.
- **Beneficiário:** Departamento Pessoal (DP) — subsetor Ponto.
- **Prazo da O.S.:** 7 semanas (não desligar o Direct antes do go-live).

## Decisões-chave (alinhadas com o cliente)
1. **App mobile = SÓ o colaborador** (enviar justificativa + acompanhar status).
   A aprovação de gestor/RH fica na **Plataforma Web** (a construir).
2. O app é um **chat de atendimento** (igual ao Nexti Direct), **não** um formulário.
   Ao abrir um assunto novo há uma **pequena triagem** (data → horário → descrição;
   atestado pede anexo) e depois vira **conversa livre** com o "atendente".
3. **Stack mobile:** Expo + react-native-web → roda como **web/PWA agora** e o mesmo
   código vira **app nativo depois** (fase futura na O.S.).
4. **Nexti = somente leitura** (marcações/inconsistências). O ajuste aprovado é
   gravado no **RM Labore (Totvs)** via arquivo (.txt/.xml) ou API — **não** no Nexti.
5. **Hospedagem on-premise** (restrição LGPD: dados de colaboradores no ambiente
   interno da empresa).
6. **Monday.com:** integração opcional via webhook (registrar solicitações abertas).

## Como rodar
```powershell
cd C:\Users\NOTECS-29\contato-app
npm install            # só na primeira vez / após clonar
npx expo start --web   # abre em http://localhost:8081
# ou: npx expo start   # gera QR Code para abrir no celular com o app Expo Go
```
Dica web: se ver algo desatualizado, faça **Ctrl+Shift+R** (refresh forçado).

## Repositório
- GitHub: https://github.com/rafaelbranco-rgb/Direct-Ponto (branch `main`)
- Convenção: **commit + push a cada etapa concluída e validada**.

## Identidade visual (logo CONTATO)
- Azul royal **`#234FA0`** (primary), escuro `#173A75`.
- Dourado **`#E1A22C`** (accent), escuro `#C2861A`.
- Definidas em `src/constants/brand.ts`.
- ⏳ Pendente: substituir o "C" pelo brasão real
  (`assets/images/logo-contato.png`).
