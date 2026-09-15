(function () {
  const form = document.getElementById('formRsvp');
  const listaConvidados = document.getElementById('listaConvidados');
  const qtdInput = document.getElementById('qtdAcompanhantes');
  const acompanhantesContainer = document.getElementById('acompanhantesContainer');
  const botaoEnviar = document.getElementById('botaoEnviar');
  const mensagemErro = document.getElementById('mensagemErro');
  const confirmacao = document.getElementById('confirmacao');
  const nomeInput = document.getElementById('nome');

  const MIN_CARACTERES_BUSCA = 3;
  let timeoutBusca = null;

  // A lista completa de convidados nunca fica disponível no cliente — cada
  // busca traz só os nomes que batem com o que já foi digitado (mínimo de
  // 3 caracteres), evitando expor a lista inteira pra quem abre o site.
  function buscarNomes(termo) {
    const busca = termo.trim();
    if (busca.length < MIN_CARACTERES_BUSCA) {
      return Promise.resolve([]);
    }
    return fetch(APP_CONFIG.EXEC_URL + '?busca=' + encodeURIComponent(busca))
      .then(function (res) { return res.json(); })
      .then(function (data) { return data.nomes || []; })
      .catch(function () { return []; });
  }

  function atualizarDatalist(nomes) {
    listaConvidados.innerHTML = '';
    nomes.forEach(function (nome) {
      const option = document.createElement('option');
      option.value = nome;
      listaConvidados.appendChild(option);
    });
  }

  function aoDigitar(event) {
    const valor = event.target.value;
    clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(function () {
      buscarNomes(valor).then(atualizarDatalist);
    }, 250);
  }

  nomeInput.addEventListener('input', aoDigitar);

  function nomeValido(valor) {
    const alvo = valor.trim();
    if (alvo.length < MIN_CARACTERES_BUSCA) return Promise.resolve(false);
    return buscarNomes(alvo).then(function (nomes) {
      const alvoMin = alvo.toLowerCase();
      return nomes.some(function (nome) { return nome.trim().toLowerCase() === alvoMin; });
    });
  }

  function renderAcompanhantes(qtd) {
    acompanhantesContainer.innerHTML = '';
    for (let i = 0; i < qtd; i++) {
      const campo = document.createElement('div');
      campo.className = 'campo';

      const label = document.createElement('label');
      label.setAttribute('for', 'acompanhante' + i);
      label.textContent = 'Nome do acompanhante ' + (i + 1);

      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'acompanhante' + i;
      input.className = 'acompanhante-input';
      input.setAttribute('list', 'listaConvidados');
      input.autocomplete = 'off';
      input.required = true;
      input.addEventListener('input', aoDigitar);

      campo.appendChild(label);
      campo.appendChild(input);
      acompanhantesContainer.appendChild(campo);
    }
  }

  qtdInput.addEventListener('input', function () {
    const qtd = Math.max(0, Math.min(10, parseInt(qtdInput.value, 10) || 0));
    renderAcompanhantes(qtd);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    mensagemErro.hidden = true;

    const acompanhanteInputs = Array.from(document.querySelectorAll('.acompanhante-input'));

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = 'Verificando...';

    const verificacoes = [nomeValido(nomeInput.value)].concat(
      acompanhanteInputs.map(function (input) { return nomeValido(input.value); })
    );

    Promise.all(verificacoes)
      .then(function (resultados) {
        if (!resultados[0]) {
          mensagemErro.textContent = 'Não encontramos esse nome na lista de convidados. Escolha um nome da lista.';
          mensagemErro.hidden = false;
          nomeInput.focus();
          throw new Error('validacao');
        }

        const indiceInvalido = resultados.slice(1).findIndex(function (valido) { return !valido; });
        if (indiceInvalido !== -1) {
          mensagemErro.textContent = 'Um dos acompanhantes não está na lista de convidados. Escolha um nome da lista para cada acompanhante.';
          mensagemErro.hidden = false;
          acompanhanteInputs[indiceInvalido].focus();
          throw new Error('validacao');
        }

        const nomesAcompanhantes = acompanhanteInputs
          .map(function (input) { return input.value.trim(); })
          .join(', ');

        const payload = {
          nome: nomeInput.value.trim(),
          telefone: document.getElementById('telefone').value.trim(),
          qtdAcompanhantes: parseInt(qtdInput.value, 10) || 0,
          nomesAcompanhantes: nomesAcompanhantes
        };

        botaoEnviar.textContent = 'Enviando...';

        return fetch(APP_CONFIG.EXEC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (!data.ok) { throw new Error(data.erro || 'Erro ao enviar'); }
            form.hidden = true;
            confirmacao.hidden = false;
          });
      })
      .catch(function (erro) {
        if (erro && erro.message === 'validacao') {
          botaoEnviar.disabled = false;
          botaoEnviar.textContent = 'Confirmar presença';
          return;
        }
        mensagemErro.textContent = 'Não foi possível enviar sua confirmação. Tente novamente em instantes.';
        mensagemErro.hidden = false;
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = 'Confirmar presença';
      });
  });
})();
