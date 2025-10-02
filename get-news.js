// Este é um exemplo de uma Função Serverless (Serverless Function).
// Este arquivo deve ser colocado em uma pasta chamada `api` na raiz do seu projeto.
// Plataformas como Vercel ou Netlify irão automaticamente transformar este arquivo
// em um endpoint de API que você pode chamar.

export default async function handler(req, res) {
    // IMPORTANTE: A sua chave de API NUNCA deve ser escrita diretamente no código.
    // Ela é lida de uma "Variável de Ambiente" que você configura no painel da sua hospedagem (Vercel, Netlify, etc.).
    const API_KEY = process.env.NEWS_API_KEY;

    // Se a chave não estiver configurada no servidor, retorna um erro.
    if (!API_KEY) {
        return res.status(500).json({ message: 'A chave da API de notícias não está configurada no servidor.' });
    }
    
    // URL para buscar as 5 notícias de tecnologia mais recentes do Brasil.
    const url = `https://newsapi.org/v2/top-headlines?country=br&category=technology&pageSize=5&apiKey=${API_KEY}`;

    try {
        const newsResponse = await fetch(url);
        if (!newsResponse.ok) {
            // Não exponha detalhes do erro da API para o cliente por segurança.
            console.error(`NewsAPI respondeu com status: ${newsResponse.status}`);
            throw new Error('Erro ao comunicar com o serviço de notícias.');
        }
        
        const newsData = await newsResponse.json();
        res.status(200).json(newsData.articles);
    } catch (error) {
        console.error('Erro na função serverless get-news:', error);
        res.status(500).json({ message: 'Erro interno ao buscar notícias.' });
    }
}