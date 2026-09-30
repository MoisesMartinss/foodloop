const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');
const submitButton = loginForm.querySelector('button[type="submit"]');

if (FoodLoop.getCurrentUser()) {
    window.location.replace('../paginaInicial/paginaInicial.html');
}

FoodLoopUI.setupPage({ auth: false });

loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    errorMessage.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email.trim() || !password) {
        errorMessage.textContent = 'Preencha e-mail e senha para continuar.';
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    try {
        const user = await FoodLoop.login(email, password);
        if (!user) {
            errorMessage.textContent = 'E-mail ou senha incorretos.';
            return;
        }
        window.location.href = '../paginaInicial/paginaInicial.html';
    } catch (error) {
        errorMessage.textContent = error.message;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
    }
});
