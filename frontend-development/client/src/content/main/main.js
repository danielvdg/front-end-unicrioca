 const todoInput = document.getElementById('todo-input');
        const addBtn = document.getElementById('add-btn');
        const todoList = document.getElementById('todo-list');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const taskCount = document.getElementById('task-count');

        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        let currentFilter = 'all';

        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }


    function addTodo() {
        const text = todoInput.value.trim();
        
        if (text === '') {
            alert('Por favor, digite uma tarefa!');
            return;
        }

        // ===== INTEGRAÇÃO COM A API PARA CRIAR TAREFA =====
        // Comentários explicando cada fluxo em PT-BR:
        // 1. Recupera o token de autenticação do localStorage
        // 2. Chama o endpoint /tasks da API com método POST
        // 3. Envia o token no header Authorization (Bearer token)
        // 4. Envia os dados da tarefa (title, description, deadline) no body
        // 5. Se sucesso, adiciona a tarefa na lista local e renderiza
        // 6. Se erro, mostra mensagem de erro

        // Recuperar o token de autenticação salvo no login
        const token = localStorage.getItem('authToken');
        
        // Verificar se o usuário está autenticado
        if (!token) {
            alert('Você precisa estar logado para criar tarefas!');
            window.location.href = '../../auth/login/login.html'; // Redireciona para login
            return;
        }

        // Preparar os dados da tarefa
        // Você pode adicionar campos extras como description e deadline
        const taskData = {
            title: text,
            description: text, // Pode ser o mesmo do título ou um campo separado
            deadline: new Date().toISOString().split('T')[0] // Data de hoje no formato YYYY-MM-DD
            // Se quiser permitir o usuário escolher a data, adicione um input de data no HTML
        };

        // Fazer a requisição para criar a tarefa na API
        fetch('http://127.0.0.1:8000/tasks', {
            method: 'POST', // Método para criar novo recurso
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`, // Token de autenticação (IMPORTANTE!)
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData) // Converte os dados para JSON
        })
        .then(async (response) => {
            // Tratamento da resposta da API
            
            // Se houver erro (token inválido, expirado, ou erro no servidor)
            if (!response.ok) {
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Se não for JSON, ignora
                }
                
                // Se for erro 401 (não autorizado), redireciona para login
                if (response.status === 401) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('authToken'); // Remove token inválido
                    window.location.href = '../login/login.html';
                    return;
                }
                
                // Lança erro para ser tratado no catch
                throw {
                    status: response.status,
                    message: errorData?.detail || 'Erro ao criar tarefa'
                };
            }
            
            // Se sucesso, converte a resposta para JSON
            return response.json();
        })
        .then((data) => {
            // Fluxo de sucesso: tarefa criada na API
            
            console.log('Tarefa criada com sucesso na API!');
            console.log('Resposta da API:', data);
            
            // Criar objeto da tarefa para adicionar na lista local
            // Usar o ID retornado pela API (não Date.now())
            const todo = {
                id: data.id,              // ID retornado pela API
                text: data.title,         // Título da tarefa
                completed: data.completed || false, // Status (se a API retornar)
                description: data.description,
                deadline: data.deadline
            };
            
            // Adicionar na lista local
            todos.push(todo);
            saveTodos(); // Salvar no localStorage
            
            // Limpar o input
            todoInput.value = '';
            
            // Renderizar a lista atualizada
            renderTodos();
        })
        .catch((error) => {
            // Fluxo de erro: problema na criação da tarefa
            
            console.error('Erro ao criar tarefa:', error);
            
            // Mostrar mensagem de erro para o usuário
            alert(error.message || 'Ocorreu um erro ao criar a tarefa. Tente novamente.');
        });
        // ===== FIM DA INTEGRAÇÃO COM FETCH =====
    }
        
// Função para editar tarefa
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('Editar tarefa:', todo.text);
    
    if (newText !== null && newText.trim() !== '') {
        // ===== INTEGRAÇÃO COM A API PARA EDITAR TAREFA =====
        // Comentários explicando cada fluxo em PT-BR:
        // 1. Recupera o token de autenticação do localStorage
        // 2. Chama o endpoint /tasks/{id} da API com método PUT
        // 3. Envia o token no header Authorization (Bearer token)
        // 4. Envia os dados atualizados da tarefa no body
        // 5. Se sucesso, atualiza a tarefa na lista local e renderiza
        // 6. Se erro, mostra mensagem de erro

        // Recuperar o token de autenticação
        const token = localStorage.getItem('authToken');
        
        // Verificar se o usuário está autenticado
        if (!token) {
            alert('Você precisa estar logado para editar tarefas!');
            window.location.href = '../login/login.html';
            return;
        }

        // Preparar os dados atualizados da tarefa
        const updatedTaskData = {
            title: newText.trim(),
            description: todo.description || newText.trim(), // Mantém a descrição existente ou usa o novo título
            deadline: todo.deadline || new Date().toISOString().split('T')[0] // Mantém o deadline existente
        };

        // Fazer a requisição para atualizar a tarefa na API
        fetch(`http://127.0.0.1:8000/tasks/${id}`, {
            method: 'PUT', // Método para atualizar recurso existente
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`, // Token de autenticação
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTaskData) // Converte os dados para JSON
        })
        .then(async (response) => {
            // Tratamento da resposta da API
            
            // Se houver erro (token inválido, tarefa não encontrada, etc.)
            if (!response.ok) {
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Se não for JSON, ignora
                }
                
                // Se for erro 401 (não autorizado), redireciona para login
                if (response.status === 401) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('authToken');
                    window.location.href = '../../auth/login/login.html';
                    return;
                }
                
                // Se for erro 404 (tarefa não encontrada)
                if (response.status === 404) {
                    alert('Tarefa não encontrada.');
                    return;
                }
                
                // Lança erro para ser tratado no catch
                throw {
                    status: response.status,
                    message: errorData?.detail || 'Erro ao editar tarefa'
                };
            }
            
            // Se sucesso, converte a resposta para JSON
            return response.json();
        })
        .then((data) => {
            // Fluxo de sucesso: tarefa atualizada na API
            
            console.log('Tarefa editada com sucesso na API!');
            console.log('Resposta da API:', data);
            
            // Atualizar a tarefa na lista local com os dados retornados pela API
            todo.text = data.title;
            todo.description = data.description;
            todo.deadline = data.deadline;
            
            // Salvar no localStorage
            saveTodos();
            
            // Renderizar a lista atualizada
            renderTodos();
        })
        .catch((error) => {
            // Fluxo de erro: problema na edição da tarefa
            
            console.error('Erro ao editar tarefa:', error);
            
            // Mostrar mensagem de erro para o usuário
            alert(error.message || 'Ocorreu um erro ao editar a tarefa. Tente novamente.');
        });
        // ===== FIM DA INTEGRAÇÃO COM FETCH =====
    }
}

        // function updateTaskCount() {
        //     const activeTasks = todos.filter(todo => !todo.completed).length;
        //     taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'tarefa ativa' : 'tarefas ativas'}`;
        // }

        addBtn.addEventListener('click', addTodo);

        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTodo();
            }
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTodos();
            });
        });

