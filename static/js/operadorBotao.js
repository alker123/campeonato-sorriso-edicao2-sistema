

    // Função para excluir as linhas selecionadas da tabela principal
function excluirLinhasSelecionadas() {
  tabelaPrincipal.querySelectorAll("tr").forEach(linha => {
    const check = linha.querySelector("input[type='checkbox']");
    if (check?.checked) {
      const atleta = linha.querySelector("td:nth-child(2)").textContent;
      const categoria = linha.querySelector("td:nth-child(3)").textContent;
      const id = atleta + "||" + categoria;
      // Excluir do Firebase
      excluirDoFirebase(id);
      linha.remove();
    }
  });
}

// Função para excluir do Firebase
function excluirDoFirebase(id) {
  const mediaRef = ref(db3, `medias/${seletorRitmo.value}/${id}`);
  remove(mediaRef).then(() => {
    console.log("Dado excluído com sucesso do Firebase!");
  }).catch(error => {
    console.error("Erro ao excluir dado do Firebase: ", error);
  });
}

// Função para mostrar a tabela correspondente
function mostrarTabela(tabelaNumero) {
    // Esconde todas as tabelas
    for (let i = 1; i <= 8; i++) {
        let tabelaContainer = document.getElementById('tabela-' + i + '-container');
        if (tabelaContainer) {
            tabelaContainer.style.display = 'none';
        }
    }
    
    // Exibe a tabela solicitada
    let tabelaContainer = document.getElementById('tabela-' + tabelaNumero + '-container');
    if (tabelaContainer) {
        tabelaContainer.style.display = 'block';
    }
}

// Função para voltar para a Tabela Principal
function voltarParaTabelaPrincipal() {
    mostrarTabela(1);  // Exibe a Tabela Principal (Tabela 1)
}

// Função para ir para a Tabela Secundária
function MediaTotal() {
    mostrarTabela(2);  // Exibe a Tabela Secundária (Tabela 2)
}


function BaixarPDF3() {
    const tabela = document.getElementById('tabela-principal1');
    const ritmoAtual = document.getElementById("ritmo-atual").innerText || "Selecionar";
    const categoriaSelecionada = document.getElementById("seletor-categoria").value || "Selecionar";
    const faseSelecionada = document.getElementById("seletor-fase-grupo").value || "Selecionar";

    // Obter os valores dos árbitros
    const arbitroA = document.getElementById("arbitroA").value || "Não definido";
    const arbitroB = document.getElementById("arbitroB").value || "Não definido";

    // Criar container temporário para PDF
    const container = document.createElement("div");
    container.style.fontFamily = "Arial, sans-serif";
    container.style.textAlign = "center";
    container.style.margin = "20px";

    // Título
    const titulo = document.createElement("h2");
    titulo.textContent = ritmoAtual;
    titulo.style.color = "#ff8c00"; // Cor laranja
    container.appendChild(titulo);

    // Dados extras (fase e categoria)
    const dadosExtras = document.createElement("p");
    dadosExtras.textContent = `Fase: ${faseSelecionada} | Categoria: ${categoriaSelecionada}`;
    container.appendChild(dadosExtras);

    // Data e hora atual
    const dataHora = new Date().toLocaleString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const dataHoraElemento = document.createElement("p");
    dataHoraElemento.textContent = `Data e Hora: ${dataHora}`;
    container.appendChild(dataHoraElemento);

    // Tabela clonada
    const tabelaClonada = tabela.cloneNode(true);

    // Remover a coluna "Sel."
    const thElements = tabelaClonada.querySelectorAll("th");
    const tdElements = tabelaClonada.querySelectorAll("td");

    if (thElements.length > 0) {
        thElements[0].style.display = "none";
        tdElements.forEach(td => {
            if (td.cellIndex === 0) {
                td.style.display = "none";
            }
        });
    }

    // Adicionar a tabela clonada ao container
    container.appendChild(tabelaClonada);

    // Usar html2pdf para gerar o PDF
    html2pdf()
        .from(container)
        .set({
            margin: 10,
            filename: "documento-avaliacao.pdf",
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'landscape',
                autoPaging: true,
                tableAutoSize: true,
                compressPdf: true,
                pageBreak: 'auto'
            }
        })
        .save()
        .then(() => {
            // Remover o container após o download
            document.body.removeChild(container);
        });
}

  

