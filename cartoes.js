// ======== UTILITÁRIOS ========

function getCartoes() {
  return JSON.parse(localStorage.getItem("cartoes")) || [];
}

function saveCartoes(cartoes) {
  localStorage.setItem("cartoes", JSON.stringify(cartoes));
}

// Atualiza parcelas vencidas (incrementa pagas e remove parcelas antigas)
function atualizarParcelasVencidas() {
  const cartoes = getCartoes();
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  let mudou = false;

  cartoes.forEach((cartao) => {
    cartao.parcelas.forEach((compra) => {
      const antigas = compra.parcelas.filter(
        (p) => p.ano < anoAtual || (p.ano === anoAtual && p.mes < mesAtual)
      );
      if (antigas.length > 0) {
        compra.pagas += antigas.length;
        compra.parcelas = compra.parcelas.filter(
          (p) => p.ano > anoAtual || (p.ano === anoAtual && p.mes >= mesAtual)
        );
        mudou = true;
      }
    });
  });

  if (mudou) saveCartoes(cartoes);
}

// ======== ELEMENTOS ========

const nomeCartaoInput = document.getElementById("nome-cartao");
const btnAdicionarCartao = document.getElementById("adicionar-cartao");
const selectCartao = document.getElementById("cartao-selecionado");

const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const parcelasInput = document.getElementById("parcelas");
const pagasInput = document.getElementById("pagas");
const btnAdicionarParcela = document.getElementById("adicionar-parcela");

const listaCartoesContainer = document.getElementById(
  "lista-cartoes-container"
);

// Modal e elementos modal
const modalEditar = document.getElementById("modal-editar");
const modalCartaoNome = document.getElementById("modal-cartao-nome");
const modalDescricao = document.getElementById("modal-descricao");
const modalValor = document.getElementById("modal-valor");
const modalTotalParcelas = document.getElementById("modal-total-parcelas");
const modalPagas = document.getElementById("modal-pagas");
const modalTabelaParcelasBody = document.querySelector(
  "#modal-tabela-parcelas tbody"
);
const btnSalvarEdicao = document.getElementById("salvar-edicao");
const btnFecharModal = document.getElementById("fechar-modal");

// Estado da edição atual
let idxCartaoEditando = null;
let idxParcelaEditando = null;

// ======== FUNÇÕES ========

function limparInputsCartao() {
  nomeCartaoInput.value = "";
}

function limparInputsCompra() {
  descricaoInput.value = "";
  valorInput.value = "";
  parcelasInput.value = "";
  pagasInput.value = "0";
}

// Atualiza o select de cartões no formulário de compra
function atualizarSelectCartoes() {
  const cartoes = getCartoes();
  selectCartao.innerHTML = '<option value="">Selecione o Cartão</option>';
  cartoes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.nome;
    opt.textContent = c.nome;
    selectCartao.appendChild(opt);
  });
}

