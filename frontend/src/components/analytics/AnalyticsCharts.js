import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const AnalyticsCharts = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartInitialized, setChartInitialized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analytics');
        const jsonData = await response.json();
        console.log('Analytics data:', jsonData);
        setData(jsonData);
        setError(null);
        setChartInitialized(true);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading analytics: {error}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center p-4">No data available</div>;
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
    <div className="grid grid-cols-2 gap-6 p-4">
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Email Volume Over Time</h3>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Suspense fallback={<LoadingSpinner />}>
            {chartInitialized && <Bar data={volumeChartData} options={commonOptions} />}
          </Suspense>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Response Types</h3>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Suspense fallback={<LoadingSpinner />}>
            {chartInitialized && <Pie data={responseTypesData} options={commonOptions} />}
          </Suspense>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Average Response Time</h3>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Suspense fallback={<LoadingSpinner />}>
            {chartInitialized && <Bar data={responseTimeData} options={commonOptions} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;