

import { db4 as db6, db3 as db7  } from "./firebase.js";
import { getDatabase, ref, onValue, getDatabase, remove, push, get, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Função para preencher os dados do atleta
function preencherDadosAtleta() {
  // Caminho correto para acessar os dados do atleta-1 a partir de "Fase"
  const atletaRef = ref(db7, 'Fase/classificatória/juvenil A/atletas/atleta-1');

  // Recupera os dados do Firebase
  get(atletaRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const dadosAtleta = snapshot.val();

        // Preenchendo os campos HTML com os dados do Firebase
        document.getElementById('fase1').value = dadosAtleta.fase;  // Fase
        document.getElementById('categoria12').value = dadosAtleta.categoria;  // Categoria
        document.getElementById('foto-atleta1').src = dadosAtleta.foto;  // Foto do atleta
        document.getElementById('nome').value = dadosAtleta.jogos.nome;  // Nome do atleta
        document.getElementById('pocicao1').value = dadosAtleta.posicao;  // Posição
        document.getElementById('nota12').value = dadosAtleta.notaFinal;  // Nota Final
        document.getElementById('classificacao1').value = dadosAtleta.classificado;  // Classificação

        // Exibe a foto do atleta
        document.getElementById('foto-atleta-container1').style.display = 'block';
      } else {
        console.log("Dados não encontrados!");
      }
    })
    .catch((error) => {
      console.error("Erro ao acessar os dados do Firebase:", error);
    });
}

// Chama a função para preencher os dados ao carregar a página
window.onload = function() {
  preencherDadosAtleta();
};