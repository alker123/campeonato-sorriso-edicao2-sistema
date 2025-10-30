
import { db4, db3  } from "./firebase.js";
import { ref, onValue, getDatabase, remove, push, get, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const seletorCategoria = document.getElementById("seletor-categoria5"); // Seletor de categoria
    const inputCategoria = document.getElementById("categoria14"); // Input onde a categoria será exibida

    // Função para buscar as categorias do Firebase
    const buscarCategorias = async () => {
        try {
            const categoriaRef = ref(db3, 'Categoria'); // Referência para o nó 'Categoria'
            const snapshot = await get(categoriaRef); // Obtendo os dados do Firebase

            if (snapshot.exists()) {
                const categorias = snapshot.val(); // Obtém as categorias
                console.log("Categorias recebidas: ", categorias);

                // Preenche o seletor de categorias
                Object.keys(categorias).forEach(categoriaId => {
                    const option = document.createElement("option");
                    option.value = categoriaId; // O valor é o ID da categoria
                    option.textContent = categorias[categoriaId]; // O texto é o nome da categoria
                    seletorCategoria.appendChild(option); // Adiciona a opção ao seletor
                });
            } else {
                console.log("Nenhuma categoria encontrada.");
            }
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        }
    };


    // Chama a função para buscar as categorias quando a página carregar
    buscarCategorias();

    // Adiciona evento de alteração no seletor de categoria
    seletorCategoria.addEventListener('change', () => {
        const categoriaSelecionada = seletorCategoria.value;
        inputCategoria.value = categoriaSelecionada; // Exibe a categoria selecionada no input
    });

    // Função para carregar as informações do terceiro lugar da categoria selecionada
    const carregarTerceiroLugar = async () => {
        const categoriaSelecionada = seletorCategoria.value;
        const faseSelecionada = "classificatória";  // Fase fixa, como "classificatória"

        if (!categoriaSelecionada) {
            alert("Por favor, selecione uma categoria.");
            return;
        }

        try {
            // A referência ao caminho do terceiro lugar foi ajustada para considerar a fase fixa
            const terceiroLugarRef = ref(db3, `Terceiro-Lugar/${faseSelecionada}/${categoriaSelecionada}/atletas`);
            const snapshot = await get(terceiroLugarRef);

            if (snapshot.exists()) {
                const dados = snapshot.val();
                console.log("Dados dos atletas:", dados); // Verifique se os dados estão corretos

                // Encontrando o atleta que está em terceiro lugar
                const atletaTerceiro = Object.values(dados).find(atleta => atleta.posicao === "3");

                if (atletaTerceiro) {
                    // Preencher as informações no terceiro lugar
                    document.getElementById("foto-atleta3").src = atletaTerceiro.foto;
                    document.getElementById("nome3").value = atletaTerceiro.nome || "Nome não disponível"; // Exibe o nome do atleta
                    document.getElementById("fase13").value = atletaTerceiro.fase;
                    document.getElementById("nota123").value = atletaTerceiro.notaFinal || "Nota não disponível";
                    document.getElementById("pocicao13").value = atletaTerceiro.posicao || "Nota não disponível";

                    document.getElementById("pocicao13").value = "TERCEIRO";  // Aqui você coloca "Terçeiro" n
                    

                    // Mostrar o div de terceiro lugar
                    document.getElementById("terceiro").style.display = "block";
                } else {
                    console.log("Não há atleta no terceiro lugar.");
                    alert("Não há atleta classificado em terceiro lugar para esta categoria.");
                }
            } else {
                console.log("Não há informações para o terceiro lugar.");
                alert("Não há informações para o terceiro lugar dessa categoria.");
            }
        } catch (error) {
            console.error("Erro ao buscar dados do terceiro lugar:", error);
        }
    };

    // Função para carregar as informações do primeiro, segundo ou terceiro lugar
    const carregarLugar = async (posicao) => {
        const categoriaSelecionada = seletorCategoria.value;
        const faseSelecionada = "classificatória";  // Fase fixa, como "classificatória"

        if (!categoriaSelecionada) {
            alert("Por favor, selecione uma categoria.");
            return;
        }

        try {
            const lugarRef = ref(db3, `PrimeiroSegundo-Lugar/${faseSelecionada}/${categoriaSelecionada}/atletas`);
            const snapshot = await get(lugarRef);

            if (snapshot.exists()) {
                const dados = snapshot.val();
                console.log("Dados dos atletas:", dados);

                const atleta = Object.values(dados).find(atleta => atleta.posicao === String(posicao));

                if (atleta) {
                    if (posicao === 1) {
                        document.getElementById("foto-atleta1").src = atleta.foto || "default-foto.png";
                        document.getElementById("nome").value = atleta.nome || "Nome não disponível";
                        document.getElementById("fase1").value = atleta.fase;
                        document.getElementById("nota12").value = atleta.notaFinal || "Nota não disponível";
                        document.getElementById("primeiro").style.display = "block";
                        document.getElementById("pocicao1").value = atleta.posicao || "Nota não disponível";
                    } else if (posicao === 2) {
                        document.getElementById("foto-atleta2").src = atleta.foto || "default-foto.png";
                        document.getElementById("nome2").value = atleta.nome || "Nome não disponível";
                        document.getElementById("fase12").value = atleta.fase;
                        document.getElementById("nota122").value = atleta.notaFinal || "Nota não disponível";
                        document.getElementById("pocicao12").value = atleta.posicao || "Nota não disponível";
                        document.getElementById("segundo").style.display = "block";
                    } else if (posicao === 3) {
                        document.getElementById("foto-atleta3").src = atleta.foto || "default-foto.png";
                        document.getElementById("nome3").value = atleta.nome || "Nome não disponível";
                        document.getElementById("fase13").value = atleta.fase;
                        document.getElementById("nota123").value = atleta.notaFinal || "Nota não disponível";
                        document.getElementById("terceiro").style.display = "block";
                    }
                } else {
                    alert(`Não há atleta classificado em ${posicao}º lugar para esta categoria.`);
                }
            } else {
                alert("Não há informações para este lugar dessa categoria.");
            }
        } catch (error) {
            console.error("Erro ao buscar dados do lugar:", error);
        }
    };

    // Função para carregar o primeiro e segundo lugar
    const carregarPrimeiroESegundo = async () => {
        await carregarLugar(1);  // Para o primeiro lugar
        await carregarLugar(2);  // Para o segundo lugar

        document.getElementById("pocicao12").value = "SEGUNDO";  // Aqui você coloca "Segundo" n
        document.getElementById("pocicao1").value = "PRIMEIRO";  // Aqui você coloca "Primeiro" n
    };



    // Evento para o botão "Segundo" - Carregar primeiro e segundo lugares
    document.getElementById("segundo4").addEventListener('click', () => {
        carregarPrimeiroESegundo();
    });

    // Evento para o botão "Terceiro" - Carregar apenas o terceiro lugar
    document.getElementById("terceiro4").addEventListener('click', () => {
        carregarTerceiroLugar();  // Carregar terceiro lugar
    });

    // Adiciona o evento para o botão "Voltar"
    document.getElementById("voltar3").addEventListener('click', () => {
        document.getElementById("primeiro").style.display = "none";
        document.getElementById("segundo").style.display = "none";
        document.getElementById("terceiro").style.display = "none";
    });
});

