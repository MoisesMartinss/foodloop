const currentUser = FoodLoop.requireAuth();

if (currentUser) {
    FoodLoopUI.setupPage({ active: 'explorar' });

    const productId = new URLSearchParams(window.location.search).get('id');
    const product = productId ? FoodLoop.getProductById(productId) : null;

    if (!product) {
        document.querySelector('.product-layout').outerHTML = FoodLoopUI.emptyState({
            iconName: 'package',
            title: productId ? 'Anúncio não encontrado' : 'Nenhum anúncio selecionado',
            text: 'Ele pode ter sido removido. Que tal ver outros alimentos disponíveis?',
            action: '<a class="btn btn-primary" href="../paginaInicial/paginaInicial.html">Ir para a vitrine</a>'
        });
    } else {
        renderProduct(product);
        renderRelated(product);
    }
}

function renderProduct(product) {
    const ui = FoodLoopUI;
    const donation = FoodLoop.isDonation(product);
    const sellerUrl = `../perfilCliente/perfilCliente.html?vendedor=${encodeURIComponent(product.vendedor.nome)}`;

    document.title = `${product.nome} · FoodLoop`;

    const image = document.getElementById('produtoImagem');
    image.src = product.imagem;
    image.alt = product.nome;
    image.onerror = () => { image.onerror = null; image.src = '../fotos/placeholder-produto.svg'; };

    document.getElementById('mediaBadges').innerHTML = ui.typeBadge(product);
    document.getElementById('produtoBadges').innerHTML = [
        ui.expiryBadge(product.validade),
        product.delivery === 'sim'
            ? `<span class="badge badge-green">${ui.icon('truck')}Com entrega</span>`
            : `<span class="badge">${ui.icon('store')}Retirada no local</span>`
    ].join('');

    document.getElementById('produtoNome').textContent = product.nome;
    document.getElementById('produtoMarca').textContent = product.marca;

    document.getElementById('precoLabel').textContent = donation ? 'Doação' : 'Preço por unidade';
    const price = document.getElementById('produtoPreco');
    price.textContent = donation ? 'Grátis' : FoodLoop.formatCurrency(product.preco);
    price.classList.toggle('is-free', donation);
    document.querySelector('.price-row').classList.toggle('is-donation', donation);

    document.getElementById('produtoCidade').textContent = product.cidade;
    document.getElementById('produtoEstado').textContent = product.estado;
    document.getElementById('produtoDelivery').textContent = product.delivery === 'sim'
        ? 'O anunciante faz entrega'
        : 'Retirada com o anunciante';

    const days = ui.daysUntil(product.validade);
    let validityText = FoodLoop.formatDate(product.validade);
    if (days !== null && days >= 0 && days <= 30) validityText += ` (${days === 0 ? 'hoje' : `em ${days} ${days === 1 ? 'dia' : 'dias'}`})`;
    document.getElementById('produtoValidade').textContent = validityText;

    // Anunciante
    document.getElementById('sellerAvatar').textContent = ui.initials(product.vendedor.nome);
    const sellerLink = document.getElementById('vendedorLink');
    sellerLink.textContent = product.vendedor.nome;
    sellerLink.href = sellerUrl;
    document.getElementById('sellerCity').textContent = `${product.vendedor.cidade} - ${product.vendedor.estado}`;
    document.getElementById('messageLink').href = `${sellerUrl}#mensagem`;

    // Compra / reserva
    const isOwner = product.vendedor.id === currentUser.id;
    if (isOwner) {
        document.getElementById('buyBox').hidden = true;
        document.getElementById('ownNote').hidden = false;
        document.getElementById('messageLink').hidden = true;
        return;
    }

    let quantity = 1;
    const maxQuantity = 10;
    const qtyValue = document.getElementById('qtyValue');
    const minus = document.getElementById('qtyMinus');
    const plus = document.getElementById('qtyPlus');
    const syncQty = () => {
        qtyValue.textContent = quantity;
        minus.disabled = quantity <= 1;
        plus.disabled = quantity >= maxQuantity;
    };
    minus.addEventListener('click', () => { quantity = Math.max(1, quantity - 1); syncQty(); });
    plus.addEventListener('click', () => { quantity = Math.min(maxQuantity, quantity + 1); syncQty(); });
    syncQty();

    const button = document.getElementById('comprarButton');
    if (donation) {
        button.classList.remove('btn-primary');
        button.classList.add('btn-amber');
        button.querySelector('.txt').textContent = 'Quero esta doação';
    }

    button.addEventListener('click', function () {
        FoodLoop.addToCart(product.id, quantity);
        ui.updateCartBadges();
        ui.toast(donation ? 'Doação adicionada ao carrinho' : 'Adicionado ao carrinho');
        button.querySelector('.txt').textContent = 'Ver carrinho';
        button.onclick = null;
        button.addEventListener('click', () => {
            window.location.href = '../carrinhoCompra/carrinhoCompra.html';
        }, { once: true });
    }, { once: true });
}

function renderRelated(product) {
    const related = FoodLoop.getProducts()
        .filter((candidate) => candidate.id !== product.id)
        .filter((candidate) => {
            const days = FoodLoopUI.daysUntil(candidate.validade);
            return days === null || days >= 0;
        })
        .sort((a, b) => {
            const score = (candidate) =>
                (candidate.estado === product.estado ? 2 : 0) +
                (FoodLoop.isDonation(candidate) === FoodLoop.isDonation(product) ? 1 : 0);
            return score(b) - score(a);
        })
        .slice(0, 4);

    if (related.length === 0) return;
    const grid = document.getElementById('relatedGrid');
    related.forEach((item) => grid.appendChild(FoodLoopUI.productCard(item)));
    document.getElementById('relatedSection').hidden = false;
}
