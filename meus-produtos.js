// Sistema de Produtos do Usuário
class MeusProdutos {
    constructor() {
        this.produtos = this.carregarProdutos();
        this.produtoEditando = null;
        this.imagemBase64Atual = ''; // Para guardar a imagem selecionada
        this.init();
    }

    // Inicializar
    init() {
        this.carregarElementos();
        this.configurarEventos();
        this.atualizarContadorCarrinho();
        this.renderizarProdutos();
        this.atualizarContadorProdutos();
    }

    // Carregar elementos DOM
    carregarElementos() {
        this.elementos = {
            form: document.getElementById('form-produto'),
            nome: document.getElementById('nome'),
            preco: document.getElementById('preco'),
            categoria: document.getElementById('categoria'),
            imagemArquivo: document.getElementById('imagemArquivo'), // NOVO: input file
            descricao: document.getElementById('descricao'),
            btnSalvar: document.getElementById('btn-salvar'),
            btnCancelar: document.getElementById('btn-cancelar'),
            listaProdutos: document.getElementById('lista-produtos'),
            contadorProdutos: document.getElementById('contador-produtos'),
            previewContainer: document.getElementById('preview-container'),
            previewPlaceholder: document.getElementById('preview-placeholder'),
            previewImagem: document.getElementById('preview-imagem'),
            notificacao: document.getElementById('notificacao'),
            formTitulo: document.getElementById('form-titulo')
        };
    }

