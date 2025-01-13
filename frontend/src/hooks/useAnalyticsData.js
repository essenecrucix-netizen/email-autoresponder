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
                const token = localStorage.getItem('token');
                console.log('Token from localStorage:', token);
                
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                console.log('Making request with token:', `Bearer ${token}`);
                const response = await axios.get('/api/analytics');
                console.log('Response:', response);
                
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                if (err.response) {
                    console.log('Error response:', {
                        status: err.response.status,
                        data: err.response.data,
                        headers: err.response.headers
                    });
                }
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
