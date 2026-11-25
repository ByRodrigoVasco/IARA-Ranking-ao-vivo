// Função da Vercel: o QR code (SVG) que leva ao próprio site.
const QRCode = require("./_qrcode");
const NIVEL = require("./_qrcode/QRErrorCorrectLevel");

const MARGEM = 4; // Faixa branca em volta, exigida pelos leitores

function endereco(req) {
  // Na Vercel, o endereço de produção vale mesmo para quem abriu uma versão de teste
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || req.headers["x-forwarded-host"] || req.headers.host || "";
  if (!/^[A-Za-z0-9.-]+(:\d+)?$/.test(host)) return null;
  return `${/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? "http" : "https"}://${host}/`;
}

module.exports = function handler(req, res) {
  const url = endereco(req);
  if (!url) {
    res.statusCode = 400;
    return res.end("endereco invalido");
  }
  const codigo = new QRCode(-1, NIVEL.M);
  codigo.addData(url);
  codigo.make();

  const lado = codigo.getModuleCount();
  let desenho = "";
  for (let linha = 0; linha < lado; linha++) {
    for (let coluna = 0; coluna < lado; coluna++) {
      if (codigo.isDark(linha, coluna)) desenho += `M${coluna + MARGEM} ${linha + MARGEM}h1v1h-1z`;
    }
  }
  const total = lado + MARGEM * 2;
  res.statusCode = 200;
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total * 8}" height="${total * 8}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${desenho}" fill="#000"/></svg>`);
};
