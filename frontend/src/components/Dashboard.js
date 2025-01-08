import React from 'react';

function Dashboard() {
    return (
        <div className="dashboard-container" data-name="dashboard-container">
            <div className="dashboard-stats" data-name="dashboard-stats">
                <div className="stat-card" data-name="stat-emails">
                    <div className="stat-value">152</div>
                    <div className="stat-label">Emails Processed Today</div>
                </div>
                <div className="stat-card" data-name="stat-response">
                    <div className="stat-value">45s</div>
                    <div className="stat-label">Average Response Time</div>
                </div>
                <div className="stat-card" data-name="stat-accuracy">
                    <div className="stat-value">94%</div>
                    <div className="stat-label">Response Accuracy</div>
                </div>
            </div>

            <div className="dashboard-content grid grid-cols-2 gap-4" data-name="dashboard-content">
                <div className="dashboard-section" data-name="analytics-section">
                    <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
                    {/* Replace with actual AnalyticsCharts component */}
                    <p>Analytics charts will go here.</p>
                </div>

                <div className="dashboard-section" data-name="emails-section">
                    <h2 className="text-xl font-semibold mb-4">Recent Emails</h2>
                    {/* Replace with actual EmailList component */}
                    <p>Email list will go here.</p>
                </div>

                <div className="dashboard-section" data-name="knowledge-section">
                    <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
                    {/* Replace with actual KnowledgeBase component */}
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
