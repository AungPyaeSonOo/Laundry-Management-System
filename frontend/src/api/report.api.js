import axios from '../api/axios.config';
import * as XLSX from 'xlsx';

export const reportApi = {
  getDaily: (params) => axios.get('/reports/daily', { params }),
  getWeekly: (params) => axios.get('/reports/weekly', { params }),
  getMonthly: (params) => axios.get('/reports/monthly', { params }),
  getYearly: (params) => axios.get('/reports/yearly', { params }),
  getCustom: (params) => axios.get('/reports/custom', { params }),
};

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

export default reportApi;