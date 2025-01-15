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
                    <div className="main-content">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'steelblue' }}></div>
                        </div>
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
                    <div className="main-content">
                        <div className="card">
                            <div className="flex items-center gap-3 text-red-600">
                                <span className="material-icons">error</span>
                                <p>{error}</p>
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
                <div className="main-content">
                    {/* Header Section */}
                    <div className="card mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Monitor and analyze your email automation performance
                                </p>
                            </div>
                            <button className="btn btn-primary">
                                <span className="material-icons">download</span>
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {metrics.map((metric) => (
                            <div key={metric.id} className="card">
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

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Response Time Trend</h2>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center text-gray-500">
                                    <span className="material-icons text-4xl mb-2">insights</span>
                                    <p>Chart will be displayed here</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Email Volume</h2>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center text-gray-500">
                                    <span className="material-icons text-4xl mb-2">bar_chart</span>
                                    <p>Chart will be displayed here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
