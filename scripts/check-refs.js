// Confere que toda referência local (script/link/img nas páginas HTML, e o
// mapa FOTOS_PRESENTES em js/presentes.js) aponta pra um arquivo que existe
// de fato no repositório. Rodado pelo CI (.github/workflows/checks.yml).
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let erros = 0;

function existeLocal(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function checarHtml(arquivo) {
  const html = fs.readFileSync(path.join(ROOT, arquivo), 'utf8');
  const re = /(?:src|href)="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (/^([a-z]+:)?\/\//i.test(url) || url.startsWith('#') || url.startsWith('mailto:')) continue;
    const semAncora = url.split('#')[0];
    if (!semAncora) continue;
    if (!existeLocal(semAncora)) {
      console.error(`${arquivo}: referência quebrada "${url}"`);
      erros++;
    }
  }
}

function checarFotosPresentes() {
  const js = fs.readFileSync(path.join(ROOT, 'js/presentes.js'), 'utf8');
  const re = /'(img\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+)'/g;
  let m;
  while ((m = re.exec(js))) {
    const caminho = m[1];
    if (!existeLocal(caminho)) {
      console.error(`js/presentes.js: FOTOS_PRESENTES aponta pra arquivo inexistente "${caminho}"`);
      erros++;
    }
  }
}

['index.html', 'rsvp.html', 'presentes.html'].forEach(checarHtml);
checarFotosPresentes();

if (erros > 0) {
  console.error(`\n${erros} referência(s) quebrada(s).`);
  process.exit(1);
}
console.log('Todas as referências locais conferidas — nenhuma quebrada.');
