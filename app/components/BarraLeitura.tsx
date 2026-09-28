'use client'
import { useEffect, useState } from 'react'

export function BarraLeitura() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const calc = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setP(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 100)
    }
    calc()
    window.addEventListener('scroll', calc, { passive: true })
    window.addEventListener('resize', calc)
    return () => { window.removeEventListener('scroll', calc); window.removeEventListener('resize', calc) }
  }, [])
  return <div className="barra-leitura" style={{ width: `${p}%` }} role="progressbar" aria-label="Progresso de leitura do capítulo" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100} />
}
