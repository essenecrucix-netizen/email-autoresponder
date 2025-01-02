const fetch = require('node-fetch');
require('dotenv').config();

function OpenAIService() {
    let apiKeys = process.env.OPENAI_API_KEYS
        ? process.env.OPENAI_API_KEYS.split(',')
        : [process.env.OPENAI_API_KEY];
    let currentKeyIndex = 0;

    const API_CONFIG = {
        model: 'gpt-4',
        baseUrl: 'https://api.openai.com/v1',
    };

    const CONTEXT = {
        industry: process.env.INDUSTRY_CONTEXT || "systems integration",
        role: process.env.ROLE_CONTEXT || "CEO",
    };

    function getCurrentApiKey() {
        return apiKeys[currentKeyIndex];
    }

    function rotateApiKey() {
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }

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
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: API_CONFIG.model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt },
                        ],
                        temperature: 0.7,
                        max_tokens: 500,
                    }),
                });

                if (response.status === 429) {
                    console.warn(`Rate limit reached for API key ${apiKey}. Rotating API key.`);
                    rotateApiKey();
                    attempts++;
                    continue;
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`OpenAI API error with key ${apiKey}: ${response.status} ${errorText}`);
                    throw new Error(`OpenAI API error: ${response.status}`);
                }

                const data = await response.json();
                return data.choices[0].message.content.trim();
            } catch (error) {
                console.error(`Error with API key ${apiKey}: ${error.message}`);
                if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
                    console.warn(`Network issue detected. Retrying with API key ${apiKey}.`);
                }

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
            return await createCompletion(systemPrompt, text);
        } catch (error) {
            console.error('Failed to analyze sentiment:', error);
            throw error;
        }
    }

    async function generateResponse(context = "", question = "What do you need help with?") {
        try {
            if (!context) context = `General context for the ${CONTEXT.industry} industry.`;
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

    async function testGenerateResponse() {
        try {
            const testContext = "A customer is asking for assistance with a product.";
            const testQuestion = "Can you help me reset my password?";
            console.log("Testing generateResponse...");
            const response = await generateResponse(testContext, testQuestion);
            console.log("Response from OpenAI:", response);
        } catch (error) {
            console.error("Error during generateResponse test:", error);
        }
    }

    return {
        createCompletion,
        analyzeSentiment,
        generateResponse,
        detectLanguage,
        testGenerateResponse, // Expose test function
    };
}

module.exports = OpenAIService;
