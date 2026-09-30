const currentUser = FoodLoop.requireAuth();
let onlyDonations = false;

if (currentUser) {
    FoodLoopUI.setupPage({ active: 'carrinho' });
    const items = FoodLoop.getCartDetails();
    if (items.length === 0) {
        window.location.replace('carrinhoCompra.html');
    } else {
        document.getElementById('address').value = `${currentUser.city} - ${currentUser.state}`;
        onlyDonations = items.every((item) => FoodLoop.isDonation(item.product));
        document.getElementById('paymentSection').hidden = onlyDonations;
        document.getElementById('donationNote').hidden = !onlyDonations;
        if (onlyDonations) {
            const button = document.getElementById('confirmOrderButton');
            button.classList.add('btn-amber');
            button.querySelector('.txt').textContent = 'Confirmar reserva';
        }
        renderOrderSummary(items);
        document.getElementById('checkoutForm').addEventListener('submit', finishOrder);
    }
}

function renderOrderSummary(items) {
    const container = document.getElementById('checkoutItems');
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    container.innerHTML = items.map((item) => {
        const donation = FoodLoop.isDonation(item.product);
        return `
            <div class="checkout-item">
                <span>${item.quantity} × ${FoodLoop.escapeHtml(item.product.nome)}</span>
                <strong class="${donation ? 'free' : ''}">${donation ? 'Grátis' : FoodLoop.formatCurrency(item.subtotal)}</strong>
            </div>`;
    }).join('');
    document.getElementById('checkoutTotal').textContent = total > 0 ? FoodLoop.formatCurrency(total) : 'Grátis';
}

function finishOrder(event) {
    event.preventDefault();
    const button = document.getElementById('confirmOrderButton');
    const label = button.querySelector('.txt');
    const message = document.getElementById('checkoutMessage');
    message.textContent = '';

    const address = document.getElementById('address').value;
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = onlyDonations ? 'Doação' : (selectedPayment ? selectedPayment.value : '');

    if (address.trim().length < 5) {
        message.textContent = 'Informe o endereço de entrega ou retirada.';
        document.getElementById('address').focus();
        return;
    }
    if (!paymentMethod) {
        message.textContent = 'Escolha uma forma de pagamento.';
        return;
    }

    const originalLabel = label.textContent;
    button.disabled = true;
    label.textContent = 'Confirmando...';

    try {
        const order = FoodLoop.createOrder({ address, paymentMethod });
        FoodLoopUI.updateCartBadges();
        document.getElementById('checkoutFlow').hidden = true;
        document.getElementById('orderId').textContent = order.id;
        document.getElementById('orderSuccess').hidden = false;
        window.scrollTo({ top: 0 });
    } catch (error) {
        message.textContent = error.message;
        button.disabled = false;
        label.textContent = originalLabel;
    }
}
