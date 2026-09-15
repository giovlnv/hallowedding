(function () {
  const form = document.getElementById('formRsvp');
  const listaConvidados = document.getElementById('listaConvidados');
  const qtdInput = document.getElementById('qtdAcompanhantes');
  const acompanhantesContainer = document.getElementById('acompanhantesContainer');
  const botaoEnviar = document.getElementById('botaoEnviar');
  const mensagemErro = document.getElementById('mensagemErro');
  const confirmacao = document.getElementById('confirmacao');

  fetch(APP_CONFIG.EXEC_URL)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      (data.nomes || []).forEach(function (nome) {
        const option = document.createElement('option');
        option.value = nome;
        listaConvidados.appendChild(option);
      });
    })
    .catch(function () {
      // autocomplete é só uma ajuda; se falhar, o campo de nome continua livre
    });

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

    const nomesAcompanhantes = Array.from(document.querySelectorAll('.acompanhante-input'))
      .map(function (input) { return input.value.trim(); })
      .filter(Boolean)
      .join(', ');

    const payload = {
      nome: document.getElementById('nome').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      qtdAcompanhantes: parseInt(qtdInput.value, 10) || 0,
      nomesAcompanhantes: nomesAcompanhantes,
      churrasco: form.querySelector('input[name="churrasco"]:checked').value === 'sim',
      bebida: form.querySelector('input[name="bebida"]:checked').value === 'sim'
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
