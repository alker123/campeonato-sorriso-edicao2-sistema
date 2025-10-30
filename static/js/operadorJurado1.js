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
let dadosAtletas = {}; // Armazena informações dos atletas da categoria selecionada (para o dropdown)
let dadosJogo = {}; // Armazena o estado dos jogos (jogo1, jogo2, jogo3) por atleta para a categoria/fase selecionada

/**
 * Função para atualizar a tabela com os atletas e o status dos jogos.
 * Esta função utiliza o 'dadosAtletas' para a lista de atletas da categoria
 * e 'dadosJogo' para o status dos jogos (preenchido por 'carregarTabelaDeJogoDaCategoria').
 */
function atualizarTabela() {
    tabelaAtletas.innerHTML = ""; // Limpar a tabela antes de atualizar

    const fase = faseAtualNome.textContent.trim();
    const categoria = categoriaSelect.value;
    const atletasDaCategoria = Object.keys(dadosAtletas);

    if (!categoria) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td colspan='6' class='empty-message'>Selecione uma categoria</td>";
        tabelaAtletas.appendChild(tr);
        return;
    }

    if (atletasDaCategoria.length > 0) {
        atletasDaCategoria.forEach(atletaNome => {
            const atleta = dadosAtletas[atletaNome];
            // Obtém os dados de jogo do atleta, se existirem, ou um objeto vazio
            const dados = dadosJogo[atletaNome] || { jogo1: false, jogo2: false, jogo3: false }; 

            // Criar uma linha para cada atleta
            const tr = document.createElement("tr");

            // Os checkboxes são desabilitados (disabled) para não permitir alteração manual.
            tr.innerHTML = `
                <td>${fase}</td>
                <td><input type="checkbox" class="jogo-checkbox" data-atleta="${atletaNome}" data-jogo="1" ${dados.jogo1 ? "checked" : ""} disabled></td>
                <td><input type="checkbox" class="jogo-checkbox" data-atleta="${atletaNome}" data-jogo="2" ${dados.jogo2 ? "checked" : ""} disabled></td>
                <td><input type="checkbox" class="jogo-checkbox" data-atleta="${atletaNome}" data-jogo="3" ${dados.jogo3 ? "checked" : ""} disabled></td>
                <td>${atletaNome}</td>
                <td>${categoria}</td>
            `;
            tabelaAtletas.appendChild(tr);
        });
    } else {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td colspan='6' class='empty-message'>Nenhum atleta encontrado para esta categoria</td>";
        tabelaAtletas.appendChild(tr);
    }
}

/**
 * Função para carregar os atletas no dropdown de seleção e os dados dos jogos no 'dadosJogo'.
 * 1. Carrega os atletas da categoria para o dropdown.
 * 2. Chama 'carregarTabelaDeJogoDaCategoria' para buscar os dados dos jogos.
 */
function carregarAtletasECategorias() {
    const categoria = categoriaSelect.value;
    const fase = faseAtualNome.textContent.trim();

    if (!categoria || !fase) {
        atletaSelect.innerHTML = "<option value=''>Selecione</option>";
        dadosAtletas = {};
        dadosJogo = {};
        atualizarTabela(); // Limpa a tabela se não houver categoria/fase
        return;
    }

    // Limpa os dados anteriores
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    const categoriaRef = ref(db, `${fase}/${categoria}`);

    // Observa os atletas da categoria para popular o dropdown
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
        }
        // Após carregar a lista de atletas, carrega os dados dos jogos.
        carregarTabelaDeJogoDaCategoria(); 
    }, {
        onlyOnce: true // Usar { onlyOnce: true } para buscar apenas uma vez ou onValue para tempo real, dependendo da necessidade.
    });
}

/**
 * Função para carregar todos os dados de jogos para a categoria e fase selecionada
 * e atualizar a variável 'dadosJogo'.
 */
function carregarTabelaDeJogoDaCategoria() {
    const categoria = categoriaSelect.value;
    const fase = faseAtualNome.textContent.trim();
    dadosJogo = {}; // Limpa os dados de jogo anteriores

    if (!categoria || !fase) return;

    // Busca os dados de jogo para Jogo 1, Jogo 2 e Jogo 3
    const promises = ["1", "2", "3"].map(jogoNum => {
        const caminho = `jogos/${fase}/${categoria}/${jogoNum}jogo`;
        return get(ref(db, caminho)).then(snap => {
            if (snap.exists()) {
                const jogos = snap.val();
                // Processa os dados encontrados
                Object.keys(jogos).forEach(atletaNome => {
                    if (atletaNome in dadosAtletas) { // Verifica se o atleta existe na lista atual
                         // O Firebase retorna um objeto de objetos (push keys). 
                         // Como o valor é "true" ou dados de envio, verifica a existência de qualquer chave.
                        const isEnviado = Object.keys(jogos[atletaNome]).length > 0;
                        
                        if (!dadosJogo[atletaNome]) {
                            dadosJogo[atletaNome] = { jogo1: false, jogo2: false, jogo3: false };
                        }
                        // Define o status do jogo
                        dadosJogo[atletaNome][`jogo${jogoNum}`] = isEnviado;
                    }
                });
            }
        });
    });

    // Espera todas as buscas serem concluídas e atualiza a tabela
    Promise.all(promises)
        .then(() => {
            atualizarTabela();
        })
        .catch(err => {
            console.error("❌ Erro ao carregar dados de jogos:", err);
            atualizarTabela(); // Garante que a tabela seja atualizada mesmo com erro
        });
}

