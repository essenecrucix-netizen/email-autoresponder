const AWS = require('aws-sdk-mock');
const DatabaseService = require('../path-to-your/DatabaseService');

describe('DatabaseService Tests', () => {
    let dbService;

    beforeAll(() => {
        // Initialize DatabaseService
        dbService = DatabaseService();
    });

    afterAll(() => {
        // Restore AWS SDK
        AWS.restore();
    });

    test('should create an item in the users table', async () => {
        // Mock DynamoDB put
        AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(null, { Item: params.Item });
        });

        const result = await dbService.createItem('users', {
            email: 'test@example.com',
            password_hash: 'hashed_password',
            role: 'admin',
        });

        expect(result.email).toBe('test@example.com');
        expect(result.role).toBe('admin');
    });

    test('should retrieve an item from the users table', async () => {
        // Mock DynamoDB get
        AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
            callback(null, {
                Item: {
                    email: params.Key.email,
                    password_hash: 'hashed_password',
                    role: 'admin',
                },
            });
        });

        const result = await dbService.getItem('users', { email: 'test@example.com' });
        expect(result.email).toBe('test@example.com');
        expect(result.role).toBe('admin');
    });

    test('should update an item in the users table', async () => {
        // Mock DynamoDB update
        AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
            callback(null, {
                Attributes: {
                    ...params.ExpressionAttributeValues,
                    updatedAt: new Date().toISOString(),
                },
            });
        });

        const result = await dbService.updateItem(
            'users',
            { email: 'test@example.com' },
            { role: 'user' }
        );

        expect(result[':role']).toBe('user');
    });

    test('should delete an item from the users table', async () => {
        // Mock DynamoDB delete
        AWS.mock('DynamoDB.DocumentClient', 'delete', (params, callback) => {
            callback(null, {});
        });

        await expect(
            dbService.deleteItem('users', { email: 'test@example.com' })
        ).resolves.toBeUndefined();
    });

    test('should query items from the emails table', async () => {
        // Mock DynamoDB query
        AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
            callback(null, {
                Items: [
                    {
                        email_id: '1',
                        subject: 'Test Email',
                        content: 'This is a test email.',
                    },
                ],
            });
        });

        const result = await dbService.queryItems(
            'emails',
            'indexName', // Replace with your actual index name
            {
                expression: 'email_id = :email_id',
                values: { ':email_id': '1' },
                names: { '#email_id': 'email_id' },
            }
        );

        expect(result).toHaveLength(1);
        expect(result[0].subject).toBe('Test Email');
    });
});
