(function () {
    'use strict';

    const STORAGE_KEYS = {
        users: 'foodloop_users_v1',
        session: 'foodloop_session_v1',
        products: 'foodloop_products_v1',
        cart: 'foodloop_cart_v1',
        orders: 'foodloop_orders_v1',
        messages: 'foodloop_messages_v1',
        seedVersion: 'foodloop_seed_version'
    };

    const SEED_VERSION = 2;

    // Datas de validade relativas a hoje, para a demonstração nunca ficar "vencida".
    function daysFromToday(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
    }

    const seedProducts = [
        {
            id: 'produto-1',
            nome: 'Arroz Integral',
            marca: 'Marca A',
            tipo: 'venda',
            preco: 20,
            cidade: 'São Paulo',
            estado: 'SP',
            delivery: 'sim',
            validade: daysFromToday(40),
            imagem: '../fotos/arrozIntegral.jpg',
            vendedor: {
                id: 'vendedor-1',
                nome: 'João Silva',
                cidade: 'São Paulo',
                estado: 'SP',
                telefone: '(11) 99999-9999',
                foto: '../fotos/usuarioImage.png'
            }
        },
        {
            id: 'produto-2',
            nome: 'Feijão Preto',
            marca: 'Marca B',
            tipo: 'venda',
            preco: 15,
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            delivery: 'não',
            validade: daysFromToday(5),
            imagem: '../fotos/feijaoPreto.jpg',
            vendedor: {
                id: 'vendedor-2',
                nome: 'Maria Oliveira',
                cidade: 'Rio de Janeiro',
                estado: 'RJ',
                telefone: '(21) 88888-8888',
                foto: '../fotos/usuarioImage.png'
            }
        },
        {
            id: 'produto-3',
            nome: 'Açúcar Mascavo',
            marca: 'Marca C',
            tipo: 'venda',
            preco: 12,
            cidade: 'Belo Horizonte',
            estado: 'MG',
            delivery: 'sim',
            validade: daysFromToday(75),
            imagem: '../fotos/acucarMascavo.jpg',
            vendedor: {
                id: 'vendedor-3',
                nome: 'Carlos Pereira',
                cidade: 'Belo Horizonte',
                estado: 'MG',
                telefone: '(31) 77777-7777',
                foto: '../fotos/gustavoImage.jpg'
            }
        },
        {
            id: 'produto-4',
            nome: 'Cesta com Arroz e Feijão',
            marca: 'Diversas',
            tipo: 'doacao',
            preco: 0,
            cidade: 'Goiânia',
            estado: 'GO',
            delivery: 'não',
            validade: daysFromToday(3),
            imagem: '../fotos/feijaoPreto.jpg',
            vendedor: {
                id: 'vendedor-4',
                nome: 'Mercado Bom Preço',
                cidade: 'Goiânia',
                estado: 'GO',
                telefone: '(62) 3333-4444',
                foto: '../fotos/usuarioImage.png'
            }
        },
        {
            id: 'produto-5',
            nome: 'Arroz Integral 1kg',
            marca: 'Marca A',
            tipo: 'doacao',
            preco: 0,
            cidade: 'São Paulo',
            estado: 'SP',
            delivery: 'sim',
            validade: daysFromToday(12),
            imagem: '../fotos/arrozIntegral.jpg',
            vendedor: {
                id: 'vendedor-1',
                nome: 'João Silva',
                cidade: 'São Paulo',
                estado: 'SP',
                telefone: '(11) 99999-9999',
                foto: '../fotos/usuarioImage.png'
            }
        }
    ];

    function readJson(storage, key, fallback) {
        try {
            const value = storage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch (error) {
            console.error(`Não foi possível ler ${key}:`, error);
            return fallback;
        }
    }

    function writeJson(storage, key, value) {
        storage.setItem(key, JSON.stringify(value));
    }

    function createId(prefix) {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return `${prefix}-${window.crypto.randomUUID()}`;
        }
        return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function bytesToBase64(bytes) {
        let binary = '';
        bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
        });
        return window.btoa(binary);
    }

    function base64ToBytes(value) {
        const binary = window.atob(value);
        return Uint8Array.from(binary, (character) => character.charCodeAt(0));
    }

    async function hashPassword(password, saltBase64) {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error('Este navegador não oferece os recursos de segurança necessários.');
        }

        const encoder = new TextEncoder();
        const key = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );
        const bits = await window.crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: base64ToBytes(saltBase64),
                iterations: 120000,
                hash: 'SHA-256'
            },
            key,
            256
        );
        return bytesToBase64(new Uint8Array(bits));
    }

    function createSalt() {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        return bytesToBase64(bytes);
    }

    function initialize() {
        if (localStorage.getItem(STORAGE_KEYS.products) === null) {
            writeJson(localStorage, STORAGE_KEYS.products, seedProducts);
            localStorage.setItem(STORAGE_KEYS.seedVersion, String(SEED_VERSION));
        } else if (Number(localStorage.getItem(STORAGE_KEYS.seedVersion) || 1) < SEED_VERSION) {
            // Atualiza os produtos de exemplo de versões anteriores sem apagar os cadastrados pelos usuários.
            const seedIds = new Set(seedProducts.map((product) => product.id));
            const userProducts = readJson(localStorage, STORAGE_KEYS.products, [])
                .filter((product) => !seedIds.has(product.id));
            writeJson(localStorage, STORAGE_KEYS.products, [...seedProducts, ...userProducts]);
            localStorage.setItem(STORAGE_KEYS.seedVersion, String(SEED_VERSION));
        }
        if (localStorage.getItem(STORAGE_KEYS.users) === null) {
            writeJson(localStorage, STORAGE_KEYS.users, []);
        }
        if (localStorage.getItem(STORAGE_KEYS.cart) === null) {
            writeJson(localStorage, STORAGE_KEYS.cart, {});
        }
        if (localStorage.getItem(STORAGE_KEYS.orders) === null) {
            writeJson(localStorage, STORAGE_KEYS.orders, []);
        }
        if (localStorage.getItem(STORAGE_KEYS.messages) === null) {
            writeJson(localStorage, STORAGE_KEYS.messages, []);
        }
    }

    function getUsers() {
        return readJson(localStorage, STORAGE_KEYS.users, []);
    }

    function publicUser(user) {
        if (!user) return null;
        const { passwordHash, salt, ...safeUser } = user;
        return safeUser;
    }

    async function registerUser(data) {
        const users = getUsers();
        const normalizedEmail = data.email.trim().toLowerCase();
        if (users.some((user) => user.email === normalizedEmail)) {
            throw new Error('Já existe uma conta cadastrada com este e-mail.');
        }

        const salt = createSalt();
        const user = {
            id: createId('usuario'),
            accountType: data.accountType === 'pj' ? 'pj' : 'pf',
            fullName: data.fullName.trim(),
            email: normalizedEmail,
            passwordHash: await hashPassword(data.password, salt),
            salt,
            phone: data.phone.trim(),
            cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
            city: data.city.trim(),
            state: data.state.trim().toUpperCase(),
            birthdate: data.birthdate || '',
            createdAt: new Date().toISOString()
        };

        users.push(user);
        writeJson(localStorage, STORAGE_KEYS.users, users);
        writeJson(sessionStorage, STORAGE_KEYS.session, { userId: user.id });
        return publicUser(user);
    }

    async function login(email, password) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = getUsers().find((candidate) => candidate.email === normalizedEmail);
        if (!user) return null;

        const passwordHash = await hashPassword(password, user.salt);
        if (passwordHash !== user.passwordHash) return null;

        writeJson(sessionStorage, STORAGE_KEYS.session, { userId: user.id });
        return publicUser(user);
    }

    function logout() {
        sessionStorage.removeItem(STORAGE_KEYS.session);
    }

    function getCurrentUser() {
        const session = readJson(sessionStorage, STORAGE_KEYS.session, null);
        if (!session) return null;
        return publicUser(getUsers().find((user) => user.id === session.userId));
    }

    function requireAuth() {
        const user = getCurrentUser();
        if (!user) {
            window.location.replace('../telaLogin/index.html');
            return null;
        }
        return user;
    }

    function getProducts() {
        return readJson(localStorage, STORAGE_KEYS.products, seedProducts);
    }

    function isDonation(product) {
        return Boolean(product) && product.tipo === 'doacao';
    }

    function getProductsBySeller(sellerId) {
        return getProducts().filter((product) => product.vendedor && product.vendedor.id === sellerId);
    }

    function getProductById(id) {
        return getProducts().find((product) => String(product.id) === String(id));
    }

    function addProduct(data) {
        const user = getCurrentUser();
        if (!user) throw new Error('Faça login para cadastrar um produto.');

        const product = {
            id: createId('produto'),
            nome: data.nome.trim(),
            marca: data.marca.trim(),
            cidade: data.cidade.trim(),
            estado: data.estado.trim().toUpperCase(),
            validade: data.validade,
            delivery: data.delivery,
            tipo: data.tipo === 'doacao' ? 'doacao' : 'venda',
            preco: data.tipo === 'doacao' ? 0 : Number(data.preco),
            imagem: data.imagem || '../fotos/placeholder-produto.svg',
            vendedor: {
                id: user.id,
                nome: user.fullName,
                cidade: user.city,
                estado: user.state,
                telefone: user.phone,
                foto: '../fotos/usuarioImage.png'
            },
            createdAt: new Date().toISOString()
        };

        const products = getProducts();
        products.push(product);
        writeJson(localStorage, STORAGE_KEYS.products, products);
        return product;
    }

    function readImageFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve('');
                return;
            }
            if (!file.type.startsWith('image/')) {
                reject(new Error('Selecione um arquivo de imagem válido.'));
                return;
            }
            if (file.size > 1024 * 1024) {
                reject(new Error('A imagem deve ter no máximo 1 MB.'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
            reader.readAsDataURL(file);
        });
    }

    function getCart() {
        const user = getCurrentUser();
        if (!user) return [];
        const carts = readJson(localStorage, STORAGE_KEYS.cart, {});
        if (Array.isArray(carts)) return carts;
        return carts[user.id] || [];
    }

    function saveCart(cart) {
        const user = getCurrentUser();
        if (!user) throw new Error('Faça login para utilizar o carrinho.');
        const storedCarts = readJson(localStorage, STORAGE_KEYS.cart, {});
        const carts = Array.isArray(storedCarts) ? {} : storedCarts;
        carts[user.id] = cart;
        writeJson(localStorage, STORAGE_KEYS.cart, carts);
    }

    function addToCart(productId, quantity = 1) {
        if (!getProductById(productId)) throw new Error('Produto não encontrado.');
        const cart = getCart();
        const existing = cart.find((item) => String(item.productId) === String(productId));
        if (existing) {
            existing.quantity = Math.min(10, existing.quantity + quantity);
        } else {
            cart.push({ productId: String(productId), quantity: Math.max(1, Math.min(10, quantity)) });
        }
        saveCart(cart);
    }

    function updateCartItem(productId, quantity) {
        const cart = getCart();
        const item = cart.find((candidate) => String(candidate.productId) === String(productId));
        if (!item) return;
        item.quantity = Math.max(1, Math.min(10, Number(quantity) || 1));
        saveCart(cart);
    }

    function removeFromCart(productId) {
        saveCart(getCart().filter((item) => String(item.productId) !== String(productId)));
    }

    function clearCart() {
        saveCart([]);
    }

    function getCartDetails() {
        return getCart().map((item) => {
            const product = getProductById(item.productId);
            return product ? { ...item, product, subtotal: product.preco * item.quantity } : null;
        }).filter(Boolean);
    }

    function createOrder(data) {
        const user = getCurrentUser();
        if (!user) throw new Error('Faça login para finalizar a compra.');
        const items = getCartDetails();
        if (items.length === 0) throw new Error('O carrinho está vazio.');

        const order = {
            id: `FL-${Date.now().toString(36).toUpperCase()}`,
            userId: user.id,
            customerName: user.fullName,
            address: data.address.trim(),
            paymentMethod: data.paymentMethod,
            items: items.map((item) => ({
                productId: item.product.id,
                name: item.product.nome,
                unitPrice: item.product.preco,
                quantity: item.quantity,
                subtotal: item.subtotal
            })),
            total: items.reduce((sum, item) => sum + item.subtotal, 0),
            status: 'Confirmado',
            createdAt: new Date().toISOString()
        };

        const orders = readJson(localStorage, STORAGE_KEYS.orders, []);
        orders.push(order);
        writeJson(localStorage, STORAGE_KEYS.orders, orders);
        clearCart();
        return order;
    }

    function getOrdersForCurrentUser() {
        const user = getCurrentUser();
        if (!user) return [];
        return readJson(localStorage, STORAGE_KEYS.orders, [])
            .filter((order) => order.userId === user.id);
    }

    function findSellerByName(name) {
        if (!name) return null;
        for (const product of getProducts()) {
            if (product.vendedor && product.vendedor.nome === name) return product.vendedor;
        }
        return null;
    }

    function sendMessage(seller, text) {
        const user = getCurrentUser();
        if (!user) throw new Error('Faça login para enviar mensagens.');
        if (!seller || !text.trim()) throw new Error('Digite uma mensagem.');
        const messages = readJson(localStorage, STORAGE_KEYS.messages, []);
        messages.push({
            id: createId('mensagem'),
            fromUserId: user.id,
            fromName: user.fullName,
            toSellerId: seller.id,
            toSellerName: seller.nome,
            text: text.trim(),
            createdAt: new Date().toISOString()
        });
        writeJson(localStorage, STORAGE_KEYS.messages, messages);
    }

    function formatCurrency(value) {
        return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatDate(isoDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate || '')) return isoDate || '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    initialize();

    window.FoodLoop = Object.freeze({
        registerUser,
        login,
        logout,
        getCurrentUser,
        requireAuth,
        getProducts,
        getProductById,
        getProductsBySeller,
        isDonation,
        addProduct,
        readImageFile,
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartDetails,
        createOrder,
        getOrdersForCurrentUser,
        findSellerByName,
        sendMessage,
        formatCurrency,
        formatDate,
        escapeHtml
    });
})();
