# Casamento — Giovanna & Giuliana

Site do casamento de Giovanna & Giuliana, 31 de outubro de 2026. No ar em **giovlnv.github.io/hallowedding**.

## O que o site faz

- **Página inicial** (`index.html`) — sobre o casal, informações da festa, como chegar, FAQ.
- **RSVP** (`rsvp.html`) — formulário de confirmação de presença com autocomplete de nome (acento/case-insensível) contra a lista de convidados, campos dinâmicos de acompanhante, validação estrita antes do envio.
- **Lista de presentes** (`presentes.html`) — catálogo de presentes de humor com geração de QR code Pix na hora, direto no navegador, sem passar por nenhum servidor de pagamento.

## Stack

- HTML/CSS/JavaScript puro (sem framework, sem build step)
- Hospedagem estática no GitHub Pages
- Backend em Google Apps Script (Web App) lendo/gravando numa Google Sheets — ver `apps-script/README.md` para deploy
- Geração de QR Pix (payload BR Code + checksum CRC16) 100% client-side em `js/pix.js`
- CI no GitHub Actions (`.github/workflows/checks.yml`): sintaxe JS, validade de HTML, referências locais quebradas — roda em todo push/PR pra `main`, sem segredos

## Estrutura

```
index.html, rsvp.html, presentes.html   → as 3 páginas do site
js/app.js         → config compartilhada (URL do backend) + header/footer dinâmicos
js/pix.js         → geração do payload Pix BR Code
js/rsvp.js        → autocomplete de nomes + envio do formulário
js/presentes.js   → catálogo de presentes + geração de QR
css/style.css      → identidade visual (gótico-vitoriano: Cormorant SC/Garamond, Pinyon Script)
img/               → fotos dos presentes (ver img/README.md)
apps-script/       → Code.gs (backend) + instruções de deploy
scripts/check-refs.js → checagem de referências locais quebradas, usada pelo CI
```

## Dados (Google Sheets, 3 abas)

1. **Convidados** — `Nome`, `Presentes`, `Preço` (lista de convidados e catálogo de presentes na mesma aba)
2. **RSVPs** — `Timestamp, Nome, Telefone, QtdAcompanhantes, NomesAcompanhantes`
3. **PresentesEscolhidos** — log opcional: `Timestamp, Presente, Valor`

## Backend (Apps Script)

- `doGet` — busca de convidados por substring (mínimo 3 caracteres, acento/case-insensível) + lista completa de presentes
- `doPost` — grava RSVP ou presente escolhido

Instruções completas de deploy em [`apps-script/README.md`](apps-script/README.md).

## Chave Pix

Chave aleatória (EVP) do Mercado Pago/Mercado Livre.
