import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Os arquivos para download ficam fora de /public e só saem pela rota protegida.
  outputFileTracingIncludes: {
    '/api/download/[arquivo]': ['./arquivos/**/*'],
    '/p/[produto]': ['./conteudo/**/*'],
  },
  poweredByHeader: false,
}

export default nextConfig
