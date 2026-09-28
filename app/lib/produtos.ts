// Catálogo dos produtos: slug da URL ↔ ID do produto na Cakto.
export type Produto = {
  slug: string
  caktoId: string
  nome: string
  subtitulo: string
  checkout: string
  tipo: 'principal' | 'bump'
  downloads: { arquivo: string; rotulo: string }[]
}

export const PRODUTOS: Produto[] = [
  {
    slug: 'reserva-de-emergencia',
    caktoId: '14e886cb-ee23-44ec-a242-ee30d84af96f',
    nome: 'Reserva de Emergência do Zero',
    subtitulo: 'Junte 6 meses de despesa em 18 meses, mesmo ganhando pouco',
    checkout: 'https://pay.cakto.com.br/fi9x9rz',
    tipo: 'principal',
    downloads: [{ arquivo: '01-Reserva-de-Emergencia-do-Zero-Guia.pdf', rotulo: 'Guia completo em PDF' }],
  },
  {
    slug: 'calculadora',
    caktoId: '8703c8b6-cef1-4f46-91f9-16db46201eba',
    nome: 'Calculadora do Seu Número',
    subtitulo: 'Quanto é a sua reserva e quanto guardar por mês',
    checkout: 'https://pay.cakto.com.br/p7v2pcv',
    tipo: 'bump',
    downloads: [
      { arquivo: '02-Calculadora-do-Seu-Numero.xlsx', rotulo: 'Planilha (Excel / Google Planilhas)' },
      { arquivo: '02-Calculadora-do-Seu-Numero-Como-Usar.pdf', rotulo: 'Como usar a planilha (PDF)' },
    ],
  },
  {
    slug: '52-semanas',
    caktoId: 'aba695cf-1ccb-4c7b-b2e1-048e6addd3b3',
    nome: '52 Semanas de Depósito Crescente',
    subtitulo: 'Um depósito por semana, começando pequeno',
    checkout: 'https://pay.cakto.com.br/rbw94ej',
    tipo: 'bump',
    downloads: [{ arquivo: '03-52-Semanas-de-Deposito-Crescente.pdf', rotulo: 'Tabelas para imprimir (PDF)' }],
  },
]

export const produtoPorSlug = (slug: string) => PRODUTOS.find((p) => p.slug === slug)
export const produtoPorCaktoId = (id: string) => PRODUTOS.find((p) => p.caktoId === id)
export const produtoPorArquivo = (arquivo: string) =>
  PRODUTOS.find((p) => p.downloads.some((d) => d.arquivo === arquivo))
