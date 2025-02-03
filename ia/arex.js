// Sistema de chats con localStorage
const chatSidebar = document.getElementById('chatSidebar');
const chatHistory = document.getElementById('chatHistory');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.querySelector('.new-chat-btn');

let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('arexChats')) || [];

// Cargar historial de chats
function loadChatHistory() {
    chatHistory.innerHTML = chats.map(chat => `
        <li class="chat-item ${chat.id === currentChatId ? 'active' : ''}" data-id="${chat.id}">
            ${new Date(chat.timestamp).toLocaleString()}
        </li>
    `).join('');
}

// Nuevo chat
function createNewChat() {
    currentChatId = Date.now().toString();
    chats.push({
        id: currentChatId,
        timestamp: Date.now(),
        messages: []
    });
    localStorage.setItem('arexChats', JSON.stringify(chats));
    loadChatHistory();
    chatMessages.innerHTML = '';
}

// Enviar mensaje
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Guardar mensaje
    const chat = chats.find(c => c.id === currentChatId);
    chat.messages.push({
        content: message,
        isUser: true,
        timestamp: Date.now()
    });

    // Mostrar mensaje
    displayMessage(message, true);
    userInput.value = '';

    // Simular respuesta de API
    const loading = showLoading();
    
    // Aquí iría la llamada real a la API
    setTimeout(async () => {
        loading.remove();
        const response = `Respuesta simulada para: "${message}". En la implementación real, esto se conectaría a la API de Arex.`;
        
        chat.messages.push({
            content: response,
            isUser: false,
            timestamp: Date.now()
        });
        
        displayMessage(response, false);
        localStorage.setItem('arexChats', JSON.stringify(chats));
    }, 1500);
}

// Mostrar mensajes
function displayMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Mostrar carga
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading-dots';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}

// Event Listeners
newChatBtn.addEventListener('click', createNewChat);
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => e.key === 'Enter' && sendMessage());

// Inicializar primer chat
if (chats.length === 0) createNewChat();
else currentChatId = chats[0].id;
loadChatHistory();

// Toggle del sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    sidebar.classList.toggle('hidden');
    
    // Guardar estado
    const isHidden = sidebar.classList.contains('hidden');
    localStorage.setItem('sidebarState', isHidden ? 'hidden' : 'visible');
}

// Event listeners para ambos botones
document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
document.getElementById('floatingToggle').addEventListener('click', toggleSidebar);

// Cargar estado al iniciar
window.addEventListener('load', () => {
    const sidebarState = localStorage.getItem('sidebarState');
    const sidebar = document.getElementById('chatSidebar');
    
    if (sidebarState === 'hidden' && window.innerWidth >= 769) {
        sidebar.classList.add('hidden');
    }
});