const CACHE_NAME = 'proativa-ti-cache-v2'; // Incremente a versão ao fazer alterações
const urlsToCache = [
    '/',
    '/obrigado.html', // Adicione a página de obrigado ao cache
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
        // Estratégia: Cache first, then network
        caches.match(event.request).then(cachedResponse => {
            // Se a resposta estiver no cache, retorna-a.
            if (cachedResponse) {
                return cachedResponse;
            }

            // Se não estiver no cache, busca na rede.
            return fetch(event.request).then(networkResponse => {
                // Opcional: Adicionar a nova resposta ao cache para futuras requisições.
                // Cuidado ao fazer isso para todas as requisições (ex: APIs POST).
                // Aqui, é seguro para as requisições GET que não foram cacheadas inicialmente.
                return caches.open(CACHE_NAME).then(cache => {
                    // Clona a resposta, pois ela só pode ser consumida uma vez.
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Opcional: Retornar uma página de fallback offline se a rede falhar.
                // return caches.match('/offline.html');
            });
        })
    );
});

// Limpa caches antigos quando um novo Service Worker é ativado
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});