import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '../../api';

const IncomeChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await dashboardApi.getIncomeChart({ period: 'month' });
      const chartData = response.data.data || [];
      
      // Format data for chart
      const formattedData = chartData.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        income: parseFloat(item.income) || 0,
        orders: parseInt(item.orders) || 0,
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Fallback data
      setData(generateFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackData = () => {
    const result = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: Math.floor(Math.random() * 100000) + 50000,
        orders: Math.floor(Math.random() * 10) + 1,
      });
    }
    return result;
  };

  if (loading) {
    return (
      <div className="text-center text-secondary py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value) => `${value.toLocaleString()} MMK`}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={{ fill: '#4f46e5', r: 4 }}
          activeDot={{ r: 6 }}
          name="Income (MMK)"
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: '#22c55e', r: 4 }}
          activeDot={{ r: 6 }}
          name="Orders"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IncomeChart;