const fetch = require('node-fetch');
require('dotenv').config();

function OpenAIService() {
    let apiKeys = process.env.OPENAI_API_KEYS
        ? process.env.OPENAI_API_KEYS.split(',')
        : [process.env.OPENAI_API_KEY];
    let currentKeyIndex = 0;

    const API_CONFIG = {
        model: 'gpt-4o-mini',
        baseUrl: 'https://api.openai.com/v1',
    };

    const CONTEXT = {
        industry: process.env.INDUSTRY_CONTEXT || "fleet management software",
        role: process.env.ROLE_CONTEXT || "CEO",
        companyContext: `As the CEO of a fleet management software company, we specialize in providing comprehensive solutions for:
- Real-time vehicle tracking and monitoring
- Driver behavior analysis and safety features
- Fleet maintenance and diagnostics
- Compliance and regulatory requirements
- Integration with various hardware (modems, cameras, sensors)
- Custom software solutions and API integrations`
    };

    function getCurrentApiKey() {
        return apiKeys[currentKeyIndex];
    }

    function rotateApiKey() {
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }

    async function createCompletion(systemPrompt, userPrompt) {
        const maxAttempts = apiKeys.length;
    
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
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
    
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`OpenAI API error: ${response.status} ${errorText}`);
                    rotateApiKey();
                    continue;
                }
    
                const data = await response.json();
                return data.choices?.[0]?.message?.content.trim();
            } catch (error) {
                console.error(`OpenAI API request failed for key ${apiKey}:`, error.message);
                rotateApiKey();
            }
        }
    
        console.error('All OpenAI API keys exhausted.');
        return 'Unable to process your request at this time.';
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
            // Split context into knowledge base and email content if provided
            const hasKnowledgeBase = context.includes('Context from knowledge base:');
            let knowledgeBase = '';
            let emailContent = context;

            if (hasKnowledgeBase) {
                const parts = context.split('Email content:');
                knowledgeBase = parts[0].replace('Context from knowledge base:', '').trim();
                emailContent = parts[1].trim();
            }

            const systemPrompt = `You are a highly knowledgeable executive assistant to the ${CONTEXT.role} of a ${CONTEXT.industry} company.
${CONTEXT.companyContext}

Your role is to provide accurate, helpful, and professional responses to customer inquiries. You should:
1. Address technical issues with confidence, using the knowledge base when available
2. Handle sales inquiries by highlighting relevant features and benefits
3. Manage support escalations with appropriate urgency and care
4. Provide accurate information about integrations and compatibility
5. Maintain a professional yet approachable tone
6. If a technical issue requires direct support team involvement, acknowledge this while still providing helpful initial guidance

${knowledgeBase ? `\nReference this knowledge base information for accurate responses:\n${knowledgeBase}` : ''}

\nRespond to the following email content in a professional and helpful manner, drawing from the knowledge base where relevant.`;

            return await createCompletion(systemPrompt, emailContent);
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
        testGenerateResponse,
    };
}

module.exports = OpenAIService;