    // Configurar eventos
    configurarEventos() {
        // Formulário
        this.elementos.form.addEventListener('submit', (e) => this.salvarProduto(e));
        
        // Botão cancelar
        this.elementos.btnCancelar.addEventListener('click', () => this.cancelarEdicao());
        
        // NOVO: Quando selecionar arquivo, ler e mostrar preview
        this.elementos.imagemArquivo.addEventListener('change', (e) => this.lerArquivoImagem(e));
        
        // Carrinho
        document.getElementById('btn-carrinho').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // NOVO: Ler arquivo de imagem e converter para Base64
    lerArquivoImagem(evento) {
        const arquivo = evento.target.files && evento.target.files[0];
        if (!arquivo) {
            this.imagemBase64Atual = '';
            this.atualizarPreviewComBase64('');
            return;
        }

        // Validação: só imagens
        if (!arquivo.type.startsWith('image/')) {
            this.mostrarNotificacao('Selecione um arquivo de imagem válido (PNG, JPG, etc.).', 'erro');
            this.elementos.imagemArquivo.value = '';
            this.imagemBase64Atual = '';
            this.atualizarPreviewComBase64('');
            return;
        }

        // Validação: tamanho máximo 2MB
        const limiteBytes = 2 * 1024 * 1024; // 2MB
        if (arquivo.size > limiteBytes) {
            this.mostrarNotificacao('Imagem muito grande. Use até 2MB.', 'erro');
            this.elementos.imagemArquivo.value = '';
            this.imagemBase64Atual = '';
            this.atualizarPreviewComBase64('');
            return;
        }

        // Ler arquivo e converter para Base64
        const reader = new FileReader();
        reader.onload = () => {
            this.imagemBase64Atual = reader.result; // Base64 (data URL)
            this.atualizarPreviewComBase64(this.imagemBase64Atual);
        };
        reader.onerror = () => {
            this.mostrarNotificacao('Erro ao ler a imagem.', 'erro');
        };

        reader.readAsDataURL(arquivo);
    }

    // NOVO: Atualizar preview com Base64
    atualizarPreviewComBase64(base64) {
        if (base64) {
            this.elementos.previewImagem.src = base64;
            this.elementos.previewImagem.style.display = 'block';
            this.elementos.previewPlaceholder.style.display = 'none';
        } else {
            this.elementos.previewImagem.src = '';
            this.elementos.previewImagem.style.display = 'none';
            this.elementos.previewPlaceholder.style.display = 'block';
            this.elementos.previewPlaceholder.textContent = '📷 Imagem aparecerá aqui';
        }
    }

    // Carregar produtos do localStorage
    carregarProdutos() {
        try {
            const produtos = localStorage.getItem('meus_produtos_pedalaria');
            return produtos ? JSON.parse(produtos) : [];
        } catch (erro) {
            console.error('Erro ao carregar produtos:', erro);
            return [];
        }
    }

    // Salvar produtos no localStorage
    salvarNoStorage() {
        try {
            localStorage.setItem('meus_produtos_pedalaria', JSON.stringify(this.produtos));
            return true;
        } catch (erro) {
            console.error('Erro ao salvar produtos:', erro);
            return false;
        }
    }

    // Salvar produto (novo ou edição)
    salvarProduto(e) {
        e.preventDefault();
        
        // Validar dados
        const nome = this.elementos.nome.value.trim();
        const preco = parseFloat(this.elementos.preco.value);
        const categoria = this.elementos.categoria.value;
        const imagem = this.imagemBase64Atual; // Base64 ou vazio
        const descricao = this.elementos.descricao.value.trim();
        
        if (!nome || !preco) {
            this.mostrarNotificacao('Nome e preço são obrigatórios!', 'erro');
            return;
        }
        
        if (preco <= 0) {
            this.mostrarNotificacao('Preço deve ser maior que zero!', 'erro');
            return;
        }
        
        // Criar objeto do produto
        const produto = {
            id: this.produtoEditando ? this.produtoEditando.id : Date.now().toString(),
            nome: nome,
            preco: preco,
            categoria: categoria,
            imagem: imagem || 'https://via.placeholder.com/300x200?text=Sem+Imagem',
            descricao: descricao || 'Sem descrição',
            dataCriacao: new Date().toISOString()
        };
        
        // Adicionar ou atualizar
        if (this.produtoEditando) {
            // Atualizar produto existente
            const index = this.produtos.findIndex(p => p.id === this.produtoEditando.id);
            if (index !== -1) {
                this.produtos[index] = produto;
                this.mostrarNotificacao('Produto atualizado com sucesso!', 'sucesso');
            }
        } else {
            // Adicionar novo produto
            this.produtos.push(produto);
            this.mostrarNotificacao('Produto adicionado com sucesso!', 'sucesso');
        }
        
        // Salvar no localStorage
        if (this.salvarNoStorage()) {
            // Atualizar interface
            this.renderizarProdutos();
            this.atualizarContadorProdutos();
            this.limparFormulario();
            this.produtoEditando = null;
        } else {
            this.mostrarNotificacao('Erro ao salvar produto!', 'erro');
        }
    }

    // Renderizar lista de produtos
    renderizarProdutos() {
        if (this.produtos.length === 0) {
            this.elementos.listaProdutos.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h3>Nenhum produto cadastrado</h3>
                    <p>Adicione seu primeiro produto usando o formulário acima!</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        this.produtos.forEach(produto => {
            html += `
                <div class="produto-card" data-id="${produto.id}">
                    <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem" 
                         onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Não+Carregada'">
                    
                    <div class="produto-info">
                        <div class="produto-nome">${produto.nome}</div>
                        <div class="produto-descricao">${produto.descricao}</div>
                        <div class="produto-preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 5px;">
                            Categoria: ${this.getCategoriaNome(produto.categoria)}
                        </div>
                    </div>
                    
                    <div class="produto-acoes">
                        <button class="btn-editar" onclick="meusProdutos.editarProduto('${produto.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn-excluir" onclick="meusProdutos.excluirProduto('${produto.id}')">
                            🗑️ Excluir
                        </button>
                        <button class="btn-editar" onclick="meusProdutos.adicionarAoCarrinho('${produto.id}')">
                            🛒 Add Carrinho
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.elementos.listaProdutos.innerHTML = html;
    }

    // Editar produto
    editarProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;
        
        this.produtoEditando = produto;
        
        // Preencher formulário
        this.elementos.nome.value = produto.nome;
        this.elementos.preco.value = produto.preco;
        this.elementos.categoria.value = produto.categoria;
        this.elementos.descricao.value = produto.descricao;
        
        // Para imagem: se for Base64, carregar no preview
        this.imagemBase64Atual = produto.imagem && produto.imagem.startsWith('data:image/')
            ? produto.imagem
            : '';
        
        this.elementos.imagemArquivo.value = ''; // Browser não deixa setar arquivo
        this.atualizarPreviewComBase64(produto.imagem);
        
        // Atualizar interface
        this.elementos.formTitulo.textContent = '✏️ Editar Produto';
        this.elementos.btnSalvar.textContent = '💾 Atualizar Produto';
        this.elementos.btnCancelar.style.display = 'inline-block';
        
        // Rolar para o formulário
        this.elementos.form.scrollIntoView({ behavior: 'smooth' });
        
        this.mostrarNotificacao('Editando produto...', 'sucesso');
    }

    // Excluir produto
    excluirProduto(id) {
        if (!confirm('Tem certeza que deseja excluir este produto?')) {
            return;
        }
        
        const index = this.produtos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.produtos.splice(index, 1);
            
            if (this.salvarNoStorage()) {
                this.renderizarProdutos();
                this.atualizarContadorProdutos();
                this.mostrarNotificacao('Produto excluído com sucesso!', 'sucesso');
                
                // Se estava editando este produto, limpar formulário
                if (this.produtoEditando && this.produtoEditando.id === id) {
                    this.cancelarEdicao();
                }
            }
        }
    }

    // Adicionar produto ao carrinho
    adicionarAoCarrinho(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;
        
        // Verificar se carrinho existe
        if (typeof carrinho === 'undefined') {
            this.mostrarNotificacao('Carrinho não disponível!', 'erro');
            return;
        }
        
        // Adicionar ao carrinho
        carrinho.adicionar({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidade: 1
        });
        
        // Atualizar contador
        this.atualizarContadorCarrinho();
        
        this.mostrarNotificacao('Produto adicionado ao carrinho!', 'sucesso');
    }

    // Cancelar edição
    cancelarEdicao() {
        this.produtoEditando = null;
        this.limparFormulario();
        this.elementos.btnCancelar.style.display = 'none';
        this.elementos.formTitulo.textContent = 'Adicionar Novo Produto';
        this.elementos.btnSalvar.textContent = '💾 Salvar Produto';
    }

    // Limpar formulário
    limparFormulario() {
        this.elementos.form.reset();
        this.imagemBase64Atual = '';
        this.elementos.imagemArquivo.value = '';
        this.atualizarPreviewComBase64('');
        this.elementos.categoria.value = 'bicicletas';
    }

    // Atualizar contador de produtos
    atualizarContadorProdutos() {
        this.elementos.contadorProdutos.textContent = this.produtos.length;
    }

    // Atualizar contador do carrinho
    atualizarContadorCarrinho() {
        if (typeof carrinho !== 'undefined' && carrinho.itens) {
            const totalItens = carrinho.itens.reduce((total, item) => total + item.quantidade, 0);
            document.getElementById('contador-carrinho').textContent = totalItens;
        }
    }

    // Mostrar notificação
    mostrarNotificacao(mensagem, tipo = 'sucesso') {
        this.elementos.notificacao.textContent = mensagem;
        this.elementos.notificacao.className = `notificacao ${tipo}`;
        
        setTimeout(() => {
            this.elementos.notificacao.className = 'notificacao';
        }, 4000);
    }

    // Obter nome da categoria
    getCategoriaNome(codigo) {
        const categorias = {
            'bicicletas': '🚴 Bicicletas',
            'acessorios': '🔧 Acessórios',
            'vestuario': '👕 Vestuário',
            'componentes': '⚙️ Componentes',
            'outros': '📦 Outros'
        };
        
        return categorias[codigo] || 'Outros';
    }
}

// Inicializar sistema
let meusProdutos;

document.addEventListener('DOMContentLoaded', () => {
    meusProdutos = new MeusProdutos();
});

// Função global para limpar formulário (chamada do HTML)
function limparFormulario() {
    if (meusProdutos) {
        meusProdutos.limparFormulario();
    }
}
