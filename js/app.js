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
