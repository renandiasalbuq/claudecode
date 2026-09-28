import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'

// Sem caracteres ambíguos (0/O, 1/l/I) para quem digita a senha do e-mail no celular.
const ALFABETO = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function gerarSenha(tamanho = 10): string {
  let s = ''
  for (let i = 0; i < tamanho; i++) s += ALFABETO[randomInt(ALFABETO.length)]
  return s
}

export const hashSenha = (senha: string) => bcrypt.hash(senha, 10)
export const conferirSenha = (senha: string, hash: string) => bcrypt.compare(senha, hash)
