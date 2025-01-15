import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

function Analytics() {
    const { data, loading, error } = useAnalyticsData();

    const metrics = [
        {
            id: 'response_rate',
            label: 'Response Rate',
            value: data?.responseRate || '0%',
            trend: '+5.2%',
            icon: 'speed',
            description: 'Average response rate for incoming emails'
        },
        {
            id: 'ai_accuracy',
            label: 'AI Accuracy',
            value: data?.aiAccuracy || '0%',
            trend: '+3.1%',
            icon: 'psychology',
            description: 'Accuracy of AI-generated responses'
        },
        {
            id: 'escalation_rate',
            label: 'Escalation Rate',
            value: data?.escalationRate || '0%',
            trend: '-2.4%',
            icon: 'escalator',
            description: 'Percentage of emails requiring human escalation'
        },
        {
            id: 'avg_response_time',
            label: 'Avg. Response Time',
            value: data?.avgResponseTime || '0m',
            trend: '-12.5%',
            icon: 'timer',
            description: 'Average time to respond to emails'
        }
    ];

    if (loading) {
        return (
            <div className="app-container">
                <Sidebar />
                <div className="content-area">
                    <Header />
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <Sidebar />
                <div className="content-area">
                    <Header />
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="material-icons text-red-400">error</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-area">
                <Header />
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Monitor and analyze your email automation performance
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn btn-primary">
                                <span className="material-icons">download</span>
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {metrics.map((metric) => (
                            <div key={metric.id} className="stat-card">
                                <div className="stat-header">
                                    <div className="stat-icon">
                                        <span className="material-icons">{metric.icon}</span>
                                    </div>
                                    <div className={`stat-trend ${
                                        metric.trend.startsWith('+') ? 'trend-up' : 'trend-down'
                                    }`}>
                                        <span className="material-icons">
                                            {metric.trend.startsWith('+') ? 'trending_up' : 'trending_down'}
                                        </span>
                                        {metric.trend}
                                    </div>
                                </div>
                                <div className="stat-value">{metric.value}</div>
                                <div className="stat-label">{metric.label}</div>
                                <div className="mt-2 text-sm text-gray-500">{metric.description}</div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Response Time Distribution */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Response Time Distribution</h3>
                                <button className="p-2 hover:bg-gray-50 rounded-lg">
                                    <span className="material-icons text-gray-400">more_vert</span>
                                </button>
                            </div>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <span className="text-gray-400">Chart will be displayed here</span>
                            </div>
                        </div>

                        {/* Email Categories */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Email Categories</h3>
                                <button className="p-2 hover:bg-gray-50 rounded-lg">
                                    <span className="material-icons text-gray-400">more_vert</span>
                                </button>
                            </div>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <span className="text-gray-400">Chart will be displayed here</span>
                            </div>
                        </div>

                        {/* Recent Performance */}
                        <div className="card lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">Recent Performance</h3>
                                    <p className="text-sm text-gray-500">Last 30 days of activity</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                                        Daily
                                    </button>
                                    <button className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                                        Weekly
                                    </button>
                                    <button className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                                        Monthly
                                    </button>
                                </div>
                            </div>
                            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                                <span className="text-gray-400">Performance chart will be displayed here</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