// Função para deletar tarefa
function deleteTodo(id) {
    // Confirmar antes de deletar
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) {
        return;
    }

    // ===== INTEGRAÇÃO COM A API PARA DELETAR TAREFA =====
    // Comentários explicando cada fluxo em PT-BR:
    // 1. Recupera o token de autenticação do localStorage
    // 2. Chama o endpoint /tasks/{id} da API com método DELETE
    // 3. Envia o token no header Authorization (Bearer token)
    // 4. Se sucesso, remove a tarefa da lista local e renderiza
    // 5. Se erro, mostra mensagem de erro

    // Recuperar o token de autenticação
    const token = localStorage.getItem('authToken');
    
    // Verificar se o usuário está autenticado
    if (!token) {
        alert('Você precisa estar logado para deletar tarefas!');
        window.location.href = '../../auth/login/login.html';
        return;
    }

    // Fazer a requisição para deletar a tarefa na API
    fetch(`http://127.0.0.1:8000/tasks/${id}`, {
        method: 'DELETE', // Método para deletar recurso
        headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}` // Token de autenticação
        }
    })
    .then(async (response) => {
        // Tratamento da resposta da API
        
        // Se houver erro (token inválido, tarefa não encontrada, etc.)
        if (!response.ok) {
            let errorData = null;
            try {
                errorData = await response.json();
            } catch (e) {
                // Se não for JSON, ignora
            }
            
            // Se for erro 401 (não autorizado), redireciona para login
            if (response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                localStorage.removeItem('authToken');
                window.location.href = '../../auth/login/login.html';
                return;
            }
            
            // Se for erro 404 (tarefa não encontrada)
            if (response.status === 404) {
                alert('Tarefa não encontrada.');
                // Remove da lista local mesmo assim
                todos = todos.filter(todo => todo.id !== id);
                saveTodos();
                renderTodos();
                return;
            }
            
            // Lança erro para ser tratado no catch
            throw {
                status: response.status,
                message: errorData?.detail || 'Erro ao deletar tarefa'
            };
        }
        
        // DELETE geralmente retorna 204 No Content ou 200 OK
        // Não precisa converter para JSON se for 204
        if (response.status === 204) {
            return null;
        }
        
        // Se retornar algum conteúdo, converte para JSON
        return response.json();
    })
    .then((data) => {
        // Fluxo de sucesso: tarefa deletada na API
        
        console.log('Tarefa deletada com sucesso na API!');
        if (data) {
            console.log('Resposta da API:', data);
        }
        
        // Remover a tarefa da lista local
        todos = todos.filter(todo => todo.id !== id);
        
        // Salvar no localStorage
        saveTodos();
        
        // Renderizar a lista atualizada
        renderTodos();
    })
    .catch((error) => {
        // Fluxo de erro: problema ao deletar tarefa
        
        console.error('Erro ao deletar tarefa:', error);
        
        // Mostrar mensagem de erro para o usuário
        alert(error.message || 'Ocorreu um erro ao deletar a tarefa. Tente novamente.');
    });
    // ===== FIM DA INTEGRAÇÃO COM FETCH =====
}

        function toggleTodo(id) {
            const todo = todos.find(todo => todo.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                saveTodos();
                renderTodos();
            }
        }

// Função para buscar tarefas da API
function fetchTodos() {
    // ===== INTEGRAÇÃO COM A API PARA BUSCAR TAREFAS =====
    // Comentários explicando cada fluxo em PT-BR:
    // 1. Recupera o token de autenticação do localStorage
    // 2. Chama o endpoint /tasks da API com método GET
    // 3. Envia o token no header Authorization (Bearer token)
    // 4. Se sucesso, atualiza a lista local com as tarefas da API
    // 5. Se erro, mostra mensagem de erro
    
    // Recuperar o token de autenticação
    const token = localStorage.getItem('authToken');
    
    // Verificar se o usuário está autenticado
    if (!token) {
        alert('Você precisa estar logado para ver suas tarefas!');
        window.location.href = '../../auth/login/login.html';
        return;
    }

    // Fazer a requisição para buscar as tarefas da API
    fetch('http://127.0.0.1:8000/tasks', {
        method: 'GET', // Método para buscar recursos
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}` // Token de autenticação
        }
    })
    .then(async (response) => {
        // Tratamento da resposta da API
        
        // Se houver erro (token inválido, expirado, etc.)
        if (!response.ok) {
            let errorData = null;
            try {
                errorData = await response.json();
            } catch (e) {
                // Se não for JSON, ignora
            }
            
            // Se for erro 401 (não autorizado), redireciona para login
            if (response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                localStorage.removeItem('authToken');
                window.location.href = '../../auth/login/login.html';
                return;
            }
            
            // Lança erro para ser tratado no catch
            throw {
                status: response.status,
                message: errorData?.detail || 'Erro ao buscar tarefas'
            };
        }
        
        // Se sucesso, converte a resposta para JSON
        return response.json();
    })
    .then((data) => {
        // Fluxo de sucesso: tarefas recebidas da API
        
        console.log('Tarefas carregadas da API!');
        console.log('Resposta da API:', data);
        
        // Limpar a lista local e preencher com as tarefas da API
        todos = [];
        
        // A API retorna { "tasks": [...] }, então acessamos data.tasks
        if (data.tasks && Array.isArray(data.tasks)) {
            data.tasks.forEach(task => {
                // Converter o formato da API para o formato local
                todos.push({
                    id: task.id,
                    text: task.title,
                    completed: task.completed || false,
                    description: task.description,
                    deadline: task.deadline,
                    created_at: task.created_at
                });
            });
        }
        
        // Salvar no localStorage (cache local)
        saveTodos();
        
        // Renderizar as tarefas na tela
        renderTodos();
    })
    .catch((error) => {
        // Fluxo de erro: problema ao buscar tarefas
        
        console.error('Erro ao buscar tarefas:', error);
        
        // Mostrar mensagem de erro para o usuário
        alert(error.message || 'Ocorreu um erro ao carregar as tarefas. Tente novamente.');
    });
    // ===== FIM DA INTEGRAÇÃO COM FETCH =====
}

// Função para renderizar tarefas (ajustada)
function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-message">Nenhuma tarefa encontrada</div>';
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            // Formatar a data de deadline (se existir)
            const deadlineText = todo.deadline ? `<span class="deadline">Prazo: ${formatDate(todo.deadline)}</span>` : '';
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <div class="todo-content">
                    <span class="todo-text">${todo.text}</span>
                    ${todo.description && todo.description !== todo.text ? `<span class="todo-description">${todo.description}</span>` : ''}
                    ${deadlineText}
                </div>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="editTodo(${todo.id})" title="Editar">
                        Editar
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})" title="Deletar">
                        Deletar
                    </button>
                </div>
            `;
            
            todoList.appendChild(li);
        });
    }

    updateTaskCount();
}

// Função auxiliar para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Função para atualizar contador de tarefas (mantém igual)
function updateTaskCount() {
    const activeTasks = todos.filter(todo => !todo.completed).length;
    taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'tarefa ativa' : 'tarefas ativas'}`;
}

// Chamar fetchTodos() quando a página carregar
// Adicione isso no final do seu script ou no evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Carregar tarefas da API ao iniciar
    fetchTodos();
    
    // Resto da inicialização...
});