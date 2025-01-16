import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Analytics() {
    const [metrics, setMetrics] = useState({
        totalEmails: 0,
        automatedResponses: 0,
        humanResponses: 0,
        averageResponseTime: 0,
        escalatedEmails: 0,
        emailVolume: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log('Analytics API Response:', response.data);
                
                // Filter to only include entries with actual responses
                const actualResponses = response.data.analyticsData?.filter(entry => entry.response) || [];
                const automatedActualResponses = actualResponses.filter(entry => entry.type === 'automated').length;
                const humanActualResponses = actualResponses.filter(entry => entry.type === 'human').length;
                
                setMetrics({
                    ...response.data,
                    automatedResponses: automatedActualResponses,
                    humanResponses: humanActualResponses,
                    totalResponses: actualResponses.length
                });
                
                setLoading(false);
            } catch (err) {
                console.error('Analytics API Error:', err);
                setError('Failed to fetch analytics data');
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-6">Loading analytics...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    // Calculate total responses (automated + human)
    const totalResponses = metrics.automatedResponses + metrics.humanResponses;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-gray-500">Monitor your email automation performance for business-related inquiries</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Response Time</h3>
                    <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-semibold">{(metrics.averageResponseTime || 0).toFixed(1)}s</p>
                        <span className="ml-2 text-sm text-red-500">-12%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">vs last week</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">AI Response Rate</h3>
                    <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-semibold">
                            {totalResponses > 0 ? ((metrics.automatedResponses / totalResponses) * 100).toFixed(0) : 0}%
                        </p>
                        <span className="ml-2 text-sm text-green-500">+3%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">of business inquiries</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">User Satisfaction</h3>
                    <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-semibold">4.8/5</p>
                        <span className="ml-2 text-sm text-green-500">+0.2</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">based on feedback</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Responses</h3>
                    <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-semibold">{metrics.totalResponses || 0}</p>
                        <span className="ml-2 text-sm text-green-500">+8%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">actual AI responses sent</p>
                </div>
            </div>
        </div>
    );
}

export default Analytics; 