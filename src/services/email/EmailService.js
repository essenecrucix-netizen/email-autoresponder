const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const DatabaseService = require('../database/DatabaseService');
const OpenAIService = require('../ai/OpenAIService');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

function EmailService() {
    const EMAIL_CONFIG = {
        user: process.env.EMAIL_USER,
    };

    const ESCALATION_EMAIL = process.env.ESCALATION_EMAIL || "default-escalation@example.com";

    const CLIENT_SECRET_PATH = path.join(__dirname, 'client_secret_91869882627-d8rq09r1ic00bp1egiamuncvtmi9h6b1.apps.googleusercontent.com.json');
    const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8'));
    const { client_id, client_secret, redirect_uris } = credentials.web;
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    if (!EMAIL_CONFIG.user || !ESCALATION_EMAIL) {
        throw new Error('Email configuration or escalation email is missing. Please check environment variables.');
    }

    const database = DatabaseService();
    const openai = OpenAIService();

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

    async function parseEmail(message) {
        try {
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
                        resolve(parsed);
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

    async function processNewEmails() {
        const imap = new Imap({
            user: EMAIL_CONFIG.user,
            password: process.env.EMAIL_PASSWORD,
            host: process.env.EMAIL_HOST || 'imap.gmail.com',
            port: parseInt(process.env.EMAIL_PORT, 10) || 993,
            tls: process.env.EMAIL_TLS === 'true',
            tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certificates
            authTimeout: 30000,
        });

        return new Promise((resolve, reject) => {
            imap.once('ready', async () => {
                try {
                    imap.openBox('INBOX', false, async (err, box) => {
                        if (err) throw err;

                        const results = await new Promise((resolve, reject) => {
                            imap.search(['UNSEEN'], (err, results) => {
                                if (err) reject(err);
                                else resolve(results);
                            });
                        });

                        const emailQueue = [];
                        for (const msgId of results) {
                            const fetch = imap.fetch(msgId, { bodies: '' });
                            fetch.on('message', async (msg) => {
                                try {
                                    const email = await parseEmail(msg);
                                    emailQueue.push(email);
                                } catch (error) {
                                    console.error('Error parsing email:', error);
                                }
                            });
                        }

                        imap.once('end', async () => {
                            console.log('Processing email queue...');
                            for (const email of emailQueue) {
                                console.log('Processing:', email.subject);
                                // Add email processing logic here
                            }
                        });

                        imap.end();
                    });
                } catch (error) {
                    console.error('Error processing new emails:', error);
                    reject(error);
                }
            });

            imap.once('error', (err) => {
                console.error('IMAP error:', err);
                reject(err);
            });

            imap.connect();
        });
    }

    return {
        processNewEmails,
        sendReply,
        sendEscalationNotification,
    };
}

module.exports = EmailService;

