'use client'
import { useRouter } from 'next/navigation'
import { useProgresso } from './useProgresso'

type Item = { numero: number; titulo: string }

// Índice lateral (desktop) e seletor (celular), com marca de capítulo concluído.
export function Indice({ slug, capitulos, atual }: { slug: string; capitulos: Item[]; atual: number }) {
  const { dados } = useProgresso<{ caps: number[] }>(`${slug}:lidos`, { caps: [] })
  return (
    <nav className="indice" aria-label="Capítulos">
      <span className="kicker">Capítulos</span>
      <ol>
        {capitulos.map((c) => (
          <li key={c.numero} className={dados.caps.includes(c.numero) ? 'feito' : ''}>
            <a href={`/p/${slug}?cap=${c.numero}`} aria-current={c.numero === atual ? 'page' : undefined}>
              <span className="n">{c.numero}</span><span>{c.titulo}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function IndiceMovel({ slug, capitulos, atual }: { slug: string; capitulos: Item[]; atual: number }) {
  const router = useRouter()
  return (
    <div className="indice-movel">
      <label className="kicker" htmlFor="cap-movel">Capítulo</label>
      <select id="cap-movel" value={atual} onChange={(e) => router.push(`/p/${slug}?cap=${e.target.value}`)}>
        {capitulos.map((c) => <option key={c.numero} value={c.numero}>{c.numero}. {c.titulo}</option>)}
      </select>
    </div>
  )
}

export function Concluir({ slug, numero }: { slug: string; numero: number }) {
  const { dados, atualizar, estado } = useProgresso<{ caps: number[] }>(`${slug}:lidos`, { caps: [] })
  const feito = dados.caps.includes(numero)
  return (
    <div className="concluir">
      <button
        type="button"
        className={`botao ${feito ? 'secundario' : ''}`}
        disabled={estado === 'carregando'}
        onClick={() => atualizar((d) => ({ caps: feito ? d.caps.filter((c) => c !== numero) : [...new Set([...d.caps, numero])] }))}
      >
        {feito ? '✓ Capítulo concluído' : 'Marcar capítulo como concluído'}
      </button>
    </div>
  )
}
