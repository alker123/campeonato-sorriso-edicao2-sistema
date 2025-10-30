import { db3, db4 } from './firebase.js';
import { ref, get, set, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";


// -------------------- VARIÁVEIS GLOBAIS --------------------
const tabelaPrincipal = document.querySelector("#tabela-principal");
const tabelaSecundaria = document.querySelector("#tabela-secundaria");
const tabelaSecundariaBody = document.querySelector("#tabela-secundaria tbody");
const tabelaSecundaria2 = document.querySelector("#tabela-secundaria2");

const btnMediaTotal = document.getElementById("MediaTotal");
const btnVoltarParaTabelaPrincipal = document.getElementById("voltarParaTabelaPrincipal");
const btnVoltar4 = document.getElementById("voltar4");

const seletorCategoriaSecundaria = document.getElementById("seletor-categoria1");
const seletorFaseSecundaria = document.getElementById("seletor-fase-grupo1");

let dadosOriginais = []; // sempre guarda TODOS os atletas da fase atual
let faseAtual = null;    // última fase marcada
let qtdAtual = 0;        // quantidade da fase

// -------------------- NAVEGAÇÃO --------------------
btnMediaTotal.addEventListener("click", async () => {
  tabelaPrincipal.style.display = "none";
  tabelaSecundaria.style.display = "block";
  await recarregarFase(); // carrega do Firebase e monta select
});

btnVoltarParaTabelaPrincipal.addEventListener("click", () => {
  tabelaSecundaria.style.display = "none";
  tabelaPrincipal.style.display = "block";
});

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

 // if (!dadosOriginais.length) {
  //  alert("Nenhum dado encontrado para a fase selecionada.");
  //}

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
  tabelaSecundariaBody.innerHTML = "";

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
      <td><input type="checkbox" data-atleta="${dado.atleta}" class="checkbox-classificado" ${dado.media3ºJogo > 20.0 ? 'checked' : ''} /></td>
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

  const checkboxes = document.querySelectorAll('.checkbox-classificado');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const atleta = e.target.getAttribute('data-atleta');
      const isChecked = e.target.checked;

      // Encontrar os dados do atleta
      const atletaData = dadosFiltrados.find(d => d.atleta === atleta);
      if (atletaData) {
        if (isChecked) {
          // Marca o atleta e adiciona 1.0 ao 3º jogo, mas garante que não ultrapasse 21.0
          if (atletaData.media3ºJogo < 21.0) {
            atletaData.media3ºJogo = 21.0;
          }
        } else {
          // Desmarca o atleta e volta para 20.0
          atletaData.media3ºJogo = 20.0;
        }

        // Recalcular a notaFinal
        atletaData.notaFinal = parseFloat(
          (
            atletaData.media1ºJogo + 
            atletaData.media2ºJogo 
          ).toFixed(2)
        );

        // Reordenar a tabela após a alteração de notaFinal
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

        // Atualizar visualmente a tabela
        tabelaSecundariaBody.innerHTML = "";  // Limpar as linhas antigas
        dadosFiltrados.forEach((dado, index) => {
          const tr = document.createElement("tr");
          const foto = dado.foto ? dado.foto : '';
          tr.innerHTML = `
            <td><input type="checkbox" data-atleta="${dado.atleta}" class="checkbox-classificado" ${dado.media3ºJogo > 20.0 ? 'checked' : ''} /></td>
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

        // Atualizar os dados no Firebase
        await atualizarDadosFirebase(atletaData);
      }
    });
  });
}






// Função para atualizar os dados no Firebase
// Função para atualizar os dados no Firebase
async function atualizarDadosFirebase(atletaData) {
  const categoriaSelecionada = seletorCategoriaSecundaria.value;
  const refAtletas = ref(db3, `medias/3º Jogo/${categoriaSelecionada}/${atletaData.atleta}`);
  
  // Garantir que o link da foto seja atualizado corretamente
  const fotoLink = atletaData.foto && atletaData.foto !== "" ? atletaData.foto : "URL_DEFAULT_OU_VAZIO";

  // Atualizar os dados do atleta no Firebase
  await set(refAtletas, {
    atleta: atletaData.atleta,
    categoria: atletaData.categoria,
    media3ºJogo: atletaData.media3ºJogo,
    notaFinal: atletaData.notaFinal,
    foto: fotoLink // Atualiza a URL da foto
  });

  console.log(`Dados atualizados no Firebase para o atleta ${atletaData.atleta}`);
}



// -------------------- MARCAR MELHORES --------------------
// Atualiza a classificação visual
function marcarMelhores(qtd, fase) {
  const linhas = tabelaSecundariaBody.querySelectorAll("tr");

  linhas.forEach((tr, index) => {
    const tds = tr.children;

    // Reseta estilo e coluna "Próxima Fase"
    [...tds].forEach(td => {
      td.style.backgroundColor = "";
      td.style.fontWeight = "";
    });
    const tdProximaFase = tr.querySelector(".col-proxima-fase");
    if (tdProximaFase) tdProximaFase.textContent = "";

    // Marca apenas os primeiros "qtd"
    if (index < qtd) {
      [...tds].forEach(td => {
        td.style.backgroundColor = "lightgreen";
        td.style.fontWeight = "bold";
      });

      if (tdProximaFase) tdProximaFase.textContent = "Classificado";
    }
  });

  faseAtual = fase;
  qtdAtual = qtd;
}



// ---- Funções chamadas pelos botões ----
window.oitavas = function() {
  marcarMelhores(16, "oitavas");
};

window.quartas = function() {
  marcarMelhores(8, "quartas");
};

window.semifinal = function() {
  marcarMelhores(4, "semi-final");
};

window.final = function() {
  marcarMelhores(2, "final");
};

// Função genérica para enviar os atletas já marcados em verde
// Função genérica para enviar os atletas já marcados em verde
async function enviarSelecionados(fase, qtd) {
  const linhas = tabelaSecundariaBody.querySelectorAll("tr");
  const categoriaSelecionada = seletorCategoriaSecundaria.value;

  let enviados = 0;

  for (let i = 0; i < linhas.length && enviados < qtd; i++) {
    const tr = linhas[i];
    const tds = tr.children;

    // Log para verificar se a linha está sendo processada
    console.log(`Processando linha ${i + 1}: ${tds[3].textContent.trim()}`);

    // Verifica se a linha está marcada em verde (selecionada)
    if (tds[0].style.backgroundColor === "lightgreen") { // A primeira coluna (checkbox) está marcada
      const nomeAtleta = tds[3].textContent.trim();  // A coluna 3 (index 3) é onde está o nome do atleta

      // Buscar os dados reais do atleta no db3 (atletasPorCategoria)
      const refAtletas = ref(db3, `atletasPorCategoria/${categoriaSelecionada}`);
      const snap = await get(refAtletas);

      if (snap.exists()) {
        const data = snap.val();

        // Log para verificar os dados do Firebase
        console.log("Dados encontrados no Firebase:", data);

        // Encontrar o atleta correspondente pelo nome
        const atletaEncontrado = Object.values(data).find(a => a.nome === nomeAtleta);

        if (atletaEncontrado) {
          // Verifica se a foto existe, se não, deixa uma imagem padrão
          let foto = atletaEncontrado.foto || "/static/imagens/foto.png";  // Imagem padrão caso a foto esteja vazia

          // Verifica se o atleta tem foto. Se não, mantém a imagem padrão.
          if (!atletaEncontrado.foto) {
            console.log(`Foto não encontrada para o atleta: ${nomeAtleta}. Usando imagem padrão.`);
          }

          const dado = {
            foto: foto,  // Foto do atleta (extraída de db3 ou imagem padrão)
            nome: atletaEncontrado.nome,
            numero: atletaEncontrado.numero || ""  // Número do atleta
          };

          // Logando os dados antes de enviar
          console.log("Enviando dados para o Firebase:", dado);

          // Salvar no db4
          const refFase = ref(db4, `${fase}/${categoriaSelecionada}`);
          const novo = push(refFase);
          await set(novo, dado);

          // Aqui, você pode exibir a foto diretamente na tabela ou onde for necessário
          // Supondo que você tenha um campo para exibir a foto:
          const imgElement = tr.querySelector(".foto-atleta");  // A classe "foto-atleta" onde a imagem deve ser exibida
          if (imgElement) {
            imgElement.src = foto;  // Atualiza a imagem no front-end
          }

          enviados++;
        } else {
          console.log("Atleta não encontrado:", nomeAtleta);
        }
      } else {
        console.log("Nenhum dado encontrado no Firebase para a categoria:", categoriaSelecionada);
      }
    } else {
      console.log("Linha não está marcada em verde:", tds[3].textContent.trim());
    }
  }

  if (enviados > 0) {
    alert(`Foram enviados ${enviados} atletas para ${fase}!`);
  } else {
    alert("❌ Nenhum atleta foi enviado. Verifique se as linhas estão corretamente marcadas.");
  }
}

// Botão enviar (detecta a fase automaticamente pelo número de atletas marcados)
window.enviar1 = function () {
  const linhas = tabelaSecundariaBody.querySelectorAll("tr");
  const selecionados = Array.from(linhas).filter(tr => 
    tr.children[0].style.backgroundColor === "lightgreen"
  );

  const qtd = selecionados.length;

  console.log(`Número de atletas selecionados: ${qtd}`);

  if (qtd === 16) {
    enviarSelecionados("oitavas", 16);
  } else if (qtd === 8) {
    enviarSelecionados("quartas", 8);
  } else if (qtd === 4) {
    enviarSelecionados("semi-final", 4);
  } else if (qtd === 2) {
    enviarSelecionados("final", 2);
  } else {
    alert("❌ Selecione 16, 8, 4 ou 2 atletas para enviar!");
  }
};


