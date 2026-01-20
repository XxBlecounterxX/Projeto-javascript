// Elementos
const produtosCheckout = document.getElementById('produtos-checkout');
const btnFinalizar = document.getElementById('btn-finalizar');
const notificacao = document.getElementById('notificacao-checkout');
const modalConfirmacao = document.getElementById('modal-confirmacao');

// Elementos de autenticação
const usuarioLogadoDiv = document.getElementById('usuario-logado');
const usuarioNaoLogadoDiv = document.getElementById('usuario-nao-logado');
const nomeUsuarioLogado = document.getElementById('nome-usuario-logado');
const emailUsuarioLogado = document.getElementById('email-usuario-logado');

// Formulários
const formLogin = document.getElementById('form-login-checkout');
const formRegistro = document.getElementById('form-registro-checkout');

// Campos de login
const emailLogin = document.getElementById('email-login');
const senhaLogin = document.getElementById('senha-login');
const btnLoginCheckout = document.getElementById('btn-login-checkout');

// Campos de registro
const nomeRegistro = document.getElementById('nome-registro');
const emailRegistro = document.getElementById('email-registro');
const senhaRegistro = document.getElementById('senha-registro');
const confirmarSenha = document.getElementById('confirmar-senha');
const btnRegistroCheckout = document.getElementById('btn-registro-checkout');

// Verificar carrinho e autenticação
document.addEventListener('DOMContentLoaded', () => {
  if (carrinho.itens.length === 0) {
    alert('Carrinho vazio!');
    window.location.href = 'index.html';
    return;
  }

  renderizarProdutos();
  atualizarResumo();
  verificarAutenticacao();
});

function renderizarProdutos() {
  produtosCheckout.innerHTML = '';

  carrinho.itens.forEach(item => {
    const div = document.createElement('div');
    div.className = 'produto-checkout';
    div.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <div class="produto-checkout-info">
        <div class="produto-checkout-nome">${item.nome}</div>
        <div class="produto-checkout-preco">
          ${item.quantidade}x R$ ${item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div style="font-weight: 700; text-align: right;">
        R$ ${(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>
    `;
    produtosCheckout.appendChild(div);
  });
}

function atualizarResumo() {
  const subtotal = carrinho.obterSubtotal();
  const frete = carrinho.obterFrete();
  const total = carrinho.obterTotal();

  document.getElementById('resumo-subtotal').textContent = `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('resumo-frete').textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('resumo-total').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function verificarAutenticacao() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');

  if (token && username) {
    // Usuário já está logado
    usuarioLogadoDiv.style.display = 'block';
    usuarioNaoLogadoDiv.style.display = 'none';
    nomeUsuarioLogado.textContent = username;
    emailUsuarioLogado.textContent = email || 'Não informado';

    // Configurar botão de finalizar
    btnFinalizar.addEventListener('click', finalizarCompra);
  } else {
    // Usuário não está logado
    usuarioLogadoDiv.style.display = 'none';
    usuarioNaoLogadoDiv.style.display = 'block';

    // Configurar botões de login/registro
    btnLoginCheckout.addEventListener('click', fazerLoginCheckout);
    btnRegistroCheckout.addEventListener('click', fazerRegistroCheckout);
  }
}

// FUNÇÕES DE AUTENTICAÇÃO
function mostrarLogin() {
  formLogin.style.display = 'block';
  formRegistro.style.display = 'none';
}

function mostrarRegistro() {
  formLogin.style.display = 'none';
  formRegistro.style.display = 'block';
}

function toggleForms() {
  if (formLogin.style.display === 'block') {
    mostrarRegistro();
  } else {
    mostrarLogin();
  }
}

async function fazerLoginCheckout() {
  const email = emailLogin.value.trim();
  const senha = senhaLogin.value;

  if (!email || !senha) {
    mostrarNotif('Preencha todos os campos', 'erro');
    return;
  }

  if (!email.includes('@gmail.com')) {
    mostrarNotif('Use um email Gmail válido', 'erro');
    return;
  }

  btnLoginCheckout.disabled = true;
  btnLoginCheckout.textContent = 'Entrando...';

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password: senha })
    });

    const data = await response.json();

    if (!response.ok) {
      mostrarNotif(data.mensagem || 'Erro ao fazer login', 'erro');
      return;
    }

    // Salvar token e dados
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    localStorage.setItem('email', data.email);

    mostrarNotif('Login realizado com sucesso!', 'sucesso');
    
    setTimeout(() => {
      verificarAutenticacao();
    }, 1000);
  } catch (erro) {
    mostrarNotif('Erro de conexão com o servidor', 'erro');
    console.error(erro);
  } finally {
    btnLoginCheckout.disabled = false;
    btnLoginCheckout.textContent = 'Entrar';
  }
}

