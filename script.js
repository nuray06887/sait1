// ===== 1. ҚАРАҢҒЫ ТАҚЫРЫП =====
const themeToggleBtn = document.getElementById('themeToggleBtn');
const body = document.body;

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    themeToggleBtn.textContent = '☀️ Ашық тақырып';
} else {
    themeToggleBtn.textContent = '🌙 Қараңғы тақырып';
}

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggleBtn.textContent = isDark ? '☀️ Ашық тақырып' : '🌙 Қараңғы тақырып';
});

// ===== 2. СҰРАНЫСТАР САНАУЫШЫ =====
let requestCount = localStorage.getItem('aiRequestCount') ? parseInt(localStorage.getItem('aiRequestCount')) : 0;
const counterSpan = document.getElementById('requestCounter');
const sendBtn = document.getElementById('sendRequestBtn');

function updateCounterDisplay() {
    counterSpan.textContent = requestCount;
    localStorage.setItem('aiRequestCount', requestCount);
}
updateCounterDisplay();

sendBtn.addEventListener('click', () => {
    requestCount++;
    updateCounterDisplay();
    sendBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { sendBtn.style.transform = ''; }, 150);
});

// ===== 3. КАРТОЧКАЛАРДЫ АШУ/ЖАБУ =====
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    const header = card.querySelector('.card-header');
    const toggleBtn = card.querySelector('.card-toggle-btn');
    
    function toggleCard() {
        card.classList.toggle('open');
    }
    
    header.addEventListener('click', (e) => {
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

// ===== 4. ТӘЖІРИБЕ БӨЛІМІН АШУ/ЖАБУ =====
const expSection = document.querySelector('.experience-section');
const expHeader = document.querySelector('.exp-header');
const expToggleBtn = document.querySelector('.exp-toggle-btn');

function toggleExperience() {
    expSection.classList.toggle('open');
}

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

// ===== 5. INTERSECTION OBSERVER (скролл анимациясы) – ҚОСЫЛДЫ =====
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
