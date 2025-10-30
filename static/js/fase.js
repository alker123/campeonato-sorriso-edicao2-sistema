

import { db3 } from "./firebase.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Selecionando o botão "Salvar"
const btnSalvar = document.getElementById("salvar2");
const statusMessage = document.getElementById("statusMessage"); // Para exibir o status na tela

// Função para salvar os dados da tabela no Firebase
function salvar2() {
    const fase = document.getElementById("seletor-fase-grupo1").value;  // Pega a fase selecionada
    const categoria = document.getElementById("seletor-categoria1").value;  // Pega a categoria selecionada

    // Verificar se a fase e categoria foram selecionadas
    if (!fase || !categoria) {
        alert("Por favor, selecione a fase e a categoria.");
        return;
    }

    console.log(`Salvando dados para a fase: ${fase}, categoria: ${categoria}`);

    // Percorrer cada linha da tabela (exceto o cabeçalho)
    const tabela = document.getElementById("tabela-secundaria1").getElementsByTagName('tbody')[0];
    const linhas = tabela.getElementsByTagName('tr');
    const promises = []; // Array para armazenar as Promises de cada salva

    // Iterar por todas as linhas da tabela
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        const colunas = linha.getElementsByTagName('td');

        if (colunas.length > 1) {  // Verifica se é uma linha de dados (não a de "Nenhum dado encontrado")
            const posicao = colunas[2].textContent.trim();
            const foto = colunas[1].querySelector("img").src.trim();
            const nomeAtleta = colunas[3].textContent.trim();  // Nome do atleta
            const jogo1 = colunas[5].textContent.trim();  // Nota 1º Jogo
            const jogo2 = colunas[6].textContent.trim();  // Nota 2º Jogo
            const jogo3 = colunas[7].textContent.trim();  // Nota 3º Jogo
            const notaFinal = colunas[8].textContent.trim();  // Nota Final
            const classificado = colunas[9].textContent.trim();  // Classificado para próxima fase

            // Gerar um ID único baseado na posição da linha (começando de 1)
            const atletaId = `atleta-${i + 1}`;  // A posição começa em 1, então `i + 1`

            console.log(`Gerando ID único para o atleta ${nomeAtleta}: ${atletaId}`);

            console.log(`Salvando dados para o atleta ${nomeAtleta} (${atletaId})`);

            // Referência no Firebase para salvar os dados de cada atleta com ID único
            const referencia = ref(db3, `Fase/${fase}/${categoria}/atletas/${atletaId}`);

            // Criar uma Promise para cada salvamento e adicionar ao array promises
            const promise = set(referencia, {
                posicao: posicao,
                nome: nomeAtleta,
                fase: fase,
                categoria: categoria,
                jogos: {
                    "1º Jogo": jogo1,
                    "2º Jogo": jogo2,
                    "3º Jogo": jogo3
                },
                notaFinal: notaFinal,
                classificado: classificado || "",  // Se não tiver "classificado", deixa em branco
                foto: foto || ""
            }).then(() => {
                console.log(`Dados do atleta ${nomeAtleta} salvos com sucesso.`);
            }).catch((error) => {
                console.error("Erro ao salvar os dados: ", error);
            });

            // Adiciona a promise à lista de promises
            promises.push(promise);
        }
         
    }

    // Exibe mensagem quando terminar
    Promise.all(promises)
        .then(() => {
            alert("Todos os dados foram salvos com sucesso!");
        })
        .catch(() => {
            alert("Houve um erro ao salvar os dados.");
        });
}




// Adicionando o evento de clique ao botão "Salvar"
btnSalvar.addEventListener("click", salvar2);
