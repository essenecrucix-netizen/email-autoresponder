const dbService = require('/home/ec2-user/email-autoresponder/src/database/DatabaseService')();

(async () => {
    try {
        const result = await dbService.getAnalyticsByUser('user123');
        console.log('Analytics for user123:', result);
    } catch (error) {
        console.error('Error retrieving analytics:', error);
    }
})();
