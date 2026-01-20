const produtos = [
  {
    id: 1,
    nome: "Speedster 900",
    tipo: "speed",
    descricao: "Aro 700c • Alumínio leve • Freios hidráulicos",
    preco: 3499,
    imagem: "Speedster900.jfif",
    parcelado: "10x sem juros",
    avaliacao: 4.8,
    avaliacoes: 125,
    novo: true
  },
  
  {
    id: 2,
    nome: "Mountain Extreme",
    tipo: "mountain",
    descricao: "Aro 29 • Suspensão full • Freios a disco",
    preco: 4299,
    imagem: "Mountain Extreme.jfif",
    parcelado: "12x sem juros",
    avaliacao: 4.9,
    avaliacoes: 98,
    novo: true
  },
  {
    id: 3,
    nome: "Urban Pro",
    tipo: "urbana",
    descricao: "Aro 26 • Leve e prático • Ideal para cidade",
    preco: 1899,
    imagem: "UrbanPro.jfif",
    parcelado: "6x sem juros",
    avaliacao: 4.6,
    avaliacoes: 87,
    novo: false
  },
  {
    id: 4,
    nome: "E-Bike Smart",
    tipo: "electrica",
    descricao: "Motor 750W • Bateria 40km • Freios regenerativos",
    preco: 5899,
    imagem: "E-Bike Smart.jfif",
    parcelado: "15x sem juros",
    avaliacao: 4.7,
    avaliacoes: 156,
    novo: true
  },
  {
    id: 5,
    nome: "Gravel Adventure",
    tipo: "mountain",
    descricao: "Aro 700c • Pneus 45mm • Câmbio 1x12",
    preco: 2799,
    imagem: "Gravel Adventure.jfif",
    parcelado: "8x sem juros",
    avaliacao: 4.5,
    avaliacoes: 64,
    novo: false
  },
  {
    id: 6,
    nome: "Fixie Urbano",
    tipo: "urbana",
    descricao: "Aro 700c • Pegada fixa • Design minimalista",
    preco: 1299,
    imagem: "Fixie Urbano.jfif",
    parcelado: "4x sem juros",
    avaliacao: 4.4,
    avaliacoes: 45,
    novo: false
  },
  {
    id: 7,
    nome: "Speed Carbon",
    tipo: "speed",
    descricao: "Quadro carbono • Peso 6kg • Rodas aero",
    preco: 7999,
    imagem: "Speed Carbon.webp",
    parcelado: "18x sem juros",
    avaliacao: 5,
    avaliacoes: 203,
    novo: true
  },
  {
    id: 8,
    nome: "BMX Pro",
    tipo: "mountain",
    descricao: "Aro 20 • Freios rotor • Pneus motocross",
    preco: 899,
    imagem: "BMX Pro.jfif",
    parcelado: "3x sem juros",
    avaliacao: 4.3,
    avaliacoes: 32,
    novo: false
  }
];

function renderProdutos(produtosFiletrados = produtos) {
  const grid = document.getElementById('products-grid');
  const semResultados = document.getElementById('sem-resultados');
  const resultadosTexto = document.getElementById('resultados-texto');

  grid.innerHTML = '';

  if (produtosFiletrados.length === 0) {
    grid.style.display = 'none';
    semResultados.style.display = 'block';
    resultadosTexto.textContent = 'Nenhum produto encontrado';
    return;
  }

  grid.style.display = 'grid';
  semResultados.style.display = 'none';
  resultadosTexto.textContent = `${produtosFiletrados.length} produto(s) encontrado(s)`;

  produtosFiletrados.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${produto.novo ? '<div style="position: absolute; top: 20px; right: 20px; background: var(--accent); color: #042018; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;">NOVO</div>' : ''}
      <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
      <h3>${produto.nome}</h3>
      <p>${produto.descricao}</p>
      
      <div style="display: flex; gap: 4px; align-items: center; margin: 8px 0; font-size: 13px;">
        <span style="color: var(--accent);">★ ${produto.avaliacao}</span>
        <span style="color: var(--muted);">(${produto.avaliacoes})</span>
      </div>

      <div class="price-row">
        <div>
          <div class="price">R$ ${produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div style="font-size:13px;color:var(--muted)">${produto.parcelado}</div>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn-comprar" data-id="${produto.id}">Comprar</button>
        <button class="btn-wishlist" data-id="${produto.id}">❤️</button>
      </div>
    `;

    // Evento de adicionar ao carrinho
    card.querySelector('.btn-comprar').addEventListener('click', (e) => {
      e.stopPropagation();
      carrinho.adicionar(produto);
      mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`, 'sucesso');
      atualizarContadorCarrinho();
    });

    // Evento de wishlist
    card.querySelector('.btn-wishlist').addEventListener('click', (e) => {
      e.stopPropagation();
      wishlist.toggle(produto.id);
      atualizarWishlist();
    });

    grid.appendChild(card);
  });

  // Atualizar estilo do wishlist
  atualizarWishlist();
}

function atualizarWishlist() {
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    if (wishlist.tem(id)) {
      btn.classList.add('ativo');
    } else {
      btn.classList.remove('ativo');
    }
  });
}

// Renderizar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  renderProdutos();
});