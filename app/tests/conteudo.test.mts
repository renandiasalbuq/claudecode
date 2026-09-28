import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseDocumento } from '../lib/conteudo'

const WIDGETS = new Set(['calc-despesas', 'calc-numero', 'calc-prazo', 'calc-acompanhamento', 'painel-52', 'versoes-52'])

for (const [slug, esperado] of [['reserva-de-emergencia', 8], ['calculadora', 4], ['52-semanas', 5]] as const) {
  test(`${slug}: ${esperado} capítulos, sem blocos quebrados`, () => {
    const caps = parseDocumento(readFileSync(`conteudo/${slug}.md`, 'utf8'))
    assert.equal(caps.length, esperado)
    const ids = new Set<string>()
    const visitar = (bs: any[]) => bs.forEach((b) => {
      if (b.tipo === 'checklist') { assert.ok(b.itens.length > 0, `checklist ${b.id} vazio`); assert.ok(!ids.has(b.id), `id repetido ${b.id}`); ids.add(b.id) }
      if (b.tipo === 'widget') assert.ok(WIDGETS.has(b.nome), `widget desconhecido ${b.nome}`)
      if (b.tipo === 'template' || b.tipo === 'prompt') assert.ok(b.texto.length > 20)
      if (b.tipo === 'p') assert.ok(!/^(```|:::|\|)/.test(b.texto), `markup vazou: ${b.texto.slice(0, 40)}`)
      if (b.tipo === 'caixa') visitar(b.blocos)
    })
    for (const c of caps) { assert.ok(c.lead, `capítulo sem lead: ${c.titulo}`); visitar(c.blocos) }
  })
}

test('lista numerada com subitens não reinicia a numeração', () => {
  const [c] = parseDocumento('# T\n> l\n1. a\n2. b\n   - x\n   - y\n3. c\n')
  const ol = c.blocos[0] as any
  assert.equal(ol.tipo, 'ol'); assert.equal(ol.itens.length, 3); assert.deepEqual(ol.itens[1].sub, ['x', 'y'])
})
