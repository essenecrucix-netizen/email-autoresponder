const OpenAIService = require('./services/ai/OpenAIService');

(async () => {
    const openai = OpenAIService();

    // Test generateResponse
    try {
        const response = await openai.generateResponse(
            "A customer asked about pricing for our premium product.",
            "What is the cost of the premium package?"
        );
        console.log("Response from OpenAI:", response);
    } catch (error) {
        console.error("Error in generateResponse:", error);
    }

    // Test createCompletion directly
    try {
        const completion = await openai.createCompletion(
            "You are a helpful assistant.",
            "How can I reset my password?"
        );
        console.log("Direct Completion Response:", completion);
    } catch (error) {
        console.error("Error in createCompletion:", error);
    }
})();
