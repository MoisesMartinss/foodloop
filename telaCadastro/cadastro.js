const registerForm = document.getElementById('registerForm');
const formMessage = document.getElementById('formMessage');
const registerButton = registerForm.querySelector('button[type="submit"]');
const documentInput = document.getElementById('cpfCnpj');
const phoneInput = document.getElementById('phone');

FoodLoopUI.setupPage({ auth: false });
FoodLoopUI.fillUfSelect(document.getElementById('state'), { placeholder: 'Selecione' });
document.getElementById('birthdate').max = new Date().toISOString().split('T')[0];

/* ---------- Pessoa física x Empresa ---------- */
function getAccountType() {
    return registerForm.querySelector('input[name="accountType"]:checked').value;
}

function updateAccountType() {
    const isCompany = getAccountType() === 'pj';
    document.getElementById('fullNameLabel').textContent = isCompany ? 'Nome da empresa' : 'Nome completo';
    document.getElementById('fullName').placeholder = isCompany ? 'Razão social ou nome fantasia' : 'Como você se chama?';
    document.getElementById('fullName').autocomplete = isCompany ? 'organization' : 'name';
    document.getElementById('documentLabel').textContent = isCompany ? 'CNPJ' : 'CPF';
    documentInput.placeholder = isCompany ? '00.000.000/0000-00' : '000.000.000-00';
    documentInput.value = maskDocument(documentInput.value);
    document.getElementById('birthdateField').hidden = isCompany;
    document.getElementById('documentField').classList.toggle('span-2', isCompany);
}

registerForm.querySelectorAll('input[name="accountType"]').forEach((radio) => {
    radio.addEventListener('change', updateAccountType);
});

/* ---------- Máscaras ---------- */
function maskDocument(value) {
    const isCompany = getAccountType() === 'pj';
    const digits = value.replace(/\D/g, '').slice(0, isCompany ? 14 : 11);
    if (isCompany) {
        return digits
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

documentInput.addEventListener('input', () => { documentInput.value = maskDocument(documentInput.value); });
phoneInput.addEventListener('input', () => { phoneInput.value = maskPhone(phoneInput.value); });

/* ---------- Envio ---------- */
registerForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    showMessage('', '');

    const data = {
        accountType: getAccountType(),
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        phone: phoneInput.value,
        cpfCnpj: documentInput.value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        birthdate: getAccountType() === 'pj' ? '' : document.getElementById('birthdate').value
    };

    const validationError = validateForm(data);
    if (validationError) {
        showMessage(validationError, 'error');
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = 'Criando conta...';

    try {
        await FoodLoop.registerUser(data);
        showMessage('Conta criada! Redirecionando...', 'success');
        window.setTimeout(() => {
            window.location.href = '../paginaInicial/paginaInicial.html';
        }, 600);
    } catch (error) {
        showMessage(error.message, 'error');
        registerButton.disabled = false;
        registerButton.textContent = 'Criar conta';
    }
});

function validateForm(data) {
    const isCompany = data.accountType === 'pj';

    if (isCompany) {
        if (data.fullName.trim().length < 3) return 'Informe o nome da empresa.';
    } else {
        const nameParts = data.fullName.trim().split(/\s+/);
        if (nameParts.length < 2 || nameParts.some((part) => part.length < 2)) {
            return 'Informe seu nome completo (nome e sobrenome).';
        }
    }

    const documentDigits = data.cpfCnpj.replace(/\D/g, '');
    if (isCompany && documentDigits.length !== 14) return 'Informe um CNPJ com 14 dígitos.';
    if (!isCompany && documentDigits.length !== 11) return 'Informe um CPF com 11 dígitos.';

    if (!isCompany && (!data.birthdate || data.birthdate > new Date().toISOString().split('T')[0])) {
        return 'Informe uma data de nascimento válida.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'Informe um e-mail válido.';

    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) return 'Informe um telefone válido com DDD.';

    if (data.city.trim().length < 2) return 'Informe sua cidade.';
    if (!/^[A-Za-z]{2}$/.test(data.state.trim())) return 'Selecione o estado.';

    if (data.password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (data.password !== data.confirmPassword) return 'As senhas não correspondem.';

    return '';
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}
