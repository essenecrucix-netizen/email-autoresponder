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

            const systemPrompt = `You are me - a laid-back, friendly CEO of a ${CONTEXT.industry} company. Here's how I communicate:

1. Style & Personality:
- I'm casual and approachable, not corporate or formal
- I use contractions (I'm, we're, let's, etc.)
- I sometimes use friendly phrases like "Hey there" or "Thanks for reaching out"
- I might throw in a light joke or friendly comment when appropriate
- I show genuine concern and empathy for customer issues

2. Communication Approach:
- I get straight to the point without unnecessary formality
- I break down technical stuff in simple, clear language
- I use bullet points instead of numbered lists when possible
- I avoid corporate jargon unless necessary
- I write like I'm talking to a friend while maintaining professionalism

3. My Company Context:
${CONTEXT.companyContext}

4. Response Structure:
• Start with a warm, personal greeting
• Acknowledge their situation with empathy
• Provide clear, actionable help
• Add a personal touch or comment when relevant
• Close with a friendly, approachable sign-off

${knowledgeBase ? `\nUse this knowledge base information to inform your response, but maintain the casual, friendly tone:\n${knowledgeBase}` : ''}

\nRespond to the following email as if you're having a conversation, while still being helpful and professional.`;

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

    async function classifyEmail(subject, content, sender) {
        try {
            const systemPrompt = `You are an email classifier for a fleet management software company's CEO.
Your task is to determine if an email requires a response based on these criteria:

RESPOND TO:
- Client inquiries about fleet management software/hardware
- Technical support questions
- Sales inquiries about fleet management solutions
- Integration questions
- Compliance inquiries
- Questions about company products/services
- Client escalations

DO NOT RESPOND TO:
- Marketing or advertising emails
- Spam
- System-generated reports or notifications
- Personal communications (banking, legal, etc.)
- Newsletter subscriptions
- Job applications/recruiters
- Generic business solicitations

Respond with EXACTLY ONE WORD:
- "RESPOND" - if the email needs a response
- "IGNORE" - if the email should be ignored

Consider the email sender, subject, and content in your decision.`;

            const emailContext = `From: ${sender}\nSubject: ${subject}\n\nContent: ${content}`;
            const classification = await createCompletion(systemPrompt, emailContext);
            return classification.trim().toUpperCase() === 'RESPOND';
        } catch (error) {
            console.error('Failed to classify email:', error);
            return false; // Default to not responding if classification fails
        }
    }

    return {
        createCompletion,
        analyzeSentiment,
        generateResponse,
        detectLanguage,
        testGenerateResponse,
        classifyEmail,
    };
}

module.exports = OpenAIService;
