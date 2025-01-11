const express = require('express');
const DatabaseService = require('../services/database/DatabaseService');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Received Token:', token); // Log the token for debugging

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'Access token is missing.' });
    }

    const SECRET_KEY = process.env.JWT_SECRET || 'your-very-secure-secret';
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid token.' });
        }
        console.log('Token verified successfully:', user);
        req.user = user;
        next();
    });
}

const router = express.Router();

// Get analytics by user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from the token
        const database = DatabaseService();
        const emails = await database.getAnalyticsByUser(userId);
        const responses = await database.getResponsesByUser(userId);

        const totalEmails = emails.length;
        const automatedResponses = responses.filter(r => r.type === 'automated').length;
        const escalatedResponses = emails.filter(e => e.needsEscalation).length;
        const averageResponseTime = responses.length > 0
            ? Math.round(responses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / responses.length)
            : 0;

        const satisfactionRate = responses.length > 0
            ? Math.round((responses.filter(r => r.satisfaction === 'positive').length / responses.length) * 100)
            : 0;

        res.status(200).json({
            emails,
            responses,
            totalEmails,
            automatedResponses,
            escalatedResponses,
            averageResponseTime,
            satisfactionRate,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to fetch analytics data.' });
    }
});

module.exports = router;


