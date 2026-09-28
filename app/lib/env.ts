// Leitura centralizada das variáveis de ambiente. Segredos nunca ficam no código.
export function env(nome: string): string {
  const v = process.env[nome]
  if (!v) throw new Error(`Variável de ambiente ausente: ${nome}`)
  return v
}

export function envOpcional(nome: string): string | undefined {
  return process.env[nome] || undefined
}

export const emProducao = () => process.env.NODE_ENV === 'production'

export function appUrl(): string {
  return (envOpcional('APP_URL') ?? 'http://localhost:3000').replace(/\/+$/, '')
}
