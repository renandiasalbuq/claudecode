# Produtos: Reserva de Emergência do Zero

## Entregáveis (para subir na área de membros)
| Arquivo | Produto | O que é |
|---|---|---|
| `entregaveis/01-Reserva-de-Emergencia-do-Zero-Guia.pdf` | Principal (R$ 47) | Guia de 31 páginas: 8 capítulos, 8 templates, checklists, plano de 18 meses |
| `entregaveis/02-Calculadora-do-Seu-Numero.xlsx` | Bump 1 (R$ 12) | Planilha com 5 abas: despesas, seu número, acompanhamento de 60 meses, simulador de prazo |
| `entregaveis/02-Calculadora-do-Seu-Numero-Como-Usar.pdf` | Bump 1 (R$ 12) | Manual de uso da planilha (5 páginas) |
| `entregaveis/03-52-Semanas-de-Deposito-Crescente.pdf` | Bump 2 (R$ 14) | Desafio com 4 tabelas prontas (crescente R$1, invertida R$1, crescente R$2, crescente R$5), checklist e ficha de retomada (8 páginas) |

## Como regenerar
Os PDFs saem dos HTMLs em `src/`. A planilha sai de `src/calculadora.py`.

```bash
cd src
PW=$(npm root -g)/playwright node render.cjs      # gera os 3 PDFs
python3 calculadora.py                            # gera a planilha (requer openpyxl)
```
