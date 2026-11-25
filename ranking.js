// Atualiza as duas tabelas de tempos em tempos. ?top=20 muda quantas linhas aparecem.
const INTERVALO_MS = 5000;
const TOP = Math.min(Math.max(parseInt(new URLSearchParams(location.search).get("top"), 10) || 10, 1), 50);
const PERSONAGENS = 12; // Mesma ordem de SvCharacterId no jogo
const BASE = 16; // Dupla: o número é J1 + 16 x (J2 + 1), como em sv_ranking_cloud.h
const ABAS = ["solo", "dupla"];

const vistos = { solo: null, dupla: null }; // nome -> pontos da leitura anterior

function celula(texto, classe) {
  const td = document.createElement("td");
  td.textContent = texto; // Nunca innerHTML: o nome vem de quem jogou
  if (classe) td.className = classe;
  return td;
}

function aviso(corpo, texto) {
  const tr = document.createElement("tr");
  const td = celula(texto, "aviso");
  td.colSpan = 5;
  tr.append(td);
  corpo.replaceChildren(tr);
}

// O sprite do personagem, com J1 ou J2 embaixo na dupla. Sem o dado, mostra "?".
function jogador(personagem, rotulo) {
  const caixa = document.createElement("span");
  const conhecido = Number.isInteger(personagem) && personagem >= 0 && personagem < PERSONAGENS;
  const foto = document.createElement(conhecido ? "img" : "span");

  caixa.className = `jogador ${rotulo.toLowerCase()}`;
  if (conhecido) {
    foto.src = `assets/personagens/${personagem}.png`;
    foto.alt = "";
  } else {
    foto.className = "sem-foto";
    foto.textContent = "?";
  }
  caixa.append(foto);
  if (rotulo) {
    const marca = document.createElement("small");
    marca.textContent = rotulo;
    caixa.append(marca);
  }
  return caixa;
}

function celulaNome(tipo, linha) {
  const td = document.createElement("td");
  const apelido = document.createElement("span");
  const codigo = linha.personagem;

  td.className = "nome";
  apelido.className = "apelido";
  apelido.textContent = linha.nome; // Nunca innerHTML: o nome vem de quem jogou
  if (tipo === "dupla") {
    td.append(jogador(codigo % BASE, "J1"), jogador(Math.floor(codigo / BASE) - 1, "J2"));
  } else {
    td.append(jogador(codigo, ""));
  }
  td.append(apelido);
  return td;
}

function desenhar(tipo, linhas) {
  const corpo = document.getElementById(tipo);
  const antes = vistos[tipo];
  vistos[tipo] = new Map(linhas.map((l) => [l.nome.toLowerCase(), l.pontos]));

  if (linhas.length === 0) return aviso(corpo, "Seja o primeiro!");

  corpo.replaceChildren(...linhas.slice(0, TOP).map((l, i) => {
    const tr = document.createElement("tr");
    const nome = celulaNome(tipo, l);
    // Na primeira leitura nada pisca; depois, só quem entrou ou melhorou
    if (antes && antes.get(l.nome.toLowerCase()) !== l.pontos) tr.className = "novo";

    const tempo = `${Math.floor(l.segundos / 60)}:${String(l.segundos % 60).padStart(2, "0")}`;
    tr.append(celula(i + 1, "pos"), nome, celula(l.pontos), celula(tempo, l.venceu ? "venceu" : ""), celula(l.abates));
    return tr;
  }));
}

let assinatura = ""; // Só redesenha quando algo muda, para o destaque não ser cortado

function situacao(online) {
  const caixa = document.getElementById("status");
  caixa.hidden = false;
  caixa.classList.toggle("online", online);
  document.getElementById("status-texto").textContent = online ? "online" : "offline";
}

async function atualizar() {
  try {
    const resposta = await fetch("/api/ranking", { signal: AbortSignal.timeout(10000) });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const dados = await resposta.json();
    if (!Array.isArray(dados.solo) || !Array.isArray(dados.dupla)) throw new Error("resposta inesperada");

    const nova = JSON.stringify(dados);
    if (nova !== assinatura) {
      assinatura = nova;
      desenhar("solo", dados.solo);
      desenhar("dupla", dados.dupla);
    }
    situacao(true);
  } catch (erro) {
    // Mantém o último ranking na tela e avisa
    console.warn(`Ranking offline: ${erro.message}`);
    situacao(false);
    if (!assinatura) {
      for (const tipo of ["solo", "dupla"]) aviso(document.getElementById(tipo), "Sem conexão com o ranking. Tentando de novo...");
    }
  } finally {
    setTimeout(atualizar, INTERVALO_MS);
  }
}

// A aba escolhida fica no endereço (#dupla), para abrir direto nela, por exemplo num telão
function mostrarAba() {
  const escolhida = location.hash === "#dupla" ? "dupla" : "solo";

  for (const tipo of ABAS) {
    document.getElementById(`painel-${tipo}`).hidden = tipo !== escolhida;
    document.getElementById(`aba-${tipo}`).setAttribute("aria-selected", String(tipo === escolhida));
  }
}

for (const botao of document.querySelectorAll("[data-aba]")) {
  botao.addEventListener("click", () => {
    history.replaceState(null, "", `#${botao.dataset.aba}`);
    mostrarAba();
  });
}
window.addEventListener("hashchange", mostrarAba);

mostrarAba();
atualizar();
