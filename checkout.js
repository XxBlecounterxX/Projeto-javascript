const API_URL = 'http://localhost:5000/api';

// Elementos DOM
const elementos = {
    produtosLista: document.getElementById('produtos-lista'),
    subtotal: document.getElementById('subtotal'),
    frete: document.getElementById('frete'),
    total: document.getElementById('total'),
    notificacao: document.getElementById('notificacao'),
    usuarioLogado: document.getElementById('usuario-logado'),
    usuarioNaoLogado: document.getElementById('usuario-nao-logado'),
    emailUsuario: document.getElementById('email-usuario'),
    opcoesIniciais: document.getElementById('opcoes-iniciais'),
    formLogin: document.getElementById('form-login'),
    formRegistro: document.getElementById('form-registro'),
    btnFinalizar: document.getElementById('btn-finalizar'),
    modalConfirmacao: document.getElementById('modal-confirmacao'),
    
    // Campos de login
    emailLogin: document.getElementById('email-login'),
    senhaLogin: document.getElementById('senha-login'),
    btnLogin: document.getElementById('btn-login'),
    btnVoltarLogin: document.getElementById('btn-voltar-login'),
    
    // Campos de registro
    emailRegistro: document.getElementById('email-registro'),
    senhaRegistro: document.getElementById('senha-registro'),
    confirmarSenha: document.getElementById('confirmar-senha'),
    btnRegistro: document.getElementById('btn-registro'),
    btnVoltarRegistro: document.getElementById('btn-voltar-registro'),
    
    // Botões de opções
    btnMostrarLogin: document.getElementById('btn-mostrar-login'),
    btnMostrarRegistro: document.getElementById('btn-mostrar-registro'),
    
    // Modal
    numeroPedido: document.getElementById('numero-pedido'),
    emailConfirmacao: document.getElementById('email-confirmacao'),
    totalConfirmacao: document.getElementById('total-confirmacao')
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Checkout carregado!');
    
    // Verificar se há produtos no carrinho
    if (!carrinho || carrinho.itens.length === 0) {
        alert('Carrinho vazio! Redirecionando...');
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar produtos e valores
    carregarProdutos();
    atualizarValores();
    verificarAutenticacao();
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
}

// VERIFICAR SE USUÁRIO ESTÁ LOGADO
function verificarAutenticacao() {
    const email = localStorage.getItem('email');
    
    if (email) {
        // Usuário logado
        elementos.usuarioLogado.style.display = 'block';
        elementos.usuarioNaoLogado.style.display = 'none';
        elementos.emailUsuario.textContent = email;
    } else {
        // Usuário não logado
        elementos.usuarioLogado.style.display = 'none';
        elementos.usuarioNaoLogado.style.display = 'block';
        mostrarOpcoesIniciais();
    }
}

// CONFIGURAR TODOS OS EVENTOS
function configurarEventos() {
    console.log('Configurando eventos...');
    
    // Botões de opções iniciais
    elementos.btnMostrarLogin.addEventListener('click', mostrarLogin);
    elementos.btnMostrarRegistro.addEventListener('click', mostrarRegistro);
    
    // Botões de formulário
    elementos.btnLogin.addEventListener('click', fazerLogin);
    elementos.btnRegistro.addEventListener('click', fazerRegistro);
    
    // Botões voltar
    elementos.btnVoltarLogin.addEventListener('click', mostrarOpcoesIniciais);
    elementos.btnVoltarRegistro.addEventListener('click', mostrarOpcoesIniciais);
    
    // Botão finalizar compra
    elementos.btnFinalizar.addEventListener('click', finalizarCompra);
}

// FUNÇÕES DE NAVEGAÇÃO
function mostrarOpcoesIniciais() {
    elementos.opcoesIniciais.style.display = 'block';
    elementos.formLogin.style.display = 'none';
    elementos.formRegistro.style.display = 'none';
}

function mostrarLogin() {
    elementos.opcoesIniciais.style.display = 'none';
    elementos.formLogin.style.display = 'block';
    elementos.formRegistro.style.display = 'none';
}

function mostrarRegistro() {
    elementos.opcoesIniciais.style.display = 'none';
    elementos.formLogin.style.display = 'none';
    elementos.formRegistro.style.display = 'block';
}

// FUNÇÕES DE AUTENTICAÇÃO
async function fazerLogin() {
    const email = elementos.emailLogin.value.trim();
    const senha = elementos.senhaLogin.value;
    
    // Validação
    if (!email || !senha) {
        mostrarNotificacao('Preencha todos os campos', 'erro');
        return;
    }
    
    if (!email.includes('@gmail.com')) {
        mostrarNotificacao('Use um email Gmail válido', 'erro');
        return;
    }
    
    // Desabilitar botão
    elementos.btnLogin.disabled = true;
    elementos.btnLogin.textContent = 'Entrando...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password: senha })
        });
        
        const data = await response.json();
        
        if (!data.sucesso) {
            mostrarNotificacao(data.mensagem || 'Erro ao fazer login', 'erro');
            return;
        }
        
        // Salvar dados no localStorage
        localStorage.setItem('email', email);
        localStorage.setItem('usuario_id', data.usuario.id);
        
        mostrarNotificacao('Login realizado com sucesso!', 'sucesso');
        
        // Atualizar interface
        setTimeout(() => {
            verificarAutenticacao();
        }, 1000);
        
    } catch (erro) {
        mostrarNotificacao('Erro de conexão com o servidor', 'erro');
        console.error(erro);
    } finally {
        elementos.btnLogin.disabled = false;
        elementos.btnLogin.textContent = 'Entrar';
    }
}

