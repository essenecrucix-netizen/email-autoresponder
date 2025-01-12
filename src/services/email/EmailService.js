require('dotenv').config();

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const DatabaseService = require('../database/DatabaseService');
const OpenAIService = require('../ai/OpenAIService');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { QueryCommand, GetObjectCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
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
            const knowledgeBaseItems = await docClient.send(new ScanCommand(scanParams));
            
            if (!knowledgeBaseItems.Items || knowledgeBaseItems.Items.length === 0) {
                console.log('No knowledge base files found');
                return '';
            }

            console.log(`Found ${knowledgeBaseItems.Items.length} knowledge base files`);

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
            return truncateContent(validContents.join('\n\n'), 30000);
        } catch (error) {
            console.error('Error fetching knowledge base content:', error);
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
                    // First, classify the email
                    const shouldRespond = await openai.classifyEmail(
                        email.subject,
                        email.text,
                        email.from
                    );

                    if (!shouldRespond) {
                        console.log('Email classified as not requiring response:', email.subject);
                        continue;
                    }

                    console.log('Email classified as requiring response. Generating response...');

                    // Fetch knowledge base content
                    const knowledgeBaseContent = await fetchKnowledgeBase();
                    
                    // Generate response using both knowledge base and email content
                    const response = await openai.generateResponse(
                        `Context from knowledge base: ${knowledgeBaseContent}\n\nEmail content: ${email.text}`,
                        email.subject
                    );

                    await sendReply(email.from, email.subject, response);
                    
                    // Add analytics entry
                    await database.addAnalyticsEntry({
                        timestamp: new Date().toISOString(),
                        emailSubject: email.subject,
                        response: response,
                        hasKnowledgeBase: !!knowledgeBaseContent,
                        classification: 'responded'
                    });

                    // Update the last processed UID
                    await database.updateItem('LastProcessedUID', {
                        emailUser: EMAIL_CONFIG.user,
                        uid: email.uid
                    });

                    console.log(`Updated last processed UID to ${email.uid}`);

                    // Add delay between processing emails (30 seconds)
                    await new Promise(resolve => setTimeout(resolve, 30000));
                } catch (error) {
                    console.error(`Error processing email: ${error.message}`);
                }
            }
        } catch (error) {
            console.error('Error processing email queue:', error);
        } finally {
            isProcessingQueue = false;
        }
    }

    async function monitorEmails() {
        const accessToken = await getAccessToken();

        const imap = new Imap({
            user: EMAIL_CONFIG.user,
            xoauth2: Buffer.from(`user=${EMAIL_CONFIG.user}\x01auth=Bearer ${accessToken}\x01\x01`).toString('base64'),
            host: process.env.EMAIL_HOST || 'imap.gmail.com',
            port: parseInt(process.env.EMAIL_PORT, 10) || 993,
            tls: process.env.EMAIL_TLS === 'true',
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 30000,
        });

        return new Promise((resolve, reject) => {
            imap.once('ready', async () => {
                console.log('IMAP connection ready.');

                const lastProcessedUIDEntry = await database.getItem('LastProcessedUID', {
                    emailUser: EMAIL_CONFIG.user,
                });
                const lastProcessedUID = lastProcessedUIDEntry ? lastProcessedUIDEntry.uid : 0;

                console.log(`Last processed UID: ${lastProcessedUID}`);
                imap.openBox('INBOX', true, (err, box) => {
                    if (err) {
                        console.error('Error opening inbox:', err);
                        reject(err);
                        return;
                    }

                    console.log(`Mailbox opened. Total messages: ${box.messages.total}`);
                    imap.on('mail', () => {
                        console.log('New mail detected.');
                        processNewEmails(imap, lastProcessedUID);
                    });
                });
            });

            imap.once('error', (err) => {
                console.error('IMAP connection error:', err);
                reject(err);
            });

            imap.once('end', () => {
                console.log('IMAP connection ended.');
                resolve();
            });

            imap.connect();
        });
    }

    async function processNewEmails(imap, lastProcessedUID) {
        try {
            imap.search(['UNSEEN'], async (err, results) => {
                if (err) {
                    console.error('Error searching unseen emails:', err);
                    return;
                }

                const filteredResults = results.filter(uid => uid > lastProcessedUID);
                if (!filteredResults.length) {
                    console.log('No new unseen emails to process.');
                    return;
                }

                const fetch = imap.fetch(filteredResults, { bodies: '' });

                fetch.on('message', (msg, seqno) => {
                    msg.on('body', async stream => {
                        try {
                            const email = await parseEmail(stream);
                            if (email) {  // Only process if email parsing was successful
                                email.uid = seqno;
                                emailQueue.push(email);
                                processQueue();
                            } else {
                                console.error(`Failed to parse email UID ${seqno}`);
                            }
                        } catch (error) {
                            console.error(`Error processing email UID ${seqno}:`, error);
                        }
                    });
                });

                fetch.once('end', () => console.log('Finished fetching new emails.'));
            });
        } catch (error) {
            console.error('Error processing emails:', error);
        }
    }

    return {
        monitorEmails,
        sendReply,
        sendEscalationNotification,
    };
}

module.exports = EmailService;
