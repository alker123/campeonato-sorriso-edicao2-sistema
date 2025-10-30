import { db2 } from './firebase1.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Primeiro conjunto de elementos para a primeira fase
const seletorCategoria1 = document.getElementById("seletor-categoria9");
const seletorFase1 = document.getElementById("seletor-fase5");
const tabelaBody1 = document.querySelector("#tabela-sorteio tbody");
const botaoSortear1 = document.getElementById("btn-sortear");

// Segundo conjunto de elementos para a segunda fase
const seletorCategoria2 = document.getElementById("seletor-categoria8");
const seletorFase2 = document.getElementById("seletor-fase6");
const tabelaBody2 = document.querySelector("#tabela-sorteio1 tbody");
const botaoSortear2 = document.getElementById("btn-sortear1");

botaoSortear1.addEventListener("click", sortearAtletas1);
botaoSortear2.addEventListener("click", sortearAtletas2);

let atletasPorCategoria = {}; // Guarda atletas da fase selecionada

// Lista fixa de fases
const fases = ['classificatória', 'oitavas', 'quartas', 'semi-final', 'final'];

// Preencher seletor de fases
fases.forEach(fase => {
  const opt1 = criarOpcaoDeFase(fase);
  const opt2 = criarOpcaoDeFase(fase);

  seletorFase1.appendChild(opt1);
  seletorFase2.appendChild(opt2);
});

// Quando mudar a fase, carregar categorias do db
seletorFase1.addEventListener("change", () => carregarCategorias(seletorFase1, seletorCategoria1));
seletorFase2.addEventListener("change", () => carregarCategorias(seletorFase2, seletorCategoria2));

