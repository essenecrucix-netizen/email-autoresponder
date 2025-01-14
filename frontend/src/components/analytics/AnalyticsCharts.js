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
import axios from '../../utils/axios';

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

    // Refs for chart instances
    const volumeChartInstance = useRef(null);
    const responseTimeChartInstance = useRef(null);
    const sentimentChartInstance = useRef(null);
    const languageChartInstance = useRef(null);

    // Fetch analytics data
    async function fetchAnalyticsData() {
        try {
            const response = await axios.get('/api/analytics');
            const data = response.data;
            console.log('Analytics data:', data);  // Debug log

            // Process email volume data
            const emailVolume = data.emailVolume || [];
            const dateLabels = emailVolume.map(item => item.date);
            const emailCounts = emailVolume.map(item => item.count);

            // Process response summary data
            const responseSummary = data.responseSummary || [];
            const sentimentData = {
                positive: Math.round(parseFloat(data.satisfactionRate || '0')),
                neutral: Math.round((100 - parseFloat(data.satisfactionRate || '0')) / 2),
                negative: Math.round((100 - parseFloat(data.satisfactionRate || '0')) / 2)
            };

            // Language data (simplified since we don't have this in the current schema)
            const languageData = {
                'English': data.totalEmails || 0
            };

            return {
                dateLabels,
                emailCounts,
                responseTimes: [parseFloat(data.averageResponseTime || '0')],
                sentimentData,
                languageData
            };
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            throw error;
        }
    }

    async function initializeCharts(data) {
        // Destroy existing chart instances
        if (volumeChartInstance.current) volumeChartInstance.current.destroy();
        if (responseTimeChartInstance.current) responseTimeChartInstance.current.destroy();
        if (sentimentChartInstance.current) sentimentChartInstance.current.destroy();
        if (languageChartInstance.current) languageChartInstance.current.destroy();

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
        };

        if (volumeChartRef.current) {
            const ctx = volumeChartRef.current.getContext('2d');
            volumeChartInstance.current = new Chart(ctx, {
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
                            fill: true
                        },
                    ],
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { enabled: true },
                    },
                    scales: {
                        x: { 
                            title: { display: true, text: 'Date' },
                            grid: { display: false }
                        },
                        y: { 
                            beginAtZero: true, 
                            title: { display: true, text: 'Email Count' },
                            grid: { color: 'rgba(0,0,0,0.1)' }
                        },
                    },
                },
            });
        }

        if (responseTimeChartRef.current) {
            const ctx = responseTimeChartRef.current.getContext('2d');
            responseTimeChartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Average Response Time'],
                    datasets: [
                        {
                            label: 'Minutes',
                            data: data.responseTimes,
                            backgroundColor: 'rgb(255, 99, 132)',
                            borderColor: 'rgb(255, 99, 132)',
                        },
                    ],
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        legend: { display: false },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Minutes' }
                        }
                    }
                },
            });
        }

        if (sentimentChartRef.current) {
            const ctx = sentimentChartRef.current.getContext('2d');
            sentimentChartInstance.current = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Satisfied', 'Neutral', 'Unsatisfied'],
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
                options: {
                    ...commonOptions,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                },
            });
        }

        if (languageChartRef.current) {
            const ctx = languageChartRef.current.getContext('2d');
            const languages = Object.keys(data.languageData);
            const counts = Object.values(data.languageData);
            
            languageChartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: languages,
                    datasets: [
                        {
                            label: 'Emails by Language',
                            data: counts,
                            backgroundColor: 'rgb(54, 162, 235)',
                        },
                    ],
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Count' }
                        }
                    }
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

        // Cleanup function to destroy charts when component unmounts
        return () => {
            if (volumeChartInstance.current) volumeChartInstance.current.destroy();
            if (responseTimeChartInstance.current) responseTimeChartInstance.current.destroy();
            if (sentimentChartInstance.current) sentimentChartInstance.current.destroy();
            if (languageChartInstance.current) languageChartInstance.current.destroy();
        };
    }, [selectedPeriod]);

    if (isLoading) {
        return <div className="text-center py-4">Loading charts...</div>;
    }

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="chart-container" style={{ height: '300px' }}>
                    <h3 className="text-lg font-semibold mb-2">Email Volume</h3>
                    <canvas ref={volumeChartRef}></canvas>
                </div>
                <div className="chart-container" style={{ height: '300px' }}>
                    <h3 className="text-lg font-semibold mb-2">Response Time</h3>
                    <canvas ref={responseTimeChartRef}></canvas>
                </div>
                <div className="chart-container" style={{ height: '300px' }}>
                    <h3 className="text-lg font-semibold mb-2">Satisfaction Distribution</h3>
                    <canvas ref={sentimentChartRef}></canvas>
                </div>
                <div className="chart-container" style={{ height: '300px' }}>
                    <h3 className="text-lg font-semibold mb-2">Emails by Language</h3>
                    <canvas ref={languageChartRef}></canvas>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsCharts;