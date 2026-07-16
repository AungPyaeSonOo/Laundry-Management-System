import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Spinner } from 'react-bootstrap';
import { 
  FiPackage, 
  FiCheckCircle,
  FiClock,
  FiUser,
  FiPhone,
  FiCalendar,
  FiLoader,  // ✅ Washing icon
  FiBarChart2,
  FiTrendingUp,
  FiRefreshCw,  // ✅ Wash icon
  FiShoppingBag  // ✅ Order icon
} from 'react-icons/fi';
import { orderApi } from '../api';
import { formatCurrency, formatShortDate } from '../utils/helpers';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';

const WasherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [collectedOrders, setCollectedOrders] = useState([]);
  const [washingOrders, setWashingOrders] = useState([]);
  const [stats, setStats] = useState({
    collected: 0,
    washing: 0,
    completed: 0,
    today: 0
  });

  useEffect(() => {
    fetchWasherData();
  }, []);

  const fetchWasherData = async () => {
    try {
      setLoading(true);
      
      const collectedRes = await orderApi.getAll({ 
        status: 'collected',
        limit: 100
      });
      
      const washingRes = await orderApi.getAll({ 
        status: 'washing',
        limit: 100
      });
      
      const completedRes = await orderApi.getAll({ 
        status: 'ironing',
        limit: 100
      });

      const collected = collectedRes.data.data.orders || [];
      const washing = washingRes.data.data.orders || [];
      const completed = completedRes.data.data.orders || [];

      setCollectedOrders(collected);
      setWashingOrders(washing);

      const today = new Date().toISOString().split('T')[0];
      const todayCollected = collected.filter(o => o.created_at?.split('T')[0] === today);
      
      setStats({
        collected: collected.length,
        washing: washing.length,
        completed: completed.length,
        today: todayCollected.length
      });

    } catch (error) {
      console.error('Error fetching washer data:', error);
      toast.error('Failed to load washer data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/washer-order/${order.order_id}`);
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">🧺 Washer Dashboard</h4>
          <p className="text-secondary">Welcome back, {user?.full_name || 'Washer'}!</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate('/washer-history')}
          className="d-flex align-items-center gap-2"
        >
          <FiBarChart2 className="me-1" /> History
        </Button>
      </div>

      {/* Stats Cards - Icons ပြောင်းပြီး */}
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiShoppingBag size={24} className="text-warning mb-2" />
              <div className="text-secondary small">To Wash</div>
              <div className="fw-bold fs-3">{stats.collected}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiRefreshCw size={24} className="text-primary mb-2" />
              <div className="text-secondary small">Washing</div>
              <div className="fw-bold fs-3">{stats.washing}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiCheckCircle size={24} className="text-success mb-2" />
              <div className="text-secondary small">Today's Tasks</div>
              <div className="fw-bold fs-3">{stats.today}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiPackage size={24} className="text-info mb-2" />
              <div className="text-secondary small">Completed</div>
              <div className="fw-bold fs-3">{stats.completed}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders to Wash */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FiShoppingBag className="me-2" /> Orders to Wash
            <Badge bg="warning" className="ms-2">{stats.collected}</Badge>
          </h6>
          
          {collectedOrders.length === 0 ? (
            <div className="text-center text-secondary py-4">
              <FiCheckCircle size={40} className="mb-2 opacity-25" />
              <p>No orders to wash</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collectedOrders.map((order, index) => (
                    <tr key={order.order_id}>
                      <td>#{order.order_number?.split('-').pop()}</td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>{order.customer?.phone || 'N/A'}</td>
                      <td>{order.items?.length || 0}</td>
                      <td>
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FiRefreshCw className="me-1" /> Start Wash
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Washing in Progress */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FiRefreshCw className="me-2" /> Washing in Progress
            <Badge bg="primary" className="ms-2">{stats.washing}</Badge>
          </h6>
          
          {washingOrders.length === 0 ? (
            <div className="text-center text-secondary py-4">
              <FiLoader size={40} className="mb-2 opacity-25" />
              <p>No orders currently washing</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Started</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {washingOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>#{order.order_number?.split('-').pop()}</td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>{formatShortDate(order.updated_at)}</td>
                      <td>{order.items?.length || 0}</td>
                      <td>
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FiCheckCircle className="me-1" /> Complete Wash
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default WasherDashboard;