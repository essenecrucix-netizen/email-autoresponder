import React from 'react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Emails', value: '1,234', trend: '+12%', icon: 'mail' },
    { label: 'Response Rate', value: '94%', trend: '+3%', icon: 'trending_up' },
    { label: 'Avg Response Time', value: '2.4m', trend: '-18%', icon: 'timer' },
    { label: 'Knowledge Base', value: '45', trend: '+5', icon: 'folder' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'response',
      message: 'Automated response sent to customer@example.com',
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'document',
      message: 'New document added to Knowledge Base',
      time: '2 hours ago'
    },
    {
      id: 3,
      type: 'escalation',
      message: 'Technical support request escalated to team',
      time: '4 hours ago'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'response':
        return 'send';
      case 'document':
        return 'description';
      case 'escalation':
        return 'escalator';
      default:
        return 'info';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your email automation system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="material-icons text-primary text-2xl">{stat.icon}</span>
              <span className={`text-sm font-medium ${
                stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-primary hover:text-primary-hover transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <span className="material-icons text-primary text-sm">
                  {getActivityIcon(activity.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
