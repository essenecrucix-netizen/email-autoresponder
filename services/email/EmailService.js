function EmailService() {
    // Email configuration fetched from environment variables
    const EMAIL_CONFIG = {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 993,
        tls: process.env.EMAIL_TLS === 'true'
    };

    // Validate email configuration
    function validateEmailConfig() {
        const missingFields = [];
        if (!EMAIL_CONFIG.user) missingFields.push('EMAIL_USER');
        if (!EMAIL_CONFIG.password) missingFields.push('EMAIL_PASSWORD');
        if (!EMAIL_CONFIG.host) missingFields.push('EMAIL_HOST');
        if (!EMAIL_CONFIG.port) missingFields.push('EMAIL_PORT');

        if (missingFields.length > 0) {
            throw new Error(
                `Missing email configuration fields: ${missingFields.join(', ')}. Please check environment variables.`
            );
        }
    }

    // Validate configuration at service initialization
    validateEmailConfig();

    const database = DatabaseService();
    const openai = OpenAIService();

    async function connectIMAP() {
        try {
            const Imap = require('imap');
            const imap = new Imap(EMAIL_CONFIG);

            return new Promise((resolve, reject) => {
                imap.once('ready', () => resolve(imap));
                imap.once('error', reject);
                imap.connect();
            });
        } catch (error) {
            reportError(error);
            throw new Error('Failed to connect to IMAP server');
        }
    }

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
                            date: parsed.date
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            reportError(error);
            throw new Error('Failed to parse email');
        }
    }

    async function classifyEmail(text) {
        try {
            const systemPrompt = "You are an email classification expert. Analyze the following email content and respond with one of these categories: 'help_request', 'information_request', 'complaint', or 'spam'.";
            return await openai.createCompletion(systemPrompt, text);
        } catch (error) {
            reportError(error);
            throw new Error('Failed to classify email');
        }
    }

    async function processNewEmails() {
        try {
            const imap = await connectIMAP();
            const box = await new Promise((resolve, reject) => {
                imap.openBox('INBOX', false, (err, box) => {
                    if (err) reject(err);
                    else resolve(box);
                });
            });

            const messages = await new Promise((resolve, reject) => {
                imap.search(['UNSEEN'], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const emailQueue = [];

            for (const msgId of messages) {
                const fetch = imap.fetch(msgId, { bodies: '' });
                fetch.on('message', async (msg) => {
                    try {
                        const email = await parseEmail(msg);

                        // Classify the email
                        const classification = await classifyEmail(email.text);

                        if (classification === 'spam') {
                            console.log(`Email from ${email.from} classified as spam. No response sent.`);
                            return; // Skip processing
                        }

                        const sentiment = await openai.analyzeSentiment(email.text);

                        // Add to email queue with priority
                        emailQueue.push({
                            ...email,
                            classification,
                            sentiment,
                            priority: sentiment === 'negative' ? 1 : sentiment === 'neutral' ? 2 : 3
                        });

                        // Mark as read
                        imap.addFlags(msgId, '\\Seen', (err) => {
                            if (err) throw err;
                        });
                    } catch (error) {
                        reportError(error);
                    }
                });
            }

            imap.end();

            // Sort email queue by priority
            emailQueue.sort((a, b) => a.priority - b.priority);

            // Process sorted emails
            for (const email of emailQueue) {
                console.log(`Processing email: ${email.subject} with priority ${email.priority}`);
                await database.createItem('emails', email);
            }
        } catch (error) {
            reportError(error);
            throw new Error('Failed to process new emails');
        }
    }

    async function sendReply(to, subject, content) {
        try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                host: EMAIL_CONFIG.host,
                port: EMAIL_CONFIG.port,
                secure: EMAIL_CONFIG.tls,
                auth: {
                    user: EMAIL_CONFIG.user,
                    pass: EMAIL_CONFIG.password
                }
            });

            await transporter.sendMail({
                from: EMAIL_CONFIG.user,
                to,
                subject: `Re: ${subject}`,
                text: content,
                html: content.replace(/\n/g, '<br>')
            });
        } catch (error) {
            reportError(error);
            throw new Error('Failed to send reply');
        }
    }

    return {
        processNewEmails,
        sendReply
    };
}
