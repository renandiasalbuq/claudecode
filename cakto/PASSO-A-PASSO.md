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

## Passo 2: subir o conteúdo na área de membros da Cakto (bloqueante)
O conteúdo está pronto em `cakto/produtos/entregaveis/`. Sem subir, o cliente paga e não recebe nada.

| Produto na Cakto | Arquivo(s) para subir |
|---|---|
| **Reserva de Emergência do Zero** (principal) | `01-Reserva-de-Emergencia-do-Zero-Guia.pdf` (31 páginas) |
| **Calculadora do Seu Número** (bump 1) | `02-Calculadora-do-Seu-Numero.xlsx` + `02-Calculadora-do-Seu-Numero-Como-Usar.pdf` |
| **52 Semanas de Depósito Crescente** (bump 2) | `03-52-Semanas-de-Deposito-Crescente.pdf` |

Para **cada um dos 3 produtos** (cada bump é um produto próprio e precisa da própria entrega):
- [ ] Abra o produto → procure a seção de entrega de conteúdo ou área de membros → escolha **Área de membros da Cakto**.
- [ ] Crie o curso/área com o nome do produto e um módulo único (ex.: "Material").
- [ ] Crie uma aula/conteúdo por arquivo, com um título claro ("Guia completo em PDF", "Planilha da Calculadora", "Como usar a Calculadora"), e anexe o arquivo.
- [ ] Salve e confira que o produto mostra a área de membros como forma de entrega.

> ⚠️ Não confirmei na documentação da Cakto se a área de membros aceita anexar `.xlsx`. Se não aceitar: (1) suba o arquivo no Google Drive, (2) compartilhe como "qualquer pessoa com o link pode ver", (3) coloque o link na descrição da aula, junto com o PDF "Como usar". Também vale confirmar com o suporte da Cakto (infoprodutores@cakto.com.br) se quem compra o bump junto com o principal recebe o acesso aos dois automaticamente.

## Passo 3: imagens do painel (prontas, falta subir)
Todas estão em `cakto/imagens/painel/`, no **tamanho exato** pedido pelo painel. Nenhuma precisa ser redimensionada.

| Onde no painel | Tamanho | Principal | Calculadora (bump 1) | 52 Semanas (bump 2) |
|---|---|---|---|---|
| Informações do produto | 300×500 | `01-principal-info-300x500.png` | `02-calculadora-info-300x500.png` | `03-52semanas-info-300x500.png` |
| Capa do módulo (área de membros) | 400×600 | `01-principal-modulo-400x600.png` | `02-calculadora-modulo-400x600.png` | `03-52semanas-modulo-400x600.png` |
| Banner do produto | 1920×480 | `01-principal-banner-1920x480.png` | `02-calculadora-banner-1920x480.png` | `03-52semanas-banner-1920x480.png` |

- [ ] Suba cada imagem no campo correspondente dos 3 produtos.
- [ ] Depois de subir, abra a pré-visualização. Se alguma aparecer cortada ou esticada, me diga em qual campo e o que foi cortado.
- [ ] (Opcional) No produto principal → Order bumps → ativar "Exibir imagem" nos 2 bumps.

Nos banners, textos e ilustrações ficam na faixa central (entre 260 e 1660 px na horizontal), para não serem cortados em telas estreitas.

As versões anteriores (`imagens/300x250/` e as quadradas de 1080×1080) continuam no repositório. As quadradas servem para redes sociais e anúncios.

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
- [ ] Abra o checkout do principal: `https://pay.cakto.com.br/fi9x9rz` (formato confirmado na documentação oficial da Cakto).
- [ ] Confira: as capas aparecem, a Calculadora está em 1º e o 52 Semanas em 2º, os preços riscados de R$ 29,90 e R$ 34,90 aparecem, e Pix e cartão estão disponíveis.
- [ ] Faça **uma compra real via Pix** com os 2 bumps e confirme que o e-mail de acesso chega com o conteúdo dos 3 produtos. Depois reembolse pelo painel.