async function carregarCategorias(seletorFase, seletorCategoria) {
  const faseSelecionada = seletorFase.value;

  // Limpar o seletor de categorias antes de adicionar novas opções
  seletorCategoria.innerHTML = '<option value="">Selecione a categoria</option>';

  if (!faseSelecionada) return;

  try {
    const snap = await get(ref(db2, faseSelecionada));
    if (!snap.exists()) return;

    const data = snap.val();
    atletasPorCategoria = data;

    // Adicionar as categorias ao seletor
    Object.keys(data).forEach(cat => {
      const opt = criarOpcaoDeCategoria(cat);
      seletorCategoria.appendChild(opt);
    });
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

// Função para criar opção de fase
function criarOpcaoDeFase(fase) {
  const opt = document.createElement("option");
  opt.value = fase;
  opt.textContent = fase.charAt(0).toUpperCase() + fase.slice(1);
  return opt;
}

// Função para criar opção de categoria
function criarOpcaoDeCategoria(categoria) {
  const opt = document.createElement("option");
  opt.value = categoria;
  opt.textContent = categoria;
  return opt;
}

// Função principal para sortear os atletas
function sortearAtletas1() {
  tabelaBody1.innerHTML = ""; // Limpar a tabela antes de mostrar o resultado

  const fase = seletorFase1.value;
  const categoria = seletorCategoria1.value;

  // Verificar se fase e categoria foram selecionadas
  if (!fase || !categoria) {
    alert("Selecione uma fase e categoria!");
    return;
  }

  const atletasObj = atletasPorCategoria[categoria];
  if (!atletasObj) {
    alert("Nenhum atleta encontrado!");
    return;
  }

  let atletas = Object.values(atletasObj);

  // Embaralhar a lista de atletas
  atletas = embaralharAtletas(atletas);

  // Separar atletas ímpares e pares
  const atletasImpares = separarAtletasPorParidade(atletas, 'impar');
  const atletasPares = separarAtletasPorParidade(atletas, 'par');

  // Gerar pares de atletas
  const pares = gerarPares(atletasImpares, atletasPares);

  // Exibir os pares sorteados na tabela
  exibirParesNaTabela(pares, tabelaBody1);
}

// Função para embaralhar a lista de atletas
function embaralharAtletas(atletas) {
  return atletas.sort(() => Math.random() - 0.5);
}

// Função para separar atletas ímpares e pares
function separarAtletasPorParidade(atletas, tipo) {
  return atletas.filter(atleta => tipo === 'impar' ? atleta.numero % 2 !== 0 : atleta.numero % 2 === 0);
}

// Função para gerar pares de atletas (ímpares e pares)
function gerarPares(atletasImpares, atletasPares) {
  let pares = [];
  const numImpares = atletasImpares.length;
  const numPares = atletasPares.length;

  // Emparelhamento entre ímpares e pares
  const minLength = Math.min(numImpares, numPares);

  for (let i = 0; i < minLength; i++) {
    const atletaImpar = atletasImpares[i];
    const atletaPar = atletasPares[i];
    pares.push([atletaImpar, atletaPar]);
  }

  // Verifica se sobrou algum atleta ímpar ou par sem par
  if (numImpares > numPares) {
    const ultimoImpar = atletasImpares[minLength];
    const primeiroPar = atletasPares[0];
    pares.push([ultimoImpar, primeiroPar]);
  } else if (numPares > numImpares) {
    const ultimoPar = atletasPares[minLength];
    const primeiroImpar = atletasImpares[0];
    pares.push([ultimoPar, primeiroImpar]);
  }

  return pares;
}

// Função para exibir os pares na tabela
function exibirParesNaTabela(pares, tabelaBody) {
  pares.forEach(par => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${par[0].numero} - ${par[0].nome}</td>
      <td><img src="${par[0].foto}" alt="${par[0].nome}" style="width: 50px; height: 50px; border-radius: 50%;"></td>
      <td>X</td>
      <td>${par[1].numero} - ${par[1].nome}</td>
      <td><img src="${par[1].foto}" alt="${par[1].nome}" style="width: 50px; height: 50px; border-radius: 50%;"></td>
    `;

    tabelaBody.appendChild(tr);
  });
}

// Função para sortear atletas da segunda fase
function sortearAtletas2() {
  tabelaBody2.innerHTML = ""; // Limpar a tabela antes de mostrar o resultado

  const fase = seletorFase2.value;
  const categoria = seletorCategoria2.value;

  // Verificar se fase e categoria foram selecionadas
  if (!fase || !categoria) {
    alert("Selecione uma fase e categoria!");
    return;
  }

  const atletasObj = atletasPorCategoria[categoria];
  if (!atletasObj) {
    alert("Nenhum atleta encontrado!");
    return;
  }

  let atletas = Object.values(atletasObj);

  // Embaralhar a lista de atletas
  atletas = embaralharAtletas(atletas);

  // Separar atletas ímpares e pares
  const atletasImpares = separarAtletasPorParidade(atletas, 'impar');
  const atletasPares = separarAtletasPorParidade(atletas, 'par');

  // Gerar pares de atletas
  const pares = gerarPares(atletasImpares, atletasPares);

  // Exibir os pares sorteados na tabela
  exibirParesNaTabela(pares, tabelaBody2);
}


window.baixarPDF3 = function () {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    console.error('jsPDF não carregado');
    alert('Falha ao carregar jsPDF. Verifique os scripts.');
    return;
  }

  const tabela1 = document.getElementById('tabela-sorteio');
  const tabela2 = document.getElementById('tabela-sorteio1');
  if (!tabela1 || tabela1.querySelectorAll('tbody tr').length === 0) {
    alert('Não há linhas na tabela para exportar.');
    return;
  }

  // Pegando fase e categoria
  const faseSelecionada1 = seletorFase1.value || 'Não informada';
  const categoriaSelecionada1 = seletorCategoria1.value || 'Não informada';

  const faseSelecionada2 = seletorFase2.value || 'Não informada';
  const categoriaSelecionada2 = seletorCategoria2.value || 'Não informada';

  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

  // Cabeçalho com data/hora
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  doc.setFontSize(16);
  doc.text('Resultado do Sorteio - Jogo 1', 40, 40);

  doc.setFontSize(12);
  doc.text(`Fase: ${faseSelecionada1}`, 40, 80);
  doc.text(`Categoria: ${categoriaSelecionada1}`, 40, 100);

  doc.setFontSize(10);
  doc.text(`Gerado em ${data} às ${hora}`, 40, 60);

  // Tabela 1
  doc.autoTable({
    html: '#tabela-sorteio',
    startY: 120, // Começar a tabela 120 pt abaixo do topo
    theme: 'grid',
    styles: { halign: 'center', valign: 'middle', fontSize: 12 },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
  });

  // Ajustar o Y para a segunda tabela na mesma página
  const finalY = doc.lastAutoTable.finalY; // Posição Y onde a tabela 1 terminou
  const espacoEntreTabelas = 30; // Espaço entre as duas tabelas

  doc.setFontSize(16);
  doc.text('Resultado do Sorteio - Jogo 2', 40, finalY + espacoEntreTabelas); // Coloca título da Fase 2 abaixo da Tabela 1

  doc.setFontSize(12);
  doc.text(`Fase: ${faseSelecionada2}`, 40, finalY + espacoEntreTabelas + 20);
  doc.text(`Categoria: ${categoriaSelecionada2}`, 40, finalY + espacoEntreTabelas + 40);
  

  // Tabela 2
  doc.autoTable({
    html: '#tabela-sorteio1',
    startY: finalY + espacoEntreTabelas + 60, // Começar a tabela 60 pt abaixo do final da Tabela 1
    theme: 'grid',
    styles: { halign: 'center', valign: 'middle', fontSize: 12 },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    
  });

    // Rodapé (Sistema de Sorteio Automático)
  const h = doc.internal.pageSize.getHeight(); // Altura total da página
  doc.setFontSize(9);
  doc.text('Sistema de Sorteio Automático', 40, h - 20); // Coloca o texto no rodapé

  // Salvar PDF
  doc.save(`resultado_sorteio_${faseSelecionada1}_${categoriaSelecionada1}_${faseSelecionada2}_${categoriaSelecionada2}_${data.replace(/\//g, '-')}.pdf`);
};
