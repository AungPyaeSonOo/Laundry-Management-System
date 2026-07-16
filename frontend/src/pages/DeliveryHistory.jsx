import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Spinner, Form } from 'react-bootstrap';
import { 
  FiTruck, 
  FiPackage, 
  FiDollarSign, 
  FiCalendar, 
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiCreditCard,
  FiBarChart2,
  FiArrowLeft,
  FiFilter
} from 'react-icons/fi';
import { orderApi } from '../api';
import { formatCurrency, formatShortDate, formatLongDate } from '../utils/helpers';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DeliveryHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('today');
  const [stats, setStats] = useState({
    total: 0,
    pickups: 0,
    deliveries: 0,
    cash: 0,
    kpay: 0
  });
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      let params = {};
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      switch(filter) {
        case 'today':
          params = { start_date: todayStr, end_date: todayStr };
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - 7);
          params = { start_date: weekStart.toISOString().split('T')[0], end_date: todayStr };
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          params = { start_date: monthStart.toISOString().split('T')[0], end_date: todayStr };
          break;
        case 'year':
          const yearStart = new Date(today.getFullYear(), 0, 1);
          params = { start_date: yearStart.toISOString().split('T')[0], end_date: todayStr };
          break;
        case 'custom':
          if (dateRange.start && dateRange.end) {
            params = { start_date: dateRange.start, end_date: dateRange.end };
          }
          break;
        default:
          params = { start_date: todayStr, end_date: todayStr };
      }

      // Get orders for delivery
      const response = await orderApi.getAll({ 
        ...params,
        limit: 200
      });
      
      const allOrders = response.data.data.orders || [];
      setOrders(allOrders);

      // Calculate stats
      const deliveredOrders = allOrders.filter(o => 
        o.status === 'delivered' || o.status === 'completed'
      );
      
      setStats({
        total: allOrders.length,
        pickups: allOrders.filter(o => o.status === 'collected').length,
        deliveries: deliveredOrders.length,
        cash: deliveredOrders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_price || 0), 0),
        kpay: deliveredOrders.filter(o => o.payment_status === 'kpay').reduce((sum, o) => sum + (o.total_price || 0), 0)
      });

    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      collected: 'info',
      washing: 'primary',
      ironing: 'primary',
      ready: 'success',
      delivered: 'success',
      completed: 'secondary',
      cancelled: 'danger'
    };
    return colors[status] || 'secondary';
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header with Back Button */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate('/delivery-dashboard')}
            className="back-btn"
            title="Back to Dashboard"
          >
            <FiArrowLeft className="back-btn-icon" />
            <span className="back-btn-label">Back</span>
          </button>
          <div>
            <h4 className="fw-bold mb-1">📊 Delivery History</h4>
            <p className="text-secondary mb-0">View your delivery history and earnings</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiPackage size={24} className="text-primary mb-2" />
              <div className="text-secondary small">Total Orders</div>
              <div className="fw-bold fs-3">{stats.total}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiTruck size={24} className="text-success mb-2" />
              <div className="text-secondary small">Deliveries</div>
              <div className="fw-bold fs-3">{stats.deliveries}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiDollarSign size={24} className="text-warning mb-2" />
              <div className="text-secondary small">Cash Collected</div>
              <div className="fw-bold fs-5">{formatCurrency(stats.cash)} MMK</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiCreditCard size={24} className="text-info mb-2" />
              <div className="text-secondary small">Kpay Collected</div>
              <div className="fw-bold fs-5">{formatCurrency(stats.kpay)} MMK</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <FiFilter className="text-secondary" />
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-3"
              style={{ width: '150px' }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </Form.Select>

            {filter === 'custom' && (
              <>
                <Form.Control
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="rounded-3"
                  style={{ width: '160px' }}
                />
                <Form.Control
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="rounded-3"
                  style={{ width: '160px' }}
                />
                <Button variant="primary" size="sm" onClick={fetchHistory}>
                  Apply
                </Button>
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-3">Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <FiPackage size={40} className="mb-2 opacity-25" />
                      <p>No orders found for this period</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.order_id} className="align-middle">
                      <td className="ps-3">
                        <span className="fw-medium">#{order.order_number?.split('-').pop()}</span>
                      </td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FiCalendar size={12} className="text-secondary" />
                          {formatShortDate(order.created_at)}
                        </div>
                      </td>
                      <td>{order.items?.length || 0}</td>
                      <td>
                        <span className="fw-bold">
                          {formatCurrency(order.total_price)} MMK
                        </span>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(order.status)}>
                          {order.status || 'pending'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'}>
                          {order.payment_status || 'unpaid'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* CSS for Back Button */}
      <style jsx>{`
        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 50px;
          padding: 8px 16px 8px 12px;
          color: #1e293b;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .back-btn:hover {
          background: #f8fafc;
          border-color: #6366f1;
          color: #6366f1;
          transform: translateX(-3px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .back-btn-icon {
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        .back-btn:hover .back-btn-icon {
          transform: translateX(-2px);
        }

        .back-btn-label {
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default DeliveryHistory;