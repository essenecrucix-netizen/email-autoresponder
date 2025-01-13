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

                // Get the auth token and user ID from localStorage
                const token = localStorage.getItem('authToken');
                const userId = localStorage.getItem('userId');

                if (!token) {
                    throw new Error('Authentication token not found');
                }

                if (!userId) {
                    throw new Error('User ID not found');
                }

                const response = await axios.get('/api/analytics', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        userId: userId
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
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                } else if (err.message === 'Authentication token not found') {
                    setError('Authentication token not found');
                } else if (err.message === 'User ID not found') {
                    setError('User ID not found. Please log in again.');
                } else {
                    setError(err.response?.data?.error || 'Failed to fetch analytics data');
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
