(function () {
  const form = document.getElementById('formRsvp');
  const listaConvidados = document.getElementById('listaConvidados');
  const qtdInput = document.getElementById('qtdAcompanhantes');
  const acompanhantesContainer = document.getElementById('acompanhantesContainer');
  const botaoEnviar = document.getElementById('botaoEnviar');
  const mensagemErro = document.getElementById('mensagemErro');
  const confirmacao = document.getElementById('confirmacao');

  let nomesConvidados = [];

  fetch(APP_CONFIG.EXEC_URL)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      nomesConvidados = data.nomes || [];
      nomesConvidados.forEach(function (nome) {
        const option = document.createElement('option');
        option.value = nome;
        listaConvidados.appendChild(option);
      });
    })
    .catch(function () {
      // autocomplete é só uma ajuda; se a lista não carregar, a validação abaixo
      // vai barrar o envio até a página ser recarregada com sucesso
    });

  function nomeValido(valor) {
    const alvo = valor.trim().toLowerCase();
    if (!alvo) return false;
    return nomesConvidados.some(function (nome) {
      return nome.trim().toLowerCase() === alvo;
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

    const nomeInput = document.getElementById('nome');
    const acompanhanteInputs = Array.from(document.querySelectorAll('.acompanhante-input'));

    if (!nomesConvidados.length) {
      mensagemErro.textContent = 'A lista de convidados ainda não carregou. Recarregue a página e tente de novo.';
      mensagemErro.hidden = false;
      return;
    }

    if (!nomeValido(nomeInput.value)) {
      mensagemErro.textContent = 'Não encontramos esse nome na lista de convidados. Escolha um nome da lista.';
      mensagemErro.hidden = false;
      nomeInput.focus();
      return;
    }

    const acompanhanteInvalido = acompanhanteInputs.find(function (input) {
      return !nomeValido(input.value);
    });
    if (acompanhanteInvalido) {
      mensagemErro.textContent = 'Um dos acompanhantes não está na lista de convidados. Escolha um nome da lista para cada acompanhante.';
      mensagemErro.hidden = false;
      acompanhanteInvalido.focus();
      return;
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

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = 'Enviando...';

    fetch(APP_CONFIG.EXEC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.ok) { throw new Error(data.erro || 'Erro ao enviar'); }
        form.hidden = true;
        confirmacao.hidden = false;
      })
      .catch(function () {
        mensagemErro.textContent = 'Não foi possível enviar sua confirmação. Tente novamente em instantes.';
        mensagemErro.hidden = false;
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = 'Confirmar presença';
      });
  });
})();
