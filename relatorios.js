document.addEventListener("DOMContentLoaded", () => {
  const listaRelatorios = document.querySelector(".lista-relatorios");
  const visualizador = document.getElementById("visualizador-relatorio");
  const conteudoRelatorio = document.getElementById("conteudo-relatorio");
  const btnFechar = document.getElementById("fechar-visualizador");

  function statusPositivo(texto) {
    // Verifica se tem "positivo" no texto (case insensitive)
    return texto.toLowerCase().includes("positivo")
      ? "✅ Positivo"
      : "❌ Negativo";
  }

  function carregarRelatorios() {
    const relatorios = JSON.parse(localStorage.getItem("relatorios")) || [];
    listaRelatorios.innerHTML = "";

    if (relatorios.length === 0) {
      listaRelatorios.innerHTML = "<p>Nenhum relatório encontrado.</p>";
      return;
    }

    relatorios.forEach((relatorio) => {
      const li = document.createElement("li");
      li.className = "item-relatorio";
      li.innerHTML = `
        <div class="info-relatorio">
          <span><strong>${relatorio.mes}</strong></span>
          <span class="status-positivo">${statusPositivo(
            relatorio.texto
          )}</span>
        </div>
        <div class="botoes-container">
          <button class="botao visualizar" data-id="${
            relatorio.id
          }">Visualizar</button>
          <button class="botao baixar" data-id="${relatorio.id}">Baixar</button>
          <button class="botao excluir" data-id="${
            relatorio.id
          }">Excluir</button>
        </div>
      `;
      listaRelatorios.appendChild(li);
    });

    adicionarEventosBotoes();
  }

  function adicionarEventosBotoes() {
    // Visualizar
    document.querySelectorAll(".botao.visualizar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        mostrarRelatorio(id);
      });
    });

    // Excluir
    document.querySelectorAll(".botao.excluir").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        excluirRelatorio(id);
      });
    });

    // Baixar
    document.querySelectorAll(".botao.baixar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        baixarRelatorio(id);
      });
    });
  }

  function mostrarRelatorio(id) {
    const relatorios = JSON.parse(localStorage.getItem("relatorios")) || [];
    const relatorio = relatorios.find((r) => r.id == id);
    if (!relatorio) {
      alert("Relatório não encontrado.");
      return;
    }
    conteudoRelatorio.textContent = relatorio.texto;
    visualizador.classList.remove("hidden");
  }

  function excluirRelatorio(id) {
    if (!confirm("Tem certeza que deseja excluir este relatório?")) return;

    let relatorios = JSON.parse(localStorage.getItem("relatorios")) || [];
    relatorios = relatorios.filter((r) => r.id != id);
    localStorage.setItem("relatorios", JSON.stringify(relatorios));
    carregarRelatorios();
  }

  function baixarRelatorio(id) {
    const relatorios = JSON.parse(localStorage.getItem("relatorios")) || [];
    const relatorio = relatorios.find((r) => r.id == id);
    if (!relatorio) {
      alert("Relatório não encontrado.");
      return;
    }

    const blob = new Blob([relatorio.texto], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${relatorio.mes
      .replace(/\s+/g, "-")
      .toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  btnFechar.addEventListener("click", () => {
    visualizador.classList.add("hidden");
  });

  carregarRelatorios();
});
