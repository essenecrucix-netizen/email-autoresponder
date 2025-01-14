import React, { useState, useEffect } from 'react';
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

const AnalyticsCharts = () => {
  const [data, setData] = useState({
    labels: ['Sample'],
    datasets: [{
      label: 'Test Data',
      data: [10],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Test Chart',
      },
    },
  };

  return (
    <div style={{ width: '500px', height: '500px' }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default AnalyticsCharts;