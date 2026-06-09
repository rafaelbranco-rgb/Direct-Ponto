# Monday.com — Gestão da demanda

Conta **contato-serv** (acessível via MCP do Monday).

## IDs
- **Board principal:** "Demandas Internas AIONS" → `18391610716`
- **Board de subelementos:** "Subelementos de Demandas Internas AIONS" → `18392113015`
- **Item da demanda "Contato":** `12181435008`
  ("Desenvolvimento de Canal Próprio de Justificativa de Ponto — Contato")

## Colunas do board de subelementos
- `status` (Status): Não Iniciado / Em Andamento / Finalizado / etc.
- `color_mm3366zp` (Complexidade): Baixa / Média / Alta / Muito Alta → alimenta
  `formula_mm44w40q` (Qtd Pontos): 5 / 10 / 15 / 20.

## Subelementos (ordem lógica)
Planejamento → Mapear Nexti → Planejar Mobile → Planejar Web → base/backend →
app do colaborador → plataforma web → integrações → entrega/apresentação.
(17 subelementos de dev criados + planejamento; reordenados manualmente no app —
a API do Monday **não** permite reordenar subitens.)

Frentes:
- **Mobile (colaborador):** iniciar app, tela inicial, enviar justificativa, acompanhamento.
- **Web (gestor/RH):** iniciar plataforma web, login gestor/RH, aprovação 1º nível,
  painel RH 2º nível, relatórios.
- **Backend/integrações:** base de dados, servidor+login, ler Nexti, notificar,
  exportar RM Labore, integrar Monday.
- **Entrega:** testes com DP, go-live + treinamento, manual.

## Observações de integração
- O RH usa o Monday para gestão; integração via **webhook** (opcional) registra
  solicitações abertas no board do subsetor Ponto.
- Nomes dos subelementos foram deixados em **linguagem não-técnica** a pedido do DP.
