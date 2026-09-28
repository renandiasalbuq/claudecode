import { redirect } from 'next/navigation'
import { membroDaSessao } from '@/lib/sessao'
import { Topo } from '@/components/Topo'

export const dynamic = 'force-dynamic'

export default async function Conta({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const m = await membroDaSessao()
  if (!m) redirect('/login?destino=/conta')
  const q = await searchParams
  return (
    <>
      <Topo />
      <main className="pagina" style={{ maxWidth: '32rem' }}>
        <p className="kicker">Sua conta</p>
        <h1 style={{ fontSize: '2rem' }}>Trocar senha</h1>
        <p className="suave">Logado como <b>{m.email}</b></p>
        {q.ok && <div className="aviso ok" role="status">Senha alterada.</div>}
        {q.erro === 'atual' && <div className="aviso erro" role="alert">A senha atual não confere.</div>}
        {q.erro === 'curta' && <div className="aviso erro" role="alert">A nova senha precisa ter pelo menos 8 caracteres.</div>}
        <form action="/api/senha" method="post">
          <div className="campo"><label htmlFor="atual">Senha atual</label><input id="atual" name="atual" type="password" autoComplete="current-password" required /></div>
          <div className="campo"><label htmlFor="nova">Nova senha (mínimo 8 caracteres)</label><input id="nova" name="nova" type="password" autoComplete="new-password" minLength={8} required /></div>
          <button className="botao">Salvar nova senha</button>
        </form>
      </main>
    </>
  )
}
