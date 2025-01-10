import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import axios from 'axios';

function AnalyticsCharts() {
    const [chartData, setChartData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [isLoading, setIsLoading] = useState(true);

    // Refs for canvas elements
    const volumeChartRef = useRef(null);
    const responseTimeChartRef = useRef(null);
    const sentimentChartRef = useRef(null);
    const languageChartRef = useRef(null);

    async function fetchAnalyticsData(period) {
        try {
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
                default:
                    throw new Error('Invalid period selected');
            }

            const response = await axios.get('/api/analytics', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            });

            if (response.status === 200) {
                return processAnalyticsData(response.data.emails, response.data.responses, startDate, endDate);
            } else {
                throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error.message);
            throw new Error('Failed to fetch analytics data.');
        }
    }

    function processAnalyticsData(emails = [], responses = [], startDate, endDate) {
        const dateLabels = [];
        const emailCounts = [];
        const responseTimes = [];
        const sentimentData = { positive: 0, neutral: 0, negative: 0 };
        const languageData = {};

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dateLabels.push(currentDate.toISOString().split('T')[0]);
            emailCounts.push(0);
            responseTimes.push(0);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        emails.forEach((email) => {
            const emailDate = new Date(email.createdAt).toISOString().split('T')[0];
            const dateIndex = dateLabels.indexOf(emailDate);

            if (dateIndex !== -1) {
                emailCounts[dateIndex]++;
                sentimentData[email.sentiment] = (sentimentData[email.sentiment] || 0) + 1;

                const language = email.language || 'unknown';
                languageData[language] = (languageData[language] || 0) + 1;
            }
        });

        responses.forEach((response) => {
            const responseDate = new Date(response.createdAt).toISOString().split('T')[0];
            const dateIndex = dateLabels.indexOf(responseDate);

            if (dateIndex !== -1) {
                const email = emails.find((e) => e.id === response.emailId);
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
            languageData,
        };
    }

    async function initializeCharts(data) {
        if (volumeChartRef.current) {
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
                const data = await fetchAnalyticsData(selectedPeriod);
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
                        <canvas ref={volumeChartRef}></canvas>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Response Times</h3>
                        <canvas ref={responseTimeChartRef}></canvas>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Sentiment Distribution</h3>
                        <canvas ref={sentimentChartRef}></canvas>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Language Distribution</h3>
                        <canvas ref={languageChartRef}></canvas>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnalyticsCharts;
