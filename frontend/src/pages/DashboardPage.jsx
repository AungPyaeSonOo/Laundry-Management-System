import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { 
  FiFileText, 
  FiUsers, 
  FiDollarSign, 
  FiPackage,
  FiBarChart2,
  FiAlertCircle
} from 'react-icons/fi';
import { dashboardApi } from '../api';
import StatsCard from '../components/dashboard/StatsCard';
import RecentOrders from '../components/dashboard/RecentOrders';
import IncomeChart from '../components/dashboard/IncomeChart';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import { Button } from 'react-bootstrap';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = user?.role || 'employee';
  const isAdmin = ['admin', 'accountant', 'manager'].includes(userRole);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen={false} />;
  
  if (error) {
    return (
      <div className="text-center py-5">
        <div className="text-danger mb-3">
          <FiAlertCircle size={48} />
        </div>
        <h5>Failed to load dashboard</h5>
        <p className="text-secondary">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  const summary = stats?.summary || {};

  // Role-based title
  const getDashboardTitle = () => {
    switch(userRole) {
      case 'accountant': return 'Financial Dashboard';
      case 'manager': return 'Management Dashboard';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">📊 {getDashboardTitle()}</h4>
        <p className="text-secondary">Welcome back, {user?.full_name || 'User'}! 👋</p>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <StatsCard 
            icon={FiFileText}
            label="Today's Orders"
            value={summary.today_orders || 0}
            color="primary"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatsCard 
            icon={FiDollarSign}
            label="Today's Income"
            value={`${(summary.today_income || 0).toLocaleString()} MMK`}
            color="success"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatsCard 
            icon={FiUsers}
            label="Total Customers"
            value={summary.total_customers || 0}
            color="info"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatsCard 
            icon={FiPackage}
            label="Pending Orders"
            value={summary.pending_orders || 0}
            color="warning"
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-3 g-md-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3">Income Overview</h6>
              <IncomeChart />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3">Order Status</h6>
              <StatusPieChart />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row className="g-3 g-md-4 mt-2">
        <Col xs={12}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="fw-bold mb-3">Recent Orders</h6>
              <RecentOrders orders={stats?.recent_orders || []} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="g-3 g-md-4 mt-2">
        <Col xs={6} md={3}>
          <div className="bg-white rounded-3 p-3 shadow-sm text-center">
            <div className="text-secondary small">Monthly Income</div>
            <div className="fw-bold fs-5 text-success">
              {(summary.monthly_income || 0).toLocaleString()} MMK
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-white rounded-3 p-3 shadow-sm text-center">
            <div className="text-secondary small">Monthly Expenses</div>
            <div className="fw-bold fs-5 text-danger">
              {(summary.monthly_expenses || 0).toLocaleString()} MMK
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-white rounded-3 p-3 shadow-sm text-center">
            <div className="text-secondary small">Monthly Profit</div>
            <div className="fw-bold fs-5 text-primary">
              {(summary.monthly_profit || 0).toLocaleString()} MMK
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-white rounded-3 p-3 shadow-sm text-center">
            <div className="text-secondary small">Low Stock Items</div>
            <div className="fw-bold fs-5 text-warning">
              {summary.low_stock_items || 0}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;