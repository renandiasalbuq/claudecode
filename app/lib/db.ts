import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { env, emProducao, envOpcional } from './env'

export type Membro = {
  id: string
  email: string
  senha_hash: string
  produtos_liberados: string[]
  criado_em: string
  senha_reenviada_em: string | null
}

export type EventoWebhook = {
  pedido_id: string
  evento: string
  ref_id: string | null
  email: string | null
  produto_id: string | null
}

export interface Banco {
  buscarMembroPorId(id: string): Promise<Membro | null>
  buscarMembroPorEmail(email: string): Promise<Membro | null>
  liberarProduto(email: string, senhaHash: string, produtoId: string): Promise<{ membroId: string; criado: boolean }>
  revogarProduto(email: string, produtoId: string): Promise<boolean>
  atualizarSenha(id: string, senhaHash: string, marcarReenvio: boolean): Promise<void>
  eventoJaProcessado(pedidoId: string, evento: string): Promise<boolean>
  registrarEvento(e: EventoWebhook): Promise<void>
  buscarEventoAprovado(email: string, refId: string): Promise<boolean>
  lerProgresso(membroId: string, chave: string): Promise<unknown | null>
  salvarProgresso(membroId: string, chave: string, dados: unknown): Promise<void>
}

const normalizar = (email: string) => email.trim().toLowerCase()

// ---------------------------------------------------------------- Supabase
class BancoSupabase implements Banco {
  constructor(private sb: SupabaseClient) {}

