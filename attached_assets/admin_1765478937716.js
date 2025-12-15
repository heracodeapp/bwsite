// Admin Panel JavaScript - Versão Corrigida
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// Global variables
let currentQuotes = [];
let currentProjects = [];
let currentQuoteId = null;
let currentProjectId = null;

// Initialize admin functionality
function initializeAdmin() {
    // Check authentication status
    if (isAuthenticated()) {
        showDashboard();
        initializeDashboard();
    } else {
        showLogin();
        initializeLoginForm();
    }
}

// Authentication functions
function isAuthenticated() {
    return localStorage.getItem('admin_authenticated') === 'true';
}

function showLogin() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
}

// Initialize login form
function initializeLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorDiv = document.getElementById('login-error');

        // Clear previous errors
        errorDiv.style.display = 'none';

        try {
            // AQUI ESTÁ A CORREÇÃO: Chamamos a função de login da API
            const result = await window.BragaWorkDB.login(username, password);

            if (result.success) {
                localStorage.setItem('admin_authenticated', 'true');
                showDashboard();
                initializeDashboard();
            } else {
                errorDiv.textContent = result.message || 'Usuário ou senha incorretos.';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.';
            errorDiv.style.display = 'block';
        }
    });
}

// Initialize dashboard
function initializeDashboard() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    loadQuotes();
    loadProjects();

    setupMediaPreview();
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

async function loadQuotes() {
    try {
        const quotes = await window.BragaWorkDB.getQuotes();
        currentQuotes = quotes;
        displayQuotes(quotes);
        updateQuotesBadge(quotes);
    } catch (error) {
        console.error('Error loading quotes:', error);
        displayQuotes([]);
    }
}

