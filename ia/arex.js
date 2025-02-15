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

// Mostrar carga con contador regresivo
function showLoadingWithCounter() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading-dots';
    let countdown = 60; // Contador inicial
    loadingDiv.textContent = `Generando respuesta (${countdown}s)`;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Actualizar el contador cada segundo
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown >= 0) {
            loadingDiv.textContent = `Generando respuesta (${countdown}s)`;
        } else {
            clearInterval(countdownInterval); // Detener el contador si llega a 0
        }
    }, 1000);

    return { loadingDiv, countdownInterval };
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

    // Mostrar indicador de carga con contador
    const { loadingDiv, countdownInterval } = showLoadingWithCounter();

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
        // Detener el contador y eliminar el mensaje de carga
        clearInterval(countdownInterval);
        loadingDiv.remove();
    }
}

// Mostrar mensajes
function displayMessage(content, isUser) {
    // Crear el contenedor principal del mensaje
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
    
    // Crear un contenedor separado para el botón de copia
    const copyButtonContainer = document.createElement('div');
    copyButtonContainer.style.display = 'flex';
    copyButtonContainer.style.justifyContent = isUser ? 'flex-end' : 'flex-start'; // Alineación según el tipo de mensaje
    copyButtonContainer.style.marginTop = '5px'; // Espacio entre el mensaje y el botón
    
    // Crear botón de copia con ícono SVG
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.style.padding = '5px'; // Tamaño del botón
    copyButton.style.backgroundColor = 'transparent'; // Fondo transparente
    copyButton.style.border = 'none'; // Sin borde
    copyButton.style.cursor = 'pointer'; // Cursor de puntero
    copyButton.style.display = 'flex'; // Para alinear el ícono correctamente
    copyButton.style.alignItems = 'center'; // Centrar verticalmente el ícono
    
    // SVG del ícono de copia
    copyButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
    `;
    
    // Agregar evento al botón de copia
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(content).then(() => {
            // Cambiar temporalmente el ícono a "copiado"
            copyButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            setTimeout(() => {
                // Volver al ícono de copia después de 2 segundos
                copyButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                `;
            }, 2000); // Cambiar el ícono de vuelta a "copiar" después de 2 segundos
        }).catch(err => {
            console.error('Error al copiar el texto: ', err);
            alert('No se pudo copiar el texto.');
        });
    });
    
    // Agregar el botón de copia al contenedor separado
    copyButtonContainer.appendChild(copyButton);
    
    // Agregar el contenedor del botón de copia al área de mensajes
    chatMessages.appendChild(copyButtonContainer);
    
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

// Ajustar dinámicamente la altura del textarea
function autoResizeTextarea() {
    userInput.style.height = 'auto'; // Resetea la altura
    userInput.style.height = `${userInput.scrollHeight}px`; // Ajusta la altura al contenido
}

// Escuchar eventos de entrada para ajustar la altura
userInput.addEventListener('input', autoResizeTextarea);

// Inicializar la altura al cargar la página
autoResizeTextarea();

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
