const DatabaseService = require('./services/database/DatabaseService');

(async () => {
    const db = DatabaseService();

    // Test createItem
    try {
        await db.createItem('LastProcessedUID', { emailUser: 'test@example.com', uid: 123 });
        console.log("createItem passed.");
    } catch (error) {
        console.error("Error in createItem:", error);
    }

    // Test getItem
    try {
        const item = await db.getItem('LastProcessedUID', { emailUser: 'test@example.com' });
        console.log("getItem result:", item);
    } catch (error) {
        console.error("Error in getItem:", error);
    }

    // Test updateLastProcessedUID
    try {
        await db.updateLastProcessedUID('test@example.com', 456);
        console.log("updateLastProcessedUID passed.");
    } catch (error) {
        console.error("Error in updateLastProcessedUID:", error);
    }
})();
