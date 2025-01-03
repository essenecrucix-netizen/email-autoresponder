const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const EmailService = require('./services/email/EmailService');

const app = express();
dotenv.config();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../build')));

// Initialize EmailService
const emailService = EmailService();

// Guard against concurrent processing
let isProcessingEmails = false;

// Backend routes
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

app.post('/api/process-email', async (req, res) => {
    if (isProcessingEmails) {
        return res.status(429).json({ error: 'Email processing is already in progress. Please try again later.' });
    }

    isProcessingEmails = true;
    try {
        await emailService.processNewEmails();
        res.json({ message: 'Emails processed successfully!' });
    } catch (error) {
        console.error('Error processing emails:', error);
        res.status(500).json({ error: 'Failed to process emails' });
    } finally {
        isProcessingEmails = false;
    }
});

app.get('/api/email-queue-status', (req, res) => {
    const queueStats = emailService.getQueueStats(); // Assuming getQueueStats is implemented
    res.json(queueStats);
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




