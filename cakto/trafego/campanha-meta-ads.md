# Campanha Meta Ads · Reserva de Emergência do Zero

Verba: **R$ 50/dia** · Conta: **começando do zero** (sem perfil, sem Business Manager, sem Pixel, sem conta de anúncios).

> ⚠️ **Leia antes.**
> - O Meta muda nomes de menus com frequência. Onde um botão não bater com o que está escrito aqui, procure pelo nome mais parecido. Os caminhos abaixo são aproximados.
> - **Nenhum resultado é garantido.** Custos, conversão e prazos variam. Todos os números deste plano são pontos de partida para decisão, não previsões.
> - **Anúncios de finanças têm regras mais rígidas no Meta.** Revise as Políticas de Publicidade atuais antes de publicar. Dois pontos que costumam reprovar anúncio:
>   1. **Atributo pessoal:** o anúncio não pode afirmar ou insinuar a situação financeira de quem vê ("Você está endividado?"). As copies abaixo falam da situação em 3ª pessoa ou de forma geral por isso.
>   2. **Promessa de resultado:** "6 meses de despesa em 18 meses" aparece como **objetivo do método**, nunca como garantia.

---

## PARTE 0 · Criar a estrutura (antes de tudo)

Contas novas no Meta têm mais chance de sofrer restrição quando se anuncia no primeiro dia. A ordem abaixo reduz esse risco, mas não elimina.

1. **Perfil pessoal no Facebook** com dados reais: nome, foto, e-mail e celular.
   - Ative a **autenticação de dois fatores** em Configurações → Central de Contas → Senha e segurança.
   - Use o perfil normalmente por alguns dias (curtir, seguir páginas) antes de anunciar. É uma prática comum para contas novas; não há regra oficial de prazo.
2. **Página do Facebook** do produto ou da sua marca (ex.: "Reserva de Emergência do Zero"), com foto, capa e 2 ou 3 posts.
3. **Instagram profissional** (recomendado), ligado à página.
4. **Portfólio empresarial / Business Manager** em business.facebook.com → Criar conta. Informe nome da empresa, seu nome e e-mail do negócio.
5. **Conta de anúncios** dentro do portfólio: Configurações do negócio → Contas → Contas de anúncios → Adicionar → Criar nova.
   - Fuso: **São Paulo**.
   - Moeda: **BRL**. **A moeda não pode ser trocada depois.**
   - Adicione a **forma de pagamento**: cartão ou Pix/boleto pré-pago, conforme o que o Meta oferecer para a conta.
6. **Pixel (Conjunto de dados):** Gerenciador de Eventos → Conectar fontes de dados → **Web** → nomeie `Pixel Reserva` → **copie o ID do Pixel**, um número com cerca de 15 a 16 dígitos.

---

## PARTE 1 · Rastreamento

### 1.1 Pixel dentro do produto na Cakto
1. Painel da Cakto → **Produtos** → Reserva de Emergência do Zero → **Pixels** (ou **Rastreamento**).
2. Em **Facebook / Meta**, adicione o **ID do Pixel**.
   - Se a Cakto pedir **Token da API de Conversões**, gere no Gerenciador de Eventos (seu Pixel → Configurações → API de Conversões → Gerar token de acesso) e cole. Com ele o rastreio fica mais confiável.
3. **Confira as opções de disparo por meio de pagamento.** A Cakto tem configurações que disparam o evento de **Compra** também quando o **Pix é gerado**, o boleto é gerado etc. Hoje elas aparecem **ligadas por padrão** na sua conta.
   - Se a opção for literalmente "disparar Purchase ao **gerar** Pix/boleto", **desligue**. O Meta contaria como venda quem só gerou o Pix e não pagou, e otimizaria para o público errado.
   - **Não tenho certeza** de como a Cakto nomeia essas opções. Se ficar em dúvida, confirme com o suporte da Cakto.
4. Repita nos 2 bumps, com o mesmo Pixel, se o painel permitir.
5. **Teste:** no Gerenciador de Eventos → seu Pixel → **Testar eventos**. Abra o checkout pelo link de teste que ele fornecer e veja se chegam **PageView** e **InitiateCheckout**. O evento **Purchase** só aparece com um pagamento real.

### 1.2 Links finais dos anúncios

Base do checkout: `https://pay.cakto.com.br/fi9x9rz`

