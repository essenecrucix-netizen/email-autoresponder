let app;
const express = require('express');
try {
    const path = require('path');
    const bodyParser = require('body-parser');
    const dotenv = require('dotenv');
    const cors = require('cors');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const EmailService = require('./services/email/EmailService');
    const DatabaseService = require('./services/database/DatabaseService');
    const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const fileUpload = require('express-fileupload');

    dotenv.config();
    app = express();

    // Configure AWS S3
    const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-west-2',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    // Set S3 bucket name from environment
    const S3_BUCKET = process.env.REACT_APP_S3_BUCKET_NAME || 'knowledgebasefiles2234';

    // CORS configuration
    app.use(cors({
        origin: 'http://54.213.58.183:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));

    // Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
        abortOnLimit: true
    }));

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

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            console.log('Token successfully decoded:', decoded);
            req.user = decoded;
            next();
        } catch (error) {
            console.log('Token verification failed:', error.message);
            return res.status(403).json({ error: 'Invalid token: ' + error.message });
        }
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
            const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

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
            const databaseService = DatabaseService();
            const analyticsData = await databaseService.getAnalyticsByUser(req.user.userId);
            
            if (!analyticsData || analyticsData.length === 0) {
                return res.json({
                    totalEmails: 0,
                    automatedResponses: 0,
                    averageResponseTime: 0,
                    satisfactionRate: 0,
                    escalatedEmails: 0,
                    aiResponseRate: 0,
                    humanResponseRate: 0,
                    responseSummary: [],
                    emailVolume: [],
                    analyticsData: []
                });
            }

            // Calculate metrics from analytics entries
            const totalEmails = analyticsData.length;
            const automatedResponses = analyticsData.filter(entry => entry.type === 'automated').length;
            const humanResponses = analyticsData.filter(entry => entry.type === 'human').length;
            const escalatedEmails = analyticsData.filter(entry => entry.needsEscalation).length;

            // Calculate response times and satisfaction
            const validResponseTimes = analyticsData
                .filter(entry => typeof entry.responseTime === 'number')
                .map(entry => entry.responseTime);
            
            const averageResponseTime = validResponseTimes.length > 0 
                ? Math.round(validResponseTimes.reduce((a, b) => a + b, 0) / validResponseTimes.length) 
                : 0;

            // Group emails by date for volume chart
            const emailsByDate = analyticsData.reduce((acc, entry) => {
                if (entry && entry.timestamp) {
                    try {
                        const date = new Date(entry.timestamp);
                        if (!isNaN(date.getTime())) {  // Check if date is valid
                            const dateStr = date.toISOString().split('T')[0];
                            acc[dateStr] = (acc[dateStr] || 0) + 1;
                        }
                    } catch (err) {
                        console.warn('Invalid timestamp in analytics entry:', entry);
                    }
                }
                return acc;
            }, {});

            const emailVolume = Object.entries(emailsByDate)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            res.json({
                totalEmails,
                automatedResponses,
                humanResponses,
                averageResponseTime,
                escalatedEmails,
                emailVolume,
                analyticsData // Include the raw data for frontend filtering
            });
        } catch (error) {
            console.error('Error in analytics endpoint:', error);
            res.status(500).json({ 
                error: 'Failed to fetch analytics data',
                details: error.message 
            });
        }
    });

    // Document preview endpoint
    app.get('/api/documents/:s3Key(*)', authenticateToken, async (req, res) => {
        try {
            const s3Key = decodeURIComponent(req.params.s3Key);
            console.log('Attempting to preview document:', { s3Key });
            
            if (!s3Key) {
                return res.status(400).json({ error: 'Document key is required' });
            }

            const database = DatabaseService();
            
            // First get all documents for the user
            const userDocs = await database.getItemsByUserId('user_knowledge_files', req.user.userId);
            console.log('Retrieved user documents:', userDocs);
            
            // Find the specific document
            const document = userDocs.find(doc => doc.s3_key === s3Key);
            console.log('Found document:', document);
            
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Get file from S3
            const getObjectParams = {
                Bucket: S3_BUCKET,
                Key: s3Key
            };

            try {
                const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
                const fileContent = await streamToBuffer(Body);

                // For PDF files, return as base64
                if (document.type === 'application/pdf') {
                    res.json({ content: fileContent.toString('base64'), type: 'pdf' });
                } else {
                    // For text files, return as UTF-8 text
                    res.json({ content: fileContent.toString('utf-8'), type: 'text' });
                }
            } catch (s3Error) {
                console.error('Error fetching file from S3:', s3Error);
                res.status(500).json({ error: 'Failed to fetch file content' });
            }
        } catch (error) {
            console.error('Error in document preview:', error);
            res.status(500).json({ error: 'Failed to get document preview' });
        }
    });

    // Helper function to convert stream to buffer
    async function streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

    // File upload endpoint
    app.post('/api/documents/upload', authenticateToken, async (req, res) => {
        try {
            if (!req.files || !req.files.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const file = req.files.file;
            const { userId } = req.user;
            const timestamp = Date.now();
            const fileId = timestamp.toString();
            const s3Key = `${userId}/${fileId}-${file.name}`;

            // Log file details for debugging
            console.log('File upload details:', {
                name: file.name,
                size: file.size,
                mimetype: file.mimetype,
                md5: file.md5,
                encoding: file.encoding
            });

            // Upload to S3 using v3 SDK
            try {
                await s3Client.send(new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: s3Key,
                    Body: file.data,
                    ContentType: file.mimetype,
                    ContentLength: file.size
                }));
                console.log('File uploaded to S3 successfully');
            } catch (s3Error) {
                console.error('S3 upload error:', s3Error);
                throw s3Error;
            }

            const currentTime = new Date().toISOString();

            // Store metadata in DynamoDB using the correct schema
            const database = DatabaseService();
            const fileMetadata = {
                user_id: userId,         // Primary key (HASH)
                s3_key: s3Key,          // Sort key (RANGE)
                id: fileId,             // Unique identifier
                filename: file.name,
                size: parseInt(file.size, 10),
                type: file.mimetype,    // File MIME type
                uploaded_at: currentTime,
                created_at: currentTime
            };

            console.log('Saving file metadata to DynamoDB:', fileMetadata);
            await database.createItem('user_knowledge_files', fileMetadata);
            console.log('File metadata stored in DynamoDB successfully');

            res.json({ 
                message: 'File uploaded successfully',
                file: {
                    id: fileId,
                    s3_key: s3Key,
                    name: file.name,
                    size: file.size,
                    type: file.mimetype,
                    uploaded_at: currentTime,
                    created_at: currentTime
                }
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = error.name === 'NoSuchBucket' 
                ? 'S3 bucket not found. Please check your configuration.' 
                : 'Failed to upload file: ' + error.message;
            res.status(500).json({ 
                error: errorMessage,
                details: error.message 
            });
        }
    });

    // Get user's documents
    app.get('/api/documents', authenticateToken, async (req, res) => {
        try {
            const database = DatabaseService();
            const documents = await database.getItemsByUserId('user_knowledge_files', req.user.userId);
            res.json({ documents });
        } catch (error) {
            console.error('Error fetching documents:', error);
            res.status(500).json({ error: 'Failed to fetch documents' });
        }
    });

    // Delete document endpoint
    app.delete('/api/documents/:s3Key(*)', authenticateToken, async (req, res) => {
        try {
            const s3Key = decodeURIComponent(req.params.s3Key);
            console.log('Attempting to delete document:', { s3Key });
            
            if (!s3Key) {
                return res.status(400).json({ error: 'Document key is required' });
            }

            const database = DatabaseService();
            
            // First verify the document exists and belongs to the user
            const document = await database.getItem('user_knowledge_files', {
                user_id: req.user.userId,
                s3_key: s3Key
            });

            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Delete from S3
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: s3Key
                }));
                console.log('File deleted from S3 successfully');
            } catch (s3Error) {
                console.error('S3 delete error:', s3Error);
                throw s3Error;
            }

            // Delete from DynamoDB
            await database.deleteItem('user_knowledge_files', {
                user_id: req.user.userId,
                s3_key: s3Key
            });
            console.log('File metadata deleted from DynamoDB successfully');

            res.json({ message: 'Document deleted successfully' });
        } catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({ error: 'Failed to delete document' });
        }
    });

    // Update download endpoint
    app.get('/api/documents/:s3Key(*)/download', authenticateToken, async (req, res) => {
        try {
            console.log('Download request received for:', req.params.s3Key);
            const database = DatabaseService();
            const s3Key = decodeURIComponent(req.params.s3Key);
            
            // Get document metadata from DynamoDB using the correct key structure
            const document = await database.getItem('user_knowledge_files', {
                user_id: req.user.userId,
                s3_key: s3Key
            });
            
            if (!document) {
                console.log('Document not found:', s3Key);
                return res.status(404).json({ error: 'Document not found' });
            }

            console.log('Fetching from S3:', { bucket: S3_BUCKET, key: s3Key });
            
            // Get the file from S3
            const getObjectParams = {
                Bucket: S3_BUCKET,
                Key: s3Key
            };

            try {
                const { Body, ContentType } = await s3Client.send(new GetObjectCommand(getObjectParams));
                
                // Set response headers
                res.setHeader('Content-Type', ContentType || 'application/octet-stream');
                res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
                
                // Stream the file directly to the response
                Body.pipe(res);
                
                // Handle errors during streaming
                Body.on('error', (error) => {
                    console.error('Error streaming file:', error);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Error downloading file' });
                    }
                });
                
                // Clean up after streaming is complete
                Body.on('end', () => {
                    console.log('File download completed successfully');
                });
            } catch (s3Error) {
                console.error('Error downloading file from S3:', s3Error);
                res.status(500).json({ error: 'Error downloading file from S3' });
            }
        } catch (error) {
            console.error('Error in document download:', error);
            res.status(500).json({ error: 'Error in document download' });
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
