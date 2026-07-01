document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const historyList = document.getElementById('history-list');
    const exportBtn = document.getElementById('export-btn');

    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userNameDisplay = document.getElementById('user-name-display');

    let userName = localStorage.getItem('techcorp_username') || "Utilisateur";
    let userAvatarText = localStorage.getItem('techcorp_avatar') || userName.charAt(0).toUpperCase();
    let userAvatarImage = localStorage.getItem('techcorp_avatar_image') || null;

    function updateProfileUI() {
        if (userNameDisplay) userNameDisplay.textContent = userName;
        if (userAvatar) {
            if (userAvatarImage) {
                userAvatar.style.backgroundImage = `url(${userAvatarImage})`;
                userAvatar.textContent = '';
                userAvatar.style.color = 'transparent';
            } else {
                userAvatar.style.backgroundImage = 'none';
                userAvatar.textContent = userAvatarText;
                userAvatar.style.color = 'white';
            }
        }
    }
    updateProfileUI();

    const profileModal = document.getElementById('profile-modal');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileAvatarFile = document.getElementById('profile-avatar-file');
    const profileSaveBtn = document.getElementById('profile-save-btn');
    const profileCancelBtn = document.getElementById('profile-cancel-btn');

    if (userProfile && profileModal) {
        let tempAvatarImage = userAvatarImage;

        userProfile.addEventListener('click', () => {
            profileNameInput.value = userName;
            tempAvatarImage = userAvatarImage;
            profileModal.style.display = 'flex';
        });

        if (profileAvatarFile) {
            profileAvatarFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        tempAvatarImage = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        profileCancelBtn.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });

        profileSaveBtn.addEventListener('click', () => {
            if (profileNameInput.value.trim() !== '') {
                userName = profileNameInput.value.trim();
                userAvatarText = userName.charAt(0).toUpperCase();
                userAvatarImage = tempAvatarImage;
                
                localStorage.setItem('techcorp_username', userName);
                localStorage.setItem('techcorp_avatar', userAvatarText);
                if (userAvatarImage) {
                    localStorage.setItem('techcorp_avatar_image', userAvatarImage);
                } else {
                    localStorage.removeItem('techcorp_avatar_image');
                }
                
                updateProfileUI();
            }
            profileModal.style.display = 'none';
        });
        
        // Fermer la modale si on clique en dehors
        document.addEventListener('click', (e) => {
            if (profileModal.style.display === 'flex' && !userProfile.contains(e.target)) {
                const modalContent = profileModal.querySelector('.modal-content');
                if (modalContent && !modalContent.contains(e.target)) {
                    profileModal.style.display = 'none';
                }
            }
        });
    }

    // Rename Modal Logic
    const renameModal = document.getElementById('rename-modal');
    const renameInput = document.getElementById('rename-input');
    const renameSaveBtn = document.getElementById('rename-save-btn');
    const renameCancelBtn = document.getElementById('rename-cancel-btn');
    let sessionToRename = null;

    if (renameModal) {
        renameCancelBtn.addEventListener('click', () => {
            renameModal.style.display = 'none';
            sessionToRename = null;
        });

        renameSaveBtn.addEventListener('click', () => {
            if (sessionToRename && renameInput.value.trim() !== '') {
                chatData.sessions[sessionToRename].title = renameInput.value.trim();
                saveData();
                renderHistoryList();
            }
            renameModal.style.display = 'none';
            sessionToRename = null;
        });

        renameModal.addEventListener('click', (e) => {
            if (e.target === renameModal) {
                renameModal.style.display = 'none';
                sessionToRename = null;
            }
        });
    }

    function openRenameModal(sessionId, currentTitle) {
        sessionToRename = sessionId;
        renameInput.value = currentTitle || "";
        renameModal.style.display = 'flex';
        renameInput.focus();
    }

    // Delete Modal Logic
    const deleteModal = document.getElementById('delete-modal');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    let sessionToDelete = null;

    if (deleteModal) {
        deleteCancelBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            sessionToDelete = null;
        });

        deleteConfirmBtn.addEventListener('click', () => {
            if (sessionToDelete) {
                delete chatData.sessions[sessionToDelete];
                if (chatData.activeSessionId === sessionToDelete) {
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
            deleteModal.style.display = 'none';
            sessionToDelete = null;
        });

        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.style.display = 'none';
                sessionToDelete = null;
            }
        });
    }

    function openDeleteModal(sessionId) {
        sessionToDelete = sessionId;
        deleteModal.style.display = 'flex';
    }


    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const currentSession = chatData.sessions[chatData.activeSessionId];
            if (!currentSession || currentSession.messages.length === 0) return;
            
            let textContent = `Discussion : ${currentSession.title}\n\n`;
            currentSession.messages.forEach(msg => {
                const role = msg.role === 'user' ? userName : 'TechCorp AI';
                textContent += `--- ${role} ---\n${msg.content}\n\n`;
            });
            
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TechCorp_Export_${chatData.activeSessionId}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    let chatData = { sessions: {}, activeSessionId: null };
    let currentAbortController = null;

    if (typeof marked !== 'undefined') {
        marked.setOptions({ 
            breaks: true, 
            gfm: true,
            highlight: function (code, lang) {
                if (typeof hljs !== 'undefined') {
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return hljs.highlight(code, { language }).value;
                }
                return code;
            }
        });
    }

    loadData();
    renderHistoryList();
    renderCurrentSession();

    // Ping Server Logic
    const serverStatusDot = document.querySelector('.status-dot');
    const serverStatusText = document.querySelector('.status-text');

    async function checkServerStatus() {
        if (!serverStatusDot || !serverStatusText) return;
        try {
            // Use no-cors mode to avoid CORS issues with the preflight and custom headers on Ngrok.
            // If the fetch doesn't throw a network error, it means the server is reachable.
            await fetch('https://slogan-unselect-reacquire.ngrok-free.dev/', { 
                method: 'GET',
                mode: 'no-cors'
            });
            
            // If we reach here, the server is alive
            serverStatusDot.className = 'status-dot connected';
            serverStatusText.textContent = 'Serveur Connecté';
            serverStatusText.style.color = '#10b981';
        } catch (error) {
            serverStatusDot.className = 'status-dot disconnected';
            serverStatusText.textContent = 'Serveur Déconnecté';
            serverStatusText.style.color = '#ef4444';
        }
    }
    
    // Check immediately, then every 5 seconds
    checkServerStatus();
    setInterval(checkServerStatus, 5000);

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

    const historySearchInput = document.getElementById('history-search-input');
    if (historySearchInput) {
        historySearchInput.addEventListener('input', (e) => {
            renderHistoryList(e.target.value);
        });
    }

    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value.trim() === '') {
            this.style.height = 'auto';
        }
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (currentAbortController) {
            currentAbortController.abort();
            return;
        }

        const userText = messageInput.value.trim();
        if (!userText) return;

        if (!chatData.activeSessionId || !chatData.sessions[chatData.activeSessionId]) {
            createNewSession();
        }

        const currentSession = chatData.sessions[chatData.activeSessionId];

        // Effacer l'écran d'accueil si c'est le premier message
        if (currentSession.messages.length === 0) {
            chatMessages.innerHTML = '';
        }

        if (currentSession.messages.length === 0 && currentSession.title === "Nouvelle discussion") {
            currentSession.title = userText.substring(0, 30) + (userText.length > 30 ? "..." : "");
            renderHistoryList();
        }

        messageInput.value = '';
        messageInput.style.height = 'auto';

        addMessageToUI('user', userText);

        const messageObj = { role: 'user', content: userText };

        currentSession.messages.push(messageObj);
        saveData();

        const loadingId = addLoadingIndicator();
        messageInput.disabled = true;
        sendBtn.textContent = 'Stop';
        sendBtn.classList.add('stop-btn');
        currentAbortController = new AbortController();

        try {
            let promptText = 'Système: Tu es un assistant IA spécialisé dans le domaine médical. Tu dois IMPÉRATIVEMENT répondre en français à toutes les questions, même si on te parle dans une autre langue. Ne parle pas de finance.\n';
            currentSession.messages.forEach(m => {
                if (m.content) {
                    promptText += `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}\n`;
                }
            });
            promptText += 'Assistant:';

            const requestBody = {
                model: 'phi3-financial',
                prompt: promptText,
                stream: false,
                options: {
                    num_predict: 4096
                }
            };

            const response = await fetch('https://slogan-unselect-reacquire.ngrok-free.dev/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: currentAbortController.signal
            });

            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorJson = await response.json();
                    errorDetails = errorJson.error || '';
                } catch (e) {}
                throw new Error(`Erreur HTTP: ${response.status}${errorDetails ? ' - ' + errorDetails : ''}`);
            }

            const data = await response.json();
            const assistantMessage = data.response; // Pour l'endpoint /generate, c'est .response

            removeLoadingIndicator(loadingId);
            currentSession.messages.push({ role: 'assistant', content: assistantMessage });
            saveData();
            addMessageToUI('system', assistantMessage, true);

        } catch (error) {
            removeLoadingIndicator(loadingId);
            if (error.name === 'AbortError') {
                console.log("Requête annulée par l'utilisateur");
                return;
            }
            console.error('Erreur:', error);

            let errorMsg = 'Une erreur est survenue avec le serveur distant.';
            if (error.message === 'Failed to fetch') {
                errorMsg = 'Impossible de se connecter au serveur ngrok. Le tunnel est peut-être fermé ou le CORS bloque la requête.';
            }

            const formattedError = `${errorMsg}\n\n**Détail technique de l'erreur :** \`${error.message}\``;
            currentSession.messages.push({ role: 'assistant', content: formattedError });
            saveData();
            addMessageToUI('system', formattedError, true);
        } finally {
            currentAbortController = null;
            sendBtn.textContent = 'Envoyer';
            sendBtn.classList.remove('stop-btn');
            messageInput.disabled = false;
            messageInput.focus();
            scrollToBottom();
        }
    });

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

    function renderHistoryList(searchTerm = '') {
        if (!historyList) return;
        historyList.innerHTML = '';

        const sessionIds = Object.keys(chatData.sessions).sort((a, b) => {
            return b.replace('session_', '') - a.replace('session_', '');
        });

        sessionIds.forEach(id => {
            const session = chatData.sessions[id];

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const titleMatch = session.title && session.title.toLowerCase().includes(term);
                const contentMatch = session.messages && session.messages.some(msg => msg.content && msg.content.toLowerCase().includes(term));
                if (!titleMatch && !contentMatch) return;
            }

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
                openRenameModal(id, session.title);
                dropdownDiv.classList.remove('show');
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'dropdown-item delete';
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                openDeleteModal(id);
                dropdownDiv.classList.remove('show');
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
            if (exportBtn) exportBtn.style.display = 'none';
            chatMessages.innerHTML = `
                <div class="empty-state">
                    <h2>TechCorp AI</h2>
                    <p>Comment puis-je vous aider aujourd'hui ?</p>
                    <div class="suggestions-container">
                        <button class="suggestion-chip">Quels sont les symptômes d'une grippe ?</button>
                        <button class="suggestion-chip">Différence entre paracétamol et ibuprofène</button>
                        <button class="suggestion-chip">Conseils pour améliorer la qualité du sommeil</button>
                    </div>
                </div>
            `;
            
            // Attach event listeners for chips
            setTimeout(() => {
                const chips = chatMessages.querySelectorAll('.suggestion-chip');
                chips.forEach(chip => {
                    chip.addEventListener('click', () => {
                        messageInput.value = chip.textContent;
                        chatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    });
                });
            }, 0);
        } else {
            const hasAiResponse = currentSession.messages.some(msg => msg.role !== 'user');
            if (exportBtn) exportBtn.style.display = hasAiResponse ? 'flex' : 'none';
            currentSession.messages.forEach(msg => {
                addMessageToUI(msg.role === 'user' ? 'user' : 'system', msg.content || "", msg.role !== 'user');
            });
        }
        scrollToBottom();
    }

    function addMessageToUI(role, text, useMarkdown = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (text) {
            if (useMarkdown && role === 'system' && typeof marked !== 'undefined') {
                contentDiv.innerHTML = marked.parse(text);
            } else {
                contentDiv.textContent = text;
            }
        }

        messageDiv.appendChild(contentDiv);

        if (role === 'system') {
            if (exportBtn) exportBtn.style.display = 'flex';
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.title = "Copier";
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            `;
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(text).then(() => {
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#10b981" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;
                    setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
                }).catch(err => console.error("Erreur de copie", err));
            };
            messageDiv.appendChild(copyBtn);
        }

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
        if (chatMessages) {
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        }
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
