const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    region: process.env.AWS_REGION || 'us-west-2', // Update with your region
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,   // Ensure credentials are set
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Initialize DynamoDB Document Client
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Debugging: Log the DynamoDB object
console.log('DynamoDB Object:', dynamodb);

(async () => {
    try {
        // Define query parameters
        const params = {
            TableName: 'users',              // Table name
            IndexName: 'email-index',        // Ensure this index exists in your table
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'your-email@example.com', // Replace with actual email
            },
        };

        console.log('Query Parameters:', params); // Debugging: Log query parameters

        // Execute the query
        const result = await dynamodb.query(params).promise();
        console.log('User:', result.Items[0]); // Print the first matching user
    } catch (error) {
        console.error('Error fetching user:', error.message, error.stack); // Improved logging
    }
})();



