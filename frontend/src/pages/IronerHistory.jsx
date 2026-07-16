import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Form } from 'react-bootstrap';
import { 
  FiPackage, 
  FiCalendar, 
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
  FiFilter,
  FiUser,
  FiBarChart2,
  FiWind,
  FiShoppingBag
} from 'react-icons/fi';
import { orderApi } from '../api';
import { formatCurrency, formatShortDate } from '../utils/helpers';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';

const IronerHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('today');
  const [stats, setStats] = useState({
    incoming: 0,      // washing (ဝင်လာတာ)
    in_progress: 0,   // ironing (လုပ်နေတာ)
    completed: 0      // ready (ပြီးသွားတာ - Packer ဆီပို့)
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
        default:
          params = { start_date: todayStr, end_date: todayStr };
      }

      // ✅ Ironer နဲ့ဆိုင်တဲ့ Status တွေပဲယူ
      const response = await orderApi.getAll({ 
        ...params,
        status: ['washing', 'ironing', 'ready'],
        limit: 200
      });
      
      const allOrders = response.data.data.orders || [];
      setOrders(allOrders);

      setStats({
        incoming: allOrders.filter(o => o.status === 'washing').length,
        in_progress: allOrders.filter(o => o.status === 'ironing').length,
        completed: allOrders.filter(o => o.status === 'ready').length  // ✅ Packer ဆီပို့
      });

    } catch (error) {
      console.error('Error fetching ironer history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate('/ironer-dashboard')}
            className="back-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '50px',
              padding: '8px 16px 8px 12px',
              color: '#1e293b',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.color = '#6366f1';
              e.currentTarget.style.transform = 'translateX(-3px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#1e293b';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
            }}
          >
            <FiArrowLeft className="back-btn-icon" />
            <span className="back-btn-label">Back</span>
          </button>
          <div>
            <h4 className="fw-bold mb-1">📊 Ironer History</h4>
            <p className="text-secondary mb-0">View your ironing history</p>
          </div>
        </div>
      </div>

      <Row className="g-3 g-md-4 mb-4">
        <Col xs={6} md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiShoppingBag size={24} className="text-warning mb-2" />
              <div className="text-secondary small">Incoming (From Washer)</div>
              <div className="fw-bold fs-3">{stats.incoming}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiWind size={24} className="text-primary mb-2" />
              <div className="text-secondary small">In Progress</div>
              <div className="fw-bold fs-3">{stats.in_progress}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiCheckCircle size={24} className="text-success mb-2" />
              <div className="text-secondary small">Completed (Sent to Packer)</div>
              <div className="fw-bold fs-3">{stats.completed}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
            </Form.Select>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      <FiPackage size={40} className="mb-2 opacity-25" />
                      <p>No orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order.order_id} className="align-middle">
                      <td className="ps-3">{index + 1}</td>
                      <td>#{order.order_number?.split('-').pop()}</td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FiCalendar size={12} className="text-secondary" />
                          {formatShortDate(order.created_at)}
                        </div>
                      </td>
                      <td>{order.items?.length || 0}</td>
                      <td>
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default IronerHistory;