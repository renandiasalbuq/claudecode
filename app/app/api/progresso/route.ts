import { db } from '@/lib/db'
import { membroDaSessao } from '@/lib/sessao'
import { produtoPorSlug } from '@/lib/produtos'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LIMITE_BYTES = 64 * 1024

// chave = "<slug-do-produto>:<identificador>", ex.: "calculadora:despesas".
// Só aceita chaves de produtos que o membro comprou.
function autorizado(chave: string | null | undefined, liberados: string[]): chave is string {
  if (!chave || chave.length > 120 || !/^[a-z0-9-]+:[a-z0-9-]+$/.test(chave)) return false
  const p = produtoPorSlug(chave.split(':')[0])
  return !!p && liberados.includes(p.caktoId)
}

export async function GET(req: Request) {
  const m = await membroDaSessao()
  if (!m) return Response.json({ erro: 'não autenticado' }, { status: 401 })
  const chave = new URL(req.url).searchParams.get('chave')
  if (!autorizado(chave, m.produtos_liberados)) return Response.json({ erro: 'proibido' }, { status: 403 })
  return Response.json({ dados: await db().lerProgresso(m.id, chave) })
}

export async function POST(req: Request) {
  const m = await membroDaSessao()
  if (!m) return Response.json({ erro: 'não autenticado' }, { status: 401 })
  const texto = await req.text()
  if (texto.length > LIMITE_BYTES) return Response.json({ erro: 'grande demais' }, { status: 413 })
  let corpo: { chave?: string; dados?: unknown }
  try {
    corpo = JSON.parse(texto)
  } catch {
    return Response.json({ erro: 'JSON inválido' }, { status: 400 })
  }
  if (!autorizado(corpo.chave, m.produtos_liberados)) return Response.json({ erro: 'proibido' }, { status: 403 })
  await db().salvarProgresso(m.id, corpo.chave, corpo.dados ?? null)
  return Response.json({ ok: true })
}
