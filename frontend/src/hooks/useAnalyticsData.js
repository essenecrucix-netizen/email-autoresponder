import { useState, useEffect } from 'react';
import axios from 'axios';

function useAnalyticsData() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch analytics data
    async function fetchAnalyticsData() {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/api/analytics');
            if (response.status === 200) {
                const { emails = [], responses = [] } = response.data;

                if (!Array.isArray(emails) || !Array.isArray(responses)) {
                    throw new Error('Invalid data structure: `emails` or `responses` is not an array.');
                }

                const processedData = processAnalyticsData(emails, responses);
                setAnalyticsData(processedData);
            } else {
                throw new Error(`Failed to fetch analytics: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Error fetching analytics data:', err);
            setError('Unable to fetch analytics data. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    // Process analytics data
    function processAnalyticsData(emails, responses) {
        const totalEmails = emails.length;
        const automatedResponses = responses.filter(r => r.type === 'automated').length;
        const escalatedResponses = emails.filter(e => e.needsEscalation).length;

        const averageResponseTime =
            responses.length > 0
                ? responses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / responses.length
                : 0;

        const satisfactionRate = calculateSatisfactionRate(responses);

        return {
            totalEmails,
            averageResponseTime: Math.round(averageResponseTime),
            satisfactionRate,
            responseDistribution: {
                automated: automatedResponses,
                escalated: escalatedResponses,
            },
        };
    }

    // Calculate satisfaction rate
    function calculateSatisfactionRate(responses) {
        const positiveResponses = responses.filter(r => r.satisfaction === 'positive').length || 0;
        return responses.length > 0
            ? Math.round((positiveResponses / responses.length) * 100)
            : 0;
    }

    // Use effect to fetch data on component mount
    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    return { analyticsData, loading, error };
}

export default useAnalyticsData;
