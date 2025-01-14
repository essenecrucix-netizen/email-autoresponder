import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function Dashboard() {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium">Total Emails</h3>
                                <p className="text-3xl font-bold mt-2">0</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium">Automated Responses</h3>
                                <p className="text-3xl font-bold mt-2">0</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium">Average Response Time</h3>
                                <p className="text-3xl font-bold mt-2">0m</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium">Satisfaction Rate</h3>
                                <p className="text-3xl font-bold mt-2">0%</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center text-gray-500">
                                    No recent activity
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
