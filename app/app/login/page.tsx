import { redirect } from 'next/navigation'
import { membroDaSessao } from '@/lib/sessao'

export const dynamic = 'force-dynamic'

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams
  if (await membroDaSessao()) redirect(q.destino?.startsWith('/') && !q.destino.startsWith('//') ? q.destino : '/area')
  return (
    <main className="tela-centro">
      <div className="cartao">
        <p className="kicker">Área de membros</p>
        <h1 style={{ fontSize: '2rem' }}>Reserva de Emergência <em>do Zero</em></h1>
        <p className="suave">Entre com o e-mail da compra e a senha que chegou no seu e-mail.</p>
        {q.erro && <div className="aviso erro" role="alert">E-mail ou senha incorretos.</div>}
        <form action="/api/login" method="post">
          <input type="hidden" name="destino" value={q.destino ?? '/area'} />
          <div className="campo"><label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required defaultValue={q.email ?? ''} /></div>
          <div className="campo"><label htmlFor="senha">Senha</label>
            <input id="senha" name="senha" type="password" autoComplete="current-password" required /></div>
          <button className="botao" style={{ width: '100%' }}>Entrar</button>
        </form>
        <p className="pequeno suave" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
          Não recebeu a senha ou esqueceu? <a href="/primeiro-acesso">Gerar novo acesso</a>
        </p>
      </div>
    </main>
  )
}
