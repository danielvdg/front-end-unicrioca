// Selecionar elementos do DOM
const signupForm = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const phoneInput = document.getElementById('phone');
const termsCheckbox = document.getElementById('terms');
const googleBtn = document.querySelector('.google-btn');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');

// Função de validação de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função de validação de nome
function isValidName(name) {
    return name.trim().length >= 3 && /^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(name);
}

// Função para validar telefone brasileiro
function formatPhone(value) {
    // Remove tudo que não é número
    value = value.replace(/\D/g, '');
    
    // Formata o telefone
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    
    return value;
}

// Aplicar máscara de telefone
phoneInput.addEventListener('input', (e) => {
    e.target.value = formatPhone(e.target.value);
});

// Função para calcular força da senha
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
}

// Atualizar indicador de força da senha
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);
    
    // Remover classes anteriores
    strengthBar.className = 'strength-bar';
    strengthText.className = 'strength-text';
    
    if (password.length === 0) {
        strengthText.textContent = '';
        return;
    }
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Senha fraca';
    } else if (strength <= 3) {
        strengthBar.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Senha média';
    } else {
        strengthBar.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Senha forte';
    }
});

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
const inputs = [nameInput, emailInput, passwordInput, confirmPasswordInput, phoneInput];
inputs.forEach(input => {
    input.addEventListener('input', () => clearError(input));
});

// Validar confirmação de senha em tempo real
confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
        showError(confirmPasswordInput, 'As senhas não coincidem');
    } else {
        clearError(confirmPasswordInput);
    }
});

// Submissão do formulário
signupForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio padrão do form (recarregar a página)
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const phone = phoneInput.value.trim();
    let isValid = true;
    
    // Validar nome
    if (!name) {
        showError(nameInput, 'Por favor, insira seu nome completo');
        isValid = false;
    } else if (!isValidName(name)) {
        showError(nameInput, 'Por favor, insira um nome válido (mínimo 3 caracteres)');
        isValid = false;
    }
    
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
        showError(passwordInput, 'Por favor, insira uma senha');
        isValid = false;
    } else if (password.length < 6) {
        showError(passwordInput, 'A senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    // Validar confirmação de senha
    if (!confirmPassword) {
        showError(confirmPasswordInput, 'Por favor, confirme sua senha');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError(confirmPasswordInput, 'As senhas não coincidem');
        isValid = false;
    }
    
    // Validar termos
    if (!termsCheckbox.checked) {
        alert('Você precisa aceitar os Termos de Uso e a Política de Privacidade');
        isValid = false;
    }
    
    // Se tudo estiver válido
    if (isValid) {
        // Criar objeto com os dados do usuário (caso precise também no front)
        const userData = {
            name: name,
            email: email,
            password: password,
            phone: phone || null,
            createdAt: new Date().toISOString()
        };

        // ===== INTEGRAÇÃO COM A API USANDO FETCH (EQUIVALENTE AO CURL) =====
        // Comentários explicando cada fluxo em PT-BR:
        // 1. Chama o endpoint /auth/signup da sua API
        // 2. Envia método POST com headers JSON
        // 3. Converte o body JS para string JSON com JSON.stringify
        // 4. Trata a resposta: se OK, mostra sucesso e redireciona
        // 5. Se der erro (HTTP ou de rede), mostra mensagem de erro

        fetch('http://127.0.0.1:8000/auth/signup', {
            method: 'POST', // Método HTTP que queremos usar (POST para criar recurso)
            headers: {
                'accept': 'application/json',       // Diz que esperamos JSON como resposta
                'Content-Type': 'application/json'  // Diz que estamos enviando JSON no corpo
            },
            body: JSON.stringify({
                // Corpo da requisição, equivalente ao -d '{ ... }' do curl
                name: name,
                email: email,
                password: password
                // Se o backend aceitar telefone, pode adicionar:
                // phone: phone || null
            })
        })
        .then(async (response) => {
            // Aqui tratamos o retorno da API

            // Se quiser checar erros de status HTTP:
            if (!response.ok) {
                // Tenta ler o corpo de erro (se o backend mandar)
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Se não for JSON, ignora
                }

                // Lança um erro com mensagem mais amigável
                throw {
                    status: response.status,
                    message: errorData?.detail || 'Erro ao realizar cadastro'
                };
            }

            // Se estiver tudo OK, converte a resposta para JSON
            return response.json();
        })
        .then((data) => {
            // Fluxo quando a API responde com sucesso (2xx)

            console.log('Cadastro realizado com sucesso na API!');
            console.log('Resposta da API:', data);

            // Se ainda quiser salvar algo no localStorage (opcional)
            localStorage.setItem('userData', JSON.stringify(userData));

            // Mostrar mensagem de sucesso (função que você já tem)
            showSuccessMessage();

            window.location.href = '../../../index.html';
        })
        .catch((error) => {
            // Fluxo de erro: pode ser HTTP (status 400/500...) 
            // ou erro de rede (API fora do ar, CORS, etc.)

            console.error('Erro no cadastro:', error);

            // Aqui você pode exibir uma mensagem de erro amigável na tela
            alert(error.message || 'Ocorreu um erro ao realizar o cadastro. Tente novamente mais tarde.');
        });
        // ===== FIM DA INTEGRAÇÃO COM FETCH =====
    }
});

// Função para mostrar mensagem de sucesso
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = '✓ Conta criada com sucesso! Redirecionando...';
    
    const signupBox = document.querySelector('.signup-box');
    signupBox.insertBefore(successDiv, signupBox.firstChild);
}

// Cadastro com Google
googleBtn.addEventListener('click', () => {
    console.log('Cadastro com Google clicado');
    alert('Funcionalidade de cadastro com Google será implementada em breve!');
    // Aqui você implementaria a integração com Google OAuth
});

// Adicionar efeito de foco nos inputs
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'transform 0.3s';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});

// Prevenir espaços no início do email
emailInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.trimStart();
});

// Capitalizar primeira letra do nome
nameInput.addEventListener('blur', (e) => {
    const words = e.target.value.trim().split(' ');
    const capitalizedWords = words.map(word => {
        if (word.length > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word;
    });
    e.target.value = capitalizedWords.join(' ');
});