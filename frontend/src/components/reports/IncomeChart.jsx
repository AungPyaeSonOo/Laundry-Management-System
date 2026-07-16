import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const IncomeChart = ({ data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted py-5">No data available</div>;
  }

  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : Line;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <DataComponent
          type="monotone"
          dataKey="income"
          stroke="#8884d8"
          fill="#8884d8"
        />
        <DataComponent
          type="monotone"
          dataKey="expenses"
          stroke="#ff6b6b"
          fill="#ff6b6b"
        />
        <DataComponent
          type="monotone"
          dataKey="profit"
          stroke="#51cf66"
          fill="#51cf66"
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
};

export const PieChartComponent = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted py-5">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
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