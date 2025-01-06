const dbService = require('./services/database/DatabaseService')();

(async () => {
    try {
        const params = {
            TableName: 'users',
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'your-email@example.com',
            },
        };
        const result = await dbService.dynamodb.query(params).promise();
        console.log('User:', result.Items[0]);
    } catch (error) {
        console.error('Error fetching user:', error.message);
    }
})();

