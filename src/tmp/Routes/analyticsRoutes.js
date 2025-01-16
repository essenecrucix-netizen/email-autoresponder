const express = require('express');
const DatabaseService = require('../services/database/DatabaseService');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token is missing.' });
    }

    const SECRET_KEY = process.env.JWT_SECRET || 'your-very-secure-secret';
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
}

const router = express.Router();

// Get analytics by user
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Get user ID from query parameters or token
        const userId = req.query.userId || req.user.userId || process.env.USER_ID;
        console.log('Fetching analytics for user:', userId);

        const database = DatabaseService();
        const analyticsData = await database.getAnalyticsByUser(userId);

        if (!analyticsData || analyticsData.length === 0) {
            return res.status(200).json({
                emails: [],
                totalEmails: 0,
                automatedResponses: 0,
                escalatedResponses: 0,
                averageResponseTime: 0,
                satisfactionRate: 0,
                dateLabels: [],
                emailCounts: [],
                responseTimes: [],
                sentimentData: { positive: 0, neutral: 0, negative: 0 }
            });
        }

        // Process analytics data
        const emailsByDate = new Map();
        let totalResponseTime = 0;
        let escalatedCount = 0;
        const sentiments = { positive: 0, neutral: 0, negative: 0 };

        analyticsData.forEach(entry => {
            const date = new Date(entry.timestamp).toISOString().split('T')[0];
            emailsByDate.set(date, (emailsByDate.get(date) || 0) + 1);
            
            if (entry.responseTime) totalResponseTime += entry.responseTime;
            if (entry.needsEscalation) escalatedCount++;
            if (entry.satisfaction) sentiments[entry.satisfaction]++;
        });

        // Sort dates and prepare data for charts
        const sortedDates = Array.from(emailsByDate.keys()).sort();
        const emailCounts = sortedDates.map(date => emailsByDate.get(date));

        const averageResponseTime = analyticsData.length > 0 
            ? Math.round(totalResponseTime / analyticsData.length) 
            : 0;

        res.status(200).json({
            emails: analyticsData,
            totalEmails: analyticsData.length,
            automatedResponses: analyticsData.filter(e => e.type === 'automated').length,
            escalatedResponses: escalatedCount,
            averageResponseTime,
            satisfactionRate: Math.round((sentiments.positive / analyticsData.length) * 100) || 0,
            dateLabels: sortedDates,
            emailCounts,
            responseTimes: analyticsData.map(e => e.responseTime || 0),
            sentimentData: sentiments
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data.' });
    }
});

module.exports = router;


