require('dotenv').config();

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const DatabaseService = require('../database/DatabaseService');
const OpenAIService = require('../ai/OpenAIService');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

function EmailService() {
    const EMAIL_CONFIG = {
        user: process.env.EMAIL_USER,
    };

    const ESCALATION_EMAIL = process.env.ESCALATION_EMAIL || "default-escalation@example.com";

    const CLIENT_SECRET_PATH = path.resolve(__dirname, '../../config/credentials.json');

    if (!fs.existsSync(CLIENT_SECRET_PATH)) {
        throw new Error(`Credentials file not found at path: ${CLIENT_SECRET_PATH}`);
    }

    const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8'));
    const { client_id, client_secret, redirect_uris } = credentials.installed;
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    if (!EMAIL_CONFIG.user || !ESCALATION_EMAIL) {
        throw new Error('Email configuration or escalation email is missing. Please check environment variables.');
    }

    const database = DatabaseService();
    const openai = OpenAIService();

    const emailQueue = [];
    let isProcessingQueue = false;
    const processedMessageIds = new Set();
    let imapConnection = null;

    async function getAccessToken() {
        try {
            const { token } = await oauth2Client.getAccessToken();
            return token;
        } catch (error) {
            console.error('Error generating access token:', error);
            throw new Error('Failed to generate access token.');
        }
    }

    async function sendEscalationNotification(email) {
        // No changes to this function
    }

    async function sendReply(to, subject, content) {
        try {
            const accessToken = await getAccessToken();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: EMAIL_CONFIG.user,
                    clientId: client_id,
                    clientSecret: client_secret,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                    accessToken,
                },
            });

            await transporter.sendMail({
                from: EMAIL_CONFIG.user,
                to,
                subject: `Re: ${subject}`,
                text: content,
                html: content.replace(/\n/g, '<br>'),
            });

            console.log('Email reply sent successfully!');
        } catch (error) {
            console.error('Error sending email reply:', error);
            throw new Error('Failed to send reply.');
        }
    }

    async function parseEmail(stream) {
        try {
            const parsed = await simpleParser(stream);
            return {
                subject: parsed.subject || '',
                text: parsed.text || '',
                from: parsed.from?.text || '',
                to: parsed.to?.text || '',
                date: parsed.date || new Date(),
                messageId: parsed.messageId || '',
            };
        } catch (error) {
            console.error('Error parsing email:', error);
            return null;
        }
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

    function truncateContent(content, maxLength = 8000) {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '... [Content truncated due to length]';
    }

    async function fetchKnowledgeBase(emailContent) {
        if (!process.env.USER_ID) {
            console.warn('USER_ID not set in environment variables');
            return '';
        }

        try {
            // Initialize DynamoDB Document Client
            const client = new DynamoDBClient({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                }
            });
            const docClient = DynamoDBDocumentClient.from(client);

            // Initialize S3 Client
            const s3Client = new S3Client({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                }
            });

            // Scan the table to find all files for this user
            const scanParams = {
                TableName: 'user_knowledge_files',
                FilterExpression: 'user_id = :user_id',
                ExpressionAttributeValues: {
                    ':user_id': process.env.USER_ID
                }
            };

            console.log('Scanning DynamoDB for knowledge base files...');
            const knowledgeBaseItems = await docClient.send(new ScanCommand(scanParams));
            
            if (!knowledgeBaseItems.Items || knowledgeBaseItems.Items.length === 0) {
                console.log('No knowledge base files found');
                return '';
            }

            console.log(`Found ${knowledgeBaseItems.Items.length} knowledge base files`);

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
            return truncateContent(validContents.join('\n\n'), 30000);
        } catch (error) {
            console.error('Error in fetchKnowledgeBase:', error);
            return '';
        }
    }

    async function processQueue() {
        if (isProcessingQueue) {
            return;
        }

        isProcessingQueue = true;

        try {
            while (emailQueue.length > 0) {
                const email = emailQueue.shift();
                console.log('Processing:', email.subject);

                try {
                    // Add delay at the start of each email processing
                    await new Promise(resolve => setTimeout(resolve, 30000));

                    // First, save the incoming email
                    await database.saveEmail(email);

                    // Classify the email
                    const shouldRespond = await openai.classifyEmail(
                        email.subject,
                        truncateContent(email.text, 1000),
                        email.from
                    );

                    if (!shouldRespond) {
                        console.log('Email classified as not requiring response:', email.subject);
                        continue;
                    }

                    console.log('Email classified as requiring response. Fetching thread history...');

                    // Fetch thread history
                    const threadHistory = await database.getThreadHistory(email.messageId);
                    console.log(`Found ${threadHistory.length} previous messages in thread`);

                    // Add delay between API calls
                    await new Promise(resolve => setTimeout(resolve, 10000));

                    // Fetch knowledge base content
                    const knowledgeBaseContent = await fetchKnowledgeBase();
                    const truncatedKnowledgeBase = truncateContent(knowledgeBaseContent, 8000);
                    
                    // Generate response using knowledge base, email content, and thread history
                    const response = await openai.generateResponse(
                        `Context from knowledge base: ${truncatedKnowledgeBase}\n\nEmail content: ${truncateContent(email.text, 2000)}`,
                        email.subject,
                        threadHistory.map(msg => msg.content)
                    );

                    // Save the AI's response
                    await database.saveEmailResponse(email.messageId, response, true);

                    // Analyze sentiment of the response
                    const sentiment = await openai.analyzeSentiment(response);
                    console.log('Response sentiment:', sentiment);

                    // Send the reply
                    await sendReply(email.from, email.subject, response);
                    
                    // Calculate response time in minutes
                    const receivedTime = email.date;
                    const responseTime = new Date();
                    const responseTimeMinutes = Math.round((responseTime - receivedTime) / (1000 * 60));
                    
                    // Add analytics entry
                    await database.addAnalyticsEntry({
                        timestamp: new Date().toISOString(),
                        emailSubject: email.subject,
                        response: response,
                        hasKnowledgeBase: !!knowledgeBaseContent,
                        classification: 'responded',
                        satisfaction: sentiment,
                        responseTime: responseTimeMinutes
                    });

                    console.log('Successfully processed email:', email.subject);

                } catch (error) {
                    if (error.message?.includes('rate_limit_exceeded')) {
                        console.log('Rate limit reached, adding email back to queue and pausing...');
                        emailQueue.unshift(email);
                        await new Promise(resolve => setTimeout(resolve, 60000));
                        break;
                    } else {
                        console.error(`Error processing email: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing email queue:', error);
        } finally {
            isProcessingQueue = false;
        }
    }

    async function monitorEmails() {
        try {
            const accessToken = await getAccessToken();
            const serviceStartTime = new Date();
            console.log(`Email monitoring service started at: ${serviceStartTime.toISOString()}`);

            if (imapConnection && imapConnection.state !== 'disconnected') {
                console.log('Cleaning up existing IMAP connection...');
                await cleanup();
            }

            imapConnection = new Imap({
                user: EMAIL_CONFIG.user,
                xoauth2: Buffer.from(`user=${EMAIL_CONFIG.user}\x01auth=Bearer ${accessToken}\x01\x01`).toString('base64'),
                host: process.env.EMAIL_HOST || 'imap.gmail.com',
                port: parseInt(process.env.EMAIL_PORT, 10) || 993,
                tls: process.env.EMAIL_TLS === 'true',
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 30000,
                keepalive: {
                    interval: 10000,
                    idleTimeout: 300000,
                    forceNoop: true
                }
            });

            return new Promise((resolve, reject) => {
                const connectionTimeout = setTimeout(() => {
                    reject(new Error('IMAP connection timeout'));
                    cleanup();
                }, 60000);

                imapConnection.once('ready', () => {
                    clearTimeout(connectionTimeout);
                    console.log('IMAP connection ready.');
                    
                    imapConnection.openBox('INBOX', false, (err, box) => {
                        if (err) {
                            console.error('Error opening inbox:', err);
                            reject(err);
                            cleanup();
                            return;
                        }

                        console.log(`Mailbox opened. Total messages: ${box.messages.total}`);
                        
                        // Set up listener for new emails
                        imapConnection.on('mail', () => {
                            console.log('New mail event detected');
                            processNewEmails(imapConnection, serviceStartTime);
                        });

                        // Set up error handler for the mail event
                        imapConnection.on('error', (err) => {
                            console.error('IMAP mail event error:', err);
                            cleanup();
                            // Attempt to reconnect after error
                            setTimeout(() => {
                                console.log('Attempting to reconnect...');
                                monitorEmails();
                            }, 30000);
                        });
                    });
                });

                imapConnection.once('error', (err) => {
                    clearTimeout(connectionTimeout);
                    console.error('IMAP connection error:', err);
                    reject(err);
                    cleanup();
                });

                imapConnection.once('end', () => {
                    clearTimeout(connectionTimeout);
                    console.log('IMAP connection ended.');
                    resolve();
                });

                // Connect to the IMAP server
                console.log('Connecting to IMAP server...');
                imapConnection.connect();
            });
        } catch (error) {
            console.error('Error in monitorEmails:', error);
            await cleanup();
            // Attempt to reconnect after error
            setTimeout(() => {
                console.log('Attempting to reconnect after error...');
                monitorEmails();
            }, 30000);
            throw error;
        }
    }

    async function processNewEmails(imapConnection, serviceStartTime) {
        try {
            console.log('Searching for new emails...');
            imapConnection.search(['UNSEEN'], async (err, results) => {
                if (err) {
                    console.error('Error searching unseen emails:', err);
                    return;
                }

                if (!results.length) {
                    console.log('No new unseen emails to process.');
                    return;
                }

                console.log(`Found ${results.length} new unseen emails to process.`);
                const fetch = imapConnection.fetch(results, { bodies: '' });

                fetch.on('message', (msg) => {
                    let emailBuffer = '';

                    msg.on('body', (stream) => {
                        stream.on('data', (chunk) => {
                            emailBuffer += chunk.toString('utf8');
                        });
                    });

                    msg.once('end', async () => {
                        try {
                            const email = await parseEmail(emailBuffer);
                            if (!email) {
                                console.error('Failed to parse email');
                                return;
                            }

                            const emailDate = new Date(email.date);
                            console.log(`Processing email from ${emailDate.toISOString()} with subject: ${email.subject}`);
                            
                            if (emailDate < serviceStartTime) {
                                console.log(`Skipping email from ${emailDate.toISOString()} (before service start)`);
                                return;
                            }

                            console.log(`Adding email to queue: ${email.subject}`);
                            emailQueue.push(email);
                            processQueue();
                        } catch (error) {
                            console.error('Error processing message:', error);
                        }
                    });
                });

                fetch.once('error', (err) => {
                    console.error('Fetch error:', err);
                });

                fetch.once('end', () => {
                    console.log('Done fetching all messages.');
                });
            });
        } catch (error) {
            console.error('Error in processNewEmails:', error);
        }
    }

    async function cleanup() {
        try {
            if (imapConnection && imapConnection.state !== 'disconnected') {
                console.log('Closing IMAP connection...');
                await new Promise((resolve) => {
                    imapConnection.once('end', () => {
                        console.log('IMAP connection closed.');
                        resolve();
                    });
                    imapConnection.end();
                });
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    return {
        monitorEmails,
        sendReply,
        sendEscalationNotification,
        cleanup,
        processEmailQueue: processQueue
    };
}

module.exports = EmailService;
