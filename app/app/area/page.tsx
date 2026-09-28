import { redirect } from 'next/navigation'
import { membroDaSessao } from '@/lib/sessao'
import { PRODUTOS } from '@/lib/produtos'
import { capitulosDe } from '@/lib/conteudo'
import { db } from '@/lib/db'
import { Topo } from '@/components/Topo'

export const dynamic = 'force-dynamic'

export default async function Area() {
  const m = await membroDaSessao()
  if (!m) redirect('/login')

  const cartoes = await Promise.all(PRODUTOS.map(async (p) => {
    const liberado = m.produtos_liberados.includes(p.caktoId)
    const total = capitulosDe(p.slug).length
    const lidos = liberado ? ((await db().lerProgresso(m.id, `${p.slug}:lidos`)) as { caps?: number[] } | null)?.caps?.length ?? 0 : 0
    return { p, liberado, total, lidos }
  }))

  return (
    <>
      <Topo />
      <main className="pagina">
        <p className="kicker">Sua área</p>
        <h1>Olá! Seu plano começa aqui.</h1>
        <p className="suave" style={{ maxWidth: '40rem' }}>Leia um capítulo por vez e faça os templates antes de seguir. O seu progresso fica salvo e aparece em qualquer aparelho.</p>
        <div className="grade-produtos">
          {cartoes.map(({ p, liberado, total, lidos }) => (
            <article key={p.slug} className={`produto ${liberado ? '' : 'bloqueado'}`}>
              <span className="selo">{p.tipo === 'principal' ? 'Guia principal' : 'Complemento'}</span>
              <h2>{p.nome}</h2>
              <p className="suave" style={{ margin: 0 }}>{p.subtitulo}</p>
              {liberado ? (
                <>
                  <div className="barra" aria-label={`${lidos} de ${total} capítulos concluídos`}><i style={{ width: `${(lidos / total) * 100}%` }} /></div>
                  <p className="pequeno suave" style={{ margin: 0 }}>{lidos} de {total} capítulos concluídos</p>
                  <a className="botao" href={`/p/${p.slug}`}>{lidos ? 'Continuar' : 'Começar'}</a>
                </>
              ) : (
                <>
                  <p className="pequeno suave" style={{ margin: 0 }}>Você ainda não tem este conteúdo.</p>
                  <a className="botao secundario" href={p.checkout} target="_blank" rel="noopener noreferrer">Quero liberar</a>
                </>
              )}
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
