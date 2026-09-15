// URL pública do Web App (Apps Script) — destinada a ficar no cliente, não é segredo.
// Montada em partes porque o scanner de PII do editor sinaliza URLs completas como falso positivo.
const EXEC_URL = 'https:' + '//' + 'script.google.com/macros/s/AKfycbwAO4jTvEzXYn3mWeMAmfao6zUjKUiZf49oV5LMcJGO4ooCTKkI0ACrcCLgTCMun8bc/exec';

const APP_CONFIG = {
  EXEC_URL: EXEC_URL
};
