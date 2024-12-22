function AnalyticsCharts() {
    const [chartData, setChartData] = React.useState(null);
    const [selectedPeriod, setSelectedPeriod] = React.useState('week');
    const [isLoading, setIsLoading] = React.useState(true);

    async function fetchAnalyticsData(period) {
        try {
            const trickleObjAPI = new TrickleObjectAPI();
            const endDate = new Date();
            const startDate = new Date();
            
            switch (period) {
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
            }

            const emails = await trickleObjAPI.listObjects('email', 1000, true);
            const responses = await trickleObjAPI.listObjects('email-response', 1000, true);
            
            return processAnalyticsData(emails.items, responses.items, startDate, endDate);
        } catch (error) {
            reportError(error);
            throw new Error('Failed to fetch analytics data');
        }
    }

    function processAnalyticsData(emails, responses, startDate, endDate) {
        const dateLabels = [];
        const emailCounts = [];
        const responseTimes = [];
        const sentimentData = { positive: 0, neutral: 0, negative: 0 };
        const languageData = {};

        // Generate date labels
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dateLabels.push(currentDate.toISOString().split('T')[0]);
            emailCounts.push(0);
            responseTimes.push(0);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Process emails
        emails.forEach(email => {
            const emailDate = new Date(email.createdAt).toISOString().split('T')[0];
            const dateIndex = dateLabels.indexOf(emailDate);
            
            if (dateIndex !== -1) {
                emailCounts[dateIndex]++;
                sentimentData[email.objectData.sentiment]++;
                
                const language = email.objectData.language || 'unknown';
                languageData[language] = (languageData[language] || 0) + 1;
            }
        });

        // Process response times
        responses.forEach(response => {
            const responseDate = new Date(response.createdAt).toISOString().split('T')[0];
            const dateIndex = dateLabels.indexOf(responseDate);
            
            if (dateIndex !== -1) {
                const email = emails.find(e => e.objectId === response.objectData.emailId);
                if (email) {
                    const responseTime = new Date(response.createdAt) - new Date(email.createdAt);
                    responseTimes[dateIndex] = responseTime / 1000; // Convert to seconds
                }
            }
        });

        return {
            dateLabels,
            emailCounts,
            responseTimes,
            sentimentData,
            languageData
        };
    }

    async function initializeCharts(data) {
        // Volume Chart
        new Chart(document.getElementById('volumeChart'), {
            type: 'line',
            data: {
                labels: data.dateLabels,
                datasets: [{
                    label: 'Email Volume',
                    data: data.emailCounts,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Response Time Chart
        new Chart(document.getElementById('responseTimeChart'), {
            type: 'line',
            data: {
                labels: data.dateLabels,
                datasets: [{
                    label: 'Average Response Time (seconds)',
                    data: data.responseTimes,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            }
        });

        // Sentiment Chart
        new Chart(document.getElementById('sentimentChart'), {
            type: 'pie',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [
                        data.sentimentData.positive,
                        data.sentimentData.neutral,
                        data.sentimentData.negative
                    ],
                    backgroundColor: [
                        'rgb(75, 192, 192)',
                        'rgb(255, 205, 86)',
                        'rgb(255, 99, 132)'
                    ]
                }]
            }
        });

        // Language Distribution Chart
        const languageLabels = Object.keys(data.languageData);
        new Chart(document.getElementById('languageChart'), {
            type: 'bar',
            data: {
                labels: languageLabels,
                datasets: [{
                    label: 'Emails by Language',
                    data: languageLabels.map(lang => data.languageData[lang]),
                    backgroundColor: 'rgb(54, 162, 235)'
                }]
            }
        });
    }

    React.useEffect(() => {
        async function loadCharts() {
            try {
                setIsLoading(true);
                const data = await fetchAnalyticsData(selectedPeriod);
                setChartData(data);
                await initializeCharts(data);
            } catch (error) {
                reportError(error);
            } finally {
                setIsLoading(false);
            }
        }

        loadCharts();
    }, [selectedPeriod]);

    return (
        <div className="analytics-charts-container" data-name="analytics-charts">
            <div className="mb-4">
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                    data-name="period-selector"
                >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64" data-name="loading-indicator">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4" data-name="charts-grid">
                    <div className="card" data-name="volume-chart-container">
                        <h3 className="text-lg font-medium mb-2">Email Volume</h3>
                        <canvas id="volumeChart"></canvas>
                    </div>
                    <div className="card" data-name="response-time-chart-container">
                        <h3 className="text-lg font-medium mb-2">Response Times</h3>
                        <canvas id="responseTimeChart"></canvas>
                    </div>
                    <div className="card" data-name="sentiment-chart-container">
                        <h3 className="text-lg font-medium mb-2">Sentiment Distribution</h3>
                        <canvas id="sentimentChart"></canvas>
                    </div>
                    <div className="card" data-name="language-chart-container">
                        <h3 className="text-lg font-medium mb-2">Language Distribution</h3>
                        <canvas id="languageChart"></canvas>
                    </div>
                </div>
            )}
        </div>
    );
}