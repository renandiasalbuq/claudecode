# Reserva de Emergência do Zero: o que falta para colocar à venda

Situação em 28/09/2026: os 3 produtos e os 2 order bumps estão criados na Cakto, e as ofertas estão ativas.

| Produto | ID do produto | Oferta | Preço |
|---|---|---|---|
| Reserva de Emergência do Zero (principal) | `14e886cb-ee23-44ec-a242-ee30d84af96f` | `fi9x9rz` | R$ 47,00 |
| Calculadora do Seu Número (bump 1) | `8703c8b6-cef1-4f46-91f9-16db46201eba` | `p7v2pcv` | R$ 12,00 |
| 52 Semanas de Depósito Crescente (bump 2) | `aba695cf-1ccb-4c7b-b2e1-048e6addd3b3` | `rbw94ej` | R$ 14,00 |

> Os nomes de menu abaixo são aproximados. Não tenho acesso ao painel da Cakto, então o texto exato dos botões pode mudar.

---

## Passo 1: conta apta a receber (antes de tudo)
- [ ] Complete o cadastro da conta: dados pessoais ou da empresa, documento e verificação de identidade, se a Cakto pedir.
- [ ] Cadastre a conta bancária ou a chave Pix para saque.
- [ ] Veja se aparece algum aviso de "conta em análise" ou "configuração pendente". Resolva antes de divulgar.

## Passo 2: o conteúdo precisa existir (bloqueante)
Hoje **nenhum dos 3 produtos tem conteúdo** e o campo de entrega está vazio. Sem isso, o cliente paga e não recebe nada.
- [ ] Escrever o guia principal (8 capítulos), a Calculadora e a tabela das 52 semanas.
- [ ] Decidir **como entregar**. Opções:
  - **A) Área de membros da Cakto**: sobe o PDF lá. É mais simples.
  - **B) Link externo**: o mini app fica hospedado fora e a Cakto envia o link por e-mail depois da compra.
- [ ] Configurar a entrega **nos 3 produtos**. Os bumps também precisam entregar.

## Passo 3: imagens de capa (prontas, falta subir)
O tamanho recomendado pela Cakto é **300×250 px**. Os arquivos estão em `cakto/imagens/300x250/`, em duas versões com a mesma proporção:
- `-300x250.png`: o tamanho exato recomendado.
- `-600x500@2x.png`: o dobro da resolução, mais nítido em tela de celular e retina. **Teste esta primeiro.** Se o painel recusar ou cortar, use a de 300×250.

| Arquivo | Vai em |
|---|---|
| `01-principal-reserva-de-emergencia-*.png` | produto principal |
| `02-bump-calculadora-do-seu-numero-*.png` | bump 1 |
| `03-bump-52-semanas-*.png` | bump 2 |

Para cada produto:
- [ ] Produtos → abrir o produto → editar → imagem → subir o arquivo → salvar.
- [ ] (Opcional) No produto principal → Order bumps → ativar "Exibir imagem" nos 2 bumps.

As versões quadradas de 1080×1080 em `cakto/imagens/` servem para redes sociais e anúncios.

## Passo 4: pagamento
Os produtos nasceram com Pix, cartão, 3DS, PicPay, Google Pay e Apple Pay ativos.
- [ ] Deixar ligados pelo menos **Pix** e **cartão**. Desligue o que não quiser.
- [ ] Parcelamento: veio em **12x**. Com ticket de R$ 47, algo como até 3x a 6x costuma bastar. A decisão é sua.
- [ ] Juros do parcelamento: decidir se o cliente paga ou se você absorve.
- [ ] Repetir nos 3 produtos, porque cada bump é um produto próprio.

## Passo 5: dados de suporte
- [ ] E-mail de suporte: está `renan@amanciodias.com.br`. Troque se quiser um e-mail só para o produto.
- [ ] WhatsApp de suporte: está vazio. Preencha se quiser atender por lá.

## Passo 6: ajuste de texto pendente
- [ ] O bump 1 diz "só está disponível com este desconto aqui no checkout". A Calculadora também tem página própria a R$ 12 (`p7v2pcv`), então a frase não é verdadeira. Tire a frase no painel (Order bumps → editar bump 1) ou me peça para fazer pela API.

## Passo 7: página de vendas (recomendado)
- [ ] Hoje só existe o checkout. Para tráfego pago, uma página de vendas converte melhor. Quando existir, coloque o link no campo "Página de vendas" do produto.

## Passo 8: obrigações fiscais e legais
- [ ] Nota fiscal: verifique com seu contador como emitir para infoprodutos (MEI, ME ou pessoa física).
- [ ] Garantia: a API devolveu 7 dias nos 3 produtos. Confira no painel.
- [ ] Termos e política de privacidade, se você for ter página de vendas ou captar e-mails.

## Passo 9: teste antes de divulgar
- [ ] Abra o checkout do principal (`pay.cakto.com.br/fi9x9rz`, ou o link que o painel mostrar).
- [ ] Confira: as capas aparecem, a Calculadora está em 1º e o 52 Semanas em 2º, os preços riscados de R$ 29,90 e R$ 34,90 aparecem, e Pix e cartão estão disponíveis.
- [ ] Faça **uma compra real via Pix** com os 2 bumps e confirme que o e-mail de acesso chega com o conteúdo dos 3 produtos. Depois reembolse pelo painel.
