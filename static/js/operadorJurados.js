import { db4 as db } from "./firebase.js";
import { ref, onValue, push, get, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// 📌 Elementos HTML
const atletaSelect = document.getElementById("atleta-selection");
const categoriaSelect = document.getElementById("categoria-selection");
const ritmoSelect = document.getElementById("ritmo-selection");
const btnEnviar = document.getElementById("enviar-jurados");
const faseAtualNome = document.getElementById("fase-atual-nome");

// Botões das fases com IDs únicos
const btnClassificatoria = document.getElementById("btn-classificatoria");
const btnOitavas = document.getElementById("btn-oitavas");
const btnQuartas = document.getElementById("btn-quartas");
const btnSemifinal = document.getElementById("btn-semifinal");
const btnFinal = document.getElementById("btn-final");

// Array com todos os botões de fase para facilitar o gerenciamento
const botoesFase = [btnClassificatoria, btnOitavas, btnQuartas, btnSemifinal, btnFinal];

let dadosAtletas = {}; // 🔹 Agora sim! Armazena info completa, inclusive foto

// 🔄 Variável para controlar o modo atual
let modoAtual = "avaliacoes"; // ou "fase"
let dadosFaseAtual = {}; // 🔹 Armazena todos os dados da fase atual

// 🎯 Função para atualizar botões ativos e indicador de fase
function atualizarFaseAtiva(faseNome, botaoAtivo) {
    // Remove classe active de todos os botões
    botoesFase.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    
    // Adiciona classe active ao botão clicado
    if (botaoAtivo) {
        botaoAtivo.classList.add('active');
    }
    
    // Atualiza o indicador de fase
    if (faseAtualNome) {
        faseAtualNome.textContent = faseNome;
    }
}

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador() {
  modoAtual = "classificatória";
  atualizarFaseAtiva("classificatória", btnClassificatoria);
  
  onValue(ref(db, "classificatória"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}

categoriaSelect.addEventListener("change", () => {
  const categoria = categoriaSelect.value;
  atletaSelect.innerHTML = "<option value=''>Selecione</option>"; // Limpa as opções anteriores
  
  if (!categoria) return; // Se não houver categoria selecionada, nada acontece

  dadosAtletas = {}; // Resetar os dados dos atletas ao trocar a categoria

  if (modoAtual === "fases") {
    // 🔹 Carrega atletas da fase classificatória
    const categoriaRef = ref(db, `fases/${categoria}`);
    
    onValue(categoriaRef, snap => {
      atletaSelect.innerHTML = "<option value=''>Selecione</option>";

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
    }, { onlyOnce: true });

  } else {
    // 🔹 Carrega atletas de fases eliminatórias (oitavas, quartas, semifinal, final)
    const categoriaRef = ref(db, `${modoAtual}/${categoria}`);

    onValue(categoriaRef, snap => {
      atletaSelect.innerHTML = "<option value=''>Selecione</option>";

      if (snap.exists()) {
        const atletasObj = snap.val();
        for (const id in atletasObj) {
          const atleta = atletasObj[id];
          if (atleta && atleta.nome) {
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
    }, { onlyOnce: true });
  }
});


// 📌 Função para carregar dados de uma fase específica
function carregarDadosDaFase(caminho) {
    modoAtual = "fase";
    console.log(`🔍 Carregando dados da fase: ${caminho}`);
    
    const faseRef = ref(db, caminho);

    onValue(faseRef, snapshot => {
        const dados = snapshot.val();
        console.log(`📊 Dados recebidos de ${caminho}:`, dados);

        // Limpar selects
        atletaSelect.innerHTML = '<option value="">Selecione um Atleta</option>';
        categoriaSelect.innerHTML = '<option value="">Selecione uma Categoria</option>';
        dadosAtletas = {}; // Resetar dados
        dadosFaseAtual = {}; // Resetar dados da fase

        if (!dados) {
            console.log(`⚠️ Nenhum dado encontrado em ${caminho}`);
            return;
        }

        // Salvar todos os dados da fase
        dadosFaseAtual = dados;
        
        // Coletar todas as categorias únicas
        const categoriasSet = new Set();

        for (const id in dados) {
            const entry = dados[id];
            console.log(`🔍 Processando entrada ${id}:`, entry);
            
            if (!entry || !entry.categoria) {
                console.log(`⚠️ Entrada sem categoria ${id}:`, entry);
                continue;
            }

            // Adicionar categoria ao set (evita duplicatas)
            categoriasSet.add(entry.categoria);
        }

        // Adicionar categorias ao select
        categoriasSet.forEach(categoria => {
            const optCategoria = document.createElement("option");
            optCategoria.value = categoria;
            optCategoria.textContent = categoria;
            categoriaSelect.appendChild(optCategoria);
        });
        
        console.log(`✅ Carregadas ${categoriasSet.size} categorias: ${Array.from(categoriasSet).join(', ')}`);
        console.log(`📋 Agora selecione uma categoria para ver os atletas`);
    });
}

// 🚀 Inicializar com dados do enviosParaOperador
carregarEnviosParaOperador();

// Evento do botão Classificatória
btnClassificatoria.addEventListener("click", () => {
    console.log("🔘 Botão classificatória clicado");
    atualizarFaseAtiva("classificatória", btnClassificatoria);
    carregarDadosDaFase("classificatória");
    carregarEnviosParaOperador();
});

// Eventos dos botões
btnOitavas.addEventListener("click", () => {
    console.log("🔘 Botão Oitavas clicado");
    atualizarFaseAtiva("oitavas", btnOitavas);
    carregarDadosDaFase("oitavas");
    carregarEnviosParaOperador1();
});

btnQuartas.addEventListener("click", () => {
    console.log("🔘 Botão Quartas clicado");
    atualizarFaseAtiva("quartas", btnQuartas);
    carregarDadosDaFase("quartas");
    carregarEnviosParaOperador2();
});

btnSemifinal.addEventListener("click", () => {
    console.log("🔘 Botão Semifinal clicado");
    atualizarFaseAtiva("semi-final", btnSemifinal);
    carregarDadosDaFase("semifinal");
    carregarEnviosParaOperador3();
});

btnFinal.addEventListener("click", () => {
    console.log("🔘 Botão Final clicado");
    atualizarFaseAtiva("final", btnFinal);
    carregarDadosDaFase("final");
    carregarEnviosParaOperador4();
});



// Enviar para Jurados
btnEnviar.addEventListener("click", async () => { // ⬅️ OBRIGATÓRIO: AGORA É ASYNC

    // Obtém os atletas selecionados, categoria, ritmo e fase
    const atletasSelecionados = Array.from(atletaSelect.selectedOptions).map(opt => opt.value);
    const categoria = categoriaSelect.value;
    const ritmo = ritmoSelect.value;
    const faseSelecionada = faseAtualNome.textContent;

    // 1. Verifica se todos os campos necessários estão preenchidos
    if (!atletasSelecionados.length || !categoria || !ritmo || !faseSelecionada) {
        alert("⚠️ Selecione um atleta, uma categoria, o ritmo e a fase.");
        return;
    }

    // Definindo os jurados e seus caminhos
    const jurados = [
        { raiz: "avaliacaodejuradoA", nome: "juradoA" },
        { raiz: "avaliacaodejuradoB", nome: "juradoB" },
        { raiz: "avaliacaodejuradoC", nome: "juradoC" }
    ];

    const atletasEnviadosComSucesso = [];

    // ➡️ MUDANÇA CRÍTICA: USA FOR...OF para permitir o 'await'
    for (const atletaComNumero of atletasSelecionados) {
        
        // Ajuste de Nome (Ex: "1 - sanzão" -> "sanzão")
        const partes = atletaComNumero.split(' - ');
        // Seu código carrega os dados em `dadosAtletas[nome]` onde `nome` é o atleta.nome
        // O valor do select é o atleta.nome. Vamos usar o atleta.nome diretamente para ser consistente.
        const nomeAtleta = partes.length > 1 ? partes[1].trim() : atletaComNumero.trim();

        const info = dadosAtletas[nomeAtleta]; // Usa a chave correta
        
        if (!info) {
            console.warn(`⚠️ Dados do atleta "${nomeAtleta}" não encontrados. A chave usada foi: ${nomeAtleta}`);
            continue; 
        }

        // Caminho de VERIFICAÇÃO/RASTREAMENTO: jogos/fase/categoria/ritmo/atleta
        const caminhoVerificacao = `jogos/${faseSelecionada}/${categoria}/${ritmo}/${nomeAtleta}`;

        try {
            // ===============================================
            // 🔍 1. VERIFICAÇÃO NO CAMINHO "jogos"
            // ===============================================
            const snapshot = await get(ref(db, caminhoVerificacao));
            let deveEnviar = true;
            
            if (snapshot.exists()) {
                const confirmacao = confirm(
                    `⚠️ O atleta ${nomeAtleta} já foi cadastrado no jogo "${ritmo}" da fase "${faseSelecionada}". Deseja **reenviar** para os jurados?`
                );

                if (!confirmacao) {
                    console.log(`❌ Reenvio cancelado para o atleta ${nomeAtleta}`);
                    deveEnviar = false;
                }
            }
            
            if (!deveEnviar) {
                continue; 
            }

            // Monta os dados
            const dados = {
                nome: info.nome,
                categoria: info.categoria,
                ritmo: ritmo,
                foto: info.foto || "",
                numero: info.numero || "",
                fase: faseSelecionada
            };
            
            const promessasEnvio = [];
            
            // ===============================================
            // 💾 2. SALVAMENTO NOS CAMINHOS DOS JURADOS
            // ===============================================
            jurados.forEach(({ raiz, nome }) => {
                // Caminho dos Jurados: avaliacaodejuradoX/fase/ritmo/nome
                const caminhoJurado = `${raiz}/${faseSelecionada}/${ritmo}/${nome}`;

                // SEU CÓDIGO ORIGINAL DE SALVAMENTO: push(ref(db, caminho), dados)
                const promessa = push(ref(db, caminhoJurado), dados)
                    .then(() => {
                        console.log(`✅ Enviado para ${caminhoJurado}`);
                    })
                    .catch(err => {
                        console.error(`❌ Erro ao enviar para ${caminhoJurado}:`, err);
                        throw err; // Lança o erro para que Promise.all falhe
                    });
                promessasEnvio.push(promessa);
            });

            // Espera que todos os envios para os jurados terminem
            await Promise.all(promessasEnvio);
            
            // ===============================================
            // 📝 3. CRIA O REGISTRO DE ENVIO EM "jogos"
            // ===============================================
            // Usa 'set' para criar o registro no caminho de verificação
            await set(ref(db, caminhoVerificacao), {
                nome: info.nome,
                enviadoEm: new Date().toISOString(),
                categoria: info.categoria
            });
            
            atletasEnviadosComSucesso.push(nomeAtleta);

        } catch (err) {
            console.error(`❌ Erro no processamento/envio do atleta ${nomeAtleta}:`, err);
        }

    } // Fim do for...of

    // Feedback final
    if (atletasEnviadosComSucesso.length > 0) {
        alert("✅ Dados enviados para os jurados!");
    } else {
        // Se esta mensagem aparecer, algo no loop ou nas permissões falhou
        alert("⚠️ Nenhum atleta foi enviado. Verifique os logs do console para mais detalhes.");
    }

    // Limpar selects após envio
    //...
});


// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador1() {
  modoAtual = "oitavas";
  atualizarFaseAtiva("oitavas", btnOitavas);
  
  onValue(ref(db, "oitavas"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador2() {
  modoAtual = "quartas";
  atualizarFaseAtiva("quartas", btnQuartas);
  
  onValue(ref(db, "quartas"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador3() {
  modoAtual = "semi-final";
  atualizarFaseAtiva("semi-final", btnSemifinal);
  
  onValue(ref(db, "semi-final"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador4() {
  modoAtual = "final";
  atualizarFaseAtiva("final", btnFinal);
  
  onValue(ref(db, "final"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}



//
//
