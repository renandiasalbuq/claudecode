// Prova ponta a ponta: webhook → membro → e-mail → login → capítulos → bloqueio.
// Uso: BASE=http://localhost:3000 TOKEN=... SECRET=... [DADOS=dados-locais] [SHOTS=pasta] node tests/e2e.mjs
// Com DADOS apontando para o banco em memória, também confere o "banco" e lê a senha do log de e-mails.
// Em produção (sem DADOS), informe SENHA=... do membro de teste lida no e-mail.
import { createHmac } from 'node:crypto'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PW ?? execSync('npm root -g').toString().trim() + '/playwright')

const BASE = process.env.BASE ?? 'http://localhost:3000'
const TOKEN = process.env.TOKEN
const SECRET = process.env.SECRET
const DADOS = process.env.DADOS
const SHOTS = process.env.SHOTS
const EMAIL = process.env.EMAIL ?? `teste+${Date.now()}@exemplo.com`
const PRINCIPAL = '14e886cb-ee23-44ec-a242-ee30d84af96f'
const BUMP1 = '8703c8b6-cef1-4f46-91f9-16db46201eba'
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

let falhas = 0
const ok = (cond, msg, extra = '') => { console.log(`${cond ? '✅' : '❌'} ${msg}${extra ? ' · ' + extra : ''}`); if (!cond) falhas++ }

function envelope(evento, pedidoId, produto, status = 'paid') {
  return {
    secret: SECRET, event: evento,
    data: {
      id: pedidoId, refId: pedidoId.slice(0, 7).toUpperCase(), status, offer_type: produto === PRINCIPAL ? 'main' : 'orderbump',
      customer: { id: 1, name: 'Membro de Teste', email: EMAIL, phone: '5500000000000', birthDate: null, docType: 'cpf', docNumber: '00000000000' },
      product: { id: produto, short_id: 'x', name: 'Produto', type: 'unique', supportEmail: '', invoiceDescription: '' },
      offer: { id: 'x', image: null, name: 'Oferta', price: 1, currency: 'BRL' },
      paymentMethod: 'pix', createdAt: new Date().toISOString(), paidAt: new Date().toISOString(),
    },
  }
}

async function postWebhook(corpoObj, { token = TOKEN, assinar = true } = {}) {
  const corpo = JSON.stringify(corpoObj)
  const ts = String(Math.floor(Date.now() / 1000))
  const headers = { 'Content-Type': 'application/json', 'User-Agent': 'CaktoBot/1.0' }
  if (assinar && SECRET) {
    headers['X-Cakto-Timestamp'] = ts
    headers['X-Cakto-Signature'] = 'v1=' + createHmac('sha256', SECRET).update(`${ts}.${corpo}`).digest('hex')
  }
  const r = await fetch(`${BASE}/api/webhook/cakto?token=${encodeURIComponent(token ?? '')}`, { method: 'POST', headers, body: corpo })
  return { status: r.status, json: await r.json().catch(() => null) }
}


// A rede deste ambiente de teste passa por um proxy que às vezes derruba a conexão: tenta de novo.
async function ir(pagina, url) {
  for (let t = 1; ; t++) {
    try { return await pagina.goto(url) } catch (e) {
      if (t >= 4 || !/ERR_(TOO_MANY_RETRIES|CONNECTION|NETWORK|TIMED_OUT|EMPTY_RESPONSE)/.test(String(e))) throw e
      await new Promise((r) => setTimeout(r, 1500 * t))
    }
  }
}

// Espera o componente carregar do banco; se a rede do ambiente de teste falhar, recarrega a página.
async function esperarCarregado(pagina, seletor) {
  for (let t = 1; t <= 4; t++) {
    const el = pagina.locator(seletor).first()
    await el.waitFor()
    await pagina.waitForFunction((s) => !/carregando/.test(document.querySelector(s)?.textContent ?? ''), seletor, { timeout: 15000 }).catch(() => {})
    if (/salvo/.test(await el.innerText())) return
    await ir(pagina, pagina.url())
  }
  throw new Error(`não carregou: ${seletor}`)
}

