import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { rmSync, readFileSync, existsSync } from 'node:fs'
import { createHmac } from 'node:crypto'

process.env.DB_DRIVER = 'memoria'
process.env.SESSION_SECRET = 'teste-segredo-sessao-longo-o-bastante'
process.env.APP_URL = 'https://app.exemplo'

const { processarEnvelope } = await import('../lib/liberacao')
const { db } = await import('../lib/db')
const { assinaturaValida } = await import('../lib/cakto')
const { criarToken, lerToken } = await import('../lib/sessao')
const { conferirSenha } = await import('../lib/senha')

const PRINCIPAL = '14e886cb-ee23-44ec-a242-ee30d84af96f'
const BUMP1 = '8703c8b6-cef1-4f46-91f9-16db46201eba'
const BUMP2 = 'aba695cf-1ccb-4c7b-b2e1-048e6addd3b3'
const pedido = (id: string, produto: string, email = 'Comprador@Teste.com', extra = {}) => ({
  id, refId: `R${id}`, status: 'paid', offer_type: produto === PRINCIPAL ? 'main' : 'orderbump',
  customer: { email, name: 'Comprador' }, product: { id: produto, name: 'x' }, ...extra,
})
const emails = () => existsSync('dados-locais/emails.log') ? readFileSync('dados-locais/emails.log', 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []
const log = () => {}

before(() => rmSync('dados-locais', { recursive: true, force: true }))

test('compra do principal cria membro, libera só o principal e envia senha', async () => {
  const r = await processarEnvelope({ event: 'purchase_approved', data: pedido('p1', PRINCIPAL) }, log)
  assert.equal(r[0].acao, 'liberado'); assert.equal(r[0].membroCriado, true); assert.equal(r[0].email, 'enviado')
  const m = await db().buscarMembroPorEmail('comprador@teste.com')
  assert.deepEqual(m!.produtos_liberados, [PRINCIPAL])
  const e = emails().at(-1)
  const senha = /Senha: (\S+)/.exec(e.texto)![1]
  assert.equal(senha.length, 10)
  assert.ok(await conferirSenha(senha, m!.senha_hash))
})

test('bumps da mesma compra (V1, entregas separadas) somam ao membro sem trocar a senha nem mandar e-mail', async () => {
  const antes = (await db().buscarMembroPorEmail('comprador@teste.com'))!.senha_hash
  const n = emails().length
  await processarEnvelope({ event: 'purchase_approved', data: pedido('p2', BUMP1) }, log)
  await processarEnvelope({ event: 'purchase_approved', data: pedido('p3', BUMP2) }, log)
  const m = (await db().buscarMembroPorEmail('comprador@teste.com'))!
  assert.deepEqual([...m.produtos_liberados].sort(), [PRINCIPAL, BUMP1, BUMP2].sort())
  assert.equal(m.senha_hash, antes)
  assert.equal(emails().length, n)
})

test('webhook V2 (data em lista) libera principal e bumps de uma vez', async () => {
  const r = await processarEnvelope({ event: 'purchase_approved', data: [pedido('v1', PRINCIPAL, 'v2@teste.com'), pedido('v2', BUMP2, 'v2@teste.com')] }, log)
  assert.deepEqual(r.map((x) => x.acao), ['liberado', 'liberado'])
  const m = (await db().buscarMembroPorEmail('v2@teste.com'))!
  assert.deepEqual([...m.produtos_liberados].sort(), [PRINCIPAL, BUMP2].sort())
})

test('evento repetido é ignorado (idempotente)', async () => {
  const r = await processarEnvelope({ event: 'purchase_approved', data: pedido('p1', PRINCIPAL) }, log)
  assert.equal(r[0].acao, 'duplicado')
})

test('refund revoga só o produto reembolsado', async () => {
  const r = await processarEnvelope({ event: 'refund', data: pedido('p2', BUMP1, 'comprador@teste.com', { status: 'refunded' }) }, log)
  assert.equal(r[0].acao, 'revogado')
  const m = (await db().buscarMembroPorEmail('comprador@teste.com'))!
  assert.deepEqual([...m.produtos_liberados].sort(), [PRINCIPAL, BUMP2].sort())
})

test('chargeback revoga o principal', async () => {
  await processarEnvelope({ event: 'chargeback', data: pedido('p1', PRINCIPAL, 'comprador@teste.com', { status: 'chargedback' }) }, log)
  const m = (await db().buscarMembroPorEmail('comprador@teste.com'))!
  assert.deepEqual(m.produtos_liberados, [BUMP2])
})

test('produto de fora do app e eventos não tratados são ignorados', async () => {
  const r1 = await processarEnvelope({ event: 'purchase_approved', data: pedido('x1', 'cd287b31-d4b7-4e94-858a-96e05ce2f4a2') }, log)
  assert.equal(r1[0].acao, 'ignorado')
  const r2 = await processarEnvelope({ event: 'pix_gerado', data: pedido('x2', PRINCIPAL) }, log)
  assert.equal(r2[0].acao, 'ignorado')
  assert.equal(await db().buscarMembroPorEmail('x@x.com'), null)
})

test('compra aprovada com status diferente de paid não libera', async () => {
  const r = await processarEnvelope({ event: 'purchase_approved', data: pedido('w1', PRINCIPAL, 'w@teste.com', { status: 'waiting_payment' }) }, log)
  assert.equal(r[0].acao, 'ignorado')
})

test('assinatura HMAC da Cakto: aceita a certa, recusa adulterada e antiga', () => {
  const secret = 's3cr3t', corpo = '{"event":"purchase_approved"}', ts = String(Math.floor(Date.now() / 1000))
  const sig = 'v1=' + createHmac('sha256', secret).update(`${ts}.${corpo}`).digest('hex')
  assert.ok(assinaturaValida(corpo, ts, sig, secret))
  assert.ok(!assinaturaValida(corpo + ' ', ts, sig, secret))
  assert.ok(!assinaturaValida(corpo, String(Number(ts) - 3600), sig, secret))
  assert.ok(!assinaturaValida(corpo, ts, null, secret))
})

test('token de sessão: válido, adulterado e expirado', () => {
  const t = criarToken('abc')
  assert.equal(lerToken(t), 'abc')
  const [d, s] = t.split('.')
  const falso = Buffer.from(JSON.stringify({ m: 'outro', exp: 9e9 })).toString('base64url')
  assert.equal(lerToken(`${falso}.${s}`), null)
  assert.equal(lerToken(`${d}.x${s.slice(1)}`), null)
  assert.equal(lerToken(t, Date.now() + 31 * 24 * 3600 * 1000), null)
})
