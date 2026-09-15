# Apps Script — deploy e teste

## 1. Planilha

Pronta: [Casamento - RSVP e Convidados](https://docs.google.com/spreadsheets/d/1JfeTdoMXUlDjca5QzalbdbN87l4eL9mOq-J-h9qdKow/edit) — já criada com as 3 abas e cabeçalhos, e a aba **Convidados** já preenchida com os nomes de `convidados.txt`.

- **Convidados**: `Nome`
- **RSVPs**: `Timestamp | Nome | Telefone | QtdAcompanhantes | NomesAcompanhantes | Churrasco | Bebida`
- **PresentesEscolhidos**: `Timestamp | Presente | Valor | NomeDeQuemEscolheu` (usada só na Fase 4, por enquanto só o cabeçalho)

Preencha a aba **Convidados** com a lista de nomes (um por linha, coluna A).

## 2. Colar o script

Na planilha: **Extensões → Apps Script**. Apague o conteúdo padrão de `Código.gs` e cole o conteúdo de `Code.gs` deste diretório.

## 3. Publicar como Web App

**Implantar → Nova implantação**:
- Tipo: **App da Web**
- Executar como: **Eu** (sua conta)
- Quem pode acessar: **Qualquer pessoa**

Copie a URL gerada (termina em `/exec`).

## 4. Testar os endpoints isoladamente

```bash
# doGet — deve devolver {"nomes": [...]}
curl "https://script.google.com/macros/s/SEU_ID/exec"

# doPost — deve devolver {"ok": true} e criar uma linha em RSVPs
curl -X POST "https://script.google.com/macros/s/SEU_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"nome":"Teste","telefone":"11999999999","qtdAcompanhantes":1,"nomesAcompanhantes":"Fulano","churrasco":true,"bebida":true}'
```

Confira na aba **RSVPs** se a linha apareceu certa.

> **Nota para o front-end (Fase 2):** ao chamar `fetch()` no `doPost`, use `Content-Type: text/plain;charset=utf-8` (não `application/json`) para o navegador não disparar um preflight OPTIONS — o Apps Script não responde a OPTIONS e a chamada falharia. O `e.postData.contents` chega como texto de qualquer forma; o `JSON.parse` no `Code.gs` já dá conta disso.

## 5. Cada vez que editar o Code.gs

Web Apps do Apps Script **não** atualizam sozinhos ao salvar — é preciso ir em **Implantar → Gerenciar implantações → editar (ícone de lápis) → Nova versão → Implantar** para a URL `/exec` passar a servir a versão nova.
