const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const createExcelReport = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Total Orders', key: 'orders', width: 15 },
    { header: 'Total Income', key: 'income', width: 15 },
    { header: 'Total Expenses', key: 'expenses', width: 15 },
    { header: 'Net Profit', key: 'profit', width: 15 }
  ];

  // Add data
  worksheet.addRows([
    {
      date: data.period.start,
      orders: data.summary.total_orders,
      income: data.summary.total_income,
      expenses: data.summary.total_expenses,
      profit: data.summary.net_profit
    }
  ]);

  return workbook;
};

const generatePDFReport = (data) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Add content
    doc.fontSize(20).text('Business Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Period: ${data.period.start} to ${data.period.end}`);
    doc.moveDown();
    doc.text(`Total Orders: ${data.summary.total_orders}`);
    doc.text(`Total Income: $${data.summary.total_income}`);
    doc.text(`Total Expenses: $${data.summary.total_expenses}`);
    doc.text(`Net Profit: $${data.summary.net_profit}`);

    doc.end();
  });
};

module.exports = { createExcelReport, generatePDFReport };