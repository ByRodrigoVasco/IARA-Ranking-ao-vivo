# IARA · Ranking ao vivo

Página que mostra o ranking solo e o de duplas do jogo IARA, atualizada a cada 5 segundos.
Node puro, sem dependências. Feita para o **Google Cloud Run**.

## Publicar no Cloud Run

Precisa de um projeto no Google Cloud com faturamento ativado e do
[gcloud CLI](https://cloud.google.com/sdk/docs/install) (ou use o Cloud Shell do console).

Uma vez só, entre na conta, escolha o projeto e ligue os serviços:

```powershell
gcloud auth login
gcloud config set project ID-DO-PROJETO
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

Crie um arquivo `nuvem.local` nesta pasta (ignorado pelo git e pelo envio ao Google Cloud):

```
NUVEM_URL=https://<id-do-projeto>.supabase.co
NUVEM_CHAVE=sb_publishable_...
```

Use a chave **publishable**, nunca a secreta. Depois publique, na pasta do repositório (PowerShell):

```powershell
$vars = (Get-Content nuvem.local | Where-Object { $_ -match '^NUVEM_' }) -join ','
gcloud run deploy iara-ranking --source . --region southamerica-east1 --allow-unauthenticated --max-instances 2 --set-env-vars $vars
```

No fim, o comando mostra o endereço público da página. Para publicar uma mudança, rode os dois
comandos de novo.

- `--allow-unauthenticated`: qualquer pessoa com o link vê a página.
- `--max-instances 2`: limita o crescimento, e o custo, se muita gente acessar.
- A chave fica só no servidor: o navegador de quem visita não a recebe.

## Ver no computador

Com dados inventados, sem consultar o banco, e depois com o ranking de verdade:

```powershell
node server.js --exemplo
```

```powershell
node --env-file=nuvem.local server.js
```

Abra <http://localhost:3000>.

## Ajustes

- Abas **Solo** e **Duplas**; `#dupla` no fim do endereço abre direto nas duplas.
- Na dupla aparecem os personagens do J1 e do J2. O jogo manda os dois no mesmo número,
  J1 + 16 × (J2 + 1); uma partida enviada por uma versão anterior mostra "?" no J2.
- `?top=20` no endereço mostra mais linhas (padrão 10, máximo 50).
- As imagens e a fonte (VT323) vieram do jogo.

O plano gratuito do Supabase pausa o projeto após cerca de 7 dias sem atividade.
