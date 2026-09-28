import { envOpcional, env } from '@/lib/env'
import { assinaturaValida, iguais, type EnvelopeCakto } from '@/lib/cakto'
import { processarEnvelope } from '@/lib/liberacao'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // 1) Token na URL: rejeita tudo que não tiver o segredo certo.
  const token = new URL(req.url).searchParams.get('token') ?? ''
  if (!iguais(token, env('CAKTO_WEBHOOK_TOKEN'))) return Response.json({ erro: 'não autorizado' }, { status: 401 })

  const corpo = await req.text()
  let envelope: EnvelopeCakto
  try {
    envelope = JSON.parse(corpo)
  } catch {
    return Response.json({ erro: 'JSON inválido' }, { status: 400 })
  }

  // 2) Origem Cakto: assinatura HMAC no header ou `secret` do corpo, quando o secret já está configurado.
  const secret = envOpcional('CAKTO_WEBHOOK_SECRET')
  if (secret) {
    const porAssinatura = assinaturaValida(corpo, req.headers.get('x-cakto-timestamp'), req.headers.get('x-cakto-signature'), secret)
    const porCorpo = typeof envelope.secret === 'string' && iguais(envelope.secret, secret)
    if (!porAssinatura && !porCorpo) return Response.json({ erro: 'assinatura inválida' }, { status: 401 })
  } else {
    console.warn('[webhook] CAKTO_WEBHOOK_SECRET não configurado: validando só pelo token da URL')
  }

  try {
    const resultados = await processarEnvelope(envelope)
    console.log('[webhook]', envelope.event, JSON.stringify(resultados))
    return Response.json({ ok: true, evento: envelope.event, resultados })
  } catch (e) {
    console.error('[webhook] erro', e)
    return Response.json({ ok: false, erro: 'falha ao processar' }, { status: 500 })
  }
}