function BaixarPDF() {
    const tabela = document.getElementById('tabela-principal1');
    const ritmoAtual = document.getElementById("ritmo-atual").innerText || "Selecionar";  // Obter o ritmo atual
    const categoriaSelecionada = document.getElementById("seletor-categoria").value || "Selecionar"; // Obter a categoria selecionada
    const faseSelecionada = document.getElementById("seletor-fase-grupo").value || "Selecionar"; // Obter a fase selecionada

    // Obter os valores dos árbitros dos campos de texto
    const arbitroA = document.getElementById("arbitroA").value || "Não definido";
    const arbitroB = document.getElementById("arbitroB").value || "Não definido";
    const arbitroC = document.getElementById("arbitroC").value || "Não definido";

    // Criar container temporário para PDF
    const container = document.createElement("div");
    container.style.fontFamily = "Arial, sans-serif";
    container.style.textAlign = "center";
    container.style.margin = "20px"; // Adicionar margem para o layout do container

    // Título
    const titulo = document.createElement("h2");
    titulo.textContent = ritmoAtual;
    titulo.style.color = "#ff8c00"; // Cor laranja
    titulo.style.marginBottom = "20px";
    container.appendChild(titulo);

    // Adicionar dados de fase, categoria e ritmo ao PDF
    const dadosExtras = document.createElement("p");
    dadosExtras.textContent = `Fase: ${faseSelecionada} | Categoria: ${categoriaSelecionada}`;
    dadosExtras.style.fontSize = "14px";
    dadosExtras.style.marginBottom = "10px";
    container.appendChild(dadosExtras);

    // Adicionar data e hora em tempo real
    const dataHora = new Date().toLocaleString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const dataHoraElemento = document.createElement("p");
    dataHoraElemento.textContent = `Data e Hora: ${dataHora}`;
    dataHoraElemento.style.fontSize = "14px";
    dataHoraElemento.style.marginBottom = "10px";
    container.appendChild(dataHoraElemento);

    // Adicionar os nomes dos árbitros em cima das colunas de notas
    const arbitrosTitulo = document.createElement("h3");
    arbitrosTitulo.textContent = "Árbitros:";
    arbitrosTitulo.style.marginTop = "20px";
    container.appendChild(arbitrosTitulo);

    const arbitrosTexto = document.createElement("p");
    arbitrosTexto.textContent = `${arbitroA} | ${arbitroB} | ${arbitroC}`;
    arbitrosTexto.style.fontSize = "14px";
    container.appendChild(arbitrosTexto);

    // Adicionar uma imagem (exemplo)
    const imagem = document.createElement("img");
    imagem.src = 'URL_DA_IMAGEM'; // Substitua pelo caminho da sua imagem
    imagem.style.width = '100px';
    imagem.style.height = 'auto';
    imagem.style.marginBottom = "20px";
    container.appendChild(imagem);

    // Clonar a tabela para não afetar a original
    const tabelaClonada = tabela.cloneNode(true);
    tabelaClonada.style.margin = "0 auto";
    tabelaClonada.style.borderCollapse = "collapse";
    tabelaClonada.style.width = "100%"; // Garantir que a tabela ocupe toda a largura

    // Remover a coluna "Sel."
    const thElements = tabelaClonada.querySelectorAll("th");
    const tdElements = tabelaClonada.querySelectorAll("td");

    if (thElements.length > 0) {
        // Remover a célula da coluna "Sel." no cabeçalho
        thElements[0].style.display = "none";
        tdElements.forEach(td => {
            if (td.cellIndex === 0) {
                td.style.display = "none"; // Ocultar todas as células da coluna "Sel."
            }
        });
    }

    // Criar uma nova linha de cabeçalho para os nomes dos árbitros
    const novaLinha = document.createElement("tr");

    // Adicionar células vazias para as colunas "Atleta", "Categoria"
    novaLinha.innerHTML = "<td></td><td></td>";

    // Adicionar as células com os nomes dos árbitros sobre as colunas de nota
    const arbitroACelula = document.createElement("td");
    arbitroACelula.textContent = arbitroA;
    arbitroACelula.style.fontWeight = "bold";
    arbitroACelula.style.textAlign = "center";
    arbitroACelula.style.border = "none"; // Remover a borda dessa célula
    novaLinha.appendChild(arbitroACelula);

    const arbitroBCelula = document.createElement("td");
    arbitroBCelula.textContent = arbitroB;
    arbitroBCelula.style.fontWeight = "bold";
    arbitroBCelula.style.textAlign = "center";
    arbitroBCelula.style.border = "none"; // Remover a borda dessa célula
    novaLinha.appendChild(arbitroBCelula);

    const arbitroCCelula = document.createElement("td");
    arbitroCCelula.textContent = arbitroC;
    arbitroCCelula.style.fontWeight = "bold";
    arbitroCCelula.style.textAlign = "center";
    arbitroCCelula.style.border = "none"; // Remover a borda dessa célula
    novaLinha.appendChild(arbitroCCelula);

    // Adicionar uma célula vazia para a coluna "Média"
    const mediaCelula = document.createElement("td");
    mediaCelula.style.border = "none"; // Remover borda
    novaLinha.appendChild(mediaCelula);

    // Inserir a nova linha acima do cabeçalho da tabela
    tabelaClonada.querySelector("thead").insertBefore(novaLinha, thElements[0].parentNode);

    // Ajustar a largura das colunas para garantir que os árbitros estejam alinhados corretamente
    tabelaClonada.querySelectorAll("th, td").forEach((td, index) => {
        td.style.border = "1px solid black";
        td.style.padding = "8px"; // Reduzindo o padding para ajustar mais informações
        td.style.textAlign = "center"; // Garantir que o texto esteja centralizado

        // Ajustar largura por coluna
        if (td.innerText.trim().toLowerCase() === "atleta" || td.cellIndex === 1) {
            td.style.width = "110px"; // Aumentar a largura da coluna "Atleta"
        } else if (td.innerText.trim().toLowerCase() === "nota" || td.cellIndex === 3 || td.cellIndex === 4 || td.cellIndex === 5) {
            td.style.width = "40px"; // Diminuir a largura das colunas de "Nota"
        } else if (td.innerText.trim().toLowerCase() === "categoria" || td.cellIndex === 2) {
            td.style.width = "80px"; // Ajustar a largura da "Categoria"
        } else if (td.innerText.trim().toLowerCase() === "média" || td.cellIndex === 13) {
            td.style.width = "40px"; // Ajustar a largura da "Média"
        } else {
            td.style.width = "100px"; // Largura padrão para outras colunas
        }
    });

    // Adicionar a tabela clonada ao contêiner
    container.appendChild(tabelaClonada);
    document.body.appendChild(container);

    // Usar html2pdf para gerar o PDF com a quebra de página adequada
    html2pdf()
        .from(container)
        .set({
            margin: 10,
            filename: "documento-avaliacao.pdf",
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'landscape', // Modo Paisagem
                autoPaging: true, // Forçar múltiplas páginas se necessário
                tableAutoSize: true, // Ajuste automático das tabelas
                compressPdf: true, // Otimizar o tamanho do PDF gerado
                pageBreak: 'auto' // Garantir quebras de página automáticas
            }
        })
        .save()
        .then(() => {
            // Remover o container após o download
            document.body.removeChild(container);
        });
}





