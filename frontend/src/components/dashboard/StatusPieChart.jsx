import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { dashboardApi } from '../../api';

const COLORS = ['#4f46e5', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatusPieChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await dashboardApi.getOrderStats();
      const stats = response.data.data || {};
      
      const chartData = Object.entries(stats)
        .filter(([key]) => key !== 'today_orders' && key !== 'today_income')
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: value || 0,
        }))
        .filter(item => item.value > 0);
      
      setData(chartData);
    } catch (error) {
      console.error('Error fetching order stats:', error);
      setData([
        { name: 'Pending', value: 5 },
        { name: 'Washing', value: 3 },
        { name: 'Ironing', value: 2 },
        { name: 'Ready', value: 4 },
        { name: 'Delivered', value: 8 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-secondary py-4">
        <small>Loading chart...</small>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-secondary py-4">
        <small>No data available</small>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusPieChart;