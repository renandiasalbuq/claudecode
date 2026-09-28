import type { Bloco } from '@/lib/conteudo'
import { Inline } from './Inline'
import { Copiavel } from './Copiavel'
import { Checklist } from './Checklist'
import { CalcAcompanhamento, CalcDespesas, CalcNumero, CalcPrazo } from './Calculadora'
import { Painel52, Versoes52 } from './Semanas'

const WIDGETS: Record<string, () => React.ReactNode> = {
  'calc-despesas': () => <CalcDespesas />,
  'calc-numero': () => <CalcNumero />,
  'calc-prazo': () => <CalcPrazo />,
  'calc-acompanhamento': () => <CalcAcompanhamento />,
  'painel-52': () => <Painel52 />,
  'versoes-52': () => <Versoes52 />,
}

function Item({ item }: { item: { texto: string; sub: string[] } }) {
  return (
    <li>
      <Inline texto={item.texto} />
      {item.sub.length > 0 && <ul style={{ marginTop: '.4rem' }}>{item.sub.map((s, k) => <li key={k}><Inline texto={s} /></li>)}</ul>}
    </li>
  )
}

const ROTULO_CAIXA = { ideia: 'Ideia-chave', alerta: 'Atenção', exemplo: 'Exemplo', resumo: 'Resumo' }

export function Blocos({ blocos, slug }: { blocos: Bloco[]; slug: string }) {
  return (
    <>
      {blocos.map((b, i) => {
        switch (b.tipo) {
          case 'p': return <p key={i}><Inline texto={b.texto} /></p>
          case 'h2': return <h2 key={i}><Inline texto={b.texto} /></h2>
          case 'h3': return <h3 key={i}><Inline texto={b.texto} /></h3>
          case 'ul': return <ul key={i}>{b.itens.map((t, j) => <Item key={j} item={t} />)}</ul>
          case 'ol': return <ol key={i}>{b.itens.map((t, j) => <Item key={j} item={t} />)}</ol>
          case 'tabela':
            return (
              <div key={i} className="tabela">
                <table>
                  <thead><tr>{b.cabecalho.map((c, j) => <th key={j}><Inline texto={c} /></th>)}</tr></thead>
                  <tbody>{b.linhas.map((l, j) => <tr key={j}>{l.map((c, k) => <td key={k}><Inline texto={c} /></td>)}</tr>)}</tbody>
                </table>
              </div>
            )
          case 'template':
          case 'prompt':
            return <Copiavel key={i} tipo={b.tipo} titulo={b.titulo} texto={b.texto} />
          case 'checklist':
            return <Checklist key={i} chave={`${slug}:${b.id}`} titulo={b.titulo} itens={b.itens} />
          case 'widget': {
            const W = WIDGETS[b.nome]
            return W ? <div key={i}>{W()}</div> : null
          }
          case 'formula':
            return <div key={i} className="formula"><Inline texto={b.texto} /></div>
          case 'caixa':
            return (
              <div key={i} className={b.estilo === 'resumo' ? 'resumo' : `bloco ${b.estilo}`}>
                <div className="rotulo">{b.titulo || ROTULO_CAIXA[b.estilo]}</div>
                <Blocos blocos={b.blocos} slug={slug} />
              </div>
            )
        }
      })}
    </>
  )
}
