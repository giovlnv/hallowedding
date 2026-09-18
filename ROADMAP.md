# Roadmap — Site do Casamento (arquivado)

> Este arquivo documentou o planejamento do site antes de qualquer código existir. O site está pronto, publicado e em uso — o conteúdo útil de referência foi incorporado ao `README.md`. Mantido aqui só como registro histórico das decisões tomadas; será removido do controle de versão logo após esta atualização (ver histórico do git se precisar consultar de novo).

## Arquitetura definida (implementada integralmente)

- **Hospedagem:** GitHub Pages (site estático)
- **Backend:** Google Apps Script (Web App) lendo/escrevendo numa Google Sheets
- **Mapa:** iframe do Google Maps via "Compartilhar → Incorporar mapa" (sem API key, sem cartão)
- **QR Pix:** gerado 100% no navegador em JavaScript, sem backend
- **Chave Pix:** chave aleatória do Mercado Pago/Mercado Livre (formato EVP), não a caixinha do Itaú — ver decisão abaixo

## Decisões tomadas

**2026-09-15 — Índice virou single-page com seções; RSVP e Presentes continuam páginas separadas.** `index.html` contém Hero, Sobre nós, A festa, Como chegar e FAQ como seções âncora de uma página só (`local.html` foi removido, conteúdo incorporado à seção `#como-chegar`); `rsvp.html` e `presentes.html` continuam como páginas próprias.

**2026-09-15 — Identidade visual e estrutura do site.** Diretrizes de design (paleta gótico-vitoriana, tipografia Cormorant SC/Cormorant Garamond/Pinyon Script) definidas fora do repositório e aplicadas em `css/style.css`. Paleta revisada em 2026-09-18 (vinho/base → ouro/osso para texto, ver histórico de commits).

**2026-09-14 — Chave Pix: Mercado Pago, não Itaú.** A chave aleatória que o app do Itaú gera para a caixinha ficou vinculada ao CPF da conta (formato CPF, não EVP). Optou-se pela chave aleatória do Mercado Pago/Mercado Livre (formato EVP válido) para o QR de presentes.

## Estrutura de dados (Google Sheets — uma planilha, 3 abas)

1. **Convidados** — `Nome`, `Presentes`, `Preço` (a mesma aba serve a lista de convidados e o catálogo de presentes)
2. **RSVPs** — `Timestamp, Nome, Telefone, QtdAcompanhantes, NomesAcompanhantes`
3. **PresentesEscolhidos** — log opcional: `Timestamp, Presente, Valor`

## Apps Script (Web App único, `apps-script/Code.gs`)

- `doGet` → busca de convidados (`?busca=`, mínimo 3 caracteres, substring case/acento-insensível, até 10 resultados) + lista completa de presentes
- `doPost` → grava RSVP (`gravarRsvp`) ou presente escolhido (`gravarPresenteEscolhido`), conforme `tipo` no corpo
- Todos os handlers têm try/catch e retornam JSON de erro consistente em vez de página de erro crua

## Fases do roadmap — todas concluídas

Fase 0 (preparação) → Fase 1 (backend) → Fase 2 (RSVP) → Fase 3 (mapa) → Fase 4 (presentes + Pix) → Fase 5 (acabamento, testes em celular, testadores externos, publicação — confirmado concluído pelo usuário em 2026-09-18) → Fase 6 (header/footer dinâmicos, RSVP restrito, QR em popup, revisão de acessibilidade/segurança/UX).

## Em aberto (2026-09-18, ao arquivar este arquivo)

- Renomeação de cores CSS (vinho→ouro, base→osso) nunca verificada visualmente num navegador.
- Dropdown de autocomplete customizado do RSVP nunca verificado visualmente.
- Simplificação do menu (Início/RSVP/Lista de presentes) e grid de presentes 2 colunas no mobile nunca verificados visualmente.
- Duas fotos de presentes com correspondência incerta, sinalizadas para revisão do usuário (ver `README.md`/histórico de commits).
- 8 dos 25 presentes ainda sem foto (fica o placeholder).
- Mudanças de tratamento de erro em `apps-script/Code.gs` (try/catch) exigem um novo deploy manual (Extensões → Apps Script → Implantar → Nova versão) — ainda não confirmado.
- "Sobre nós" continua `[A definir]` — decisão do usuário, não bloqueia.
