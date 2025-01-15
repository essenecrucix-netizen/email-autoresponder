import React from 'react';

const Analytics = () => {
  const metrics = [
    { label: 'Response Time', value: '1.8s', change: '-12%', period: 'vs last week' },
    { label: 'Accuracy Rate', value: '94%', change: '+3%', period: 'vs last week' },
    { label: 'User Satisfaction', value: '4.8/5', change: '+0.2', period: 'vs last month' },
    { label: 'Total Responses', value: '1,234', change: '+8%', period: 'vs last month' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Monitor your email automation performance</p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">{metric.label}</h3>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              <p className={`ml-2 text-sm font-medium ${
                metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500">{metric.period}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
