import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Badge,
  Table,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  FiFileText, 
  FiDownload, 
  FiBarChart2, 
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingCart,
  FiCalendar,
  FiRefreshCw,
  FiCheckCircle  // ✅ Added missing import
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { reportApi, exportToExcel } from '../services/report.service';
import { formatCurrency } from '../utils/helpers';
import moment from 'moment';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [error, setError] = useState(null);

  useEffect(() => {
    generateReport();
  }, [reportType, date]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;

      console.log('📊 Auto generating report:', reportType, 'Date:', date);

      switch (reportType) {
        case 'daily':
          response = await reportApi.getDaily({ date });
          break;
        case 'weekly':
          response = await reportApi.getWeekly({ 
            week: moment(date).week(), 
            year: moment(date).year() 
          });
          break;
        case 'monthly':
          response = await reportApi.getMonthly({ 
            month: moment(date).month() + 1, 
            year: moment(date).year() 
          });
          break;
        case 'yearly':
          response = await reportApi.getYearly({ 
            year: moment(date).year() 
          });
          break;
        default:
          break;
      }

      console.log('📥 Report Response:', response);

      if (response?.data?.data) {
        // ✅ Process data safely
        const processedData = processReportData(response.data.data);
        setReportData(processedData);
      } else {
        setReportData(null);
        toast.info('No data available for this period');
      }
    } catch (error) {
      console.error('❌ Error generating report:', error);
      setError(error.response?.data?.message || error.message || 'Failed to generate report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Process report data safely
  const processReportData = (data) => {
    // ✅ Ensure data exists
    const orders = data?.orders || [];
    const expenses = data?.expenses || [];
    const summary = data?.summary || {};

    // ✅ Filter only completed orders (payment confirmed)
    const completedOrders = orders.filter(order => 
      order?.status === 'completed' || 
      order?.payment_status === 'paid'
    );

    // ✅ Calculate income from completed orders only
    const totalIncome = completedOrders.reduce((sum, order) => {
      return sum + parseFloat(order?.total_price || 0);
    }, 0);

    // ✅ Total expenses
    const totalExpenses = expenses.reduce((sum, expense) => {
      return sum + parseFloat(expense?.amount || 0);
    }, 0);

    // ✅ Net profit
    const netProfit = totalIncome - totalExpenses;

    // ✅ Payment method breakdown from completed orders
    const cashOrders = completedOrders.filter(o => o?.payment_method === 'cash' || !o?.payment_method);
    const kpayOrders = completedOrders.filter(o => o?.payment_method === 'kpay');
    const waveOrders = completedOrders.filter(o => o?.payment_method === 'wave_pay');

    const cashIncome = cashOrders.reduce((sum, o) => sum + parseFloat(o?.total_price || 0), 0);
    const kpayIncome = kpayOrders.reduce((sum, o) => sum + parseFloat(o?.total_price || 0), 0);
    const waveIncome = waveOrders.reduce((sum, o) => sum + parseFloat(o?.total_price || 0), 0);

    // ✅ Pending income (orders not completed)
    const pendingOrders = orders.filter(o => o?.status !== 'completed' && o?.payment_status !== 'paid');
    const pendingIncome = pendingOrders.reduce((sum, o) => sum + parseFloat(o?.total_price || 0), 0);

    return {
      ...data,
      summary: {
        ...summary,
        total_orders: orders.length || 0,
        completed_orders: completedOrders.length || 0,
        total_income: totalIncome || 0,
        total_expenses: totalExpenses || 0,
        net_profit: netProfit || 0,
        cash_income: cashIncome || 0,
        kpay_income: kpayIncome || 0,
        wave_income: waveIncome || 0,
        pending_income: pendingIncome || 0
      },
      orders: orders,
      completed_orders: completedOrders,
      expenses: expenses
    };
  };

  const handleExport = () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    try {
      const exportData = prepareExportData(reportData);
      exportToExcel(exportData, `report_${reportType}_${date}`);
      toast.success('✅ Report exported successfully');
    } catch (error) {
      toast.error('❌ Failed to export report');
    }
  };

  const prepareExportData = (data) => {
    const { summary = {}, orders = [], completed_orders = [], expenses = [] } = data;
    const exportData = [];

    exportData.push({
      'Report Type': reportType.toUpperCase(),
      'Date': date,
      'Total Orders': summary?.total_orders || 0,
      'Completed Orders': summary?.completed_orders || 0,
      'Total Income (Completed)': summary?.total_income || 0,
      'Total Expenses': summary?.total_expenses || 0,
      'Net Profit': summary?.net_profit || 0,
      'Cash Income': summary?.cash_income || 0,
      'KPay Income': summary?.kpay_income || 0,
      'Wave Pay Income': summary?.wave_income || 0,
      'Pending Income': summary?.pending_income || 0
    });

    if (completed_orders && completed_orders.length > 0) {
      exportData.push({ '': '--- COMPLETED ORDERS ---' });
      completed_orders.forEach((order, index) => {
        exportData.push({
          '#': index + 1,
          'Order ID': order?.id || order?.order_id || 'N/A',
          'Customer': order?.customer?.name || order?.customer_name || 'N/A',
          'Total Price': order?.total_price || 0,
          'Payment Method': order?.payment_method || 'cash',
          'Date': order?.created_at ? moment(order.created_at).format('DD/MM/YYYY') : 'N/A'
        });
      });
    }

    if (orders && orders.length > 0) {
      exportData.push({ '': '--- ALL ORDERS ---' });
      orders.forEach((order, index) => {
        exportData.push({
          '#': index + 1,
          'Order ID': order?.id || order?.order_id || 'N/A',
          'Customer': order?.customer?.name || order?.customer_name || 'N/A',
          'Total Price': order?.total_price || 0,
          'Status': order?.status || 'N/A',
          'Payment Status': order?.payment_status || 'N/A',
          'Date': order?.created_at ? moment(order.created_at).format('DD/MM/YYYY') : 'N/A'
        });
      });
    }

    return exportData;
  };

  // ✅ Summary Cards with safe data
  const summaryCards = [
    {
      title: 'Total Orders',
      value: reportData?.summary?.total_orders || 0,
      icon: FiShoppingCart,
      color: 'primary'
    },
    {
      title: '✅ Completed Orders',
      value: reportData?.summary?.completed_orders || 0,
      icon: FiCheckCircle,
      color: 'success'
    },
    {
      title: '💰 Total Income',
      value: `${formatCurrency(reportData?.summary?.total_income || 0)} MMK`,
      icon: FiDollarSign,
      color: 'success'
    },
    {
      title: '📊 Net Profit',
      value: `${formatCurrency(reportData?.summary?.net_profit || 0)} MMK`,
      icon: FiTrendingUp,
      color: (reportData?.summary?.net_profit || 0) > 0 ? 'success' : 'danger'
    }
  ];

  // ✅ Payment stats with safe data
  const paymentStats = [
    {
      title: '💰 Cash',
      value: `${formatCurrency(reportData?.summary?.cash_income || 0)} MMK`,
      color: 'success'
    },
    {
      title: '📱 KPay',
      value: `${formatCurrency(reportData?.summary?.kpay_income || 0)} MMK`,
      color: 'primary'
    },
    {
      title: '📱 Wave Pay',
      value: `${formatCurrency(reportData?.summary?.wave_income || 0)} MMK`,
      color: 'info'
    },
    {
      title: '⏳ Pending',
      value: `${formatCurrency(reportData?.summary?.pending_income || 0)} MMK`,
      color: 'warning'
    }
  ];

  return (
    <div className="p-4 animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">
            <FiBarChart2 className="me-2" /> Reports
          </h4>
          <p className="text-secondary small mb-0">Auto-generated business reports (Income from completed orders only)</p>
        </div>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={handleExport}
          disabled={!reportData || loading}
        >
          <FiDownload className="me-1" /> Export
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="fw-bold small">
                  <FiCalendar className="me-1" /> Report Type
                </Form.Label>
                <Form.Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="rounded-3"
                  style={{ fontSize: '14px' }}
                >
                  <option value="daily">📅 Daily</option>
                  <option value="weekly">📊 Weekly</option>
                  <option value="monthly">📈 Monthly</option>
                  <option value="yearly">📉 Yearly</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="fw-bold small">
                  <FiCalendar className="me-1" /> Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-3"
                  style={{ fontSize: '14px' }}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  className="flex-grow-1"
                  onClick={() => {
                    setDate(moment().format('YYYY-MM-DD'));
                    setReportType('daily');
                  }}
                  size="sm"
                >
                  <FiRefreshCw className="me-1" /> Today
                </Button>
                {loading && (
                  <div className="d-flex align-items-center">
                    <Spinner size="sm" animation="border" variant="primary" />
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Summary Cards */}
      {reportData?.summary && (
        <Row className="g-3 mb-4">
          {summaryCards.map((card, index) => (
            <Col key={index} xs={6} md={3}>
              <Card className="shadow-sm border-0">
                <Card.Body className="text-center p-3">
                  <card.icon size={28} className={`text-${card.color} mb-2`} />
                  <h6 className="text-secondary mb-0 small text-truncate">{card.title}</h6>
                  <h5 className="fw-bold mb-0" style={{ fontSize: 'clamp(14px, 2.5vw, 20px)' }}>
                    {card.value}
                  </h5>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Payment Methods Breakdown */}
      {reportData?.summary && (
        <Row className="g-3 mb-4">
          {paymentStats.map((stat, index) => (
            <Col key={index} xs={6} md={3}>
              <Card className={`shadow-sm border-0 bg-${stat.color} bg-opacity-10`}>
                <Card.Body className="text-center p-3">
                  <h6 className="text-secondary mb-0 small">{stat.title}</h6>
                  <h5 className="fw-bold mb-0" style={{ fontSize: 'clamp(14px, 2.5vw, 20px)' }}>
                    {stat.value}
                  </h5>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Completed Orders Table - Desktop */}
      {reportData?.completed_orders && reportData.completed_orders.length > 0 && (
        <Card className="shadow-sm border-0 d-none d-sm-block mb-4">
          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">
              <FiCheckCircle className="me-2 text-success" /> Completed Orders (Income)
            </h6>
            <Badge bg="success">{reportData.completed_orders.length} orders</Badge>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0" style={{ minWidth: '600px' }}>
                <thead className="bg-light">
                  <tr>
                    <th className="ps-3" style={{ width: '40px' }}>#</th>
                    <th style={{ minWidth: '100px' }}>Order ID</th>
                    <th style={{ minWidth: '120px' }}>Customer</th>
                    <th style={{ minWidth: '100px' }}>Total</th>
                    <th style={{ minWidth: '100px' }}>Payment Method</th>
                    <th style={{ minWidth: '100px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.completed_orders.slice(0, 20).map((order, index) => (
                    <tr key={order?.id || order?.order_id || index}>
                      <td className="ps-3" style={{ fontSize: '13px' }}>{index + 1}</td>
                      <td style={{ fontSize: '13px' }}>#{order?.id || order?.order_id}</td>
                      <td style={{ fontSize: '13px' }}>{order?.customer?.name || order?.customer_name || 'N/A'}</td>
                      <td style={{ fontSize: '13px' }} className="text-success fw-bold">
                        {formatCurrency(order?.total_price || 0)} MMK
                      </td>
                      <td>
                        <Badge bg={
                          order?.payment_method === 'cash' || !order?.payment_method ? 'success' :
                          order?.payment_method === 'kpay' ? 'primary' :
                          order?.payment_method === 'wave_pay' ? 'info' :
                          'secondary'
                        } style={{ fontSize: '12px' }}>
                          {order?.payment_method || 'cash'}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {order?.created_at ? 
                          moment(order.created_at).format('DD/MM/YYYY') : 
                          'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {reportData.completed_orders.length > 20 && (
              <div className="text-center py-2 text-secondary small">
                Showing 20 of {reportData.completed_orders.length} completed orders
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Mobile Card View for Completed Orders */}
      {reportData?.completed_orders && reportData.completed_orders.length > 0 && (
        <div className="d-block d-sm-none mb-4">
          {reportData.completed_orders.slice(0, 10).map((order, index) => (
            <Card key={order?.id || order?.order_id || index} className="shadow-sm border-0 mb-3 border-success border-start border-4">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="fw-bold" style={{ fontSize: '14px' }}>
                      #{order?.id || order?.order_id}
                    </span>
                    <div className="text-secondary small">
                      {order?.customer?.name || order?.customer_name || 'N/A'}
                    </div>
                  </div>
                  <Badge bg="success" style={{ fontSize: '11px' }}>
                    ✅ Completed
                  </Badge>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small">Total:</span>{' '}
                    <span className="fw-bold text-success" style={{ fontSize: '14px' }}>
                      {formatCurrency(order?.total_price || 0)} MMK
                    </span>
                  </div>
                  <div className="text-secondary small">
                    <Badge bg={
                      order?.payment_method === 'cash' || !order?.payment_method ? 'success' :
                      order?.payment_method === 'kpay' ? 'primary' :
                      order?.payment_method === 'wave_pay' ? 'info' :
                      'secondary'
                    } style={{ fontSize: '10px' }}>
                      {order?.payment_method || 'cash'}
                    </Badge>
                  </div>
                </div>
                <div className="text-secondary small mt-1">
                  {order?.created_at ? moment(order.created_at).format('DD/MM/YYYY') : 'N/A'}
                </div>
              </Card.Body>
            </Card>
          ))}
          {reportData.completed_orders.length > 10 && (
            <div className="text-center text-secondary small py-2">
              Showing 10 of {reportData.completed_orders.length} completed orders
            </div>
          )}
        </div>
      )}

      {/* No Data */}
      {reportData && !reportData.orders?.length && (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center py-5">
            <FiFileText size={48} className="text-secondary mb-3 opacity-25" />
            <h5>No orders found</h5>
            <p className="text-secondary mb-0">No orders for the selected period.</p>
          </Card.Body>
        </Card>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-secondary">Loading report...</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;