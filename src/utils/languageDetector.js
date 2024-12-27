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
        'ru': 'Russian'
    };

    async function detectLanguage(text) {
        try {
            const systemPrompt = `You are a language detection expert. Analyze the following text and respond with only the ISO 639-1 language code (e.g., 'en', 'es', 'fr', etc.).`;
            const response = await invokeAIAgent(systemPrompt, text);
            const detectedCode = response.trim().toLowerCase();
            
            return supportedLanguages[detectedCode] ? detectedCode : 'en';
        } catch (error) {
            reportError(error);
            return 'en'; // Default to English on error
        }
    }

    async function translateResponse(text, targetLanguage) {
        try {
            const systemPrompt = `You are a professional translator. Translate the following text into ${supportedLanguages[targetLanguage]}. Maintain the same tone and formality level.`;
            return await invokeAIAgent(systemPrompt, text);
        } catch (error) {
            reportError(error);
            return text; // Return original text if translation fails
        }
    }

    async function generateLocalizedResponse(prompt, language) {
        try {
            const systemPrompt = `You are a helpful customer service assistant. Respond in ${supportedLanguages[language]} to the following inquiry.`;
            return await invokeAIAgent(systemPrompt, prompt);
        } catch (error) {
            reportError(error);
            throw new Error(`Failed to generate localized response: ${error.message}`);
        }
    }

    return {
        detectLanguage,
        translateResponse,
        generateLocalizedResponse,
        supportedLanguages
    };
}