async function entrar(pagina, email, senhaLogin) {
  for (let t = 1; t <= 4; t++) {
    try {
      if (!pagina.url().includes('/login')) await ir(pagina, `${BASE}/login`)
      await pagina.fill('#email', email)
      await pagina.fill('#senha', senhaLogin)
      await Promise.all([pagina.waitForURL('**/area', { timeout: 20000 }), pagina.click('button:has-text("Entrar")')])
      return
    } catch (e) {
      if (t === 4) throw e
      await ir(pagina, `${BASE}/login`)
    }
  }
}

const banco = () => JSON.parse(readFileSync(`${DADOS}/banco.json`, 'utf8'))
const ultimaSenha = () => {
  const linhas = readFileSync(`${DADOS}/emails.log`, 'utf8').trim().split('\n').map((l) => JSON.parse(l)).filter((e) => e.para === EMAIL)
  return /Senha: (\S+)/.exec(linhas.at(-1).texto)[1]
}

console.log(`\n== Prova ponta a ponta em ${BASE} · membro ${EMAIL}\n`)

// 1) Segurança do webhook
let r = await postWebhook(envelope('purchase_approved', 'e2e-sem-token', PRINCIPAL), { token: 'errado' })
ok(r.status === 401, 'Webhook sem o token certo é rejeitado', `HTTP ${r.status}`)
if (SECRET) {
  const falso = envelope('purchase_approved', 'e2e-sem-assinatura', PRINCIPAL); falso.secret = 'falso'
  r = await postWebhook(falso, { assinar: false })
  ok(r.status === 401, 'Webhook com token certo mas sem assinatura/secret válidos é rejeitado', `HTTP ${r.status}`)
}

// 2) Compra: principal + bump 1 (duas entregas, como no webhook V1)
const pid = `e2e-${Date.now()}`
r = await postWebhook(envelope('purchase_approved', `${pid}-main`, PRINCIPAL))
ok(r.status === 200 && r.json?.resultados?.[0]?.acao === 'liberado', 'purchase_approved do principal recebido e aceito', JSON.stringify(r.json?.resultados))
r = await postWebhook(envelope('purchase_approved', `${pid}-bump`, BUMP1))
ok(r.status === 200 && r.json?.resultados?.[0]?.acao === 'liberado', 'purchase_approved do bump 1 recebido e aceito', JSON.stringify(r.json?.resultados))
r = await postWebhook(envelope('purchase_approved', `${pid}-main`, PRINCIPAL))
ok(r.json?.resultados?.[0]?.acao === 'duplicado', 'Reenvio do mesmo evento é ignorado (idempotente)')

let senha = process.env.SENHA
if (!DADOS && !senha) {
  // Produção: sem acesso ao banco nem à caixa de e-mail, a senha vem pelo plano B com o código do pedido.
  const resp = await fetch(`${BASE}/api/primeiro-acesso`, { method: 'POST', body: new URLSearchParams({ email: EMAIL, codigo: `${pid}-main`.slice(0, 7).toUpperCase() }), redirect: 'manual' })
  const html = await resp.text()
  senha = /class="s">([^<]+)</.exec(html)?.[1]?.trim()
  ok(senha?.length === 10, 'Plano B (código do pedido) devolveu uma senha de 10 caracteres')
}
if (DADOS) {
  const m = banco().membros.find((x) => x.email === EMAIL)
  ok(!!m, 'Membro criado no banco', m && `id ${m.id}`)
  ok(m && m.produtos_liberados.length === 2 && m.produtos_liberados.includes(PRINCIPAL) && m.produtos_liberados.includes(BUMP1), 'Liberou exatamente principal + bump 1', m && JSON.stringify(m.produtos_liberados))
  ok(m && m.senha_hash.startsWith('$2'), 'Senha guardada só como hash bcrypt')
  senha = ultimaSenha()
  ok(senha?.length === 10, 'E-mail de boas-vindas gerado com senha de 10 caracteres')
}

// 3) Navegador
const usarProxy = process.env.HTTPS_PROXY && !/localhost|127\.0\.0\.1/.test(BASE)
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium', ...(usarProxy ? { proxy: { server: process.env.HTTPS_PROXY } } : {}) })

