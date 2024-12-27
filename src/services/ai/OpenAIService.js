function OpenAIService() {
    // Fetch API keys from the environment variable
    let apiKeys = process.env.OPENAI_API_KEYS
        ? process.env.OPENAI_API_KEYS.split(',')
        : [process.env.OPENAI_API_KEY]; // Fallback to a single API key
    let currentKeyIndex = 0;

    const API_CONFIG = {
        model: 'gpt-4',
        baseUrl: 'https://api.openai.com/v1'
    };

    // Industry and Role Context Configuration
    const CONTEXT = {
        industry: process.env.INDUSTRY_CONTEXT || "systems integration",
        role: process.env.ROLE_CONTEXT || "CEO"
    };

    // Get the current API key
    function getCurrentApiKey() {
        return apiKeys[currentKeyIndex];
    }

    // Rotate to the next API key
    function rotateApiKey() {
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }

    // Handle OpenAI API requests with retry logic for rate limits
    async function createCompletion(systemPrompt, userPrompt) {
        let attempts = 0;
        const maxAttempts = apiKeys.length;

        while (attempts < maxAttempts) {
            const apiKey = getCurrentApiKey();
            try {
                const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: API_CONFIG.model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    })
                });

                if (response.status === 429) { // Handle rate limit errors
                    console.warn(`Rate limit reached for API key ${apiKey}. Rotating API key.`);
                    rotateApiKey();
                    attempts++;
                    continue;
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.error(`Error with API key ${apiKey}: ${error.message}`);
                if (attempts < maxAttempts - 1) {
                    rotateApiKey();
                    attempts++;
                } else {
                    throw new Error('All API keys exhausted. Unable to complete the request.');
                }
            }
        }
    }

    async function analyzeSentiment(text) {
        try {
            const systemPrompt = "You are a sentiment analysis expert. Analyze the following text and respond with exactly one word: 'positive', 'negative', or 'neutral'.";
            const response = await createCompletion(systemPrompt, text);
            return response.toLowerCase().trim();
        } catch (error) {
            console.error('Failed to analyze sentiment:', error);
            throw error;
        }
    }

    async function generateResponse(context, question) {
        try {
            // Include industry and role context in the system prompt
            const systemPrompt = `You are a helpful customer service assistant working in the ${CONTEXT.industry} industry. You are assisting the ${CONTEXT.role}. Use this context to answer the question: ${context}`;
            return await createCompletion(systemPrompt, question);
        } catch (error) {
            console.error('Failed to generate response:', error);
            throw error;
        }
    }

    async function detectLanguage(text) {
        try {
            const systemPrompt = "You are a language detection expert. Analyze the following text and respond with the ISO 639-1 language code (e.g., 'en', 'es', 'fr').";
            return await createCompletion(systemPrompt, text);
        } catch (error) {
            console.error('Failed to detect language:', error);
            throw error;
        }
    }

    return {
        createCompletion,
        analyzeSentiment,
        generateResponse,
        detectLanguage
    };
}
