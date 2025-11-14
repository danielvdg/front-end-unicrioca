// config.js

/**
 * Configurações da API TodoList
 * Centraliza todas as configurações de integração
 */
const APIConfig = {
  // URL base da API
  baseURL: 'http://127.0.0.1:8000',
  
  // Timeout para requisições (em milissegundos)
  timeout: 30000,
  
  // Endpoints da API
  endpoints: {
    auth: {
      signup: '/auth/signup',
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh'
    },
    todos: {
      list: '/todos',
      create: '/todos',
      update: '/todos/:id',
      delete: '/todos/:id',
      getById: '/todos/:id'
    }
  },
  
  // Headers padrão para todas as requisições
  defaultHeaders: {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  },
  
  // Configurações de armazenamento
  storage: {
    tokenKey: 'todolist_auth_token',
    userKey: 'todolist_user_data'
  },
  
  // Configurações de retry
  retry: {
    maxAttempts: 3,
    delay: 1000 // em milissegundos
  },
  
  // Mensagens de erro padrão
  errorMessages: {
    network: 'Erro de conexão com o servidor',
    unauthorized: 'Não autorizado. Faça login novamente',
    forbidden: 'Acesso negado',
    notFound: 'Recurso não encontrado',
    serverError: 'Erro interno do servidor',
    timeout: 'Tempo de requisição esgotado',
    validation: 'Dados inválidos'
  }
};

// Exporta a configuração
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIConfig;
}

// Para ES6 Modules
// export default APIConfig;