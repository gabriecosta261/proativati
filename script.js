// --- 6. Lógica do Preloader ---
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;

    // --- Lógica do Modo Escuro ---
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // Aplica o tema salvo ao carregar a página
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.setAttribute('aria-label', 'Alternar para o modo claro');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        let theme = 'light';
        let ariaLabel = 'Alternar para o modo escuro';

        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark';
            ariaLabel = 'Alternar para o modo claro';
        }
        
        localStorage.setItem('theme', theme);
        themeToggle.setAttribute('aria-label', ariaLabel);
    });

    if (!menuToggle || !navLinks || !menuIcon) {
        return; // Previne erros se os elementos não existirem
    }
    
    const toggleMenu = () => {
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);

        // Alterna o ícone e o aria-label
        menuIcon.classList.toggle('fa-bars', !isExpanded);
        menuIcon.classList.toggle('fa-times', isExpanded);
        menuToggle.setAttribute('aria-label', isExpanded ? 'Fechar menu' : 'Abrir menu');
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

    // --- Inicialização do Carrossel Swiper.js ---
    const swiper = new Swiper('.swiper-container', {
        // Opções
        loop: true, // Permite que o carrossel volte ao início
        autoplay: {
            delay: 5000, // Passa para o próximo slide a cada 5 segundos
            disableOnInteraction: false, // Continua o autoplay mesmo após interação do usuário
        },
        // Habilita o Lazy Loading
        lazy: {
            loadPrevNext: true, // Carrega a imagem do slide anterior e do próximo
        },
        preloadImages: false, // Desabilita o pré-carregamento de todas as imagens
        pagination: {
            el: '.swiper-pagination',
            clickable: true, // Permite clicar nas bolinhas para navegar
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // --- 7. Lógica do FAQ (Accordion) ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        questionButton?.addEventListener('click', () => {
            const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';
            
            questionButton.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0px';
            }
        });
    });

    // --- 10. Validação do Formulário em Tempo Real ---
    const form = document.getElementById('contact-form');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');

    const validateField = (input, validationFn) => {
        const errorMessage = input.previousElementSibling.querySelector('.error-message');
        if (validationFn(input.value)) {
            input.classList.remove('invalid');
            if (errorMessage) errorMessage.textContent = '';
            return true;
        } else {
            input.classList.add('invalid');
            return false;
        }
    };

    const validateEmail = (email) => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);
    const validateName = (name) => name.trim().length >= 3;

    emailInput.addEventListener('input', () => validateField(emailInput, validateEmail));
    nameInput.addEventListener('input', () => validateField(nameInput, validateName));

    form.addEventListener('submit', (event) => {
        const isNameValid = validateField(nameInput, validateName);
        const isEmailValid = validateField(emailInput, validateEmail);

        if (!isNameValid) {
            nameInput.previousElementSibling.querySelector('.error-message').textContent = ' (mínimo 3 caracteres)';
        }
        if (!isEmailValid) {
            emailInput.previousElementSibling.querySelector('.error-message').textContent = ' (e-mail inválido)';
        }

        if (!isNameValid || !isEmailValid) {
            event.preventDefault(); // Impede o envio do formulário se for inválido
        }
    });
});