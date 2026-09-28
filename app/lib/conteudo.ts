import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Formato dos arquivos em /conteudo/<slug>.md
//
//   # Título do capítulo            ← abre um capítulo
//   > Frase de abertura (lead)
//   ## / ###                        ← subtítulos
//   - item / 1. item                ← listas
//   | a | b |                       ← tabelas (1ª linha = cabeçalho, 2ª = separador)
//   ```template Título  ... ```     ← bloco com botão de copiar
//   ```prompt Título    ... ```     ← prompt de IA com botão de copiar
//   ```checklist id Título          ← checklist interativo (uma linha "- item" por item)
//   ```widget nome                  ← ferramenta interativa
//   :::ideia|alerta|exemplo|resumo Título  ... :::
//   :::formula Texto com **destaque**
//
// Inline: **negrito**, *itálico*, [texto](url)

export type Bloco =
  | { tipo: 'p'; texto: string }
  | { tipo: 'h2' | 'h3'; texto: string }
  | { tipo: 'ul' | 'ol'; itens: { texto: string; sub: string[] }[] }
  | { tipo: 'tabela'; cabecalho: string[]; linhas: string[][] }
  | { tipo: 'template' | 'prompt'; titulo: string; texto: string }
  | { tipo: 'checklist'; id: string; titulo: string; itens: string[] }
  | { tipo: 'widget'; nome: string }
  | { tipo: 'caixa'; estilo: 'ideia' | 'alerta' | 'exemplo' | 'resumo'; titulo: string; blocos: Bloco[] }
  | { tipo: 'formula'; texto: string }

export type Capitulo = { numero: number; titulo: string; lead: string; blocos: Bloco[] }

const celulas = (linha: string) => linha.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())

export function parseBlocos(linhas: string[]): Bloco[] {
  const blocos: Bloco[] = []
  let i = 0
  const paragrafo: string[] = []
  const fecharParagrafo = () => {
    if (paragrafo.length) blocos.push({ tipo: 'p', texto: paragrafo.join(' ') })
    paragrafo.length = 0
  }

  while (i < linhas.length) {
    const l = linhas[i]
    const t = l.trim()

    if (!t) { fecharParagrafo(); i++; continue }

    if (t.startsWith('```')) {
      fecharParagrafo()
      const [tipo, ...resto] = t.slice(3).trim().split(/\s+/)
      const corpo: string[] = []
      i++
      while (i < linhas.length && !linhas[i].trim().startsWith('```')) corpo.push(linhas[i++])
      i++
      if (tipo === 'template' || tipo === 'prompt') blocos.push({ tipo, titulo: resto.join(' '), texto: corpo.join('\n').replace(/\s+$/, '') })
      else if (tipo === 'checklist') {
        const [id, ...titulo] = resto
        blocos.push({ tipo: 'checklist', id, titulo: titulo.join(' ') || 'Checklist', itens: corpo.map((c) => c.trim()).filter((c) => c.startsWith('- ')).map((c) => c.slice(2)) })
      } else if (tipo === 'widget') blocos.push({ tipo: 'widget', nome: resto[0] })
      else throw new Error(`Bloco desconhecido: ${tipo}`)
      continue
    }

    if (t.startsWith(':::formula')) { fecharParagrafo(); blocos.push({ tipo: 'formula', texto: t.slice(10).trim() }); i++; continue }

    if (t.startsWith(':::')) {
      fecharParagrafo()
      const [estilo, ...titulo] = t.slice(3).trim().split(/\s+/)
      const corpo: string[] = []
      i++
      while (i < linhas.length && linhas[i].trim() !== ':::') corpo.push(linhas[i++])
      i++
      blocos.push({ tipo: 'caixa', estilo: estilo as 'ideia', titulo: titulo.join(' '), blocos: parseBlocos(corpo) })
      continue
    }

    if (t.startsWith('### ')) { fecharParagrafo(); blocos.push({ tipo: 'h3', texto: t.slice(4) }); i++; continue }
    if (t.startsWith('## ')) { fecharParagrafo(); blocos.push({ tipo: 'h2', texto: t.slice(3) }); i++; continue }

    if (/^- /.test(t) || /^\d+\. /.test(t)) {
      fecharParagrafo()
      const ordenada = /^\d+\. /.test(t)
      const itens: { texto: string; sub: string[] }[] = []
      while (i < linhas.length) {
        const atual = linhas[i]
        const topo = ordenada ? /^\d+\. /.test(atual) : /^- /.test(atual)
        if (topo) { itens.push({ texto: atual.trim().replace(/^(- |\d+\. )/, ''), sub: [] }); i++; continue }
        // subitem indentado "   - texto"
        if (itens.length && /^\s{2,}- /.test(atual)) { itens[itens.length - 1].sub.push(atual.trim().slice(2)); i++; continue }
        // continuação indentada de texto
        if (itens.length && /^\s{2,}\S/.test(atual)) {
          const it = itens[itens.length - 1]
          if (it.sub.length) it.sub[it.sub.length - 1] += ' ' + atual.trim()
          else it.texto += ' ' + atual.trim()
          i++; continue
        }
        break
      }
      blocos.push({ tipo: ordenada ? 'ol' : 'ul', itens })
      continue
    }

    if (t.startsWith('|')) {
      fecharParagrafo()
      const cabecalho = celulas(t)
      i += 2 // pula o separador
      const tlinhas: string[][] = []
      while (i < linhas.length && linhas[i].trim().startsWith('|')) tlinhas.push(celulas(linhas[i++]))
      blocos.push({ tipo: 'tabela', cabecalho, linhas: tlinhas })
      continue
    }

    paragrafo.push(t)
    i++
  }
  fecharParagrafo()
  return blocos
}

export function parseDocumento(texto: string): Capitulo[] {
  const capitulos: Capitulo[] = []
  let atual: { titulo: string; linhas: string[] } | null = null
  const fechar = () => {
    if (!atual) return
    let lead = ''
    const linhas = [...atual.linhas]
    const idx = linhas.findIndex((l) => l.trim())
    if (idx >= 0 && linhas[idx].trim().startsWith('> ')) { lead = linhas[idx].trim().slice(2); linhas.splice(idx, 1) }
    capitulos.push({ numero: capitulos.length + 1, titulo: atual.titulo, lead, blocos: parseBlocos(linhas) })
  }
  let emCodigo = false
  for (const l of texto.split('\n')) {
    if (l.trim().startsWith('```')) emCodigo = !emCodigo
    if (!emCodigo && l.startsWith('# ')) { fechar(); atual = { titulo: l.slice(2).trim(), linhas: [] } }
    else atual?.linhas.push(l)
  }
  fechar()
  return capitulos
}

const cache = new Map<string, Capitulo[]>()

export function capitulosDe(slug: string): Capitulo[] {
  if (!cache.has(slug) || process.env.NODE_ENV !== 'production') {
    cache.set(slug, parseDocumento(readFileSync(join(process.cwd(), 'conteudo', `${slug}.md`), 'utf8')))
  }
  return cache.get(slug)!
}
