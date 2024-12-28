const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const EmailService = require('./services/email/EmailService'); // Import EmailService
const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../build')));

// Initialize EmailService
const emailService = EmailService();

// Backend routes
// Health check endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// Process emails endpoint
app.post('/api/process-email', async (req, res) => {
    try {
        // Call processNewEmails from EmailService
        await emailService.processNewEmails();
        res.json({ message: 'Emails processed successfully!' });
    } catch (error) {
        console.error('Error processing emails:', error);
        res.status(500).json({ error: 'Failed to process emails' });
    }
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



