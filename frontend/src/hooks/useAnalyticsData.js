import { useState, useEffect } from 'react';
import axios from '../utils/axios';

export function useAnalyticsData() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Decode and log the token payload
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log('Current user from token:', payload);
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
        };

        fetchData();
        // Refresh data every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { data, loading, error };
}
