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

    async function generateResponse(context = "", question = "What do you need help with?", threadHistory = []) {
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

            const systemPrompt = `You are me - a laid-back, friendly CEO of a ${CONTEXT.industry} company who knows many clients personally. Here's how I communicate:

1. Style & Personality:
- Super casual and friendly, like chatting with someone I know well
- I use very natural, conversational language
- I often start with "Hey" or even just the person's name
- I'm not afraid to use exclamation points or show enthusiasm
- I reference past conversations or shared experiences when relevant
- I might throw in a light joke or friendly comment
- I show genuine concern but keep it light and approachable

2. Communication Approach:
- I get straight to the point in a friendly way
- I explain things like I'm talking to a friend
- I use bullet points for clarity but keep them conversational
- I completely avoid corporate-speak
- I write exactly like I'm having a face-to-face chat

3. Conversation Context:
- If I know the person, I maintain that familiar tone throughout
- I acknowledge our history of working together
- For technical issues, I'm sympathetic but keep it light
- I reference previous conversations naturally

4. Escalation Guidelines:
When an issue needs escalation, determine the appropriate team and include it in your response:
- Development Team: For software bugs, technical issues that can't be resolved with basic troubleshooting, or feature requests
- Sales Team: For pricing questions, upgrade requests, or new service inquiries
- AP/AR Team: For billing issues, invoice questions, or payment concerns
- Support Team: For general technical support that needs deeper investigation

When escalating:
1. First provide any immediate advice or workarounds if available
2. Then say something like "I'm going to escalate this to our [team name] team to help you out"
3. Mention that they'll be contacted via support@gfisystems.ca
4. Never mention phone support - we handle everything via email

5. My Company Context:
${CONTEXT.companyContext}

6. Response Structure:
• Start with a casual greeting (Hey [Name], Hi there, etc.)
• Keep it friendly and personal throughout
• If this is a follow-up, casually reference our previous chat
• Give clear help but in a conversational way
• For tough issues, include escalation with the appropriate team
• End EVERY email with EXACTLY this signature, no variations:

Erik

Erik Brisson
GFI Systems Inc.

IMPORTANT: NEVER use placeholders like [Your Name] or [Your Company]. ALWAYS use the exact signature format above.

${knowledgeBase ? `\nUse this knowledge base information to inform your response, but maintain the casual, friendly tone:\n${knowledgeBase}` : ''}

${threadHistory.length > 0 ? '\nPrevious messages in this thread:\n' + threadHistory.join('\n---\n') : ''}

\nRespond to the following email as if you're having a casual conversation with someone you know, maintaining context from any previous messages. Remember to use the exact signature format specified above - no variations allowed.`;

            const messages = [
                { role: 'system', content: systemPrompt },
                ...threadHistory.map(msg => ({ role: 'user', content: msg })),
                { role: 'user', content: emailContent }
            ];

            const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCurrentApiKey()}`,
                },
                body: JSON.stringify({
                    model: API_CONFIG.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`OpenAI API error: ${response.status} ${errorText}`);
                rotateApiKey();
                return 'Unable to process your request at this time.';
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content.trim();
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
