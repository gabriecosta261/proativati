// --- 6. Lógica do Preloader ---
window.addEventListener('load', () => {
    // 9. Registra o Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('Service Worker registrado com sucesso:', registration))
            .catch(error => console.log('Falha ao registrar Service Worker:', error));
    }

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
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        const ariaLabel = isDarkMode ? 'Alternar para o modo claro' : 'Alternar para o modo escuro';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
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

    // --- 8. Animações com GSAP e ScrollTrigger ---
    gsap.registerPlugin(ScrollTrigger);
    const revealElements = document.querySelectorAll('.gsap-reveal');
    revealElements.forEach(el => {
        gsap.fromTo(el, {
            y: 50,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
    
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
            delay: 2500, // Passa para o próximo slide a cada 5 segundos
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

    // --- Inicialização do Carrossel do Blog ---
    const blogSwiper = new Swiper('.blog-swiper-container', {
        loop: true,
        observer: true, // Recalcula o layout se houver mudanças (ex: troca de tema)
        autoplay: {
            delay: 5000, // Avança a cada 5 segundos
            disableOnInteraction: false, // Continua o autoplay mesmo após o usuário interagir
        },
        pagination: {
            el: '.blog-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.blog-button-next',
            prevEl: '.blog-button-prev',
        },
        slidesPerView: 1,      // Mostra apenas um slide por vez
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

    // --- 7. Envio de Formulário com AJAX e Validação ---
    const form = document.getElementById('contact-form');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const formStatus = document.getElementById('form-status');

    const validateEmail = (email) => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);
    const validateName = (name) => name.trim().length >= 3;

    const validateField = (input, validationFn, errorMessageText) => {
        const errorMessage = input.previousElementSibling.querySelector('.error-message');
        const isValid = validationFn(input.value);
        if (isValid) {
            input.classList.remove('invalid');
            if (errorMessage) errorMessage.textContent = '';
        } else {
            input.classList.add('invalid');
            if (errorMessage) errorMessage.textContent = errorMessageText;
        }
        return isValid;
    };

    // Validação em tempo real enquanto o usuário digita
    nameInput.addEventListener('input', () => validateField(nameInput, validateName, ' (mínimo 3 caracteres)'));
    emailInput.addEventListener('input', () => validateField(emailInput, validateEmail, ' (e-mail inválido)'));


    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const isNameValid = validateField(nameInput, validateName, ' (mínimo 3 caracteres)');
        const isEmailValid = validateField(emailInput, validateEmail, ' (e-mail inválido)');

        if (!isNameValid || !isEmailValid) return;

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        try {
            const response = await fetch('https://formspree.io/f/xovkjnnn', {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.textContent = 'Mensagem enviada com sucesso!';
                formStatus.className = 'success';
                form.reset();
            } else {
                throw new Error('Falha no envio');
            }
        } catch (error) {
            formStatus.textContent = 'Ocorreu um erro. Tente novamente.';
            formStatus.className = 'error';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Mensagem';
            setTimeout(() => formStatus.textContent = '', 5000);
        }
    });
});