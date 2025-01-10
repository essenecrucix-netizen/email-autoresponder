import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

function AnalyticsCharts() {
    const [chartData, setChartData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [isLoading, setIsLoading] = useState(true);

    // Refs for canvas elements
    const volumeChartRef = useRef(null);
    const responseTimeChartRef = useRef(null);
    const sentimentChartRef = useRef(null);
    const languageChartRef = useRef(null);

    // Temporary test data
    async function fetchAnalyticsData() {
        console.log('Fetching analytics data for testing...');
        return {
            dateLabels: ['2025-01-01', '2025-01-02', '2025-01-03'],
            emailCounts: [10, 15, 20],
            responseTimes: [30, 45, 60],
            sentimentData: { positive: 5, neutral: 3, negative: 2 },
            languageData: { English: 10, Spanish: 5 },
        };
    }

    async function initializeCharts(data) {
        console.log('Initializing charts with data:', data); // Debugging

        if (volumeChartRef.current) {
            console.log('Volume chart canvas:', volumeChartRef.current);
            new Chart(volumeChartRef.current, {
                type: 'line',
                data: {
                    labels: data.dateLabels,
                    datasets: [
                        {
                            label: 'Email Volume',
                            data: data.emailCounts,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        }

        if (responseTimeChartRef.current) {
            console.log('Response Time chart canvas:', responseTimeChartRef.current);
            new Chart(responseTimeChartRef.current, {
                type: 'line',
                data: {
                    labels: data.dateLabels,
                    datasets: [
                        {
                            label: 'Average Response Time (seconds)',
                            data: data.responseTimes,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1,
                        },
                    ],
                },
            });
        }

        if (sentimentChartRef.current) {
            console.log('Sentiment chart canvas:', sentimentChartRef.current);
            new Chart(sentimentChartRef.current, {
                type: 'pie',
                data: {
                    labels: ['Positive', 'Neutral', 'Negative'],
                    datasets: [
                        {
                            data: [
                                data.sentimentData.positive,
                                data.sentimentData.neutral,
                                data.sentimentData.negative,
                            ],
                            backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(255, 99, 132)'],
                        },
                    ],
                },
            });
        }

        if (languageChartRef.current) {
            console.log('Language Distribution chart canvas:', languageChartRef.current);
            const languageLabels = Object.keys(data.languageData);
            new Chart(languageChartRef.current, {
                type: 'bar',
                data: {
                    labels: languageLabels,
                    datasets: [
                        {
                            label: 'Emails by Language',
                            data: languageLabels.map((lang) => data.languageData[lang]),
                            backgroundColor: 'rgb(54, 162, 235)',
                        },
                    ],
                },
            });
        }
    }

    useEffect(() => {
        async function loadCharts() {
            try {
                setIsLoading(true);
                const data = await fetchAnalyticsData(); // Use temporary test data
                setChartData(data);
                await initializeCharts(data);
            } catch (error) {
                console.error('Error loading charts:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadCharts();
    }, [selectedPeriod]);

    return (
        <div className="analytics-charts-container">
            <div className="mb-4">
                <select
                    id="analytics-period"
                    name="analyticsPeriod"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Email Volume</h3>
                        <canvas ref={volumeChartRef} width="400" height="300"></canvas>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Response Times</h3>
                        <canvas ref={responseTimeChartRef} width="400" height="300"></canvas>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Sentiment Distribution</h3>
                        <canvas ref={sentimentChartRef} width="400" height="300"></canvas>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Language Distribution</h3>
                        <canvas ref={languageChartRef} width="400" height="300"></canvas>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnalyticsCharts;
