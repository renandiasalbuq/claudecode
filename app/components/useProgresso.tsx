'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export type EstadoSalvar = 'carregando' | 'salvo' | 'salvando' | 'erro'

// Lê e grava um registro de progresso no banco (via /api/progresso), com gravação
// agrupada para não mandar uma requisição a cada tecla.
export function useProgresso<T>(chave: string, inicial: T) {
  const [dados, setDados] = useState<T>(inicial)
  const [estado, setEstado] = useState<EstadoSalvar>('carregando')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const carregado = useRef(false)

  useEffect(() => {
    let vivo = true
    fetch(`/api/progresso?chave=${encodeURIComponent(chave)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => { if (vivo) { if (j.dados) setDados({ ...inicial, ...j.dados }); setEstado('salvo'); carregado.current = true } })
      .catch(() => { if (vivo) { setEstado('erro'); carregado.current = true } })
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave])

  const gravar = useCallback((novo: T) => {
    if (timer.current) clearTimeout(timer.current)
    setEstado('salvando')
    timer.current = setTimeout(() => {
      fetch('/api/progresso', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chave, dados: novo }) })
        .then((r) => setEstado(r.ok ? 'salvo' : 'erro'))
        .catch(() => setEstado('erro'))
    }, 600)
  }, [chave])

  const atualizar = useCallback((f: (atual: T) => T) => {
    setDados((atual) => { const novo = f(atual); if (carregado.current) gravar(novo); return novo })
  }, [gravar])

  return { dados, atualizar, estado }
}

export function TextoEstado({ estado }: { estado: EstadoSalvar }) {
  const t = { carregando: 'carregando…', salvando: 'salvando…', salvo: '✓ salvo', erro: 'não foi possível salvar' }[estado]
  return <span className="salvo" aria-live="polite">{t}</span>
}
