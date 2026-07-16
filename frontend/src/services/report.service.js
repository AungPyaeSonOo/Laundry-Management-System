import axios from '../api/axios.config';
import * as XLSX from 'xlsx';

export const reportApi = {
  getDaily: (params) => {
    console.log('📊 Getting daily report with params:', params);
    return axios.get('/reports/daily', { params });
  },
  
  getWeekly: (params) => {
    console.log('📊 Getting weekly report with params:', params);
    return axios.get('/reports/weekly', { params });
  },
  
  getMonthly: (params) => {
    console.log('📊 Getting monthly report with params:', params);
    return axios.get('/reports/monthly', { params });
  },
  
  getYearly: (params) => {
    console.log('📊 Getting yearly report with params:', params);
    return axios.get('/reports/yearly', { params });
  },
  
  getCustom: (params) => {
    console.log('📊 Getting custom report with params:', params);
    return axios.get('/reports/custom', { params });
  },
};

// Export to Excel
export const exportToExcel = (data, filename = 'report') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Export to CSV
export const exportToCSV = (data, filename = 'report') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvData = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export default reportApi;