'use client'
import { useProgresso, TextoEstado } from './useProgresso'

// Estado único da Calculadora, compartilhado pelos 4 capítulos (chave calculadora:dados).
type Dados = {
  despesas: Record<string, number>
  meses: number
  prazo: number
  guardado: number
  depositos: (number | null)[]
}
const INICIAL: Dados = { despesas: {}, meses: 6, prazo: 18, guardado: 0, depositos: [] }
const CHAVE = 'calculadora:dados'

export const CATEGORIAS = [
  ['moradia', 'Moradia (aluguel ou financiamento, condomínio)'],
  ['casa', 'Contas de casa (luz, água, gás)'],
  ['comunicacao', 'Internet e celular (plano básico)'],
  ['alimentacao', 'Alimentação (mercado, sem delivery)'],
  ['transporte', 'Transporte (trabalhar ou procurar trabalho)'],
  ['saude', 'Saúde (plano, remédios de uso contínuo)'],
  ['educacao', 'Educação obrigatória (escola dos filhos)'],
  ['dividas', 'Dívidas que não podem atrasar (parcelas)'],
  ['outros', 'Outros essenciais'],
] as const

const brl = (v: number) => (Number.isFinite(v) ? v : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const num = (s: string) => {
  const v = Number(s.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(v) && v >= 0 ? v : 0
}

function calcular(d: Dados) {
  const custo = Object.values(d.despesas).reduce((a, b) => a + (b || 0), 0)
  const meta = custo * d.meses
  const falta = Math.max(meta - d.guardado, 0)
  const mensal = d.prazo > 0 ? falta / d.prazo : 0
  return { custo, meta, falta, mensal, semanal: (mensal * 12) / 52, diario: (mensal * 12) / 365 }
}

function CampoValor({ id, rotulo, valor, onChange, sufixo }: { id: string; rotulo: string; valor: number; onChange: (v: number) => void; sufixo?: string }) {
  return (
    <div className="linha-campo">
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} type="text" inputMode="decimal" placeholder={sufixo ? '0' : 'R$ 0'}
        defaultValue={valor ? String(valor).replace('.', ',') : ''}
        onChange={(e) => onChange(num(e.target.value))} />
    </div>
  )
}

function Cabeca({ titulo, estado }: { titulo: string; estado: Parameters<typeof TextoEstado>[0]['estado'] }) {
  return <div className="topo-lista" style={{ display: 'flex', justifyContent: 'space-between' }}><div className="rotulo">{titulo}</div><TextoEstado estado={estado} /></div>
}

export function CalcDespesas() {
  const { dados, atualizar, estado } = useProgresso<Dados>(CHAVE, INICIAL)
  const { custo, meta } = calcular(dados)
  if (estado === 'carregando') return <div className="ferramenta"><Cabeca titulo="Suas despesas essenciais" estado={estado} /></div>
  return (
    <div className="ferramenta">
      <Cabeca titulo="Suas despesas essenciais (valores mensais)" estado={estado} />
      {CATEGORIAS.map(([id, rotulo]) => (
        <CampoValor key={id} id={`d-${id}`} rotulo={rotulo} valor={dados.despesas[id] ?? 0}
          onChange={(v) => atualizar((d) => ({ ...d, despesas: { ...d.despesas, [id]: v } }))} />
      ))}
      <div className="destaques">
        <div className="destaque ouro"><small>Custo essencial</small><b>{brl(custo)}</b></div>
        <div className="destaque"><small>Seu número (× {dados.meses})</small><b>{brl(meta)}</b></div>
      </div>
    </div>
  )
}

export function CalcNumero() {
  const { dados, atualizar, estado } = useProgresso<Dados>(CHAVE, INICIAL)
  const { custo, meta, falta } = calcular(dados)
  if (estado === 'carregando') return <div className="ferramenta"><Cabeca titulo="Seu número" estado={estado} /></div>
  const degraus = [
    ['Degrau 1 · R$ 1.000 ou meio mês', Math.min(1000, custo / 2)],
    ['Degrau 2 · 1 mês', custo],
    ['Degrau 3 · 3 meses', custo * 3],
    [`Degrau 4 · ${dados.meses} meses (completa)`, meta],
  ] as const
  return (
    <div className="ferramenta">
      <Cabeca titulo="Seu número" estado={estado} />
      {custo === 0 && <p className="suave pequeno">Preencha suas despesas no <a href="/p/calculadora?cap=1">Capítulo 1</a> para ver os valores.</p>}
      <CampoValor id="n-meses" rotulo="Quantos meses de reserva você quer?" sufixo="meses" valor={dados.meses}
        onChange={(v) => atualizar((d) => ({ ...d, meses: Math.min(24, Math.max(1, Math.round(v) || 1)) }))} />
      <CampoValor id="n-guardado" rotulo="Quanto você já tem guardado hoje?" valor={dados.guardado}
        onChange={(v) => atualizar((d) => ({ ...d, guardado: v }))} />
      <div className="destaques">
        <div className="destaque ouro"><small>Seu número</small><b>{brl(meta)}</b></div>
        <div className="destaque"><small>Falta</small><b>{brl(falta)}</b></div>
        <div className="destaque"><small>Você já tem</small><b>{custo > 0 ? (dados.guardado / custo).toFixed(1).replace('.', ',') : '0'} meses</b></div>
      </div>
      <div className="tabela" style={{ marginBottom: 0 }}>
        <table>
          <thead><tr><th>Degrau</th><th className="num">Meta</th><th className="num">Situação</th></tr></thead>
          <tbody>
            {degraus.map(([r, v]) => (
              <tr key={r}><td>{r}</td><td className="num">{brl(v)}</td><td className="num">{custo > 0 && dados.guardado >= v ? '✓ alcançado' : '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CalcPrazo() {
  const { dados, atualizar, estado } = useProgresso<Dados>(CHAVE, INICIAL)
  const r = calcular(dados)
  if (estado === 'carregando') return <div className="ferramenta"><Cabeca titulo="Simulador de prazo" estado={estado} /></div>
  const prazos = [6, 9, 12, 15, 18, 24, 30, 36]
  return (
    <div className="ferramenta">
      <Cabeca titulo="Simulador de prazo" estado={estado} />
      <CampoValor id="p-prazo" rotulo="Em quantos meses quer chegar lá?" sufixo="meses" valor={dados.prazo}
        onChange={(v) => atualizar((d) => ({ ...d, prazo: Math.min(60, Math.max(1, Math.round(v) || 1)) }))} />
      <div className="destaques">
        <div className="destaque ouro"><small>Guardar por mês</small><b>{brl(r.mensal)}</b></div>
        <div className="destaque"><small>Por semana</small><b>{brl(r.semanal)}</b></div>
        <div className="destaque"><small>Por dia</small><b>{brl(r.diario)}</b></div>
      </div>
      <div className="tabela" style={{ marginBottom: 0 }}>
        <table>
          <thead><tr><th>Prazo</th><th className="num">Por mês</th><th className="num">Por semana</th></tr></thead>
          <tbody>
            {prazos.map((p) => (
              <tr key={p} style={p === dados.prazo ? { background: '#3a3220' } : undefined}>
                <td>{p} meses{p === dados.prazo ? ' ← seu prazo' : ''}</td>
                <td className="num">{brl(r.falta / p)}</td>
                <td className="num">{brl((r.falta / p) * 12 / 52)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CalcAcompanhamento() {
  const { dados, atualizar, estado } = useProgresso<Dados>(CHAVE, INICIAL)
  const r = calcular(dados)
  if (estado === 'carregando') return <div className="ferramenta"><Cabeca titulo="Acompanhamento" estado={estado} /></div>
  const meses = Array.from({ length: dados.prazo }, (_, i) => i + 1)
  let acumulado = dados.guardado
  const linhas = meses.map((m) => {
    const dep = dados.depositos[m - 1]
    if (dep != null) acumulado += dep
    const metaAqui = dados.guardado + r.mensal * m
    return { m, dep, total: acumulado, metaAqui, preenchido: dep != null }
  })
  const totalAtual = acumulado
  const pct = r.meta > 0 ? Math.min(100, (totalAtual / r.meta) * 100) : 0
  return (
    <div className="ferramenta">
      <Cabeca titulo="Acompanhamento mês a mês" estado={estado} />
      <div className="destaques">
        <div className="destaque ouro"><small>Total guardado</small><b>{brl(totalAtual)}</b></div>
        <div className="destaque"><small>Falta</small><b>{brl(Math.max(r.meta - totalAtual, 0))}</b></div>
        <div className="destaque"><small>Da meta</small><b>{pct.toFixed(0)}%</b></div>
      </div>
      <div className="progresso-barra"><i style={{ width: `${pct}%` }} /></div>
      <div className="tabela">
        <table>
          <thead><tr><th>Mês</th><th className="num">Depositei</th><th className="num">Total</th><th className="num">Meta até aqui</th><th>Situação</th></tr></thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.m}>
                <td>{l.m}</td>
                <td className="num" style={{ minWidth: '7.5rem' }}>
                  <input aria-label={`Depósito do mês ${l.m}`} type="text" inputMode="decimal" placeholder="—"
                    style={{ minHeight: 38, padding: '.4rem .5rem', textAlign: 'right' }}
                    defaultValue={l.dep != null ? String(l.dep).replace('.', ',') : ''}
                    onChange={(e) => {
                      const txt = e.target.value.trim()
                      const v = txt === '' ? null : Number(txt.replace(/\./g, '').replace(',', '.'))
                      atualizar((d) => {
                        const depositos = [...d.depositos]
                        depositos[l.m - 1] = v == null || !Number.isFinite(v) ? null : v
                        return { ...d, depositos }
                      })
                    }} />
                </td>
                <td className="num">{l.preenchido ? brl(l.total) : '—'}</td>
                <td className="num">{brl(l.metaAqui)}</td>
                <td>{!l.preenchido ? '' : l.total >= r.meta && r.meta > 0 ? '🎉 Completa' : l.total >= l.metaAqui - 0.005 ? 'No ritmo' : 'Abaixo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="suave pequeno" style={{ margin: 0 }}>Precisou sacar? Digite o valor com sinal de menos, por exemplo <b>-300</b>.</p>
    </div>
  )
}
