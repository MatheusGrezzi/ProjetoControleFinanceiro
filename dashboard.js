// dashboard.js

// Categorias padrão e carregamento
let categorias = JSON.parse(localStorage.getItem("categorias"));
if (!categorias || categorias.length === 0) {
  categorias = ["Alimentação", "Lazer", "Transporte", "Contas Fixas", "Outros"];
}

function carregarCategoriasNoSelect() {
  const select = document.getElementById("categoria");
  select.innerHTML = "";
  categorias.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

carregarCategoriasNoSelect();

let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
let cartoes = JSON.parse(localStorage.getItem("cartoes")) || [];

const listaGastos = document.getElementById("lista-gastos");
const graficoCanvas = document.getElementById("graficoGastos");
const relatorioFinal = document.getElementById("relatorio-final");
const mesesContainer = document.getElementById("meses-container");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

let chart;
let meses = [];
let mesAtualIndex = 0;

function gerarMesesFuturosParcelas() {
  const mesesSet = new Set();

  cartoes.forEach((cartao) => {
    cartao.parcelas.forEach((compra) => {
      compra.parcelas.forEach((parcela) => {
        if (!parcela.pago) {
          mesesSet.add(
            `${parcela.ano}-${parcela.mes.toString().padStart(2, "0")}`
          );
        }
      });
    });
  });

  let mesesArr = Array.from(mesesSet).map((key) => {
    const [ano, mes] = key.split("-").map(Number);
    const data = new Date(ano, mes - 1);
    const nome = data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return { nome, mes, ano };
  });

  mesesArr.sort((a, b) => (a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes));
  return mesesArr;
}

function atualizarMesesFuturos() {
  meses = gerarMesesFuturosParcelas();
  if (meses.length === 0) {
    const hoje = new Date();
    meses = [
      {
        nome: hoje.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        }),
        mes: hoje.getMonth() + 1,
        ano: hoje.getFullYear(),
      },
    ];
  }
  mesAtualIndex = 0;
}

function montarCarrossel() {
  mesesContainer.innerHTML = "";

  meses.forEach(({ nome, mes, ano }) => {
    let totalMes = 0;
    cartoes.forEach((cartao) => {
      cartao.parcelas.forEach((compra) => {
        compra.parcelas.forEach((parcela) => {
          if (parcela.mes === mes && parcela.ano === ano && !parcela.pago) {
            totalMes += parcela.valor;
          }
        });
      });
    });

    const card = document.createElement("div");
    card.className = "mes-card";
    card.innerHTML = `<h4>${nome}</h4><span>R$ ${totalMes.toFixed(2)}</span>`;
    mesesContainer.appendChild(card);
  });

  ajustarCarrossel();
  atualizarBotaoNavegacao();
  atualizarVisualizacoesMes();
}

function ajustarCarrossel() {
  if (!mesesContainer.firstElementChild) return;
  const cardWidth = mesesContainer.firstElementChild.offsetWidth;
  const deslocamento = mesAtualIndex * cardWidth;
  mesesContainer.style.transform = `translateX(-${deslocamento}px)`;
}

function atualizarBotaoNavegacao() {
  btnPrev.disabled = mesAtualIndex === 0;
  btnNext.disabled = mesAtualIndex === meses.length - 1;
}

