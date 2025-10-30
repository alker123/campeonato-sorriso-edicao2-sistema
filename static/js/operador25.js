

import { db4 as db1, db3 as db2  } from "./firebase.js";
import { ref, onValue, getDatabase, push, get, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";


document.addEventListener("DOMContentLoaded", function () {


    // Botão e div mandar atleta para operador
    const botaoJurado1 = document.getElementById('enviar-jurado1');
    const containerEnviarJurado = document.getElementById('operadorj1');

    botaoJurado1.addEventListener('click', function () {
        // Esconde a div de usuário se estiver visível


        containerTabela.style.display = 'none';
        containerTela.style.display = 'none'; // Esconder
        containerTela2.style.display = 'none'; // Esconder
        containerSorteio.style.display = 'none'; // Esconder
        



        // Alterna a visibilidade da div de categoria
        if (containerEnviarJurado.style.display === 'none' || containerEnviarJurado.style.display === '') {
            containerEnviarJurado.style.display = 'block'; // Mostrar
        } else {
            containerEnviarJurado.style.display = 'none'; // Esconder
        }
    });


    // Botão e div tabela
    const botaoTabela = document.getElementById('planilha1');
    const containerTabela = document.getElementById('container-tabelas');

    botaoTabela.addEventListener('click', function () {
        // Esconde a div de usuário se estiver visível


        containerEnviarJurado.style.display = 'none';
        containerTela.style.display = 'none'; // Esconder
        containerTela2.style.display = 'none'; // Esconder
        containerSorteio.style.display = 'none'; // Esconder
        


        // Alterna a visibilidade da div de categoria
        if (containerTabela.style.display === 'none' || containerTabela.style.display === '') {
            containerTabela.style.display = 'block'; // Mostrar
        } else {
            containerTabela.style.display = 'none'; // Esconder
        }
    });

    const botaoMediaTotal = document.getElementById('MediaTotal');
    const containerTabela2 = document.getElementById('tabela-secundaria');

    botaoMediaTotal.addEventListener('click', function () {
        // Esconde a div de usuário se estiver visível

        containerTabela2.style.display = 'block';
        containerTela2.style.display = 'none'; // Esconder
        
    });

    // Botão e div sorteio
    const botaoSorteio = document.getElementById('sorteio1');
    const containerSorteio = document.getElementById('sorteio');

    botaoSorteio.addEventListener('click', function () {
        // Esconde a div de usuário se estiver visível


        containerEnviarJurado.style.display = 'none';
        containerTabela.style.display = 'none'; // Esconder
        containerTela.style.display = 'none'; // Esconder
        containerTela2.style.display = 'none'; // Esconder
        


        // Alterna a visibilidade da div de categoria
        if (containerSorteio.style.display === 'none' || containerSorteio.style.display === '') {
            containerSorteio.style.display = 'block'; // Mostrar
        } else {
            containerSorteio.style.display = 'none'; // Esconder
        }
    });


    // Botão e div tela
    const botaoTela = document.getElementById('tela1');
    const containerTela = document.getElementById('container-tela');
    const containerTela1 = document.getElementById('header');
    const containerTela3 = document.getElementById('header3');

    botaoTela.addEventListener('click', function () {
        // Esconde a div de usuário se estiver visível


        containerEnviarJurado.style.display = 'none';
        containerTabela.style.display = 'none'; // Esconder
        containerSorteio.style.display = 'none'; // Esconder
        containerTela1.style.display = 'none'; // Esconder
        containerTela3.style.display = 'none'; // Esconder
        containerTela2.style.display = 'none'; // Esconder
        
        

        // Alterna a visibilidade da div de categoria
        if (containerTela.style.display === 'none' || containerTela.style.display === '') {
            containerTela.style.display = 'block'; // Mostrar
        } else {
            containerTela.style.display = 'none'; // Esconder
        }
    });

    // Botão e div tabela
    const botaoVoltar3 = document.getElementById('voltar3');


    botaoVoltar3.addEventListener('click', function () {
        // Esconde a div de usuário se estiver visível


        containerEnviarJurado.style.display = 'none';
        containerTela.style.display = 'none'; // Esconder
        containerSorteio.style.display = 'none'; // Esconder
        containerTela1.style.display = 'block'; // Esconder
        containerTela3.style.display = 'block'; // Esconder

    });

    // Botão e div tela
    const botaoTela2 = document.getElementById('tela2');
    const containerTela2 = document.getElementById('tabela-secundaria2');
    

    botaoTela2.addEventListener('click', function () {
        // Esconde a div de usuário se estiver visível


        containerEnviarJurado.style.display = 'none';
        containerTabela.style.display = 'none'; // Esconder
        containerTela1.style.display = 'none'; // Esconder
        containerSorteio.style.display = 'none'; // Esconder
        containerTela3.style.display = 'none'; // Esconder
        containerTela.style.display = 'none'; // Esconder
        


        // Alterna a visibilidade da div de categoria
        if (containerTela2.style.display === 'none' || containerTela2.style.display === '') {
            containerTela2.style.display = 'block'; // Mostrar
        } else {
            containerTela2.style.display = 'none'; // Esconder
        }
    });

    // Botão e div tabela
    const botaoVoltar4 = document.getElementById('voltar4');


    botaoVoltar4.addEventListener('click', function () {
        // Esconde a div de usuário se estiver visível


        containerEnviarJurado.style.display = 'none';
        containerTela.style.display = 'none'; // Esconder
        containerSorteio.style.display = 'none'; // Esconder
        containerTela2.style.display = 'none'; // Esconder
        containerTela1.style.display = 'block'; // Esconder
        containerTela3.style.display = 'block'; // Esconder
        

    });


});


// botao primeiro segundo e terçeiro

document.getElementById("terceiro4").addEventListener("click", function () {
    // Exibe a tela para a terceira posição
    document.getElementById("terceiro").style.display = "block";

    // Oculta os outros conteúdos
    document.getElementById("segundo").style.display = "none";
    document.getElementById("primeiro").style.display = "none";
});

document.getElementById("segundo4").addEventListener("click", function () {
    // Exibe a tela para a segunda posição
    document.getElementById("segundo").style.display = "block";

    // Não oculta o terceiro, apenas a primeira
    document.getElementById("primeiro").style.display = "block";
});

document.getElementById("voltar3").addEventListener("click", function () {
    // Quando o botão "Voltar" for clicado, escondemos as telas
    document.getElementById("segundo").style.display = "none";
    document.getElementById("primeiro").style.display = "none";
    document.getElementById("terceiro").style.display = "none"; // "Voltar" também esconde a tela de terceiro
});

