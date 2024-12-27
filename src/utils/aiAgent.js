function AiAgent() {
    async function generateResponse(emailContent, knowledgeBase) {
        try {
            const systemPrompt = `You are an AI customer support agent. Use the following knowledge base to provide accurate responses:
            ${JSON.stringify(knowledgeBase)}`;
            const userPrompt = emailContent;
            
            const response = await invokeAIAgent(systemPrompt, userPrompt);
            return response;
        } catch (error) {
            reportError(error);
            return "I apologize, but I'm unable to process your request at the moment. Please try again later.";
        }
    }

    async function analyzeEmailSentiment(emailContent) {
        try {
            const systemPrompt = "Analyze the sentiment of this email and categorize it as positive, negative, or neutral.";
            const response = await invokeAIAgent(systemPrompt, emailContent);
            return response;
        } catch (error) {
            reportError(error);
            return "neutral";
        }
    }

    async function shouldEscalate(emailContent) {
        try {
            const systemPrompt = "Determine if this email needs human escalation based on complexity or urgency.";
            const response = await invokeAIAgent(systemPrompt, emailContent);
            return response.toLowerCase().includes("yes");
        } catch (error) {
            reportError(error);
            return true;
        }
    }

    return {
        generateResponse,
        analyzeEmailSentiment,
        shouldEscalate
    };
}