const CACHE_NAME = 'proativa-ti-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/imagens/logo1_fundo.png',
    '/imagens/logotipo.png',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Poppins:wght@600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Instala o Service Worker e armazena os arquivos em cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercepta as requisições e serve os arquivos do cache se disponíveis
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se encontrar no cache, retorna a resposta do cache
                if (response) {
                    return response;
                }
                // Senão, faz a requisição à rede
                return fetch(event.request);
            })
    );
});