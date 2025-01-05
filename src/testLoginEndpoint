const dbService = require('./services/database/DatabaseService')();

(async () => {
    try {
        const user = await dbService.getItem('users', { email: 'your-email@example.com' });
        console.log('User:', user);
    } catch (error) {
        console.error('Error fetching user:', error.message);
    }
})();
