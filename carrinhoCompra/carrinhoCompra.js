const currentUser = FoodLoop.requireAuth();

if (currentUser) {
    FoodLoopUI.setupPage({ active: 'carrinho' });
    document.getElementById('checkoutButton').addEventListener('click', function () {
        if (FoodLoop.getCartDetails().length === 0) return;
        window.location.href = 'checkout.html';
    });
    renderCart();
}

function renderCart() {
    const ui = FoodLoopUI;
    const e = FoodLoop.escapeHtml;
    const container = document.getElementById('carrinhoItems');
    const layout = document.getElementById('cartLayout');
    const items = FoodLoop.getCartDetails();

    ui.updateCartBadges();
    container.innerHTML = '';

    if (items.length === 0) {
        layout.classList.add('is-empty');
        document.getElementById('cartSubtitle').textContent = 'Nada por aqui ainda.';
        document.getElementById('checkoutButton').disabled = true;
        container.innerHTML = ui.emptyState({
            iconName: 'cart',
            title: 'Seu carrinho está vazio',
            text: 'Explore a vitrine e encontre alimentos à venda ou para doação perto de você.',
            action: '<a class="btn btn-primary" href="../paginaInicial/paginaInicial.html">Explorar alimentos</a>'
        });
        return;
    }

    layout.classList.remove('is-empty');
    document.getElementById('checkoutButton').disabled = false;

    let total = 0;
    let saleTotal = 0;
    let donationCount = 0;
    let count = 0;

    items.forEach((item) => {
        const product = item.product;
        const donation = FoodLoop.isDonation(product);
        total += item.subtotal;
        count += item.quantity;
        if (donation) donationCount += item.quantity; else saleTotal += item.subtotal;

        const url = `../comprarProduto/comprarProduto.html?id=${encodeURIComponent(product.id)}`;
        const row = document.createElement('article');
        row.className = 'cart-item';
        row.innerHTML = `
            <a class="thumb" href="${url}"><img src="${e(product.imagem)}" alt="" onerror="this.onerror=null;this.src='../fotos/placeholder-produto.svg'"></a>
            <div class="info">
                <h3><a href="${url}">${e(product.nome)}</a></h3>
                <span class="muted">${e(product.vendedor.nome)} · ${e(product.cidade)} - ${e(product.estado)}</span>
                <div class="badges">
                    ${ui.typeBadge(product)}
                    ${ui.expiryBadge(product.validade)}
                </div>
            </div>
            <div class="side">
                <span class="subtotal ${donation ? 'is-free' : ''}">${donation ? 'Grátis' : FoodLoop.formatCurrency(item.subtotal)}</span>
                <div class="item-actions">
                    <div class="qty-stepper" aria-label="Quantidade de ${e(product.nome)}">
                        <button type="button" data-action="minus" aria-label="Diminuir" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                        <output>${item.quantity}</output>
                        <button type="button" data-action="plus" aria-label="Aumentar" ${item.quantity >= 10 ? 'disabled' : ''}>+</button>
                    </div>
                    <button type="button" class="icon-btn remove-button" aria-label="Remover ${e(product.nome)}" title="Remover">${ui.icon('trash')}</button>
                </div>
            </div>
        `;

        row.querySelector('[data-action="minus"]').addEventListener('click', () => {
            FoodLoop.updateCartItem(product.id, item.quantity - 1);
            renderCart();
        });
        row.querySelector('[data-action="plus"]').addEventListener('click', () => {
            FoodLoop.updateCartItem(product.id, item.quantity + 1);
            renderCart();
        });
        row.querySelector('.remove-button').addEventListener('click', () => {
            FoodLoop.removeFromCart(product.id);
            ui.toast('Item removido do carrinho', 'trash');
            renderCart();
        });

        container.appendChild(row);
    });

    document.getElementById('cartSubtitle').textContent =
        `${count} ${count === 1 ? 'item' : 'itens'} no carrinho.`;
    document.getElementById('summaryCount').textContent = count;
    document.getElementById('summarySale').textContent = FoodLoop.formatCurrency(saleTotal);
    document.getElementById('summaryDonation').textContent = donationCount > 0
        ? `${donationCount} · Grátis`
        : '—';
    document.getElementById('total').textContent = total > 0 ? FoodLoop.formatCurrency(total) : 'Grátis';
    document.getElementById('total').classList.toggle('is-free', total === 0);
    document.getElementById('checkoutButton').classList.toggle('btn-amber', total === 0);
}
