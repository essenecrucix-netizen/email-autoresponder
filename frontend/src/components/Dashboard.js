import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function Dashboard() {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-area">
                <Header />
                <div className="main-content">
                    {/* Header Section */}
                    <div className="card mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Monitor your email automation performance
                                </p>
                            </div>
                            <button className="btn btn-primary">
                                <span className="material-icons">refresh</span>
                                Refresh Data
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(70, 130, 180, 0.1)' }}>
                                    <span className="material-icons" style={{ color: 'steelblue' }}>mail</span>
                                </div>
                                <div className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                    +12.5%
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2" style={{ color: 'steelblue' }}>12</div>
                            <div className="font-medium text-gray-900 mb-1">Total Emails</div>
                            <div className="text-sm text-gray-500">Emails received today</div>
                        </div>

                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(70, 130, 180, 0.1)' }}>
                                    <span className="material-icons" style={{ color: 'steelblue' }}>smart_toy</span>
                                </div>
                                <div className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                    +8.2%
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2" style={{ color: 'steelblue' }}>10</div>
                            <div className="font-medium text-gray-900 mb-1">Automated Responses</div>
                            <div className="text-sm text-gray-500">Responses sent automatically</div>
                        </div>

                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(70, 130, 180, 0.1)' }}>
                                    <span className="material-icons" style={{ color: 'steelblue' }}>timer</span>
                                </div>
                                <div className="px-2 py-1 rounded-full text-sm bg-red-100 text-red-800">
                                    -2.4%
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2" style={{ color: 'steelblue' }}>0m</div>
                            <div className="font-medium text-gray-900 mb-1">Average Response Time</div>
                            <div className="text-sm text-gray-500">Time to respond to emails</div>
                        </div>

                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(70, 130, 180, 0.1)' }}>
                                    <span className="material-icons" style={{ color: 'steelblue' }}>sentiment_satisfied</span>
                                </div>
                                <div className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                    +5.3%
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2" style={{ color: 'steelblue' }}>0%</div>
                            <div className="font-medium text-gray-900 mb-1">Satisfaction Rate</div>
                            <div className="text-sm text-gray-500">Based on user feedback</div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">Recent Activity</h2>
                            <button className="btn btn-primary">View All</button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(70, 130, 180, 0.1)' }}>
                                    <span className="material-icons" style={{ color: 'steelblue' }}>notifications</span>
                                </div>
                                <div>
                                    <div className="font-medium">No recent activity</div>
                                    <div className="text-sm text-gray-500">System is ready to process emails</div>
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
