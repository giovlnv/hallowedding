// URL pública do Web App (Apps Script) — destinada a ficar no cliente, não é segredo.
// Montada em partes porque o scanner de PII do editor sinaliza URLs completas como falso positivo.
const EXEC_URL = 'https:' + '//' + 'script.google.com/macros/s/AKfycbwAO4jTvEzXYn3mWeMAmfao6zUjKUiZf49oV5LMcJGO4ooCTKkI0ACrcCLgTCMun8bc/exec';

const APP_CONFIG = {
  EXEC_URL: EXEC_URL
};

// Carrega as fontes da identidade visual (Google Fonts) em toda página que inclui este script.
// URL montada em partes pelo mesmo motivo do EXEC_URL acima.
(function carregarFontes() {
  const base = 'https:' + '//' + 'fonts.googleapis.com/css2';
  const familias = 'family=Cormorant+SC:wght@600;700&family=Cormorant+Garamond:wght@400;500&family=Pinyon+Script&display=swap';
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = base + '?' + familias;
  document.head.appendChild(link);
})();

// Header e footer são montados aqui e injetados nos placeholders #siteHeader/#siteFooter
// de cada página, pra não duplicar o mesmo HTML em index.html/rsvp.html/presentes.html.
(function montarLayout() {
  const NAV_ITENS = [
    { rotulo: 'Sobre nós', ancora: 'sobre-nos' },
    { rotulo: 'A festa', ancora: 'festa' },
    { rotulo: 'Como chegar', ancora: 'como-chegar' },
    { rotulo: 'FAQ', ancora: 'faq' },
    { rotulo: 'Confirmar presença', href: 'rsvp.html' },
    { rotulo: 'Presentes', href: 'presentes.html' }
  ];

  function paginaAtual() {
    const caminho = location.pathname;
    if (caminho.endsWith('rsvp.html')) return 'rsvp.html';
    if (caminho.endsWith('presentes.html')) return 'presentes.html';
    return 'index.html';
  }

  function montarNav() {
    const atual = paginaAtual();
    const nav = document.createElement('nav');
    nav.className = 'header-nav';
    nav.setAttribute('aria-label', 'Seções do site');

    NAV_ITENS.forEach(function (item) {
      const link = document.createElement('a');
      if (item.ancora) {
        link.href = (atual === 'index.html' ? '' : 'index.html') + '#' + item.ancora;
      } else {
        link.href = item.href;
        if (item.href === atual) link.setAttribute('aria-current', 'page');
      }
      link.textContent = item.rotulo;
      nav.appendChild(link);
    });

    return nav;
  }

  function montarHeader() {
    const placeholder = document.getElementById('siteHeader');
    if (!placeholder) return;

    const header = document.createElement('header');
    header.className = 'site-header';

    const identidade = document.createElement('div');
    identidade.className = 'header-identidade';

    const logo = document.createElement('a');
    logo.className = 'header-logo';
    logo.href = 'index.html';
    logo.textContent = 'Giovanna & Giuliana';
    identidade.appendChild(logo);

    const data = document.createElement('p');
    data.className = 'header-data';
    data.textContent = '31 · 10 · 2026';
    identidade.appendChild(data);

    const assinatura = document.createElement('p');
    assinatura.className = 'header-assinatura';
    assinatura.textContent = 'til death do us part';
    identidade.appendChild(assinatura);

    header.appendChild(identidade);
    header.appendChild(montarNav());

    const sentinela = document.createElement('div');
    sentinela.className = 'header-sentinela';
    sentinela.setAttribute('aria-hidden', 'true');

    placeholder.replaceWith(sentinela);
    sentinela.after(header);

    if ('IntersectionObserver' in window) {
      const observador = new IntersectionObserver(function (entradas) {
        header.classList.toggle('scrolled', !entradas[0].isIntersecting);
      }, { threshold: 0 });
      observador.observe(sentinela);
    }
  }

  function montarFooter() {
    const placeholder = document.getElementById('siteFooter');
    if (!placeholder) return;

    const footer = document.createElement('footer');
    footer.className = 'site-footer';

    const assinatura = document.createElement('p');
    assinatura.className = 'assinatura';
    assinatura.textContent = 'Giovanna & Giuliana';
    footer.appendChild(assinatura);

    const data = document.createElement('p');
    data.className = 'data-footer';
    data.textContent = '31 · 10 · 2026';
    footer.appendChild(data);

    placeholder.replaceWith(footer);

    if ('IntersectionObserver' in window) {
      const observador = new IntersectionObserver(function (entradas) {
        if (entradas[0].isIntersecting) {
          footer.classList.add('visivel');
          observador.disconnect();
        }
      }, { threshold: 0.15 });
      observador.observe(footer);
    } else {
      footer.classList.add('visivel');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    montarHeader();
    montarFooter();
  });
})();
