// ==================== SYSTÈME DE CHATBOT ====================
class ChatbotSystem {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.messages = [];
        this.apiUrl = '/api/chatbot/';
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        this.setupEventListeners();
        this.loadHistory();
    }

    setupEventListeners() {
        const chatbotBtn = document.getElementById('chatbotBtn');
        const chatbotClose = document.getElementById('chatbotClose');
        const chatbotSend = document.getElementById('chatbotSend');
        const chatbotInput = document.getElementById('chatbotInput');
        if (chatbotBtn) {
            chatbotBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Chatbot button clicked');
                this.toggleChatbot();
            });
            console.log('✅ Chatbot button event listener attached');
        } else {
            console.error('❌ Chatbot button not found');
        }
        if (chatbotClose) chatbotClose.addEventListener('click', () => this.toggleChatbot());
        if (chatbotSend) chatbotSend.addEventListener('click', () => this.sendMessage());
        if (chatbotInput) chatbotInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendMessage(); });
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                const input = document.getElementById('chatbotInput');
                if (input) { input.value = question; this.sendMessage(); }
            });
        });
        document.addEventListener('click', (e) => {
            const container = document.getElementById('chatbotContainer');
            const btn = document.getElementById('chatbotBtn');
            if (container && container.classList.contains('active') && !container.contains(e.target) && !btn.contains(e.target)) {
                container.classList.remove('active');
            }
        });
    }

    toggleChatbot() {
        const container = document.getElementById('chatbotContainer');
        if (!container) return;
        container.classList.toggle('active');
        if (container.classList.contains('active')) {
            const input = document.getElementById('chatbotInput');
            if (input) input.focus();
            this.scrollToBottom();
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        if (!input) return;
        const message = input.value.trim();
        if (!message) return;
        this.addMessage(message, 'user');
        input.value = '';
        const typingIndicator = this.showTypingIndicator();
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: this.sessionId, message: message })
            });
            if (response.ok) {
                const data = await response.json();
                typingIndicator.remove();
                const botMessage = data.response || data.answer || "Désolé, je n'ai pas pu obtenir de réponse.";
                this.addMessage(botMessage, 'bot');
            } else {
                throw new Error('Erreur de réponse API');
            }
        } catch (error) {
            console.error('Erreur chatbot:', error);
            typingIndicator.remove();
            this.addMessage("Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.", 'bot');
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        this.messages.push({ text, sender, timestamp: new Date().toISOString() });
        this.saveHistory();
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.textContent = "L'assistant IA réfléchit...";
        typingDiv.id = 'typingIndicator';
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        return typingDiv;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    saveHistory() { localStorage.setItem('chatbot-history', JSON.stringify({ sessionId: this.sessionId, messages: this.messages })); }
    loadHistory() {
        const stored = localStorage.getItem('chatbot-history');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.sessionId = data.sessionId;
                this.messages = data.messages;
                this.rebuildChat();
            } catch (e) { console.error('Erreur de chargement de l\'historique:', e); }
        }
    }

    rebuildChat() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        messagesContainer.innerHTML = '';
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'message bot';
        welcomeMsg.textContent = 'Bonjour ! Je suis votre assistant IA EcoTrack. Comment puis-je vous aider aujourd\'hui ?';
        messagesContainer.appendChild(welcomeMsg);
        this.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender}`;
            messageDiv.textContent = msg.text;
            messagesContainer.appendChild(messageDiv);
        });
        this.scrollToBottom();
    }
}
