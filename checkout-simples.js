// Elementos DOM
const elementos = {
    produtosLista: document.getElementById('produtos-lista'),
    subtotal: document.getElementById('subtotal'),
    frete: document.getElementById('frete'),
    total: document.getElementById('total'),
    btnPagar: document.getElementById('btn-pagar'),
    modalConfirmacao: document.getElementById('modal-confirmacao'),
    numeroPedido: document.getElementById('numero-pedido'),
    dataPedido: document.getElementById('data-pedido'),
    totalConfirmacao: document.getElementById('total-confirmacao')
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Checkout simplificado carregado!');
    
    // Verificar se há produtos no carrinho
    if (!carrinho || carrinho.itens.length === 0) {
        alert('Carrinho vazio! Redirecionando para a loja...');
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar produtos e valores
    carregarProdutos();
    atualizarValores();
    configurarEventos();
});

// CARREGAR PRODUTOS DO CARRINHO
function carregarProdutos() {
    elementos.produtosLista.innerHTML = '';
    
    carrinho.itens.forEach(item => {
        const itemTotal = item.preco * item.quantidade;
        
        const produtoHTML = `
            <div class="produto-item">
                <img src="${item.imagem}" alt="${item.nome}" class="produto-img">
                <div class="produto-info">
                    <div class="produto-nome">${item.nome}</div>
                    <div class="produto-detalhes">
                        ${item.quantidade}x R$ ${item.preco.toFixed(2).replace('.', ',')}
                    </div>
                </div>
                <div class="produto-total">
                    R$ ${itemTotal.toFixed(2).replace('.', ',')}
                </div>
            </div>
        `;
        
        elementos.produtosLista.innerHTML += produtoHTML;
    });
}

// ATUALIZAR VALORES DO CARRINHO
function atualizarValores() {
    if (!carrinho || !carrinho.obterSubtotal) {
        console.error('Carrinho não carregado corretamente!');
        return;
    }
    
    const subtotal = carrinho.obterSubtotal();
    const frete = carrinho.obterFrete ? carrinho.obterFrete() : 0;
    const total = carrinho.obterTotal ? carrinho.obterTotal() : subtotal + frete;
    
    elementos.subtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    elementos.frete.textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2).replace('.', ',')}`;
    elementos.total.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Atualizar também no modal
    elementos.totalConfirmacao.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// CONFIGURAR EVENTOS
function configurarEventos() {
    console.log('Configurando eventos...');
    
    // Botão de pagamento
    elementos.btnPagar.addEventListener('click', processarPagamento);
}

// PROCESSAR PAGAMENTO
function processarPagamento() {
    console.log('Processando pagamento...');
    
    // Desabilitar botão
    elementos.btnPagar.disabled = true;
    elementos.btnPagar.classList.add('processando');
    elementos.btnPagar.textContent = 'Processando pagamento...';
    
    // Simular processamento (3 segundos)
    setTimeout(() => {
        // Gerar número do pedido
        const numeroPedido = 'PED-' + Date.now();
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const total = carrinho.obterTotal ? carrinho.obterTotal() : carrinho.obterSubtotal();
        
        // Atualizar modal
        elementos.numeroPedido.textContent = numeroPedido;
        elementos.dataPedido.textContent = dataAtual;
        elementos.totalConfirmacao.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        // Salvar pedido no localStorage (opcional)
        salvarPedido(numeroPedido, total, dataAtual);
        
        // Limpar carrinho
        if (carrinho.limpar) {
            carrinho.limpar();
        }
        
        // Mostrar modal de confirmação
        mostrarModal();
        
        // Restaurar botão
        elementos.btnPagar.disabled = false;
        elementos.btnPagar.classList.remove('processando');
        elementos.btnPagar.textContent = '💳 Pagar Agora';
        
    }, 3000);
}

// SALVAR PEDIDO NO LOCALSTORAGE
function salvarPedido(numero, total, data) {
    try {
        const pedidos = JSON.parse(localStorage.getItem('pedidos_pedalaria')) || [];
        
        pedidos.push({
            numero: numero,
            data: data,
            total: total

        