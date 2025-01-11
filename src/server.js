const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// Debug: Log the directory from which modules are being loaded
console.log('Current working directory:', __dirname);

try {
    console.log('Loading authRoutes...');
    const authRoutes = require('./Routes/authRoutes'); // Modularized routes for auth
    console.log('authRoutes loaded successfully!');
    console.log('Loading analyticsRoutes...');
    const analyticsRoutes = require('./Routes/analyticsRoutes'); // Modularized routes for analytics
    console.log('analyticsRoutes loaded successfully!');

    // Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());

    // Serve static files
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    // Modularized routes
    app.use('/api/auth', authRoutes);
    app.use('/api/analytics', analyticsRoutes);

    // Fallback for React
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });

    // Status endpoint
    app.get('/api/status', (req, res) => {
        res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

} catch (error) {
    console.error('Error during server setup:', error.message);
    console.error(error.stack);
}

