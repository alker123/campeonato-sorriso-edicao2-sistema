

import { db4, db3 } from "./firebase.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Função para salvar o primeiro e segundo lugar
function segundo() {
    const fase = document.getElementById("seletor-fase-grupo1").value;  // Pega a fase selecionada
    const categoria = document.getElementById("seletor-categoria1").value;  // Pega a categoria selecionada

    // Verificar se a fase e categoria foram selecionadas
    if (!fase || !categoria) {
        alert("Por favor, selecione a fase e a categoria.");
        return;
    }

    console.log(`Salvando dados para o primeiro e segundo lugar, fase: ${fase}, categoria: ${categoria}`);

    // Percorrer a tabela para encontrar as duas primeiras linhas (primeiro e segundo lugar)
    const tabela = document.getElementById("tabela-secundaria1").getElementsByTagName('tbody')[0];
    const linhas = tabela.getElementsByTagName('tr');

    // Verifique se há pelo menos 2 linhas na tabela
    if (linhas.length < 2) {
        alert("Não há atletas suficientes na tabela.");
        return;
    }

    // Função para extrair os dados de uma linha
    function extrairDados(linha) {
        const colunas = linha.getElementsByTagName('td');
        const posicao = colunas[2].textContent.trim();
        const foto = colunas[1].querySelector("img").src.trim();
        const nomeAtleta = colunas[3].textContent.trim();  // Nome do atleta
        const jogo1 = colunas[5].textContent.trim();  // Nota 1º Jogo
        const jogo2 = colunas[6].textContent.trim();  // Nota 2º Jogo
        const jogo3 = colunas[7].textContent.trim();  // Nota 3º Jogo
        const notaFinal = colunas[8].textContent.trim();  // Nota Final
        const classificado = colunas[9].textContent.trim();  // Classificado para próxima fase

        return { posicao, foto, nomeAtleta, jogo1, jogo2, jogo3, notaFinal, classificado };
    }

    // Extrair os dados para o primeiro e segundo lugar
    const primeiroLugar = extrairDados(linhas[0]);  // Primeira linha - primeiro lugar
    const segundoLugar = extrairDados(linhas[1]);  // Segunda linha - segundo lugar

    // Gerar IDs únicos para os atletas
    const atletaId1 = `primeiro-${primeiroLugar.nomeAtleta.toLowerCase().replace(/\s+/g, '_')}`;
    const atletaId2 = `segundo-${segundoLugar.nomeAtleta.toLowerCase().replace(/\s+/g, '_')}`;

    console.log(`Salvando dados para o primeiro lugar: ${primeiroLugar.nomeAtleta} (${atletaId1})`);
    console.log(`Salvando dados para o segundo lugar: ${segundoLugar.nomeAtleta} (${atletaId2})`);

    // Referências no Firebase para salvar os dados de ambos os atletas
    const referenciaPrimeiro = ref(db3, `PrimeiroSegundo-Lugar/${fase}/${categoria}/atletas/${atletaId1}`);
    const referenciaSegundo = ref(db3, `PrimeiroSegundo-Lugar/${fase}/${categoria}/atletas/${atletaId2}`);

    // Salvar os dados dos atletas
    const promise1 = set(referenciaPrimeiro, {
        posicao: primeiroLugar.posicao,
        nome: primeiroLugar.nomeAtleta,
        fase: fase,
        categoria: categoria,
        jogos: {
            "1º Jogo": primeiroLugar.jogo1,
            "2º Jogo": primeiroLugar.jogo2,
            "3º Jogo": primeiroLugar.jogo3
        },
        notaFinal: primeiroLugar.notaFinal,
        classificado: primeiroLugar.classificado || "",
        foto: primeiroLugar.foto || ""
    });

    const promise2 = set(referenciaSegundo, {
        posicao: segundoLugar.posicao,
        nome: segundoLugar.nomeAtleta,
        fase: fase,
        categoria: categoria,
        jogos: {
            "1º Jogo": segundoLugar.jogo1,
            "2º Jogo": segundoLugar.jogo2,
            "3º Jogo": segundoLugar.jogo3
        },
        notaFinal: segundoLugar.notaFinal,
        classificado: segundoLugar.classificado || "",
        foto: segundoLugar.foto || ""
    });

    // Espera pelas duas promessas serem resolvidas
    Promise.all([promise1, promise2])
        .then(() => {
            alert("Dados do primeiro e segundo lugar salvos com sucesso!");
        })
        .catch(() => {
            alert("Houve um erro ao salvar os dados.");
        });
}

// Adicionando o evento de clique ao botão "Segundo"
const btnSegundo = document.getElementById("segundo1");
btnSegundo.addEventListener("click", segundo);
