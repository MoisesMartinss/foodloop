const currentUser = FoodLoop.requireAuth();

const state = { type: '' };

if (currentUser) {
    FoodLoopUI.setupPage({ active: 'explorar' });
    FoodLoopUI.fillUfSelect(document.getElementById('estado'), { placeholder: 'Todos' });

    const firstName = currentUser.fullName.split(' ')[0];
    document.getElementById('userGreeting').textContent = `Olá, ${firstName}!`;

    const params = new URLSearchParams(window.location.search);
    if (params.get('tipo') === 'doacao' || params.get('tipo') === 'venda') {
        state.type = params.get('tipo');
    }

    renderStats();
    bindEvents();
    syncChips();
    applyFilters();
}

/* Produtos vencidos não aparecem na vitrine. */
function availableProducts() {
    return FoodLoop.getProducts().filter((product) => {
        const days = FoodLoopUI.daysUntil(product.validade);
        return days === null || days >= 0;
    });
}

function renderStats() {
    const products = availableProducts();
    document.getElementById('statTotal').textContent = products.length;
    document.getElementById('statDonations').textContent = products.filter(FoodLoop.isDonation).length;
    document.getElementById('statUrgent').textContent = products.filter((product) => {
        const days = FoodLoopUI.daysUntil(product.validade);
        return days !== null && days <= 7;
    }).length;
}

function bindEvents() {
    const filtersForm = document.getElementById('filtroForm');

    document.getElementById('searchForm').addEventListener('submit', (event) => {
        event.preventDefault();
        applyFilters();
    });
    document.getElementById('nome').addEventListener('input', debounce(applyFilters, 200));

    filtersForm.addEventListener('input', debounce(applyFilters, 200));
    filtersForm.addEventListener('change', applyFilters);
    filtersForm.addEventListener('submit', (event) => {
        event.preventDefault();
        applyFilters();
    });

    document.getElementById('ordenar').addEventListener('change', applyFilters);

    document.getElementById('clearFilters').addEventListener('click', () => {
        filtersForm.reset();
        document.getElementById('nome').value = '';
        applyFilters();
    });

    document.querySelectorAll('.chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            state.type = chip.dataset.type;
            syncChips();
            applyFilters();
        });
    });

    // Painel de filtros no celular
    const filters = document.getElementById('filters');
    const backdrop = document.getElementById('filtersBackdrop');
    const openFilters = () => { filters.classList.add('is-open'); backdrop.hidden = false; };
    const closeFilters = () => { filters.classList.remove('is-open'); backdrop.hidden = true; };
    document.getElementById('openFilters').addEventListener('click', openFilters);
    document.getElementById('closeFilters').addEventListener('click', closeFilters);
    document.getElementById('filtrarButton').addEventListener('click', () => { applyFilters(); closeFilters(); });
    backdrop.addEventListener('click', closeFilters);
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeFilters(); });
}

function syncChips() {
    document.querySelectorAll('.chip').forEach((chip) => {
        const active = chip.dataset.type === state.type;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-selected', String(active));
    });
}

function applyFilters() {
    const name = document.getElementById('nome').value.trim().toLowerCase();
    const priceValue = document.getElementById('preco').value;
    const maximumPrice = priceValue === '' ? Infinity : Number(priceValue);
    const city = document.getElementById('cidade').value.trim().toLowerCase();
    const uf = document.getElementById('estado').value.trim().toLowerCase();
    const delivery = document.getElementById('delivery').value;
    const expirationDate = document.getElementById('validade').value;
    const seller = document.getElementById('vendedor').value.trim().toLowerCase();

    const activeFilters = [priceValue, city, uf, delivery, expirationDate, seller].filter(Boolean).length;
    document.getElementById('filterCount').textContent = activeFilters || '';

    const filtered = availableProducts().filter((product) => (
        (!state.type || (state.type === 'doacao') === FoodLoop.isDonation(product)) &&
        (!name || product.nome.toLowerCase().includes(name) || product.marca.toLowerCase().includes(name)) &&
        product.preco <= maximumPrice &&
        (!city || product.cidade.toLowerCase().includes(city)) &&
        (!uf || product.estado.toLowerCase() === uf) &&
        (!delivery || product.delivery === delivery) &&
        (!expirationDate || product.validade >= expirationDate) &&
        (!seller || product.vendedor.nome.toLowerCase().includes(seller))
    ));

    showProducts(sortProducts(filtered, document.getElementById('ordenar').value));
}

function sortProducts(products, order) {
    const list = products.slice();
    switch (order) {
        case 'menorPreco': return list.sort((a, b) => a.preco - b.preco);
        case 'maiorPreco': return list.sort((a, b) => b.preco - a.preco);
        case 'recentes': return list.reverse();
        default: return list.sort((a, b) => String(a.validade).localeCompare(String(b.validade)));
    }
}

function showProducts(products) {
    const container = document.querySelector('.produtos-container');
    const count = products.length;
    document.getElementById('resultsTitle').innerHTML =
        `<span>${count}</span> ${count === 1 ? 'alimento encontrado' : 'alimentos encontrados'}`;

    container.innerHTML = '';
    if (count === 0) {
        container.innerHTML = FoodLoopUI.emptyState({
            iconName: 'search',
            title: 'Nenhum alimento por aqui',
            text: 'Tente mudar os filtros ou a busca. Você também pode anunciar algo que tenha sobrado.',
            action: '<a class="btn btn-secondary" href="../cadastroProduto/cadastroProduto.html">Anunciar um alimento</a>'
        });
        return;
    }

    products.forEach((product) => container.appendChild(FoodLoopUI.productCard(product)));
}

function debounce(fn, wait) {
    let timer;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), wait);
    };
}
