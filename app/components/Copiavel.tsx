'use client'
import { useState } from 'react'

export function Copiavel({ tipo, titulo, texto }: { tipo: 'template' | 'prompt'; titulo: string; texto: string }) {
  const [copiado, setCopiado] = useState(false)
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Navegadores sem Clipboard API: seleção manual como alternativa.
      const ta = document.createElement('textarea')
      ta.value = texto
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }
  return (
    <div className={`copiavel ${tipo}`}>
      <div className="cab">
        <p className="rotulo">{tipo === 'prompt' ? 'Prompt · ' : 'Template · '}{titulo}</p>
        <button type="button" className="botao pequeno" onClick={copiar} aria-live="polite">{copiado ? '✓ Copiado' : 'Copiar'}</button>
      </div>
      <pre>{texto}</pre>
    </div>
  )
}
