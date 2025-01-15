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
                <div className="space-y-6 p-6" style={{ backgroundColor: '#f8f9fa' }}>
                    {/* Header Section */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm" style={{ borderLeft: '4px solid steelblue' }}>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Monitor and analyze your email automation performance
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn" style={{ backgroundColor: 'steelblue', color: 'white', padding: '8px 16px', borderRadius: '6px' }}>
                                <span className="material-icons">download</span>
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {metrics.map((metric) => (
                            <div key={metric.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(70, 130, 180, 0.1)' }}>
                                        <span className="material-icons" style={{ color: 'steelblue' }}>{metric.icon}</span>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-sm ${
                                        metric.trend.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {metric.trend}
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-2" style={{ color: 'steelblue' }}>{metric.value}</div>
                                <div className="font-medium text-gray-900 mb-1">{metric.label}</div>
                                <div className="text-sm text-gray-500">{metric.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
