import { redirect } from 'next/navigation'
import { membroDaSessao } from '@/lib/sessao'

export const dynamic = 'force-dynamic'

export default async function Inicio() {
  redirect((await membroDaSessao()) ? '/area' : '/login')
}
