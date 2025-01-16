function LanguageDetector() {
    const supportedLanguages = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ru': 'Russian',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'nl': 'Dutch',
        'pl': 'Polish',
        'tr': 'Turkish'
    };

    // Cache for language detection results
    const languageCache = new Map();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    async function detectLanguage(text) {
        try {
            // Check cache first
            const cacheKey = text.slice(0, 100); // Use first 100 chars as cache key
            const cachedResult = languageCache.get(cacheKey);
            if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
                return cachedResult.language;
            }

            const systemPrompt = `You are a language detection expert. Analyze the following text and respond with only the ISO 639-1 language code (e.g., 'en', 'es', 'fr', etc.). If unsure, respond with 'en'.`;
            const response = await invokeAIAgent(systemPrompt, text);
            const detectedCode = response.trim().toLowerCase();
            
            // Cache the result
            languageCache.set(cacheKey, {
                language: supportedLanguages[detectedCode] ? detectedCode : 'en',
                timestamp: Date.now()
            });
            
            return supportedLanguages[detectedCode] ? detectedCode : 'en';
        } catch (error) {
            reportError(error);
            return 'en'; // Default to English on error
        }
    }

    async function translateResponse(text, targetLanguage) {
        try {
            if (!supportedLanguages[targetLanguage]) {
                throw new Error(`Unsupported target language: ${targetLanguage}`);
            }

            const systemPrompt = `You are a professional translator. Translate the following text into ${supportedLanguages[targetLanguage]}. Maintain the same tone, formality level, and technical accuracy. If the text contains industry-specific terms, preserve their meaning.`;
            const response = await invokeAIAgent(systemPrompt, text);
            
            if (!response || response.trim().length === 0) {
                throw new Error('Empty translation received');
            }
            
            return response;
        } catch (error) {
            reportError(error);
            return text; // Return original text if translation fails
        }
    }

    async function generateLocalizedResponse(prompt, language) {
        try {
            if (!supportedLanguages[language]) {
                throw new Error(`Unsupported language: ${language}`);
            }

            const systemPrompt = `You are a helpful customer service assistant for a systems integration company. Respond in ${supportedLanguages[language]} to the following inquiry. Maintain professional tone and technical accuracy.`;
            const response = await invokeAIAgent(systemPrompt, prompt);
            
            if (!response || response.trim().length === 0) {
                throw new Error('Empty response received');
            }
            
            return response;
        } catch (error) {
            reportError(error);
            // Generate response in English as fallback
            return generateLocalizedResponse(prompt, 'en');
        }
    }

    function getSupportedLanguages() {
        return { ...supportedLanguages }; // Return a copy to prevent modification
    }

    return {
        detectLanguage,
        translateResponse,
        generateLocalizedResponse,
        getSupportedLanguages,
        supportedLanguages
    };
}