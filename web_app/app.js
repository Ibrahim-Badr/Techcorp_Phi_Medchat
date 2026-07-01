document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const historyList = document.getElementById('history-list');
    const attachBtn = document.getElementById('attach-btn');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    
    let chatData = { sessions: {}, activeSessionId: null };
    let selectedImagesBase64 = [];

    if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
    }

    loadData();
    renderHistoryList();
    renderCurrentSession();

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            createNewSession();
            renderHistoryList();
            renderCurrentSession();
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.history-options')) {
            document.querySelectorAll('.history-dropdown').forEach(d => d.classList.remove('show'));
        }
    });

    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            for (let file of files) {
                if (file.type.startsWith('image/')) {
                    const base64 = await convertToBase64(file);
                    const base64Data = base64.split(',')[1];
                    selectedImagesBase64.push(base64Data);
                    
                    const badge = document.createElement('div');
                    badge.className = 'file-badge';
                    const currentIndex = selectedImagesBase64.length - 1;
                    badge.innerHTML = `
                        <img src="${base64}" class="file-thumbnail" alt="aperçu" />
                        <span class="remove-file" data-index="${currentIndex}">×</span>
                    `;
                    filePreview.appendChild(badge);
                } else {
                    alert("Le frontend gère uniquement les images pour l'instant. Les documents nécessitent un traitement serveur (RAG).");
                }
            }
            fileInput.value = '';
        });
    }

    if (filePreview) {
        filePreview.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-file')) {
                const index = parseInt(e.target.getAttribute('data-index'), 10);
                selectedImagesBase64.splice(index, 1);
                e.target.parentElement.remove();
                
                const badges = filePreview.querySelectorAll('.remove-file');
                badges.forEach((badge, idx) => {
                    badge.setAttribute('data-index', idx);
                });
            }
        });
    }

    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value.trim() === '') {
            this.style.height = 'auto';
        }
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userText = messageInput.value.trim();
        if (!userText && selectedImagesBase64.length === 0) return;

        if (!chatData.activeSessionId || !chatData.sessions[chatData.activeSessionId]) {
            createNewSession();
        }

        const currentSession = chatData.sessions[chatData.activeSessionId];

        if (currentSession.messages.length === 0 && currentSession.title === "Nouvelle discussion") {
            const titleText = userText || "Image partagée";
            currentSession.title = titleText.substring(0, 30) + (titleText.length > 30 ? "..." : "");
            renderHistoryList();
        }

        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        addMessageToUI('user', userText || "🖼️ [Image envoyée]");
        
        const messageObj = { role: 'user', content: userText };
        if (selectedImagesBase64.length > 0) {
            messageObj.images = [...selectedImagesBase64];
        }
        
        currentSession.messages.push(messageObj);
        saveData();

        selectedImagesBase64 = [];
        if (filePreview) filePreview.innerHTML = '';

        const loadingId = addLoadingIndicator();
        messageInput.disabled = true;
        sendBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'phi3.5',
                    messages: currentSession.messages,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.message.content;

            removeLoadingIndicator(loadingId);
            currentSession.messages.push({ role: 'assistant', content: assistantMessage });
            saveData();
            addMessageToUI('system', assistantMessage, true);

        } catch (error) {
            console.error('Erreur:', error);
            removeLoadingIndicator(loadingId);
            
            let errorMsg = 'Une erreur est survenue. Vérifiez qu\'Ollama est lancé sur le port 11434.';
            if (error.message === 'Failed to fetch') {
                errorMsg = 'Impossible de se connecter à Ollama (http://localhost:11434).';
            }
            addMessageToUI('system', errorMsg);
        } finally {
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
            scrollToBottom();
        }
    });

    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function createNewSession() {
        const sessionId = 'session_' + Date.now();
        chatData.sessions[sessionId] = { title: "Nouvelle discussion", messages: [] };
        chatData.activeSessionId = sessionId;
        saveData();
    }

    function switchSession(sessionId) {
        if (chatData.sessions[sessionId]) {
            chatData.activeSessionId = sessionId;
            saveData();
            renderHistoryList();
            renderCurrentSession();
        }
    }

    function renderHistoryList() {
        if (!historyList) return;
        historyList.innerHTML = '';
        
        const sessionIds = Object.keys(chatData.sessions).sort((a, b) => {
            return b.replace('session_', '') - a.replace('session_', '');
        });

        sessionIds.forEach(id => {
            const session = chatData.sessions[id];
            
            const wrapper = document.createElement('div');
            wrapper.className = `history-item-wrapper ${id === chatData.activeSessionId ? 'active' : ''}`;
            
            const item = document.createElement('button');
            item.className = 'history-item';
            item.textContent = session.title || "Discussion";
            item.onclick = (e) => {
                if (!e.target.closest('.history-options')) {
                    switchSession(id);
                }
            };
            
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'history-options';
            
            const optionsBtn = document.createElement('button');
            optionsBtn.className = 'history-options-btn';
            optionsBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>`;
                
            const dropdownDiv = document.createElement('div');
            dropdownDiv.className = 'history-dropdown';
            
            const renameBtn = document.createElement('button');
            renameBtn.className = 'dropdown-item';
            renameBtn.textContent = 'Renommer';
            renameBtn.onclick = (e) => {
                e.stopPropagation();
                const newTitle = prompt("Nouveau nom de la discussion :", session.title);
                if (newTitle !== null && newTitle.trim() !== '') {
                    session.title = newTitle.trim();
                    saveData();
                    renderHistoryList();
                }
                dropdownDiv.classList.remove('show');
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'dropdown-item delete';
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm("Voulez-vous vraiment effacer cette discussion ?")) {
                    delete chatData.sessions[id];
                    if (chatData.activeSessionId === id) {
                        const remainingIds = Object.keys(chatData.sessions);
                        if (remainingIds.length > 0) {
                            chatData.activeSessionId = remainingIds[remainingIds.length - 1];
                        } else {
                            createNewSession();
                        }
                    }
                    saveData();
                    renderHistoryList();
                    renderCurrentSession();
                }
            };
            
            optionsBtn.onclick = (e) => {
                e.stopPropagation();
                document.querySelectorAll('.history-dropdown').forEach(d => {
                    if (d !== dropdownDiv) d.classList.remove('show');
                });
                dropdownDiv.classList.toggle('show');
            };
            
            dropdownDiv.appendChild(renameBtn);
            dropdownDiv.appendChild(deleteBtn);
            
            optionsDiv.appendChild(optionsBtn);
            optionsDiv.appendChild(dropdownDiv);
            
            wrapper.appendChild(item);
            wrapper.appendChild(optionsDiv);
            
            historyList.appendChild(wrapper);
        });
    }

    function renderCurrentSession() {
        if (!chatMessages) return;
        chatMessages.innerHTML = '';
        const currentSession = chatData.activeSessionId ? chatData.sessions[chatData.activeSessionId] : null;

        if (!currentSession || currentSession.messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="message system">
                    <div class="message-content">Bonjour Dylan, je suis l'assistant IA de TechCorp. Comment puis-je t'aider aujourd'hui ?</div>
                </div>
            `;
        } else {
            currentSession.messages.forEach(msg => {
                let displayContent = msg.content;
                if (msg.role === 'user' && msg.images && !msg.content) {
                    displayContent = "🖼️ [Image envoyée]";
                }
                addMessageToUI(msg.role === 'user' ? 'user' : 'system', displayContent, msg.role !== 'user');
            });
        }
        scrollToBottom();
    }

    function addMessageToUI(role, text, useMarkdown = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (useMarkdown && role === 'system' && typeof marked !== 'undefined') {
            contentDiv.innerHTML = marked.parse(text);
        } else {
            contentDiv.textContent = text;
        }
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function addLoadingIndicator() {
        const id = 'loading-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.id = id;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing-indicator';
        contentDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        return id;
    }

    function removeLoadingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function saveData() {
        localStorage.setItem('techcorp_chat_data_v2', JSON.stringify(chatData));
    }

    function loadData() {
        const savedData = localStorage.getItem('techcorp_chat_data_v2');
        if (savedData) {
            try {
                chatData = JSON.parse(savedData);
                if (!chatData.sessions || typeof chatData.sessions !== 'object') {
                    chatData = { sessions: {}, activeSessionId: null };
                }
            } catch (e) {
                console.error("Erreur de restauration des données:", e);
                chatData = { sessions: {}, activeSessionId: null };
            }
        }
        
        if (!chatData.activeSessionId || Object.keys(chatData.sessions).length === 0) {
            createNewSession();
        }
    }
});
