const EmailService = require('./services/email/EmailService');

(async () => {
    const emailService = EmailService();

    try {
        console.log("Starting email monitoring...");
        await emailService.monitorEmails(); // Ensure this is non-blocking for testing purposes
    } catch (error) {
        console.error("Error in monitorEmails:", error);
    }
})();
