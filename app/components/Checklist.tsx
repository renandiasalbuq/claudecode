'use client'
import { useProgresso, TextoEstado } from './useProgresso'
import { Inline } from './Inline'

export function Checklist({ chave, titulo, itens }: { chave: string; titulo: string; itens: string[] }) {
  const { dados, atualizar, estado } = useProgresso<{ marcados: number[] }>(chave, { marcados: [] })
  const feitos = dados.marcados.filter((i) => i < itens.length).length
  return (
    <div className="checklist">
      <div className="topo-lista">
        <span className="rotulo">{titulo} · {feitos}/{itens.length}</span>
        <TextoEstado estado={estado} />
      </div>
      {itens.map((item, i) => (
        <label key={i} className="item-check">
          <input
            type="checkbox"
            checked={dados.marcados.includes(i)}
            disabled={estado === 'carregando'}
            onChange={(e) => atualizar((d) => ({ marcados: e.target.checked ? [...new Set([...d.marcados, i])] : d.marcados.filter((x) => x !== i) }))}
          />
          <span><Inline texto={item} /></span>
        </label>
      ))}
    </div>
  )
}
