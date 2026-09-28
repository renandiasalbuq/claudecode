import { cookies } from 'next/headers'
import { COOKIE } from '@/lib/sessao'

export async function POST(req: Request) {
  ;(await cookies()).delete(COOKIE)
  return Response.redirect(new URL('/login', req.url), 303)
}
