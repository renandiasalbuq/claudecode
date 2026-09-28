import { notFound, redirect } from 'next/navigation'
import { membroDaSessao } from '@/lib/sessao'
import { produtoPorSlug } from '@/lib/produtos'
import { capitulosDe } from '@/lib/conteudo'
import { Topo } from '@/components/Topo'
import { Blocos } from '@/components/Blocos'
import { Concluir, Indice, IndiceMovel } from '@/components/Capitulos'

export const dynamic = 'force-dynamic'

export default async function PaginaProduto({ params, searchParams }: {
  params: Promise<{ produto: string }>
  searchParams: Promise<{ cap?: string }>
}) {
  const { produto: slug } = await params
  const produto = produtoPorSlug(slug)
  if (!produto) notFound()

  // Validação no servidor, sempre: sem sessão vai para o login; sem compra, para a área.
  const m = await membroDaSessao()
  if (!m) redirect(`/login?destino=/p/${slug}`)
  if (!m.produtos_liberados.includes(produto.caktoId)) redirect('/area')

  const capitulos = capitulosDe(slug)
  const n = Math.min(Math.max(Number((await searchParams).cap) || 1, 1), capitulos.length)
  const cap = capitulos[n - 1]
  const anterior = capitulos[n - 2]
  const proximo = capitulos[n]
  const itens = capitulos.map((c) => ({ numero: c.numero, titulo: c.titulo }))

  return (
    <>
      <Topo comBarra />
      <IndiceMovel slug={slug} capitulos={itens} atual={n} />
      <div className="leitor">
        <Indice slug={slug} capitulos={itens} atual={n} />
        <article className="artigo">
          <header className="cabeca-capitulo">
            <p className="kicker">{produto.nome} · Capítulo {n} de {capitulos.length}</p>
            <h1>{cap.titulo}</h1>
            {cap.lead && <p className="lead">{cap.lead}</p>}
          </header>

          <Blocos blocos={cap.blocos} slug={slug} />

          {n === capitulos.length && produto.downloads.length > 0 && (
            <section>
              <h2>Downloads</h2>
              <p className="suave">Versões para imprimir ou usar fora do app.</p>
              <div className="downloads">
                {produto.downloads.map((d) => (
                  <a key={d.arquivo} href={`/api/download/${encodeURIComponent(d.arquivo)}`}>
                    <span>{d.rotulo}</span><span aria-hidden>↓</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <Concluir slug={slug} numero={n} />

          <nav className="navegacao-cap" aria-label="Navegação entre capítulos">
            {anterior ? <a href={`/p/${slug}?cap=${n - 1}`}><small>← Anterior</small><strong>{anterior.titulo}</strong></a> : <span />}
            {proximo ? <a className="dir" href={`/p/${slug}?cap=${n + 1}`}><small>Próximo →</small><strong>{proximo.titulo}</strong></a>
              : <a className="dir" href="/area"><small>Fim</small><strong>Voltar para a área</strong></a>}
          </nav>
        </article>
      </div>
    </>
  )
}
