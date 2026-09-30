const currentUser = FoodLoop.requireAuth();
const e = FoodLoop.escapeHtml;
const ui = window.FoodLoopUI;

if (currentUser) {
    const sellerName = new URLSearchParams(window.location.search).get('vendedor');
    const seller = sellerName ? FoodLoop.findSellerByName(sellerName) : null;
    const isOwn = !sellerName || (seller && seller.id === currentUser.id);

    ui.setupPage({ active: isOwn ? 'perfil' : 'explorar' });

    if (sellerName && !seller) {
        document.querySelector('.perfil-container').innerHTML = ui.emptyState({
            iconName: 'user',
            title: 'Anunciante não encontrado',
            text: 'Talvez ele não tenha mais anúncios ativos.',
            action: '<a class="btn btn-primary" href="../paginaInicial/paginaInicial.html">Voltar para a vitrine</a>'
        });
    } else if (isOwn) {
        renderCurrentUserProfile(currentUser);
    } else {
        renderSellerProfile(seller);
    }
}

function infoItem(iconName, label, value) {
    return `
        <li>
            <span class="ic">${ui.icon(iconName)}</span>
            <div><span class="k">${label}</span><span class="v">${value}</span></div>
        </li>`;
}

function productGrid(products, emptyOptions) {
    if (products.length === 0) return ui.emptyState(emptyOptions);
    return '<div class="product-grid" data-grid></div>';
}

function fillGrid(root, products) {
    const grid = root.querySelector('[data-grid]');
    if (grid) products.forEach((product) => grid.appendChild(ui.productCard(product)));
}

/* ---------- Perfil do anunciante ---------- */
function renderSellerProfile(seller) {
    document.title = `${seller.nome} · FoodLoop`;
    const products = FoodLoop.getProductsBySeller(seller.id);
    const donations = products.filter(FoodLoop.isDonation).length;
    const container = document.querySelector('.perfil-container');

    container.innerHTML = `
        <a class="back-link" href="javascript:history.back()">${ui.icon('arrowLeft')}Voltar</a>

        <section class="card profile-head">
            <div class="profile-cover"></div>
            <div class="profile-body">
                <span class="avatar avatar-lg">${e(ui.initials(seller.nome))}</span>
                <div class="profile-id">
                    <h1>${e(seller.nome)}</h1>
                    <div class="badges">
                        <span class="badge">${ui.icon('pin')}${e(seller.cidade)} - ${e(seller.estado)}</span>
                        ${donations > 0 ? `<span class="badge badge-donation">${ui.icon('heart')}Doador</span>` : ''}
                    </div>
                </div>
                <div class="profile-actions">
                    <a class="btn btn-primary" href="#mensagem" id="enviarMensagem">${ui.icon('message')}Enviar mensagem</a>
                </div>
            </div>
        </section>

        <div class="profile-grid">
            <aside>
                <div class="stats-row">
                    <div><strong>${products.length}</strong><span>anúncios</span></div>
                    <div><strong>${products.length - donations}</strong><span>à venda</span></div>
                    <div><strong>${donations}</strong><span>doações</span></div>
                </div>
                <div class="card side-card">
                    <h2>Contato</h2>
                    <ul class="info-list">
                        ${infoItem('phone', 'Telefone', e(seller.telefone))}
                        ${infoItem('pin', 'Cidade', `${e(seller.cidade)} - ${e(seller.estado)}`)}
                    </ul>
                </div>
                <form id="mensagemForm" class="card message-card">
                    <h2 id="mensagem" style="font-size:1.05rem">Mandar uma mensagem</h2>
                    <label for="mensagemTexto" class="label">Sua mensagem</label>
                    <textarea id="mensagemTexto" class="textarea" rows="4" maxlength="500" placeholder="Olá! O alimento ainda está disponível?" required></textarea>
                    <button type="submit" class="btn btn-primary btn-block">${ui.icon('send')}Enviar</button>
                    <p id="mensagemStatus" class="form-message" role="status"></p>
                </form>
            </aside>

            <section>
                <div class="tabs"><span class="tab is-active">${ui.icon('package')}Anúncios <span class="count">${products.length}</span></span></div>
                ${productGrid(products, { iconName: 'package', title: 'Nenhum anúncio ativo', text: 'Este anunciante não tem alimentos disponíveis no momento.' })}
            </section>
        </div>
    `;
    fillGrid(container, products);

    const form = document.getElementById('mensagemForm');
    const status = document.getElementById('mensagemStatus');
    document.getElementById('enviarMensagem').addEventListener('click', (event) => {
        event.preventDefault();
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('mensagemTexto').focus({ preventScroll: true });
    });
    if (window.location.hash === '#mensagem') {
        window.setTimeout(() => document.getElementById('mensagemTexto').focus(), 150);
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            FoodLoop.sendMessage(seller, document.getElementById('mensagemTexto').value);
            status.textContent = 'Mensagem enviada! O anunciante vai receber em breve.';
            status.className = 'form-message success';
            document.getElementById('mensagemTexto').value = '';
        } catch (error) {
            status.textContent = error.message;
            status.className = 'form-message error';
        }
    });
}

