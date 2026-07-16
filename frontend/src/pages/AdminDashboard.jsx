import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Spinner, Dropdown } from 'react-bootstrap';
import { 
  FiPackage, 
  FiCheckCircle,
  FiClock,
  FiUser,
  FiCalendar,
  FiBarChart2,
  FiTruck,
  FiShoppingBag,
  FiWind,
  FiBox,
  FiGrid,
  FiDollarSign,
  FiUsers,
  FiFilter,
  FiTrendingUp,
  FiTrendingDown,
  FiCreditCard,
  FiCornerDownRight,
  FiActivity,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { orderApi, expenseApi } from '../api';
import { formatCurrency, formatShortDate } from '../utils/helpers';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
// ✅ Import Delivery Live Map
import DeliveryLiveMap from '../components/dashboard/DeliveryLiveMap';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  
  const [summary, setSummary] = useState({
    today_orders: 0,
    today_income: 0,
    today_cash: 0,
    today_kpay: 0,
    today_wave: 0,
    today_cash_count: 0,
    today_kpay_count: 0,
    today_wave_count: 0,
    week_cash: 0,
    week_kpay: 0,
    week_wave: 0,
    week_cash_count: 0,
    week_kpay_count: 0,
    week_wave_count: 0,
    month_cash: 0,
    month_kpay: 0,
    month_wave: 0,
    month_cash_count: 0,
    month_kpay_count: 0,
    month_wave_count: 0,
    total_cash: 0,
    total_kpay: 0,
    total_wave: 0,
    cash_count: 0,
    kpay_count: 0,
    wave_count: 0,
    total_customers: 0,
    pending_orders: 0,
    monthly_income: 0,
    monthly_expenses: 0,
    monthly_profit: 0,
    low_stock_items: 0,
    week_income: 0,
    week_orders: 0,
    month_orders: 0,
    month_income: 0,
    month_expenses: 0,
    month_profit: 0,
    total_income: 0,
    total_expenses: 0,
    total_profit: 0,
    today_expenses: 0,
    week_expenses: 0,
  });
  
  const [stats, setStats] = useState({
    pending: 0,
    collected: 0,
    washing: 0,
    ironing: 0,
    ready: 0,
    delivered: 0,
    completed: 0
  });

  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Fetching admin data...');
      
      const ordersResponse = await orderApi.getAll({ limit: 500 });
      const allOrders = ordersResponse?.data?.data?.orders || [];
      setOrders(allOrders);

      let allExpenses = [];
      try {
        const expensesResponse = await expenseApi.getAll({ limit: 1000 });
        allExpenses = expensesResponse?.data?.data?.expenses || [];
        setExpenses(allExpenses);
        console.log('✅ Expenses fetched:', allExpenses.length);
      } catch (expError) {
        console.warn('⚠️ Could not fetch expenses:', expError.message);
      }

      setStats({
        pending: allOrders.filter(o => o.status === 'pending').length || 0,
        collected: allOrders.filter(o => o.status === 'collected').length || 0,
        washing: allOrders.filter(o => o.status === 'washing').length || 0,
        ironing: allOrders.filter(o => o.status === 'ironing').length || 0,
        ready: allOrders.filter(o => o.status === 'ready').length || 0,
        delivered: allOrders.filter(o => o.status === 'delivered').length || 0,
        completed: allOrders.filter(o => o.status === 'completed').length || 0
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayOrders = allOrders.filter(o => {
        const date = o.created_at || o.order_date;
        return date && new Date(date) >= today;
      });
      const todayCompletedOrders = todayOrders.filter(o => 
        o.status === 'completed' || o.payment_status === 'paid'
      );
      const todayIncome = todayCompletedOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      
      const todayCashOrders = todayCompletedOrders.filter(o => (o.payment_method === 'cash' || !o.payment_method));
      const todayKpayOrders = todayCompletedOrders.filter(o => o.payment_method === 'kpay');
      const todayWaveOrders = todayCompletedOrders.filter(o => o.payment_method === 'wave_pay');
      const todayCash = todayCashOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const todayKpay = todayKpayOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const todayWave = todayWaveOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

      const weekOrders = allOrders.filter(o => {
        const date = o.created_at || o.order_date;
        return date && new Date(date) >= weekAgo;
      });
      const weekCompletedOrders = weekOrders.filter(o => 
        o.status === 'completed' || o.payment_status === 'paid'
      );
      const weekIncome = weekCompletedOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      
      const weekCashOrders = weekCompletedOrders.filter(o => (o.payment_method === 'cash' || !o.payment_method));
      const weekKpayOrders = weekCompletedOrders.filter(o => o.payment_method === 'kpay');
      const weekWaveOrders = weekCompletedOrders.filter(o => o.payment_method === 'wave_pay');
      const weekCash = weekCashOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const weekKpay = weekKpayOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const weekWave = weekWaveOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

      const monthOrders = allOrders.filter(o => {
        const date = o.created_at || o.order_date;
        return date && new Date(date) >= monthAgo;
      });
      const monthCompletedOrders = monthOrders.filter(o => 
        o.status === 'completed' || o.payment_status === 'paid'
      );
      const monthIncome = monthCompletedOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      
      const monthCashOrders = monthCompletedOrders.filter(o => (o.payment_method === 'cash' || !o.payment_method));
      const monthKpayOrders = monthCompletedOrders.filter(o => o.payment_method === 'kpay');
      const monthWaveOrders = monthCompletedOrders.filter(o => o.payment_method === 'wave_pay');
      const monthCash = monthCashOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const monthKpay = monthKpayOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const monthWave = monthWaveOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

      const allCashOrders = allOrders.filter(o => 
        (o.payment_method === 'cash' || !o.payment_method) && 
        (o.status === 'completed' || o.payment_status === 'paid')
      );
      const allKpayOrders = allOrders.filter(o => 
        o.payment_method === 'kpay' && 
        (o.status === 'completed' || o.payment_status === 'paid')
      );
      const allWaveOrders = allOrders.filter(o => 
        o.payment_method === 'wave_pay' && 
        (o.status === 'completed' || o.payment_status === 'paid')
      );
      const totalCash = allCashOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const totalKpay = allKpayOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const totalWave = allWaveOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

      const todayExpenses = allExpenses
        .filter(e => e.expense_date && new Date(e.expense_date) >= today && e.status === 'approved')
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      const weekExpenses = allExpenses
        .filter(e => e.expense_date && new Date(e.expense_date) >= weekAgo && e.status === 'approved')
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      const monthExpenses = allExpenses
        .filter(e => e.expense_date && new Date(e.expense_date) >= monthAgo && e.status === 'approved')
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      const allCompletedOrders = allOrders.filter(o => 
        o.status === 'completed' || o.payment_status === 'paid'
      );
      const totalIncome = allCompletedOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      const totalExpensesAll = allExpenses
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      const totalProfit = totalIncome - totalExpensesAll;

      const customerMap = {};
      allOrders.forEach(o => {
        if (o.customer_id && o.customer?.name) {
          if (!customerMap[o.customer_id]) {
            customerMap[o.customer_id] = {
              id: o.customer_id,
              name: o.customer.name,
              total: 0,
              orders: 0
            };
          }
          customerMap[o.customer_id].total += parseFloat(o.total_price || 0);
          customerMap[o.customer_id].orders += 1;
        }
      });
      const topCustomersList = Object.values(customerMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      setTopCustomers(topCustomersList);

      setSummary({
        today_orders: todayOrders.length || 0,
        today_income: todayIncome || 0,
        today_cash: todayCash || 0,
        today_kpay: todayKpay || 0,
        today_wave: todayWave || 0,
        today_cash_count: todayCashOrders.length || 0,
        today_kpay_count: todayKpayOrders.length || 0,
        today_wave_count: todayWaveOrders.length || 0,
        week_cash: weekCash || 0,
        week_kpay: weekKpay || 0,
        week_wave: weekWave || 0,
        week_cash_count: weekCashOrders.length || 0,
        week_kpay_count: weekKpayOrders.length || 0,
        week_wave_count: weekWaveOrders.length || 0,
        week_income: weekIncome || 0,
        week_orders: weekOrders.length || 0,
        month_cash: monthCash || 0,
        month_kpay: monthKpay || 0,
        month_wave: monthWave || 0,
        month_cash_count: monthCashOrders.length || 0,
        month_kpay_count: monthKpayOrders.length || 0,
        month_wave_count: monthWaveOrders.length || 0,
        month_income: monthIncome || 0,
        month_orders: monthOrders.length || 0,
        month_expenses: monthExpenses || 0,
        month_profit: (monthIncome - monthExpenses) || 0,
        total_cash: totalCash || 0,
        total_kpay: totalKpay || 0,
        total_wave: totalWave || 0,
        cash_count: allCashOrders.length || 0,
        kpay_count: allKpayOrders.length || 0,
        wave_count: allWaveOrders.length || 0,
        total_customers: [...new Set(allOrders.map(o => o.customer_id))].length || 0,
        pending_orders: allOrders.filter(o => o.status === 'pending').length || 0,
        low_stock_items: 0,
        total_income: totalIncome || 0,
        total_expenses: totalExpensesAll || 0,
        total_profit: totalProfit || 0,
        today_expenses: todayExpenses || 0,
        week_expenses: weekExpenses || 0,
        monthly_income: monthIncome || 0,
        monthly_expenses: monthExpenses || 0,
        monthly_profit: (monthIncome - monthExpenses) || 0,
      });

      toast.success('Dashboard loaded successfully');

    } catch (error) {
      console.error('❌ Error fetching admin data:', error);
      if (error.message === 'Network Error') {
        setError('Cannot connect to server. Please make sure backend is running on port 5001.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to load data');
      }
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
  };

  const handleViewOrder = (order) => {
    navigate(`/orders?view=${order.order_id}`);
  };

  const getFilteredOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let filtered = [...orders];
    if (filterPeriod === 'today') {
      filtered = filtered.filter(o => {
        const date = o.created_at || o.order_date;
        return date && new Date(date) >= today;
      });
    } else if (filterPeriod === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(o => {
        const date = o.created_at || o.order_date;
        return date && new Date(date) >= weekAgo;
      });
    } else if (filterPeriod === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(o => {
        const date = o.created_at || o.order_date;
        return date && new Date(date) >= monthAgo;
      });
    }
    return filtered;
  };

  const getPeriodData = () => {
    const filteredOrders = getFilteredOrders();
    const income = filteredOrders
      .filter(o => o.status === 'completed' || o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    let expenses = 0;
    if (filterPeriod === 'today') expenses = summary.today_expenses || 0;
    else if (filterPeriod === 'week') expenses = summary.week_expenses || 0;
    else if (filterPeriod === 'month') expenses = summary.month_expenses || 0;

    const profit = income - expenses;
    const margin = income > 0 ? Math.round((profit / income) * 100) : 0;
    return { income, expenses, profit, margin };
  };

  const getPaymentData = () => {
    if (filterPeriod === 'today') {
      return {
        cash: summary.today_cash || 0,
        kpay: summary.today_kpay || 0,
        wave: summary.today_wave || 0,
        cashCount: summary.today_cash_count || 0,
        kpayCount: summary.today_kpay_count || 0,
        waveCount: summary.today_wave_count || 0,
      };
    } else if (filterPeriod === 'week') {
      return {
        cash: summary.week_cash || 0,
        kpay: summary.week_kpay || 0,
        wave: summary.week_wave || 0,
        cashCount: summary.week_cash_count || 0,
        kpayCount: summary.week_kpay_count || 0,
        waveCount: summary.week_wave_count || 0,
      };
    } else {
      return {
        cash: summary.month_cash || 0,
        kpay: summary.month_kpay || 0,
        wave: summary.month_wave || 0,
        cashCount: summary.month_cash_count || 0,
        kpayCount: summary.month_kpay_count || 0,
        waveCount: summary.month_wave_count || 0,
      };
    }
  };

  if (loading) return <Loading fullScreen={false} />;

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="text-danger mb-3"><FiAlertCircle size={48} /></div>
        <h5>Failed to load dashboard</h5>
        <p className="text-secondary">{error}</p>
        <div className="mt-3">
          <Button variant="primary" onClick={handleRefresh} className="me-2">
            <FiRefreshCw className="me-2" /> Retry
          </Button>
          <Button variant="outline-secondary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();
  const filteredIncome = filteredOrders
    .filter(o => o.status === 'completed' || o.payment_status === 'paid')
    .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

  const periodData = getPeriodData();
  const paymentData = getPaymentData();

  const statusColors = {
    pending: 'warning',
    collected: 'info',
    washing: 'primary',
    ironing: 'primary',
    ready: 'success',
    delivered: 'success',
    completed: 'secondary'
  };

  const statusIcons = {
    pending: <FiClock />,
    collected: <FiTruck />,
    washing: <FiShoppingBag />,
    ironing: <FiWind />,
    ready: <FiPackage />,
    delivered: <FiTruck />,
    completed: <FiCheckCircle />
  };

  const statusLabels = {
    pending: 'Pending',
    collected: 'Collected',
    washing: 'Washing',
    ironing: 'Ironing',
    ready: 'Ready',
    delivered: 'Delivered',
    completed: 'Completed'
  };

  const statusOrder = ['pending', 'collected', 'washing', 'ironing', 'ready', 'delivered', 'completed'];
  const periodLabels = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month'
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">👑 Admin Dashboard</h4>
          <p className="text-secondary">
            Welcome back, {user?.full_name || 'Admin'}! Here's your business overview.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Spinner animation="border" size="sm" /> : <FiRefreshCw className="me-1" />}
            Refresh
          </Button>
          <Badge bg="danger" className="fs-6 px-3 py-2"><FiGrid className="me-1" /> Admin Full Access</Badge>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm">
              <FiFilter className="me-1" /> {periodLabels[filterPeriod]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterPeriod('today')}>Today</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterPeriod('week')}>This Week</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterPeriod('month')}>This Month</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* MAIN STATS CARDS */}
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100 bg-primary bg-opacity-10">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-secondary">{periodLabels[filterPeriod]}'s Orders</small>
                  <div className="fw-bold fs-3">{filteredOrders.length || 0}</div>
                  <small className="text-success"><FiTrendingUp className="me-1" /> Active</small>
                </div>
                <FiPackage size={30} className="text-primary opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100 bg-success bg-opacity-10">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-secondary">{periodLabels[filterPeriod]}'s Income</small>
                  <div className="fw-bold fs-3">{formatCurrency(filteredIncome || 0)}</div>
                  <small className="text-success"><FiTrendingUp className="me-1" /> Revenue</small>
                </div>
                <FiDollarSign size={30} className="text-success opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100 bg-info bg-opacity-10">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-secondary">Total Customers</small>
                  <div className="fw-bold fs-3">{summary.total_customers || 0}</div>
                  <small className="text-info"><FiUsers className="me-1" /> Active</small>
                </div>
                <FiUsers size={30} className="text-info opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100 bg-warning bg-opacity-10">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-secondary">Pending Orders</small>
                  <div className="fw-bold fs-3">{summary.pending_orders || 0}</div>
                  <small className="text-warning"><FiClock className="me-1" /> Need action</small>
                </div>
                <FiClock size={30} className="text-warning opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FINANCIAL OVERVIEW + PAYMENT COLLECTION + QUICK STATS */}
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3"><FiBarChart2 className="me-2" /> Financial Overview ({periodLabels[filterPeriod]})</h6>
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span className="text-secondary">Income</span>
                <span className="fw-bold text-success">{formatCurrency(periodData.income)}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span className="text-secondary">Expenses</span>
                <span className="fw-bold text-danger">{formatCurrency(periodData.expenses)}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span className="text-secondary">Profit</span>
                <span className="fw-bold text-primary">{formatCurrency(periodData.profit)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Profit Margin</span>
                <span className="fw-bold">{periodData.margin}%</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 h-100 payment-collection-card">
            <Card.Body>
              <h6 className="fw-bold mb-3">
                <FiCreditCard className="me-2" /> Payment Collection ({periodLabels[filterPeriod]})
              </h6>
              
              <div className="d-flex justify-content-between align-items-center p-3 mb-2 rounded payment-item">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px', background: '#28a745' }}>
                    <span style={{ fontSize: '20px' }}>💰</span>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: '14px' }}>Cash</div>
                    <small className="text-secondary">{paymentData.cashCount || 0} orders</small>
                  </div>
                </div>
                <div className="fw-bold text-success" style={{ fontSize: '16px' }}>{formatCurrency(paymentData.cash || 0)}</div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 mb-2 rounded payment-item">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px', background: '#ff6b00' }}>
                    <span style={{ fontSize: '20px' }}>🏦</span>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: '14px' }}>KBZ Pay</div>
                    <small className="text-secondary">{paymentData.kpayCount || 0} orders</small>
                  </div>
                </div>
                <div className="fw-bold" style={{ fontSize: '16px', color: '#ff6b00' }}>{formatCurrency(paymentData.kpay || 0)}</div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 mb-2 rounded payment-item">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px', background: '#0066cc' }}>
                    <span style={{ fontSize: '20px' }}>📱</span>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: '14px' }}>Wave Pay</div>
                    <small className="text-secondary">{paymentData.waveCount || 0} orders</small>
                  </div>
                </div>
                <div className="fw-bold" style={{ fontSize: '16px', color: '#0066cc' }}>{formatCurrency(paymentData.wave || 0)}</div>
              </div>

              <div className="mt-3 pt-2 border-top">
                <div className="d-flex justify-content-between text-secondary small">
                  <span>Total Collected ({periodLabels[filterPeriod]})</span>
                  <span className="fw-bold">{formatCurrency(paymentData.cash + paymentData.kpay + paymentData.wave)}</span>
                </div>
                <div className="d-flex justify-content-between text-secondary small">
                  <span>Total Orders ({periodLabels[filterPeriod]})</span>
                  <span className="fw-bold">{filteredOrders.length || 0}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3"><FiActivity className="me-2" /> Quick Stats</h6>
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span className="text-secondary">This Week Orders</span>
                <span className="fw-bold">{summary.week_orders || 0}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span className="text-secondary">This Week Income</span>
                <span className="fw-bold">{formatCurrency(summary.week_income || 0)}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span className="text-secondary">This Month Orders</span>
                <span className="fw-bold">{summary.month_orders || 0}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">This Month Income</span>
                <span className="fw-bold">{formatCurrency(summary.month_income || 0)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ORDER STATUS OVERVIEW */}
      <h6 className="fw-bold mb-3">📊 Order Status Overview</h6>
      <Row className="g-3 g-md-4 mb-4">
        {statusOrder.map((key) => (
          <Col xs={6} md={3} lg={3} key={key}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="text-center p-3">
                <Badge bg={statusColors[key]} className="mb-2 d-inline-flex align-items-center gap-1">
                  {statusIcons[key]} {statusLabels[key]}
                </Badge>
                <div className="fw-bold fs-2">{stats[key] || 0}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ✅ LIVE DELIVERY TRACKING MAP */}
      <DeliveryLiveMap />

      {/* TOP CUSTOMERS */}
      {topCustomers.length > 0 && (
        <Row className="mb-4">
          <Col xs={12}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white">
                <h6 className="fw-bold mb-0"><FiUsers className="me-2" /> Top Customers</h6>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr><th>#</th><th>Customer Name</th><th>Orders</th><th>Total Spent</th></tr>
                    </thead>
                    <tbody>
                      {topCustomers.map((customer, index) => (
                        <tr key={customer.id}>
                          <td>{index + 1}</td>
                          <td>{customer.name}</td>
                          <td>{customer.orders || 0}</td>
                          <td className="fw-bold">{formatCurrency(customer.total || 0)} MMK</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* RECENT ORDERS */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0"><FiPackage className="me-2" /> Recent Orders ({periodLabels[filterPeriod]})</h6>
          <span className="text-secondary small">{filteredOrders.length || 0} orders</span>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-3">#</th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="text-center pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-secondary">
                      <FiPackage size={40} className="mb-2 opacity-25" />
                      <p>No orders found for {periodLabels[filterPeriod]}</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.slice(0, 30).map((order, index) => (
                    <tr key={order.order_id} className="align-middle">
                      <td className="ps-3">{index + 1}</td>
                      <td>#{order.order_number?.split('-').pop()}</td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>{formatShortDate(order.created_at || order.order_date)}</td>
                      <td>{order.items?.length || 0}</td>
                      <td>
                        <span className={`fw-medium ${order.status === 'completed' || order.payment_status === 'paid' ? 'text-success' : ''}`}>
                          {formatCurrency(order.total_price || 0)} MMK
                        </span>
                      </td>
                      <td><OrderStatusBadge status={order.status} size="sm" /></td>
                      <td>
                        <Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'}>
                          {order.payment_status || 'unpaid'}
                        </Badge>
                      </td>
                      <td className="text-center pe-3">
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          onClick={() => handleViewOrder(order)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          {filteredOrders.length > 30 && (
            <div className="text-center py-2 text-secondary small">
              Showing 30 of {filteredOrders.length} orders
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboard;