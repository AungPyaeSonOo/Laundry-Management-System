import axios from './axios.config';

export const dashboardApi = {
  getStats: () => {
    console.log('📊 Fetching dashboard stats...');
    return axios.get('/dashboard/stats');
  },
  getOrderStats: () => {
    console.log('📊 Fetching order stats...');
    return axios.get('/dashboard/orders/stats');
  },
  getIncomeChart: (params) => {
    console.log('📊 Fetching income chart data...');
    return axios.get('/dashboard/charts/income', { params });
  },
  getRevenueExpense: (params) => {
    console.log('📊 Fetching revenue vs expense data...');
    return axios.get('/dashboard/charts/revenue-expense', { params });
  },
};

export default dashboardApi;