import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import '../utils/chartConfig';  // Import Chart.js configuration

const AnalyticsCharts = ({ data }) => {
  if (!data) {
    return <div>No data available</div>;
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Email Volume Chart
  const volumeChartData = {
    labels: data.emailVolume?.map(entry => entry.date) || [],
    datasets: [{
      label: 'Email Volume',
      data: data.emailVolume?.map(entry => entry.count) || [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      borderColor: 'rgba(53, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  // Response Types Chart
  const responseTypesData = {
    labels: ['Automated', 'Human', 'Escalated'],
    datasets: [{
      label: 'Response Types',
      data: [
        data.automatedResponses || 0,
        data.humanResponses || 0,
        data.escalatedEmails || 0
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(53, 162, 235, 0.5)',
        'rgba(255, 99, 132, 0.5)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(53, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 1,
    }]
  };

  // Response Time Chart
  const responseTimeData = {
    labels: ['Average Response Time (minutes)'],
    datasets: [{
      label: 'Minutes',
      data: [data.averageResponseTime || 0],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Email Volume Over Time</h3>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Bar data={volumeChartData} options={commonOptions} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Response Types</h3>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Pie data={responseTypesData} options={commonOptions} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Average Response Time</h3>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Bar data={responseTimeData} options={commonOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;