async function fazerRegistro() {
    const email = elementos.emailRegistro.value.trim();
    const senha = elementos.senhaRegistro.value;
    const confirmar = elementos.confirmarSenha.value;
    
    // Validação
    if (!email || !senha || !confirmar) {
        mostrarNotificacao('Preencha todos os campos', 'erro');
        return;
    }
    
    if (!email.includes('@gmail.com')) {
        mostrarNotificacao('Use um email Gmail válido', 'erro');
        return;
    }
    
    if (senha.length < 6) {
        mostrarNotificacao('Senha deve ter no mínimo 6 caracteres', 'erro');
        return;
    }
    
    if (senha !== confirmar) {
        mostrarNotificacao('As senhas não coincidem', 'erro');
        return;
    }
    
    // Desabilitar botão
    elementos.btnRegistro.disabled = true;
    elementos.btnRegistro.textContent = 'Criando conta...';
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password: senha })
        });
        
        const data = await response.json();
        
        if (!data.sucesso) {
            mostrarNotificacao(data.mensagem || 'Erro ao criar conta', 'erro');
            return;
        }
        
        // Salvar dados no localStorage
        localStorage.setItem('email', email);
        localStorage.setItem('usuario_id', data.usuario.id);
        
        mostrarNotificacao('Conta criada com sucesso!', 'sucesso');
        
        // Atualizar interface
        setTimeout(() => {
            verificarAutenticacao();
        }, 1000);
        
    } catch (erro) {
        mostrarNotificacao('Erro de conexão com o servidor', 'erro');
        console.error(erro);
    } finally {
        elementos.btnRegistro.disabled = false;
        elementos.btnRegistro.textContent = 'Criar Conta';
    }
}

// FINALIZAR COMPRA
async function finalizarCompra() {
    const email = localStorage.getItem('email');
    
    if (!email) {
        mostrarNotificacao('Você precisa estar logado para finalizar a compra', 'erro');
        return;
    }
    
    // Desabilitar botão
    elementos.btnFinalizar.disabled = true;
    elementos.btnFinalizar.textContent = 'Processando...';
    
    try {
        const total = carrinho.obterTotal ? carrinho.obterTotal() : carrinho.obterSubtotal();
        
        const response = await fetch(`${API_URL}/pedidos/criar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_email: email,
                itens: carrinho.itens,
                total: total
            })
        });
        
        const data = await response.json();
        
        if (!data.sucesso) {
            mostrarNotificacao(data.mensagem || 'Erro ao criar pedido', 'erro');
            return;
        }
        
        // Preencher modal de confirmação
        elementos.numeroPedido.textContent = data.pedido.numero;
        elementos.emailConfirmacao.textContent = email;
        elementos.totalConfirmacao.textContent = `R$ ${data.pedido.total.toFixed(2).replace('.', ',')}`;
        
        // Limpar carrinho
        if (carrinho.limpar) {
            carrinho.limpar();
        }
        
        // Mostrar modal
        mostrarModal();
        
    } catch (erro) {
        mostrarNotificacao('Erro de conexão com o servidor', 'erro');
        console.error(erro);
    } finally {
        elementos.btnFinalizar.disabled = false;
        elementos.btnFinalizar.textContent = 'Finalizar Compra';
    }
}

// FUNÇÕES AUXILIARES
function mostrarNotificacao(mensagem, tipo = 'erro') {
    elementos.notificacao.textContent = mensagem;
    elementos.notificacao.className = `notificacao ${tipo}`;
    
    setTimeout(() => {
        elementos.notificacao.className = 'notificacao';
    }, 4000);
}

function mostrarModal() {
    elementos.modalConfirmacao.style.display = 'flex';
}

function fecharModal() {
    elementos.modalConfirmacao.style.display = 'none';
}

function voltarCarrinho() {
    if (confirm('Deseja voltar ao carrinho? Os dados serão mantidos.')) {
        window.location.href = 'index.html';
    }
}

function voltarInicio() {
    window.location.href = 'index.html';
}

// Exportar funções para uso no HTML
window.voltarCarrinho = voltarCarrinho;
window.fecharModal = fecharModal;
window.voltarInicio = voltarInicio;