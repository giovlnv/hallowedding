// Web App único: doGet devolve presentes (sempre) + convidados que batem com uma busca
// (só quando pedida, pra não expor a lista inteira de convidados), doPost grava RSVP ou
// log de presente escolhido.
// Deploy: Extensões > Apps Script na planilha, colar este arquivo, "Implantar" > "Nova implantação" > tipo "App da Web".

const SHEET_CONVIDADOS = 'Convidados';
const SHEET_RSVPS = 'RSVPs';
const SHEET_PRESENTES_ESCOLHIDOS = 'PresentesEscolhidos';
const BUSCA_MIN_CARACTERES = 3;
const BUSCA_MAX_RESULTADOS = 10;

function normalizar(texto) {
  return (texto || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONVIDADOS);
    if (!sheet) {
      return jsonError('Aba "' + SHEET_CONVIDADOS + '" não encontrada na planilha.');
    }
    const values = sheet.getDataRange().getValues();
    const cabecalho = values[0];
    const linhas = values.slice(1);

    const colNome = cabecalho.indexOf('Nome');
    const colPresente = cabecalho.indexOf('Presentes');
    const colValor = cabecalho.indexOf('Preço');

    const buscaOriginal = ((e.parameter && e.parameter.busca) || '').trim();
    const busca = normalizar(buscaOriginal);
    let nomes = [];
    if (buscaOriginal.length >= BUSCA_MIN_CARACTERES) {
      nomes = linhas
        .map(function (row) { return row[colNome]; })
        .filter(function (nome) { return nome && normalizar(nome).indexOf(busca) !== -1; })
        .slice(0, BUSCA_MAX_RESULTADOS);
    }

    const presentes = linhas
      .map(function (row) { return { nome: row[colPresente], valor: row[colValor] }; })
      .filter(function (p) { return p.nome && p.valor; });

    return ContentService
      .createTextOutput(JSON.stringify({ nomes: nomes, presentes: presentes }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonError('Erro ao buscar dados: ' + err.message);
  }
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonError('JSON inválido no corpo da requisição.');
  }

  if (body.tipo === 'presente') {
    return gravarPresenteEscolhido(body);
  }

  return gravarRsvp(body);
}

function gravarRsvp(body) {
  if (!body.nome) {
    return jsonError('Campo "nome" é obrigatório.');
  }

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RSVPS);
    if (!sheet) {
      return jsonError('Aba "' + SHEET_RSVPS + '" não encontrada na planilha.');
    }
    sheet.appendRow([
      new Date(),
      body.nome,
      body.telefone || '',
      body.qtdAcompanhantes || 0,
      body.nomesAcompanhantes || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonError('Erro ao gravar RSVP: ' + err.message);
  }
}

function gravarPresenteEscolhido(body) {
  if (!body.presente) {
    return jsonError('Campo "presente" é obrigatório.');
  }

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRESENTES_ESCOLHIDOS);
    if (!sheet) {
      return jsonError('Aba "' + SHEET_PRESENTES_ESCOLHIDOS + '" não encontrada na planilha.');
    }
    sheet.appendRow([
      new Date(),
      body.presente,
      body.valor || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonError('Erro ao gravar presente escolhido: ' + err.message);
  }
}

function jsonError(mensagem) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, erro: mensagem }))
    .setMimeType(ContentService.MimeType.JSON);
}
