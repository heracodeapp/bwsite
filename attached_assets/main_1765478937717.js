// =============================================================================
// main.js CORRIGIDO E UNIFICADO
// =============================================================================

// =======================
// DADOS DOS PROJETOS (Fonte Única de Verdade)
// =======================
// O array de projetos agora vive aqui. Se for carregar de um banco de dados,
// a função initializeApp chamará a função para carregar os dados.
const placeholderProjects = [
    { title: "Pagina de Vendas", img: "venda.png", url: "vendas/vendas.html", description: "Uma página de vendas otimizada para conversão, com design moderno e foco na experiência do usuário." },
    { title: "Explore o Espaço🚀", img: "explore.png", url: "Explore.html", description: "Projeto interativo para explorar o sistema solar, desenvolvido com animações e tecnologias web." },
    { title: "Studio Sobrancelhas", img: "studio.png", url: "studio.html", description: "Site elegante e funcional para um estúdio de beleza, facilitando o agendamento e a exibição de portfólio." },
];


// =======================
// INICIALIZAÇÃO GERAL
// =======================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    removeLoadingScreen();
    initNavigation();
    initSmoothScrolling();
    initScrollAnimations();
    initParticleEffect();
    initAdminAccess();
    initPhoneFormatting();
    initModalControls();
    
    // INICIALIZAÇÃO DO CARROSSEL UNIFICADO
    initializeCarousel(placeholderProjects); 
}


// =======================
// LÓGICA DO CARROSSEL (Integrada e Melhorada)
// =======================
let carouselState = {
    currentSlide: 0,
    totalSlides: 0,
    autoSlideInterval: null,
    isDragging: false,
    startPos: 0,
    dragOffset: 0
};

function initializeCarousel(projects) {
    const carouselContainer = document.querySelector('.carousel-container');
    if (!projects || projects.length === 0) {
        if(carouselContainer) carouselContainer.style.display = 'none';
        return;
    }

    carouselState.totalSlides = projects.length;
    renderCarouselSlides(projects);
    setupCarouselControls();
    updateCarouselUI();
    startAutoSlide();
}

function renderCarouselSlides(projects) {
    const carousel = document.getElementById('projects-carousel');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    if (!carousel || !indicatorsContainer) return;

    carousel.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    projects.forEach((project, index) => {
        // Slide
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        // A estrutura do HTML gerado agora corresponde ao seu CSS
        slide.innerHTML = `
            <div class="slide-content">
                <div class="slide-media">
                    <img src="${project.img}" alt="${project.title}" onerror="this.onerror=null;this.src='images/default.png';">
                </div>
                <div class="slide-info">
                    <h3>${project.title}</h3>
                    <p>${project.description || 'Projeto desenvolvido com tecnologias modernas e design responsivo.'}</p>
                    <div class="project-tags">
                        <span class="tag">Responsivo</span>
                        <span class="tag">Moderno</span>
                        <span class="tag">Otimizado</span>
                    </div>
                    ${project.url ? `<a href="${project.url}" class="btn btn-secondary" style="margin-top: 1rem;">Ver Projeto</a>` : ''}
                </div>
            </div>
        `;
        carousel.appendChild(slide);

        // Indicador
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        indicator.addEventListener('click', () => {
            goToSlide(index);
            resetAutoSlide();
        });
        indicatorsContainer.appendChild(indicator);
    });
}

function setupCarouselControls() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.addEventListener('click', () => {
        previousSlide();
        resetAutoSlide();
    });
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });
    
    // Adicionar eventos de arrastar (drag) aqui se necessário
}

function goToSlide(slideIndex) {
    carouselState.currentSlide = (slideIndex + carouselState.totalSlides) % carouselState.totalSlides;
    updateCarouselUI();
}

function previousSlide() {
    goToSlide(carouselState.currentSlide - 1);
}

function nextSlide() {
    goToSlide(carouselState.currentSlide + 1);
}

function updateCarouselUI() {
    const carousel = document.getElementById('projects-carousel');
    const offset = -carouselState.currentSlide * 100;
    carousel.style.transform = `translateX(${offset}%)`;

    // Atualiza indicadores
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === carouselState.currentSlide);
    });
}

function startAutoSlide() {
    if (carouselState.totalSlides <= 1) return;
    stopAutoSlide();
    carouselState.autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
    clearInterval(carouselState.autoSlideInterval);
}

function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}


// =======================
// DEMAIS FUNCIONALIDADES (Otimizadas)
// =======================

// Loading screen
function removeLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        window.addEventListener('load', () => {
            loadingScreen.style.opacity = '0';
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.style.display = 'none';
            }, { once: true });
        });
    }
}

// Navigation
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Otimização de eventos de scroll
    let isTicking = false;
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                // Efeito da navbar
                navbar.classList.toggle('scrolled', window.scrollY > 100);
                // Atualização do link ativo
                updateActiveNavLink();
                isTicking = false;
            });
            isTicking = true;
        }
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let currentSectionId = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

// Smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = document.querySelector(this.getAttribute('href'));
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                obs.unobserve(entry.target); // Melhora a performance
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll, .tech-item, .feature').forEach(el => observer.observe(el));
}

// Particle effect
function initParticleEffect() {
    // A sua implementação atual que cria/destrói elementos pode causar problemas de performance.
    // Esta é uma otimização opcional, mas recomendada. Por enquanto, mantive a sua lógica.
    const hero = document.querySelector('.hero');
    if (!hero) return;
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        hero.appendChild(particle);
        setTimeout(() => particle.remove(), 5000);
    }, 2000);
}

// Admin access
function initAdminAccess() {
    const logo = document.querySelector('.nav-logo');
    if (!logo) return;
    let clickCount = 0;
    let clickTimer;
    logo.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimer);
        if (clickCount >= 5) {
            console.log("Acesso de Admin Ativado!");
            clickCount = 0;
        } else {
            clickTimer = setTimeout(() => (clickCount = 0), 2000);
        }
    });
}

// Phone formatting
function initPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '').substring(0, 11);
            if (value.length > 10) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d*)$/, '($1) $2');
            }
            e.target.value = value;
        });
    }
}

// Modal functions
function initModalControls() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;
    window.closeModal = () => modal.style.display = 'none';
    window.showModal = () => modal.style.display = 'block';
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
}