// Cria a interface de um cartão na listagem com tabela de parcelas e botões
function criarCardCartao(cartao, idx) {
  const container = document.createElement("div");
  container.classList.add("cartao-item");

  // Header com nome e botões para excluir e editar parcelas
  const header = document.createElement("div");
  header.classList.add("cartao-header");

  const nome = document.createElement("span");
  nome.classList.add("cartao-nome");
  nome.textContent = cartao.nome;

  const botoesDiv = document.createElement("div");
  botoesDiv.classList.add("cartao-botoes");

  // Botão para excluir cartão
  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "Excluir Cartão";
  btnExcluir.classList.add("excluir");
  btnExcluir.addEventListener("click", () => {
    if (
      confirm(
        `Excluir cartão "${cartao.nome}"? Essa ação não pode ser desfeita.`
      )
    ) {
      excluirCartao(idx);
    }
  });

  botoesDiv.appendChild(btnExcluir);

  header.appendChild(nome);
  header.appendChild(botoesDiv);

  // Tabela de parcelas do cartão
  const tabela = document.createElement("table");
  tabela.classList.add("tabela-parcelas");

  tabela.innerHTML = `
    <thead>
      <tr>
        <th>Descrição</th>
        <th>Parcelas</th>
        <th>Valor Total (R$)</th>
        <th>Parcelas Pagas</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabela.querySelector("tbody");
  if (cartao.parcelas.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" style="text-align:center; font-style: italic;">Nenhuma compra parcelada cadastrada.</td>`;
    tbody.appendChild(tr);
  } else {
    cartao.parcelas.forEach((compra, idxCompra) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${compra.descricao}</td>
        <td>${compra.totalParcelas}x de R$${(
        compra.total / compra.totalParcelas
      ).toFixed(2)}</td>
        <td>${compra.total.toFixed(2)}</td>
        <td>${compra.pagas}</td>
        <td>
          <button class="btn-editar-parcela">Editar</button>
          <button class="btn-excluir-parcela excluir">Excluir</button>
        </td>
      `;

      // Evento editar parcela
      tr.querySelector(".btn-editar-parcela").addEventListener("click", () => {
        abrirModalEdicao(idx, idxCompra);
      });

      // Evento excluir parcela
      tr.querySelector(".btn-excluir-parcela").addEventListener("click", () => {
        if (confirm(`Excluir compra "${compra.descricao}"?`)) {
          excluirParcela(idx, idxCompra);
        }
      });

      tbody.appendChild(tr);
    });
  }

  container.appendChild(header);
  container.appendChild(tabela);

  return container;
}

// Atualiza a listagem completa de cartões
function atualizarUI() {
  const cartoes = getCartoes();
  listaCartoesContainer.innerHTML = "";

  if (cartoes.length === 0) {
    listaCartoesContainer.innerHTML = `<p style="font-style:italic; color:#666;">Nenhum cartão cadastrado ainda.</p>`;
  } else {
    cartoes.forEach((cartao, idx) => {
      const card = criarCardCartao(cartao, idx);
      listaCartoesContainer.appendChild(card);
    });
  }

  atualizarSelectCartoes();
}

// Excluir cartão
function excluirCartao(idx) {
  const cartoes = getCartoes();
  cartoes.splice(idx, 1);
  saveCartoes(cartoes);
  atualizarUI();
}

// Excluir parcela
function excluirParcela(idxCartao, idxParcela) {
  const cartoes = getCartoes();
  cartoes[idxCartao].parcelas.splice(idxParcela, 1);
  saveCartoes(cartoes);
  atualizarUI();
  fecharModal();
}

// Adicionar cartão novo
btnAdicionarCartao.addEventListener("click", () => {
  const nome = nomeCartaoInput.value.trim();
  if (!nome) return alert("Digite o nome do cartão.");

  const cartoes = getCartoes();
  if (cartoes.find((c) => c.nome.toLowerCase() === nome.toLowerCase())) {
    return alert("Esse cartão já está cadastrado.");
  }

  cartoes.push({ nome, parcelas: [] });
  saveCartoes(cartoes);
  limparInputsCartao();
  atualizarUI();
});

// Adicionar compra parcelada
btnAdicionarParcela.addEventListener("click", () => {
  const nomeCartao = selectCartao.value;
  const descricao = descricaoInput.value.trim();
  const valor = parseFloat(valorInput.value);
  const totalParcelas = parseInt(parcelasInput.value);
  const pagas = parseInt(pagasInput.value);

  if (
    !nomeCartao ||
    !descricao ||
    isNaN(valor) ||
    valor <= 0 ||
    isNaN(totalParcelas) ||
    totalParcelas <= 0 ||
    isNaN(pagas) ||
    pagas < 0 ||
    pagas >= totalParcelas
  ) {
    return alert("Preencha todos os campos corretamente.");
  }

  const cartoes = getCartoes();
  const cartao = cartoes.find((c) => c.nome === nomeCartao);
  if (!cartao) return alert("Cartão selecionado não encontrado.");

  const parcelaMensal = +(valor / totalParcelas).toFixed(2);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  // Cria as parcelas a partir da parcela atual (pagas)
  const parcelas = [];
  for (let i = pagas; i < totalParcelas; i++) {
    const data = new Date(anoAtual, mesAtual + i - pagas);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    parcelas.push({ descricao, valor: parcelaMensal, mes, ano });
  }

  cartao.parcelas.push({
    descricao,
    total: valor,
    parcelas,
    totalParcelas,
    pagas,
  });

  saveCartoes(cartoes);
  limparInputsCompra();
  atualizarUI();

  alert("Compra parcelada salva com sucesso!");
});

// ======= MODAL EDIÇÃO =======

function abrirModalEdicao(idxCartao, idxParcela) {
  const cartoes = getCartoes();
  const cartao = cartoes[idxCartao];
  const parcela = cartao.parcelas[idxParcela];
  if (!cartao || !parcela) return;

  idxCartaoEditando = idxCartao;
  idxParcelaEditando = idxParcela;

  modalCartaoNome.textContent = cartao.nome;
  modalDescricao.value = parcela.descricao;
  modalValor.value = parcela.total.toFixed(2);
  modalTotalParcelas.value = parcela.totalParcelas;
  modalPagas.value = parcela.pagas;

  renderModalParcelasTabela(parcela.parcelas);

  modalEditar.classList.remove("hidden");
}

// Renderiza as parcelas no modal (cada parcela mensal com botão excluir)
function renderModalParcelasTabela(parcelas) {
  modalTabelaParcelasBody.innerHTML = "";

  parcelas.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${String(p.mes).padStart(2, "0")}/${p.ano}</td>
      <td>${p.valor.toFixed(2)}</td>
      <td><button class="excluir" data-index="${i}">Excluir</button></td>
    `;
    modalTabelaParcelasBody.appendChild(tr);
  });

  // Eventos excluir parcela mensal dentro do modal
  modalTabelaParcelasBody.querySelectorAll("button.excluir").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idxParcelaMensal = parseInt(btn.dataset.index);
      excluirParcelaMensalModal(idxParcelaMensal);
    });
  });
}

