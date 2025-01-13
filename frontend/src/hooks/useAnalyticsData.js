import { useState, useEffect } from 'react';
import axios from '../utils/axios';

export function useAnalyticsData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await axios.get('/api/analytics');
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError(err.message || 'Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        
        // Refresh data every 5 minutes
        const interval = setInterval(fetchData, 300000);
        
        return () => clearInterval(interval);
    }, []);

    return { data, loading, error };
}
