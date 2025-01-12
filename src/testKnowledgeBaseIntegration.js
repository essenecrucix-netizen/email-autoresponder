const OpenAIService = require('./services/ai/OpenAIService')();
const DatabaseService = require('./services/database/DatabaseService')();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
require('dotenv').config();

// Validate environment variables
if (!process.env.USER_ID) {
    console.error('USER_ID environment variable is not set');
    process.exit(1);
}

if (!process.env.S3_BUCKET_NAME) {
    console.error('S3_BUCKET_NAME environment variable is not set');
    process.exit(1);
}

if (!process.env.OPENAI_API_KEYS) {
    console.error('OPENAI_API_KEYS environment variable is not set');
    process.exit(1);
}

async function extractTextFromBuffer(buffer, filename) {
    try {
        if (filename.toLowerCase().endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (filename.toLowerCase().endsWith('.pdf')) {
            try {
                // Create a custom event handler
                const eventBus = {
                    _listeners: [],
                    on(eventName, callback) {
                        this._listeners.push({ eventName, callback });
                    },
                    dispatch(eventName, data) {
                        // Suppress warning events
                        if (eventName === 'warning') return;
                        this._listeners
                            .filter(listener => listener.eventName === eventName)
                            .forEach(listener => listener.callback(data));
                    }
                };

                const options = {
                    eventBus,
                    disableFontFace: true,
                    disablePageRendering: true,
                    verbosity: -1,
                    ignoreErrors: true,
                    showWarnings: false,
                };

                const data = await pdf(buffer, options);

                if (!data.text) {
                    console.warn(`No text content extracted from PDF: ${filename}`);
                    return '';
                }
                return data.text.trim();
            } catch (pdfError) {
                console.error(`Error parsing PDF ${filename}:`, pdfError);
                return '';
            }
        } else {
            // Assume it's plain text
            return buffer.toString('utf-8');
        }
    } catch (error) {
        console.error(`Error extracting text from ${filename}:`, error);
        return '';
    }
}

function truncateContent(content, maxLength = 15000) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '... [Content truncated due to length]';
}

async function fetchKnowledgeBase() {
    try {
        // Initialize DynamoDB Document Client
        const client = new DynamoDBClient({
            region: process.env.AWS_REGION || 'us-west-2',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        const docClient = DynamoDBDocumentClient.from(client);

        // Scan the table to find all files for this user
        const scanParams = {
            TableName: 'user_knowledge_files',
            FilterExpression: 'user_id = :user_id',
            ExpressionAttributeValues: {
                ':user_id': process.env.USER_ID
            }
        };

        console.log('Scanning DynamoDB for knowledge base files...');
        console.log('Using USER_ID:', process.env.USER_ID);
        const knowledgeBaseItems = await docClient.send(new ScanCommand(scanParams));
        
        if (!knowledgeBaseItems.Items || knowledgeBaseItems.Items.length === 0) {
            console.log('No knowledge base files found');
            return '';
        }

        console.log(`Found ${knowledgeBaseItems.Items.length} knowledge base files`);
        console.log('Files found:', knowledgeBaseItems.Items.map(item => ({
            user_id: item.user_id,
            s3_key: item.s3_key,
            filename: item.filename
        })));

        // Initialize S3 Client
        const s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-west-2',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        // Fetch and process content from all relevant knowledge base entries
        const contentPromises = knowledgeBaseItems.Items.map(async (item) => {
            try {
                const getObjectParams = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: item.s3_key
                };
                
                console.log(`Fetching content for file: ${item.filename || item.s3_key}`);
                const response = await s3Client.send(new GetObjectCommand(getObjectParams));
                
                // Convert stream to buffer
                const chunks = [];
                for await (const chunk of response.Body) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                
                // Extract text based on file type
                const content = await extractTextFromBuffer(buffer, item.filename || item.s3_key);
                const truncatedContent = truncateContent(content);
                return `Content from ${item.filename || item.s3_key}:\n${truncatedContent}`;
            } catch (error) {
                console.error(`Error fetching content for file ${item.filename || item.s3_key}:`, error);
                return '';
            }
        });

        const contents = await Promise.all(contentPromises);
        const validContents = contents.filter(content => content !== '');
        
        if (validContents.length === 0) {
            console.log('No valid content retrieved from knowledge base files');
            return '';
        }

        console.log(`Successfully retrieved content from ${validContents.length} knowledge base files`);
        // Combine and truncate the final content to stay within token limits
        return truncateContent(validContents.join('\n\n'), 30000);
    } catch (error) {
        console.error('Error fetching knowledge base content:', error);
        return '';
    }
}

async function testKnowledgeBaseIntegration() {
    try {
        // 1. First, let's fetch knowledge base content
        console.log('Fetching knowledge base content...');
        const knowledgeBaseContent = await fetchKnowledgeBase();
        console.log('\nKnowledge base content retrieved:', knowledgeBaseContent ? 'Yes' : 'No');
        if (knowledgeBaseContent) {
            console.log('Sample of content:', knowledgeBaseContent.substring(0, 200) + '...');
        }

        // 2. Test with a sample email
        const testEmail = {
            subject: "Question about GFI Systems Fleetcam",
            text: "What can you tell me about GFI Systems Fleetcam?"
        };

        console.log('\nTesting with sample email:', testEmail);

        // 3. Generate response with knowledge base context
        console.log('\nGenerating response...');
        const response = await OpenAIService.generateResponse(
            `Context from knowledge base: ${knowledgeBaseContent}\n\nEmail content: ${testEmail.text}`,
            testEmail.subject
        );

        console.log('\nGenerated Response:', response);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
console.log('Starting knowledge base integration test...\n');
testKnowledgeBaseIntegration().then(() => {
    console.log('\nTest completed.');
    process.exit(0);
}).catch(error => {
    console.error('\nTest failed:', error);
    process.exit(1);
}); 