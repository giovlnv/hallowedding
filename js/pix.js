// Gera o payload BR Code (Pix "copia e cola") no navegador, sem backend.
// Chave aleatória do Mercado Pago — não é segredo (uma chave Pix serve só para receber).
const CHAVE_PIX = '79019b12-b967-4660-afdc-734b70d0ee7f';
const NOME_RECEBEDOR = 'GIOVANNA APARECIDA VILLAN'; // truncado a 25 caracteres, limite do padrão EMV
const CIDADE_RECEBEDOR = 'SAO PAULO';

function tlv(id, valor) {
  const texto = String(valor);
  if (texto.length > 99) {
    throw new RangeError(`Valor excede o limite do campo ${id}`);
  }
  return id + String(texto.length).padStart(2, '0') + texto;
}

function crc16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatarValor(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) {
    throw new TypeError('O valor do Pix deve ser um número não negativo.');
  }
  return numero.toFixed(2);
}

function limitarTexto(texto, tamanho) {
  return String(texto).slice(0, tamanho);
}

function gerarPixPayload(valor, descricao) {
  const merchantAccountInfo =
    tlv('00', 'BR.GOV.BCB.PIX') +
    tlv('01', CHAVE_PIX) +
    tlv('02', limitarTexto(descricao, 35));

  const additionalData = tlv('05', '***');

  const semCrc =
    tlv('00', '01') +
    tlv('26', merchantAccountInfo) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', formatarValor(valor)) +
    tlv('58', 'BR') +
    tlv('59', limitarTexto(NOME_RECEBEDOR, 25)) +
    tlv('60', limitarTexto(CIDADE_RECEBEDOR, 15)) +
    tlv('62', additionalData) +
    '6304';

  return semCrc + crc16(semCrc);
}
