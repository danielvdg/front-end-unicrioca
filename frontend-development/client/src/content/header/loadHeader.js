// src/content/header/loadHeader.js
async function loadHeader() {
    try {
        const response = await fetch('../header/header.html');
        const headerHTML = await response.text();
        document.querySelector('header').innerHTML = headerHTML;
        
        // Inicializar funcionalidades do header após carregar
        if (typeof initHeader === 'function') {
            initHeader();
        }
    } catch (error) {
        console.error('Erro ao carregar o header:', error);
    }
}

// Carregar o header quando a página carregar
document.addEventListener('DOMContentLoaded', loadHeader);