function EmailProcessor() {
    const aiAgent = AiAgent();
    const trickleObjAPI = new TrickleObjectAPI();

    async function processNewEmail(email) {
        try {
            const sentiment = await aiAgent.analyzeEmailSentiment(email.content);
            const needsEscalation = await aiAgent.shouldEscalate(email.content);
            
            const emailData = {
                subject: email.subject,
                content: email.content,
                sender: email.sender,
                timestamp: new Date().toISOString(),
                sentiment,
                needsEscalation
            };

            const savedEmail = await trickleObjAPI.createObject('email', emailData);
            
            if (!needsEscalation) {
                const knowledgeBase = await getRelevantKnowledgeBase(email.content);
                const response = await aiAgent.generateResponse(email.content, knowledgeBase);
                await sendResponse(email.sender, response);
            }

            return savedEmail;
        } catch (error) {
            reportError(error);
            throw new Error(`Failed to process email: ${error.message}`);
        }
    }

    async function getRelevantKnowledgeBase(content) {
        try {
            const knowledgeBase = await trickleObjAPI.listObjects('knowledge', 100, true);
            return knowledgeBase.items;
        } catch (error) {
            reportError(error);
            return [];
        }
    }

    async function sendResponse(recipient, response) {
        try {
            const responseData = {
                recipient,
                content: response,
                timestamp: new Date().toISOString()
            };
            await trickleObjAPI.createObject('email-response', responseData);
        } catch (error) {
            reportError(error);
            throw new Error(`Failed to send response: ${error.message}`);
        }
    }

    return {
        processNewEmail
    };
}
