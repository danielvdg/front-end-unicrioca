// Função para inicializar o cabeçalho
function initHeader() {
    const logoutBtn = document.getElementById('logout-btn');
    const userNameElement = document.getElementById('user-name');
    const userInitialElement = document.getElementById('user-initial');

    // Carregar informações do usuário
    loadUserInfo();

    // Event listener para o botão de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Função para carregar informações do usuário
    function loadUserInfo() {
        // Buscar dados do localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        const userEmail = localStorage.getItem('userEmail');

        if (userData && userData.name) {
            // Se tiver nome completo
            const name = userData.name;
            userNameElement.textContent = name.split(' ')[0]; // Primeiro nome
            userInitialElement.textContent = name.charAt(0).toUpperCase();
        } else if (userEmail) {
            // Se tiver apenas email
            const emailName = userEmail.split('@')[0];
            userNameElement.textContent = emailName;
            userInitialElement.textContent = emailName.charAt(0).toUpperCase();
        } else {
            // Padrão
            userNameElement.textContent = 'Usuário';
            userInitialElement.textContent = 'U';
        }
    }

    // Função para fazer logout
    function handleLogout() {
        // Confirmar logout
        const confirmLogout = confirm('Tem certeza que deseja sair?');

        if (confirmLogout) {
            // Limpar dados do localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userData');

            // Mostrar mensagem
            console.log('Logout realizado com sucesso!');

            // Redirecionar para a página de login
            window.location.href = '../../../index.html';
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initHeader);