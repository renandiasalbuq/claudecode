import { db } from '@/lib/db'
import { gerarSenha, hashSenha } from '@/lib/senha'
import { emailNovaSenha, enviarEmail } from '@/lib/email'

export const runtime = 'nodejs'

const INTERVALO_MS = 3 * 60 * 1000
const volta = (req: Request, q: string) => Response.redirect(new URL(`/primeiro-acesso?${q}`, req.url), 303)
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

// Plano B para quando o e-mail de boas-vindas não chega.
// 1) Caminho normal: gera nova senha e envia por e-mail. A resposta é sempre a mesma,
//    para não revelar quais e-mails compraram.
// 2) Se o envio falhar: a pessoa informa o código do pedido (refId da Cakto). Isso prova
//    que ela tem a compra, então a nova senha é mostrada direto na tela.
export async function POST(req: Request) {
  const f = await req.formData()
  const email = String(f.get('email') ?? '').trim().toLowerCase()
  const codigo = String(f.get('codigo') ?? '').trim().toUpperCase()
  if (!email.includes('@')) return volta(req, 'erro=email')

  const m = await db().buscarMembroPorEmail(email)
  const temAcesso = !!m && m.produtos_liberados.length > 0

  if (codigo) {
    if (!temAcesso || !(await db().buscarEventoAprovado(email, codigo))) {
      return volta(req, `erro=codigo&falhou=1&email=${encodeURIComponent(email)}`)
    }
    const senha = gerarSenha(10)
    await db().atualizarSenha(m!.id, await hashSenha(senha), true)
    return new Response(paginaSenha(email, senha), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  if (temAcesso) {
    const recente = m!.senha_reenviada_em && Date.now() - new Date(m!.senha_reenviada_em).getTime() < INTERVALO_MS
    if (!recente) {
      const senha = gerarSenha(10)
      const r = await enviarEmail(emailNovaSenha(email, senha))
      if (!r.ok) {
        console.error('[primeiro-acesso] e-mail falhou:', r.erro)
        return volta(req, `falhou=1&email=${encodeURIComponent(email)}`)
      }
      await db().atualizarSenha(m!.id, await hashSenha(senha), true)
    }
  }
  return volta(req, `enviado=1&email=${encodeURIComponent(email)}`)
}

function paginaSenha(email: string, senha: string) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sua nova senha</title><style>body{margin:0;background:#0b1512;color:#e9e4da;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:20px}
.c{max-width:440px;width:100%;background:#12241f;border:1px solid #23413a;border-radius:16px;padding:28px}h1{font-family:Georgia,serif;color:#fbf7ef;font-size:26px;margin:0 0 12px}
.s{font-family:ui-monospace,monospace;font-size:26px;letter-spacing:2px;background:#0b1512;border-radius:10px;padding:14px;text-align:center;color:#d8b978;margin:16px 0}
a{display:block;text-align:center;background:#d8b978;color:#0e2b25;font-weight:700;text-decoration:none;padding:14px;border-radius:10px;margin-top:18px}p{line-height:1.6}</style></head>
<body><div class="c"><h1>Sua nova senha</h1><p>Anote agora: por segurança ela não será mostrada de novo.</p>
<p>E-mail: <b>${esc(email)}</b></p><div class="s">${esc(senha)}</div><a href="/login?email=${encodeURIComponent(email)}">Entrar agora</a></div></body></html>`
}
