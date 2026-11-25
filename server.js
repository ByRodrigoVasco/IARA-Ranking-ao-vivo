// Servidor para ver a página neste computador (na Vercel ele não é usado):
//   node --env-file=<arquivo com NUVEM_URL e NUVEM_CHAVE> server.js
// Com --exemplo, usa nomes inventados e não consulta o banco.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const ranking = require("./api/ranking.js");
const qr = require("./api/qr.js");

const porta = Number(process.env.PORT) || 3000;
const exemplo = process.argv.includes("--exemplo");
const tipos = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".ttf": "font/ttf" };
const publicos = /^\/(index\.html|estilo\.css|ranking\.js|assets\/[\w/-]+\.(png|webp|ttf))$/;

// Na dupla o personagem leva os dois: J1 + 16 x (J2 + 1)
const linhas = (nomes, dupla) => nomes.map((nome, i) => ({
  nome, personagem: dupla ? (i % 12) + 16 * (((i + 5) % 12) + 1) : i % 12, segundos: 600 - i * 41, abates: 2100 - i * 160, nivel: 30 - i,
  chefes: Math.max(5 - i, 0), venceu: i === 0, pontos: 28500 - i * 2150,
}));

http.createServer((req, res) => {
  const caminho = new URL(req.url, "http://localhost").pathname;

  if (caminho === "/api/qr") return qr(req, res);
  if (caminho === "/api/ranking") {
    if (!exemplo) return ranking(req, res);
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({
      solo: linhas(["Ana", "Beto", "Carla", "Duda", "Enzo", "Fabi", "Gui", "Helena", "Igor", "Nome bem comprido 20"]),
      dupla: linhas(["Ana e Beto", "Carla e Duda", "Enzo e Fabi", "Dupla de nome longo"], true),
    }));
  }
  const arquivo = caminho === "/" ? "/index.html" : caminho;
  if (!publicos.test(arquivo)) { res.statusCode = 404; return res.end("404"); }
  fs.readFile(path.join(__dirname, arquivo), (erro, dados) => {
    if (erro) { res.statusCode = 404; return res.end("404"); }
    res.setHeader("Content-Type", tipos[path.extname(arquivo)]);
    res.end(dados);
  });
}).listen(porta, "127.0.0.1", () => console.log(`Ranking na porta ${porta}${exemplo ? " (dados de exemplo)" : ""}`));
