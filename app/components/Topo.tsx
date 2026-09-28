import { BarraLeitura } from './BarraLeitura'

export function Topo({ comBarra = false }: { comBarra?: boolean }) {
  return (
    <header className="topo">
      <div className="topo-in">
        <a href="/area" className="marca">Reserva de Emergência <em>do Zero</em></a>
        <nav style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <a href="/conta" className="botao secundario pequeno">Conta</a>
          <form action="/api/logout" method="post"><button className="botao secundario pequeno">Sair</button></form>
        </nav>
      </div>
      {comBarra && <BarraLeitura />}
    </header>
  )
}
