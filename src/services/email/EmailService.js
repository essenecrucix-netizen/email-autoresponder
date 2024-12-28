const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const DatabaseService = require('../database/DatabaseService');
const OpenAIService = require('./OpenAIService'); // Assuming this exists

function EmailService() {
    // Email configuration fetched from environment variables
    const EMAIL_CONFIG = {
        user: process.env.EMAIL_USER,
    };

    // Escalation email address
    const ESCALATION_EMAIL = process.env.ESCALATION_EMAIL || "default-escalation@example.com";

    // Load client secrets from the JSON file
    const CLIENT_SECRET_PATH = path.join(__dirname, 'client_secret_91869882627-d8rq09r1ic00bp1egiamuncvtmi9h6b1.apps.googleusercontent.com.json');
    const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8'));
    const { client_id, client_secret, redirect_uris } = credentials.web;
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Refresh token should be set in the environment
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Validate configuration
    if (!EMAIL_CONFIG.user || !ESCALATION_EMAIL) {
        throw new Error('Email configuration or escalation email is missing. Please check environment variables.');
    }

    const database = DatabaseService();
    const openai = OpenAIService();

    // Helper function to get an access token
    async function getAccessToken() {
        try {
            const { token } = await oauth2Client.getAccessToken();
            return token;
        } catch (error) {
            console.error('Error generating access token:', error);
            throw new Error('Failed to generate access token.');
        }
    }

    // Function to send escalation notifications
    async function sendEscalationNotification(email) {
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

            const escalationMessage = `
                <p><strong>Escalation Alert</strong></p>
                <p>Email from: ${email.from}</p>
                <p>Subject: ${email.subject}</p>
                <p>Message: ${email.text}</p>
            `;

            await transporter.sendMail({
                from: EMAIL_CONFIG.user,
                to: ESCALATION_EMAIL,
                subject: `Escalation: ${email.subject}`,
                html: escalationMessage,
            });

            console.log(`Escalation email sent to ${ESCALATION_EMAIL}`);
        } catch (error) {
            console.error('Error sending escalation email:', error);
            throw new Error('Failed to send escalation notification.');
        }
    }

    // Function to send replies to emails
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

    // Function to parse email content
    async function parseEmail(message) {
        try {
            const simpleParser = require('mailparser').simpleParser;
            return new Promise((resolve, reject) => {
                let buffer = '';
                message.on('body', (stream) => {
                    stream.on('data', (chunk) => {
                        buffer += chunk.toString('utf8');
                    });
                });
                message.once('end', async () => {
                    try {
                        const parsed = await simpleParser(buffer);
                        resolve({
                            messageId: parsed.messageId,
                            from: parsed.from.text,
                            subject: parsed.subject,
                            text: parsed.text,
                            html: parsed.html,
                            attachments: parsed.attachments,
                            date: parsed.date,
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('Failed to parse email:', error);
            throw error;
        }
    }

    // Function to classify emails using OpenAI
    async function classifyEmail(text) {
        try {
            const systemPrompt = "You are an email classification expert. Analyze the following email content and respond with one of these categories: 'help_request', 'information_request', 'complaint', or 'spam'.";
            return await openai.createCompletion(systemPrompt, text);
        } catch (error) {
            console.error('Failed to classify email:', error);
            throw error;
        }
    }

    // Function to process new emails
    async function processNewEmails() {
        try {
            const Imap = require('imap');
            const imap = new Imap({
                user: EMAIL_CONFIG.user,
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                tls: true,
            });

            return new Promise((resolve, reject) => {
                imap.once('ready', () => resolve(imap));
                imap.once('error', reject);
                imap.connect();
            });

            const messages = await new Promise((resolve, reject) => {
                imap.search(['UNSEEN'], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            for (const msgId of messages) {
                const fetch = imap.fetch(msgId, { bodies: '' });
                fetch.on('message', async (msg) => {
                    try {
                        const email = await parseEmail(msg);
                        const classification = await classifyEmail(email.text);

                        if (classification === 'spam') {
                            console.log(`Email from ${email.from} classified as spam. No response sent.`);
                            return;
                        }

                        const sentiment = await openai.analyzeSentiment(email.text);

                        if (classification === 'complaint' || sentiment === 'negative') {
                            await sendEscalationNotification(email);
                        } else {
                            await sendReply(email.from, email.subject, "Thank you for reaching out. We will get back to you soon.");
                        }

                        imap.addFlags(msgId, '\\Seen', (err) => {
                            if (err) throw err;
                        });
                    } catch (error) {
                        console.error('Error processing email:', error);
                    }
                });
            }

            imap.end();
        } catch (error) {
            console.error('Failed to process new emails:', error);
        }
    }

    return {
        processNewEmails,
        sendReply,
        sendEscalationNotification,
    };
}

module.exports = EmailService;
