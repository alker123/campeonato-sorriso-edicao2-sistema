import { db3 } from "./firebase.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Função para salvar a terceira posição
function terceiro() {
    const fase = document.getElementById("seletor-fase-grupo1").value;  // Pega a fase selecionada
    const categoria = document.getElementById("seletor-categoria1").value;  // Pega a categoria selecionada

    // Verificar se a fase e categoria foram selecionadas
    if (!fase || !categoria) {
        alert("Por favor, selecione a fase e a categoria.");
        return;
    }

    console.log(`Salvando dados para a terceira posição, fase: ${fase}, categoria: ${categoria}`);

    // Percorrer a tabela para encontrar a terceira linha (terceira posição)
    const tabela = document.getElementById("tabela-secundaria1").getElementsByTagName('tbody')[0];
    const linhas = tabela.getElementsByTagName('tr');

    // Verifique se há pelo menos 3 linhas na tabela
    if (linhas.length < 3) {
        alert("Não há atletas suficientes na tabela.");
        return;
    }

    // Selecionar a terceira linha (índice 2)
    const terceiraLinha = linhas[2];  // A terceira linha da tabela
    const colunas = terceiraLinha.getElementsByTagName('td');

    // Extrair os dados da terceira linha
    const posicao = colunas[2].textContent.trim();
    const foto = colunas[1].querySelector("img") ? colunas[1].querySelector("img").src.trim() : '';  // Verifique se existe a imagem
    const nomeAtleta = colunas[3].textContent.trim();  // Nome do atleta
    const jogo1 = colunas[5].textContent.trim();  // Nota 1º Jogo
    const jogo2 = colunas[6].textContent.trim();  // Nota 2º Jogo
    const jogo3 = colunas[7].textContent.trim();  // Nota 3º Jogo
    const notaFinal = colunas[8].textContent.trim();  // Nota Final
    const classificado = colunas[9].textContent.trim();  // Classificado para próxima fase

    // Gerar um ID único para o atleta
    const atletaId = `terceiro-${nomeAtleta.toLowerCase().replace(/\s+/g, '_')}`;

    console.log(`Salvando dados para o atleta ${nomeAtleta} (${atletaId})`);

    // Referência no Firebase para salvar os dados do atleta na terceira posição
    const referencia = ref(db3, `Terceiro-Lugar/${fase}/${categoria}/atletas/${atletaId}`);

    // Salvar os dados do atleta da terceira posição
    set(referencia, {
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
        foto: foto || ""  // Se não tiver foto, deixa em branco
    }).then(() => {
        alert(`Dados do atleta ${nomeAtleta} salvos com sucesso na terceira posição.`);
    }).catch((error) => {
        console.error("Erro ao salvar os dados: ", error);
        alert("Houve um erro ao salvar os dados.");
    });
}

// Adicionando o evento de clique ao botão "Terceiro"
const btnTerceiro = document.getElementById("terceiro1");
btnTerceiro.addEventListener("click", terceiro);