| Anúncio | Link final |
|---|---|
| AD-01 (dor) | `https://pay.cakto.com.br/fi9x9rz?utm_source=facebook&utm_medium=paid&utm_campaign=RESERVA-VENDAS-CBO-01&utm_content=AD-01&sck=RESERVA-VENDAS-CBO-01-AD-01` |
| AD-02 (desejo) | `https://pay.cakto.com.br/fi9x9rz?utm_source=facebook&utm_medium=paid&utm_campaign=RESERVA-VENDAS-CBO-01&utm_content=AD-02&sck=RESERVA-VENDAS-CBO-01-AD-02` |
| AD-03 (prova) | `https://pay.cakto.com.br/fi9x9rz?utm_source=facebook&utm_medium=paid&utm_campaign=RESERVA-VENDAS-CBO-01&utm_content=AD-03&sck=RESERVA-VENDAS-CBO-01-AD-03` |
| AD-04 (curiosidade) | `https://pay.cakto.com.br/fi9x9rz?utm_source=facebook&utm_medium=paid&utm_campaign=RESERVA-VENDAS-CBO-01&utm_content=AD-04&sck=RESERVA-VENDAS-CBO-01-AD-04` |
| AD-05 (urgência) | `https://pay.cakto.com.br/fi9x9rz?utm_source=facebook&utm_medium=paid&utm_campaign=RESERVA-VENDAS-CBO-01&utm_content=AD-05&sck=RESERVA-VENDAS-CBO-01-AD-05` |

Como o mesmo anúncio roda nos 3 conjuntos, o `sck` diz **qual anúncio** vendeu, mas não **em qual conjunto**. Para saber o conjunto, veja o relatório do próprio Gerenciador. Se preferir, acrescente `&utm_term={{adset.name}}` ao link: o Meta preenche o nome do conjunto sozinho. Confirme se esse parâmetro dinâmico está disponível na sua conta.

---

## PARTE 2 · Estrutura da campanha (cliques na ordem)

**Nomes:** campanha `RESERVA-VENDAS-CBO-01` · conjuntos `ABERTO`, `INT-01`, `INT-02` · anúncios `AD-01` a `AD-05`.

### Campanha
1. Gerenciador de Anúncios → **+ Criar**.
2. Objetivo: **Vendas** → Continuar.
3. Se ele oferecer "Campanha de vendas Advantage+" ou "manual", escolha **manual**. Com ela você controla os 3 conjuntos.
4. Nome: `RESERVA-VENDAS-CBO-01`.
5. **Categorias especiais de anúncio:** leia as opções. Se o Meta indicar que um guia de finanças pessoais se enquadra em "Produtos e serviços financeiros", marque, mesmo sabendo que isso limita idade e interesses. **Não tenho certeza** de que se aplica a um produto educativo; na dúvida, consulte a Central de Ajuda do Meta.
6. **Orçamento da campanha (Advantage / CBO): ligado** → **R$ 50,00 diário**.
7. Estratégia de lance: **Maior volume** (sem limite de custo, no começo).

### Conjunto 1 · `ABERTO`
1. Conversão: **Site** → Pixel `Pixel Reserva` → evento **Compra**.
2. Local: **Brasil**.
3. Idade: **25 a 55**. É um ponto de partida; ajuste depois pelos dados.
4. Gênero: todos. Sem interesses. Se aparecer "Público Advantage+", deixe **sem sugestões**, com o público aberto.
5. Posicionamentos: **Advantage+**.
6. Otimização: **Conversões**, evento **Compra**.

### Conjunto 2 · `INT-01` (finanças pessoais e educação financeira)
Igual ao ABERTO, mas em **Segmentação detalhada** digite um por vez e escolha o que aparecer. **Estes nomes são sugestões: confirme cada um na busca.** Se algum não existir, pule e use o que o Meta sugerir de parecido.
- `Finanças pessoais`
- `Educação financeira`
- `Poupança`
- `Orçamento doméstico`
- `Me Poupe!`
- `Gustavo Cerbasi`

### Conjunto 3 · `INT-02` (vida real de quem nunca guardou)
- `Nubank`
- `Mercado Pago`
- `PicPay`
- `Serasa`
- `Cartão de crédito`
- `Empréstimo`

Nos dois conjuntos de interesse, se aparecer "Expandir interesses quando…" / Advantage+ de público, **desligue** no começo, para testar o interesse puro.