function displayQuotes(quotes) {
    const container = document.getElementById('quotes-tab');
    if (!container) return;

    if (quotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Nenhuma solicitação encontrada</h3>
                <p>Não há solicitações de orçamento no momento.</p>
            </div>
        `;
        return;
    }

    const quotesHtml = quotes.map(quote => `
        <div class="quote-card">
            <div class="quote-header">
                <h3>${quote.firstName} ${quote.lastName}</h3>
                <span class="status-badge status-${quote.status}">${getStatusText(quote.status)}</span>
            </div>
            <div class="quote-details">
                <p><i class="fas fa-envelope"></i> ${quote.email}</p>
                <p><i class="fas fa-phone"></i> ${quote.countryCode} ${quote.phone}</p>
                <p><i class="fas fa-calendar"></i> ${formatDate(quote.createdAt || quote.created_at)}</p>
            </div>
            <div class="quote-description">
                <p>${quote.projectDescription}</p>
            </div>
            <div class="quote-actions">
                <button class="btn btn-secondary" onclick="viewQuote(${quote.id})">
                    <i class="fas fa-eye"></i> Visualizar
                </button>
                <button class="btn btn-primary" onclick="editQuoteStatus(${quote.id})">
                    <i class="fas fa-edit"></i> Status
                </button>
                <button class="btn btn-danger" onclick="deleteQuote(${quote.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="tab-header">
            <h2>Solicitações de Orçamento</h2>
            <button class="btn btn-secondary" onclick="refreshQuotes()">
                <i class="fas fa-sync-alt"></i> Atualizar
            </button>
        </div>
        <div class="quotes-grid">
            ${quotesHtml}
        </div>
    `;
}

async function loadProjects() {
    try {
        const projects = await window.BragaWorkDB.getProjects();
        currentProjects = projects;
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        displayProjects([]);
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projects-tab');
    if (!container) return;

    const projectsHtml = projects.map(project => `
        <div class="project-card">
            <div class="project-media">
                ${project.mediaType === 'video' ?
                    `<video src="${project.mediaUrl}" controls></video>` :
                    `<img src="${project.mediaUrl}" alt="${project.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Indisponível'">`
                }
            </div>
            <div class="project-content">
                <h3>${project.title}</h3>
                <p>${project.description || 'Sem descrição'}</p>
                <div class="project-status">
                    <span class="status-indicator ${project.isActive ? 'active' : 'inactive'}">
                        ${project.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                <div class="project-actions">
                    <button class="btn btn-secondary" onclick="editProject(${project.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteProject(${project.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="tab-header">
            <h2>Gerenciar Projetos</h2>
            <button class="btn btn-primary" onclick="addNewProject()">
                <i class="fas fa-plus"></i> Adicionar Projeto
            </button>
        </div>
        <div class="projects-grid">
            ${projectsHtml}
        </div>
    `;
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'in_progress': 'Em Andamento',
        'completed': 'Concluído',
        'rejected': 'Rejeitado'
    };
    return statusMap[status] || 'Pendente';
}

function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Data inválida';
    }
}

function updateQuotesBadge(quotes) {
    const badge = document.getElementById('quotes-badge');
    if (!badge) return;

    const pendingCount = quotes.filter(q => q.status === 'pending').length;
    badge.textContent = pendingCount;
    badge.style.display = pendingCount > 0 ? 'inline' : 'none';
}

function viewQuote(quoteId) {
    const quote = currentQuotes.find(q => q.id == quoteId);
    if (!quote) return;

    alert(`
        Nome: ${quote.firstName} ${quote.lastName}
        Email: ${quote.email}
        Telefone: ${quote.countryCode} ${quote.phone}
        Status: ${getStatusText(quote.status)}
        Data: ${formatDate(quote.createdAt || quote.created_at)}

        Descrição do Projeto:
        ${quote.projectDescription}
    `);
}

function editQuoteStatus(quoteId) {
    const quote = currentQuotes.find(q => q.id == quoteId);
    if (!quote) return;

    const newStatus = prompt(`Status atual: ${getStatusText(quote.status)}\n\nEscolha o novo status:\n- pending (Pendente)\n- in_progress (Em Andamento)\n- completed (Concluído)\n- rejected (Rejeitado)`, quote.status);

    if (newStatus && ['pending', 'in_progress', 'completed', 'rejected'].includes(newStatus)) {
        updateQuoteStatus(quoteId, newStatus);
    }
}

async function updateQuoteStatus(quoteId, status) {
    try {
        await window.BragaWorkDB.updateQuoteStatus(quoteId, status);
        showNotification('Status atualizado com sucesso!');
        loadQuotes();
    } catch (error) {
        console.error('Error updating quote status:', error);
        showNotification('Erro ao atualizar status.', 'error');
    }
}

async function deleteQuote(quoteId) {
    if (!confirm('Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        await window.BragaWorkDB.deleteQuote(quoteId);
        showNotification('Solicitação excluída com sucesso!');
        loadQuotes();
    } catch (error) {
        console.error('Error deleting quote:', error);
        showNotification('Erro ao excluir solicitação.', 'error');
    }
}

async function refreshQuotes() {
    showNotification('Atualizando solicitações...');
    await loadQuotes();
    showNotification('Solicitações atualizadas!');
}

function addNewProject() {
    currentProjectId = null;

    const title = prompt('Digite o título do projeto:');
    if (!title) return;

    const description = prompt('Digite a descrição do projeto (opcional):') || '';
    const isActive = confirm('O projeto deve aparecer no carrossel?');

    const projectData = {
        title: title.trim(),
        description: description.trim(),
        mediaUrl: 'https://via.placeholder.com/600x400?text=' + encodeURIComponent(title),
        mediaType: 'image',
        isActive: isActive
    };

    saveProject(projectData);
}

function editProject(projectId) {
    const project = currentProjects.find(p => p.id == projectId);
    if (!project) return;

    const title = prompt('Digite o novo título:', project.title);
    if (!title) return;

    const description = prompt('Digite a nova descrição:', project.description || '') || '';
    const isActive = confirm('O projeto deve aparecer no carrossel?');

    const projectData = {
        id: projectId,
        title: title.trim(),
        description: description.trim(),
        isActive: isActive
    };

    saveProject(projectData);
}

async function saveProject(projectData) {
    try {
        await window.BragaWorkDB.saveProject(projectData);
        showNotification(projectData.id ? 'Projeto atualizado com sucesso!' : 'Projeto adicionado com sucesso!');
        loadProjects();
    } catch (error) {
        console.error('Error saving project:', error);
        showNotification('Erro ao salvar projeto.', 'error');
    }
}

async function deleteProject(projectId) {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        await window.BragaWorkDB.deleteProject(projectId);
        showNotification('Projeto excluído com sucesso!');
        loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('Erro ao excluir projeto.', 'error');
    }
}

function setupMediaPreview() {
    console.log('Media preview setup ready');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        zIndex: '10000',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#00bfff' : '#ff6b6b'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('admin_authenticated');
        location.reload();
    }
}