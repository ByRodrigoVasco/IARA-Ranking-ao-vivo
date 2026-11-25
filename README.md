# IARA · Ranking ao vivo

Página que mostra o ranking solo e o de duplas do jogo IARA, atualizada a cada 5 segundos.
Sem framework, sem dependências e sem etapa de build. Feita para a **Vercel**.

## Publicar na Vercel

1. Em <https://vercel.com/new>, importe este repositório (plano Hobby, para uso não comercial).
2. Em **Framework Preset**, escolha **Other**. Não preencha comando de build nem pasta de saída.
3. Em **Environment Variables**, crie:

   | Nome | Valor |
   |---|---|
   | `NUVEM_URL` | Project URL do Supabase |
   | `NUVEM_CHAVE` | chave **publishable** (`sb_publishable_...`), nunca a secreta |

4. Clique em **Deploy**. Se criar ou mudar uma variável depois, faça um **Redeploy**.

Cada envio à `main` publica uma versão nova. A chave fica só no servidor (`api/ranking.js`): o
navegador de quem visita não a recebe.

## Ver no computador

Com dados inventados, sem consultar o banco:

```powershell
node server.js --exemplo
```

Com o ranking de verdade, crie um arquivo `nuvem.local` nesta pasta (ignorado pelo git) com as
linhas `NUVEM_URL=` e `NUVEM_CHAVE=`:

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
