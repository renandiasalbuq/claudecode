import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.EMAIL_FROM = '"Reserva de Emergência do Zero <acesso@amanciodias.com.br>"'
process.env.RESEND_API_KEY = 're_teste'
const { lerRemetente, enviarEmail } = await import('../lib/email')

test('lerRemetente aceita os formatos comuns e remove aspas', () => {
  assert.deepEqual(lerRemetente('acesso@amanciodias.com.br'), { nome: '', endereco: 'acesso@amanciodias.com.br' })
  assert.deepEqual(lerRemetente('Reserva <acesso@amanciodias.com.br>'), { nome: 'Reserva', endereco: 'acesso@amanciodias.com.br' })
  assert.deepEqual(lerRemetente('"Reserva de Emergência do Zero <acesso@amanciodias.com.br>"'), { nome: 'Reserva de Emergência do Zero', endereco: 'acesso@amanciodias.com.br' })
  assert.deepEqual(lerRemetente(' "Reserva" <acesso@amanciodias.com.br> '), { nome: 'Reserva', endereco: 'acesso@amanciodias.com.br' })
  assert.equal(lerRemetente('sem-arroba').endereco, '')
})

test('se o Resend recusar o from com nome, reenvia só com o endereço', async () => {
  const enviados: string[] = []
  globalThis.fetch = (async (_u: string, init: { body: string }) => {
    const from = JSON.parse(init.body).from as string
    enviados.push(from)
    return from.includes('<')
      ? new Response('{"statusCode":422,"name":"validation_error","message":"Invalid `from` field."}', { status: 422 })
      : new Response('{"id":"x"}', { status: 200 })
  }) as typeof fetch
  const r = await enviarEmail({ para: 'a@b.com', assunto: 's', html: 'h', texto: 't' })
  assert.equal(r.ok, true)
  assert.equal(r.aviso, 'enviado sem o nome do remetente')
  assert.deepEqual(enviados, ['Reserva de Emergência do Zero <acesso@amanciodias.com.br>', 'acesso@amanciodias.com.br'])
})

test('outros erros do Resend não geram segunda tentativa', async () => {
  let n = 0
  globalThis.fetch = (async () => { n++; return new Response('{"message":"api key invalid"}', { status: 401 }) }) as typeof fetch
  const r = await enviarEmail({ para: 'a@b.com', assunto: 's', html: 'h', texto: 't' })
  assert.equal(r.ok, false); assert.equal(n, 1); assert.match(r.erro!, /401/)
})
