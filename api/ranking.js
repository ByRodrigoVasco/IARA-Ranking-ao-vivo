// Lê os dois rankings no Supabase e devolve para a página.
// A URL e a chave ficam nas variáveis de ambiente (NUVEM_URL e NUVEM_CHAVE): não vão para o
// repositório nem para o navegador de quem visita.

const LIMITE = 50;
const VALIDADE_MS = 4000; // Muita gente olhando não vira muitas consultas ao banco

let guardado = null; // { quando, pedido }

// A mesma consulta serve a todos que chegarem enquanto ela vale
function lerOsDois(url, chave) {
  if (!guardado || Date.now() - guardado.quando >= VALIDADE_MS) {
    const pedido = Promise.all([lerRanking(url, chave, "solo"), lerRanking(url, chave, "dupla")]);
    guardado = { quando: Date.now(), pedido };
    // Uma falha não fica guardada: o próximo pedido tenta de novo
    pedido.catch(() => { if (guardado && guardado.pedido === pedido) guardado = null; });
  }
  return guardado.pedido;
}

async function lerRanking(url, chave, tipo) {
  const resposta = await fetch(`${url}/rest/v1/rpc/iara_ler_ranking`, {
    method: "POST",
    headers: { apikey: chave, "Content-Type": "application/json" },
    body: JSON.stringify({ p_tipo: tipo, p_limite: LIMITE }),
    signal: AbortSignal.timeout(8000),
  });
  if (!resposta.ok) throw new Error(`Supabase respondeu HTTP ${resposta.status} (${tipo})`);
  return resposta.json();
}

module.exports = async function handler(req, res) {
  const url = (process.env.NUVEM_URL || "").replace(/\/+$/, "");
  const chave = process.env.NUVEM_CHAVE || "";
  const responder = (status, corpo) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(corpo));
  };

  if (!url || !chave || chave.startsWith("sb_secret_")) {
    console.error("Configure as variáveis NUVEM_URL e NUVEM_CHAVE (chave publishable) no serviço.");
    return responder(500, { erro: "configuracao" });
  }
  try {
    const [solo, dupla] = await lerOsDois(url, chave);
    return responder(200, { solo, dupla });
  } catch (erro) {
    console.error(erro.message);
    return responder(502, { erro: "nuvem" });
  }
};
