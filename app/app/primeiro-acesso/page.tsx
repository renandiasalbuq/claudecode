export const dynamic = 'force-dynamic'

export default async function PrimeiroAcesso({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams
  return (
    <main className="tela-centro">
      <div className="cartao">
        <p className="kicker">Primeiro acesso</p>
        <h1 style={{ fontSize: '1.9rem' }}>Receber meu acesso</h1>

        {q.enviado && (
          <div className="aviso ok" role="status">
            Se <b>{q.email}</b> tiver uma compra aprovada, uma nova senha acabou de ser enviada. Confira a caixa de entrada e o spam.
          </div>
        )}
        {q.erro === 'email' && <div className="aviso erro" role="alert">Digite um e-mail válido.</div>}
        {q.erro === 'codigo' && <div className="aviso erro" role="alert">Não encontramos uma compra aprovada com esse e-mail e esse código.</div>}

        {q.falhou ? (
          <>
            <div className="aviso erro" role="alert">Não conseguimos enviar o e-mail agora. Confirme sua compra com o código do pedido para ver a nova senha na tela.</div>
            <form action="/api/primeiro-acesso" method="post">
              <div className="campo"><label htmlFor="email">E-mail da compra</label>
                <input id="email" name="email" type="email" required defaultValue={q.email ?? ''} /></div>
              <div className="campo"><label htmlFor="codigo">Código do pedido</label>
                <input id="codigo" name="codigo" type="text" required autoCapitalize="characters" placeholder="Ex.: 4852F91" /></div>
              <button className="botao" style={{ width: '100%' }}>Ver nova senha</button>
            </form>
            <p className="pequeno suave" style={{ marginTop: '1rem' }}>O código do pedido aparece no comprovante da sua compra na Cakto.</p>
          </>
        ) : (
          <>
            <p className="suave">Digite o e-mail que você usou na compra. Vamos gerar uma nova senha e enviar para ele.</p>
            <form action="/api/primeiro-acesso" method="post">
              <div className="campo"><label htmlFor="email">E-mail da compra</label>
                <input id="email" name="email" type="email" autoComplete="email" required defaultValue={q.email ?? ''} /></div>
              <button className="botao" style={{ width: '100%' }}>Enviar nova senha</button>
            </form>
          </>
        )}
        <p className="pequeno suave" style={{ marginTop: '1.2rem', marginBottom: 0 }}><a href="/login">Voltar para o login</a></p>
      </div>
    </main>
  )
}
