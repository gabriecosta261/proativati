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
        if (event.target.tagName === 'A' && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Acessibilidade: Fecha o menu com a tecla 'Escape'
    window.addEventListener('keydown', (event) => {
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

    // --- Inicialização do Carrossel da Galeria ---
    const swiper = new Swiper('.gallery-swiper-container', {
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

    // --- Lógica para buscar e exibir posts do blog ---
    let blogSwiper; // Declara a variável do swiper aqui
    // --- Lógica para buscar e exibir posts do blog ---
    async function fetchAndDisplayBlogPosts() {
        const blogWrapper = document.querySelector('.blog-swiper-container .swiper-wrapper');
        if (!blogWrapper) return;

        // Verifica se a página está sendo servida por um servidor (http) e não localmente (file://)
        if (window.location.protocol === 'file:') {
            blogWrapper.innerHTML = '<div class="blog-loading">A busca de notícias funciona apenas em um servidor web.</div>';
            console.warn('A busca de notícias foi desativada no ambiente local (file://). Use um servidor de desenvolvimento.');
            return;
        }

        try {
            // A URL aponta para a nossa função serverless (o intermediário)
            const response = await fetch('/api/get-news'); 
            if (!response.ok) throw new Error('Falha ao carregar notícias.');

            const articles = await response.json();

            // Limpa a mensagem de "Carregando..."
            blogWrapper.innerHTML = ''; 

            articles.forEach(article => {
                // Usa uma imagem padrão caso o artigo não tenha uma
                const imageUrl = article.urlToImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1172';
                
                const postHTML = `
                    <article class="swiper-slide blog-post">
                        <img src="${imageUrl}" alt="${article.title || 'Imagem da notícia'}">
                        <div class="blog-content">
                            <span class="blog-category">Tecnologia</span>
                            <h3>${article.title}</h3>
                            <p>${article.description || 'Clique para ler mais.'}</p>
                            <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more">Leia Mais <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </article>
                `;
                blogWrapper.insertAdjacentHTML('beforeend', postHTML);
            });

            // Inicializa o Swiper do blog APENAS se houver artigos
            if (articles.length > 0 && !blogSwiper) {
                blogSwiper = new Swiper('.blog-swiper-container', {
                    observer: true,
                    loop: true,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false,
                    },
                    pagination: {
                        el: '.blog-pagination',
                        clickable: true,
                    },
                    navigation: {
                        nextEl: '.blog-button-next',
                        prevEl: '.blog-button-prev',
                    },
                    slidesPerView: 1,
                });
                blogSwiper.autoplay.start();
            }

        } catch (error) {            
            // Verifica se o erro foi um 404 (Not Found), comum em servidores de desenvolvimento locais como o Live Server.
            if (error.message.includes('404')) {
                blogWrapper.innerHTML = '<div class="blog-loading">A busca de notícias está funcionando! Ela será ativada quando o site for publicado.</div>';
            } else {
                blogWrapper.innerHTML = '<div class="blog-loading">Não foi possível carregar as notícias. Tente novamente mais tarde.</div>';
            }
            console.error('Erro ao buscar posts do blog:', error);
        }
    }

    // --- 7. Lógica do FAQ (Accordion) ---
    const faqItems = document.querySelectorAll('.faq-item');

    // Inicializa o estado de acessibilidade dos painéis de resposta
    faqItems.forEach(item => {
        const answer = item.querySelector('.faq-answer');
        const questionButton = item.querySelector('.faq-question');
        const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';

        if (!isExpanded) {
            answer.setAttribute('aria-hidden', 'true');
        }
    });

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        questionButton?.addEventListener('click', () => {
            const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';
            questionButton.setAttribute('aria-expanded', String(!isExpanded));
            answer.setAttribute('aria-hidden', String(isExpanded));
            answer.style.maxHeight = !isExpanded ? answer.scrollHeight + 'px' : '0px';
        });
    });

    // Chama a função para carregar os posts do blog
    fetchAndDisplayBlogPosts();

    // --- 7. Envio de Formulário com AJAX e Validação ---
    const form = document.getElementById('contact-form');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message'); // 1. Adicionar o campo de mensagem
    const formStatus = document.getElementById('form-status');

    const validateEmail = (email) => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);
    const validateName = (name) => name.trim().length >= 3;
    const validateMessage = (message) => message.trim().length >= 10; // 1. Adicionar validação para a mensagem

    const validateField = (input, validationFn, errorMessageText) => {
        if (!input) return true; // Retorna true se o campo não existir para não quebrar o script
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
    messageInput.addEventListener('input', () => validateField(messageInput, validateMessage, ' (mínimo 10 caracteres)')); // 1. Adicionar validação em tempo real para a mensagem


    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const isNameValid = validateField(nameInput, validateName, ' (mínimo 3 caracteres)');
        const isEmailValid = validateField(emailInput, validateEmail, ' (e-mail inválido)');
        const isMessageValid = validateField(messageInput, validateMessage, ' (mínimo 10 caracteres)'); // 1. Validar a mensagem

        if (!isNameValid || !isEmailValid || !isMessageValid) return; // 1. Checar se todos os campos são válidos

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
                // 2. Redireciona para a página de obrigado em vez de mostrar a mensagem
                window.location.href = form.querySelector('input[name="_next"]').value || 'obrigado.html';
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