import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AnalyticsCharts = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [chartData, setChartData] = useState(null);

    // Chart refs
    const volumeChartRef = useRef(null);
    const responseTimeChartRef = useRef(null);
    const sentimentChartRef = useRef(null);
    const languageChartRef = useRef(null);

    // Chart instance refs
    const volumeChartInstance = useRef(null);
    const responseTimeChartInstance = useRef(null);
    const sentimentChartInstance = useRef(null);
    const languageChartInstance = useRef(null);

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
        },
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedPeriod]);

    const fetchAnalyticsData = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/analytics');
            console.log('Analytics data:', response.data);
            initializeCharts(response.data);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const initializeCharts = (data) => {
        // Destroy existing charts
        if (volumeChartInstance.current) volumeChartInstance.current.destroy();
        if (responseTimeChartInstance.current) responseTimeChartInstance.current.destroy();
        if (sentimentChartInstance.current) sentimentChartInstance.current.destroy();
        if (languageChartInstance.current) languageChartInstance.current.destroy();

        // Email Volume Chart
        const volumeCtx = volumeChartRef.current?.getContext('2d');
        if (volumeCtx) {
            volumeChartInstance.current = new ChartJS(volumeCtx, {
                type: 'bar',
                data: {
                    labels: data.emailVolume?.map(entry => entry.date) || [],
                    datasets: [{
                        label: 'Email Volume',
                        data: data.emailVolume?.map(entry => entry.count) || [],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 1
                    }]
                },
                options: commonOptions
            });
        }

        // Response Time Chart
        const responseTimeCtx = responseTimeChartRef.current?.getContext('2d');
        if (responseTimeCtx) {
            responseTimeChartInstance.current = new ChartJS(responseTimeCtx, {
                type: 'line',
                data: {
                    labels: ['Average Response Time'],
                    datasets: [{
                        label: 'Minutes',
                        data: [data.averageResponseTime || 0],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1
                    }]
                },
                options: commonOptions
            });
        }

        // Sentiment Chart
        const sentimentCtx = sentimentChartRef.current?.getContext('2d');
        if (sentimentCtx) {
            sentimentChartInstance.current = new ChartJS(sentimentCtx, {
                type: 'pie',
                data: {
                    labels: ['Satisfied', 'Neutral', 'Unsatisfied'],
                    datasets: [{
                        data: [
                            data.satisfactionRate || 0,
                            100 - (data.satisfactionRate || 0),
                            0
                        ],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(255, 99, 132, 0.5)'
                        ],
                        borderColor: [
                            'rgb(75, 192, 192)',
                            'rgb(255, 206, 86)',
                            'rgb(255, 99, 132)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        // Language Chart
        const languageCtx = languageChartRef.current?.getContext('2d');
        if (languageCtx) {
            languageChartInstance.current = new ChartJS(languageCtx, {
                type: 'pie',
                data: {
                    labels: ['English', 'Spanish', 'French', 'Other'],
                    datasets: [{
                        data: [80, 10, 5, 5], // Replace with actual language data when available
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(255, 206, 86, 0.5)'
                        ],
                        borderColor: [
                            'rgb(54, 162, 235)',
                            'rgb(255, 99, 132)',
                            'rgb(75, 192, 192)',
                            'rgb(255, 206, 86)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
    };

    // Cleanup function
    useEffect(() => {
        return () => {
            if (volumeChartInstance.current) volumeChartInstance.current.destroy();
            if (responseTimeChartInstance.current) responseTimeChartInstance.current.destroy();
            if (sentimentChartInstance.current) sentimentChartInstance.current.destroy();
            if (languageChartInstance.current) languageChartInstance.current.destroy();
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-6 p-6">
            <div className="bg-white rounded-lg shadow p-4 h-[300px]">
                <h3 className="text-lg font-semibold mb-4">Email Volume</h3>
                <canvas ref={volumeChartRef}></canvas>
            </div>
            <div className="bg-white rounded-lg shadow p-4 h-[300px]">
                <h3 className="text-lg font-semibold mb-4">Response Time</h3>
                <canvas ref={responseTimeChartRef}></canvas>
            </div>
            <div className="bg-white rounded-lg shadow p-4 h-[300px]">
                <h3 className="text-lg font-semibold mb-4">Satisfaction Rate</h3>
                <canvas ref={sentimentChartRef}></canvas>
            </div>
            <div className="bg-white rounded-lg shadow p-4 h-[300px]">
                <h3 className="text-lg font-semibold mb-4">Languages</h3>
                <canvas ref={languageChartRef}></canvas>
            </div>
        </div>
    );
};

export default AnalyticsCharts;