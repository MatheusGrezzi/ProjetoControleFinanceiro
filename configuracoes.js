// configuracoes.js

// Tenta carregar as categorias do localStorage ou usa padrão caso não existam
let categorias = JSON.parse(localStorage.getItem("categorias")) || [
  "Alimentação",
  "Lazer",
  "Transporte",
  "Contas Fixas",
  "Outros",
];

// Seleciona o elemento da lista no HTML
const listaCategorias = document.getElementById("lista-categorias");

// Função para mostrar as categorias na tela
function renderizarCategorias() {
  listaCategorias.innerHTML = "";
  categorias.forEach((cat) => {
    const li = document.createElement("li");
    li.textContent = cat;

    // Cria botão de excluir
    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.style.marginLeft = "10px";
    btnExcluir.onclick = () => excluirCategoria(cat);

    li.appendChild(btnExcluir);
    listaCategorias.appendChild(li);
  });
}

// Função para adicionar uma nova categoria
function adicionarCategoria() {
  const input = document.getElementById("nova-categoria");
  const novaCat = input.value.trim();

  if (!novaCat) {
    alert("Digite uma categoria válida.");
    return;
  }

  if (categorias.includes(novaCat)) {
    alert("Categoria já existe.");
    return;
  }

  categorias.push(novaCat);
  localStorage.setItem("categorias", JSON.stringify(categorias));
  renderizarCategorias();
  input.value = "";
}

// Função para excluir uma categoria
function excluirCategoria(categoria) {
  categorias = categorias.filter((cat) => cat !== categoria);
  localStorage.setItem("categorias", JSON.stringify(categorias));
  renderizarCategorias();
}

// Inicializa a lista quando a página carrega
renderizarCategorias();
