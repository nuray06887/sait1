/**
 * ================================================
 * ПРАКТИКАЛЫҚ ЖҰМЫС №1 | ЖИ веб-әзірлеуде
 * Автор: Студент
 * Описание: Бұл скрипт веб-беттің интерактивтілігін қамтамасыз етеді:
 *    - Қараңғы/ашық тақырыпты ауыстыру
 *    - Карточкаларды ашу/жабу
 *    - DeepSeek API (Ollama арқылы) чат интерфейсі
 *    - Сұраныс санауыш
 *    - Intersection Observer арқылы скролл анимациясы
 * ================================================
 */

// ==========================================
// 1. ҚАРАҢҒЫ ТАҚЫРЫП (Theme Toggle)
// Функция: localStorage-ге таңдауды сақтап, тақырыпты ауыстырады
// Негізгі параметрлер: ешқандай параметр қабылдамайды
// ==========================================
const themeToggleBtn = document.getElementById('themeToggleBtn');
const body = document.body;

// Бет жүктелгенде сақталған тақырыпты тексеру
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    themeToggleBtn.textContent = '☀️ Ашық тақырып';
} else {
    themeToggleBtn.textContent = '🌙 Қараңғы тақырып';
}

// Тақырыпты ауыстыру функциясы
themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggleBtn.textContent = isDark ? '☀️ Ашық тақырып' : '🌙 Қараңғы тақырып';
});

// ==========================================
// 2. OLLAMA + DEEPSEEK CHAT (3-ТАПСЫРМА)
// Конфигурация: жергілікті Ollama серверіне сұраныс жібереді
// Модель: deepseek-v3.1:671b-cloud (Ollama Cloud)
// API URL: http://localhost:11434/api/generate
// ==========================================

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2:3b';

// Чат элементтері
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

/**
 * Сұраныстар санауышы
 * @description Пайдаланушы ЖИ-ге жіберген сұраныстар санын есептейді
 */
let requestCount = localStorage.getItem('aiRequestCount') ? parseInt(localStorage.getItem('aiRequestCount')) : 0;
const counterSpan = document.getElementById('requestCounter');
const sendRequestBtn = document.getElementById('sendRequestBtn');

function updateCounterDisplay() {
    counterSpan.textContent = requestCount;
    localStorage.setItem('aiRequestCount', requestCount);
}
updateCounterDisplay();

// Ескі "Жіберу" батырмасы (санауышты арттыру үшін)
if (sendRequestBtn) {
    sendRequestBtn.addEventListener('click', () => {
        requestCount++;
        updateCounterDisplay();
        // Кнопкаға анимация
        sendRequestBtn.style.transform = 'scale(0.95)';
        setTimeout(() => { sendRequestBtn.style.transform = ''; }, 150);
    });
}

// Textarea биіктігін автоматты түрде реттеу
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

/**
 * Ollama серверінің статусын тексеру * @returns {Promise<boolean>} - Сервер қосылған болса true, else false
 */
