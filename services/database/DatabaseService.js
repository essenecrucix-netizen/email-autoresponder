function DatabaseService() {
    const DB_CONFIG = {
        host: process.env.DB_HOST || 'localhost',
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };

    async function initializeDynamoDB() {
        try {
            const AWS = require('aws-sdk');
            AWS.config.update({
                region: DB_CONFIG.region,
                accessKeyId: DB_CONFIG.accessKeyId,
                secretAccessKey: DB_CONFIG.secretAccessKey
            });
            return new AWS.DynamoDB.DocumentClient();
        } catch (error) {
            reportError(error);
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
                    updatedAt: new Date().toISOString()
                }
            };
            await dynamodb.put(params).promise();
            return params.Item;
        } catch (error) {
            reportError(error);
            throw new Error(`Failed to create item in ${tableName}`);
        }
    }

    async function getItem(tableName, key) {
        try {
            const dynamodb = await initializeDynamoDB();
            const params = {
                TableName: tableName,
                Key: key
            };
            const result = await dynamodb.get(params).promise();
            return result.Item;
        } catch (error) {
            reportError(error);
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
                Key: key,
                UpdateExpression: `SET ${updateExpression.join(', ')}, #updatedAt = :updatedAt`,
                ExpressionAttributeNames: {
                    ...expressionAttributeNames,
                    '#updatedAt': 'updatedAt'
                },
                ExpressionAttributeValues: {
                    ...expressionAttributeValues,
                    ':updatedAt': new Date().toISOString()
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            reportError(error);
            throw new Error(`Failed to update item in ${tableName}`);
        }
    }

    async function deleteItem(tableName, key) {
        try {
            const dynamodb = await initializeDynamoDB();
            const params = {
                TableName: tableName,
                Key: key
            };
            await dynamodb.delete(params).promise();
        } catch (error) {
            reportError(error);
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
                ExpressionAttributeNames: keyCondition.names
            };

            if (filterExpression) {
                params.FilterExpression = filterExpression.expression;
                params.ExpressionAttributeValues = {
                    ...params.ExpressionAttributeValues,
                    ...filterExpression.values
                };
                params.ExpressionAttributeNames = {
                    ...params.ExpressionAttributeNames,
                    ...filterExpression.names
                };
            }

            const result = await dynamodb.query(params).promise();
            return result.Items;
        } catch (error) {
            reportError(error);
            throw new Error(`Failed to query items from ${tableName}`);
        }
    }

    return {
        createItem,
        getItem,
        updateItem,
        deleteItem,
        queryItems
    };
}
