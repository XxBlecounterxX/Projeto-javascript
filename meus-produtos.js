// ============================================
// INTEGRAÇÃO DE PRODUTOS DO USUÁRIO NA LOJA
// ============================================

// Função para carregar produtos do usuário
function carregarProdutosUsuario() {
    try {
        const produtosUsuario = localStorage.getItem('meus_produtos_pedalaria');
        if (!produtosUsuario) return [];
        
        const produtos = JSON.parse(produtosUsuario);
        
        // Converter para o formato da loja
        return produtos.map(produto => ({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            categoria: produto.categoria,
            descricao: produto.descricao,
            estoque: 10,
            emDestaque: false,
            novo: true // Marcar como produto do usuário
        }));
    } catch (erro) {
        console.error('Erro ao carregar produtos do usuário:', erro);
        return [];
    }
}

// Função para mesclar produtos
function mesclarProdutos(produtosLoja) {
    const produtosUsuario = carregarProdutosUsuario();
    
    // Combinar arrays (produtos do usuário primeiro)
    return [...produtosUsuario, ...produtosLoja];
}

// Modificar a inicialização para incluir produtos do usuário
document.addEventListener('DOMContentLoaded', () => {
    // Carregar produtos da loja
    const produtosLoja = window.produtos || [];
    
    // Mesclar com produtos do usuário
    const todosProdutos = mesclarProdutos(produtosLoja);
    
    // Renderizar todos os produtos
    renderizarProdutos(todosProdutos);
    
    // Configurar filtros (se existirem)
    if (typeof configurarFiltros === 'function') {
        configurarFiltros(todosProdutos);
    }
    
    // Atualizar contador do carrinho
    atualizarContadorCarrinho();
});

// Função para renderizar produtos (modificada)
function renderizarProdutos(produtos) {
    const container = document.getElementById('produtos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    produtos.forEach(produto => {
        // Determinar classe CSS para produtos do usuário
        const classeUsuario = produto.novo ? 'produto-usuario' : '';
        
        const produtoHTML = `
            <div class="produto-card ${classeUsuario}" data-categoria="${produto.categoria}">
                ${produto.novo ? '<div class="badge-usuario">👤 Meu Produto</div>' : ''}
                <img src="${produto.imagem}" alt="${produto.nome}" class="produto-img"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Não+Carregada'">
                <div class="produto-info">
                    <div class="produto-nome">${produto.nome}</div>
                    <div class="produto-desc">${produto.descricao || 'Sem descrição'}</div>
                    <div class="produto-preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                </div>
                <button class="btn-add-carrinho" data-id="${produto.id}">
                    🛒 Adicionar
                </button>
            </div>
        `;
        
        container.innerHTML += produtoHTML;
    });
    
    // Configurar botões de adicionar ao carrinho
    document.querySelectorAll('.btn-add-carrinho').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const produto = produtos.find(p => p.id.toString() === id);
            
            if (produto) {
                // Adicionar ao carrinho
                carrinho.adicionar({
                    id: produto.id,
                    nome: produto.nome,
                    preco: produto.preco,
                    imagem: produto.imagem,
                    quantidade: 1
                });
                
                // Atualizar contador
                atualizarContadorCarrinho();
                
                // Feedback visual
                e.target.textContent = '✅ Adicionado!';
                e.target.style.background = '#10b981';
                e.target.style.color = '#042018';
                
                setTimeout(() => {
                    e.target.textContent = '🛒 Adicionar';
                    e.target.style.background = '';
                    e.target.style.color = '';
                }, 1000);
            }
        });
    });
}

// Ad