document.addEventListener('DOMContentLoaded', () => {
  /* ======== 🔐 Verifica se o usuário está logado ======== */
  if (!localStorage.getItem('usuarioLogado')) {
    window.location.href = '/html/cadastro.html';
    return;
  }
  /* ======== 🎠 Carrossel de produtos ======== */
document.querySelectorAll('.carrossel').forEach(carrossel => {
  const track = carrossel.querySelector('.carrossel-transicao');
  const cards = carrossel.querySelectorAll('.card');
  const prevBtn = carrossel.querySelector('.prev');
  const nextBtn = carrossel.querySelector('.next');

  // Se não há cards, sai
  if (!track || cards.length === 0) return;

  // Força visibilidade da faixa mesmo com poucos itens
  track.style.display = 'flex';
  track.style.justifyContent = cards.length <= 3 ? 'center' : 'start';
  track.style.transition = 'transform 0.5s ease-in-out';

  // Se poucos itens, esconde botões
  if (cards.length <= 3) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return; // sem movimento de carrossel, mas mostra tudo
  }

  // Movimento normal do carrossel
  let index = 0;
  const getCardWidth = () => cards[0].offsetWidth + 20;

  nextBtn?.addEventListener('click', () => {
    index = (index + 1) % cards.length;
    track.style.transform = `translateX(${-index * getCardWidth()}px)`;
  });

  prevBtn?.addEventListener('click', () => {
    index = (index - 1 + cards.length) % cards.length;
    track.style.transform = `translateX(${-index * getCardWidth()}px)`;
  });

  window.addEventListener('resize', () => {
    track.style.transform = `translateX(${-index * getCardWidth()}px)`;
  });
});


  /* ======== 🛒 Funções globais de carrinho ======== */
  function obterCarrinho() {
    try {
      return JSON.parse(localStorage.getItem('carrinho')) || [];
    } catch {
      return [];
    }
  }

  function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }

  function atualizarContadorCarrinho() {
    const contador = document.getElementById('cart-count');
    const carrinho = obterCarrinho();
    if (contador) {
      const totalItens = carrinho.reduce((acc, p) => acc + (p.qtd || 1), 0);
      contador.textContent = totalItens;
    }
  }

  function mostrarNotificacao(mensagem) {
    const notif = document.createElement('div');
    notif.textContent = mensagem;
    Object.assign(notif.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#333',
      color: '#fff',
      padding: '10px 15px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      fontWeight: '500',
      transition: 'opacity 0.5s, transform 0.3s',
      transform: 'translateY(20px)',
      opacity: '0',
      zIndex: '1000'
    });
    document.body.appendChild(notif);

    requestAnimationFrame(() => {
      notif.style.opacity = '1';
      notif.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateY(20px)';
      setTimeout(() => notif.remove(), 400);
    }, 2000);
  }

  // Torna acessível em outras páginas
  window.atualizarContadorCarrinho = atualizarContadorCarrinho;
  window.mostrarNotificacao = mostrarNotificacao;
  atualizarContadorCarrinho();

  /* ======== 🎠 Carrossel de produtos ======== */
  document.querySelectorAll('.carrossel').forEach(carrossel => {
    const track = carrossel.querySelector('.carrossel-transicao');
    const cards = carrossel.querySelectorAll('.card');
    const prevBtn = carrossel.querySelector('.prev');
    const nextBtn = carrossel.querySelector('.next');

    if (!track || cards.length === 0) return;

    let index = 0;
    const getCardWidth = () => cards[0].offsetWidth + 20;
    track.style.transition = 'transform 0.5s ease-in-out';

    nextBtn?.addEventListener('click', () => {
      index = (index + 1) % cards.length;
      track.style.transform = `translateX(${-index * getCardWidth()}px)`;
    });

    prevBtn?.addEventListener('click', () => {
      index = (index - 1 + cards.length) % cards.length;
      track.style.transform = `translateX(${-index * getCardWidth()}px)`;
    });

    window.addEventListener('resize', () => {
      track.style.transform = `translateX(${-index * getCardWidth()}px)`;
    });
  });

  /* ======== ➕ Adicionar ao carrinho ======== */
  document.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      if (!card) return;

      const produto = {
        nome: card.dataset.nome || 'Produto sem nome',
        preco: parseFloat(card.dataset.preco) || 0,
        img: card.dataset.img || '/img/placeholder.png',
        qtd: 1
      };

      const carrinho = obterCarrinho();
      carrinho.push(produto);
      salvarCarrinho(carrinho);

      atualizarContadorCarrinho();
      mostrarNotificacao(`${produto.nome} foi adicionado ao carrinho!`);
    });
  });

  /* ======== 🔗 Salvar produto clicado ======== */
  document.querySelectorAll('.produto-link').forEach(link => {
    link.addEventListener('click', e => {
      const card = e.target.closest('.card');
      if (!card) return;
      const produto = {
        nome: card.dataset.nome,
        preco: card.dataset.preco,
        img: card.dataset.img
      };
      localStorage.setItem('produtoSelecionado', JSON.stringify(produto));
    });
  });

  /* ======== 🔍 Filtro de busca ======== */
  const inputBusca = document.querySelector('.pesquisa input[type="search"]');
  if (inputBusca) {
    const secoes = document.querySelectorAll('.secao-produtos');
    let timeoutBusca = null;
    let ultimoTermo = "";

    inputBusca.addEventListener('input', () => {
      clearTimeout(timeoutBusca);
      timeoutBusca = setTimeout(() => {
        const termo = inputBusca.value.trim().toLowerCase();
        let encontrouAlgo = false;

        secoes.forEach(secao => {
          const cards = secao.querySelectorAll('.card');
          const carrossel = secao.querySelector('.carrossel');
          const track = secao.querySelector('.carrossel-transicao');
          let temVisivel = false;

          cards.forEach(card => {
            const nome = card.dataset.nome.toLowerCase();

            if (termo === "" || nome.includes(termo)) {
              card.style.display = 'block';
              requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
              });
              temVisivel = true;
              encontrouAlgo = true;
            } else {
              card.style.opacity = '0';
              card.style.transform = 'scale(0.95)';
              setTimeout(() => (card.style.display = 'none'), 200);
            }
          });

          // Oculta seções vazias
          secao.style.display = temVisivel ? 'block' : 'none';

          // Reset ao limpar busca
          if (termo === "" && ultimoTermo !== "" && track) {
            track.style.transition = 'transform 0.4s ease';
            track.style.transform = 'translateX(0)';
          }
        });

        // Mensagem de nenhum resultado
        let aviso = document.getElementById('nenhum-resultado');
        if (!encontrouAlgo && termo !== "") {
          if (!aviso) {
            aviso = document.createElement('div');
            aviso.id = 'nenhum-resultado';
            aviso.textContent = 'Nenhum produto encontrado 😔';
            Object.assign(aviso.style, {
              textAlign: 'center',
              color: '#555',
              fontSize: '1.2rem',
              marginTop: '30px'
            });
            document.body.appendChild(aviso);
          }
        } else if (aviso) {
          aviso.remove();
        }

        ultimoTermo = termo;
      }, 150);
    });

    // Impede recarregamento do form
    const form = document.querySelector('.pesquisa');
    form?.addEventListener('submit', e => e.preventDefault());
  }

  /* ======== 🔁 Atualiza contador ao retornar ======== */
  window.addEventListener('focus', atualizarContadorCarrinho);
});
