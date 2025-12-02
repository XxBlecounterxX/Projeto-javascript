// Elementos
const produtosCheckout = document.getElementById('produtos-checkout');
const btnFinalizar = document.getElementById('btn-finalizar');
const notificacao = document.getElementById('notificacao-checkout');
const modalConfirmacao = document.getElementById('modal-confirmacao');

// Campos
const nomeUsuario = document.getElementById('nome-usuario');
const emailGmail = document.getElementById('email-gmail');
const senha = document.getElementById('senha');

// Verificar carrinho
document.addEventListener('DOMContentLoaded', () => {
  if (carrinho.itens.length === 0) {
    alert('Carrinho vazio!');
    window.location.href = 'index.html';
    return;
  }

  renderizarProdutos();
  atualizarResumo();
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

// VALIDAR
function validar() {
  if (!nomeUsuario.value.trim()) {
    mostrarNotif('Nome de usuário é obrigatório', 'erro');
    nomeUsuario.focus();
    return false;
  }

  if (nomeUsuario.value.trim().length < 3) {
    mostrarNotif('Nome deve ter no mínimo 3 caracteres', 'erro');
    nomeUsuario.focus();
    return false;
  }

  if (!emailGmail.value.trim()) {
    mostrarNotif('Email é obrigatório', 'erro');
    emailGmail.focus();
    return false;
  }

  if (!emailGmail.value.includes('@gmail.com')) {
    mostrarNotif('Use um email Gmail válido (exemplo@gmail.com)', 'erro');
    emailGmail.focus();
    return false;
  }

  if (!senha.value) {
    mostrarNotif('Senha é obrigatória', 'erro');
    senha.focus();
    return false;
  }

  if (senha.value.length < 6) {
    mostrarNotif('Senha deve ter no mínimo 6 caracteres', 'erro');
    senha.focus();
    return false;
  }

  return true;
}

// FINALIZAR COMPRA
btnFinalizar.addEventListener('click', () => {
  if (!validar()) {
    return;
  }

  btnFinalizar.disabled = true;
  btnFinalizar.textContent = 'Processando...';

  // Simular processamento
  setTimeout(() => {
    // Gerar número do pedido
    const numeroPedido = 'PED-' + Date.now();
    const total = carrinho.obterTotal();

    // Pré-preencher modal
    document.getElementById('numero-pedido').textContent = numeroPedido;
    document.getElementById('confirmacao-email').textContent = emailGmail.value;
    document.getElementById('confirmacao-total').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Salvar pedido
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push({
      numero: numeroPedido,
      usuario: nomeUsuario.value,
      email: emailGmail.value,
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
});

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