/* ---------- Meu perfil ---------- */
function renderCurrentUserProfile(user) {
    document.title = 'Meu perfil · FoodLoop';
    const orders = FoodLoop.getOrdersForCurrentUser().slice().reverse();
    const products = FoodLoop.getProductsBySeller(user.id);
    const donations = products.filter(FoodLoop.isDonation).length;
    const isCompany = user.accountType === 'pj';

    const ordersHtml = orders.length === 0
        ? ui.emptyState({
            iconName: 'receipt',
            title: 'Você ainda não fez pedidos',
            text: 'Quando comprar ou reservar uma doação, ela aparece aqui.',
            action: '<a class="btn btn-secondary" href="../paginaInicial/paginaInicial.html">Explorar alimentos</a>'
        })
        : `<div class="orders-list">${orders.map((order) => `
            <article class="order-card">
                <span class="ic">${ui.icon('receipt')}</span>
                <div class="main">
                    <strong>Pedido ${e(order.id)}</strong>
                    <span>${new Date(order.createdAt).toLocaleDateString('pt-BR')} · ${order.items.reduce((sum, item) => sum + item.quantity, 0)} ${order.items.length === 1 && order.items[0].quantity === 1 ? 'item' : 'itens'} · ${e(order.paymentMethod)}</span>
                </div>
                <div class="right">
                    <strong>${order.total > 0 ? FoodLoop.formatCurrency(order.total) : 'Grátis'}</strong>
                    <span class="badge badge-green">${ui.icon('check')}${e(order.status)}</span>
                </div>
            </article>`).join('')}</div>`;

    const container = document.querySelector('.perfil-container');
    container.innerHTML = `
        <section class="card profile-head">
            <div class="profile-cover"></div>
            <div class="profile-body">
                <span class="avatar avatar-lg">${e(ui.initials(user.fullName))}</span>
                <div class="profile-id">
                    <h1>${e(user.fullName)}</h1>
                    <div class="badges">
                        <span class="badge badge-green">${ui.icon(isCompany ? 'building' : 'user')}${isCompany ? 'Empresa' : 'Pessoa física'}</span>
                        <span class="badge">${ui.icon('pin')}${e(user.city)} - ${e(user.state)}</span>
                        ${donations > 0 ? `<span class="badge badge-donation">${ui.icon('heart')}Doador</span>` : ''}
                    </div>
                </div>
                <div class="profile-actions">
                    <a class="btn btn-primary" href="../cadastroProduto/cadastroProduto.html">${ui.icon('plus')}Novo anúncio</a>
                </div>
            </div>
        </section>

        <div class="profile-grid">
            <aside>
                <div class="stats-row">
                    <div><strong>${products.length}</strong><span>anúncios</span></div>
                    <div><strong>${donations}</strong><span>doações</span></div>
                    <div><strong>${orders.length}</strong><span>pedidos</span></div>
                </div>
                <div class="card side-card">
                    <h2>Meus dados</h2>
                    <ul class="info-list">
                        ${infoItem('mail', 'E-mail', e(user.email))}
                        ${infoItem('phone', 'Telefone', e(user.phone))}
                        ${infoItem('pin', 'Cidade', `${e(user.city)} - ${e(user.state)}`)}
                    </ul>
                </div>
            </aside>

            <section>
                <div class="tabs" role="tablist">
                    <button type="button" class="tab is-active" role="tab" aria-selected="true" data-tab="anuncios">${ui.icon('package')}Meus anúncios <span class="count">${products.length}</span></button>
                    <button type="button" class="tab" role="tab" aria-selected="false" data-tab="pedidos">${ui.icon('receipt')}Meus pedidos <span class="count">${orders.length}</span></button>
                </div>
                <div data-panel="anuncios">
                    ${productGrid(products, {
                        iconName: 'package',
                        title: 'Você ainda não anunciou nada',
                        text: 'Tem algum alimento embalado sobrando? Venda ou doe para alguém perto de você.',
                        action: '<a class="btn btn-primary" href="../cadastroProduto/cadastroProduto.html">Criar primeiro anúncio</a>'
                    })}
                </div>
                <div data-panel="pedidos" hidden>${ordersHtml}</div>
            </section>
        </div>
    `;
    fillGrid(container, products);

    container.querySelectorAll('.tab[data-tab]').forEach((tab) => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.tab[data-tab]').forEach((other) => {
                const active = other === tab;
                other.classList.toggle('is-active', active);
                other.setAttribute('aria-selected', String(active));
            });
            container.querySelectorAll('[data-panel]').forEach((panel) => {
                panel.hidden = panel.dataset.panel !== tab.dataset.tab;
            });
        });
    });

    if (window.location.hash === '#pedidos') {
        container.querySelector('.tab[data-tab="pedidos"]').click();
    }
}
