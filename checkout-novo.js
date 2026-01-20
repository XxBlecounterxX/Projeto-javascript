const API_URL = 'http://localhost:5000/api';

// Elementos
const produtosCheckout = document.getElementById('produtos-checkout');
const btnFinalizar = document.getElementById('btn-finalizar');
const notificacao = document.getElementById('notificacao-checkout');
const modalConfirmacao = document.getElementById('modal-confirmacao');

// Elementos de autenticação
const usuarioLogadoDiv = document.getElementById('usuario-logado');
const usuarioNaoLogadoDiv = document.getElementById('usuario-nao-logado');
const emailUsuarioLogado = document.getElementById('email-usuario-logado');

// Elementos de opções
const opcoesIniciais = document.getElementById('opcoes-iniciais');
const formLogin = document.getElementById('form-login-checkout');
const formRegistro = document.getElementById('form-registro-checkout');

// Campos de login
const emailLogin = document.getElementById('email-login');
const senhaLogin = document.getElementById('senha-login');
const btnLoginCheckout = document.getElementById('btn-login-checkout');

// Campos de registro
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
  configurarBotoes();
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
  const email = localStorage.getItem('email');

  if (email) {
    // Usuário já está logado
    usuarioLogadoDiv.style.display = 'block';
    usuarioNaoLogadoDiv.style.display = 'none';
    emailUsuarioLogado.textContent = email;

    // Configurar botão de finalizar
    btnFinalizar.addEventListener('click', finalizarCompra);
  } else {
    // Usuário não está logado
    usuarioLogadoDiv.style.display = 'none';
    usuarioNaoLogadoDiv.style.display = 'block';
  }
}

// CONFIGURAR TODOS OS BOTÕES - VERSÃO SIMPLIFICADA
function configurarBotoes() {
  console.log('Configurando botões...');
  
  // Botões das opções iniciais - USANDO ID
  const btnLoginInicial = document.querySelector('.btn-login');
  const btnRegistroInicial = document.querySelector('.btn-registro');
  
  if (btnLoginInicial) {
    console.log('Botão login encontrado');
    btnLoginInicial.addEventListener('click', mostrarLogin);
  } else {
    console.error('Botão login NÃO encontrado!');
  }
  
  if (btnRegistroInicial) {
    console.log('Botão registro encontrado');
    btnRegistroInicial.addEventListener('click', mostrarRegistro);
  } else {
    console.error('Botão registro NÃO encontrado!');
  }
  
  // Botão de login
  if (btnLoginCheckout) {
    console.log('Botão login checkout encontrado');
    btnLoginCheckout.addEventListener('click', fazerLoginCheckout);
  }
  
  // Botão de registro
  if (btnRegistroCheckout) {
    console.log('Botão registro checkout encontrado');
    btnRegistroCheckout.addEventListener('click', fazerRegistroCheckout);
  }
  
  // Botões de voltar
  const botoesVoltar = document.querySelectorAll('.btn-voltar');
  console.log(`Encontrados ${botoesVoltar.length} botões voltar`);
  
  botoesVoltar.forEach(btn => {
    btn.addEventListener('click', voltarOpcoes);
  });
}

// FUNÇÕES DE NAVEGAÇÃO
function mostrarLogin() {
  console.log('Mostrando login...');
  opcoesIniciais.style.display = 'none';
  formLogin.style.display = 'block';
  formRegistro.style.display = 'none';
}

function mostrarRegistro() {
  console.log('Mostrando registro...');
  opcoesIniciais.style.display = 'none';
  formLogin.style.display = 'none';
  formRegistro.style.display = 'block';
}

function voltarOpcoes() {
  console.log('Voltando para opções...');
  opcoesIniciais.style.display = 'block';
  formLogin.style.display = 'none';
  formRegistro.style.display = 'none';
}

// LOGIN
async function fazerLoginCheckout() {
  console.log('Fazendo login...');
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
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password: senha })
    });

    const data = await response.json();

    if (!data.sucesso) {
      mostrarNotif(data.mensagem || 'Erro ao fazer login', 'erro');
      return;
    }

    // Salvar dados
    localStorage.setItem('email', email);
    localStorage.setItem('usuario_id', data.usuario.id);

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

// REGISTRO
async function fazerRegistroCheckout() {
  console.log('Fazendo registro...');
  const email = emailRegistro.value.trim();
  const senha = senhaRegistro.value;
  const confirmar = confirmarSenha.value;

  if (!email || !senha || !confirmar) {
    mostrarNotif('Preencha todos os campos', 'erro');
    return;
  }

  if (!email.includes('@gmail.com')) {
    mostrarNotif('Use um email Gmail válido', 'erro');
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
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password: senha })
    });

    const data = await response.json();

    if (!data.sucesso) {
      mostrarNotif(data.mensagem || 'Erro ao criar conta', 'erro');
      return;
    }

    // Salvar dados
    localStorage.setItem('email', email);
    localStorage.setItem('usuario_id', data.usuario.id);

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
  console.log('Finalizando compra...');
  const email = localStorage.getItem('email');

  btnFinalizar.disabled = true;
  btnFinalizar.textContent = 'Processando...';

  try {
    const response = await fetch(`${API_URL}/pedidos/criar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuario_email: email,
        itens: carrinho.itens,
        total: carrinho.obterTotal()
      })
    });

    const data = await response.json();

    if (!data.sucesso) {
      mostrarNotif(data.mensagem || 'Erro ao criar pedido', 'erro');
      return;
    }

    // Pré-preencher modal
    document.getElementById('numero-pedido').textContent = data.pedido.numero;
    document.getElementById('confirmacao-email').textContent = email;
    document.getElementById('confirmacao-total').textContent = `R$ ${data.pedido.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Limpar carrinho
    carrinho.limpar();

    // Mostrar modal
    mostrarModal();
  } catch (erro) {
    mostrarNotif('Erro de conexão com o servidor', 'erro');
    console.error(erro);
  } finally {
    btnFinalizar.disabled = false;
    btnFinalizar.textContent = 'Finalizar Compra';
  }
}

function mostrarNotif(msg, tipo = 'erro') {
  notificacao.textContent = msg;
  notificacao.className = `notificacao-checkout ${tipo}`;

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
voltarOpcoes();