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

                if (response.status === 200 && response.data) {
                    setAnalyticsData(response.data);
                } else {
                    throw new Error('Failed to fetch analytics data');
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setError('Authentication failed. Please log in again.');
                } else if (err.message === 'Authentication token not found') {
                    setError('Authentication token not found');
                } else {
                    setError(err.response?.data?.error || 'Failed to fetch analytics data');
                }
                // Clear token if it's an authentication error
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('authToken');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    return { analyticsData, loading, error };
}

export default useAnalyticsData;
