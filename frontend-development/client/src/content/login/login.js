// Selecionar elementos do DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const googleBtn = document.querySelector('.google-btn');
const forgotPasswordLink = document.querySelector('.forgot-password');

// Carregar dados salvos (se existirem)
window.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }
});

// Função de validação de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para mostrar mensagem de erro
function showError(input, message) {
    const inputGroup = input.parentElement;
    
    // Remove erro anterior se existir
    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adiciona nova mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff6b6b';
    errorDiv.style.fontSize = '13px';
    errorDiv.style.marginTop = '5px';
    
    inputGroup.appendChild(errorDiv);
    input.style.borderColor = '#ff6b6b';
}

// Função para limpar erro
function clearError(input) {
    const inputGroup = input.parentElement;
    const errorMessage = inputGroup.querySelector('.error-message');
    
    if (errorMessage) {
        errorMessage.remove();
    }
    
    input.style.borderColor = '#e0e0e0';
}

// Event listeners para limpar erros ao digitar
emailInput.addEventListener('input', () => clearError(emailInput));
passwordInput.addEventListener('input', () => clearError(passwordInput));

// Submissão do formulário
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio padrão do form
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;
    
    // Validar email
    if (!email) {
        showError(emailInput, 'Por favor, insira seu e-mail');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError(emailInput, 'Por favor, insira um e-mail válido');
        isValid = false;
    }
    
    // Validar senha
    if (!password) {
        showError(passwordInput, 'Por favor, insira sua senha');
        isValid = false;
    } else if (password.length < 6) {
        showError(passwordInput, 'A senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    // Se tudo estiver válido
    if (isValid) {
        // Salvar email se "Lembrar-me" estiver marcado
        if (rememberCheckbox.checked) {
            localStorage.setItem('savedEmail', email);
        } else {
            localStorage.removeItem('savedEmail');
        }
        
        // ===== INTEGRAÇÃO COM A API DE LOGIN USANDO FETCH =====
        // Comentários explicando cada fluxo em PT-BR:
        // 1. Chama o endpoint /auth/login da sua API
        // 2. Envia método POST com headers JSON
        // 3. Converte o body JS para string JSON com JSON.stringify
        // 4. Trata a resposta: se OK (credenciais corretas), salva token e redireciona
        // 5. Se der erro (credenciais inválidas ou erro de rede), mostra mensagem de erro
        
        fetch('http://127.0.0.1:8000/auth/login', {
            method: 'POST', // Método HTTP para autenticação
            headers: {
                'accept': 'application/json',       // Esperamos JSON como resposta
                'Content-Type': 'application/json'  // Enviamos JSON no corpo
            },
            body: JSON.stringify({
                // Corpo da requisição com as credenciais
                email: email,
                password: password
            })
        })
        .then(async (response) => {
            // Tratamento do retorno da API
            
            // Se as credenciais estiverem incorretas ou houver erro HTTP
            if (!response.ok) {
                // Tenta ler o corpo de erro (mensagem do backend)
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Se não for JSON, ignora
                }
                
                // Lança um erro com mensagem específica
                throw {
                    status: response.status,
                    message: errorData?.detail || 'E-mail ou senha incorretos'
                };
            }
            
            // Se login bem-sucedido, converte a resposta para JSON
            return response.json();
        })
        .then((data) => {
            // Fluxo quando o login é bem-sucedido (2xx)
            
            console.log('Login realizado com sucesso na API!');
            console.log('Resposta da API:', data);
            
            // Salvar token de autenticação no localStorage (se a API retornar)
            // Exemplo: se a API retornar { "access_token": "abc123", "user": {...} }
            if (data.access_token) {
                localStorage.setItem('authToken', data.access_token);
            }
            
            // Salvar dados do usuário (opcional)
            if (data.user) {
                localStorage.setItem('userData', JSON.stringify(data.user));
            }
            
            // Mostrar mensagem de sucesso
            alert('Login realizado com sucesso! Redirecionando...');
            
            // Redirecionar para a página principal do todo list
            // (ajuste o caminho conforme sua estrutura de pastas)
            window.location.href = '../client/src/content/main/main.html';
        })
        .catch((error) => {
            // Fluxo de erro: credenciais inválidas, usuário não encontrado,
            // ou erro de rede (API fora do ar, CORS, etc.)
            
            console.error('Erro no login:', error);
            
            // Exibir mensagem de erro amigável para o usuário
            alert(error.message || 'Ocorreu um erro ao realizar o login. Tente novamente mais tarde.');
        });
        // ===== FIM DA INTEGRAÇÃO COM FETCH =====
    }
});

// Login com Google
googleBtn.addEventListener('click', () => {
    console.log('Login com Google clicado');
    alert('Funcionalidade de login com Google será implementada em breve!');
    // Aqui você implementaria a integração com Google OAuth
});

// Esqueceu a senha
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Por favor, insira seu e-mail primeiro para recuperar a senha.');
        emailInput.focus();
    } else if (!isValidEmail(email)) {
        alert('Por favor, insira um e-mail válido.');
        emailInput.focus();
    } else {
        alert(`Um link de recuperação foi enviado para ${email}`);
        console.log('Recuperação de senha solicitada para:', email);
    }
});

// Adicionar efeito de foco nos inputs
const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');

inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'transform 0.3s';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});