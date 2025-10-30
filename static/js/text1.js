import { db4 as db } from "./firebase.js";
import { ref, onValue, push, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// 📌 Elementos HTML
const atletaSelect = document.getElementById("atleta-selection");
const categoriaSelect = document.getElementById("categoria-selection");
const ritmoSelect = document.getElementById("ritmo-selection");
const btnEnviar = document.getElementById("enviar-jurados");
const faseAtualNome = document.getElementById("fase-atual-nome");

// Tabela de atletas e jogos
const tabelaAtletas = document.getElementById("atleta-jogo1").getElementsByTagName('tbody')[0];

// 🔄 Variáveis de controle
let dadosAtletas = {}; // Armazena informações dos atletas selecionados
let dadosJogo = {}; // Dados do jogo (fase, categoria, ritmo)

// Função para atualizar a tabela com os atletas e jogos
function atualizarTabela() {
  tabelaAtletas.innerHTML = ""; // Limpar a tabela antes de atualizar

  const categoria = categoriaSelect.value;
  const fase = faseAtualNome.textContent;

  // Verifica se existem dados de jogo para preencher a tabela
  if (dadosJogo && Object.keys(dadosJogo).length > 0) {
    Object.keys(dadosJogo).forEach(atletaNome => {
      const atleta = dadosAtletas[atletaNome];
      const dados = dadosJogo[atletaNome];

      // Criar uma linha para cada atleta
      const tr = document.createElement("tr");

      // Verificar se o atleta já existe na tabela (mesma categoria e fase)
      let existeNaTabela = false;
      for (let i = 0; i < tabelaAtletas.rows.length; i++) {
        const row = tabelaAtletas.rows[i];
        const cellAtleta = row.cells[3].textContent.trim(); // Coluna de Atleta
        const cellCategoria = row.cells[4].textContent.trim(); // Coluna de Categoria
        const cellFase = row.cells[0].textContent.trim(); // Coluna de Fase (mantenha uma referência de fase na tabela, se necessário)

        if (cellAtleta === atletaNome && cellCategoria === atleta.categoria && cellFase === fase) {
          existeNaTabela = true;
          break;
        }
      }

      // Se o atleta não existe na tabela, cria uma nova linha
      if (!existeNaTabela) {
        tr.innerHTML = `
          <td>${fase}</td>
          <td><input type="checkbox" class="jogo-checkbox" data-atleta="${atletaNome}" data-jogo="1" ${dados.jogo1 ? "checked" : ""}></td>
          <td><input type="checkbox" class="jogo-checkbox" data-atleta="${atletaNome}" data-jogo="2" ${dados.jogo2 ? "checked" : ""}></td>
          <td><input type="checkbox" class="jogo-checkbox" data-atleta="${atletaNome}" data-jogo="3" ${dados.jogo3 ? "checked" : ""}></td>
          <td>${atletaNome}</td>
          <td>${atleta.categoria}</td>
        `;
        tabelaAtletas.appendChild(tr);
      }
    });
  } else {
    const tr = document.createElement("tr");
    tr.innerHTML = "<td colspan='6' class='empty-message'>Nenhum dado encontrado</td>";
    tabelaAtletas.appendChild(tr);
  }
}

// Função para carregar os atletas e categorias no frontend
function carregarAtletasECategorias() {
  const categoria = categoriaSelect.value;
  if (!categoria) return;

  // Limpa os dados anteriores
  atletaSelect.innerHTML = "<option value=''>Selecione</option>";
  dadosAtletas = {};

  const categoriaRef = ref(db, `${faseAtualNome.textContent}/${categoria}`);
  onValue(categoriaRef, snap => {
    if (snap.exists()) {
      const atletasObj = snap.val();
      for (const id in atletasObj) {
        const atleta = atletasObj[id];
        if (atleta.nome) {
          dadosAtletas[atleta.nome] = {
            id,
            nome: atleta.nome,
            categoria: atleta.categoria || categoria,
            foto: atleta.foto || "",
            numero: atleta.numero || ""
          };

          const opt = document.createElement("option");
          opt.value = atleta.nome;
          opt.textContent = `${atleta.numero || ""} - ${atleta.nome}`;
          atletaSelect.appendChild(opt);
        }
      }
      // Atualiza a tabela com os atletas da categoria selecionada
      atualizarTabela();
    }
  });
}

// Função para verificar se o atleta já foi enviado para a mesma categoria, fase e jogo
function verificarAtletaExistente(atletaNome, categoria, fase, jogo) {
  const caminho = `jogos/${fase}/${categoria}/${jogo}jogo/${atletaNome}`;
  return get(ref(db, caminho)).then(snap => {
    return snap.exists();
  });
}

// Função para enviar os dados para o Firebase
btnEnviar.addEventListener("click", () => {
  const atletas = Array.from(atletaSelect.selectedOptions).map(opt => opt.value);
  const categoria = categoriaSelect.value;
  const ritmo = ritmoSelect.value;
  const faseSelecionada = faseAtualNome.textContent; // Obtém a fase atual

  if (!atletas.length || !categoria || !ritmo || !faseSelecionada) {
    alert("⚠️ Selecione um atleta, uma categoria, o ritmo e a fase.");
    return;
  }

  // Envia os dados de cada atleta selecionado para o Firebase
  atletas.forEach(atletaNome => {
    const jogoSelecionado = ritmo === "1º Jogo" ? "1º Jogo" : ritmo === "2º Jogo" ? "2º Jogo" : "3º Jogo";

    verificarAtletaExistente(atletaNome, categoria, faseSelecionada, jogoSelecionado).then(existe => {
      if (existe) {
        // Se o atleta já foi enviado, mostra a mensagem de confirmação
        const confirmacao = window.confirm(`⚠️ O atleta "${atletaNome}" já foi enviado para o "${jogoSelecionado}" na fase "${faseSelecionada}" e categoria "${categoria}". Deseja substituir?`);

        if (confirmacao) {
          // Se o usuário clicar em "OK", envia os dados para o Firebase
          enviarParaFirebase(atletaNome, categoria, ritmo, faseSelecionada, jogoSelecionado);
        } else {
          // Se o usuário clicar em "Cancelar", não faz nada
          console.log(`🚫 Envio do atleta "${atletaNome}" cancelado.`);
        }
      } else {
        // Se o atleta ainda não foi enviado, envia os dados normalmente
        enviarParaFirebase(atletaNome, categoria, ritmo, faseSelecionada, jogoSelecionado);
      }
    });
  });
});

// Função para enviar os dados para o Firebase
function enviarParaFirebase(atletaNome, categoria, ritmo, faseSelecionada, jogoSelecionado) {
  const atleta = dadosAtletas[atletaNome];
  const dados = {
    nome: atleta.nome,
    categoria: atleta.categoria,
    ritmo: ritmo,
    foto: atleta.foto || "",
    numero: atleta.numero || "",
    fase: faseSelecionada
  };

  const caminho = `jogos/${faseSelecionada}/${categoria}/${jogoSelecionado}jogo/${atletaNome}`;

  push(ref(db, caminho), dados)
    .then(() => {
      console.log(`✅ Dados enviados para ${caminho}`);
      // Atualiza a tabela com a marcação do jogo enviado
      carregarTabelaDeJogo(caminho, atletaNome, jogoSelecionado);
    })
    .catch(err => {
      console.error(`❌ Erro ao enviar para ${caminho}:`, err);
    });
}

// Função para carregar a tabela de jogos do Firebase
function carregarTabelaDeJogo(caminho, atletaNome, ritmo) {
  get(ref(db, caminho)).then(snap => {
    if (snap.exists()) {
      const dadosAtleta = snap.val();
      
      // Atualiza ou cria os dados de jogo para o atleta na tabela
      if (!dadosJogo[atletaNome]) {
        dadosJogo[atletaNome] = {};
      }

      if (ritmo === "1º Jogo") {
        dadosJogo[atletaNome].jogo1 = true;
      } else if (ritmo === "2º Jogo") {
        dadosJogo[atletaNome].jogo2 = true;
      } else if (ritmo === "3º Jogo") {
        dadosJogo[atletaNome].jogo3 = true;
      }

      // Atualiza a tabela com a marcação correta
      atualizarTabela();
    }
  });
}

// Função para tratar a seleção dos jogos (checkboxes)
tabelaAtletas.addEventListener("change", (e) => {
  if (e.target && e.target.classList.contains("jogo-checkbox")) {
    const atletaNome = e.target.dataset.atleta;
    const jogo = e.target.dataset.jogo;

    if (!atletaNome || !jogo) return;

    // Atualizar os dados de jogo com base no checkbox
    if (!dadosJogo[atletaNome]) {
      dadosJogo[atletaNome] = {};
    }

    dadosJogo[atletaNome][`jogo${jogo}`] = e.target.checked;

    // Salvar os dados de volta no Firebase
    const categoria = categoriaSelect.value;
    const faseSelecionada = faseAtualNome.textContent;

    const caminho = `jogos/${faseSelecionada}/${categoria}/jogo${jogo}/${atletaNome}`;
    push(ref(db, caminho), dadosJogo[atletaNome])
      .then(() => {
        console.log(`✅ Dados atualizados para ${caminho}`);
      })
      .catch(err => {
        console.error(`❌ Erro ao atualizar para ${caminho}:`, err);
      });
  }
});

// Evento para trocar de categoria
categoriaSelect.addEventListener("change", () => {
  carregarAtletasECategorias();
});

// Função inicial para carregar dados da categoria e fase selecionada
document.addEventListener("DOMContentLoaded", () => {
  carregarAtletasECategorias();
});
