import { createHmac, timingSafeEqual } from 'node:crypto'

// Formato documentado em https://docs.cakto.com.br/conceitos/webhooks
export type PedidoCakto = {
  id: string
  refId?: string
  status?: string
  offer_type?: string
  customer?: { email?: string; name?: string }
  product?: { id?: string; name?: string }
}

export type EnvelopeCakto = { secret?: string; event?: string; data?: PedidoCakto | PedidoCakto[] }

export function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

// Assinatura: X-Cakto-Signature = v1=<hex HMAC-SHA256("{timestamp}.{corpo cru}", secret)>
export function assinaturaValida(corpoCru: string, timestamp: string | null, assinatura: string | null, secret: string, agoraS = Date.now() / 1000): boolean {
  if (!timestamp || !assinatura) return false
  if (!/^\d+$/.test(timestamp) || Math.abs(agoraS - Number(timestamp)) > 300) return false
  const esperado = 'v1=' + createHmac('sha256', secret).update(`${timestamp}.`).update(corpoCru).digest('hex')
  // Durante troca de versão o header pode trazer várias assinaturas separadas por vírgula.
  return assinatura.split(',').map((s) => s.trim()).some((s) => iguais(s, esperado))
}

// Webhook V1 manda um pedido em `data`; o V2 manda uma lista (principal + bumps).
export const pedidosDoEnvelope = (e: EnvelopeCakto): PedidoCakto[] =>
  Array.isArray(e.data) ? e.data : e.data ? [e.data] : []
