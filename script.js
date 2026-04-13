// ===== 1. ҚАРАҢҒЫ ТАҚЫРЫП (Theme Toggle) =====
const themeToggleBtn = document.getElementById('themeToggleBtn');
const body = document.body;

// Жүйеде сақталған тақырыпты тексеру
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

// ===== 2. СҰРАНЫСТАР САНАУЫШЫ (Counter) =====
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
    // Қысқаша анимация эффектісі
    sendBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { sendBtn.style.transform = ''; }, 150);
    // Қосымша: консольға шығару
    console.log(`ЖИ сұраныс жіберілді. Барлығы: ${requestCount}`);
});

// ===== 3. INTERSECTION OBSERVER API (скролл кезінде карточкалар анимациясы) =====
const animatedElements = document.querySelectorAll('.animate-on-scroll');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Қайталап анимация жасамау үшін, кіргеннен кейін бақылауды тоқтатуға болады (қалауыңызша)
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2,        // Элементтің 20% көрінгенде анимация қосылады
    rootMargin: '0px 0px -50px 0px'  // Аздап ертерек іске қосу
});

animatedElements.forEach(el => {
    observer.observe(el);
});

// Қосымша: Егер бет жылдам ашылса, алдын ала көрініп тұрған элементтерді тексеру
setTimeout(() => {
    animatedElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight - 100) {
            el.classList.add('animate-in');
            observer.unobserve(el);
        }
    });
}, 200);