async function checkOllamaStatus() {
    statusDot.style.backgroundColor = '#f59e0b';
    statusText.textContent = 'Ollama серверін тексеру...';
    
    try {
        const response = await fetch('http://localhost:11434/api/tags', {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
            const data = await response.json();
            const models = data.models || [];
            const hasModel = models.some(m => m.name.includes('deepseek-v3.1'));
            
            if (hasModel) {
                statusDot.style.backgroundColor = '#10b981';
                statusText.textContent = '✅ DeepSeek-V3.1 Cloud моделі дайын | Сұрақ қоюға болады';
                return true;
            } else {
                statusDot.style.backgroundColor = '#f59e0b';
                statusText.textContent = '⚠️ DeepSeek моделі жоқ. Терминалда: ollama run deepseek-v3.1:671b-cloud';
                return false;
            }
        }
        throw new Error('Сервер жауап бермеді');
    } catch (error) {
        statusDot.style.backgroundColor = '#ef4444';
        statusText.textContent = '❌ Ollama қосылмаған. Терминалда "ollama serve" орындаңыз';
        return false;
    }
}

/**
 * DeepSeek Cloud моделіне сұраныс жіберу
 * @param {string} userMessage - Пайдаланушының сұрағы
 * @returns {Promise<string>} - ЖИ жауабы
 */
async function sendToDeepSeek(userMessage) {
    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: userMessage,
                stream: false,
                options: {
                    temperature: 0.7,
                    max_tokens: 1000,
                    top_p: 0.9
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData.substring(0, 100)}`);
        }
        
        const data = await response.json();
        return data.response || "Жауап алынбады. Қайталап көріңіз.";
        
    } catch (error) {
        console.error('DeepSeek қатесі:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
            return `❌ Ollama сервері қосылмаған.

Командаларды орындаңыз:
1. Жаңа терминал ашып: ollama serve
2. Басқа терминалда: ollama run deepseek-v3.1:671b-cloud

Егер cloud модель рұқсат сұраса, браузердегі сілтемеге өтіңіз.`;
        }
        return `❌ Қате: ${error.message}`;
    }
}

/**
 * HTML таңбаларын экрандау (XSS қорғанысы)
 * @param {string} text - Тазартылмаған мәтін
 * @returns {string} - Тазартылған мәтін
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Қарапайым Markdown пішімдеу
 * @param {string} text - Пішімделмеген мәтін
 * @returns {string} - Пішімделген HTML
 */
function formatMarkdown(text) {
    // Код блоктары (```code```)
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    // Инлайн код (`code`)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Жолдарды br-ге ауыстыру
    text = text.replace(/\n/g, '<br>');
    return text;
}

/**
 * Чатқа хабарлама қосу
 * @param {string} message - Хабарлама мәтіні
 * @param {string} sender - 'user' немесе 'bot'
 * @param {boolean} isLoading - Жүктеу индикаторын көрсету керек пе
 * @returns {HTMLElement} - Қосылған элемент
 */
function addMessage(message, sender, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">${escapeHtml(message)}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${isLoading ? '<span class="typing-indicator">⚡ Ойлануда...</span>' : formatMarkdown(escapeHtml(message))}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    // Автоматты түрде төмен қарай жылжу
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return messageDiv;
}

/**
 * Хабарлама жіберу (негізгі логика)
 * @description Пайдаланушы сұрағын алып, DeepSeek API-ға жібереді
 */
async function handleSendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    
    // Пайдаланушы хабарламасын көрсету
    addMessage(userMessage, 'user');
    
    // Инпутты тазарту
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Сұраныс санауышын арттыру
    requestCount++;
    updateCounterDisplay();
    
    // Жүктеу индикаторын көрсету
    const loadingMsg = addMessage('', 'bot', true);
    
    // ЖИ-ге сұраныс жіберу
    const aiResponse = await sendToDeepSeek(userMessage);
    
    // Жүктеу хабарын нақты жауаппен ауыстыру
    loadingMsg.remove();
    addMessage(aiResponse, 'bot');
}

// Батырманы басқанда
chatSendBtn.addEventListener('click', handleSendMessage);

// Enter батырмасы (Shift+Enter - жаңа жол)
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// ==========================================
// 3. КАРТОЧКАЛАРДЫ АШУ/ЖАБУ (Accordion)
// Функция: Карточканың тақырыбын басқанда толық ақпарат ашылады
// ==========================================
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    const header = card.querySelector('.card-header');
    const toggleBtn = card.querySelector('.card-toggle-btn');
    
    const toggleCard = () => {
        card.classList.toggle('open');
    };
    
    header.addEventListener('click', (e) => {
        // Егер сілтеме басылса, карточканы ашпа
        if (e.target.closest('.card-link')) return;
        toggleCard();
    });
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCard();
        });
    }
});

// ==========================================
// 4. ТӘЖІРИБЕ БӨЛІМІН АШУ/ЖАБУ
// ==========================================
const expSection = document.querySelector('.experience-section');
const expHeader = document.querySelector('.exp-header');
const expToggleBtn = document.querySelector('.exp-toggle-btn');

const toggleExperience = () => {
    expSection.classList.toggle('open');
};

if (expHeader) {
    expHeader.addEventListener('click', (e) => {
        if (e.target.closest('.exp-toggle-btn')) return;
        toggleExperience();
    });
}

if (expToggleBtn) {
    expToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleExperience();
    });
}

// ==========================================
// 5. INTERSECTION OBSERVER (Скролл анимациясы)
// Функция: Бетті айналдырғанда элементтер біртіндеп пайда болады
// ==========================================
const animatedElements = document.querySelectorAll('.card, .experience-section');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

animatedElements.forEach(el => {
    observer.observe(el);
});

// ==========================================
// 6. БЕТ ЖҮКТЕЛГЕНДЕ СТАТУСТЫ ТЕКСЕРУ
// ==========================================
checkOllamaStatus();
// Әр 30 секунд сайын статусты қайта тексеру
setInterval(checkOllamaStatus, 30000);
