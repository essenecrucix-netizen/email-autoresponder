const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const DatabaseService = require('../database/DatabaseService');
const OpenAIService = require('../ai/OpenAIService');
const Imap = require('imap'); // Ensure this is imported
const { simpleParser } = require('mailparser'); // Import simpleParser

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
        // Your existing code for sending escalation notifications
    }

    async function sendReply(to, subject, content) {
        // Your existing code for sending email replies
    }

    async function parseEmail(message) {
        // Your existing code for parsing email messages
    }

    async function processNewEmails() {
        const imap = new Imap({
            user: EMAIL_CONFIG.user,
            password: process.env.EMAIL_PASSWORD, // Only used if you're not using OAuth2
            host: process.env.EMAIL_HOST || 'imap.gmail.com',
            port: parseInt(process.env.EMAIL_PORT, 10) || 993,
            tls: process.env.EMAIL_TLS === 'true',
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

                        fetch.once('end', async () => {
                            console.log('Processing email queue...');
                            for (const email of emailQueue) {
                                console.log('Processing:', email.subject);
                                // Add email processing logic here
                            }
                            imap.end();
                            resolve();
                        });
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
