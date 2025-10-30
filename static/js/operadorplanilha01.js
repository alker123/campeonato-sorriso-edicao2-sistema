import { db3 } from './firebase.js';
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Referências para os dados de árbitros no Firebase
const refArbitroA = ref(db3, 'arbitros/arbitroA');
const refArbitroB = ref(db3, 'arbitros/arbitroB');
const refArbitroC = ref(db3, 'arbitros/arbitroC');

// Função para preencher o campo de árbitro A
onValue(refArbitroA, (snapshot) => {
    const arbitroA = snapshot.val();  // Recupera o valor de arbitroA no Firebase
    if (arbitroA) {
        // Preenche o campo de entrada com o valor de arbitroA
        document.getElementById("arbitroA").value = arbitroA;
    } else {
        console.log("Arbitro A não encontrado no Firebase.");
    }
});

// Função para preencher o campo de árbitro B
onValue(refArbitroB, (snapshot) => {
    const arbitroB = snapshot.val();  // Recupera o valor de arbitroB no Firebase
    if (arbitroB) {
        // Preenche o campo de entrada com o valor de arbitroB
        document.getElementById("arbitroB").value = arbitroB;
    } else {
        console.log("Arbitro B não encontrado no Firebase.");
    }
});

// Função para preencher o campo de árbitro C
onValue(refArbitroC, (snapshot) => {
    const arbitroC = snapshot.val();  // Recupera o valor de arbitroC no Firebase
    if (arbitroC) {
        // Preenche o campo de entrada com o valor de arbitroC
        document.getElementById("arbitroC").value = arbitroC;
    } else {
        console.log("Arbitro C não encontrado no Firebase.");
    }
});





// ELEMENTOS PRINCIPAIS
const tabelaPrincipal = document.querySelector("#tabela-principal tbody");
const seletorRitmo = document.getElementById("seletor-ritmo");
const seletorCategoria = document.getElementById("seletor-categoria");
const textoRitmo = document.getElementById("ritmo-atual");
const seletorFaseGrupo = document.getElementById("seletor-fase-grupo");

let todosDados = [];
let categoriaSelecionada = "";
let mediasFinaisMap = new Map();

// Para evitar duplicar eventos
let listenersAtivos = [];

// EVENTOS
seletorRitmo.addEventListener("change", () => {
  textoRitmo.textContent = seletorRitmo.value;
  carregarDadosPorGrupoFase(seletorRitmo.value, seletorFaseGrupo.value);
});

seletorCategoria.addEventListener("change", () => {
  categoriaSelecionada = seletorCategoria.value;
  exibirLinhasFiltradas();
});

seletorFaseGrupo.addEventListener("change", () => {
  carregarDadosPorGrupoFase(seletorRitmo.value, seletorFaseGrupo.value);
});

// FUNÇÃO PRINCIPAL
function carregarDadosPorGrupoFase(ritmo, grupoFase) {
  const caminhos = {
    classificatória: {
      A: ref(db3, `classificatóriaA/${ritmo}`),
      B: ref(db3, `classificatóriaB/${ritmo}`),
      C: ref(db3, `classificatóriaC/${ritmo}`)
    },
    oitavas: {
      A: ref(db3, `oitavasA/${ritmo}`),
      B: ref(db3, `oitavasB/${ritmo}`),
      C: ref(db3, `oitavasC/${ritmo}`)
    },
    quartas: {
      A: ref(db3, `quartasA/${ritmo}`),
      B: ref(db3, `quartasB/${ritmo}`),
      C: ref(db3, `quartasC/${ritmo}`)
    },
    semifinal: {
      A: ref(db3, `semi-finalA/${ritmo}`),
      B: ref(db3, `semi-finalB/${ritmo}`),
      C: ref(db3, `semi-finalC/${ritmo}`)
    },
    final: {
      A: ref(db3, `finalA/${ritmo}`),
      B: ref(db3, `finalB/${ritmo}`),
      C: ref(db3, `finalC/${ritmo}`)
    }
  };

  if (!caminhos[grupoFase]) return;

  // Cancela os listeners anteriores
  listenersAtivos.forEach(unsub => unsub());
  listenersAtivos = [];

  const dados = { A: {}, B: {}, C: {} };

  Object.entries(caminhos[grupoFase]).forEach(([fase, caminhoRef]) => {
    // O retorno de onValue é uma função que remove o listener
    const unsubscribe = onValue(caminhoRef, snap => {
      dados[fase] = {};

      if (snap.exists()) {
        snap.forEach(child => {
          const atleta = child.val().atleta || "";
          const categoria = child.val().categoria || "";
          if (!atleta || !categoria) return;
          dados[fase][child.key] = child.val();
        });
      }

      // Sempre recalcula tabela quando qualquer jurado muda algo
      processarDados(dados);
    });

    listenersAtivos.push(unsubscribe);
  });
}

