import { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';

export function useAnalyticsData() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('/api/analytics');
            console.log('Analytics response:', response.data);
            setData(response.data || {});
            setError(null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        let intervalId = null;

        const init = async () => {
            if (mounted) {
                await fetchData();
                // Refresh data every 5 minutes
                intervalId = setInterval(fetchData, 5 * 60 * 1000);
            }
        };

        init();

        return () => {
            mounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fetchData]);

    return { data, loading, error };
}
