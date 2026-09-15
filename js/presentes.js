(function () {
  const lista = document.getElementById('listaPresentes');
  const mensagemErro = document.getElementById('mensagemErro');
  const qrArea = document.getElementById('qrArea');
  const qrDescricao = document.getElementById('qrDescricao');
  const qrCanvas = document.getElementById('qrCanvas');
  const fecharQr = document.getElementById('fecharQr');

  function formatarReais(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Fotos livres de direitos (Pexels License) para os presentes que têm um
  // equivalente temático genérico e não-ofensivo. Ver img/README.md para
  // fonte e licença de cada arquivo. Chave = nome exato do presente na planilha.
  const FOTOS_PRESENTES = {
    'VALE PLAYLIST: Pular uma música da Taylor': 'img/fone-de-ouvido.jpg',
    'VALE PLAYLIST: Pedir uma música fora da playlist': 'img/vinil.jpg',
    'Café pra Giu não ficar emburrada': 'img/cafe.jpg',
    'Churu pras meninas (Olivia, Shadow e Nekoma)': 'img/gato.jpg',
    'Shot com as noivas': 'img/brinde.jpg',
    'VALE PLAYLIST: 10 min sem KPop': 'img/celular-musica.jpg',
    'VALE PLAYLIST: 10 min sem Taylor': 'img/microfone.jpg',
    'Dar pitaco no vestido da Giu': 'img/vestido-noiva.jpg'
  };

  function criarCard(presente) {
    const card = document.createElement('div');
    card.className = 'presente-card';

    const arquivoFoto = FOTOS_PRESENTES[presente.nome];
    let imagem;
    if (arquivoFoto) {
      imagem = document.createElement('img');
      imagem.className = 'presente-foto';
      imagem.src = arquivoFoto;
      imagem.alt = presente.nome;
      imagem.loading = 'lazy';
    } else {
      imagem = document.createElement('div');
      imagem.className = 'imagem-placeholder';
    }
    card.appendChild(imagem);

    const nome = document.createElement('p');
    nome.className = 'presente-nome';
    nome.textContent = presente.nome;
    card.appendChild(nome);

    const valor = document.createElement('p');
    valor.className = 'presente-valor';
    valor.textContent = formatarReais(presente.valor);
    card.appendChild(valor);

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao-escolher';
    botao.textContent = 'Escolher';
    botao.addEventListener('click', function () {
      mostrarQr(presente);
    });
    card.appendChild(botao);

    return card;
  }

  function mostrarQr(presente) {
    if (typeof QRCode === 'undefined') {
      mensagemErro.textContent = 'O gerador de QR ainda está carregando. Tente de novo em um instante.';
      mensagemErro.hidden = false;
      return;
    }
    mensagemErro.hidden = true;

    const payload = gerarPixPayload(presente.valor, presente.nome);

    qrCanvas.innerHTML = '';
    new QRCode(qrCanvas, {
      text: payload,
      width: 220,
      height: 220
    });

    qrDescricao.textContent = presente.nome + ' — ' + formatarReais(presente.valor);
    qrArea.hidden = false;
    qrArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

    fetch(APP_CONFIG.EXEC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ tipo: 'presente', presente: presente.nome, valor: presente.valor })
    }).catch(function () {
      // log opcional, não deve travar a experiência de quem está escolhendo o presente
    });
  }

  fecharQr.addEventListener('click', function () {
    qrArea.hidden = true;
  });

  fetch(APP_CONFIG.EXEC_URL)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      const presentes = (data.presentes || []).slice().sort(function (a, b) {
        return Number(a.valor) - Number(b.valor);
      });
      presentes.forEach(function (presente) {
        lista.appendChild(criarCard(presente));
      });
    })
    .catch(function () {
      mensagemErro.textContent = 'Não foi possível carregar a lista de presentes agora. Tente novamente em instantes.';
      mensagemErro.hidden = false;
    });
})();
