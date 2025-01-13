require('dotenv').config();
const EmailService = require('./email/EmailService');

async function startEmailMonitor() {
    console.log('Starting Email Monitor Service...');
    
    try {
        const emailService = EmailService();
        
        // Function to start monitoring
        async function monitor() {
            try {
                console.log('Initializing email monitoring...');
                await emailService.monitorEmails();
            } catch (error) {
                console.error('Email monitoring error:', error);
                console.log('Attempting to restart monitoring in 30 seconds...');
                // Wait 30 seconds before trying to reconnect
                setTimeout(monitor, 30000);
            }
        }

        // Start monitoring
        await monitor();
        
        // Handle process termination
        process.on('SIGTERM', () => {
            console.log('Received SIGTERM. Shutting down email monitor gracefully...');
            process.exit(0);
        });

        process.on('SIGINT', () => {
            console.log('Received SIGINT. Shutting down email monitor gracefully...');
            process.exit(0);
        });

    } catch (error) {
        console.error('Failed to start email monitor:', error);
        process.exit(1);
    }
}

// Start the service
startEmailMonitor().catch(error => {
    console.error('Fatal error in email monitor:', error);
    process.exit(1);
}); 