const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes'); // Modularized routes for auth
const analyticsRoutes = require('./routes/analyticsRoutes'); // Modularized routes for analytics

dotenv.config();
const app = express();

// Middleware (must come first)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Modularized routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// React routing fallback (must come last)
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
