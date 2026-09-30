const currentUser = FoodLoop.requireAuth();
const productForm = document.getElementById('cadastrarProdutoForm');
const formMessage = document.getElementById('formMessage');
const submitButton = document.getElementById('submitButton');
const fileInput = document.getElementById('foto');

let imageData = '';

if (currentUser) {
    FoodLoopUI.setupPage({ active: 'anunciar' });
    FoodLoopUI.fillUfSelect(document.getElementById('estado'), { placeholder: 'Selecione', selected: currentUser.state });
    document.getElementById('cidade').value = currentUser.city || '';
    document.getElementById('validade').min = new Date().toISOString().split('T')[0];

    if (new URLSearchParams(window.location.search).get('tipo') === 'doacao') {
        document.getElementById('tipoDoacao').checked = true;
    }

    bindImageEvents();
    productForm.addEventListener('input', updatePreview);
    productForm.addEventListener('change', updatePreview);
    productForm.addEventListener('submit', registerProduct);
    updateType();
    updatePreview();
}

function getType() {
    return productForm.querySelector('input[name="tipo"]:checked').value;
}

function updateType() {
    const donation = getType() === 'doacao';
    document.getElementById('precoField').hidden = donation;
    document.getElementById('tipoGroup').classList.toggle('is-donation', donation);
    document.getElementById('tipoHint').textContent = donation
        ? 'Obrigado por doar! O alimento aparecerá como “Grátis” e com o selo de doação.'
        : 'Defina um preço justo — produtos perto da validade costumam sair mais rápido com desconto.';
    submitButton.querySelector('.txt').textContent = donation ? 'Publicar doação' : 'Publicar anúncio';
    submitButton.classList.toggle('btn-amber', donation);
}

productForm.querySelectorAll('input[name="tipo"]').forEach((radio) => radio.addEventListener('change', updateType));

/* ---------- Pré-visualização ---------- */
function draftProduct() {
    const value = (id) => document.getElementById(id).value.trim();
    const donation = getType() === 'doacao';
    return {
        id: 'preview',
        nome: value('nome') || 'Nome do alimento',
        marca: value('marca') || 'Marca',
        tipo: donation ? 'doacao' : 'venda',
        preco: donation ? 0 : Number(value('preco')) || 0,
        cidade: value('cidade') || 'Cidade',
        estado: value('estado') || 'UF',
        validade: value('validade'),
        delivery: productForm.querySelector('input[name="delivery"]:checked').value,
        imagem: imageData || '../fotos/placeholder-produto.svg',
        vendedor: { nome: currentUser.fullName }
    };
}

function updatePreview() {
    const container = document.getElementById('previewCard');
    container.innerHTML = '';
    container.appendChild(FoodLoopUI.productCard(draftProduct()));
}

/* ---------- Imagem ---------- */
function bindImageEvents() {
    const dropzone = document.getElementById('dropzone');

    fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

    ['dragenter', 'dragover'].forEach((type) => dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.add('is-drag');
    }));
    ['dragleave', 'drop'].forEach((type) => dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.remove('is-drag');
    }));
    dropzone.addEventListener('drop', (event) => {
        const file = event.dataTransfer.files[0];
        if (!file) return;
        const transfer = new DataTransfer();
        transfer.items.add(file);
        fileInput.files = transfer.files;
        handleFile(file);
    });

    document.getElementById('removeFoto').addEventListener('click', clearImage);
}

async function handleFile(file) {
    showMessage('', '');
    if (!file) {
        clearImage();
        return;
    }
    try {
        imageData = await FoodLoop.readImageFile(file);
        const preview = document.getElementById('fotoPreview');
        preview.src = imageData;
        preview.hidden = false;
        document.getElementById('dzEmpty').hidden = true;
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('removeFoto').hidden = false;
    } catch (error) {
        clearImage();
        showMessage(error.message, 'error');
    }
    updatePreview();
}

function clearImage() {
    imageData = '';
    fileInput.value = '';
    document.getElementById('fotoPreview').hidden = true;
    document.getElementById('dzEmpty').hidden = false;
    document.getElementById('file-name').textContent = 'Nenhum arquivo selecionado';
    document.getElementById('removeFoto').hidden = true;
    updatePreview();
}

/* ---------- Envio ---------- */
function validate(data) {
    if (data.nome.trim().length < 2) return 'Informe o nome do alimento.';
    if (!data.marca.trim()) return 'Informe a marca.';
    if (!data.validade) return 'Informe a data de validade.';
    if (data.validade < new Date().toISOString().split('T')[0]) return 'Não é possível anunciar um alimento vencido.';
    if (data.tipo === 'venda' && (!Number.isFinite(data.preco) || data.preco <= 0)) return 'Informe um preço maior que zero.';
    if (!data.cidade.trim()) return 'Informe a cidade.';
    if (!data.estado) return 'Selecione o estado.';
    return '';
}

function registerProduct(event) {
    event.preventDefault();
    showMessage('', '');

    const data = {
        tipo: getType(),
        nome: document.getElementById('nome').value,
        marca: document.getElementById('marca').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        validade: document.getElementById('validade').value,
        delivery: productForm.querySelector('input[name="delivery"]:checked').value,
        preco: Number(document.getElementById('preco').value),
        imagem: imageData
    };

    const error = validate(data);
    if (error) {
        showMessage(error, 'error');
        return;
    }

    submitButton.disabled = true;
    submitButton.querySelector('.txt').textContent = 'Publicando...';

    try {
        const product = FoodLoop.addProduct(data);
        showMessage('Anúncio publicado com sucesso!', 'success');
        window.setTimeout(() => {
            window.location.href = `../comprarProduto/comprarProduto.html?id=${encodeURIComponent(product.id)}`;
        }, 600);
    } catch (err) {
        const quota = err && (err.name === 'QuotaExceededError' || /quota/i.test(err.message));
        showMessage(quota ? 'Sem espaço no navegador para salvar a imagem. Tente uma foto menor.' : err.message, 'error');
        submitButton.disabled = false;
        updateType();
    }
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}
