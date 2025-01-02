function DatabaseService() {
    const AWS = require('aws-sdk');

    // Explicitly configure AWS SDK with credentials and region
    AWS.config.update({
        region: process.env.AWS_REGION || 'us-west-2', // Default to 'us-west-2' if not set
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    async function initializeDynamoDB() {
        try {
            return new AWS.DynamoDB.DocumentClient();
        } catch (error) {
            console.error('Failed to initialize DynamoDB:', error);
            throw new Error('Failed to initialize DynamoDB');
        }
    }

    async function createItem(tableName, item) {
        try {
            const dynamodb = await initializeDynamoDB();
            const params = {
                TableName: tableName,
                Item: {
                    ...item,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
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
            const dynamodb = await initializeDynamoDB();
            const params = {
                TableName: tableName,
                Key: {
                    ...key,
                    emailUser: String(key.emailUser), // Ensure emailUser is a string
                },
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
            const dynamodb = await initializeDynamoDB();
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
                Key: {
                    ...key,
                    emailUser: String(key.emailUser), // Ensure emailUser is a string
                },
                UpdateExpression: `SET ${updateExpression.join(', ')}, #updatedAt = :updatedAt`,
                ExpressionAttributeNames: {
                    ...expressionAttributeNames,
                    '#updatedAt': 'updatedAt',
                },
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

    async function updateLastProcessedUID(emailUser, uid) {
        try {
            const dynamodb = await initializeDynamoDB();
            const params = {
                TableName: 'LastProcessedUID',
                Item: {
                    emailUser: String(emailUser), // Ensure emailUser is a string
                    uid,
                    updatedAt: new Date().toISOString(),
                },
            };
            await dynamodb.put(params).promise();
            console.log(`LastProcessedUID updated for ${emailUser} with UID ${uid}`);
        } catch (error) {
            console.error('Failed to update LastProcessedUID:', error);
            throw new Error('Failed to update LastProcessedUID');
        }
    }

    async function deleteItem(tableName, key) {
        try {
            const dynamodb = await initializeDynamoDB();
            const params = {
                TableName: tableName,
                Key: {
                    ...key,
                    emailUser: String(key.emailUser), // Ensure emailUser is a string
                },
            };
            await dynamodb.delete(params).promise();
        } catch (error) {
            console.error(`Failed to delete item from ${tableName}:`, error);
            throw new Error(`Failed to delete item from ${tableName}`);
        }
    }

    async function queryItems(tableName, indexName, keyCondition, filterExpression = null) {
        try {
            const dynamodb = await initializeDynamoDB();
            const params = {
                TableName: tableName,
                IndexName: indexName,
                KeyConditionExpression: keyCondition.expression,
                ExpressionAttributeValues: keyCondition.values,
                ExpressionAttributeNames: keyCondition.names,
            };

            if (filterExpression) {
                params.FilterExpression = filterExpression.expression;
                params.ExpressionAttributeValues = {
                    ...params.ExpressionAttributeValues,
                    ...filterExpression.values,
                };
                params.ExpressionAttributeNames = {
                    ...params.ExpressionAttributeNames,
                    ...filterExpression.names,
                };
            }

            const result = await dynamodb.query(params).promise();
            return result.Items;
        } catch (error) {
            console.error(`Failed to query items from ${tableName}:`, error);
            throw new Error(`Failed to query items from ${tableName}`);
        }
    }

    return {
        createItem,
        getItem,
        updateItem,
        deleteItem,
        queryItems,
        updateLastProcessedUID,
    };
}

module.exports = DatabaseService;
