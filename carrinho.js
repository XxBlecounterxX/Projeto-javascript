const carrinho = {
  itens: JSON.parse(localStorage.getItem('carrinho')) || [],

  adicionar(produto) {
    const existe = this.itens.find(item => item.id === produto.id);
    if (existe) {
      existe.quantidade++;
    } else {
      this.itens.push({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem,
        quantidade: 1
      });
    }
    this.salvar();
  },

  remover(id) {
    this.itens = this.itens.filter(item => item.id !== id);
    this.salvar();
  },

  atualizarQuantidade(id, quantidade) {
    const item = this.itens.find(i => i.id === id);
    if (item) {
      item.quantidade = Math.max(1, quantidade);
      this.salvar();
    }
  },

  obterSubtotal() {
    return this.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  },

  obterFrete() {
    const subtotal = this.obterSubtotal();
    return subtotal >= 1500 ? 0 : 50;
  },

  obterTotal() {
    return this.obterSubtotal() + this.obterFrete();
  },

  salvar() {
    localStorage.setItem('carrinho', JSON.stringify(this.itens));
  },

  limpar() {
    this.itens = [];
    this.salvar();
  }
};

const wishlist = {
  itens: JSON.parse(localStorage.getItem('wishlist')) || [],

  adicionar(id) {
    if (!this.itens.includes(id)) {
      this.itens.push(id);
      this.salvar();
    }
  },

  remover(id) {
    this.itens = this.itens.filter(item => item !== id);
    this.salvar();
  },

  toggle(id) {
    if (this.tem(id)) {
      this.remover(id);
    } else {
      this.adicionar(id);
    }
  },

  tem(id) {
    return this.itens.includes(id);
  },

  salvar() {
    localStorage.setItem('wishlist', JSON.stringify(this.itens));
  }
};

// MODAL DO CARRINHO
const modalCarrinho = document.getElementById('modal-carrinho');
const btnCarrinho = document.getElementById('carrinho-btn');
const fecharModal = document.getElementById('fechar-modal');

btnCarrinho.addEventListener('click', abrirCarrinho);
fecharModal.addEventListener('click', fecharCarrinho);
modalCarrinho.addEventListener('click', (e) => {
  if (e.target === modalCarrinho) fecharCarrinho();
});

function abrirCarrinho() {
  modalCarrinho.classList.add('ativo');
  renderizarCarrinho();
}

function fecharCarrinho() {
  modalCarrinho.classList.remove('ativo');
}

function renderizarCarrinho() {
  const container = document.getElementById('carrinho-itens');
  const vazio = document.getElementById('carrinho-vazio');
  const resumo = document.getElementById('resumo-carrinho');

  container.innerHTML = '';

  if (carrinho.itens.length === 0) {
    vazio.style.display = 'block';
    resumo.style.display = 'none';
    return;
  }

  vazio.style.display = 'none';
  resumo.style.display = 'block';

  carrinho.itens.forEach(item => {
    const div = document.createElement('div');
    div.className = 'carrinho-item';
    div.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <div class="carrinho-item-info">
        <div class="carrinho-item-nome">${item.nome}</div>
        <div class="carrinho-item-preco">R$ ${item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="carrinho-item-controle">
          <button data-id="${item.id}" class="btn-menos">−</button>
          <span style="min-width: 30px; text-align: center;">${item.quantidade}</span>
          <button data-id="${item.id}" class="btn-mais">+</button>
          <button data-id="${item.id}" class="carrinho-item-remover">🗑️</button>
        </div>
      </div>
    `;

    div.querySelector('.btn-menos').addEventListener('click', () => {
      carrinho.atualizarQuantidade(item.id, item.quantidade - 1);
      renderizarCarrinho();
    });

    div.querySelector('.btn-mais').addEventListener('click', () => {
      carrinho.atualizarQuantidade(item.id, item.quantidade + 1);
      renderizarCarrinho();
    });

    div.querySelector('.carrinho-item-remover').addEventListener('click', () => {
      carrinho.remover(item.id);
      mostrarNotificacao(`${item.nome} removido do carrinho`, 'aviso');
      renderizarCarrinho();
    });

    container.appendChild(div);
  });

  // Atualizar resumo
  const subtotal = carrinho.obterSubtotal();
  const frete = carrinho.obterFrete();
  const total = carrinho.obterTotal();

  document.getElementById('subtotal').textContent = `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('frete').textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('total').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // Botão checkout
  document.getElementById('btn-checkout').addEventListener('click', () => {
    mostrarNotificacao('Redirecionando para checkout...', 'sucesso');
    setTimeout(() => {
      alert('Checkout integrado\n\nEm um projeto real, isso levaria você para uma página de pagamento com Stripe/PayPal.');
    }, 1000);
  });
}

function atualizarContadorCarrinho() {
  const count = document.getElementById('carrinho-count');
  const total = carrinho.itens.reduce((sum, item) => sum + item.quantidade, 0);

  if (total > 0) {
    count.textContent = total;
    count.style.display = 'flex';
  } else {
    count.style.display = 'none';
  }
}

function mostrarNotificacao(msg, tipo = 'sucesso') {
  const container = document.getElementById('notificacoes');
  const notif = document.createElement('div');
  notif.className = `notificacao ${tipo}`;
  notif.textContent = msg;
  container.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Atualizar contador ao carregar
document.addEventListener('DOMContentLoaded', atualizarContadorCarrinho);