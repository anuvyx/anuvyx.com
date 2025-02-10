// Sistema de chats con localStorage
const chatSidebar = document.getElementById('chatSidebar');
const chatHistory = document.getElementById('chatHistory');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.querySelector('.new-chat-btn');
const deleteChatsBtn = document.querySelector('.delete-chats-btn');
let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('arexChats')) || [];

// Cargar historial de chats
function loadChatHistory() {
    chatHistory.innerHTML = chats.map(chat => `
        <li class="chat-item ${chat.id === currentChatId ? 'active' : ''}" data-id="${chat.id}">
            ${new Date(chat.timestamp).toLocaleString()}
        </li>
    `).join('');
    
    // Agregar evento a cada chat para cargarlo al hacer clic
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            currentChatId = item.dataset.id;
            loadChatHistory();
            loadChatMessages();
        });
    });
}

// Cargar mensajes del chat seleccionado
function loadChatMessages() {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    chatMessages.innerHTML = '';
    chat.messages.forEach(msg => displayMessage(msg.content, msg.isUser));
}

// Nuevo chat
function createNewChat() {
    currentChatId = Date.now().toString();
    const welcomeMessage = "¡Hola! Soy Arex, el asistente de IA de Anuvyx.\n\n¿En qué puedo ayudarte hoy?\n";
    
    chats.push({
        id: currentChatId,
        timestamp: Date.now(),
        messages: [
            {
                content: welcomeMessage,
                isUser: false, // Este mensaje es del bot
                timestamp: Date.now()
            }
        ]
    });
    
    localStorage.setItem('arexChats', JSON.stringify(chats));
    loadChatHistory();
    loadChatMessages();
}

// Enviar mensaje
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Guardar mensaje del usuario
    const chat = chats.find(c => c.id === currentChatId);
    chat.messages.push({
        content: message,
        isUser: true,
        timestamp: Date.now()
    });
    
    // Mostrar mensaje del usuario
    displayMessage(message, true);
    userInput.value = '';
    
    // Mostrar indicador de carga
    const loading = showLoading();
    
    try {
        // Llamada al backend en Vercel
        const response = await fetch('https://anuvyx-com-backend.vercel.app/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            const botResponse = data.response;
            
            // Guardar y mostrar la respuesta del bot
            chat.messages.push({
                content: botResponse,
                isUser: false,
                timestamp: Date.now()
            });
            displayMessage(botResponse, false);
            
            // Guardar el historial actualizado en localStorage
            localStorage.setItem('arexChats', JSON.stringify(chats));
        } else {
            console.error('Error en la API:', data.error || 'Error desconocido');
            displayMessage(`Error: ${data.error || 'Ocurrió un error al procesar tu solicitud.'}`, false);
        }
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        displayMessage('Error: No se pudo conectar con el servidor.', false);
    } finally {
        loading.remove();
    }
}

// Mostrar mensajes
function displayMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    // Procesar Markdown usando marked.js
    let processedContent = marked.parse(content);

    // Detectar y envolver expresiones matemáticas en delimitadores de MathJax
    processedContent = processedContent.replace(/\\\(.+?\\\)/g, match => match); // Inline math (\(...\))
    processedContent = processedContent.replace(/\\\[.+?\\\]/g, match => match); // Display math (\[...\])
    processedContent = processedContent.replace(/\$.+?\$/g, match => `\\(${match.slice(1, -1)}\\)`); // Convert $...$ to \(...\)
    processedContent = processedContent.replace(/\\boxed\{(.+?)\}/g, match => `\\boxed{${match.slice(7, -1)}}`); // Handle \boxed{}

    // Insertar el contenido procesado
    messageDiv.innerHTML = processedContent;

    // Agregar el mensaje al contenedor de mensajes
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Actualizar MathJax para renderizar las expresiones matemáticas
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise([messageDiv]).catch(err => console.error('Error al renderizar MathJax:', err));
    }
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
userInput.addEventListener('keydown', e => e.key === 'Enter' && sendMessage());

// Inicializar primer chat
if (chats.length === 0) {
    createNewChat();
} else {
    currentChatId = chats[0].id;
    loadChatHistory();
    loadChatMessages();
}

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

// Función para eliminar todos los chats
deleteChatsBtn.addEventListener('click', () => {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar todos los chats?');
    if (confirmDelete) {
        chats = [];
        localStorage.removeItem('arexChats');
        chatHistory.innerHTML = '';
        chatMessages.innerHTML = '';
        alert('Todos los chats han sido eliminados.');
    }
});
