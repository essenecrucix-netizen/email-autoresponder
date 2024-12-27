function Analytics() {
    const [analytics, setAnalytics] = React.useState({
        totalEmails: 0,
        averageResponseTime: 0,
        satisfactionRate: 0,
        responseDistribution: { automated: 0, escalated: 0 }
    });

    async function fetchAnalytics() {
        try {
            const trickleObjAPI = new TrickleObjectAPI();
            const emails = await trickleObjAPI.listObjects('email', 1000, true);
            const responses = await trickleObjAPI.listObjects('email-response', 1000, true);

            const stats = calculateStats(emails.items, responses.items);
            setAnalytics(stats);
        } catch (error) {
            reportError(error);
        }
    }

    function calculateStats(emails, responses) {
        const total = emails.length;
        const automated = responses.length;
        const escalated = emails.filter(e => e.objectData.needsEscalation).length;

        return {
            totalEmails: total,
            averageResponseTime: calculateAverageResponseTime(emails, responses),
            satisfactionRate: 95,
            responseDistribution: { automated, escalated }
        };
    }

    function calculateAverageResponseTime(emails, responses) {
        if (responses.length === 0) return 0;
        
        const totalTime = responses.reduce((acc, response) => {
            const email = emails.find(e => e.objectData.sender === response.objectData.recipient);
            if (!email) return acc;
            return acc + (new Date(response.createdAt) - new Date(email.createdAt));
        }, 0);

        return Math.round(totalTime / responses.length / 1000); // Convert to seconds
    }

    React.useEffect(() => {
        fetchAnalytics();
    }, []);

    return (
        <div className="analytics-container" data-name="analytics-container">
            <h2 className="text-xl font-semibold mb-4" data-name="analytics-title">Analytics Dashboard</h2>
            <div className="grid grid-cols-2 gap-4" data-name="analytics-grid">
                <div className="card" data-name="response-stats">
                    <h3 className="text-lg font-medium mb-2">Response Statistics</h3>
                    <div className="space-y-2">
                        <p>Total Emails: {analytics.totalEmails}</p>
                        <p>Average Response Time: {analytics.averageResponseTime}s</p>
                        <p>Satisfaction Rate: {analytics.satisfactionRate}%</p>
                    </div>
                </div>
                <div className="card" data-name="distribution-stats">
                    <h3 className="text-lg font-medium mb-2">Response Distribution</h3>
                    <div className="space-y-2">
                        <p>Automated Responses: {analytics.responseDistribution.automated}</p>
                        <p>Escalated to Human: {analytics.responseDistribution.escalated}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
