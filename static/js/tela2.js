import { db3, db4 } from './firebase.js';
import { ref, get, set, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";


// -------------------- VARIÁVEIS GLOBAIS --------------------
const tabelaPrincipal = document.querySelector("#tabela-principal");
const tabelaSecundaria = document.querySelector("#tabela-secundaria");
const tabelaSecundaria2 = document.querySelector("#tabela-secundaria2");
const tabelaSecundaria1 = document.querySelector("#tabela-secundaria1");
const tabelaSecundaria1Body = tabelaSecundaria1 ? tabelaSecundaria1.querySelector("tbody") : null;


const btnMediaTotal = document.getElementById("MediaTotal");
const btnVoltarParaTabelaPrincipal = document.getElementById("voltarParaTabelaPrincipal");
const btnVoltar4 = document.getElementById("voltar4");

const seletorCategoriaSecundaria = document.getElementById("seletor-categoria1");
const seletorFaseSecundaria = document.getElementById("seletor-fase-grupo1");

let dadosOriginais = []; // sempre guarda TODOS os atletas da fase atual
let faseAtual = null;    // última fase marcada
let qtdAtual = 0;        // quantidade da fase


// -------------------- FUNÇÃO DE INICIALIZAÇÃO --------------------
// A tabela secundária pode ser exibida ao carregar a página se for o operador
// ou após o clique em 'Media Total'.
async function inicializarTabelaSecundaria() {
    // Tenta carregar os dados para a fase que está pré-selecionada (Geralmente 'Classificatória')
    await recarregarFase();
}


// -------------------- NAVEGAÇÃO --------------------
btnMediaTotal.addEventListener("click", async () => {
    tabelaPrincipal.style.display = "none";
    tabelaSecundaria.style.display = "block";

    // ✅ CORREÇÃO: Recarrega sempre que o botão Media Total for clicado
    await recarregarFase();
});

btnVoltarParaTabelaPrincipal.addEventListener("click", () => {
    tabelaSecundaria.style.display = "none";
    tabelaPrincipal.style.display = "block";
});

btnVoltar4.addEventListener("click", async () => {
    tabelaSecundaria2.style.display = "none";
    tabelaPrincipal.style.display = "block";
});

// -------------------- FILTROS --------------------
// Trocar FASE => recarrega do Firebase e remonta select
seletorFaseSecundaria.addEventListener("change", async () => {
    console.log("Fase alterada. Recarregando dados...");
    await recarregarFase();
});

// Trocar CATEGORIA => apenas filtra localmente
seletorCategoriaSecundaria.addEventListener("change", () => {
    console.log("Categoria alterada. Filtrando localmente...");
    exibirLinhasTabelaSecundaria(dadosOriginais);
});

// -------------------- RECARREGAR FASE --------------------
async function recarregarFase() {
    const faseSelecionada = seletorFaseSecundaria.value;
    if (!faseSelecionada) {
        console.warn("Por favor, selecione uma fase.");
        // Limpa a tela se nenhuma fase for selecionada
        if (tabelaSecundaria1Body) tabelaSecundaria1Body.innerHTML = "<tr><td colspan='10'>Selecione uma fase acima.</td></tr>";
        dadosOriginais = [];
        return;
    }

    console.log(`Iniciando carregamento para a fase: ${faseSelecionada}`);
    dadosOriginais = await carregarDadosPorGrupoFaseSecundaria(faseSelecionada);
    console.log("Dados carregados para a fase", faseSelecionada, dadosOriginais);

    // 1. Atualiza as opções do seletor de Categoria com base nos novos dados
    atualizarSeletorCategoriasSecundaria(dadosOriginais);

    // 2. Garante que o valor do seletor de Categoria seja resetado para 'Todas' 
    // ou mantenha a categoria que já estava selecionada, se ela ainda existir nos novos dados.
    const categoriaAtual = seletorCategoriaSecundaria.value;
    if (!categoriaAtual && dadosOriginais.length > 0) {
        // Se 'Todas' estiver selecionado, garantimos que o valor é ""
        seletorCategoriaSecundaria.value = "";
    }

    // 3. Renderiza a tabela (o filtro será aplicado dentro desta função)
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
        // ✅ IMPORTANTE: Este é o caminho onde a média final de cada jogo deve estar salva
        const caminhoRef = ref(db3, `medias/${ritmoSelecionado}/${fase}`);
        const snap = await get(caminhoRef);

        if (!snap.exists()) {
            console.log(`Caminho não encontrado: medias/${ritmoSelecionado}/${fase}`);
            continue;
        }

        snap.forEach(child => {
            const v = child.val();
            // Aqui usamos a chave do registro como o nome do atleta para evitar problemas
            const atleta = child.key;
            // Ou mantenha como estava se o Firebase salva o nome do atleta DENTRO do objeto
            // const atleta = v.atleta; 
            const categoriaDB = v.categoria;
            const foto = v.foto || "";

            if (!atletasNotas[atleta]) {
                atletasNotas[atleta] = {
                    atleta: atleta, // Usando a chave como nome do atleta para garantir unicidade
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

            if (ritmoSelecionado === '1º Jogo') atletasNotas[atleta].media1ºJogo = mediaNum;
            if (ritmoSelecionado === '2º Jogo') atletasNotas[atleta].media2ºJogo = mediaNum;
            if (ritmoSelecionado === '3º Jogo') atletasNotas[atleta].media3ºJogo = mediaNum;

            // CÁLCULO DA NOTA FINAL
            atletasNotas[atleta].notaFinal = parseFloat(
                (
                    atletasNotas[atleta].media1ºJogo +
                    atletasNotas[atleta].media2ºJogo
                ).toFixed(2)
            );
        });
    }
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
    if (!tabelaSecundaria1Body) return;

    const categoriaSelecionada = seletorCategoriaSecundaria.value;
    tabelaSecundaria1Body.innerHTML = "";

    // ✅ CORREÇÃO VERIFICADA: Filtra por categoria, ou retorna todos se for 'Todas' ("")
    const dadosFiltrados = categoriaSelecionada
        ? dados.filter(d => d.categoria === categoriaSelecionada)
        : dados;

    if (dadosFiltrados.length === 0) {
        tabelaSecundaria1Body.innerHTML = `<tr><td colspan='10'>Nenhum dado encontrado para a fase e categoria selecionadas.</td></tr>`;
        return;
    }

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
        tabelaSecundaria1Body.appendChild(tr);
    });

    // ... (restante da lógica do checkbox)
}

// ... (Restante das funções como atualizarDadosFirebase, marcarMelhores, oitavas, quartas, etc.)

// -------------------- INICIALIZAÇÃO DA TELA --------------------
// Se a tela for a do operador, vamos tentar carregar os dados ao iniciar.
// Descomente esta linha se a tela for a primeira coisa que o usuário vê (após o login)
// window.addEventListener('load', inicializarTabelaSecundaria);