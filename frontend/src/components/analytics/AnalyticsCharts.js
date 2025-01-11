import React, { useState, useEffect, useRef } from 'react';
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    PieController,
    ArcElement,
    BarController,
    BarElement,
    Legend,
    Tooltip,
} from 'chart.js';

// Explicitly register Chart.js components
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    PieController,
    ArcElement,
    BarController,
    BarElement,
    Legend,
    Tooltip
);

function AnalyticsCharts() {
    const [chartData, setChartData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [isLoading, setIsLoading] = useState(true);

    // Refs for canvas elements
    const volumeChartRef = useRef(null);
    const responseTimeChartRef = useRef(null);
    const sentimentChartRef = useRef(null);
    const languageChartRef = useRef(null);

    // Chart instances
    let volumeChart, responseTimeChart, sentimentChart, languageChart;

    // Temporary test data
    async function fetchAnalyticsData() {
        return {
            dateLabels: ['2025-01-01', '2025-01-02', '2025-01-03'],
            emailCounts: [10, 15, 20],
            responseTimes: [30, 45, 60],
            sentimentData: { positive: 5, neutral: 3, negative: 2 },
            languageData: { English: 10, Spanish: 5 },
        };
    }

    async function initializeCharts(data) {
        // Destroy existing chart instances to prevent duplicate rendering
        if (volumeChart) volumeChart.destroy();
        if (responseTimeChart) responseTimeChart.destroy();
        if (sentimentChart) sentimentChart.destroy();
        if (languageChart) languageChart.destroy();

        if (volumeChartRef.current) {
            volumeChart = new Chart(volumeChartRef.current, {
                type: 'line',
                data: {
                    labels: data.dateLabels,
                    datasets: [
                        {
                            label: 'Email Volume',
                            data: data.emailCounts,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.4,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { enabled: true },
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Date' },
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Email Count' },
                        },
                    },
                },
            });
        }

        if (responseTimeChartRef.current) {
            responseTimeChart = new Chart(responseTimeChartRef.current, {
                type: 'line',
                data: {
                    labels: data.dateLabels,
                    datasets: [
                        {
                            label: 'Response Time (seconds)',
                            data: data.responseTimes,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.4,
                        },
                    ],
                },
            });
        }

        if (sentimentChartRef.current) {
            sentimentChart = new Chart(sentimentChartRef.current, {
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
            languageChart = new Chart(languageChartRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(data.languageData),
                    datasets: [
                        {
                            label: 'Emails by Language',
                            data: Object.values(data.languageData),
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
                const data = await fetchAnalyticsData();
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
                        <div className="canvas-container">
                            <canvas ref={volumeChartRef}></canvas>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Response Times</h3>
                        <div className="canvas-container">
                            <canvas ref={responseTimeChartRef}></canvas>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Sentiment Distribution</h3>
                        <div className="canvas-container">
                            <canvas ref={sentimentChartRef}></canvas>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-medium mb-2">Language Distribution</h3>
                        <div className="canvas-container">
                            <canvas ref={languageChartRef}></canvas>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnalyticsCharts;