// Excluir parcela mensal dentro do modal
function excluirParcelaMensalModal(idxParcelaMensal) {
  const cartoes = getCartoes();
  const compra = cartoes[idxCartaoEditando].parcelas[idxParcelaEditando];

  if (idxParcelaMensal < 0 || idxParcelaMensal >= compra.parcelas.length)
    return;

  if (!confirm("Excluir esta parcela mensal? Essa ação não pode ser desfeita."))
    return;

  compra.parcelas.splice(idxParcelaMensal, 1);
  compra.totalParcelas = compra.parcelas.length;
  compra.total = +compra.parcelas
    .reduce((acc, p) => acc + p.valor, 0)
    .toFixed(2);

  if (compra.pagas > compra.totalParcelas) {
    compra.pagas = compra.totalParcelas;
  }

  saveCartoes(cartoes);

  renderModalParcelasTabela(compra.parcelas);
  atualizarUI();
}

// Salvar edição do modal
btnSalvarEdicao.addEventListener("click", () => {
  const cartoes = getCartoes();
  const compra = cartoes[idxCartaoEditando].parcelas[idxParcelaEditando];

  const novaDescricao = modalDescricao.value.trim();
  const novoTotal = parseFloat(modalValor.value);
  const novoTotalParcelas = parseInt(modalTotalParcelas.value);
  let novoPagas = parseInt(modalPagas.value);

  if (
    !novaDescricao ||
    isNaN(novoTotal) ||
    novoTotal <= 0 ||
    isNaN(novoTotalParcelas) ||
    novoTotalParcelas <= 0 ||
    isNaN(novoPagas) ||
    novoPagas < 0 ||
    novoPagas > novoTotalParcelas
  ) {
    return alert("Preencha os campos corretamente.");
  }

  // Ajusta parcelas, mantendo parcelas mensais e datas. Se alterar totalParcelas, cria/remova parcelas no final
  const valorParcelaMensal = +(novoTotal / novoTotalParcelas).toFixed(2);

  // Ajusta array parcelas
  let parcelas = compra.parcelas.slice();

  // Atualiza descrição e valores nas parcelas
  parcelas.forEach((p) => {
    p.descricao = novaDescricao;
    p.valor = valorParcelaMensal;
  });

  // Ajusta quantidade parcelas se diferente
  if (novoTotalParcelas > parcelas.length) {
    // adiciona novas parcelas no final
    const ultima = parcelas.length > 0 ? parcelas[parcelas.length - 1] : null;
    let ano = ultima ? ultima.ano : new Date().getFullYear();
    let mes = ultima ? ultima.mes : new Date().getMonth() + 1;
    for (let i = parcelas.length; i < novoTotalParcelas; i++) {
      mes++;
      if (mes > 12) {
        mes = 1;
        ano++;
      }
      parcelas.push({
        descricao: novaDescricao,
        valor: valorParcelaMensal,
        mes,
        ano,
      });
    }
  } else if (novoTotalParcelas < parcelas.length) {
    // remove parcelas do fim
    parcelas = parcelas.slice(0, novoTotalParcelas);
  }

  // Atualiza compra
  compra.descricao = novaDescricao;
  compra.total = novoTotal;
  compra.totalParcelas = novoTotalParcelas;
  compra.parcelas = parcelas;

  // Ajusta parcelas pagas se necessário
  if (novoPagas > novoTotalParcelas) {
    novoPagas = novoTotalParcelas;
  }
  compra.pagas = novoPagas;

  saveCartoes(cartoes);
  atualizarUI();
  fecharModal();
});

// Fechar modal
btnFecharModal.addEventListener("click", fecharModal);
modalEditar.addEventListener("click", (e) => {
  if (e.target === modalEditar) fecharModal();
});

function fecharModal() {
  modalEditar.classList.add("hidden");
  idxCartaoEditando = null;
  idxParcelaEditando = null;
}

// ======== INICIALIZAÇÃO ========

atualizarParcelasVencidas();
atualizarUI();
