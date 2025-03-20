(() => {
  /* ====== INICIALIZACIÓN Y CACHEO DE ELEMENTOS ====== */
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

  /* ====== GESTIÓN DEL HISTORIAL DE CHATS ====== */
  const saveChatsToStorage = () => {
    localStorage.setItem('arexChats', JSON.stringify(chats));
  };

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

  /* ====== MENÚ DE CAMBIO DE TÍTULO ====== */
  document.getElementById('headerTitleToggleBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    let menu = document.getElementById('headerTitleMenu');
    if (menu) {
      menu.remove();
      return;
    }
    menu = document.createElement('div');
    menu.id = 'headerTitleMenu';
    menu.className = 'header-title-menu';
    menu.style.position = 'absolute';
    menu.style.top = (this.offsetTop + this.offsetHeight) + 'px';
    menu.style.left = this.offsetLeft + 'px';
    menu.style.backgroundColor = '#222';
    menu.style.border = '1px solid #333';
    menu.style.borderRadius = '8px';
    menu.style.padding = '4px 0';
    menu.style.zIndex = '1000';
  
    function createOption(title, description, descriptionColor, disabled = false) {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.cursor = disabled ? 'not-allowed' : 'pointer';
      container.style.padding = '8px 16px';
      container.style.transition = 'background-color 0.3s ease';
  
      const updateBackground = () => {
        if (disabled) return;
        const storedTitle = localStorage.getItem('chatHeaderTitle') || 'AREX';
        if (storedTitle === title) {
          container.classList.add('active');
          container.style.backgroundColor = 'rgba(227,227,227,0.1)';
        } else {
          container.classList.remove('active');
          container.style.backgroundColor = 'transparent';
        }
      };
  
      container.addEventListener('mouseenter', function() {
        if (!disabled) container.style.backgroundColor = '#333';
      });
      container.addEventListener('mouseleave', function() {
        if (!disabled) updateBackground();
      });
  
      if (!disabled) {
        container.addEventListener('click', function() {
          const siblings = container.parentElement.children;
          for (let sibling of siblings) {
            sibling.classList.remove('active');
            sibling.style.backgroundColor = 'transparent';
          }
          container.classList.add('active');
          container.style.backgroundColor = 'rgba(227,227,227,0.1)';
          document.getElementById('chatHeaderTitle').textContent = title;
          localStorage.setItem('chatHeaderTitle', title);
          menu.remove();
        });
      } else {
        container.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          // No se realiza acción, ya que está deshabilitado
        });
      }
  
      const titleElem = document.createElement('div');
      titleElem.textContent = title;
      titleElem.style.background = 'none';
      titleElem.style.border = 'none';
      titleElem.style.color = '#fff';
      titleElem.style.fontWeight = 'bold';
      titleElem.style.fontSize = '16px';
  
      const storedTitle = localStorage.getItem('chatHeaderTitle') || 'AREX';
      if (storedTitle === title && !disabled) {
        container.classList.add('active');
        container.style.backgroundColor = 'rgba(227,227,227,0.1)';
      }
  
      const desc = document.createElement('div');
      desc.textContent = description;
      desc.style.fontSize = '12px';
      desc.style.color = descriptionColor;
      desc.style.marginTop = '4px';
  
      container.appendChild(titleElem);
      container.appendChild(desc);
  
      return container;
    }
  
    // Nueva opción deshabilitada: no permite cambiar el título
    const optionArexThinking = createOption('AREX THINKING', 'Próximamente', '#ADB0B4', true);
    // Se ajusta visualmente para indicar que está deshabilitada:
    optionArexThinking.style.opacity = '0.5';

    const optionArexDeluxe = createOption('AREX DELUXE', 'Tareas complejas que requieren alta precisión y comprensión profunda.', '#ADB0B4');
    const optionArexGold = createOption('AREX GOLD', 'Tareas moderadamente complejas o simples con mayor precisión.', '#ADB0B4');
    const optionArex = createOption('AREX', 'Tareas simples donde la rapidez es una prioridad.', '#ADB0B4');
  
    menu.appendChild(optionArexThinking);
    menu.appendChild(optionArexDeluxe);
    menu.appendChild(optionArexGold);
    menu.appendChild(optionArex);
  
    menu.addEventListener('click', (e) => e.stopPropagation());
    this.parentElement.appendChild(menu);
  
    document.addEventListener('click', function closeMenu(event) {
      if (!menu.contains(event.target) && event.target !== document.getElementById('headerTitleToggleBtn')) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  });  

  document.addEventListener('DOMContentLoaded', () => {
    let storedTitle = localStorage.getItem('chatHeaderTitle');
    if (!storedTitle) {
      storedTitle = 'AREX';
      localStorage.setItem('chatHeaderTitle', storedTitle);
    }
    document.getElementById('chatHeaderTitle').textContent = storedTitle;
  });

  const searchWebBtn = document.getElementById('search-web-btn');
  const fileUploadInput = document.getElementById('file-upload');
  const fileUploadBtn = document.querySelector('.file-upload-btn');
  let searchActive = false;

  searchWebBtn.addEventListener('click', function() {
    searchActive = !searchActive;
    
    if (searchActive) {
      searchWebBtn.classList.add('active');
      fileUploadInput.disabled = true;
      fileUploadBtn.classList.add('disabled');
    } else {
      searchWebBtn.classList.remove('active');
      fileUploadInput.disabled = false;
      fileUploadBtn.classList.remove('disabled');
    }
  });

  /* ====== MENÚ DE OPCIONES DE CHAT ====== */
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
      if (newName && newName.trim()) renameChat(chatId, newName.trim());
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
      if (confirm("¿Estás seguro de que quieres eliminar este chat?")) deleteChat(chatId);
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

  const deleteChat = (chatId) => {
    chats = chats.filter((chat) => chat.id !== chatId);
    saveChatsToStorage();
    loadChatHistory();
    if (currentChatId === chatId) chatMessages.innerHTML = '';
  };

  const renameChat = (chatId, newName) => {
    const chat = chats.find((chat) => chat.id === chatId);
    if (chat) {
      chat.name = newName;
      saveChatsToStorage();
      loadChatHistory();
    }
  };

  /* ====== MENSAJES Y NUEVO CHAT ====== */
  const loadChatMessages = () => {
    const chat = chats.find((c) => c.id === currentChatId);
    if (!chat) return;
    chatMessages.innerHTML = '';
    chat.messages.forEach((msg) => {
      if (msg.isUser) {
        displayMessage(msg.displayContent || msg.content, true);
      } else {
        // Se pasa un objeto de opciones con fuentesData (si está disponible)
        displayMessage(msg.content, false, { fuentesData: msg.fuentesData });
      }
    });
  };   

  const createNewChat = () => {
    currentChatId = Date.now().toString();
    const welcomeMessage = "¡Hola! Soy Arex, el asistente de IA de Anuvyx.\n\n¿En qué puedo ayudarte hoy?\n";
    chats.push({
      id: currentChatId,
      timestamp: Date.now(),
      messages: [{
        content: welcomeMessage,
        isUser: false,
        timestamp: Date.now()
      }]
    });
    saveChatsToStorage();
    localStorage.setItem('selectedChatId', currentChatId);
    loadChatHistory();
    loadChatMessages();
  };

  /* ====== INDICADOR DE CARGA ====== */
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
      if (countdown >= 0) counter.textContent = countdown;
      else clearInterval(countdownInterval);
    }, 1000);

    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(counter);
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return { loadingDiv, countdownInterval };
  };

  /* ====== ENVÍO DE MENSAJES Y RESPUESTA DE LA API ====== */
  const sendMessage = async () => {
    const userText = userInput.value.trim();
    const filePreviews = document.querySelectorAll('.file-preview');
    const fileNames = [];
    let fileContent = '';
  
    filePreviews.forEach(preview => {
      const fileName = preview.dataset.filename;
      const content = preview.dataset.content;
      fileNames.push(`[${fileName}]`);
      fileContent += '\n\n' + content;
    });
  
    const displayMessageContent = (fileNames.join('\n') + (userText ? '\n\n' + userText : '')).trim();
    const apiMessageContent = (userText + fileContent).trim();
    if (!apiMessageContent) return;
  
    // Obtener el chat actual (para guardar en el historial)
    const chat = chats.find(c => c.id === currentChatId);
    
    // Modo búsqueda: si searchActive es verdadero
    // Dentro del bloque que maneja el modo búsqueda, luego de obtener 'data' de la API de búsqueda:
    if (searchActive) {
      // Agregar la consulta del usuario al historial y mostrarla
      chat.messages.push({
        content: userText,
        isUser: true,
        timestamp: Date.now()
      });
      saveChatsToStorage();
      displayMessage(userText, true);
      userInput.value = '';
      autoResizeTextarea();

      // Mostramos un indicador de carga
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
        const response = await fetch('https://anuvyx-com-backend.vercel.app/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userText }),
          signal: abortController.signal
        });
        const data = await response.json();

        // Procesar los resultados para extraer la información de las fuentes
        // Procesar los resultados para extraer la información de las fuentes de forma resumida
        let fuentes = '';
        if (data.results && data.results.length > 0) {
          fuentes = data.results.map((result, index) => {
            // Limitar el snippet a 150 caracteres para evitar exceso de información
            const snippet = result.snippet.length > 150 ? result.snippet.substring(0, 150) + '...' : result.snippet;
            return `${index + 1}. ${result.title} (${result.url})\n${snippet}`;
          }).join('\n\n');
        } else {
          fuentes = 'No se encontraron resultados.';
        }

        // Crear un prompt para que la API del chat sintetice la respuesta
        const prompt = `
        Pregunta: ${userText}

        Utiliza la siguiente información obtenida de internet para responder de forma precisa:

        Fuentes:
        ${fuentes}

        Responde de manera concisa y precisa, evitando información irrelevante o redundante. Únicamente escribe las referencias de las fuentes consultadas entre corchetes a lo largo del texto (Ejemplo: Texto[n]).
        `.trim();

        // Enviar el prompt a la API del chat
        const chatResponse = await fetch('https://anuvyx-com-backend.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: prompt
            }],
            chatHeaderTitle: document.getElementById('chatHeaderTitle').textContent
          })
        });

        // Procesar la respuesta de la API del chat (similar al flujo actual)
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        chatMessages.appendChild(botMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const reader = chatResponse.body.getReader();
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
                if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  botResponse += parsed.choices[0].delta.content;
                }
              } catch (error) {
                console.error("Error al parsear JSON:", error);
              }
            }
          }
          botMessageDiv.innerHTML = marked.parse(botResponse);
          
          // Actualizar la renderización de MathJax en cada iteración
          if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([botMessageDiv]).catch((err) => console.error('MathJax error:', err));
          }
          
          if (shouldAutoScroll()) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        }        

        // Guardar y mostrar la respuesta final
        enhanceMessage(botMessageDiv);
        chat.messages.push({
          content: botResponse,
          isUser: false,
          timestamp: Date.now(),
          fuentesData: data.results || []
        });
        saveChatsToStorage();

        // Aquí insertamos el botón "Fuentes" y configuramos el sidebar
        // Suponiendo que "data.results" contiene las fuentes consultadas
        let fuentesData = data.results || [];

        const fuentesBtn = document.createElement('button');
        fuentesBtn.textContent = 'Fuentes';
        fuentesBtn.classList.add('fuentes-btn');
        botMessageDiv.appendChild(fuentesBtn);

        // Verificar si el sidebar ya existe; si no, crearlo
        let fuentesSidebar = document.getElementById('fuentesSidebar');
        if (!fuentesSidebar) {
          fuentesSidebar = document.createElement('div');
          fuentesSidebar.id = 'fuentesSidebar';
          fuentesSidebar.classList.add('fuentes-sidebar');
          fuentesSidebar.innerHTML = `
            <button id="fuentesCloseBtn" class="fuentes-close-btn">X</button>
            <h3>Fuentes Consultadas</h3>
            <ul id="fuentesList"></ul>
          `;
          document.body.appendChild(fuentesSidebar);
        }

        fuentesBtn.addEventListener('click', () => {
          const fuentesList = document.getElementById('fuentesList');
          fuentesList.innerHTML = '';
          const topFuentes = fuentesData.slice(0, 5);
          topFuentes.forEach((result, index) => {
            let snippet = result.snippet;
            if (snippet && snippet.length > 150) {
              snippet = snippet.substring(0, 150) + '...';
            }
            const li = document.createElement('li');
            li.style.marginBottom = '10px';
            li.innerHTML = `<strong>${index + 1}.</strong> <a href="${result.url}" target="_blank">${result.title}</a><br><small>${snippet || ''}</small>`;
            fuentesList.appendChild(li);
          });
          // Abrir el sidebar
          fuentesSidebar.classList.add('open');
        });

        // Evento para cerrar el sidebar
        document.getElementById('fuentesCloseBtn').addEventListener('click', () => {
          fuentesSidebar.classList.remove('open');
        });

      } catch (error) {
        console.error('Error en la búsqueda o en el procesamiento:', error);
        displayMessage('Error al realizar la búsqueda o procesar la respuesta.', false);
      } finally {
        clearInterval(countdownInterval);
        loadingDiv.remove();
        // Restaurar el estado original del botón:
        sendBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        `;
        sendBtn.style.backgroundColor = '#ffffff';
        sendBtn.onclick = sendMessage;
      }
      return; // Salir de la función en modo búsqueda
    }
  
    // Flujo normal del chat (sin búsqueda)
    chat.messages.push({
      content: apiMessageContent,
      displayContent: displayMessageContent,
      isUser: true,
      files: fileNames,
      timestamp: Date.now()
    });
  
    userInput.value = '';
    document.querySelectorAll('.file-preview').forEach(p => p.remove());
    displayMessage(displayMessageContent, true);
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
        body: JSON.stringify({
          messages: conversationMessages,
          chatHeaderTitle: document.getElementById('chatHeaderTitle').textContent
        }),
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
              if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                botResponse += parsed.choices[0].delta.content;
              }
            } catch (error) {
              console.error("Error al parsear JSON:", error);
            }
          }
        }
        botMessageDiv.innerHTML = marked.parse(botResponse);
        
        // Actualizar la renderización de MathJax en cada iteración
        if (typeof MathJax !== 'undefined') {
          MathJax.typesetPromise([botMessageDiv]).catch((err) => console.error('MathJax error:', err));
        }
        
        if (shouldAutoScroll()) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }      
    
      // Se mejora el mensaje y se guarda en el historial sin fuentes (fuentesData vacío)
      enhanceMessage(botMessageDiv);
      chat.messages.push({
        content: botResponse,
        isUser: false,
        timestamp: Date.now(),
        fuentesData: [] // Aquí se asigna un arreglo vacío, ya que en este flujo no se reciben fuentes
      });
      saveChatsToStorage();
    
      // Se omite la creación del botón "Fuentes" en este flujo,
      // puesto que no hay datos de fuentes en la respuesta.
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
      document.querySelectorAll('.file-preview').forEach(p => p.remove());
    }    
  };  

  /* ====== MEJORA DEL FORMATO DE LOS MENSAJES ====== */
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

  /* ====== CANCELAR SOLICITUD A LA API ====== */
  const cancelRequest = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  /* ====== AUTO-SCROLLING ====== */
  function shouldAutoScroll() {
    return chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 50;
  }

  /* ====== MOSTRAR MENSAJE EN EL CHAT ====== */
  const displayMessage = (content, isUser, options = {}) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  
    if (isUser) {
      const formattedContent = content
        .replace(/\n/g, '<br>')
        .replace(/\[(.*?)\]/g, (match, fileName) => {
          const fileExtension = fileName.split('.').pop().toUpperCase();
          const fileSize = '';
          return `
            <div class="file-tag">
              <div class="file-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div class="file-details">
                <div class="file-name">${fileName}</div>
                <div class="file-meta">
                  <span class="file-type">${fileExtension}</span>
                  <span class="file-size">${fileSize}</span>
                </div>
              </div>
            </div>
          `;
        });
      messageDiv.innerHTML = formattedContent;
    } else {
      if (content.includes('<div class="search-results">')) {
        messageDiv.innerHTML = content;
      } else {
        content = content.replace(/\\\[(.+?)\\\]/gs, (match, p1) => `$$${p1.trim()}$$`);
        content = content.replace(/\$\$(.*?)\$\$/g, (match, inner) => {
          return inner.includes('\n') ? match : `$$\n${inner}\n$$`;
        });
        let processedContent = marked.parse(content);
        processedContent = processedContent
          .replace(/\\\(.+?\\\)/g, (match) => match)
          .replace(/\\\[.+?\\\]/g, (match) => match)
          .replace(/\$(.+?)\$/g, (match, p1) => p1)
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
    }
  
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  
    // Agregar botón de Fuentes si es mensaje del bot y se tienen fuentes en options.fuentesData
    if (!isUser && options.fuentesData && options.fuentesData.length > 0) {
      const fuentesBtn = document.createElement('button');
      fuentesBtn.textContent = 'Fuentes';
      fuentesBtn.classList.add('fuentes-btn');
      messageDiv.appendChild(fuentesBtn);
  
      fuentesBtn.addEventListener('click', () => {
        let fuentesSidebar = document.getElementById('fuentesSidebar');
        if (!fuentesSidebar) {
          fuentesSidebar = document.createElement('div');
          fuentesSidebar.id = 'fuentesSidebar';
          fuentesSidebar.classList.add('fuentes-sidebar');
          fuentesSidebar.innerHTML = `
            <button id="fuentesCloseBtn" class="fuentes-close-btn">X</button>
            <h3>Fuentes Consultadas</h3>
            <ul id="fuentesList"></ul>
          `;
          document.body.appendChild(fuentesSidebar);
        }
        const fuentesList = document.getElementById('fuentesList');
        fuentesList.innerHTML = '';
        const topFuentes = options.fuentesData.slice(0, 10);
        topFuentes.forEach((result, index) => {
          let snippet = result.snippet;
          if (snippet && snippet.length > 150) {
            snippet = snippet.substring(0, 150) + '...';
          }
          const li = document.createElement('li');
          li.style.marginBottom = '10px';
          li.innerHTML = `<strong>${index + 1}.</strong> <a href="${result.url}" target="_blank">${result.title}</a><br><small>${snippet || ''}</small>`;
          fuentesList.appendChild(li);
        });
        fuentesSidebar.classList.add('open');
        document.getElementById('fuentesCloseBtn').addEventListener('click', () => {
          fuentesSidebar.classList.remove('open');
        });
      });
    }
  
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
        .catch((err) => console.error('Error al copiar el texto:', err));
    });
    copyButtonContainer.appendChild(copyButton);
    chatMessages.appendChild(copyButtonContainer);
  
    if (!isUser && typeof MathJax !== 'undefined') {
      MathJax.typesetPromise([messageDiv]).catch((err) =>
        console.error('Error al renderizar MathJax:', err)
      );
    }
  };      

  /* ====== AJUSTE DINÁMICO DEL TEXTAREA ====== */
  const autoResizeTextarea = () => {
    userInput.style.height = 'auto';
    userInput.style.height = `${userInput.scrollHeight}px`;
  };

  /* ====== VISIBILIDAD DEL SIDEBAR ====== */
  const toggleSidebar = () => {
    chatSidebar.classList.toggle('hidden');
    const isHidden = chatSidebar.classList.contains('hidden');
    localStorage.setItem('sidebarState', isHidden ? 'hidden' : 'visible');
  };

  /* ====== INICIALIZACIÓN Y EVENT LISTENERS ====== */
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

    userInput.addEventListener('paste', (event) => {
      // Verificar que haya datos en el portapapeles
      if (event.clipboardData && event.clipboardData.items) {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // Si el item es de tipo 'file'
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (!file) continue;
            // Opcional: deshabilitar botones o inputs si se va a procesar un archivo
            // Por ejemplo: searchWebBtn.disabled = true;
            
            const extension = file.name.split('.').pop().toLowerCase();
            // Procesar archivos de texto
            if (['txt', 'csv', 'tsv', 'json', 'xml'].includes(extension)) {
              const reader = new FileReader();
              reader.onload = function(e) {
                let content = e.target.result;
                if (extension === 'json') {
                  try {
                    const parsed = JSON.parse(content);
                    content = JSON.stringify(parsed, null, 2);
                  } catch (error) {
                    console.error("Error al parsear JSON:", error);
                  }
                }
                displayFilePreview(file, content);
              };
              reader.readAsText(file);
            }
            // Procesar documentos DOCX
            else if (extension === 'docx') {
              const reader = new FileReader();
              reader.onload = function(e) {
                const arrayBuffer = e.target.result;
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                  .then(function(result) {
                    const content = result.value;
                    displayFilePreview(file, content);
                  })
                  .catch(function(error) {
                    console.error("Error al procesar DOCX:", error);
                  });
              };
              reader.readAsArrayBuffer(file);
            }
            // Procesar hojas de cálculo XLS/XLSX
            else if (['xlsx', 'xls'].includes(extension)) {
              const reader = new FileReader();
              reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let content = '';
                workbook.SheetNames.forEach(sheetName => {
                  const worksheet = workbook.Sheets[sheetName];
                  const csv = XLSX.utils.sheet_to_csv(worksheet);
                  content += `--- ${sheetName} ---\n${csv}\n\n`;
                });
                displayFilePreview(file, content);
              };
              reader.readAsArrayBuffer(file);
            }
            // Procesar PDFs
            else if (extension === 'pdf') {
              const reader = new FileReader();
              reader.onload = function(e) {
                const typedarray = new Uint8Array(e.target.result);
                pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                  let maxPages = pdf.numPages;
                  let countPromises = [];
                  for (let i = 1; i <= maxPages; i++) {
                    countPromises.push(
                      pdf.getPage(i).then(function(page) {
                        return page.getTextContent().then(function(textContent) {
                          return textContent.items.map(item => item.str).join(' ');
                        });
                      })
                    );
                  }
                  Promise.all(countPromises).then(function(texts) {
                    const content = texts.join('\n\n');
                    displayFilePreview(file, content);
                  });
                }).catch(function(error) {
                  console.error("Error al procesar PDF:", error);
                });
              };
              reader.readAsArrayBuffer(file);
            }
            // Procesar imágenes (por ejemplo, PNG, JPG, JPEG)
            else if (['png', 'jpg', 'jpeg'].includes(extension)) {
              const reader = new FileReader();
              reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                // Usar Tesseract para extraer texto, similar al flujo en handleFileUpload
                Tesseract.recognize(imageDataUrl, 'spa', { logger: m => console.log(m) })
                  .then(({ data: { text } }) => {
                    Vibrant.from(imageDataUrl).getPalette()
                      .then((palette) => {
                        const textColor = palette.Vibrant ? palette.Vibrant.getHex() : '#FFFFFF';
                        const bgColor = palette.DarkMuted ? palette.DarkMuted.getHex() : '#000000';
                        const resultText = `Texto extraído: ${text.trim()}\nColor de texto: ${textColor}\nColor de fondo: ${bgColor}`;
                        displayFilePreview(file, resultText);
                      })
                      .catch(err => {
                        console.error("Error al extraer colores:", err);
                        displayFilePreview(file, `Texto extraído: ${text.trim()}`);
                      });
                  })
                  .catch(error => {
                    console.error("Error al procesar imagen:", error);
                  });
              };
              reader.readAsDataURL(file);
            }
          }
        }
      }
    });    

    /* ====== MANEJO DE ARCHIVOS ====== */
    function handleFileUpload(event) {
      const files = event.target.files;
      if (!files.length) return;
      searchWebBtn.disabled = true;
      searchWebBtn.classList.add('disabled');
      let totalSize = 0;
      let filePreviewsContainer = document.querySelector('.file-previews-container');
      if (filePreviewsContainer) {
        const previews = filePreviewsContainer.querySelectorAll('.file-preview');
        previews.forEach(preview => {
          totalSize += parseInt(preview.dataset.filesize) || 0;
        });
      }
      for (const file of files) {
        if (totalSize + file.size > 20 * 1024 * 1024) {
          alert(`No se puede subir el archivo "${file.name}" porque el tamaño total excede 20MB.`);
          continue;
        }
        totalSize += file.size;
        const extension = file.name.split('.').pop().toLowerCase();
        if (['txt', 'csv', 'tsv', 'json', 'xml'].includes(extension)) {
          const reader = new FileReader();
          reader.onload = function(e) {
            let content = e.target.result;
            if (extension === 'json') {
              try {
                const parsed = JSON.parse(content);
                content = JSON.stringify(parsed, null, 2);
              } catch (error) {
                console.error("Error al parsear JSON:", error);
              }
            }
            displayFilePreview(file, content);
          };
          reader.readAsText(file);
        } else if (extension === 'docx') {
          const reader = new FileReader();
          reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
              .then(function(result) {
                const content = result.value;
                displayFilePreview(file, content);
              })
              .catch(function(error) {
                console.error("Error al procesar DOCX:", error);
              });
          };
          reader.readAsArrayBuffer(file);
        } else if (extension === 'xlsx' || extension === 'xls') {
          const reader = new FileReader();
          reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            let content = '';
            workbook.SheetNames.forEach(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              const csv = XLSX.utils.sheet_to_csv(worksheet);
              content += `--- ${sheetName} ---\n${csv}\n\n`;
            });
            displayFilePreview(file, content);
          };
          reader.readAsArrayBuffer(file);
        } else if (extension === 'pdf') {
          const reader = new FileReader();
          reader.onload = function(e) {
            const typedarray = new Uint8Array(e.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
              let maxPages = pdf.numPages;
              let countPromises = [];
              for (let i = 1; i <= maxPages; i++) {
                countPromises.push(
                  pdf.getPage(i).then(function(page) {
                    return page.getTextContent().then(function(textContent) {
                      return textContent.items.map(item => item.str).join(' ');
                    });
                  })
                );
              }
              Promise.all(countPromises).then(function(texts) {
                const content = texts.join('\n\n');
                displayFilePreview(file, content);
              });
            }).catch(function(error) {
              console.error("Error al procesar PDF:", error);
            });
          };
          reader.readAsArrayBuffer(file);
        } else if (['png', 'jpg', 'jpeg'].includes(extension)) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const imageDataUrl = e.target.result;
            Tesseract.recognize(imageDataUrl, 'spa', { logger: m => console.log(m) })
              .then(({ data: { text } }) => {
                Vibrant.from(imageDataUrl).getPalette()
                  .then((palette) => {
                    const textColor = palette.Vibrant ? palette.Vibrant.getHex() : '#FFFFFF';
                    const bgColor = palette.DarkMuted ? palette.DarkMuted.getHex() : '#000000';
                    const resultText = `Texto extraído: ${text.trim()}\nColor de texto: ${textColor}\nColor de fondo: ${bgColor}`;
                    displayFilePreview(file, resultText);
                  })
                  .catch(err => {
                    console.error("Error al extraer colores:", err);
                    displayFilePreview(file, `Texto extraído: ${text.trim()}`);
                  });
              }).catch(error => {
                console.error("Error al procesar imagen:", error);
              });
          };
          reader.readAsDataURL(file);
        }
      }
    }

    function displayFilePreview(file, content) {
      const preview = document.createElement('div');
      preview.className = 'file-preview';
      preview.dataset.filename = file.name;
      preview.dataset.content = content;
      preview.dataset.filesize = file.size;
      const fileExtension = file.name.split('.').pop().toUpperCase();
      preview.innerHTML = `
        <div class="file-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="file-details">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">
            <span class="file-type">${fileExtension}</span>
            <span class="file-size">${formatBytes(file.size)}</span>
          </div>
        </div>
        <button class="remove-file">×</button>
      `;
      preview.querySelector('.remove-file').addEventListener('click', () => {
        preview.remove();
        if (document.querySelectorAll('.file-preview').length === 0) {
          searchWebBtn.disabled = false;
          searchWebBtn.classList.remove('disabled');
        }
      });

      let filePreviewsContainer = document.querySelector('.file-previews-container');
      if (!filePreviewsContainer) {
        filePreviewsContainer = document.createElement('div');
        filePreviewsContainer.className = 'file-previews-container';
        const chatInput = document.querySelector('.chat-input');
        chatInput.insertBefore(filePreviewsContainer, chatInput.firstChild);
      }
      filePreviewsContainer.appendChild(preview);
    }
    
    function formatBytes(bytes) {
      const units = ['B', 'KB', 'MB', 'GB'];
      let i = 0;
      for (; bytes >= 1024 && i < units.length - 1; i++) {
        bytes /= 1024;
      }
      return `${bytes.toFixed(1)} ${units[i]}`;
    }

    function removeDiacritics(str) {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    const chatSearchInput = document.getElementById('chatSearchInput');
    chatSearchInput.addEventListener('input', () => {
      const query = removeDiacritics(chatSearchInput.value.toLowerCase());
      const chatItems = chatHistory.querySelectorAll('.chat-item');
      chatItems.forEach(item => {
        const chatName = removeDiacritics(item.querySelector('.chat-info span').textContent.toLowerCase());
        item.style.display = chatName.includes(query) ? '' : 'none';
      });
    });
  };

  init();
})();
