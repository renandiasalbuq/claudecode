# Área de membros · Reserva de Emergência do Zero

App Next.js (App Router) com os 3 produtos da Cakto, login próprio e liberação automática por webhook.

## Rotas
| Rota | O que faz |
|---|---|
| `/login` | Login com e-mail + senha (cookie httpOnly assinado) |
| `/area` | Lista os produtos: liberados e bloqueados (com link de compra) |
| `/p/[produto]?cap=N` | Leitor do produto. Valida sessão **e** compra no servidor a cada acesso |
| `/primeiro-acesso` | Plano B: gera nova senha por e-mail; se o e-mail falhar, mostra na tela mediante o código do pedido |
| `/conta` | Trocar senha |
| `/api/webhook/cakto?token=…` | Webhook da Cakto: `purchase_approved` libera, `refund` e `chargeback` revogam |
| `/api/progresso` | Salva checklists e ferramentas no banco (por membro) |
| `/api/download/[arquivo]` | PDFs e planilha, só para quem comprou |

## Banco (Supabase)
Rode `supabase/schema.sql` no SQL Editor. Tabelas `membros`, `progresso` e `webhook_eventos`, todas com RLS ligado e sem políticas:
só a service role (usada apenas no servidor) acessa.

## Variáveis de ambiente
Veja `.env.example`. Nenhum segredo vai para o código ou para o git.

## Conteúdo
`conteudo/<slug>.md`, num Markdown com blocos extras (`template`, `prompt`, `checklist`, `widget`, caixas `:::`). O formato está descrito em `lib/conteudo.ts`.

## Testes
```bash
npm test                 # conteúdo, webhook (liberar/revogar/idempotência/V2), assinatura HMAC, sessão
npx next build
# prova ponta a ponta (servidor local com banco em memória):
DB_DRIVER=memoria PERMITIR_BANCO_MEMORIA=1 SESSION_SECRET=... CAKTO_WEBHOOK_TOKEN=tok CAKTO_WEBHOOK_SECRET=sec npx next start
BASE=http://localhost:3000 TOKEN=tok SECRET=sec DADOS=dados-locais node tests/e2e.mjs
```
