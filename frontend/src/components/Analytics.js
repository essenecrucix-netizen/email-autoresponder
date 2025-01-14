import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAnalyticsData } from '../utils/useAnalyticsData';
import AnalyticsCharts from './analytics/AnalyticsCharts';

function Analytics() {
    const { data, loading, error } = useAnalyticsData();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Analytics Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium">Total Emails</h3>
                                <p className="text-3xl font-bold mt-2">{data.totalEmails || 0}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium">Automated Responses</h3>
                                <p className="text-3xl font-bold mt-2">{data.automatedResponses || 0}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium">Average Response Time</h3>
                                <p className="text-3xl font-bold mt-2">{data.averageResponseTime || '0m'}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium">Satisfaction Rate</h3>
                                <p className="text-3xl font-bold mt-2">{data.satisfactionRate || '0%'}</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Response Summary</h3>
                                <AnalyticsCharts 
                                    data={data.responseSummary || []} 
                                    type="response" 
                                />
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Email Volume Trend</h3>
                                <AnalyticsCharts 
                                    data={data.emailVolume || []} 
                                    type="volume" 
                                />
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Response Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="text-gray-500 text-sm font-medium">Escalated Emails</h4>
                                    <p className="text-2xl font-semibold mt-1">{data.escalatedEmails || 0}</p>
                                </div>
                                <div>
                                    <h4 className="text-gray-500 text-sm font-medium">AI Response Rate</h4>
                                    <p className="text-2xl font-semibold mt-1">{data.aiResponseRate || '0%'}</p>
                                </div>
                                <div>
                                    <h4 className="text-gray-500 text-sm font-medium">Human Response Rate</h4>
                                    <p className="text-2xl font-semibold mt-1">{data.humanResponseRate || '0%'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Analytics;