function atualizarVisualizacoesMes() {
  const { mes, ano } = meses[mesAtualIndex];
  const gastosFiltrados = gastos.filter((g) => {
    const [d, m, a] = g.data.split("/").map(Number);
    return m === mes && a === ano;
  });

  const parcelasMes = [];
  cartoes.forEach((cartao) => {
    cartao.parcelas.forEach((compra) => {
      compra.parcelas.forEach((parcela) => {
        if (!parcela.pago && parcela.mes === mes && parcela.ano === ano) {
          parcelasMes.push({
            descricao: compra.descricao || "Compra Parcelada",
            valor: parcela.valor,
            categoria: compra.categoria || "Cartão",
            data: `${String(parcela.mes).padStart(2, "0")}/${parcela.ano}`,
            tipo: "cartao",
          });
        }
      });
    });
  });

  const todosGastos = [...gastosFiltrados, ...parcelasMes];

  listaGastos.innerHTML = "";
  todosGastos.forEach((gasto, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${gasto.descricao} - R$ ${parseFloat(gasto.valor).toFixed(2)} (${
      gasto.categoria
    }) - ${gasto.data}</span>
      ${
        gasto.tipo !== "cartao"
          ? `
        <div>
          <button onclick="editarGasto(${i})">Editar</button>
          <button onclick="excluirGasto(${i})">Excluir</button>
        </div>
      `
          : ""
      }
    `;
    listaGastos.appendChild(li);
  });

  const total = todosGastos.reduce((soma, g) => soma + parseFloat(g.valor), 0);
  document.getElementById("total-gasto").textContent = total.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  atualizarGraficoCombinado(todosGastos);
}

function atualizarGraficoCombinado(gastosMes) {
  const somaPorCategoria = {};
  categorias.forEach((c) => (somaPorCategoria[c] = 0));

  gastosMes.forEach((g) => {
    if (!somaPorCategoria[g.categoria]) {
      somaPorCategoria[g.categoria] = 0;
    }
    somaPorCategoria[g.categoria] += parseFloat(g.valor);
  });

  const labels = Object.keys(somaPorCategoria);
  const dataValues = Object.values(somaPorCategoria);

  const coresDisponiveis = [
    "#4caf50",
    "#423c33ff",
    "#2196f3",
    "#9c27b0",
    "#607d8b",
    "#e91e63",
    "#009688",
    "#f44336",
    "#3f51b5",
    "#795548",
  ];

  const backgroundColor = labels.map(
    (_, i) => coresDisponiveis[i % coresDisponiveis.length]
  );

  const dados = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor,
      },
    ],
  };

  if (chart) chart.destroy();

  chart = new Chart(graficoCanvas, {
    type: "doughnut",
    data: dados,
    options: { responsive: true },
  });
}

btnPrev.addEventListener("click", () => {
  if (mesAtualIndex > 0) {
    mesAtualIndex--;
    ajustarCarrossel();
    atualizarBotaoNavegacao();
    atualizarVisualizacoesMes();
  }
});

btnNext.addEventListener("click", () => {
  if (mesAtualIndex < meses.length - 1) {
    mesAtualIndex++;
    ajustarCarrossel();
    atualizarBotaoNavegacao();
    atualizarVisualizacoesMes();
  }
});

function iniciarDashboard() {
  atualizarMesesFuturos();
  montarCarrossel();
  atualizarVisualizacoesMes();
}

iniciarDashboard();

/* ========== NOVAS FUNÇÕES ========== */

function editarGasto(index) {
  const { mes, ano } = meses[mesAtualIndex];

  const gastosFiltrados = gastos.filter((g) => {
    const [d, m, a] = g.data.split("/").map(Number);
    return m === mes && a === ano;
  });

  const gastoOriginal = gastosFiltrados[index];
  if (!gastoOriginal) return alert("Gasto não encontrado.");

  const novaDescricao = prompt("Editar descrição:", gastoOriginal.descricao);
  const novoValor = prompt("Editar valor:", gastoOriginal.valor);
  const novaCategoria = prompt("Editar categoria:", gastoOriginal.categoria);

  if (
    novaDescricao !== null &&
    novoValor !== null &&
    novaCategoria !== null &&
    !isNaN(parseFloat(novoValor))
  ) {
    const idxGlobal = gastos.findIndex(
      (g) =>
        g.descricao === gastoOriginal.descricao &&
        g.valor === gastoOriginal.valor &&
        g.categoria === gastoOriginal.categoria &&
        g.data === gastoOriginal.data
    );

    if (idxGlobal !== -1) {
      gastos[idxGlobal] = {
        ...gastos[idxGlobal],
        descricao: novaDescricao,
        valor: parseFloat(novoValor),
        categoria: novaCategoria,
      };
      localStorage.setItem("gastos", JSON.stringify(gastos));
      atualizarVisualizacoesMes();
    }
  }
}

function excluirGasto(index) {
  const { mes, ano } = meses[mesAtualIndex];

  const gastosFiltrados = gastos.filter((g) => {
    const [d, m, a] = g.data.split("/").map(Number);
    return m === mes && a === ano;
  });

  const gastoOriginal = gastosFiltrados[index];
  if (!gastoOriginal) return alert("Gasto não encontrado.");

  const confirmar = confirm("Tem certeza que deseja excluir este gasto?");
  if (confirmar) {
    gastos = gastos.filter(
      (g) =>
        !(
          g.descricao === gastoOriginal.descricao &&
          g.valor === gastoOriginal.valor &&
          g.categoria === gastoOriginal.categoria &&
          g.data === gastoOriginal.data
        )
    );
    localStorage.setItem("gastos", JSON.stringify(gastos));
    atualizarVisualizacoesMes();
  }
}

function adicionarGasto() {
  const descricao = document.getElementById("descricao").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;

  if (!descricao || isNaN(valor) || valor <= 0) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const hoje = new Date();
  const dataFormatada = `${String(hoje.getDate()).padStart(2, "0")}/${String(
    hoje.getMonth() + 1
  ).padStart(2, "0")}/${hoje.getFullYear()}`;

  const novoGasto = {
    descricao,
    valor,
    categoria,
    data: dataFormatada,
  };

  gastos.push(novoGasto);
  localStorage.setItem("gastos", JSON.stringify(gastos));

  // Limpa os campos
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";

  atualizarVisualizacoesMes();
}

function gerarRelatorio() {
  const { mes, ano } = meses[mesAtualIndex];
  const nomeMes = new Date(ano, mes - 1).toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // Pega todos os gastos do mês atual, incluindo parcelas de cartão
  const gastosMes = gastos.filter((g) => {
    const [d, m, a] = g.data.split("/").map(Number);
    return m === mes && a === ano;
  });

  const parcelasMes = cartoes.flatMap((c) =>
    c.parcelas.flatMap((compra) =>
      compra.parcelas
        .filter((p) => !p.pago && p.mes === mes && p.ano === ano)
        .map((p) => ({
          descricao: compra.descricao || "Compra Parcelada",
          valor: p.valor,
          categoria: compra.categoria || "Cartão",
          data: `${String(p.mes).padStart(2, "0")}/${p.ano}`,
          tipo: "cartao",
          mes: p.mes,
          ano: p.ano,
        }))
    )
  );

  const todosGastos = [...gastosMes, ...parcelasMes];

  // Soma total dos gastos do mês
  const total = todosGastos.reduce((acc, g) => acc + parseFloat(g.valor), 0);

  const rendaInput = prompt(
    `Qual foi sua renda em ${nomeMes}? (apenas números)`
  );
  const renda = parseFloat(rendaInput);
  if (isNaN(renda)) return alert("Renda inválida.");

  let texto = `📊 Relatório de Gastos - ${nomeMes}\n\n`;
  todosGastos.forEach((g) => {
    texto += `• ${g.descricao} - R$ ${parseFloat(g.valor).toFixed(2)} (${
      g.categoria
    }) - ${g.data}\n`;
  });

  const saldo = renda - total;
  const status = saldo >= 0 ? "POSITIVO ✅" : "NEGATIVO ❌";

  texto += `\n💰 Total de Gastos: R$ ${total.toFixed(2)}\n`;
  texto += `🤑 Renda Informada: R$ ${renda.toFixed(2)}\n`;
  texto += `📉 Saldo Final: R$ ${saldo.toFixed(2)} → ${status}`;

  relatorioFinal.textContent = texto;

  // SALVAR relatório no localStorage com id único
  let relatoriosSalvos = JSON.parse(localStorage.getItem("relatorios")) || [];
  const relatorioObj = {
    id: Date.now(), // ID único gerado pelo timestamp
    mes: nomeMes,
    texto: texto,
    dataGeracao: new Date().toISOString(),
  };
  relatoriosSalvos.push(relatorioObj);
  localStorage.setItem("relatorios", JSON.stringify(relatoriosSalvos));

  alert("Relatório gerado e salvo com sucesso!");
}
