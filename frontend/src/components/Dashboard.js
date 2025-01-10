import React from 'react';
import useAnalyticsData from '../hooks/useAnalyticsData';
import AnalyticsCharts from './analytics/AnalyticsCharts';

function Dashboard() {
    const { analyticsData, loading, error } = useAnalyticsData();

    if (loading) {
        return <p>Loading dashboard data...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    const {
        emails = [],
        responses = [],
        stats: {
            totalEmails = 0,
            averageResponseTime = 0,
            satisfactionRate = 0,
        } = {},
    } = analyticsData || {};

    return (
        <div className="dashboard-container" data-name="dashboard-container">
            <div className="dashboard-stats" data-name="dashboard-stats">
                <div className="stat-card" data-name="stat-emails">
                    <div className="stat-value">{totalEmails}</div>
                    <div className="stat-label">Emails Processed</div>
                </div>
                <div className="stat-card" data-name="stat-response">
                    <div className="stat-value">{averageResponseTime}s</div>
                    <div className="stat-label">Average Response Time</div>
                </div>
                <div className="stat-card" data-name="stat-satisfaction">
                    <div className="stat-value">{satisfactionRate}%</div>
                    <div className="stat-label">Satisfaction Rate</div>
                </div>
            </div>

            <div className="dashboard-content grid grid-cols-2 gap-4" data-name="dashboard-content">
                <div className="dashboard-section" data-name="analytics-section">
                    <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
                    <AnalyticsCharts />
                </div>

                <div className="dashboard-section" data-name="emails-section">
                    <h2 className="text-xl font-semibold mb-4">Recent Emails</h2>
                    <p>Email list will go here.</p>
                </div>

                <div className="dashboard-section" data-name="knowledge-section">
                    <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
                    <p>Knowledge base content will go here.</p>
                </div>

                <div className="dashboard-section" data-name="escalations-section">
                    <h2 className="text-xl font-semibold mb-4">Active Escalations</h2>
                    <div className="card" data-name="escalations-list">
                        <p className="text-gray-500">No active escalations</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