function BaixarPDF1() {
  // 1) Checagens
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("jsPDF não carregado. Confirme as <script> no HTML.");
    console.error("window.jspdf/jsPDF ausentes");
    return;
  }
  const { jsPDF } = window.jspdf;
  if (!jsPDF.API || !jsPDF.API.autoTable) {
    alert("autoTable não carregado. Inclua jspdf-autotable após o jsPDF.");
    console.error("jsPDF.API.autoTable ausente");
    return;
  }

  // 2) Elementos
  const tabela = document.getElementById("tabela-secundaria1");
  if (!tabela) return alert("Tabela #tabela-secundaria1 não encontrada.");
  const linhas = tabela.querySelectorAll("tbody tr");
  if (linhas.length === 0) return alert("Não há linhas na tabela para exportar.");

  const faseSelecionada = (document.getElementById("seletor-fase-grupo1")?.value || "Não informada").trim();
  const categoriaSelecionada = (document.getElementById("seletor-categoria1")?.value || "Não informada").trim();

  // 3) PDF
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR");
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  doc.setFontSize(16);
  doc.text("Relatório - Nota de Atletas", 40, 40);

  doc.setFontSize(10);
  doc.text(`Gerado em ${data} às ${hora}`, 40, 60);

  doc.setFontSize(12);
  doc.text(`Fase: ${faseSelecionada}`, 40, 80);
  doc.text(`Categoria: ${categoriaSelecionada}`, 40, 100);

  // 4) Tabela
  doc.autoTable({
    html: "#tabela-secundaria1",
    startY: 120,
    theme: "grid",
    styles: { halign: "center", valign: "middle", fontSize: 10 },

    // Cabeçalho laranja
    headStyles: { fillColor: [255, 102, 0], textColor: 255 },

    // Remover a coluna "Sel." e ajustar o cabeçalho
    didParseCell: function (data) {
      try {
        if (data.section !== "body") return;

        const cellText = data.cell.raw ? (data.cell.raw.innerText || data.cell.raw.textContent) : "";
        
        // Remover a coluna "Sel."
        if (data.column.index === 0) {
          data.cell.styles.display = 'none'; // Esconder a célula "Sel."
        }

        // Destacar linha se "Classificado"
        if (cellText.toLowerCase().includes("classificado")) {
          data.row.styles.fillColor = [0, 153, 0]; // verde
          data.row.styles.textColor = 255; // texto branco
          data.row.styles.fontStyle = "bold"; // negrito
        } else {
          data.row.styles.fillColor = [255, 255, 255]; // branco
          data.row.styles.textColor = 0; // preto
          data.row.styles.fontStyle = "normal";
        }

        // Adicionar foto do atleta na coluna 1 do PDF
        if (data.column.index === 1) {
          const imgUrl = data.cell.raw.querySelector("img")?.src;  // Pega o src da imagem da célula
          if (imgUrl) {
            // Inserir a imagem no PDF na posição correta
            const imageWidth = 30; // Largura da imagem no PDF
            const imageHeight = 30; // Altura da imagem no PDF
            const imageX = data.cell.rect.x + 5;  // Ajuste a posição X
            const imageY = data.cell.rect.y + 5;  // Ajuste a posição Y
            doc.addImage(imgUrl, "JPEG", imageX, imageY, imageWidth, imageHeight);
          }
        }

      } catch (e) {
        console.error("didParseCell error:", e);
      }
    },

    // Rodapé em todas as páginas
    didDrawPage: () => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.text("Sistema de Notas - Capoeira", 40, h - 20);
    }
  });

  // 5) Salvar (sanitiza nome do arquivo)
  const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\-]+/g, "_");
  const nome = `notas_${slug(faseSelecionada)}_${slug(categoriaSelecionada)}_${data.replace(/\//g,"-")}.pdf`;
  doc.save(nome);
}

// Disponibiliza globalmente
window.BaixarPDF1 = BaixarPDF1;
window.baixarPDF1 = BaixarPDF1;
// Se quiser: document.getElementById("btn-download1")?.addEventListener("click", BaixarPDF1);


