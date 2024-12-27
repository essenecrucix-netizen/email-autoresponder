const EmailProcessor = require('../../utils/emailProcessor');
const AiAgent = require('../../utils/aiAgent');

jest.mock('../../utils/aiAgent');

describe('EmailProcessor', () => {
    let emailProcessor;
    let mockTrickleObjAPI;

    beforeEach(() => {
        mockTrickleObjAPI = {
            createObject: jest.fn(),
            listObjects: jest.fn(),
            deleteObject: jest.fn()
        };
        global.TrickleObjectAPI = jest.fn(() => mockTrickleObjAPI);
        global.reportError = jest.fn();
        emailProcessor = EmailProcessor();
    });

    describe('processNewEmail', () => {
        const testEmail = {
            subject: 'Test Subject',
            content: 'Test Content',
            sender: 'test@example.com'
        };

        it('should process a new email successfully', async () => {
            const mockSentiment = 'positive';
            const mockNeedsEscalation = false;
            const mockResponse = 'Test response';

            AiAgent.mockImplementation(() => ({
                analyzeEmailSentiment: jest.fn().mockResolvedValue(mockSentiment),
                shouldEscalate: jest.fn().mockResolvedValue(mockNeedsEscalation),
                generateResponse: jest.fn().mockResolvedValue(mockResponse)
            }));

            mockTrickleObjAPI.createObject.mockResolvedValue({ objectId: '123' });
            mockTrickleObjAPI.listObjects.mockResolvedValue({ items: [] });

            const result = await emailProcessor.processNewEmail(testEmail);

            expect(result).toBeTruthy();
            expect(mockTrickleObjAPI.createObject).toHaveBeenCalledTimes(2);
            expect(AiAgent().analyzeEmailSentiment).toHaveBeenCalled();
            expect(AiAgent().shouldEscalate).toHaveBeenCalled();
        });

        it('should handle escalated emails correctly', async () => {
            const mockSentiment = 'negative';
            const mockNeedsEscalation = true;

            AiAgent.mockImplementation(() => ({
                analyzeEmailSentiment: jest.fn().mockResolvedValue(mockSentiment),
                shouldEscalate: jest.fn().mockResolvedValue(mockNeedsEscalation),
                generateResponse: jest.fn()
            }));

            mockTrickleObjAPI.createObject.mockResolvedValue({ objectId: '123' });

            const result = await emailProcessor.processNewEmail(testEmail);

            expect(result).toBeTruthy();
            expect(mockTrickleObjAPI.createObject).toHaveBeenCalledTimes(1);
            expect(AiAgent().generateResponse).not.toHaveBeenCalled();
        });

        it('should handle processing errors gracefully', async () => {
            AiAgent.mockImplementation(() => ({
                analyzeEmailSentiment: jest.fn().mockRejectedValue(new Error('Test error')),
                shouldEscalate: jest.fn().mockRejectedValue(new Error('Test error')),
                generateResponse: jest.fn()
            }));

            await expect(emailProcessor.processNewEmail(testEmail))
                .rejects
                .toThrow('Failed to process email');
            expect(global.reportError).toHaveBeenCalled();
        });
    });

    describe('getRelevantKnowledgeBase', () => {
        it('should retrieve knowledge base items', async () => {
            const mockKnowledgeBase = {
                items: [
                    { objectId: '1', objectData: { content: 'Test knowledge' } }
                ]
            };
            mockTrickleObjAPI.listObjects.mockResolvedValue(mockKnowledgeBase);

            const result = await emailProcessor.getRelevantKnowledgeBase('test query');

            expect(result).toEqual(mockKnowledgeBase.items);
            expect(mockTrickleObjAPI.listObjects).toHaveBeenCalled();
        });

        it('should handle knowledge base retrieval errors', async () => {
            mockTrickleObjAPI.listObjects.mockRejectedValue(new Error('Database error'));

            const result = await emailProcessor.getRelevantKnowledgeBase('test query');

            expect(result).toEqual([]);
            expect(global.reportError).toHaveBeenCalled();
        });
    });
});
