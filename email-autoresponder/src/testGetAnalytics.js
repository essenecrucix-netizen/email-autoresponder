const dbService = require('./services/database/DatabaseService')();

(async () => {
    try {
        const result = await dbService.getAnalyticsByUser('user123');
        console.log('Analytics for user123:', result);
    } catch (error) {
        console.error('Error retrieving analytics:', error);
    }
})();
