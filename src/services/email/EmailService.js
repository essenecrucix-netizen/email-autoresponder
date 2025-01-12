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

    async function parseEmail(messageStream) {
        // No changes to this function
    }

    async function processQueue() {
        if (isProcessingQueue) return;
        isProcessingQueue = true;

        while (emailQueue.length > 0) {
            const email = emailQueue.shift();
            try {
                console.log(`Processing email (UID: ${email.uid}): ${email.subject}`);
                
                // Fetch relevant knowledge base content
                const knowledgeBaseContent = await fetchRelevantKnowledgeBase(email.text);
                console.log('Retrieved knowledge base content for context');

                // Generate response with knowledge base context
                const response = await openai.generateResponse(
                    `Context from knowledge base: ${knowledgeBaseContent}\n\nEmail content: ${email.text}`,
                    email.subject
                );

                if (!response) {
                    console.error(`OpenAI response is undefined for email UID ${email.uid}. Skipping.`);
                    continue;
                }

                await sendReply(email.from.text, email.subject, response);
                await database.updateLastProcessedUID(EMAIL_CONFIG.user, email.uid);

                console.log(`Updated last processed UID to ${email.uid}`);
            } catch (error) {
                console.error(`Error processing email (UID: ${email.uid}):`, error);
            }

            // Delay between sending emails
            await new Promise(resolve => setTimeout(resolve, 30000)); // 30-second delay
        }

        isProcessingQueue = false;
    }

    async function fetchRelevantKnowledgeBase(emailContent) {
        try {
            // Query DynamoDB for knowledge base entries
            const params = {
                TableName: 'user_knowledge_files',
                KeyConditionExpression: 'user_id = :user_id',
                ExpressionAttributeValues: {
                    ':user_id': process.env.USER_ID, // Make sure to set this in your .env file
                }
            };

            const knowledgeBaseItems = await database.dynamodb.send(new QueryCommand(params));
            
            if (!knowledgeBaseItems.Items || knowledgeBaseItems.Items.length === 0) {
                console.log('No knowledge base files found');
                return '';
            }

            // For S3 stored files, fetch their content
            const s3Client = new S3Client({
                region: process.env.AWS_REGION || 'us-west-2',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });

            // Fetch and combine content from all relevant knowledge base entries
            const contentPromises = knowledgeBaseItems.Items.map(async (item) => {
                try {
                    const getObjectParams = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: item.s3_key
                    };
                    
                    const response = await s3Client.send(new GetObjectCommand(getObjectParams));
                    const content = await response.Body.transformToString();
                    console.log(`Successfully retrieved content for file: ${item.filename}`);
                    return `Content from ${item.filename}:\n${content}`;
                } catch (error) {
                    console.error(`Error fetching content for file ${item.filename}:`, error);
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
            return validContents.join('\n\n');
        } catch (error) {
            console.error('Error fetching knowledge base content:', error);
            return '';
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
                            email.uid = seqno; // Assign UID to email
                            emailQueue.push(email); // Add email to the queue
                            processQueue(); // Start processing the queue
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
