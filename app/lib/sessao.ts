import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { env, emProducao } from './env'
import { db, type Membro } from './db'

// Cookie httpOnly assinado com HMAC-SHA256: <payload base64url>.<assinatura base64url>
export const COOKIE = 'sessao'
const DURACAO_S = 60 * 60 * 24 * 30 // 30 dias

type Payload = { m: string; exp: number }

const assinar = (dados: string) => createHmac('sha256', env('SESSION_SECRET')).update(dados).digest('base64url')

export function criarToken(membroId: string, agora = Date.now()): string {
  const payload: Payload = { m: membroId, exp: Math.floor(agora / 1000) + DURACAO_S }
  const dados = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${dados}.${assinar(dados)}`
}

export function lerToken(token: string | undefined, agora = Date.now()): string | null {
  if (!token) return null
  const [dados, assinatura] = token.split('.')
  if (!dados || !assinatura) return null
  const esperado = Buffer.from(assinar(dados))
  const recebido = Buffer.from(assinatura)
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return null
  try {
    const p = JSON.parse(Buffer.from(dados, 'base64url').toString()) as Payload
    if (typeof p.m !== 'string' || typeof p.exp !== 'number') return null
    if (p.exp * 1000 < agora) return null
    return p.m
  } catch {
    return null
  }
}

export const opcoesCookie = () => ({
  httpOnly: true,
  secure: emProducao(),
  sameSite: 'lax' as const,
  path: '/',
  maxAge: DURACAO_S,
})

// Valida a sessão NO SERVIDOR e busca o membro no banco a cada requisição,
// então um reembolso revoga o acesso na hora, mesmo com cookie válido.
export async function membroDaSessao(): Promise<Membro | null> {
  const id = lerToken((await cookies()).get(COOKIE)?.value)
  if (!id) return null
  return db().buscarMembroPorId(id)
}
