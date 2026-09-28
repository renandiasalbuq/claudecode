'use client'
import { useProgresso, TextoEstado } from './useProgresso'

export const VERSOES = {
  c1: { nome: 'Crescente R$ 1', valor: (s: number) => s },
  i1: { nome: 'Invertida R$ 1', valor: (s: number) => 53 - s },
  c2: { nome: 'Crescente R$ 2', valor: (s: number) => 2 * s },
  c5: { nome: 'Crescente R$ 5', valor: (s: number) => 5 * s },
} as const
type Versao = keyof typeof VERSOES

type Dados = { versao: Versao; feitas: number[] }
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function Painel52() {
  const { dados, atualizar, estado } = useProgresso<Dados>('52-semanas:painel', { versao: 'c1', feitas: [] })
  const v = VERSOES[dados.versao] ?? VERSOES.c1
  const semanas = Array.from({ length: 52 }, (_, i) => i + 1)
  const total = semanas.reduce((a, s) => a + v.valor(s), 0)
  const guardado = dados.feitas.reduce((a, s) => a + v.valor(s), 0)
  const proxima = semanas.find((s) => !dados.feitas.includes(s))
  const pct = (guardado / total) * 100

  return (
    <div className="ferramenta">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div className="rotulo">Painel das 52 semanas</div>
        <TextoEstado estado={estado} />
      </div>
      <div className="abas" role="group" aria-label="Versão do desafio">
        {(Object.keys(VERSOES) as Versao[]).map((k) => (
          <button key={k} type="button" aria-pressed={dados.versao === k} disabled={estado === 'carregando'}
            onClick={() => atualizar((d) => ({ ...d, versao: k }))}>{VERSOES[k].nome}</button>
        ))}
      </div>
      <div className="destaques">
        <div className="destaque ouro"><small>Já guardado</small><b>{brl(guardado)}</b></div>
        <div className="destaque"><small>Semanas feitas</small><b>{dados.feitas.length}/52</b></div>
        <div className="destaque"><small>Próximo depósito</small><b>{proxima ? `${brl(v.valor(proxima))}` : '—'}</b></div>
        <div className="destaque"><small>Total no fim</small><b>{brl(total)}</b></div>
      </div>
      <div className="progresso-barra"><i style={{ width: `${pct}%` }} /></div>
      <p className="suave pequeno" style={{ margin: '0 0 .2rem' }}>Toque na semana depois de depositar. Toque de novo para desmarcar.</p>
      <div className="semanas">
        {semanas.map((s) => {
          const feita = dados.feitas.includes(s)
          return (
            <button key={s} type="button" className={`semana ${feita ? 'feita' : ''}`} aria-pressed={feita}
              aria-label={`Semana ${s}: ${brl(v.valor(s))}${feita ? ', depositado' : ''}`} disabled={estado === 'carregando'}
              onClick={() => atualizar((d) => ({ ...d, feitas: feita ? d.feitas.filter((x) => x !== s) : [...d.feitas, s].sort((a, b) => a - b) }))}>
              <small>sem. {s}</small><b>{feita ? '✓ ' : ''}{brl(v.valor(s))}</b>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Tabela estática de comparação das versões (capítulo 1 do bump).
export function Versoes52() {
  const soma = (f: (s: number) => number) => Array.from({ length: 52 }, (_, i) => f(i + 1)).reduce((a, b) => a + b, 0)
  return (
    <div className="tabela">
      <table>
        <thead><tr><th>Versão</th><th className="num">Semana 1</th><th className="num">Semana 52</th><th className="num">Total</th></tr></thead>
        <tbody>
          {(Object.keys(VERSOES) as Versao[]).map((k) => (
            <tr key={k}><td>{VERSOES[k].nome}</td><td className="num">{brl(VERSOES[k].valor(1))}</td><td className="num">{brl(VERSOES[k].valor(52))}</td><td className="num"><b>{brl(soma(VERSOES[k].valor))}</b></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
