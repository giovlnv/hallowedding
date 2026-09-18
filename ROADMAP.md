# Roadmap — Site do Casamento

## Arquitetura definida

- **Hospedagem:** GitHub Pages (site estático)
- **Backend:** Google Apps Script (Web App) lendo/escrevendo numa Google Sheets
- **Mapa:** iframe do Google Maps via "Compartilhar → Incorporar mapa" (sem API key, sem cartão)
- **QR Pix:** gerado 100% no navegador em JavaScript, sem backend
- **Chave Pix:** chave aleatória do Mercado Pago/Mercado Livre (`79019b12-b967-4660-afdc-734b70d0ee7f`), não a caixinha do Itaú — ver decisão em [Decisões tomadas](#decisões-tomadas)

## Minha opinião sobre as escolhas

GitHub Pages + Apps Script é uma combinação sólida e bem testada para esse tipo de site — zero custo, zero dependência de hospedagem instável, e a planilha já funciona como seu painel de acompanhamento.

Duas sugestões sobre a implementação:

1. Em vez de publicar a planilha de convidados na web (Arquivo → Publicar na web) para o autocomplete do RSVP, prefiro que a leitura da lista de nomes também passe pelo mesmo Apps Script Web App (um `doGet`), junto com a gravação do RSVP (`doPost`). Fica só uma URL para gerenciar, e a planilha em si nunca fica com um link público indexável.
2. Como a chave é aleatória: confirme antes se ela já está de fato vinculada à conta/caixinha certa ou se você vai usar uma chave e transferir depois — isso muda qual chave entra no QR. Também recomendo testar com um Pix de valor baixo (R$0,01–R$1) antes de divulgar: o campo de mensagem ("informação adicional" do BR Code) sempre aparece no extrato de quem recebe, mas nem todo app de banco mostra esse campo com destaque na tela de confirmação de quem paga — bom saber disso com antecedência.

## Decisões tomadas

**2026-09-15 — Índice virou single-page com seções; RSVP e Presentes continuam páginas separadas.** Revisão da decisão anterior: `index.html` agora contém Hero, Sobre nós, A festa, Como chegar e FAQ como seções âncora de uma página só (`local.html` foi removido, conteúdo incorporado à seção `#como-chegar`), mas `rsvp.html` e `presentes.html` continuam como páginas próprias. "Sobre nós" e algumas respostas do FAQ (traje, crianças, duração da festa, opção vegetariana/vegana) ficaram marcadas como `[A definir]` — são conteúdo pessoal/factual que só as noivas podem preencher, não inventado pelo Claude Code.

**2026-09-15 — Identidade visual e estrutura do site.** Diretrizes de design (paleta gótico-vitoriana, tipografia Cormorant SC/Cormorant Garamond/Pinyon Script, tom de voz, estrutura de conteúdo por seção) definidas em `C:\Users\giova\Documents\documentos\wedding\diretrizes-site-casamento.md` (fora do repositório, arquivo pessoal). A identidade visual (cores, fontes) foi aplicada em `css/style.css` e vale para todas as páginas.

**2026-09-14 — Chave Pix: Mercado Pago, não Itaú.** A ideia inicial era usar a caixinha do Itaú, mas a chave aleatória que o app do Itaú gera para a caixinha ficou vinculada ao CPF da conta, não a uma chave EVP própria (confirmado ao decodificar dois BR Codes de teste gerados por lá — o campo de chave sempre voltava com 11 dígitos numéricos, formato de CPF). Optou-se por usar a chave aleatória do Mercado Pago/Mercado Livre (`79019b12-b967-4660-afdc-734b70d0ee7f`, formato EVP válido) para o QR de presentes. Isso não muda a arquitetura (Fase 4 continua igual), só o valor da constante `CHAVE_PIX` em `js/pix.js` quando essa fase for implementada.

## Estrutura de dados (Google Sheets — uma planilha, 3 abas)

1. **Convidados** — lista que você pré-carrega: `Nome`
2. **RSVPs** — respostas do formulário: `Timestamp, Nome, Telefone, QtdAcompanhantes, NomesAcompanhantes` (sem Churrasco/Bebida — perguntas removidas na Fase 6)
3. **PresentesEscolhidos** — log opcional, não trava nada: `Timestamp, Presente, Valor` (sem coluna de quem escolheu — não é necessário registrar isso, e pode haver presente escolhido sem RSVP preenchido na mesma sessão)

## Estrutura do site (repositório GitHub Pages)

```
index.html         → single-page: Hero, Sobre nós, A festa, Como chegar, FAQ
rsvp.html          → formulário de presença
presentes.html     → lista de presentes com QR Pix
/js/app.js         → config compartilhada (EXEC_URL) + carregamento de fontes
/js/pix.js         → geração do payload BR Code + QR
/js/rsvp.js        → autocomplete de nomes + envio do formulário
/js/presentes.js   → catálogo de presentes + geração de QR
/css/style.css
/img/              → fotos reais dos presentes (vazia por enquanto)
/scripts/check-refs.js        → checagem de referências locais quebradas, rodada pelo CI
/.htmlvalidate.json            → config do html-validate usado pelo CI
/.github/workflows/checks.yml  → CI: sintaxe JS, validade de HTML, referências locais quebradas
```

## Apps Script (Web App único)

- `doGet` → devolve a lista de nomes da aba "Convidados" em JSON (alimenta o autocomplete do RSVP)
- `doPost` → recebe o RSVP e grava uma linha na aba "RSVPs"
- (opcional) parâmetro extra no `doPost` para logar qual presente foi escolhido na aba "PresentesEscolhidos" — só para seu controle, sem bloquear o botão para os próximos visitantes

## Fases do roadmap (ordem sugerida para o Claude Code)

**Fase 0 — Preparação (fora do código)**
1. Criar a planilha Google Sheets com as 3 abas e cabeçalhos de coluna.
2. Preencher a aba "Convidados" com a lista de nomes.
3. Confirmar no app do Itaú a chave Pix da caixinha (própria ou pessoal redirecionada).
4. Criar o repositório no GitHub e ativar o GitHub Pages.

**Fase 1 — Backend**
5. Criar o Apps Script vinculado à planilha, com `doGet` (lista de convidados) e `doPost` (grava RSVP).
6. Publicar como Web App ("qualquer pessoa com o link") e testar os dois endpoints isoladamente (curl/Postman) antes de integrar ao front-end.

**Fase 2 — RSVP**
7. Construir `rsvp.html` com campo de nome em autocomplete/dropdown puxando do `doGet`.
8. Campos: telefone, qtd. de acompanhantes + nome de cada um (campos dinâmicos), churrasco (sim/não), bebida (sim/não).
9. Enviar via `fetch()` POST ao Web App; tela de confirmação após o envio.
10. Testar um envio completo e confirmar que a linha aparece certa na aba "RSVPs".

**Fase 3 — Mapa**
11. Gerar o iframe via "Compartilhar → Incorporar mapa" no Google Maps para: Rua Sabiá, Nº 46, Vila Tavares, Mauá – SP.
12. Colar em `local.html`, com o endereço também em texto (para quem tiver dificuldade com o iframe no celular).

**Fase 4 — Presentes + Pix**
13. Montar `pix.js`: função que monta o payload BR Code (chave, nome do recebedor, cidade, valor, txid, "informação adicional" com o nome do presente) + checksum CRC16.
14. Usar uma lib de geração de imagem de QR (ex.: `qrcode.js`) para desenhar o QR a partir do payload.
15. Montar `presentes.html`: grade de presentes com nome/preço, botão "Escolher" que gera o QR daquele item na hora.
16. Testar 2–3 presentes de valores diferentes com Pix real de valor baixo antes de divulgar o site.
17. (Opcional) disparar um POST simples ao Web App a cada presente visualizado/escolhido, só para seu controle.

**Fase 5 — Acabamento e testes finais**
18. Estilizar (CSS livre).
19. Testar em celular — a maioria dos convidados vai acessar por lá.
20. Pedir para 1–2 pessoas de fora testarem o fluxo completo (RSVP + escolher um presente) antes de mandar o link geral.
21. Publicar o link definitivo.

**Fase 6 — Header/footer dinâmicos, RSVP restrito, QR em popup, revisão A11y/segurança/UX**

Arquitetura: header e footer passam a ser gerados uma vez em `js/app.js` (função que monta o HTML e injeta num `<div id="siteHeader">`/`<div id="siteFooter">` vazio em cada página) em vez de HTML duplicado em `index.html`/`rsvp.html`/`presentes.html` — evita as 3 cópias saírem de sincronia. Nav com os mesmos 6 links em toda página; em `rsvp.html`/`presentes.html` os links de âncora apontam para `index.html#secao`.

22. **Header fixo, fundo vinho, com 2 estados por scroll** (todas as páginas):
    - Estado topo: nomes + data + "til death do us part", menores que o hero atual (pensado pra desktop).
    - Estado "rolado": nomes viram um "logo" compacto à esquerda, abas centralizadas — troca de estado via `IntersectionObserver` observando um sentinela no topo da página (mais barato que listener de `scroll`).
23. **Footer fixo/vinho, revelado só ao chegar no fim da página** (todas as páginas) — `IntersectionObserver` com fade-in quando o footer entra na viewport.
24. **Presentes:** renomear botão "Escolher" → "Gerar Pix QR Code"; QR passa a abrir num popup real (`<dialog>` nativo — foco preso, Esc fecha, `aria-modal`) com o QR e um botão "Copiar código Pix" (`navigator.clipboard.writeText` do payload BR Code, com mensagem de sucesso/erro).
25. **RSVP:** remover as perguntas de churrasco e bebida (form + `Code.gs` para de gravar essas colunas — as colunas `Churrasco`/`Bebida` da aba RSVPs ficam obsoletas, mesmo padrão da remoção do `NomeDeQuemEscolheu`: você apaga manualmente depois).
26. **RSVP:** autocomplete nos campos de acompanhante (mesma lista de convidados do campo principal) e validação estrita — nome principal e nomes de acompanhantes só podem ser um match exato (case/espaço-insensível) de um nome da lista vinda do `doGet`; bloquear envio com erro inline se não bater.
27. **Revisão geral de acessibilidade/segurança/UX** depois das mudanças acima: contraste de texto sobre o novo header vinho (usar osso, não ouro, pro texto — ouro sobre vinho tem contraste fraco), labels/`aria-*` no popup e nos campos restritos, foco visível e navegação por teclado no `<dialog>`, `alt` nas fotos de presentes, e checagem de que nada novo (popup, clipboard) abre brecha de XSS — tudo via `textContent`/DOM, sem `innerHTML` com dado externo.

## Em aberto para a sessão com o Claude Code

- Nome do repositório / URL final do GitHub Pages
- Lista definitiva de presentes com valores (a partir de R$25, incrementos de R$25, + 1 valor livre)
- Textos e tom do site (convite, mensagens de confirmação etc.)
