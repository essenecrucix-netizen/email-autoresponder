import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components with no SSR
const Chart = dynamic(() => import('chart.js/auto'), { ssr: false });
const { Bar, Pie } = dynamic(() => import('react-chartjs-2'), { ssr: false });

const AnalyticsCharts = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const initChart = async () => {
      const { Chart: ChartJS,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Title,
        Tooltip,
        Legend } = await import('chart.js');

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
    };

    initChart();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analytics');
        const jsonData = await response.json();
        console.log('Analytics data:', jsonData);
        setData(jsonData);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient) {
      fetchData();
    }
  }, [isClient]);

  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
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
          {isClient && <Bar data={volumeChartData} options={commonOptions} />}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Response Types</h3>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          {isClient && <Pie data={responseTypesData} options={commonOptions} />}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Average Response Time</h3>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          {isClient && <Bar data={responseTimeData} options={commonOptions} />}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;