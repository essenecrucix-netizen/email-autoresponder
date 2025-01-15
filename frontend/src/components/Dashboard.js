import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function Dashboard() {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-area">
                <Header />
                <div className="dashboard-container">
                    <div className="dashboard-header">
                        <h1 className="dashboard-title">Dashboard Overview</h1>
                        <button className="btn btn-primary">
                            <span className="material-icons">refresh</span>
                            Refresh Data
                        </button>
                    </div>

                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon">📧</div>
                                <div className="stat-trend trend-up">
                                    <span className="material-icons">trending_up</span>
                                    +12.5%
                                </div>
                            </div>
                            <div className="stat-value">12</div>
                            <div className="stat-label">Total Emails</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon">🤖</div>
                                <div className="stat-trend trend-up">
                                    <span className="material-icons">trending_up</span>
                                    +8.2%
                                </div>
                            </div>
                            <div className="stat-value">10</div>
                            <div className="stat-label">Automated Responses</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon">⚡</div>
                                <div className="stat-trend trend-down">
                                    <span className="material-icons">trending_down</span>
                                    -2.4%
                                </div>
                            </div>
                            <div className="stat-value">0m</div>
                            <div className="stat-label">Average Response Time</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon">😊</div>
                                <div className="stat-trend trend-up">
                                    <span className="material-icons">trending_up</span>
                                    +5.3%
                                </div>
                            </div>
                            <div className="stat-value">0%</div>
                            <div className="stat-label">Satisfaction Rate</div>
                        </div>
                    </div>

                    <div className="recent-activity">
                        <div className="activity-header">
                            <h2 className="activity-title">Recent Activity</h2>
                            <button className="btn btn-primary">View All</button>
                        </div>
                        
                        {/* If there's no activity */}
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">📝</div>
                                <div className="activity-content">
                                    <div className="activity-message">No recent activity</div>
                                    <div className="activity-time">System is ready to process emails</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
