import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchAnalytics() {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/api/analytics');

            if (response.status === 200) {
                const { emails = [], responses = [] } = response.data;

                if (!Array.isArray(emails) || !Array.isArray(responses)) {
                    throw new Error('Invalid data structure: `emails` or `responses` is not an array.');
                }

                const stats = calculateStats(emails, responses);
                setAnalytics(stats);
            } else {
                throw new Error(`Failed to fetch analytics: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Unable to load analytics. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    function calculateStats(emails, responses) {
        const totalEmails = emails.length || 0;
        const automatedResponses = responses.filter(r => r.type === 'automated').length || 0;
        const escalatedResponses = emails.filter(e => e.needsEscalation).length || 0;

        const averageResponseTime = responses.length > 0
            ? responses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / responses.length
            : 0;

        return {
            totalEmails,
            averageResponseTime: Math.round(averageResponseTime),
            satisfactionRate: calculateSatisfactionRate(responses),
            responseDistribution: {
                automated: automatedResponses,
                escalated: escalatedResponses
            }
        };
    }

    function calculateSatisfactionRate(responses) {
        const positiveResponses = responses.filter(r => r.satisfaction === 'positive').length || 0;
        return responses.length > 0
            ? Math.round((positiveResponses / responses.length) * 100)
            : 0;
    }

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return <p>Loading analytics...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="analytics-container">
            <h2>Analytics Overview</h2>
            <div>
                <p>Total Emails Processed: {analytics.totalEmails}</p>
                <p>Average Response Time: {analytics.averageResponseTime} seconds</p>
                <p>Satisfaction Rate: {analytics.satisfactionRate}%</p>
                <p>Response Distribution:</p>
                <ul>
                    <li>Automated: {analytics.responseDistribution.automated}</li>
                    <li>Escalated: {analytics.responseDistribution.escalated}</li>
                </ul>
            </div>
        </div>
    );
}

export default Analytics;
