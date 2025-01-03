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

    async function queryItems(tableName, keyCondition, filterExpression = null) {
        try {
            const params = {
                TableName: tableName,
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

    async function deleteItem(tableName, key) {
        try {
            const params = {
                TableName: tableName,
                Key: key,
            };
            await dynamodb.delete(params).promise();
        } catch (error) {
            console.error(`Failed to delete item from ${tableName}:`, error);
            throw new Error(`Failed to delete item from ${tableName}`);
        }
    }

    return {
        createItem,
        getItem,
        updateItem,
        queryItems,
        deleteItem,
    };
}

module.exports = DatabaseService;
