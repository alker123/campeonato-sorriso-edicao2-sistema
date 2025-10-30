// Importando Firebase
import { db3, db4 } from './firebase.js';
import { ref, get, set, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// -------------------- VARIÁVEIS GLOBAIS --------------------

const tabelaSecundariaBody = document.querySelector("#tabela-secundaria tbody");
const tabelaSecundaria2 = document.querySelector("#tabela-secundaria2");

c
const btnVoltar4 = document.getElementById("voltar4");

const seletorCategoriaSecundaria = document.getElementById("seletor-categoria1");
const seletorFaseSecundaria = document.getElementById("seletor-fase-grupo1");

let dadosOriginais = []; // sempre guarda TODOS os atletas da fase atual
let faseAtual = null;    // última fase marcada
let qtdAtual = 0;        // quantidade da fase

// -------------------- NAVEGAÇÃO --------------------


btnVoltar4.addEventListener("click", async () => {
  tabelaSecundaria2.style.display = "block";
  await recarregarFase(); // carrega do Firebase e monta select
});

// -------------------- FILTROS --------------------
// Trocar FASE => recarrega do Firebase e remonta select
seletorFaseSecundaria.addEventListener("change", async () => {
  await recarregarFase();
});

// Trocar CATEGORIA => apenas filtra localmente
seletorCategoriaSecundaria.addEventListener("change", () => {
  exibirLinhasTabelaSecundaria(dadosOriginais);
});

// -------------------- RECARREGAR FASE --------------------
async function recarregarFase() {
  const faseSelecionada = seletorFaseSecundaria.value;
  if (!faseSelecionada) {
    alert("Por favor, selecione uma fase.");
    return;
  }

  dadosOriginais = await carregarDadosPorGrupoFaseSecundaria(faseSelecionada);
  console.log("Dados carregados para a fase", faseSelecionada, dadosOriginais);

  atualizarSeletorCategoriasSecundaria(dadosOriginais);
  seletorCategoriaSecundaria.value = ""; // volta para "Todas"
  exibirLinhasTabelaSecundaria(dadosOriginais);
}

// -------------------- BUSCAR NO FIREBASE --------------------
async function carregarDadosPorGrupoFaseSecundaria(fase) {
  const ritmos = ['1º Jogo', '2º Jogo', '3º Jogo'];
  const atletasNotas = {};

  const mapaChaves = {
    '1º Jogo': 'media1ºJogo',
    '2º Jogo': 'media2ºJogo',
    '3º Jogo': 'media3ºJogo'
  };

  for (let ritmoSelecionado of ritmos) {
    const caminhoRef = ref(db3, `medias/${ritmoSelecionado}/${fase}`);
    const snap = await get(caminhoRef);

    if (!snap.exists()) continue;

    snap.forEach(child => {
      const v = child.val();
      const atleta = v.atleta;
      const categoriaDB = v.categoria;
      const foto = v.foto || ""; 

      if (!atletasNotas[atleta]) {
        atletasNotas[atleta] = {
          atleta,
          categoria: categoriaDB,
          media1ºJogo: 0,
          media2ºJogo: 0,
          media3ºJogo: 0,
          notaFinal: 0,
          foto: foto 
        };
      }

      // Acessa a chave mapeada
      const mediaKey = mapaChaves[ritmoSelecionado];
      const mediaNum = parseFloat(v[mediaKey] ?? 0) || 0;

      console.log(`Média ${ritmoSelecionado} para ${atleta}:`, mediaNum);

      if (ritmoSelecionado === '1º Jogo') atletasNotas[atleta].media1ºJogo = mediaNum;
      if (ritmoSelecionado === '2º Jogo') atletasNotas[atleta].media2ºJogo = mediaNum;
      if (ritmoSelecionado === '3º Jogo') atletasNotas[atleta].media3ºJogo = mediaNum;

      atletasNotas[atleta].notaFinal = parseFloat(
        (
          atletasNotas[atleta].media1ºJogo +
          atletasNotas[atleta].media2ºJogo //+
          //atletasNotas[atleta].media3ºJogo
        ).toFixed(2)
      );
    });
  }

  console.log("Dados finais:", atletasNotas);
  return Object.values(atletasNotas);
}

// -------------------- SELECT DE CATEGORIAS --------------------
function atualizarSeletorCategoriasSecundaria(dados) {
  const categorias = [...new Set(dados.map(d => d.categoria).filter(Boolean))].sort();
  seletorCategoriaSecundaria.innerHTML = '<option value="">Todas</option>';

  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    seletorCategoriaSecundaria.appendChild(opt);
  });
}

// ---- Render da tabela (filtra localmente por categoria selecionada) ----
function exibirLinhasTabelaSecundaria(dados) {
  const categoriaSelecionada = seletorCategoriaSecundaria.value;
  tabelaSecundariaBody.innerHTML = "";  // Limpar tabela antes de adicionar novos dados

  const dadosFiltrados = categoriaSelecionada
    ? dados.filter(d => d.categoria === categoriaSelecionada)
    : dados;

  // Ordenar pela notaFinal, media1ºJogo, media2ºJogo, media3ºJogo
  dadosFiltrados.sort((a, b) => {
    if (b.notaFinal !== a.notaFinal) {
      return b.notaFinal - a.notaFinal;
    }
    if (b.media1ºJogo !== a.media1ºJogo) {
      return b.media1ºJogo - a.media1ºJogo;
    }
    if (b.media2ºJogo !== a.media2ºJogo) {
      return b.media2ºJogo - a.media2ºJogo;
    }
    return b.media3ºJogo - a.media3ºJogo;
  });

  dadosFiltrados.forEach((dado, index) => {
    const tr = document.createElement("tr");
    const foto = dado.foto ? dado.foto : '';

    tr.innerHTML = `
      
      <td><img src="${foto}" class="foto-atleta" /></td>
      <td>${index + 1}</td>
      <td>${dado.atleta}</td>
      <td>${dado.categoria ?? ""}</td>
      <td>${(dado.media1ºJogo ?? 0).toFixed(1)}</td>
      <td>${(dado.media2ºJogo ?? 0).toFixed(1)}</td>
      <td>${(dado.media3ºJogo ?? 0).toFixed(1)}</td>
      <td>${(dado.notaFinal ?? 0).toFixed(1)}</td>
      <td class="col-proxima-fase"></td>
    `;
    tabelaSecundariaBody.appendChild(tr);
  });
}
