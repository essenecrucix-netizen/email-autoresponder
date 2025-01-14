let app;
try {
    const express = require('express');
    const path = require('path');
    const bodyParser = require('body-parser');
    const dotenv = require('dotenv');
    const cors = require('cors');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const EmailService = require('./services/email/EmailService');
    const DatabaseService = require('./services/database/DatabaseService');

    dotenv.config();
    app = express();

    // CORS configuration
    app.use(cors({
        origin: 'http://54.213.58.183:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Serve static files from the React frontend build
    app.use(express.static(path.join(__dirname, '../frontend/build'))); // Updated path for React app

    // Initialize EmailService
    const emailService = EmailService();

    // Guard against concurrent processing
    let isProcessingEmails = false;

    // Secret key for JWT
    const SECRET_KEY = process.env.JWT_SECRET || 'your-very-secure-secret';

    // Middleware to authenticate JWT tokens
    function authenticateToken(req, res, next) {
        console.log('Auth headers:', req.headers);
        const authHeader = req.headers['authorization'];
        console.log('Auth header:', authHeader);
        
        const token = authHeader?.split(' ')[1];
        console.log('Extracted token:', token);
        
        if (!token) {
            console.log('No token found');
            return res.status(401).json({ error: 'Access token is missing.' });
        }

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                console.log('Token verification error:', err);
                return res.status(403).json({ error: 'Invalid token.' });
            }
            console.log('Decoded user:', user);
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
            console.log('Login attempt:', { email }); // Debugging

            const user = await database.getItemByEmail(email); // Updated to use the correct method
            console.log('User fetched from DB:', user); // Debugging

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

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

            console.log('Signup attempt:', { name, email, role }); // Debugging

            // Check if the user already exists
            const existingUser = await database.getItemByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists.' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create the new user
            const newUser = {
                id: Date.now().toString(), // Generate a unique ID
                email,
                name,
                password_hash: hashedPassword,
                role: role || 'user',
                created_at: new Date().toISOString(),
            };

            await database.createItem('users', newUser);
            console.log('User created successfully:', newUser); // Debugging

            res.status(201).json({ message: 'User created successfully. Please log in.' });
        } catch (error) {
            console.error('Error during signup:', error.message, error.stack);
            res.status(500).json({ error: 'An error occurred during signup.' });
        }
    });

    // Get analytics by user
    app.get('/api/analytics', authenticateToken, async (req, res) => {
        try {
            console.log('Analytics request received');
            console.log('User from token:', req.user);

            const mockData = {
                dateLabels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
                emailCounts: [10, 15, 20, 12, 18],
                responseTimes: [30, 25, 35, 28, 32],
                sentimentData: {
                    positive: 45,
                    neutral: 35,
                    negative: 20
                },
                languageData: {
                    English: 75,
                    Spanish: 15,
                    French: 10
                }
            };

            res.json(mockData);
        } catch (error) {
            console.error('Error in analytics endpoint:', error);
            res.status(500).json({ error: 'Failed to fetch analytics data' });
        }
    });

    // Fallback to index.html for React routing - MOVED TO END
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (error) {
    console.error('Error loading module:', error.message);
    console.error('Module that failed:', error.requireStack);
    process.exit(1);
}
