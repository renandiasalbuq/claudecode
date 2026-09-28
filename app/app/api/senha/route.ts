import { db } from '@/lib/db'
import { conferirSenha, hashSenha } from '@/lib/senha'
import { membroDaSessao } from '@/lib/sessao'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const m = await membroDaSessao()
  if (!m) return Response.redirect(new URL('/login', req.url), 303)
  const f = await req.formData()
  const atual = String(f.get('atual') ?? '')
  const nova = String(f.get('nova') ?? '')
  if (nova.length < 8) return Response.redirect(new URL('/conta?erro=curta', req.url), 303)
  if (!(await conferirSenha(atual, m.senha_hash))) return Response.redirect(new URL('/conta?erro=atual', req.url), 303)
  await db().atualizarSenha(m.id, await hashSenha(nova), false)
  return Response.redirect(new URL('/conta?ok=1', req.url), 303)
}
