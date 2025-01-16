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
                TableName: 'analytics',
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
                TableName: 'analytics',
                IndexName: 'user_id-index',
                KeyConditionExpression: 'user_id = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
            };
            console.log('DynamoDB GetAnalyticsByUser Params:', params); // Debugging
            const result = await dynamodb.send(new QueryCommand(params));
            
            // Filter out entries with invalid timestamps and ensure required fields exist
            const validItems = (result.Items || []).filter(item => {
                if (!item) return false;
                if (!item.timestamp) {
                    console.warn('Analytics entry missing timestamp:', item);
                    return false;
                }
                try {
                    const date = new Date(item.timestamp);
                    if (isNaN(date.getTime())) {
                        console.warn('Invalid timestamp in analytics entry:', item);
                        return false;
                    }
                    return true;
                } catch (err) {
                    console.warn('Error parsing timestamp:', err);
                    return false;
                }
            });
            
            console.log(`Filtered ${result.Items?.length || 0} to ${validItems.length} valid entries`);
            return validItems;
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
                TableName: 'analytics',
                Item: {
                    analytics_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    user_id: entry.userId || process.env.USER_ID || '123',
                    type: 'automated',
                    timestamp: entry.timestamp,
                    subject: entry.emailSubject,
                    response: entry.response,
                    hasKnowledgeBase: entry.hasKnowledgeBase,
                    satisfaction: entry.satisfaction || 'pending',
                    responseTime: entry.responseTime || 0,
                    needsEscalation: false,
                    threadMessageId: entry.threadMessageId || null,
                    isFollowUp: entry.isFollowUp || false,
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

    async function saveEmail(email) {
        try {
            const params = {
                TableName: 'emails',
                Item: {
                    id: email.messageId,
                    subject: email.subject,
                    from: email.from,
                    to: email.to,
                    content: email.text,
                    timestamp: email.date.toISOString(),
                    createdAt: new Date().toISOString()
                }
            };
            await dynamodb.send(new PutCommand(params));
            return params.Item;
        } catch (error) {
            console.error('Failed to save email:', error);
            return null;
        }
    }

    async function saveEmailResponse(emailId, response, isAiResponse = true) {
        try {
            const responseId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const params = {
                TableName: 'email_responses',
                Item: {
                    email_id: emailId,
                    response_id: responseId,
                    content: response,
                    isAiResponse: isAiResponse,
                    timestamp: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                }
            };
            await dynamodb.send(new PutCommand(params));
            return params.Item;
        } catch (error) {
            console.error('Failed to save email response:', error);
            return null;
        }
    }

    async function getThreadHistory(messageId) {
        try {
            // First, get the original email
            const emailParams = {
                TableName: 'emails',
                Key: { id: messageId }
            };
            const emailResult = await dynamodb.send(new GetCommand(emailParams));
            
            // Then get all responses for this email
            const responsesParams = {
                TableName: 'email_responses',
                KeyConditionExpression: 'email_id = :emailId',
                ExpressionAttributeValues: {
                    ':emailId': messageId
                }
            };
            const responsesResult = await dynamodb.send(new QueryCommand(responsesParams));
            
            // Combine original email and responses, sorted by timestamp
            const allMessages = [];
            
            if (emailResult.Item) {
                allMessages.push({
                    content: `${emailResult.Item.subject}\n${emailResult.Item.content}`,
                    timestamp: emailResult.Item.timestamp,
                    isOriginalEmail: true
                });
            }
            
            if (responsesResult.Items) {
                allMessages.push(...responsesResult.Items.map(item => ({
                    content: item.content,
                    timestamp: item.timestamp,
                    isAiResponse: item.isAiResponse
                })));
            }
            
            // Sort by timestamp
            return allMessages.sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
        } catch (error) {
            console.error('Failed to fetch thread history:', error);
            return [];
        }
    }

    return {
        dynamodb,
        createItem,
        getItem,
        updateItem,
        saveAnalyticsData,
        getAnalyticsByUser,
        getItemByEmail,
        addAnalyticsEntry,
        getThreadHistory,
        saveEmail,
        saveEmailResponse
    };
}

module.exports = DatabaseService;