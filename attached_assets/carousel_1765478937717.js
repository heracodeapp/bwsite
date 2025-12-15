// =======================
// Array de projetos
// =======================
const projects = [
    { title: "Pagina de Vendas", img: "venda.png", url: "vendas/vendas.html" },
    { title: "Explore o Espaço🚀", img: "explore.png", url: "Explore.html" },
    { title: "Studio Sobrancelhas", img: "studio.png", url: "studio.html" },
];

// =======================
// Variáveis do carrossel
// =======================
let currentSlide = 0;
let totalSlides = projects.length;
let autoSlideInterval = null;

// =======================
// Inicialização
// =======================
document.addEventListener('DOMContentLoaded', () => {
    renderSlides();
    setupControls();
    updateCarousel();
    updateIndicators();
    updateControlButtons();
    startAutoSlide();
    initAutoSlidePause();
    optimizeCarouselPerformance();

    window.addEventListener('resize', updateCarouselSize);
    document.addEventListener('visibilitychange', () => {
        document.hidden ? stopAutoSlide() : resetAutoSlide();
    });
});

// =======================
// Renderiza slides
// =======================
function renderSlides() {
    const carousel = document.getElementById('projects-carousel');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    if (!carousel || !indicatorsContainer) return;

    carousel.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    projects.forEach((project, index) => {
        // Slide
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.dataset.url = project.url;
        slide.style.cursor = 'pointer';
        slide.style.position = 'relative';

        // Imagem
        const img = document.createElement('img');
        img.src = project.img;
        img.alt = project.title;
        img.className = 'carousel-img';
        img.style.width = '100%';
        img.style.display = 'block';
        img.onerror = () => { img.src = 'images/default.png'; };
        slide.appendChild(img);

        // Título
        const title = document.createElement('div');
        title.className = 'carousel-title';
        title.textContent = project.title;
        title.style.position = 'absolute';
        title.style.bottom = '15px';
        title.style.left = '15px';
        title.style.color = 'white';
        title.style.backgroundColor = 'rgba(0,0,0,0.5)';
        title.style.padding = '5px 10px';
        title.style.borderRadius = '5px';
        title.style.fontSize = '1rem';
        slide.appendChild(title);

        slide.addEventListener('click', () => window.location.href = project.url);
        carousel.appendChild(slide);

        // Indicador
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        indicator.addEventListener('click', () => { goToSlide(index); resetAutoSlide(); });
        indicatorsContainer.appendChild(indicator);
    });
}

// =======================
// Controles
// =======================
function setupControls() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => { previousSlide(); resetAutoSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });

    const carousel = document.getElementById('projects-carousel');
    if (!carousel) return;

    let startX = 0;
    let isDragging = false;

    carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
    carousel.addEventListener('touchmove', e => { if (isDragging && Math.abs(e.touches[0].clientX - startX) > 10) e.preventDefault(); }, { passive: true });
    carousel.addEventListener('touchend', e => handleSwipe(e.changedTouches[0].clientX));

    carousel.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; carousel.style.cursor = 'grabbing'; });
    carousel.addEventListener('mousemove', e => { if (isDragging) e.preventDefault(); });
    carousel.addEventListener('mouseup', e => handleSwipe(e.clientX));
    carousel.addEventListener('mouseleave', () => { isDragging = false; carousel.style.cursor = 'grab'; });

    function handleSwipe(endX) {
        if (!isDragging) return;
        isDragging = false;
        carousel.style.cursor = 'grab';
        const diffX = startX - endX;
        if (Math.abs(diffX) > 50) diffX > 0 ? nextSlide() : previousSlide();
        resetAutoSlide();
    }

    document.addEventListener('keydown', e => {
        if (!isElementInViewport(carousel)) return;
        if (e.key === 'ArrowLeft') { previousSlide(); resetAutoSlide(); }
        if (e.key === 'ArrowRight') { nextSlide(); resetAutoSlide(); }
    });
}

// =======================
// Navegação do carrossel
// =======================
function goToSlide(index) { currentSlide = index; updateCarousel(); updateIndicators(); updateControlButtons(); }
function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; updateCarousel(); updateIndicators(); updateControlButtons(); }
function previousSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateCarousel(); updateIndicators(); updateControlButtons(); }

// =======================
// Atualização visual
// =======================
function updateCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');

    slides.forEach((slide, index) => {
        // Move os slides horizontalmente
        const translateX = (index - currentSlide) * 100;
        slide.style.transform = `translateX(${translateX}%)`;
        slide.style.transition = 'transform 0.6s ease-in-out';

        // Mantém todos os slides visíveis para uma transição fluida
        slide.style.opacity = '1';
        slide.style.pointerEvents = 'auto';
    });
}

function updateIndicators() {
    document.querySelectorAll('.indicator').forEach((ind, i) => ind.classList.toggle('active', i === currentSlide));
}

function updateControlButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (totalSlides <= 1) { if (prevBtn) prevBtn.style.display = 'none'; if (nextBtn) nextBtn.style.display = 'none'; return; }
    if (prevBtn) { prevBtn.style.display = 'block'; prevBtn.disabled = false; }
    if (nextBtn) { nextBtn.style.display = 'block'; nextBtn.disabled = false; }
}

// =======================
// Auto-slide
// =======================
function startAutoSlide() { if (totalSlides <= 1) return; autoSlideInterval = setInterval(nextSlide, 5000); }
function stopAutoSlide() { if (autoSlideInterval) { clearInterval(autoSlideInterval); autoSlideInterval = null; } }
function resetAutoSlide() { stopAutoSlide(); startAutoSlide(); }
function initAutoSlidePause() {
    const container = document.querySelector('.carousel-container');
    if (!container) return;
    container.addEventListener('mouseenter', stopAutoSlide);
    container.addEventListener('mouseleave', startAutoSlide);
}

// =======================
// Utilities
// =======================
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 &&
           rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
           rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

// =======================
// Resize
// =======================
function updateCarouselSize() { updateCarousel(); }

// =======================
// Performance
// =======================
function optimizeCarouselPerformance() {
    document.querySelectorAll('.carousel-slide').forEach(slide => {
        slide.style.willChange = 'transform';
        slide.style.backfaceVisibility = 'hidden';
    });
}
