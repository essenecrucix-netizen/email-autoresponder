import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
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
import axios from '../../utils/axios';

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

const AnalyticsCharts = () => {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/analytics');
        console.log('Analytics data:', response.data);
        setData(response.data);
        setError(null);
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

  const volumeChartData = {
    labels: data.emailVolume?.map(entry => entry.date) || [],
    datasets: [{
      label: 'Email Volume',
      data: data.emailVolume?.map(entry => entry.count) || [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  };

  const responseTimeData = {
    labels: ['Average Response Time'],
    datasets: [{
      label: 'Minutes',
      data: [data.averageResponseTime || 0],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  };

  const sentimentData = {
    labels: ['Satisfied', 'Neutral', 'Unsatisfied'],
    datasets: [{
      data: [
        (data.satisfactionRate || 0) * 100,
        100 - ((data.satisfactionRate || 0) * 100),
        0
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(255, 99, 132, 0.5)',
      ],
    }]
  };

  return (
    <div className="grid grid-cols-2 gap-6 p-4">
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Email Volume</h3>
        <Bar data={volumeChartData} options={commonOptions} />
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Response Time</h3>
        <Bar data={responseTimeData} options={commonOptions} />
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold mb-2">Satisfaction Rate</h3>
        <Pie data={sentimentData} options={commonOptions} />
      </div>
    </div>
  );
};

export default AnalyticsCharts;