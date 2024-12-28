const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../build')));

// Backend routes
// Example: Health check endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// Example: Email processing route
app.post('/api/process-email', async (req, res) => {
    try {
        // Replace with your email processing logic
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Simulate email processing
        console.log(`Processing email: ${email}`);
        res.json({ message: 'Email processed successfully' });
    } catch (error) {
        console.error('Error processing email:', error);
        res.status(500).json({ error: 'Failed to process email' });
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



