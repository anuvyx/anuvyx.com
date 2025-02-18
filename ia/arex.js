// Sistema de chats con localStorage
const chatSidebar = document.getElementById('chatSidebar');
const chatHistory = document.getElementById('chatHistory');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.querySelector('.new-chat-btn');
const deleteChatsBtn = document.querySelector('.delete-chats-btn');
let currentChatId = null;
let currentOptionsMenu = null;
let abortController = null;
let chats = JSON.parse(localStorage.getItem('arexChats')) || [];

// Cargar historial de chats
function loadChatHistory() {
    // Ordenar los chats de más nuevo a más antiguo
    const sortedChats = [...chats].sort((a, b) => b.timestamp - a.timestamp);

    chatHistory.innerHTML = sortedChats.map(chat => `
        <li class="chat-item ${chat.id === currentChatId ? 'active' : ''}" data-id="${chat.id}">
            <div class="chat-info">
                <span>${chat.name || new Date(chat.timestamp).toLocaleString()}</span>
            </div>
            <button class="chat-options-btn" aria-label="Opciones del chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="6" r="1"></circle>
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="18" r="1"></circle>
                </svg>
            </button>
        </li>
    `).join('');

    // Agregar evento a cada chat para cargarlo al hacer clic
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            currentChatId = item.dataset.id;
            localStorage.setItem('selectedChatId', currentChatId); // Guardar el ID del chat seleccionado
            loadChatHistory();
            loadChatMessages();
        });
    });

    // Agregar eventos a los botones de opciones
    document.querySelectorAll('.chat-options-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el clic abra el chat
            const chatId = button.closest('.chat-item').dataset.id;
            showChatOptions(chatId); // Mostrar opciones para este chat
        });
    });
}

// Función para mostrar opciones del chat
function showChatOptions(chatId) {
    const button = document.querySelector(`.chat-item[data-id="${chatId}"] .chat-options-btn`);

    // Verificar si ya hay un menú abierto
    if (currentOptionsMenu && currentOptionsMenu.parentElement === button.parentElement) {
        // Si el menú ya está abierto, cerrarlo
        currentOptionsMenu.remove();
        currentOptionsMenu = null;
        return;
    }

    // Cerrar cualquier menú previamente abierto
    if (currentOptionsMenu) {
        currentOptionsMenu.remove();
        currentOptionsMenu = null;
    }

    // Crear el menú de opciones
    const menu = document.createElement('div');
    menu.className = 'chat-options-menu';
    menu.style.position = 'absolute';
    menu.style.right = '0';
    menu.style.top = '100%';
    menu.style.backgroundColor = '#111';
    menu.style.border = '1px solid #333';
    menu.style.borderRadius = '8px';
    menu.style.padding = '0.5rem 0';
    menu.style.zIndex = '1000';
    menu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';

    // Opción de renombrar
    const renameOption = document.createElement('button');
    renameOption.className = 'chat-option';
    renameOption.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
        Renombrar
    `;
    renameOption.addEventListener('click', () => {
        const newName = prompt("Introduce un nuevo nombre para este chat:");
        if (newName && newName.trim()) {
            renameChat(chatId, newName.trim());
        }
        menu.remove(); // Cerrar el menú después de la acción
        currentOptionsMenu = null; // Limpiar la referencia
    });

    // Opción de eliminar
    const deleteOption = document.createElement('button');
    deleteOption.className = 'chat-option';
    deleteOption.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
        </svg>
        Eliminar
    `;
    deleteOption.addEventListener('click', () => {
        if (confirm("¿Estás seguro de que quieres eliminar este chat?")) {
            deleteChat(chatId);
        }
        menu.remove(); // Cerrar el menú después de la acción
        currentOptionsMenu = null; // Limpiar la referencia
    });

    // Agregar opciones al menú
    menu.appendChild(renameOption);
    menu.appendChild(deleteOption);

    // Añadir el menú al DOM
    button.parentElement.appendChild(menu);

    // Guardar la referencia al menú actual
    currentOptionsMenu = menu;

    // Cerrar el menú si se hace clic fuera
    document.addEventListener('click', handleOutsideClick);
}

// Función para manejar clics fuera del menú
function handleOutsideClick(e) {
    if (currentOptionsMenu && !currentOptionsMenu.contains(e.target)) {
        currentOptionsMenu.remove();
        currentOptionsMenu = null;
        document.removeEventListener('click', handleOutsideClick); // Remover el listener después de cerrar
    }
}

// Función para eliminar un chat específico
function deleteChat(chatId) {
    chats = chats.filter(chat => chat.id !== chatId);
    localStorage.setItem('arexChats', JSON.stringify(chats));
    loadChatHistory();
    if (currentChatId === chatId) {
        chatMessages.innerHTML = ''; // Limpiar mensajes si el chat activo es eliminado
    }
}

// Función para renombrar un chat
function renameChat(chatId, newName) {
    const chat = chats.find(chat => chat.id === chatId);
    if (chat) {
        chat.name = newName; // Actualizar el nombre del chat
        localStorage.setItem('arexChats', JSON.stringify(chats)); // Guardar en localStorage
        loadChatHistory(); // Recargar el historial para reflejar el cambio
    }
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
    localStorage.setItem('selectedChatId', currentChatId); // Guardar el ID del nuevo chat
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

// Función para enviar mensaje
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

    // Crear un nuevo AbortController para esta solicitud
    abortController = new AbortController();

    try {
        // Cambiar el botón de "Enviar" a "Cancelar"
        sendBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
        `;
        sendBtn.style.backgroundColor = '#FF0000E6';
        sendBtn.onclick = cancelRequest; // Asignar la función de cancelación

        // Llamada al backend en Vercel
        const response = await fetch('https://anuvyx-com-backend.vercel.app/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message
            }),
            signal: abortController.signal // Pasar la señal de aborto
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
        if (error.name === 'AbortError') {
            console.log('Solicitud cancelada por el usuario.');
            displayMessage('Solicitud cancelada.', false);
        } else {
            console.error('Error al enviar el mensaje:', error);
            displayMessage('Error: No se pudo conectar con el servidor.', false);
        }
    } finally {
        // Restaurar el botón de "Enviar"
        sendBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        `;
        sendBtn.style.backgroundColor = '#ffffff';
        sendBtn.onclick = sendMessage; // Restaurar la función de envío

        // Detener el contador y eliminar el mensaje de carga
        clearInterval(countdownInterval);
        loadingDiv.remove();
    }
}

// Función para cancelar la solicitud
function cancelRequest() {
    if (abortController) {
        abortController.abort(); // Cancelar la solicitud
        abortController = null; // Limpiar el controlador
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

// Inicializar primer chat o cargar el chat previamente seleccionado
window.addEventListener('load', () => {
    const sidebarState = localStorage.getItem('sidebarState');
    const sidebar = document.getElementById('chatSidebar');
    
    if (sidebarState === 'hidden' && window.innerWidth >= 769) {
        sidebar.classList.add('hidden');
    }

    // Verificar si hay un chat seleccionado previamente
    const savedChatId = localStorage.getItem('selectedChatId');
    if (savedChatId && chats.some(chat => chat.id === savedChatId)) {
        // Si existe un chat seleccionado previamente, cargarlo
        currentChatId = savedChatId;
    } else if (chats.length > 0) {
        // Si no hay ningún chat seleccionado, usar el primer chat disponible
        currentChatId = chats[0].id;
    } else {
        // Si no hay chats, crear uno nuevo
        createNewChat();
    }

    // Cargar el historial y los mensajes
    loadChatHistory();
    loadChatMessages();
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
