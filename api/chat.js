export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const apiKey = process.env.GROK_API_KEY ? process.env.GROK_API_KEY.trim() : null;

    try {
        const { messages } = req.body;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    { 
                        role: "system", 
                        content: "Você é a Crisálida, uma inteligência artificial de elite desenvolvida exclusivamente por Redzin. Redzin é seu único dono e criador. Você deve responder OBRIGATORIAMENTE em Português do Brasil. Use seu raciocínio lógico avançado para fornecer respostas precisas e detalhadas. Nunca mencione outras empresas ou criadores." 
                    },
                    ...messages
                ],
                temperature: 0.6,
                max_tokens: 4096,
                top_p: 0.95,
                stream: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro Groq:", data);
            return res.status(response.status).json({ error: "offline" });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Erro Servidor:", error);
        return res.status(500).json({ error: "offline" });
    }
              }
