// Web App único: doGet devolve a lista de convidados, doPost grava um RSVP.
// Deploy: Extensões > Apps Script na planilha, colar este arquivo, "Implantar" > "Nova implantação" > tipo "App da Web".

const SHEET_CONVIDADOS = 'Convidados';
const SHEET_RSVPS = 'RSVPs';

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONVIDADOS);
  const values = sheet.getDataRange().getValues();
  const nomes = values.slice(1).map(function (row) { return row[0]; }).filter(String);

  return ContentService
    .createTextOutput(JSON.stringify({ nomes: nomes }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonError('JSON inválido no corpo da requisição.');
  }

  if (!body.nome) {
    return jsonError('Campo "nome" é obrigatório.');
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RSVPS);
  sheet.appendRow([
    new Date(),
    body.nome,
    body.telefone || '',
    body.qtdAcompanhantes || 0,
    body.nomesAcompanhantes || '',
    body.churrasco ? 'Sim' : 'Não',
    body.bebida ? 'Sim' : 'Não'
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError(mensagem) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, erro: mensagem }))
    .setMimeType(ContentService.MimeType.JSON);
}