// 3a) Anônimo: tudo protegido
const TLS = process.env.IGNORAR_TLS_PROXY ? { ignoreHTTPSErrors: true } : {}
const anon = await browser.newContext({ ...TLS })
const pa = await anon.newPage()
for (const rota of ['/area', '/p/reserva-de-emergencia', '/p/calculadora?cap=2', '/conta']) {
  await ir(pa, BASE + rota)
  ok(new URL(pa.url()).pathname === '/login', `Anônimo em ${rota} é mandado para o login`)
}
const semSessao = await fetch(`${BASE}/api/progresso?chave=reserva-de-emergencia:cap1`)
ok(semSessao.status === 401, 'API de progresso sem sessão responde 401')
const dl = await fetch(`${BASE}/api/download/01-Reserva-de-Emergencia-do-Zero-Guia.pdf`, { redirect: 'manual' })
ok(dl.status === 303, 'Download sem sessão é bloqueado', `HTTP ${dl.status}`)
const cookieForjado = await fetch(`${BASE}/area`, { redirect: 'manual', headers: { Cookie: 'sessao=eyJtIjoieCIsImV4cCI6OTk5OTk5OTk5OX0.assinaturafalsa' } })
ok(cookieForjado.status >= 300 && cookieForjado.status < 400, 'Cookie de sessão forjado não entra', `HTTP ${cookieForjado.status}`)
await anon.close()

