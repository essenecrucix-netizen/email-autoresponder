const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

function DatabaseService() {
    // Initialize DynamoDB Client
    const dynamodbClient = new DynamoDBClient({
        region: process.env.AWS_REGION || 'us-west-2',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    // Create Document Client for easier interactions
    const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

    async function createItem(tableName, item) {
        try {
            const params = {
                TableName: tableName,
                Item: {
                    ...item,
                    createdAt: new Date().toISOString(),
                },
            };
            console.log('DynamoDB CreateItem Params:', params); // Debugging
            await dynamodb.send(new PutCommand(params));
            return params.Item;
        } catch (error) {
            console.error(`Failed to create item in ${tableName}:`, error.message, error.stack);
            throw new Error(`Failed to create item in ${tableName}`);
        }
    }

    async function getItem(tableName, key) {
        try {
            const params = {
                TableName: tableName,
                Key: key,
            };
            console.log('DynamoDB GetItem Params:', params); // Debugging
            const result = await dynamodb.send(new GetCommand(params));
            return result.Item;
        } catch (error) {
            console.error(`Failed to get item from ${tableName}:`, error.message, error.stack);
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

            console.log('DynamoDB UpdateItem Params:', params); // Debugging
            const result = await dynamodb.send(new UpdateCommand(params));
            return result.Attributes;
        } catch (error) {
            console.error(`Failed to update item in ${tableName}:`, error.message, error.stack);
            throw new Error(`Failed to update item in ${tableName}`);
        }
    }

    async function saveAnalyticsData(userId, metrics) {
        try {
            const analyticsId = `${userId}-${Date.now()}`; // Unique ID per user and timestamp
            const params = {
                TableName: 'email_analytics',
                Item: {
                    analytics_id: analyticsId,
                    user_id: userId,
                    metrics,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            };
            console.log('DynamoDB SaveAnalyticsData Params:', params); // Debugging
            await dynamodb.send(new PutCommand(params));
            return params.Item;
        } catch (error) {
            console.error('Failed to save analytics data:', error.message, error.stack);
            throw new Error('Failed to save analytics data.');
        }
    }

    async function getAnalyticsByUser(userId) {
        try {
            const params = {
                TableName: 'email_analytics',
                IndexName: 'user_id-index',
                KeyConditionExpression: 'user_id = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
            };
            console.log('DynamoDB GetAnalyticsByUser Params:', params); // Debugging
            const result = await dynamodb.send(new QueryCommand(params));
            return result.Items || [];
        } catch (error) {
            console.error('Failed to fetch analytics data:', error.message, error.stack);
            throw new Error('Failed to fetch analytics data.');
        }
    }

    async function getItemByEmail(email) {
        try {
            const params = {
                TableName: 'users',
                IndexName: 'email-index', // Use the index for querying by email
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': email,
                },
            };
            console.log('DynamoDB Query Params for getItemByEmail:', params); // Debugging
            const result = await dynamodb.send(new QueryCommand(params));
            if (result.Items && result.Items.length > 0) {
                console.log('DynamoDB Query Result for getItemByEmail:', result.Items[0]); // Debugging
                return result.Items[0]; // Return the first match
            } else {
                console.warn('DynamoDB Query for getItemByEmail: No matching items found.');
                return null;
            }
        } catch (error) {
            console.error('Failed to fetch user by email:', error.message, error.stack);
            throw new Error('Failed to fetch user by email.');
        }
    }

    async function addAnalyticsEntry(entry) {
        try {
            const params = {
                TableName: 'email_analytics',
                Item: {
                    analytics_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    user_id: entry.userId || process.env.USER_ID || '123',
                    type: 'automated',
                    timestamp: entry.timestamp,
                    subject: entry.emailSubject,
                    response: entry.response,
                    hasKnowledgeBase: entry.hasKnowledgeBase,
                    satisfaction: 'pending',
                    responseTime: 0,
                    needsEscalation: false,
                    createdAt: new Date().toISOString()
                }
            };
            console.log('Adding analytics entry:', params);
            await dynamodb.send(new PutCommand(params));
            return params.Item;
        } catch (error) {
            console.error('Failed to add analytics entry:', error);
            return null;
        }
    }

    return {
        dynamodb, // Expose raw DynamoDB client if needed
        createItem,
        getItem,
        updateItem,
        saveAnalyticsData,
        getAnalyticsByUser,
        getItemByEmail,
        addAnalyticsEntry
    };
}

module.exports = DatabaseService;