### Anúncios (os mesmos 5 em cada conjunto)
1. Nome: `AD-01`.
2. Identidade: a sua Página e o Instagram.
3. Formato: **imagem única**, 4:5.
4. Texto principal: a copy correspondente (Parte 3).
5. Título: "Reserva de Emergência do Zero".
6. Botão: **Comprar agora**.
7. URL: o link da tabela 1.2 correspondente.
8. Rastreamento: Pixel `Pixel Reserva` marcado.
9. Crie AD-02 a AD-05 da mesma forma. Depois, no conjunto, use **Duplicar** para copiar os 5 anúncios para os outros 2 conjuntos, mantendo os nomes.
10. **Publicar.** Os anúncios entram em revisão, que costuma levar de minutos a algumas horas.

---

## PARTE 3 · As 5 copies

> Regra usada: nada de "você está endividado", nada de resultado garantido, nada de depoimento inventado.

### AD-01 · Dor
**Gancho:** O pneu furou. Não tinha reserva. Virou dívida de novo.

Acontece com muita gente.
Um imprevisto de R$ 400 entra no cartão.
O cartão vira parcela.
A parcela come o salário do mês seguinte.
E o próximo imprevisto encontra a conta ainda mais apertada.
Não é falta de esforço. É falta de um colchão.
O guia Reserva de Emergência do Zero mostra, passo a passo, como montar esse colchão começando com R$ 50 por mês.

👉 Toque em **Comprar agora** e comece hoje: R$ 47.

### AD-02 · Desejo
**Gancho:** Imagina o próximo imprevisto chegar e não virar dívida.

A geladeira queima e você resolve.
Sem cartão, sem parcela, sem pedir emprestado.
É isso que uma reserva de emergência faz.
O guia te ajuda a descobrir quanto você precisa de verdade.
Onde guardar para o dinheiro estar lá na hora.
E um plano de 18 meses para chegar em 6 meses de despesa.

👉 Toque em **Comprar agora**: guia completo por R$ 47.

### AD-03 · Prova (de mecanismo, sem depoimento)
**Gancho:** Imprevisto vira dívida? Veja a conta que muda isso.

Custo essencial de R$ 1.400 por mês.
× 6 meses = R$ 8.400 de reserva.
÷ 18 meses = cerca de R$ 467 por mês.
Parece muito? Por isso o método soma várias fontes:
R$ 50 achados no orçamento + renda extra + um desafio semanal.
Os números são um exemplo. No guia, você faz a sua conta com os seus valores.

👉 Toque em **Comprar agora** e monte o seu plano: R$ 47.

### AD-04 · Curiosidade
**Gancho:** Todo imprevisto vira dívida nova. O problema não é o salário.

É a ordem.
Quem espera sobrar no fim do mês nunca guarda.
Porque nunca sobra.
Existe uma regra simples que inverte isso.
E 10 lugares onde o dinheiro está escondido no orçamento de quase todo mundo.
Está tudo no Capítulo 3 do guia.

👉 Toque em **Comprar agora** e descubra: R$ 47.

### AD-05 · Urgência
**Gancho:** O próximo imprevisto já tem data. Só você não sabe qual.

Pode ser o celular, o carro ou um remédio.
Sem reserva, ele vira dívida nova.
Com R$ 50 por mês, você já começa a mudar isso ainda este mês.
O guia tem o plano mês a mês, templates prontos e checklists.
Garantia de 7 dias: se não gostar, devolvemos o valor.

👉 Toque em **Comprar agora** e comece antes do próximo imprevisto: R$ 47.

---

## PARTE 4 · 5 prompts de criativo (4:5, para o ChatGPT)

> Cole um por vez. Imagens geradas por IA às vezes **erram o texto**: confira cada letra antes de usar. Se errar, peça "corrija o texto para exatamente: …". Não use rostos de pessoas reais conhecidas.

**AD-01 · Dor**
> Crie uma foto realista, formato vertical 4:5, estilo fotografia de celular com luz natural. Cena: um homem brasileiro de uns 35 anos, roupa simples de trabalho, agachado ao lado de um carro popular com o pneu furado numa rua de bairro, segurando o celular com expressão preocupada, olhando a fatura do cartão na tela. Fim de tarde, cores naturais, sem aparência de banco de imagem. No topo, uma faixa escura semitransparente com texto branco grande e legível, em português: "O pneu furou. Sem reserva, virou dívida." Embaixo, em texto menor: "Reserva de Emergência do Zero".

**AD-02 · Desejo**
> Crie uma foto realista, vertical 4:5, luz natural de manhã. Cena: uma mulher brasileira de uns 30 anos numa cozinha simples e organizada, ao lado de uma geladeira nova, sorrindo aliviada enquanto mostra no celular o saldo de uma conta separada chamada "Reserva". Clima calmo, casa real de classe média baixa, sem luxo. Texto sobreposto em uma caixa clara no canto superior, letras escuras grandes em português: "O imprevisto chegou. Dessa vez, não virou dívida."

