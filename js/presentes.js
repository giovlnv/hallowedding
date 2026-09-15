(function () {
  const lista = document.getElementById('listaPresentes');
  const mensagemErro = document.getElementById('mensagemErro');
  const qrDialog = document.getElementById('qrDialog');
  const qrDescricao = document.getElementById('qrDescricao');
  const qrCanvas = document.getElementById('qrCanvas');
  const pixCopiaCola = document.getElementById('pixCopiaCola');
  const copiarPix = document.getElementById('copiarPix');
  const mensagemCopiado = document.getElementById('mensagemCopiado');
  const fecharQr = document.getElementById('fecharQr');

  let payloadAtual = '';

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

  const VALOR_LIVRE_NOME = 'Patrocinar a lua de mel';

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
      imagem.setAttribute('aria-hidden', 'true');
    }
    card.appendChild(imagem);

    const nome = document.createElement('p');
    nome.className = 'presente-nome';
    nome.textContent = presente.nome;
    card.appendChild(nome);

    if (presente.nome === VALOR_LIVRE_NOME) {
      const inputValor = document.createElement('input');
      inputValor.type = 'text';
      inputValor.inputMode = 'decimal';
      inputValor.placeholder = 'Valor em R$';
      inputValor.className = 'valor-livre-input';
      inputValor.setAttribute('aria-label', 'Valor em reais para patrocinar a lua de mel');
      card.appendChild(inputValor);

      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'botao-escolher valor-livre-botao';
      botao.textContent = 'Gerar Pix';
      botao.addEventListener('click', function () {
        // Aceita vírgula ou ponto como separador decimal (ex.: "150,50").
        const valor = parseFloat(inputValor.value.trim().replace(',', '.'));
        if (!valor || valor <= 0) {
          inputValor.focus();
          return;
        }
        mostrarQr({ nome: presente.nome, valor: valor });
      });
      card.appendChild(botao);

      return card;
    }

    const valor = document.createElement('p');
    valor.className = 'presente-valor';
    valor.textContent = formatarReais(presente.valor);
    card.appendChild(valor);

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao-escolher';
    botao.textContent = 'Gerar Pix';
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
    mensagemCopiado.textContent = '';

    payloadAtual = gerarPixPayload(presente.valor, presente.nome);

    qrCanvas.innerHTML = '';
    new QRCode(qrCanvas, {
      text: payloadAtual,
      width: 220,
      height: 220
    });

    qrDescricao.textContent = presente.nome + ' — ' + formatarReais(presente.valor);
    pixCopiaCola.textContent = payloadAtual;

    if (typeof qrDialog.showModal === 'function') {
      qrDialog.showModal();
    } else {
      qrDialog.setAttribute('open', '');
    }

    fetch(APP_CONFIG.EXEC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ tipo: 'presente', presente: presente.nome, valor: presente.valor })
    }).catch(function () {
      // log opcional, não deve travar a experiência de quem está escolhendo o presente
    });
  }

  function fecharDialog() {
    if (typeof qrDialog.close === 'function') {
      qrDialog.close();
    } else {
      qrDialog.removeAttribute('open');
    }
  }

  fecharQr.addEventListener('click', fecharDialog);

  copiarPix.addEventListener('click', function () {
    if (!payloadAtual) return;
    navigator.clipboard.writeText(payloadAtual)
      .then(function () {
        mensagemCopiado.textContent = 'Código copiado!';
      })
      .catch(function () {
        mensagemCopiado.textContent = 'Não foi possível copiar automaticamente — selecione o código acima manualmente.';
      });
  });

  fetch(APP_CONFIG.EXEC_URL)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      const presentes = (data.presentes || []).slice().sort(function (a, b) {
        if (a.nome === VALOR_LIVRE_NOME) return 1;
        if (b.nome === VALOR_LIVRE_NOME) return -1;
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
