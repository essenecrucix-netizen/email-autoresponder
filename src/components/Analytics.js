import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Analytics() {
    const [metrics, setMetrics] = useState({
        totalEmails: 0,
        automatedResponses: 0,
        humanResponses: 0,
        averageResponseTime: 0,
        escalatedEmails: 0,
        satisfactionRate: 0
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
                setMetrics(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch analytics data');
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-6">Loading analytics...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Emails</h3>
                    <p className="text-2xl font-semibold">{metrics.totalEmails}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Automated Responses</h3>
                    <p className="text-2xl font-semibold">{metrics.automatedResponses}</p>
                    <p className="text-sm text-gray-400">
                        {((metrics.automatedResponses / metrics.totalEmails) * 100).toFixed(1)}% of total
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Human Responses</h3>
                    <p className="text-2xl font-semibold">{metrics.humanResponses}</p>
                    <p className="text-sm text-gray-400">
                        {((metrics.humanResponses / metrics.totalEmails) * 100).toFixed(1)}% of total
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Average Response Time</h3>
                    <p className="text-2xl font-semibold">{metrics.averageResponseTime} min</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Escalated Emails</h3>
                    <p className="text-2xl font-semibold">{metrics.escalatedEmails}</p>
                    <p className="text-sm text-gray-400">
                        {((metrics.escalatedEmails / metrics.totalEmails) * 100).toFixed(1)}% of total
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Satisfaction Rate</h3>
                    <p className="text-2xl font-semibold">
                        {((metrics.satisfactionRate || 0) * 100).toFixed(1)}%
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Analytics; 