document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    const toggleMenu = () => {
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Delegação de Eventos: Fecha o menu ao clicar em um link
    navLinks.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            toggleMenu();
        }
    });

    // Acessibilidade: Fecha o menu com a tecla 'Escape'
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });

    // --- Animação de Fade-in na Rolagem ---
    // O código do Intersection Observer já é moderno e eficiente,
    // portanto, foi mantido como está.
    const fadeInElements = document.querySelectorAll('.fade-in-element');

    const observerOptions = {
        root: null, // Observa em relação ao viewport
        rootMargin: '0px',
        threshold: 0.1 // Ativa quando 10% do elemento está visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Para a observação do elemento após ele se tornar visível
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeInElements.forEach(el => observer.observe(el));

    // --- Lógica para o Cabeçalho que Reaparece ---
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
            // Rolando para baixo
            header.classList.add('header-hidden');
        } else {
            // Rolando para cima
            header.classList.remove('header-hidden');
        }

        lastScrollY = currentScrollY;
    });
});