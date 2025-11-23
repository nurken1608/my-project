// Данные для всплывающей панели проектов
const projectData = {
    'parallelai': {
        title: 'ParallelAI',
        status: 'IN DEVELOPMENT',
        description: 'A revolutionary platform for collaborative AI model training, utilizing decentralized computing resources for faster iteration and lower costs.'
    },
    'overcoffee': {
        title: 'Over Coffee',
        status: 'LIVE',
        description: 'A social networking app designed for professionals to schedule quick, informal virtual coffee breaks for networking and mentorship.'
    },
    // Добавить данные для project3 и project4
};

// ===================================
// 1. Логика Аккордеона для Skills
// ===================================

document.querySelectorAll('.accordion-header').forEach(header => {
    // Для каждого заголовка аккордеона добавляем обработчик клика
    header.addEventListener('click', () => {
        // Находим родительский элемент (.accordion-item)
        const item = header.closest('.accordion-item');
        // Находим контент, который нужно показать/скрыть
        const content = item.querySelector('.accordion-content');
        // Находим иконку для поворота
        const icon = item.querySelector('.arrow-icon');
        
        // Переключаем класс 'active' для контента (показ/скрытие)
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
        
        // Поворот иконки: 0deg (вниз) -> 180deg (вверх)
        icon.style.transform = content.style.display === 'block' ? 'rotate(180deg)' : 'rotate(0deg)';
    });
});

// ===================================
// 2. Логика Подсветки Навигации (Intersection Observer)
// ===================================

// Получаем все навигационные ссылки
const navLinks = document.querySelectorAll('.nav-link');
// Получаем все секции, кроме Hero, для Intersection Observer
const sections = document.querySelectorAll('.section:not(#hero)'); 

// Функция для установки активной ссылки
const setActiveLink = (id) => {
    navLinks.forEach(link => {
        link.classList.remove('active', 'hero-active'); // Сброс всех активных классов
        // Если ID совпадает, делаем ссылку активной
        if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
        }
    });
};

// Intersection Observer для мониторинга видимости секций
const observer = new IntersectionObserver(entries => {
    // Секция, которая ближе всего к верхней части viewport
    let currentSectionId = ''; 
    
    entries.forEach(entry => {
        // Если секция видна, ее ID становится текущим
        if (entry.isIntersecting) {
            currentSectionId = entry.target.id;
        }
    });

    // Специальная логика для Hero section
    const heroSection = document.getElementById('hero');
    // Проверяем, находится ли Hero в области видимости (Hero - это самый верх)
    const isHeroVisible = heroSection.getBoundingClientRect().top < window.innerHeight / 2 && heroSection.getBoundingClientRect().bottom > window.innerHeight / 2;

    if (isHeroVisible) {
        // Если в Hero, все ссылки должны быть подсвечены
        navLinks.forEach(link => link.classList.add('hero-active'));
        setActiveLink('hero'); // Используем 'hero' как фиктивный активный ID
    } else if (currentSectionId) {
        // Иначе подсвечиваем текущую секцию
        setActiveLink(currentSectionId);
    } else {
        // Если ни одна секция не видна (редко, но бывает), сбрасываем все
        navLinks.forEach(link => link.classList.remove('active', 'hero-active'));
    }
}, {
    // Root: null (viewport), threshold: 0.5 (активна, когда видно 50% секции)
    rootMargin: "-50% 0px -50% 0px" 
});

// Наблюдение за всеми секциями
sections.forEach(section => observer.observe(section));
// Отдельное наблюдение за Hero
observer.observe(document.getElementById('hero'));


// ===================================
// 3. Логика Всплывающей Панели Деталей
// ===================================

const projectCards = document.querySelectorAll('.project-card');
const detailPanel = document.getElementById('project-details-panel');
const closeBtn = detailPanel.querySelector('.close-btn');

// Находим элементы панели для заполнения данными
const detailTitle = document.getElementById('detail-title');
const detailStatus = document.getElementById('detail-status');
const detailDescription = document.getElementById('detail-description');

// Функция показа панели
function showDetails(projectId) {
    const data = projectData[projectId];
    if (!data) return; // Выход, если данных нет

    // Заполнение панели данными
    detailTitle.textContent = data.title;
    detailStatus.textContent = data.status;
    detailDescription.textContent = data.description;

    // Отображение панели
    detailPanel.classList.remove('hidden');
    // Активация CSS-класса для анимации сдвига
    setTimeout(() => { 
        detailPanel.classList.add('active'); 
    }, 10); // Небольшая задержка для срабатывания transition
}

// Функция скрытия панели
function hideDetails() {
    // Деактивация CSS-класса для анимации сдвига вниз
    detailPanel.classList.remove('active');
    // Скрытие панели после завершения анимации
    detailPanel.addEventListener('transitionend', function handler() {
        detailPanel.classList.add('hidden');
        detailPanel.removeEventListener('transitionend', handler);
    });
}

// Добавление обработчика клика на карточки
projectCards.forEach(card => {
    card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project-id');
        showDetails(projectId);
    });
});

// Добавление обработчика клика на кнопку закрытия
closeBtn.addEventListener('click', hideDetails);