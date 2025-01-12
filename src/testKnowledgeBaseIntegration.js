require('dotenv').config();
const OpenAIService = require('./services/ai/OpenAIService')();
const DatabaseService = require('./services/database/DatabaseService')();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

// Test cases representing different types of inquiries
const TEST_CASES = [
    {
        type: "Technical Support",
        subject: "Camera system not recording",
        text: "We've been having issues with our FleetCam system. The cameras are powered on but they're not recording any footage. This is affecting 5 of our trucks. Can you help us resolve this urgently?",
        from: "fleet.manager@clientcompany.com"
    },
    {
        type: "Sales Inquiry",
        subject: "Interested in your fleet management solution",
        text: "I manage a fleet of 50 vehicles and I'm looking for a comprehensive solution that can help with tracking, maintenance, and driver safety. Can you tell me more about your software and what makes it different from other solutions?",
        from: "operations.director@prospectcompany.com"
    },
    {
        type: "Integration Question",
        subject: "API Integration Capabilities",
        text: "We're currently using a custom maintenance management system. I'd like to know if your software can integrate with our existing system through APIs, and what kind of data can be exchanged?",
        from: "tech.lead@existingclient.com"
    },
    {
        type: "Compliance",
        subject: "ELD Compliance Question",
        text: "We need to ensure our fleet is fully compliant with the latest ELD mandates. Can your system help us maintain compliance, and what specific features do you offer for HOS tracking?",
        from: "compliance.officer@trucking.com"
    },
    // Add test cases for emails that should be ignored
    {
        type: "Legal Communication",
        subject: "Contract Review - Confidential",
        text: "Please review the attached contract revisions for the Johnson deal. We need your feedback by Friday.",
        from: "lawyer@lawfirm.com"
    },
    {
        type: "Marketing",
        subject: "🔥 Special Offer: Boost Your Business with Our Services",
        text: "Don't miss out on this exclusive opportunity to transform your business with our revolutionary marketing solutions!",
        from: "marketing@salescompany.com"
    },
    {
        type: "System Report",
        subject: "Weekly System Performance Report",
        text: "Server Uptime: 99.9%\nCPU Usage: 45%\nMemory Usage: 60%\nNo critical issues detected.",
        from: "system@monitoring.com"
    }
];

// Global error handler for PDF.js
const originalConsoleWarn = console.warn;
console.warn = function() {
    if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].includes('TT: undefined function')) {
        return;
    }
    return originalConsoleWarn.apply(console, arguments);
};

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
                const options = {
                    disableFontFace: true,
                    disablePageRendering: true,
                    verbosity: -1,
                    ignoreErrors: true,
                    throwOnErrors: false,
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
            console.log('Sample of content:', knowledgeBaseContent.substring(0, 200) + '...\n');
        }

        // 2. Test with multiple types of inquiries
        for (const testCase of TEST_CASES) {
            console.log(`\n=== Testing ${testCase.type} Scenario ===`);
            console.log('From:', testCase.from);
            console.log('Subject:', testCase.subject);
            console.log('Email:', testCase.text);

            // First, test classification
            console.log('\nClassifying email...');
            const shouldRespond = await OpenAIService.classifyEmail(
                testCase.subject,
                testCase.text,
                testCase.from
            );
            console.log('Classification result:', shouldRespond ? 'RESPOND' : 'IGNORE');

            // Only generate response if classification indicates we should
            if (shouldRespond) {
                console.log('\nGenerating response...');
                const response = await OpenAIService.generateResponse(
                    `Context from knowledge base: ${knowledgeBaseContent}\n\nEmail content: ${testCase.text}`,
                    testCase.subject
                );
                console.log('\nGenerated Response:', response);
            } else {
                console.log('\nSkipping response generation for this email.');
            }

            console.log('\n' + '='.repeat(80) + '\n');
        }

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