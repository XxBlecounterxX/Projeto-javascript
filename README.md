esse é um site de de um projeto de java script sobre venda de coisas relacionadas a bicicleta nada é real é possivel vender peças relacionadas a bicileta entre outras coisas apenas disponiveis no site.
remoçao do sistema de cadastro para adiçao de uma nova ideia. por causa que estava apresentando problemas no desenvolvimento
METAS ATINGIDAS:
Acessibilidade: Qualquer pessoa pode usar sem treinamento
Velocidade: Processo de venda em menos de 5 minutos
Confiabilidade: Dados salvos mesmo ao fechar o navegador
Escalabilidade: Estrutura pronta para crescimento

Recursos que Oferecemos:
Upload de imagens
Definição de preços
Organização por categorias
Carrinho de compras
Checkout simplificado
Design responsivo

a funcionalidade é otima apresentendo apresentando API funcionais como LocalStorege fluxo estavel e pequeno erros como na hora do pagamento
codigo é JS é funcional apresentando varia funcionalidades no site
Assíncrono é bom apresentando 2 erros no codigo
1) Navegar e comprar na loja
O usuário abre o index.html
A página lista os produtos existentes
Ao clicar em Adicionar ao carrinho, o item entra no carrinho
O carrinho fica salvo no navegador (LocalStorage), então não some ao atualizar a página
2) Criar e vender produtos (Meus Produtos)
O usuário acessa meus-produtos.html
Preenche um formulário com:

Nome
Preço
Categoria
URL da imagem (ou usa padrão)
Descrição


O produto é salvo no LocalStorage
Ao voltar para a loja (index.html), esses produtos do usuário aparecem junto dos produtos padrão
3) Finalizar compra (Checkout simplificado)
O usuário vai para checkout.html
O checkout mostra:

Lista dos itens do carrinho
Subtotal, frete e total


Ao clicar em “Finalizar”, aparece uma mensagem/modal simulando o pagamento e confirmando o pedido (sem login)
4) Página Sobre
A página sobre.html explica:

Por que o site foi criado
O objetivo
Como o sistema funciona