  private async um<T>(q: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T | null> {
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return data
  }

  buscarMembroPorId(id: string) {
    return this.um<Membro>(this.sb.from('membros').select('*').eq('id', id).maybeSingle())
  }
  buscarMembroPorEmail(email: string) {
    return this.um<Membro>(this.sb.from('membros').select('*').eq('email', normalizar(email)).maybeSingle())
  }
  async liberarProduto(email: string, senhaHash: string, produtoId: string) {
    const linhas = await this.um<{ membro_id: string; criado: boolean }[]>(
      this.sb.rpc('liberar_produto', { p_email: normalizar(email), p_senha_hash: senhaHash, p_produto: produtoId }),
    )
    if (!linhas?.length) throw new Error('liberar_produto não retornou linha')
    return { membroId: linhas[0].membro_id, criado: linhas[0].criado }
  }
  async revogarProduto(email: string, produtoId: string) {
    const linhas = await this.um<{ membro_id: string }[]>(
      this.sb.rpc('revogar_produto', { p_email: normalizar(email), p_produto: produtoId }),
    )
    return !!linhas?.length
  }
  async atualizarSenha(id: string, senhaHash: string, marcarReenvio: boolean) {
    const patch: Record<string, unknown> = { senha_hash: senhaHash }
    if (marcarReenvio) patch.senha_reenviada_em = new Date().toISOString()
    await this.um(this.sb.from('membros').update(patch).eq('id', id))
  }
  async eventoJaProcessado(pedidoId: string, evento: string) {
    const r = await this.um<{ pedido_id: string }>(
      this.sb.from('webhook_eventos').select('pedido_id').eq('pedido_id', pedidoId).eq('evento', evento).maybeSingle(),
    )
    return !!r
  }
  async registrarEvento(e: EventoWebhook) {
    const { error } = await this.sb.from('webhook_eventos').upsert(e, { onConflict: 'pedido_id,evento', ignoreDuplicates: true })
    if (error) throw new Error(error.message)
  }
  async buscarEventoAprovado(email: string, refId: string) {
    const r = await this.um<{ pedido_id: string }[]>(
      this.sb.from('webhook_eventos').select('pedido_id')
        .eq('evento', 'purchase_approved').eq('email', normalizar(email)).eq('ref_id', refId.trim().toUpperCase()).limit(1),
    )
    return !!r?.length
  }
  async lerProgresso(membroId: string, chave: string) {
    const r = await this.um<{ dados: unknown }>(
      this.sb.from('progresso').select('dados').eq('membro_id', membroId).eq('chave', chave).maybeSingle(),
    )
    return r?.dados ?? null
  }
  async salvarProgresso(membroId: string, chave: string, dados: unknown) {
    const { error } = await this.sb.from('progresso')
      .upsert({ membro_id: membroId, chave, dados, atualizado_em: new Date().toISOString() }, { onConflict: 'membro_id,chave' })
    if (error) throw new Error(error.message)
  }
}

// ---------------------------------------------------------------- Memória (só desenvolvimento/testes)
type Estado = { membros: Membro[]; eventos: (EventoWebhook & { recebido_em: string })[]; progresso: Record<string, unknown> }

class BancoMemoria implements Banco {
  private arquivo = join(process.cwd(), 'dados-locais', 'banco.json')
  private ler(): Estado {
    if (!existsSync(this.arquivo)) return { membros: [], eventos: [], progresso: {} }
    return JSON.parse(readFileSync(this.arquivo, 'utf8'))
  }
  private gravar(e: Estado) {
    mkdirSync(join(process.cwd(), 'dados-locais'), { recursive: true })
    writeFileSync(this.arquivo, JSON.stringify(e, null, 2))
  }
  async buscarMembroPorId(id: string) { return this.ler().membros.find((m) => m.id === id) ?? null }
  async buscarMembroPorEmail(email: string) { return this.ler().membros.find((m) => m.email === normalizar(email)) ?? null }
  async liberarProduto(email: string, senhaHash: string, produtoId: string) {
    const e = this.ler()
    let m = e.membros.find((x) => x.email === normalizar(email))
    const criado = !m
    if (!m) {
      m = { id: randomUUID(), email: normalizar(email), senha_hash: senhaHash, produtos_liberados: [], criado_em: new Date().toISOString(), senha_reenviada_em: null }
      e.membros.push(m)
    }
    if (!m.produtos_liberados.includes(produtoId)) m.produtos_liberados.push(produtoId)
    this.gravar(e)
    return { membroId: m.id, criado }
  }
  async revogarProduto(email: string, produtoId: string) {
    const e = this.ler()
    const m = e.membros.find((x) => x.email === normalizar(email))
    if (!m) return false
    m.produtos_liberados = m.produtos_liberados.filter((p) => p !== produtoId)
    this.gravar(e)
    return true
  }
  async atualizarSenha(id: string, senhaHash: string, marcarReenvio: boolean) {
    const e = this.ler()
    const m = e.membros.find((x) => x.id === id)
    if (m) { m.senha_hash = senhaHash; if (marcarReenvio) m.senha_reenviada_em = new Date().toISOString() }
    this.gravar(e)
  }
  async eventoJaProcessado(pedidoId: string, evento: string) {
    return this.ler().eventos.some((x) => x.pedido_id === pedidoId && x.evento === evento)
  }
  async registrarEvento(ev: EventoWebhook) {
    const e = this.ler()
    if (!e.eventos.some((x) => x.pedido_id === ev.pedido_id && x.evento === ev.evento)) e.eventos.push({ ...ev, recebido_em: new Date().toISOString() })
    this.gravar(e)
  }
  async buscarEventoAprovado(email: string, refId: string) {
    return this.ler().eventos.some((x) => x.evento === 'purchase_approved' && x.email === normalizar(email) && x.ref_id === refId.trim().toUpperCase())
  }
  async lerProgresso(membroId: string, chave: string) { return this.ler().progresso[`${membroId}|${chave}`] ?? null }
  async salvarProgresso(membroId: string, chave: string, dados: unknown) {
    const e = this.ler(); e.progresso[`${membroId}|${chave}`] = dados; this.gravar(e)
  }
}

let instancia: Banco | null = null

export function db(): Banco {
  if (instancia) return instancia
  if (envOpcional('DB_DRIVER') === 'memoria') {
    if (emProducao() && !envOpcional('PERMITIR_BANCO_MEMORIA')) throw new Error('DB_DRIVER=memoria não é permitido em produção')
    instancia = new BancoMemoria()
  } else {
    instancia = new BancoSupabase(
      createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } }),
    )
  }
  return instancia
}
