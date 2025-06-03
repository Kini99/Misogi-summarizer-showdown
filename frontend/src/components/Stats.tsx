import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { RatingStats } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Stats: React.FC = () => {
  const [stats, setStats] = useState<RatingStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get<RatingStats[]>(`${API_URL}/api/ratings/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Clarity', 'Accuracy', 'Conciseness'],
    datasets: stats.map((stat) => ({
      label: `${stat.modelName} (${stat.modelType})`,
      data: [stat.avgClarity, stat.avgAccuracy, stat.avgConciseness],
      backgroundColor: stat.modelType === 'closed' ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)',
      borderColor: stat.modelType === 'closed' ? 'rgb(54, 162, 235)' : 'rgb(255, 99, 132)',
      borderWidth: 1,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Average Ratings by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
      },
    },
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Model Performance Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Bar data={chartData} options={chartOptions} />
          </Paper>
        </Grid>

        {stats.map((stat) => (
          <Grid item xs={12} md={6} key={`${stat.modelName}-${stat.modelType}`}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {stat.modelName} ({stat.modelType})
              </Typography>
              <Typography>
                Total Ratings: {stat.totalRatings}
              </Typography>
              <Typography>
                Preferred: {stat.preferredCount} times ({stat.preferredPercentage}%)
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Stats; 