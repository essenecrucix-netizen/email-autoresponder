require('dotenv').config();
const EmailService = require('./EmailService');

async function startEmailMonitor() {
    console.log('Starting Email Monitor Service...');
    
    try {
        const emailService = EmailService();
        
        // Function to start monitoring
        await emailService.startMonitoring();
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('Shutting down email monitor...');
            await emailService.cleanup();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Error in email monitor:', error);
        process.exit(1);
    }
}

// Start the monitor
startEmailMonitor(); 