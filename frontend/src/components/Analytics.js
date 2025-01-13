import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsCharts from './analytics/AnalyticsCharts';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

function Analytics() {
    const navigate = useNavigate();
    const { analyticsData, loading, error } = useAnalyticsData();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login', { state: { from: '/analytics' } });
        }
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        // If error is authentication related, redirect to login
        if (error.includes('Authentication') || error.includes('token')) {
            navigate('/login', { state: { from: '/analytics' } });
            return null;
        }
        return <p className="text-red-500 p-4">{error}</p>;
    }

    if (!analyticsData) {
        return <p className="p-4">No analytics data available.</p>;
    }

    return (
        <div className="analytics-container p-4">
            <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Emails</h3>
                    <p className="text-2xl font-semibold">{analyticsData.totalEmails}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Automated Responses</h3>
                    <p className="text-2xl font-semibold">{analyticsData.automatedResponses}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Average Response Time</h3>
                    <p className="text-2xl font-semibold">{analyticsData.averageResponseTime}s</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Satisfaction Rate</h3>
                    <p className="text-2xl font-semibold">{analyticsData.satisfactionRate}%</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <AnalyticsCharts />
            </div>
        </div>
    );
}

export default Analytics;
