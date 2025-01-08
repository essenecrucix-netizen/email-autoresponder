const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const EmailService = require('./services/email/EmailService');
const DatabaseService = require('./services/database/DatabaseService');

const app = express();
dotenv.config();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../frontend/build'))); // Updated path for React app

// Fallback to index.html for React routing
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Initialize EmailService
const emailService = EmailService();

// Guard against concurrent processing
let isProcessingEmails = false;

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET || 'your-very-secure-secret';

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token is missing.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
}

// Backend routes

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// Email processing endpoint
app.post('/api/process-email', async (req, res) => {
    if (isProcessingEmails) {
        return res.status(429).json({ error: 'Email processing is already in progress. Please try again later.' });
    }

    isProcessingEmails = true;
    try {
        await emailService.processNewEmails();
        res.json({ message: 'Emails processed successfully!' });
    } catch (error) {
        console.error('Error processing emails:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to process emails' });
    } finally {
        isProcessingEmails = false;
    }
});

// Email queue status
app.get('/api/email-queue-status', (req, res) => {
    try {
        const queueStats = emailService.getQueueStats(); // Assuming getQueueStats is implemented
        res.json(queueStats);
    } catch (error) {
        console.error('Error fetching email queue status:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to fetch email queue status.' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const database = DatabaseService();
        const user = await database.getItem('users', { email }); // Fetch user by email
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.user_id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        // Respond with user details (excluding password) and token
        const userResponse = { ...user, password_hash: undefined }; // Remove password hash
        res.json({ user: userResponse, token });
    } catch (error) {
        console.error('Error during login:', error.message, error.stack);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    try {
        const database = DatabaseService();

        // Check if the user already exists
        const existingUser = await database.getItem('users', { email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const newUser = {
            user_id: Date.now().toString(), // Generate a unique ID
            email,
            name,
            password_hash: hashedPassword,
            role: role || 'user',
            created_at: new Date().toISOString(),
        };

        await database.createItem('users', newUser);

        res.status(201).json({ message: 'User created successfully. Please log in.' });
    } catch (error) {
        console.error('Error during signup:', error.message, error.stack);
        res.status(500).json({ error: 'An error occurred during signup.' });
    }
});

// Get analytics by user
app.get('/api/analytics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from the token
        const database = DatabaseService();
        const analytics = await database.getAnalyticsByUser(userId);
        res.status(200).json(analytics);
    } catch (error) {
        console.error('Error fetching analytics:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to fetch analytics data.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