// 3b) Membro no celular
const ctx = await browser.newContext({ ...TLS, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
await ir(p, `${BASE}/login`)
await p.fill('#email', EMAIL)
await p.fill('#senha', 'senha-errada-123')
await p.click('button:has-text("Entrar")')
ok(await p.locator('text=E-mail ou senha incorretos').isVisible(), 'Senha errada não entra')
if (senha) {
  await entrar(p, EMAIL, senha)
  ok(new URL(p.url()).pathname === '/area', 'Login com a senha do e-mail entra na área')
  const cookies = await ctx.cookies()
  const c = cookies.find((x) => x.name === 'sessao')
  ok(c?.httpOnly === true, 'Cookie de sessão é httpOnly')
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/01-area-celular.png`, fullPage: true })

  ok(await p.locator('article.produto.bloqueado').count() === 1, 'Produto não comprado (52 Semanas) aparece bloqueado')

  await ir(p, `${BASE}/p/reserva-de-emergencia`)
  ok(await p.locator('h1:has-text("Quanto você precisa mesmo")').isVisible(), 'Capítulo 1 do guia abre')
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/02-capitulo1-celular.png` })
  for (let n = 2; n <= 8; n++) {
    await ir(p, `${BASE}/p/reserva-de-emergencia?cap=${n}`)
    ok(await p.locator('.cabeca-capitulo h1').isVisible(), `Capítulo ${n} abre`, await p.locator('.cabeca-capitulo h1').innerText())
  }

  // checklist salva no banco e volta após recarregar
  await ir(p, `${BASE}/p/reserva-de-emergencia?cap=1`)
  const item = p.locator('.checklist .item-check input').first()
  await esperarCarregado(p, '.checklist .salvo')
  await item.check()
  await p.waitForSelector('.checklist .salvo:has-text("✓ salvo")', { timeout: 5000 })
  await ir(p, p.url())
  await esperarCarregado(p, '.checklist .salvo')
  ok(await p.locator('.checklist .item-check input').first().isChecked(), 'Checklist salva o progresso no banco (continua marcado após recarregar)')

  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'])
  await p.locator('.copiavel button').first().click()
  const copiou = await p.waitForSelector('.copiavel button:has-text("Copiado")', { timeout: 3000 }).then(() => true).catch(() => false)
  const area = await p.evaluate(() => navigator.clipboard?.readText?.().catch(() => '') ?? '')
  ok(copiou && (area === '' || area.includes('CUSTO ESSENCIAL')), 'Botão de copiar template funciona', area ? 'conteúdo conferido na área de transferência' : '')

  // calculadora
  await ir(p, `${BASE}/p/calculadora?cap=1`)
  await p.waitForSelector('#d-moradia')
  await p.fill('#d-moradia', '700'); await p.fill('#d-casa', '200'); await p.fill('#d-comunicacao', '100'); await p.fill('#d-alimentacao', '300'); await p.fill('#d-transporte', '100')
  const custo = await p.locator('.destaque.ouro b').first().innerText()
  ok(custo.replace(/\s/g, ' ').includes('1.400,00'), 'Calculadora soma o custo essencial na hora', custo)
  await p.waitForSelector('.ferramenta .salvo:has-text("✓ salvo")', { timeout: 5000 })
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/03-calculadora-celular.png`, fullPage: true })
  await ir(p, `${BASE}/p/calculadora?cap=3`)
  await p.waitForSelector('#p-prazo')
  const mensal = await p.locator('.destaque.ouro b').first().innerText()
  ok(mensal.replace(/\s/g, ' ').includes('466,67'), 'Seu número e valor mensal calculados a partir do capítulo 1 (R$ 8.400 ÷ 18)', mensal)

  // produto não comprado
  await ir(p, `${BASE}/p/52-semanas`)
  ok(new URL(p.url()).pathname === '/area', 'Produto não comprado redireciona para a área')

  // download do comprado
  const resp = await p.request.get(`${BASE}/api/download/01-Reserva-de-Emergencia-do-Zero-Guia.pdf`)
  ok(resp.status() === 200 && resp.headers()['content-type'] === 'application/pdf', 'Download do PDF do produto comprado funciona')
  const proibido = await p.request.get(`${BASE}/api/download/03-52-Semanas-de-Deposito-Crescente.pdf`)
  ok(proibido.status() === 403, 'Download de produto não comprado é negado', `HTTP ${proibido.status()}`)

  // desktop
  const d = await browser.newContext({ ...TLS, viewport: { width: 1366, height: 900 }, storageState: await ctx.storageState() })
  const pd = await d.newPage()
  await ir(pd, `${BASE}/p/reserva-de-emergencia?cap=3`)
  if (SHOTS) await pd.screenshot({ path: `${SHOTS}/04-capitulo3-desktop.png` })
  await d.close()

  // 4) Reembolso revoga
  r = await postWebhook(envelope('refund', `${pid}-bump`, BUMP1, 'refunded'))
  ok(r.json?.resultados?.[0]?.acao === 'revogado', 'refund recebido e aceito', JSON.stringify(r.json?.resultados))
  await ir(p, `${BASE}/p/calculadora`)
  ok(new URL(p.url()).pathname === '/area', 'Depois do reembolso, a Calculadora deixa de abrir (acesso revogado na hora)')

  // 5) Sair
  await ir(p, `${BASE}/area`)
  await p.click('button:has-text("Sair")')
  await ir(p, `${BASE}/area`)
  ok(new URL(p.url()).pathname === '/login', 'Depois de sair, a área volta a exigir login')

  // 6) Plano B
  if (DADOS) {
    await ir(p, `${BASE}/primeiro-acesso`)
    await p.fill('#email', EMAIL)
    await p.click('button:has-text("Enviar nova senha")')
    ok(await p.locator('text=uma nova senha acabou de ser enviada').isVisible(), '/primeiro-acesso confirma o envio')
    const nova = ultimaSenha()
    ok(nova !== senha, 'Plano B gerou uma senha nova')
    await ir(p, `${BASE}/login`)
    await p.fill('#email', EMAIL); await p.fill('#senha', nova); await p.click('button:has-text("Entrar")')
    await p.waitForURL('**/area')
    ok(new URL(p.url()).pathname === '/area', 'Login com a senha do plano B entra')
    await p.click('button:has-text("Sair")')
    await ir(p, `${BASE}/primeiro-acesso?falhou=1&email=${encodeURIComponent(EMAIL)}`)
    await p.fill('#codigo', `${pid}-main`.slice(0, 7).toUpperCase())
    await p.click('button:has-text("Ver nova senha")')
    const naTela = (await p.locator('.s').innerText()).trim()
    ok(naTela.length === 10, 'Plano B com código do pedido mostra a senha na tela quando o e-mail falha')
    const errado = await fetch(`${BASE}/api/primeiro-acesso`, { method: 'POST', body: new URLSearchParams({ email: EMAIL, codigo: 'ERRADO1' }), redirect: 'manual' })
    ok((errado.headers.get('location') ?? '').includes('erro=codigo'), 'Código do pedido errado não revela senha')
  }
}
await browser.close()
if (!DADOS && senha) console.log(`\nMembro de teste: ${EMAIL} · senha atual: ${senha}`)
console.log(`\n${falhas ? `❌ ${falhas} checagem(ns) falharam` : '✅ Todas as checagens passaram'}\n`)
process.exit(falhas ? 1 : 0)
