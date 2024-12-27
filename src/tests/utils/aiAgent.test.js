const AiAgent = require('../../utils/aiAgent');

describe('AiAgent', () => {
    let aiAgent;

    beforeEach(() => {
        aiAgent = AiAgent();
        global.invokeAIAgent = jest.fn();
        global.reportError = jest.fn();
    });

    describe('generateResponse', () => {
        it('should generate a response using the knowledge base', async () => {
            const emailContent = 'How do I reset my password?';
            const knowledgeBase = [
                { content: 'Password reset instructions...' }
            ];
            global.invokeAIAgent.mockResolvedValue('Here are the steps to reset your password...');

            const response = await aiAgent.generateResponse(emailContent, knowledgeBase);
            
            expect(response).toBeTruthy();
            expect(global.invokeAIAgent).toHaveBeenCalled();
            expect(typeof response).toBe('string');
        });

        it('should handle errors gracefully', async () => {
            const emailContent = 'Test question';
            global.invokeAIAgent.mockRejectedValue(new Error('API Error'));

            const response = await aiAgent.generateResponse(emailContent, []);
            
            expect(response).toBe("I apologize, but I'm unable to process your request at the moment. Please try again later.");
            expect(global.reportError).toHaveBeenCalled();
        });
    });

    describe('analyzeEmailSentiment', () => {
        it('should analyze email sentiment correctly', async () => {
            const emailContent = 'I love your product!';
            global.invokeAIAgent.mockResolvedValue('positive');

            const sentiment = await aiAgent.analyzeEmailSentiment(emailContent);
            
            expect(sentiment).toBe('positive');
            expect(global.invokeAIAgent).toHaveBeenCalled();
        });

        it('should return neutral for failed sentiment analysis', async () => {
            const emailContent = 'Test content';
            global.invokeAIAgent.mockRejectedValue(new Error('API Error'));

            const sentiment = await aiAgent.analyzeEmailSentiment(emailContent);
            
            expect(sentiment).toBe('neutral');
            expect(global.reportError).toHaveBeenCalled();
        });
    });

    describe('shouldEscalate', () => {
        it('should determine if email needs escalation', async () => {
            const emailContent = 'I demand a refund immediately!';
            global.invokeAIAgent.mockResolvedValue('yes');

            const needsEscalation = await aiAgent.shouldEscalate(emailContent);
            
            expect(needsEscalation).toBe(true);
            expect(global.invokeAIAgent).toHaveBeenCalled();
        });

        it('should handle errors by recommending escalation', async () => {
            const emailContent = 'Test content';
            global.invokeAIAgent.mockRejectedValue(new Error('API Error'));

            const needsEscalation = await aiAgent.shouldEscalate(emailContent);
            
            expect(needsEscalation).toBe(true);
            expect(global.reportError).toHaveBeenCalled();
        });
    });
});
