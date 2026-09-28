import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { conferirSenha } from '@/lib/senha'
import { COOKIE, criarToken, opcoesCookie } from '@/lib/sessao'

export const runtime = 'nodejs'

const volta = (req: Request, caminho: string) => Response.redirect(new URL(caminho, req.url), 303)
const HASH_FALSO = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.nGj9fp8pWmH7bGrSyVp0e9wv9CxS'

export async function POST(req: Request) {
  const f = await req.formData()
  const email = String(f.get('email') ?? '').trim().toLowerCase()
  const senha = String(f.get('senha') ?? '')
  const destino = String(f.get('destino') ?? '/area')
  const seguro = destino.startsWith('/') && !destino.startsWith('//') ? destino : '/area'

  const m = email && senha ? await db().buscarMembroPorEmail(email) : null
  // Compara mesmo sem membro para não revelar, pelo tempo de resposta, quais e-mails existem.
  const ok = await conferirSenha(senha, m?.senha_hash ?? HASH_FALSO)
  if (!m || !ok) return volta(req, `/login?erro=1&email=${encodeURIComponent(email)}`)

  ;(await cookies()).set(COOKIE, criarToken(m.id), opcoesCookie())
  return volta(req, seguro)
}
