import { db } from './db'
import { produtoPorCaktoId } from './produtos'
import { gerarSenha, hashSenha } from './senha'
import { emailBoasVindas, emailProdutoLiberado, enviarEmail } from './email'
import { pedidosDoEnvelope, type EnvelopeCakto } from './cakto'

export type Resultado = {
  pedido: string
  produto?: string
  acao: 'liberado' | 'revogado' | 'duplicado' | 'ignorado' | 'erro'
  detalhe?: string
  membroCriado?: boolean
  email?: 'enviado' | 'falhou' | 'nao_necessario'
}

const EVENTOS = new Set(['purchase_approved', 'refund', 'chargeback'])
// Principal e bumps da mesma compra chegam em sequência: só o primeiro manda e-mail com senha.
const JANELA_MESMA_COMPRA_MS = 15 * 60 * 1000

export async function processarEnvelope(env: EnvelopeCakto, log: (m: string) => void = console.log): Promise<Resultado[]> {
  const evento = env.event ?? ''
  if (!EVENTOS.has(evento)) return [{ pedido: '-', acao: 'ignorado', detalhe: `evento ${evento || '(vazio)'} não tratado` }]

  const resultados: Resultado[] = []
  for (const p of pedidosDoEnvelope(env)) {
    const produto = p.product?.id ? produtoPorCaktoId(p.product.id) : undefined
    const email = p.customer?.email?.trim().toLowerCase()
    const base = { pedido: p.id ?? '-', produto: produto?.slug }

    if (!p.id) { resultados.push({ ...base, acao: 'erro', detalhe: 'pedido sem id' }); continue }
    if (!produto) { resultados.push({ ...base, acao: 'ignorado', detalhe: `produto ${p.product?.id ?? '?'} não pertence a este app` }); continue }
    if (!email) { resultados.push({ ...base, acao: 'erro', detalhe: 'pedido sem e-mail do comprador' }); continue }
    if (evento === 'purchase_approved' && p.status && p.status !== 'paid') {
      resultados.push({ ...base, acao: 'ignorado', detalhe: `status ${p.status}` }); continue
    }
    if (await db().eventoJaProcessado(p.id, evento)) { resultados.push({ ...base, acao: 'duplicado' }); continue }

    if (evento === 'purchase_approved') {
      const senha = gerarSenha(10)
      const { criado } = await db().liberarProduto(email, await hashSenha(senha), produto.caktoId)
      let envio: Resultado['email'] = 'nao_necessario'
      let msg = null
      if (criado) msg = emailBoasVindas(email, senha)
      else {
        const m = await db().buscarMembroPorEmail(email)
        if (m && Date.now() - new Date(m.criado_em).getTime() > JANELA_MESMA_COMPRA_MS) msg = emailProdutoLiberado(email, produto.nome)
      }
      if (msg) {
        const r = await enviarEmail(msg)
        envio = r.ok ? 'enviado' : 'falhou'
        if (!r.ok) log(`[webhook] e-mail para ${email} falhou: ${r.erro}`)
      }
      await db().registrarEvento({ pedido_id: p.id, evento, ref_id: p.refId?.toUpperCase() ?? null, email, produto_id: produto.caktoId })
      resultados.push({ ...base, acao: 'liberado', membroCriado: criado, email: envio })
    } else {
      const ok = await db().revogarProduto(email, produto.caktoId)
      await db().registrarEvento({ pedido_id: p.id, evento, ref_id: p.refId?.toUpperCase() ?? null, email, produto_id: produto.caktoId })
      resultados.push({ ...base, acao: 'revogado', detalhe: ok ? undefined : 'membro não encontrado' })
    }
  }
  return resultados
}
