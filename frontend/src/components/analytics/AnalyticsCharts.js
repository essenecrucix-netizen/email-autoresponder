import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsCharts = ({ data }) => {
  // Start with just one simple chart to test
  const chartData = {
    labels: ['Total Emails', 'Automated', 'Human'],
    datasets: [{
      label: 'Email Statistics',
      data: [
        data?.totalEmails || 0,
        data?.automatedResponses || 0,
        data?.humanResponses || 0
      ],
      backgroundColor: [
        'rgba(53, 162, 235, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 99, 132, 0.5)',
      ],
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Email Analytics',
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default AnalyticsCharts;