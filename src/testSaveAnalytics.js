const dbService = require('./DatabaseService')();

(async () => {
    try {
        const result = await dbService.saveAnalyticsData('user123', {
            totalEmails: 15,
            averageResponseTime: 7,
        });
        console.log('Saved analytics:', result);
    } catch (error) {
        console.error('Error saving analytics:', error);
    }
})();