**AD-03 · Prova (mecanismo)**
> Crie uma imagem realista, vertical 4:5: mãos de uma pessoa brasileira sobre uma mesa de madeira simples, com um caderno aberto mostrando contas escritas à mão e uma calculadora de celular ao lado. No caderno, legível: "R$ 1.400 x 6 = R$ 8.400" e "÷ 18 = R$ 467/mês". Luz de luminária, estilo foto caseira. No topo, faixa verde-escura com texto branco em português: "A conta que tira o imprevisto do cartão".

**AD-04 · Curiosidade**
> Crie uma foto realista, vertical 4:5: um jovem brasileiro de uns 28 anos sentado no sofá de casa, à noite, olhando surpreso para a fatura do cartão impressa, com várias assinaturas destacadas com caneta marca-texto amarela. Ambiente de apartamento simples, luz de abajur. Texto sobreposto no topo, branco sobre fundo escuro semitransparente, em português: "O problema não é o salário. É a ordem."

**AD-05 · Urgência**
> Crie uma foto realista, vertical 4:5: uma mulher brasileira de uns 40 anos numa farmácia de bairro, segurando uma receita e o celular, olhando o preço de um remédio com expressão tensa. Luz fluorescente de loja, cena cotidiana, sem glamour. Texto grande sobreposto no topo, amarelo sobre fundo preto semitransparente, em português: "O próximo imprevisto já tem data." Embaixo, menor: "Comece sua reserva com R$ 50/mês".

---

## PARTE 5 · Regras dos primeiros 7 dias

### Quanto você pode pagar por venda (CPA)
- Ticket médio = R$ 47 + (R$ 12 × % que leva a Calculadora) + (R$ 14 × % que leva o 52 Semanas).
  - Exemplo **hipotético**: se 30% levarem a Calculadora e 20% o 52 Semanas, o ticket médio é cerca de R$ 53.
- **CPA de equilíbrio** ≈ ticket médio **líquido**: o valor que sobra depois das taxas da Cakto. Confira as suas taxas no painel.
- Pontos de partida para decidir, **não garantias**:
  - **CPA-alvo:** até cerca de **R$ 35**, para sobrar margem.
  - **CPA máximo tolerável** na fase de teste: cerca de **R$ 45**. Acima disso, você paga para vender.
- Revise esses números quando tiver as primeiras 10 vendas e souber a taxa real dos bumps.

### Dia a dia
| Dia | O que olhar | O que fazer |
|---|---|---|
| **1** | Anúncios aprovados? Estão entregando? O Pixel registra PageView e InitiateCheckout? | Não mexa em nada. Só corrija reprovação ou erro de rastreio. |
| **2** | CPM, CTR do link, custo por clique, início de checkout | Não mexa. É a fase de aprendizado. |
| **3** | Por anúncio: gasto, CTR do link, inícios de checkout, vendas | **Desligue** o anúncio que gastou **≥ R$ 20** com **CTR do link abaixo de ~0,7%** e **nenhum** início de checkout. |
| **4** | CPA por anúncio e por conjunto | **Desligue** o anúncio que gastou **≥ R$ 50** sem nenhuma venda. |
| **5** | CPA dos conjuntos | Se um conjunto gastou **≥ R$ 70** sem venda enquanto os outros vendem, **desligue** esse conjunto. |
| **6** | Tendência do CPA dos vencedores | Nada novo. Deixe os vencedores respirarem. |
| **7** | CPA da campanha e número de vendas | **Aumentar verba:** se o CPA da campanha estiver **≤ R$ 35** com **pelo menos 3 vendas**, suba **+20%** (R$ 50 → R$ 60). Repita no máximo a cada 48 h. Se estiver **acima de R$ 45** sem sinais de melhora, pause e troque os criativos. |

### Regras que valem sempre
- **Não edite** anúncio ativo (texto, imagem, público). Qualquer edição reinicia o aprendizado. Para testar, **duplique** e altere a cópia.
- **Aumento de verba:** no máximo 20% por vez, espaçado.
- **Checkout direto** funciona para low ticket, mas se o CTR estiver bom e as vendas não vierem, a próxima alavanca é uma **página de vendas** entre o anúncio e o checkout.
- Os limiares acima (CTR 0,7%, R$ 20, R$ 50, R$ 70) são **referências usadas no mercado de low ticket**, não regras oficiais. Ajuste conforme os seus dados.
