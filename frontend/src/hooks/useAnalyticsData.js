import { useState, useEffect } from 'react';
import axios from 'axios';

function useAnalyticsData() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                setLoading(true);
                setError(null);

                // Get the auth token from localStorage
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                const response = await axios.get('/api/analytics', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setAnalyticsData(response.data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError(err.response?.data?.error || 'Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    return { analyticsData, loading, error };
}

export default useAnalyticsData;
