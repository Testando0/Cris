// Importa o cliente OpenAI
const { OpenAI } = require('openai');

// IMPORTANTE: A chave de API é lida AUTOMATICAMENTE da variável de ambiente OPENAI_API_KEY.
// NUNCA COLOQUE A CHAVE DIRETAMENTE AQUI.
const openai = new OpenAI();

// Esta é a função que o Vercel vai executar na rota /api/generate
module.exports = async (req, res) => {
    // Define cabeçalhos para permitir CORS, se necessário
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    try {
        // Pega o prompt enviado pelo seu front-end
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt de imagem não fornecido.' });
        }
        
        console.log(`Gerando imagem para o prompt: "${prompt}"`);

        // 1. CHAMA a API DALL-E de forma segura
        const response = await openai.images.generate({
            model: "dall-e-3", // Modelo de alta qualidade (ou "dall-e-2" se preferir)
            prompt: prompt,
            n: 1, // DALL-E 3 só permite 1 imagem por chamada
            size: "1024x1024", // Outras opções: "1792x1024" ou "1024x1792"
            response_format: "url"
        });

        // Pega a URL da imagem gerada
        const imageUrl = response.data[0].url;

        // 2. ENVIA a URL da imagem de volta para o seu front-end
        res.status(200).json({ imageUrl: imageUrl });

    } catch (error) {
        console.error('Erro na chamada da API DALL-E:', error.message);
        
        // Trata erros comuns da OpenAI
        const errorMessage = error.message.includes('content_policy_violation') 
            ? 'O prompt foi bloqueado por violar a política de conteúdo da OpenAI (imagem imprópria).'
            : 'Falha interna ao gerar a imagem. Tente um prompt diferente.';
        
        res.status(500).json({ error: errorMessage, details: error.message });
    }
};