async function fazerRegistroCheckout() {
  const nome = nomeRegistro.value.trim();
  const email = emailRegistro.value.trim();
  const senha = senhaRegistro.value;
  const confirmar = confirmarSenha.value;

  if (!nome || !email || !senha || !confirmar) {
    mostrarNotif('Preencha todos os campos', 'erro');
    return;
  }

  if (nome.length < 3) {
    mostrarNotif('Nome deve ter no mínimo 3 caracteres', 'erro');
    return;
  }

  if (!email.includes('@gmail.com')) {
    mostrarNotif('Use um email Gmail válido (exemplo@gmail.com)', 'erro');
    return;
  }

  if (senha.length < 6) {
    mostrarNotif('Senha deve ter no mínimo 6 caracteres', 'erro');
    return;
  }

  if (senha !== confirmar) {
    mostrarNotif('As senhas não coincidem', 'erro');
    return;
  }

  btnRegistroCheckout.disabled = true;
  btnRegistroCheckout.textContent = 'Criando conta...';

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: nome,
        email,
        password: senha
      })
    });

    const data = await response.json();

    if (!response.ok) {
      mostrarNotif(data.mensagem || 'Erro ao criar conta', 'erro');
      return;
    }

    // Salvar token e dados
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    localStorage.setItem('email', email);

    mostrarNotif('Conta criada com sucesso!', 'sucesso');
    
    setTimeout(() => {
      verificarAutenticacao();
    }, 1000);
  } catch (erro) {
    mostrarNotif('Erro de conexão com o servidor', 'erro');
    console.error(erro);
  } finally {
    btnRegistroCheckout.disabled = false;
    btnRegistroCheckout.textContent = 'Criar Conta';
  }
}

// FINALIZAR COMPRA
async function finalizarCompra() {
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');

  btnFinalizar.disabled = true;
  btnFinalizar.textContent = 'Processando...';

  // Simular processamento
  setTimeout(() => {
    // Gerar número do pedido
    const numeroPedido = 'PED-' + Date.now();
    const total = carrinho.obterTotal();

    // Pré-preencher modal
    document.getElementById('numero-pedido').textContent = numeroPedido;
    document.getElementById('confirmacao-usuario').textContent = username;
    document.getElementById('confirmacao-email').textContent = email;
    document.getElementById('confirmacao-total').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Salvar pedido
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push({
      numero: numeroPedido,
      usuario: username,
      email: email,
      itens: carrinho.itens,
      total: total,
      data: new Date().toLocaleString('pt-BR')
    });
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    // Limpar carrinho
    carrinho.limpar();

    // Mostrar modal
    mostrarModal();

    btnFinalizar.disabled = false;
    btnFinalizar.textContent = 'Finalizar Compra';
  }, 1500);
}

function mostrarNotif(msg, tipo = 'erro') {
  notificacao.textContent = msg;
  notificacao.className = `notificacao-checkout ativo`;

  setTimeout(() => {
    notificacao.className = 'notificacao-checkout';
  }, 4000);
}

function mostrarModal() {
  modalConfirmacao.classList.add('ativo');
}

function fecharModal() {
  modalConfirmacao.classList.remove('ativo');
}

function voltarCarrinho() {
  if (confirm('Deseja voltar? Os dados serão perdidos.')) {
    window.location.href = 'index.html';
  }
}

function voltarInicio() {
  window.location.href = 'index.html';
}

// Inicializar
mostrarRegistro(); // Mostrar formulário de registro por padrão