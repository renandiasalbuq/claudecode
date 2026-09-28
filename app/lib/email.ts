import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { appUrl, env, envOpcional } from './env'

type Mensagem = { para: string; assunto: string; html: string; texto: string }

// Envia pelo Resend (API REST). Sem RESEND_API_KEY fora de produção, grava em
// dados-locais/emails.log para os testes locais.
export async function enviarEmail(m: Mensagem): Promise<{ ok: boolean; erro?: string }> {
  const chave = envOpcional('RESEND_API_KEY')
  if (!chave) {
    if (process.env.NODE_ENV === 'production' && !envOpcional('PERMITIR_BANCO_MEMORIA')) return { ok: false, erro: 'RESEND_API_KEY ausente' }
    mkdirSync(join(process.cwd(), 'dados-locais'), { recursive: true })
    appendFileSync(join(process.cwd(), 'dados-locais', 'emails.log'), JSON.stringify({ ...m, em: new Date().toISOString() }) + '\n')
    return { ok: true }
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env('EMAIL_FROM'), to: [m.para], subject: m.assunto, html: m.html, text: m.texto }),
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return { ok: false, erro: `Resend ${r.status}: ${(await r.text()).slice(0, 300)}` }
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: String(e) }
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function moldura(titulo: string, corpo: string) {
  return `<!doctype html><html><body style="margin:0;background:#0b1512;font-family:Arial,Helvetica,sans-serif;color:#e9e4da">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="font-size:12px;letter-spacing:3px;color:#d8b978;margin:0 0 8px">RESERVA DE EMERGÊNCIA DO ZERO</p>
<h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.2;color:#fbf7ef;margin:0 0 20px">${titulo}</h1>
${corpo}
<p style="font-size:12px;color:#8d978f;margin-top:32px">Se você não fez esta compra, ignore este e-mail${envOpcional('EMAIL_SUPORTE') ? ` ou fale com ${esc(envOpcional('EMAIL_SUPORTE')!)}` : ''}.</p>
</div></body></html>`
}

const botao = (href: string, rotulo: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="background:#d8b978;color:#0e2b25;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:8px;display:inline-block">${rotulo}</a></p>`

export function emailBoasVindas(para: string, senha: string): Mensagem {
  const link = `${appUrl()}/login`
  return {
    para,
    assunto: 'Seu acesso à Reserva de Emergência do Zero',
    texto: `Seu acesso está liberado.\n\nEntre em: ${link}\nE-mail: ${para}\nSenha: ${senha}\n\nGuarde este e-mail. Se perder a senha, gere uma nova em ${appUrl()}/primeiro-acesso`,
    html: moldura('Seu acesso está liberado',
      `<p style="font-size:16px;line-height:1.6">Obrigado pela compra. Use os dados abaixo para entrar na sua área de membros:</p>
<table style="background:#12241f;border-radius:10px;padding:16px;margin:16px 0;font-size:15px;width:100%">
<tr><td style="color:#8d978f;padding:4px 8px">E-mail</td><td style="color:#fbf7ef;padding:4px 8px"><b>${esc(para)}</b></td></tr>
<tr><td style="color:#8d978f;padding:4px 8px">Senha</td><td style="color:#fbf7ef;padding:4px 8px;font-family:monospace;font-size:17px"><b>${esc(senha)}</b></td></tr>
</table>${botao(link, 'Entrar na área de membros')}
<p style="font-size:13px;color:#8d978f">Perdeu a senha? Gere uma nova em <a style="color:#d8b978" href="${appUrl()}/primeiro-acesso">${appUrl()}/primeiro-acesso</a>.</p>`),
  }
}

export function emailProdutoLiberado(para: string, nomeProduto: string): Mensagem {
  const link = `${appUrl()}/login`
  return {
    para,
    assunto: `${nomeProduto} liberado na sua área`,
    texto: `${nomeProduto} já está na sua área de membros. Entre com seu e-mail e a senha que você já usa: ${link}`,
    html: moldura(`${esc(nomeProduto)} está liberado`,
      `<p style="font-size:16px;line-height:1.6">O novo conteúdo já está na sua área de membros. Entre com o seu e-mail e a senha que você já usa.</p>${botao(link, 'Abrir a área de membros')}`),
  }
}

export function emailNovaSenha(para: string, senha: string): Mensagem {
  const m = emailBoasVindas(para, senha)
  return { ...m, assunto: 'Sua nova senha de acesso', html: m.html.replace('Seu acesso está liberado', 'Aqui está sua nova senha') }
}
