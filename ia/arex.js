(() => {
  // Cacheo de elementos del DOM
  const chatSidebar = document.getElementById('chatSidebar');
  const chatHistory = document.getElementById('chatHistory');
  const chatMessages = document.getElementById('chatMessages');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const newChatBtn = document.querySelector('.new-chat-btn');
  const deleteChatsBtn = document.querySelector('.delete-chats-btn');

  // Variables globales
  let currentChatId = null;
  let currentOptionsMenu = null;
  let abortController = null;
  let chats = JSON.parse(localStorage.getItem('arexChats')) || [];

  // Función para guardar el historial de chats en localStorage
  const saveChatsToStorage = () => {
    localStorage.setItem('arexChats', JSON.stringify(chats));
  };

  // Cargar el historial de chats
  const loadChatHistory = () => {
    const sortedChats = [...chats].sort((a, b) => b.timestamp - a.timestamp);
    chatHistory.innerHTML = sortedChats
      .map(
        (chat) => `
        <li class="chat-item ${chat.id === currentChatId ? 'active' : ''}" data-id="${chat.id}">
          <div class="chat-info">
            <span>${chat.name || new Date(chat.timestamp).toLocaleString()}</span>
          </div>
          <button class="chat-options-btn" aria-label="Opciones del chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="6" r="1"></circle>
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="18" r="1"></circle>
            </svg>
          </button>
        </li>
      `
      )
      .join('');

    chatHistory.querySelectorAll('.chat-item').forEach((item) => {
      item.addEventListener('click', () => {
        currentChatId = item.dataset.id;
        localStorage.setItem('selectedChatId', currentChatId);
        loadChatHistory();
        loadChatMessages();
      });
    });

    chatHistory.querySelectorAll('.chat-options-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = button.closest('.chat-item').dataset.id;
        showChatOptions(chatId);
      });
    });
  };

  // Mostrar menú de opciones para un chat específico
  const showChatOptions = (chatId) => {
    const button = document.querySelector(`.chat-item[data-id="${chatId}"] .chat-options-btn`);

    if (currentOptionsMenu && currentOptionsMenu.parentElement === button.parentElement) {
      currentOptionsMenu.remove();
      currentOptionsMenu = null;
      return;
    }
    if (currentOptionsMenu) {
      currentOptionsMenu.remove();
      currentOptionsMenu = null;
    }

    const menu = document.createElement('div');
    menu.className = 'chat-options-menu';
    Object.assign(menu.style, {
      position: 'absolute',
      right: '0',
      top: '100%',
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '0.5rem 0',
      zIndex: '1000',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column'
    });

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
      menu.remove();
      currentOptionsMenu = null;
    });

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
      menu.remove();
      currentOptionsMenu = null;
    });

    menu.append(renameOption, deleteOption);
    button.parentElement.appendChild(menu);
    currentOptionsMenu = menu;

    const handleOutsideClick = (e) => {
      if (currentOptionsMenu && !currentOptionsMenu.contains(e.target)) {
        currentOptionsMenu.remove();
        currentOptionsMenu = null;
        document.removeEventListener('click', handleOutsideClick);
      }
    };
    document.addEventListener('click', handleOutsideClick);
  };

  // Eliminar un chat específico
  const deleteChat = (chatId) => {
    chats = chats.filter((chat) => chat.id !== chatId);
    saveChatsToStorage();
    loadChatHistory();
    if (currentChatId === chatId) {
      chatMessages.innerHTML = '';
    }
  };

  // Renombrar un chat
  const renameChat = (chatId, newName) => {
    const chat = chats.find((chat) => chat.id === chatId);
    if (chat) {
      chat.name = newName;
      saveChatsToStorage();
      loadChatHistory();
    }
  };

  // Cargar los mensajes del chat seleccionado
  const loadChatMessages = () => {
    const chat = chats.find((c) => c.id === currentChatId);
    if (!chat) return;
    chatMessages.innerHTML = '';
    chat.messages.forEach((msg) => displayMessage(msg.content, msg.isUser));
  };

  // Crear un nuevo chat
  const createNewChat = () => {
    currentChatId = Date.now().toString();
    const welcomeMessage = "¡Hola! Soy Arex, el asistente de IA de Anuvyx.\n\n¿En qué puedo ayudarte hoy?\n";
    chats.push({
      id: currentChatId,
      timestamp: Date.now(),
      messages: [
        {
          content: welcomeMessage,
          isUser: false,
          timestamp: Date.now()
        }
      ]
    });
    saveChatsToStorage();
    localStorage.setItem('selectedChatId', currentChatId);
    loadChatHistory();
    loadChatMessages();
  };

  // Mostrar indicador de carga con contador
  const showLoadingWithCounter = () => {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.style.display = 'flex';
    loadingDiv.style.alignItems = 'center';
    loadingDiv.style.gap = '10px';

    const spinner = document.createElement('div');
    Object.assign(spinner.style, {
      border: '4px solid rgba(255, 255, 255, 0.2)',
      borderTop: '4px solid #ffffff',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      animation: 'spin 1s linear infinite'
    });

    const counter = document.createElement('span');
    let countdown = 60;
    counter.textContent = countdown;
    counter.style.fontSize = '1.2rem';
    counter.style.color = '#ffffff';
    counter.style.fontWeight = 'bold';

    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown >= 0) {
        counter.textContent = countdown;
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);

    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(counter);
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return { loadingDiv, countdownInterval };
  };

  // Enviar mensaje y gestionar respuesta de la API
  const sendMessage = async () => {
    const message = userInput.value.trim();
    if (!message) return;

    const chat = chats.find((c) => c.id === currentChatId);
    chat.messages.push({
      content: message,
      isUser: true,
      timestamp: Date.now()
    });
    displayMessage(message, true);
    userInput.value = '';
    autoResizeTextarea();

    const { loadingDiv, countdownInterval } = showLoadingWithCounter();

    abortController = new AbortController();
    sendBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 18L18 6M6 6l12 12"/>
      </svg>
    `;
    sendBtn.style.backgroundColor = '#FF0000E6';
    sendBtn.onclick = cancelRequest;

    try {
      const conversationMessages = chat.messages.map((msg) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch('https://anuvyx-com-backend.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMessages }),
        signal: abortController.signal
      });

      const botMessageDiv = document.createElement('div');
      botMessageDiv.className = 'message bot-message';
      chatMessages.appendChild(botMessageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          if (line.startsWith("data:")) {
            let jsonStr = line.replace(/^(data:\s*)+/i, '');
            if (jsonStr === "[DONE]") {
              reader.cancel();
              break;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              if (
                parsed.choices &&
                parsed.choices.length > 0 &&
                parsed.choices[0].delta &&
                parsed.choices[0].delta.content
              ) {
                botResponse += parsed.choices[0].delta.content;
              }
            } catch (error) {
              console.error("Error al parsear JSON:", error);
            }
          }
        }
        botMessageDiv.innerHTML = marked.parse(botResponse);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      enhanceMessage(botMessageDiv);

      chat.messages.push({
        content: botResponse,
        isUser: false,
        timestamp: Date.now()
      });
      saveChatsToStorage();

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Solicitud cancelada por el usuario.');
        displayMessage('Solicitud cancelada.', false);
      } else {
        console.error('Error al enviar el mensaje:', error);
        displayMessage('Error: No se pudo conectar con el servidor.', false);
      }
    } finally {
      sendBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      `;
      sendBtn.style.backgroundColor = '#ffffff';
      sendBtn.onclick = sendMessage;
      clearInterval(countdownInterval);
      loadingDiv.remove();
    }
  };

  // Función para aplicar mejoras de formato al mensaje del bot
  function enhanceMessage(messageDiv) {
    const codeBlocks = messageDiv.querySelectorAll('pre > code');
    codeBlocks.forEach((codeBlock) => {
      const language = codeBlock.className.replace('language-', '') || 'plaintext';
      const header = document.createElement('div');
      header.classList.add('code-header');

      const languageSpan = document.createElement('span');
      languageSpan.textContent = language;

      const copyIcon = document.createElement('button');
      copyIcon.classList.add('copy-icon');
      copyIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      `;
      copyIcon.addEventListener('click', () => {
        navigator.clipboard.writeText(codeBlock.textContent)
          .then(() => {
            copyIcon.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `;
            setTimeout(() => {
              copyIcon.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              `;
            }, 2000);
          })
          .catch((err) => console.error('Error al copiar el código:', err));
      });

      header.appendChild(languageSpan);
      header.appendChild(copyIcon);

      const preBlock = codeBlock.parentElement;
      preBlock.parentElement.insertBefore(header, preBlock);

      preBlock.classList.add('line-numbers');
      preBlock.setAttribute('data-lang', language);
      Prism.highlightElement(codeBlock);
    });

    if (typeof MathJax !== 'undefined') {
      MathJax.typesetPromise([messageDiv]).catch((err) =>
        console.error('Error al renderizar MathJax:', err)
      );
    }
  }

  // Función para cancelar la solicitud de la API
  const cancelRequest = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  // Mostrar un mensaje en el chat, procesando Markdown y MathJax
  const displayMessage = (content, isUser) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    if (isUser) {
      const plainText = content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      messageDiv.innerHTML = plainText;
    } else {
      let processedContent = marked.parse(content);
      processedContent = processedContent
        .replace(/\\\(.+?\\\)/g, (match) => match)
        .replace(/\\\[.+?\\\]/g, (match) => match)
        .replace(/\$.+?\$/g, (match) => `\\(${match.slice(1, -1)}\\)`)
        .replace(/\\boxed\{(.+?)\}/g, (match) => `\\boxed{${match.slice(7, -1)}}`);

      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = processedContent;

      const codeBlocks = tempContainer.querySelectorAll('pre > code');
      codeBlocks.forEach((codeBlock) => {
        const language = codeBlock.className.replace('language-', '') || 'plaintext';
        const header = document.createElement('div');
        header.classList.add('code-header');

        const languageSpan = document.createElement('span');
        languageSpan.textContent = language;

        const copyIcon = document.createElement('button');
        copyIcon.classList.add('copy-icon');
        copyIcon.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        `;
        copyIcon.addEventListener('click', () => {
          navigator.clipboard.writeText(codeBlock.textContent)
            .then(() => {
              copyIcon.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              `;
              setTimeout(() => {
                copyIcon.innerHTML = `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                `;
              }, 2000);
            })
            .catch((err) => console.error('Error al copiar el código:', err));
        });

        header.appendChild(languageSpan);
        header.appendChild(copyIcon);

        const preBlock = codeBlock.parentElement;
        preBlock.parentElement.insertBefore(header, preBlock);

        preBlock.classList.add('line-numbers');
        preBlock.setAttribute('data-lang', language);
        Prism.highlightElement(codeBlock);
      });

      while (tempContainer.firstChild) {
        messageDiv.appendChild(tempContainer.firstChild);
      }
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const copyButtonContainer = document.createElement('div');
    copyButtonContainer.style.display = 'flex';
    copyButtonContainer.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
    copyButtonContainer.style.marginTop = '5px';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.style.padding = '5px';
    copyButton.style.backgroundColor = 'transparent';
    copyButton.style.border = 'none';
    copyButton.style.cursor = 'pointer';
    copyButton.style.display = 'flex';
    copyButton.style.alignItems = 'center';
    copyButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
    `;
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(content)
        .then(() => {
          copyButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            copyButton.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            `;
          }, 2000);
        })
        .catch((err) => {
          console.error('Error al copiar el texto:', err);
          alert('No se pudo copiar el texto.');
        });
    });
    copyButtonContainer.appendChild(copyButton);
    chatMessages.appendChild(copyButtonContainer);

    if (!isUser && typeof MathJax !== 'undefined') {
      MathJax.typesetPromise([messageDiv]).catch((err) =>
        console.error('Error al renderizar MathJax:', err)
      );
    }
  };

  // Función para ajustar dinámicamente la altura del textarea
  const autoResizeTextarea = () => {
    userInput.style.height = 'auto';
    userInput.style.height = `${userInput.scrollHeight}px`;
  };

  // Función para alternar la visibilidad del sidebar
  const toggleSidebar = () => {
    chatSidebar.classList.toggle('hidden');
    const isHidden = chatSidebar.classList.contains('hidden');
    localStorage.setItem('sidebarState', isHidden ? 'hidden' : 'visible');
  };

  // Inicialización y asignación de event listeners
  const init = () => {
    newChatBtn.addEventListener('click', createNewChat);
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    deleteChatsBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres eliminar todos los chats?')) {
        chats = [];
        localStorage.removeItem('arexChats');
        chatHistory.innerHTML = '';
        chatMessages.innerHTML = '';
        alert('Todos los chats han sido eliminados.');
      }
    });
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    document.getElementById('floatingToggle').addEventListener('click', toggleSidebar);
    userInput.addEventListener('input', autoResizeTextarea);
    autoResizeTextarea();

    window.addEventListener('load', () => {
      const sidebarState = localStorage.getItem('sidebarState');
      if (sidebarState === 'hidden' && window.innerWidth >= 769) {
        chatSidebar.classList.add('hidden');
      }
      const savedChatId = localStorage.getItem('selectedChatId');
      if (savedChatId && chats.some((chat) => chat.id === savedChatId)) {
        currentChatId = savedChatId;
      } else if (chats.length > 0) {
        currentChatId = chats[0].id;
      } else {
        createNewChat();
      }
      loadChatHistory();
      loadChatMessages();
    });

    document.getElementById('file-upload').addEventListener('change', handleFileUpload);

    function handleFileUpload(event) {
      const files = event.target.files;
      if (!files.length) return;

      Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          console.log('Archivo cargado:', file.name);
          console.log('Contenido:', e.target.result);
          displayFilePreview(file, e.target.result);
        };
        
        reader.readAsDataURL(file);
      });
    }

    function displayFilePreview(file, content) {
      const preview = document.createElement('div');
      preview.className = 'file-preview';
    
      // Extrae el tipo del archivo (por ejemplo: 'application/pdf' -> 'PDF')
      const fileType = file.type ? file.type.split('/')[1].toUpperCase() : 'FILE';
    
      preview.innerHTML = `
        <div class="file-info">
          <strong>${file.name}</strong>
          <small>${fileType}</small>
        </div>
        <button class="remove-file">×</button>
      `;
    
      // Agrega el event listener para eliminar la previsualización al hacer clic en la "X"
      preview.querySelector('.remove-file').addEventListener('click', () => {
        preview.remove();
        // Opcional: limpiar el input de archivos para permitir volver a subir el mismo archivo
        document.getElementById('file-upload').value = "";
      });
    
      // Inserta la previsualización dentro del contenedor .chat-input, justo encima del textarea
      const chatInput = document.querySelector('.chat-input');
      chatInput.insertBefore(preview, chatInput.firstChild);
    }       

    function formatBytes(bytes) {
      const units = ['B', 'KB', 'MB', 'GB'];
      let i = 0;
      for (; bytes >= 1024 && i < units.length - 1; i++) {
        bytes /= 1024;
      }
      return `${bytes.toFixed(1)} ${units[i]}`;
    }


  };

  init();
})();
