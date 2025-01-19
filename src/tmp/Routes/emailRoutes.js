const express = require('express');
const EmailService = require('../../services/email/EmailService');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware for token authentication

const router = express.Router();
const emailService = EmailService(); // Initialize EmailService

// Start monitoring emails
router.post('/monitor', authenticateToken, async (req, res) => {
    try {
        await emailService.monitorEmails();
        res.status(200).json({ message: 'Email monitoring started successfully.' });
    } catch (error) {
        console.error('Error starting email monitoring:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to start email monitoring.' });
    }
});

// Send a reply to an email
router.post('/reply', authenticateToken, async (req, res) => {
    const { to, subject, content } = req.body;

    if (!to || !subject || !content) {
        return res.status(400).json({ error: 'To, subject, and content are required.' });
    }

    try {
        await emailService.sendReply(to, subject, content);
        res.status(200).json({ message: 'Reply sent successfully.' });
    } catch (error) {
        console.error('Error sending email reply:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to send reply.' });
    }
});

// Send an escalation notification
router.post('/escalate', authenticateToken, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email data is required for escalation.' });
    }

    try {
        await emailService.sendEscalationNotification(email);
        res.status(200).json({ message: 'Escalation notification sent successfully.' });
    } catch (error) {
        console.error('Error sending escalation notification:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to send escalation notification.' });
    }
});

module.exports = router;
