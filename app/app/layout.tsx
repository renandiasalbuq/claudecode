import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const inter = localFont({ src: './fonts/inter.woff2', weight: '100 900', variable: '--fonte-texto', display: 'swap' })
const playfair = localFont({
  src: [
    { path: './fonts/playfair.woff2', style: 'normal' },
    { path: './fonts/playfair-italico.woff2', style: 'italic' },
  ],
  weight: '400 900',
  variable: '--fonte-titulo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Reserva de Emergência do Zero',
  description: 'Área de membros',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: '#0b1512', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
