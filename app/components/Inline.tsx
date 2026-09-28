import { Fragment, type ReactNode } from 'react'

// Converte **negrito**, *itálico* e [texto](url) em elementos React, sem HTML cru.
export function Inline({ texto }: { texto: string }) {
  const partes: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g
  let ultimo = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) partes.push(texto.slice(ultimo, m.index))
    if (m[1] !== undefined) partes.push(<strong key={k++}><Inline texto={m[1]} /></strong>)
    else if (m[2] !== undefined) partes.push(<em key={k++}>{m[2]}</em>)
    else partes.push(<a key={k++} href={m[4]} target={m[4].startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{m[3]}</a>)
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return <>{partes.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>
}
