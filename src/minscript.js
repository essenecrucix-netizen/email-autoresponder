const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

(async () => {
    try {
        const params = {
            TableName: 'users',
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'test@example.com',
            },
        };

        console.log('Query Parameters:', params);

        const result = await dynamodb.query(params).promise();
        console.log('Query Result:', result.Items);
    } catch (error) {
        console.error('Error querying DynamoDB:', error.message, error.stack);
    }
})();