// PROCESSAMENTO
function processarDados(dados) {
  todosDados = [];
  mediasFinaisMap.clear();

  const chaves = new Set([
    ...Object.keys(dados.A),
    ...Object.keys(dados.B),
    ...Object.keys(dados.C)
  ]);

  chaves.forEach(key => {
    const a = dados.A[key] ?? {};
    const b = dados.B[key] ?? {};
    const c = dados.C[key] ?? {};

    const atleta = a.atleta || b.atleta || c.atleta || "";
    const categoria = a.categoria || b.categoria || c.categoria || "";
    if (!atleta || !categoria) return;

    const notaA = parseFloat(a.nota || 0);

    const notaB = parseFloat(b.nota || 0);

    const notaC = parseFloat(c.nota || 0);

    const somaNotas = notaA + notaB + notaC;
    const media = parseFloat((somaNotas).toFixed(1));

    mediasFinaisMap.set(atleta + "||" + categoria, media);

    todosDados.push({
      atleta,
      categoria,
      notaA,
      notaB,
      notaC,
      media,
      numero: a.numero || b.numero || c.numero || "",
      foto: a.foto || b.foto || c.foto || ""
    });

    salvarMediaNoFirebase({
      atleta,
      categoria,
      media,
      numero: a.numero || b.numero || c.numero || "",
      foto: a.foto || b.foto || c.foto || ""
    });
  });

  atualizarSeletorCategorias();
  exibirLinhasFiltradas();
}

// SALVAR MÉDIA NO FIREBASE
function salvarMediaNoFirebase(dado) {
  const mediaComDuasCasas = (Math.floor(dado.media * 100) / 100).toFixed(1);
  const fotoUrl = dado.foto ? dado.foto : "";
  const numero = dado.numero || "";

  const ritmoSelecionado = seletorRitmo.value;
  let mediaKey = "";

  switch (ritmoSelecionado) {
    case '1º Jogo': mediaKey = 'media1ºJogo'; break;
    case '2º Jogo': mediaKey = 'media2ºJogo'; break;
    case '3º Jogo': mediaKey = 'media3ºJogo'; break;
    default: return;
  }

  const mediaRef = ref(db3, `medias/${ritmoSelecionado}/${seletorFaseGrupo.value}/${dado.atleta}||${dado.categoria}`);
  
  set(mediaRef, {
    [mediaKey]: mediaComDuasCasas,
    atleta: dado.atleta,
    categoria: dado.categoria,
    numero: numero,
    foto: fotoUrl
  }).catch(error => {
    console.error("Erro ao salvar média no Firebase: ", error);
  });
}

// ATUALIZA SELETOR DE CATEGORIAS
function atualizarSeletorCategorias() {
  const categorias = [...new Set(todosDados.map(d => d.categoria))].sort();
  seletorCategoria.innerHTML = '<option value="">Todas</option>';
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    seletorCategoria.appendChild(opt);
  });
  seletorCategoria.value = categoriaSelecionada || "";
}

// MONTA A TABELA
function exibirLinhasFiltradas() {
  tabelaPrincipal.innerHTML = "";
  const mapaUnico = new Map();

  let filtrados = categoriaSelecionada
    ? todosDados.filter(d => d.categoria === categoriaSelecionada)
    : todosDados;

  filtrados.forEach(dado => {
    const id = dado.atleta + "||" + dado.categoria;
    if (!mapaUnico.has(id)) mapaUnico.set(id, dado);
  });

  const listaUnica = Array.from(mapaUnico.values()).sort((a, b) => b.media - a.media);

  listaUnica.forEach(dado => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" /></td>
      <td>${dado.atleta}</td>
      <td>${dado.categoria}</td>
      <td>${dado.notaA.toFixed(1)}</td>
      <td>${dado.notaB.toFixed(1)}</td>
      <td>${dado.notaC.toFixed(1)}</td>
      <td>${(Math.floor(dado.media * 100) / 100).toFixed(1)}</td>
    `;
    tabelaPrincipal.appendChild(tr);
  });
}

// ✅ Chamar já no início para não precisar trocar o seletor manualmente
window.addEventListener("load", () => {
  if (seletorRitmo.value && seletorFaseGrupo.value) {
    carregarDadosPorGrupoFase(seletorRitmo.value, seletorFaseGrupo.value);
  }
});
