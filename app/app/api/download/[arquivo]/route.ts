import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { membroDaSessao } from '@/lib/sessao'
import { produtoPorArquivo } from '@/lib/produtos'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TIPOS: Record<string, string> = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export async function GET(req: Request, ctx: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await ctx.params
  const m = await membroDaSessao()
  if (!m) return Response.redirect(new URL('/login', req.url), 303)
  // Só nomes que estão no catálogo: impede ler qualquer outro arquivo do servidor.
  const produto = produtoPorArquivo(arquivo)
  if (!produto || !m.produtos_liberados.includes(produto.caktoId)) return new Response('Acesso negado', { status: 403 })
  const conteudo = await readFile(join(process.cwd(), 'arquivos', arquivo))
  return new Response(new Uint8Array(conteudo), {
    headers: {
      'Content-Type': TIPOS[arquivo.split('.').pop()!] ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${arquivo}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
