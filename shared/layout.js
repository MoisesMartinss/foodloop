/* ==========================================================================
   FoodLoop — componentes de interface compartilhados
   - ícones SVG
   - cabeçalho, barra inferior (mobile) e rodapé
   - card de produto, selos de validade, toast
   Depende de shared/app.js (window.FoodLoop).
   ========================================================================== */
(function () {
    'use strict';

    const ICON_PATHS = {
        compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
        user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
        pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
        truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
        heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
        gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
        tag: '<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1.5"/>',
        arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
        arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
        message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        store: '<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z"/><path d="M5 13v8h14v-8M10 21v-5h4v5"/>',
        package: '<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>',
        leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
        clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
        phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
        mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
        filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
        x: '<path d="M18 6 6 18M6 6l12 12"/>',
        trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
        image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
        upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
        building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
        receipt: '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
        sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
        lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>'
    };

    function icon(name, extraClass = '') {
        const paths = ICON_PATHS[name] || '';
        return `<svg class="icon ${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
    }

    const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

    function fillUfSelect(select, { placeholder = 'UF', selected = '' } = {}) {
        if (!select) return;
        select.innerHTML = `<option value="">${placeholder}</option>` +
            UFS.map((uf) => `<option value="${uf}" ${uf === selected ? 'selected' : ''}>${uf}</option>`).join('');
    }

    function initials(name) {
        const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '?';
        const first = parts[0][0];
        const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
        return (first + last).toUpperCase();
    }

    function cartCount() {
        return FoodLoop.getCart().reduce((total, item) => total + item.quantity, 0);
    }

    /* ---------- Cabeçalho / rodapé ---------- */
    function renderHeader(active) {
        const user = FoodLoop.getCurrentUser();
        const count = user ? cartCount() : 0;
        const base = '..';

        const header = document.createElement('header');
        header.className = 'site-header';
        header.innerHTML = `
            <div class="container">
                <a class="brand" href="${base}/paginaInicial/paginaInicial.html" aria-label="FoodLoop — página inicial">
                    <img src="${base}/fotos/logo-mark.png" alt="">
                    <span>Food<b>Loop</b></span>
                </a>
                <nav class="main-nav" aria-label="Principal">
                    <a class="nav-link hide-mobile ${active === 'explorar' ? 'is-active' : ''}" href="${base}/paginaInicial/paginaInicial.html">${icon('compass')}<span class="label">Explorar</span></a>
                    <a class="nav-link hide-mobile ${active === 'anunciar' ? 'is-active' : ''}" href="${base}/cadastroProduto/cadastroProduto.html">${icon('plus')}<span class="label">Anunciar</span></a>
                    <a class="nav-link hide-mobile ${active === 'carrinho' ? 'is-active' : ''}" href="${base}/carrinhoCompra/carrinhoCompra.html" aria-label="Carrinho, ${count} itens">${icon('cart')}<span class="label">Carrinho</span><span class="cart-badge" data-count="${count}">${count || ''}</span></a>
                    ${user ? `
                    <a class="user-chip hide-mobile" href="${base}/perfilCliente/perfilCliente.html" title="Meu perfil">
                        <span class="avatar">${FoodLoop.escapeHtml(initials(user.fullName))}</span>
                        <span>${FoodLoop.escapeHtml(user.fullName.split(' ')[0])}</span>
                    </a>` : ''}
                    <button type="button" class="nav-link" id="logoutButton" title="Sair">${icon('logout')}<span class="label">Sair</span></button>
                </nav>
            </div>
        `;
        document.body.prepend(header);

        const bottom = document.createElement('nav');
        bottom.className = 'bottom-nav';
        bottom.setAttribute('aria-label', 'Navegação');
        bottom.innerHTML = `
            <a href="${base}/paginaInicial/paginaInicial.html" class="${active === 'explorar' ? 'is-active' : ''}">${icon('compass')}Explorar</a>
            <a href="${base}/cadastroProduto/cadastroProduto.html" class="is-primary ${active === 'anunciar' ? 'is-active' : ''}">${icon('plus')}Anunciar</a>
            <a href="${base}/carrinhoCompra/carrinhoCompra.html" class="${active === 'carrinho' ? 'is-active' : ''}">${icon('cart')}Carrinho<span class="cart-badge" data-count="${count}">${count || ''}</span></a>
            <a href="${base}/perfilCliente/perfilCliente.html" class="${active === 'perfil' ? 'is-active' : ''}">${icon('user')}Perfil</a>
        `;
        document.body.appendChild(bottom);
        document.body.classList.add('has-bottom-nav');

        header.querySelector('#logoutButton').addEventListener('click', function () {
            FoodLoop.logout();
            window.location.href = `${base}/telaLogin/index.html`;
        });
    }

    function renderFooter() {
        const footer = document.createElement('footer');
        footer.className = 'site-footer';
        footer.innerHTML = `
            <div class="container">
                <p><strong>FoodLoop</strong> · Menos desperdício, mais comida na mesa.</p>
                <p>© ${new Date().getFullYear()} FoodLoop — protótipo acadêmico</p>
            </div>
        `;
        const bottomNav = document.querySelector('.bottom-nav');
        document.body.insertBefore(footer, bottomNav || null);
    }

    function updateCartBadges() {
        const count = cartCount();
        document.querySelectorAll('.cart-badge').forEach((badge) => {
            badge.dataset.count = count;
            badge.textContent = count || '';
        });
    }

    /* ---------- Toast ---------- */
    function toast(message, iconName = 'checkCircle') {
        let region = document.querySelector('.toast-region');
        if (!region) {
            region = document.createElement('div');
            region.className = 'toast-region';
            region.setAttribute('role', 'status');
            region.setAttribute('aria-live', 'polite');
            document.body.appendChild(region);
        }
        const el = document.createElement('div');
        el.className = 'toast';
        el.innerHTML = `${icon(iconName)}<span>${FoodLoop.escapeHtml(message)}</span>`;
        region.appendChild(el);
        window.setTimeout(() => el.remove(), 2800);
    }

    /* ---------- Validade ---------- */
    function daysUntil(isoDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate || '')) return null;
        const [y, m, d] = isoDate.split('-').map(Number);
        const target = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.round((target - today) / 86400000);
    }

    function expiryBadge(isoDate) {
        const days = daysUntil(isoDate);
        if (days === null) return '';
        if (days < 0) return `<span class="badge badge-urgent">${icon('clock')}Vencido</span>`;
        if (days === 0) return `<span class="badge badge-urgent">${icon('clock')}Vence hoje</span>`;
        if (days <= 7) return `<span class="badge badge-urgent">${icon('clock')}Vence em ${days} ${days === 1 ? 'dia' : 'dias'}</span>`;
        return `<span class="badge">${icon('calendar')}Val. ${FoodLoop.formatDate(isoDate)}</span>`;
    }

    function priceHtml(product) {
        return FoodLoop.isDonation(product)
            ? '<span class="price is-free">Grátis</span>'
            : `<span class="price">${FoodLoop.formatCurrency(product.preco)}</span>`;
    }

    function typeBadge(product, extra = '') {
        return FoodLoop.isDonation(product)
            ? `<span class="badge badge-solid-donation ${extra}">${icon('heart')}Doação</span>`
            : `<span class="badge badge-solid-sale ${extra}">${icon('tag')}Venda</span>`;
    }

    function productCard(product) {
        const e = FoodLoop.escapeHtml;
        const url = `../comprarProduto/comprarProduto.html?id=${encodeURIComponent(product.id)}`;
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="media">
                <img src="${e(product.imagem)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='../fotos/placeholder-produto.svg'">
                ${typeBadge(product, 'badge-type')}
            </div>
            <div class="body">
                <h3 class="title"><a href="${url}">${e(product.nome)}</a></h3>
                <p class="brand-line">${e(product.marca)} · por ${e(product.vendedor.nome)}</p>
                <div class="meta">
                    ${expiryBadge(product.validade)}
                    ${product.delivery === 'sim' ? `<span class="badge badge-green">${icon('truck')}Entrega</span>` : `<span class="badge">${icon('store')}Retirada</span>`}
                </div>
                <div class="footer">
                    ${priceHtml(product)}
                    <span class="location" title="${e(product.cidade)} - ${e(product.estado)}">${icon('pin')}<span>${e(product.cidade)} - ${e(product.estado)}</span></span>
                </div>
            </div>
        `;
        return card;
    }

    function emptyState({ iconName = 'search', title, text = '', action = '' }) {
        return `
            <div class="empty-state">
                <div class="empty-icon">${icon(iconName)}</div>
                <h3>${title}</h3>
                ${text ? `<p>${text}</p>` : ''}
                ${action}
            </div>
        `;
    }

    /* Liga os ícones declarados no HTML: <span data-icon="cart"></span> */
    function hydrateIcons(root = document) {
        root.querySelectorAll('[data-icon]').forEach((el) => {
            el.outerHTML = icon(el.dataset.icon, el.className || '');
        });
    }

    function bindPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach((button) => {
            button.addEventListener('click', function () {
                const input = this.parentElement.querySelector('input');
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                this.textContent = show ? 'Ocultar' : 'Mostrar';
                this.setAttribute('aria-pressed', String(show));
            });
        });
    }

    function setupPage({ active = '', auth = true } = {}) {
        hydrateIcons();
        bindPasswordToggles();
        if (auth) {
            renderHeader(active);
            renderFooter();
        }
    }

    window.FoodLoopUI = Object.freeze({
        icon,
        UFS,
        fillUfSelect,
        initials,
        setupPage,
        updateCartBadges,
        toast,
        daysUntil,
        expiryBadge,
        priceHtml,
        typeBadge,
        productCard,
        emptyState,
        hydrateIcons
    });
})();
