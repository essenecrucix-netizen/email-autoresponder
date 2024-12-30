require('dotenv').config();

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
            imap.once('ready', () => {
                console.log('IMAP connection ready.');
                imap.openBox('INBOX', true, (err, box) => {
                    if (err) {
                        console.error('Error opening inbox:', err);
                        reject(err);
                        return;
                    }
                    console.log(`Mailbox opened. Total messages: ${box.messages.total}`);
                    imap.on('mail', () => {
                        console.log('New mail detected.');
                        processNewEmails(imap); // Call processNewEmails for new emails
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

    async function processNewEmails(imap) {
        try {
            imap.search(['UNSEEN'], (err, results) => {
                if (err) {
                    console.error('Error searching unseen emails:', err);
                    return;
                }

                if (!results || results.length === 0) {
                    console.log('No unseen emails to process.');
                    return;
                }

                const fetch = imap.fetch(results, { bodies: '' });
                fetch.on('message', (msg) => {
                    msg.on('body', async (stream) => {
                        try {
                            const email = await parseEmail(stream);
                            console.log('Processing email:', email.subject);
                            // Add logic for classification, escalation, and reply here
                        } catch (error) {
                            console.error('Error processing email:', error);
                        }
                    });
                });

                fetch.once('end', () => {
                    console.log('Finished processing emails.');
                });
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

