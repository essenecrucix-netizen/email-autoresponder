import React from 'react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import AnalyticsCharts from './analytics/AnalyticsCharts';
import Sidebar from './Sidebar';
import Header from './Header';

function Dashboard() {
    const { analyticsData, loading, error } = useAnalyticsData();

    const {
        totalEmails = 0,
        automatedResponses = 0,
        averageResponseTime = 0,
        satisfactionRate = 0,
        escalatedResponses = 0
    } = analyticsData || {};

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-gray-500 text-sm">Total Emails</h3>
                                    <p className="text-2xl font-semibold">{totalEmails}</p>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-gray-500 text-sm">Automated Responses</h3>
                                    <p className="text-2xl font-semibold">{automatedResponses}</p>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-gray-500 text-sm">Average Response Time</h3>
                                    <p className="text-2xl font-semibold">{averageResponseTime}s</p>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-gray-500 text-sm">Satisfaction Rate</h3>
                                    <p className="text-2xl font-semibold">{satisfactionRate}%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg shadow p-4">
                                    <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
                                    <AnalyticsCharts />
                                </div>

                                <div className="bg-white rounded-lg shadow p-4">
                                    <h2 className="text-xl font-semibold mb-4">Response Summary</h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Automated Responses</span>
                                            <span className="font-medium">{automatedResponses}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Escalated Responses</span>
                                            <span className="font-medium">{escalatedResponses}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Average Response Time</span>
                                            <span className="font-medium">{averageResponseTime} seconds</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">User Satisfaction</span>
                                            <span className="font-medium">{satisfactionRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
