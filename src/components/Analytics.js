import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Analytics() {
    const [metrics, setMetrics] = useState({
        totalEmails: 0,
        automatedResponses: 0,
        humanResponses: 0,
        averageResponseTime: 0,
        escalatedEmails: 0,
        emailVolume: [],
        analyticsData: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('token');
                console.log('Using token:', token); // Debug log
                
                if (!token) {
                    console.log('No token found, redirecting to login');
                    navigate('/login');
                    return;
                }

                // Make the API request
                const response = await axios.get('/api/analytics', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Analytics API Response:', response.data);
                
                if (!response.data) {
                    throw new Error('No data received from analytics endpoint');
                }

                // Filter to only include entries with actual responses
                const actualResponses = response.data.analyticsData?.filter(entry => entry.response) || [];
                const automatedActualResponses = actualResponses.filter(entry => entry.type === 'automated').length;
                const humanActualResponses = actualResponses.filter(entry => entry.type === 'human').length;
                
                setMetrics({
                    ...response.data,
                    automatedResponses: automatedActualResponses,
                    humanResponses: humanActualResponses,
                    totalResponses: actualResponses.length,
                    analyticsData: response.data.analyticsData || []
                });
                
                setLoading(false);
            } catch (err) {
                console.error('Analytics API Error:', err.response || err);
                
                // Handle different error cases
                if (err.response?.status === 401 || err.response?.status === 403) {
                    console.log('Authentication error, redirecting to login');
                    localStorage.removeItem('token'); // Clear invalid token
                    navigate('/login');
                    return;
                }
                
                setError(
                    err.response?.status === 401 ? 'Please log in again.' :
                    err.response?.status === 403 ? 'Access forbidden. Please log in again.' :
                    'Failed to fetch analytics data'
                );
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [navigate]);

    if (loading) return (
        <div className="p-6">
            <div className="text-lg">Loading analytics...</div>
        </div>
    );
    
    if (error) return (
        <div className="p-6">
            <div className="text-red-500 mb-2">{error}</div>
            <button 
                onClick={() => navigate('/login')}
                className="text-blue-500 hover:text-blue-700"
            >
                Return to Login
            </button>
        </div>
    );

    // Calculate metrics from actual responses
    const actualResponses = metrics.analyticsData.filter(entry => entry.response);
    const totalResponses = actualResponses.length;
    const automatedResponses = actualResponses.filter(entry => entry.type === 'automated').length;
    const aiResponseRate = totalResponses > 0 ? (automatedResponses / totalResponses) * 100 : 0;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-gray-500">Monitor your email automation performance for business-related inquiries</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Response Time</h3>
                    <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-semibold">{(metrics.averageResponseTime || 0).toFixed(1)}s</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">average response time</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">AI Response Rate</h3>
                    <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-semibold">{aiResponseRate.toFixed(0)}%</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">of business inquiries</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Escalated Emails</h3>
                    <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-semibold">{metrics.escalatedEmails || 0}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">requiring human attention</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Responses</h3>
                    <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-semibold">{totalResponses}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">actual AI responses sent</p>
                </div>
            </div>
        </div>
    );
}

export default Analytics; 