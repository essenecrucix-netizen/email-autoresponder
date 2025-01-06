
function DatabaseService() {
    const AWS = require('aws-sdk');

    // Explicitly configure AWS SDK with credentials and region
    AWS.config.update({
        region: process.env.AWS_REGION || 'us-west-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    async function createItem(tableName, item) {
        try {
            const params = {
                TableName: tableName,
                Item: {
                    ...item,
                    createdAt: new Date().toISOString(),
                },
            };
            await dynamodb.put(params).promise();
            return params.Item;
        } catch (error) {
            console.error(`Failed to create item in ${tableName}:`, error);
            throw new Error(`Failed to create item in ${tableName}`);
        }
    }

    async function getItem(tableName, key) {
        try {
            const params = {
                TableName: tableName,
                Key: key,
            };
            const result = await dynamodb.get(params).promise();
            return result.Item;
        } catch (error) {
            console.error(`Failed to get item from ${tableName}:`, error);
            throw new Error(`Failed to get item from ${tableName}`);
        }
    }

    async function updateItem(tableName, key, updateData) {
        try {
            const updateExpression = [];
            const expressionAttributeNames = {};
            const expressionAttributeValues = {};

            Object.entries(updateData).forEach(([field, value]) => {
                updateExpression.push(`#${field} = :${field}`);
                expressionAttributeNames[`#${field}`] = field;
                expressionAttributeValues[`:${field}`] = value;
            });

            const params = {
                TableName: tableName,
                Key: key,
                UpdateExpression: `SET ${updateExpression.join(', ')}, updatedAt = :updatedAt`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: {
                    ...expressionAttributeValues,
                    ':updatedAt': new Date().toISOString(),
                },
                ReturnValues: 'ALL_NEW',
            };

            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error(`Failed to update item in ${tableName}:`, error);
            throw new Error(`Failed to update item in ${tableName}`);
        }
    }

    async function saveAnalyticsData(userId, metrics) {
        try {
            const analyticsId = `${userId}-${Date.now()}`; // Unique ID per user and timestamp
            const params = {
                TableName: 'analytics',
                Item: {
                    analytics_id: analyticsId,
                    user_id: userId,
                    metrics,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            };
            await dynamodb.put(params).promise();
            return params.Item;
        } catch (error) {
            console.error('Failed to save analytics data:', error);
            throw new Error('Failed to save analytics data.');
        }
    }

    async function getAnalyticsByUser(userId) {
        try {
            const params = {
                TableName: 'analytics',
                IndexName: 'user_id-index', // Specify the index name
                KeyConditionExpression: 'user_id = :userId', // Use the correct key schema element
                ExpressionAttributeValues: {
                    ':userId': userId, // Provide the value for the hash key
                },
            };
            const result = await dynamodb.query(params).promise();
            return result.Items;
        } catch (error) {
            console.error('Failed to fetch analytics data:', error.message, error.stack);
            throw new Error('Failed to fetch analytics data.');
        }
    }

    return {
        createItem,
        getItem,
        updateItem,
        saveAnalyticsData,
        getAnalyticsByUser,
    };
}

module.exports = DatabaseService;

