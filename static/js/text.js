btnEnviar.addEventListener("click", () => {
  // Obtém os atletas selecionados, categoria, ritmo e fase
  const atletas = Array.from(atletaSelect.selectedOptions).map(opt => opt.value);
  const categoria = categoriaSelect.value;
  const ritmo = ritmoSelect.value;
  const faseSelecionada = faseAtualNome.textContent; // Obtém o nome da fase selecionada

  // Verifica se todos os campos necessários estão preenchidos
  if (!atletas.length || !categoria || !ritmo || !faseSelecionada) {
    alert("⚠️ Selecione um atleta, uma categoria, o ritmo e a fase.");
    return;
  }


 
  // Definindo os jurados e seus caminhos
  const jurados = [
    { raiz: "avaliacaodejuradoA", nome: "juradoA" },
    { raiz: "avaliacaodejuradoB", nome: "juradoB" },
    { raiz: "avaliacaodejuradoC", nome: "juradoC" }
  ];

  // Percorre cada atleta selecionado
  atletas.forEach(nomeAtleta => {
    const info = dadosAtletas[nomeAtleta];

    // Verifica se as informações do atleta foram encontradas
    if (!info) {
      console.warn(`⚠️ Dados do atleta "${nomeAtleta}" não encontrados.`);
      return;
    }


    // Monta os dados a serem enviados
    const dados = {
      nome: info.nome,
      categoria: info.categoria,
      ritmo: ritmo,
      foto: info.foto || "", // Foto, se disponível
      numero: info.numero || "",
      fase: faseSelecionada  // Fase do atleta
    };

    // Envia os dados para cada jurado
    jurados.forEach(({ raiz, nome }) => {
      const caminho = `${raiz}/${faseSelecionada}/${ritmo}/${nome}`;

      // Envia os dados para o Firebase
      push(ref(db, caminho), dados)
        .then(() => {
          console.log(`✅ Enviado para ${caminho}, dados`);
        })
        .catch(err => {
          console.error(`❌ Erro ao enviar para ${caminho}:`, err);
        });
    });

    });

    
  



  alert("✅ Dados enviados para os jurados!");

  // Limpar selects após envio
  //atletaSelect.innerHTML = "<option value=''>Selecione</option>";
  //categoriaSelect.value = "";
 // ritmoSelect.value = "";
});
