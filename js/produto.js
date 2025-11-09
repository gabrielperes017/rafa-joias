// Carrega o produto salvo no localStorage
const produto = JSON.parse(localStorage.getItem('produtoSelecionado'));
// Exemplo de função para clicar no produto e abrir detalhes
function abrirDetalhes(produto) {
  localStorage.setItem('produtoSelecionado', JSON.stringify(produto));
  window.location.href = 'produto.html';
}

function gerarDesconto() {
  return Math.floor(Math.random() * (30 - 5 + 1)) + 5;
}

if (produto) {
  const precoAtual = Number(produto.preco);
  const desconto = gerarDesconto();
  const precoAntigo = (precoAtual / (1 - desconto / 100)).toFixed(2);

  document.getElementById('img-produto').src = produto.img;
  document.getElementById('img-produto').alt = produto.nome;
  document.getElementById('nome-produto').textContent = produto.nome.toUpperCase();
  document.querySelector('.preco-atual').textContent = `R$ ${precoAtual.toFixed(2).replace('.', ',')}`;
  document.querySelector('.preco-antigo').textContent = `R$ ${precoAntigo.replace('.', ',')}`;
  document.querySelector('.desconto').textContent = `${desconto}% OFF`;
} else {
  alert('Nenhum produto selecionado!');
  // Você pode redirecionar para a lista de produtos, se quiser:
  // window.location.href = 'produtos.html';
}

// ====== Adicionar ao Carrinho ======
document.querySelector('.btn-sacola').addEventListener('click', () => {
  if (!produto) return;

  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  // Verifica se o produto já está no carrinho
  const indexProduto = carrinho.findIndex(item => item.nome === produto.nome);

  if (indexProduto > -1) {
    // Se já existe, incrementa a quantidade
    carrinho[indexProduto].qtd += 1;
  } else {
    // Caso contrário, adiciona novo item
    const produtoAdicionado = {
      nome: produto.nome,
      preco: Number(produto.preco),
      img: produto.img,
      qtd: 1
    };
    carrinho.push(produtoAdicionado);
  }

  localStorage.setItem('carrinho', JSON.stringify(carrinho));

  // Atualiza contador global, caso exista essa função
  if (typeof atualizarContadorCarrinho === 'function') {
    atualizarContadorCarrinho();
  }

  // Animação leve no botão
  const btn = document.querySelector('.btn-sacola');
  btn.classList.add('clicado');
  setTimeout(() => btn.classList.remove('clicado'), 200);

  // Notificação discreta
  const notif = document.createElement('div');
  notif.classList.add('notificacao');
  notif.textContent = `${produto.nome} foi adicionado à sacola!`;
  document.body.appendChild(notif);

  setTimeout(() => notif.classList.add('mostrar'), 50);
  setTimeout(() => notif.classList.remove('mostrar'), 2000);
  setTimeout(() => notif.remove(), 2400);
});
