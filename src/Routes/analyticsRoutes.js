const express = require('express');
const DatabaseService = require('../services/database/DatabaseService');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Get analytics data
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
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
