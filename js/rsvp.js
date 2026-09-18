(function () {
  const form = document.getElementById('formRsvp');
  const qtdInput = document.getElementById('qtdAcompanhantes');
  const acompanhantesContainer = document.getElementById('acompanhantesContainer');
  const botaoEnviar = document.getElementById('botaoEnviar');
  const mensagemErro = document.getElementById('mensagemErro');
  const confirmacao = document.getElementById('confirmacao');
  const nomeInput = document.getElementById('nome');

  const MIN_CARACTERES_BUSCA = 3;

  function normalizar(texto) {
    return (texto || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

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

  // O <datalist> nativo do navegador filtra as opções exibidas comparando o
  // texto digitado byte a byte — ele não sabe que "joao" e "João" são o
  // mesmo nome nem que "JOAO" e "joao" também são. Isso fazia a sugestão
  // sumir mesmo quando o servidor já tinha retornado o nome certo. Por isso
  // cada campo de nome ganha seu próprio dropdown customizado (uma <ul>
  // logo abaixo do input) que exibe exatamente o que o servidor devolveu,
  // sem re-filtrar por conta própria.
  function criarAutocomplete(input) {
    const wrapper = input.closest('.autocomplete-wrapper');
    const lista = wrapper.querySelector('.sugestoes-nome');
    let timeoutBusca = null;

    function esconder() {
      lista.hidden = true;
      lista.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
    }

    function mostrar(nomes) {
      lista.innerHTML = '';
      if (!nomes.length) {
        esconder();
        return;
      }
      nomes.forEach(function (nome) {
        const item = document.createElement('li');
        item.textContent = nome;
        item.setAttribute('role', 'option');
        // mousedown (não click) dispara antes do blur do input, então o
        // valor é preenchido antes da lista sumir.
        item.addEventListener('mousedown', function (event) {
          event.preventDefault();
          input.value = nome;
          esconder();
        });
        lista.appendChild(item);
      });
      lista.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('input', function () {
      const valor = input.value;
      clearTimeout(timeoutBusca);
      timeoutBusca = setTimeout(function () {
        buscarNomes(valor).then(mostrar);
      }, 250);
    });

    input.addEventListener('blur', function () {
      // Delay pra permitir que o mousedown de um item da lista seja
      // processado antes do blur escondê-la.
      setTimeout(esconder, 150);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') esconder();
    });
  }

  criarAutocomplete(nomeInput);

  function nomeValido(valor) {
    const alvo = valor.trim();
    if (alvo.length < MIN_CARACTERES_BUSCA) return Promise.resolve(false);
    return buscarNomes(alvo).then(function (nomes) {
      const alvoNorm = normalizar(alvo);
      return nomes.some(function (nome) { return normalizar(nome) === alvoNorm; });
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

      const wrapper = document.createElement('div');
      wrapper.className = 'autocomplete-wrapper';

      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'acompanhante' + i;
      input.className = 'acompanhante-input';
      input.autocomplete = 'off';
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-autocomplete', 'list');
      input.required = true;

      const sugestoes = document.createElement('ul');
      sugestoes.className = 'sugestoes-nome';
      sugestoes.setAttribute('role', 'listbox');
      sugestoes.hidden = true;

      wrapper.appendChild(input);
      wrapper.appendChild(sugestoes);

      campo.appendChild(label);
      campo.appendChild(wrapper);
      acompanhantesContainer.appendChild(campo);

      criarAutocomplete(input);
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