// ** O restante das funções 'verificarAtletaExistente', 'enviarParaFirebase' e o event listener
// ** do 'btnEnviar' não foram alterados, pois não afetavam as regras de preenchimento e checkbox. **

// Função para verificar se o atleta já foi enviado para a mesma categoria, fase e jogo
function verificarAtletaExistente(atletaNome, categoria, fase, jogo) {
    const caminho = `jogos/${fase}/${categoria}/${jogo}/${atletaNome}`;
    return get(ref(db, caminho)).then(snap => {
        return snap.exists();
    });
}

// Função para enviar os dados para o Firebase
btnEnviar.addEventListener("click", () => {
    const atletas = Array.from(atletaSelect.selectedOptions).map(opt => opt.value);
    const categoria = categoriaSelect.value;
    const ritmo = ritmoSelect.value;
    const faseSelecionada = faseAtualNome.textContent.trim(); // Obtém a fase atual

    if (!atletas.length || !categoria || !ritmo || !faseSelecionada) {
        alert("⚠️ Selecione um atleta, uma categoria, o ritmo e a fase.");
        return;
    }

    const jogoSelecionado = ritmo === "1º Jogo" ? "1jogo" : ritmo === "2º Jogo" ? "2jogo" : "3jogo";

    // Envia os dados de cada atleta selecionado para o Firebase
    atletas.forEach(atletaNome => {
        verificarAtletaExistente(atletaNome, categoria, faseSelecionada, jogoSelecionado).then(existe => {
            if (existe) {
                const confirmacao = window.confirm(`⚠️ O atleta "${atletaNome}" já foi enviado para o "${ritmo}" na fase "${faseSelecionada}" e categoria "${categoria}". Deseja substituir?`);
                if (confirmacao) {
                    enviarParaFirebase(atletaNome, categoria, ritmo, faseSelecionada, jogoSelecionado);
                } else {
                    console.log(`🚫 Envio do atleta "${atletaNome}" cancelado.`);
                }
            } else {
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
        fase: faseSelecionada,
        timestamp: Date.now() // Adiciona um timestamp para garantir uma chave única com push
    };

    const caminho = `jogos/${faseSelecionada}/${categoria}/${jogoSelecionado}/${atletaNome}`;

    // Usa push para adicionar um novo registro (ou set, dependendo da sua necessidade de substituir)
    // Se a intenção é apenas registrar que o jogo foi enviado, 'set' no nó 'atletaNome' seria mais simples.
    // Mantenho o 'push' original, mas é importante garantir que a estrutura do seu banco esteja correta.
    push(ref(db, caminho), dados)
        .then(() => {
            console.log(`✅ Dados enviados para ${caminho}`);
            // Recarrega os dados para refletir a mudança na tabela
            carregarTabelaDeJogoDaCategoria(); 
        })
        .catch(err => {
            console.error(`❌ Erro ao enviar para ${caminho}:`, err);
        });
}

// Função para carregar a tabela de jogos do Firebase (REMOVIDA/SUBSTITUÍDA por carregarTabelaDeJogoDaCategoria)
// A função original 'carregarTabelaDeJogo' foi removida para simplificar a lógica, que agora está 
// centralizada em 'carregarTabelaDeJogoDaCategoria'.

// Função para tratar a seleção dos jogos (checkboxes) - AGORA APENAS PREVINE A INTERAÇÃO
tabelaAtletas.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("jogo-checkbox")) {
        // Bloqueia a alteração manual, pois os checkboxes são apenas de visualização
        // e o 'checked' é controlado pelo estado do Firebase.
        e.preventDefault(); 
        e.stopPropagation();
    }
});

// Evento para trocar de categoria
categoriaSelect.addEventListener("change", () => {
    carregarAtletasECategorias();
});

// Evento para trocar de fase (caso 'faseAtualNome' possa mudar dinamicamente)
// Assumindo que a fase pode mudar e deve acionar o recarregamento.
// Se 'faseAtualNome' for estático, este evento não é necessário.
// Ex: Se fosse um dropdown de fase:
/*
faseSelect.addEventListener("change", () => {
    carregarAtletasECategorias();
});
*/

// Função inicial para carregar dados da categoria e fase selecionada ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    carregarAtletasECategorias();
});