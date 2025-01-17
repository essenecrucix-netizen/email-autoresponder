const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

async function setupDynamoDB() {
    const client = new DynamoDBClient({
        region: process.env.AWS_REGION || 'us-west-2',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    // Check if table exists
    const listTables = await client.send(new ListTablesCommand({}));
    if (listTables.TableNames.includes('user_knowledge_files')) {
        console.log('Table user_knowledge_files already exists');
        return;
    }

    // Create user_knowledge_files table
    const params = {
        TableName: 'user_knowledge_files',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },  // Partition key
            { AttributeName: 'user_id', KeyType: 'RANGE' }  // Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'user_id', AttributeType: 'S' }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        },
        GlobalSecondaryIndexes: [
            {
                IndexName: 'user_id-index',
                KeySchema: [
                    { AttributeName: 'user_id', KeyType: 'HASH' }
                ],
                Projection: {
                    ProjectionType: 'ALL'
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ]
    };

    try {
        await client.send(new CreateTableCommand(params));
        console.log('Created table user_knowledge_files');
    } catch (error) {
        console.error('Error creating table:', error);
        throw error;
    }
}

setupDynamoDB().catch(console.error); 