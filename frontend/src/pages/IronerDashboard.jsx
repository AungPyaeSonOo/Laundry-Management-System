import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Spinner } from 'react-bootstrap';
import { 
  FiPackage, 
  FiCheckCircle,
  FiClock,
  FiUser,
  FiPhone,
  FiCalendar,
  FiLoader,
  FiBarChart2,
  FiTrendingUp,
  FiRefreshCw,
  FiShoppingBag,
  FiWind
} from 'react-icons/fi';
import { orderApi } from '../api';
import { formatCurrency, formatShortDate } from '../utils/helpers';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';

const IronerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [washingOrders, setWashingOrders] = useState([]);
  const [ironingOrders, setIroningOrders] = useState([]);
  const [stats, setStats] = useState({
    to_iron: 0,
    ironing: 0,
    completed: 0,
    today: 0
  });

  useEffect(() => {
    fetchIronerData();
  }, []);

  const fetchIronerData = async () => {
    try {
      setLoading(true);
      
      // ✅ Ironer ဆီဝင်လာတဲ့ Order (washing)
      const washingRes = await orderApi.getAll({ 
        status: 'washing',
        limit: 100
      });
      
      // ✅ Ironer က လုပ်ဆောင်နေတဲ့ Order (ironing)
      const ironingRes = await orderApi.getAll({ 
        status: 'ironing',
        limit: 100
      });
      
      // ✅ Ironer က ပြီးမြောက်ပြီးသား (ready - Packer ဆီပို့)
      const completedRes = await orderApi.getAll({ 
        status: 'ready',
        limit: 100
      });

      const washing = washingRes.data.data.orders || [];
      const ironing = ironingRes.data.data.orders || [];
      const completed = completedRes.data.data.orders || [];

      setWashingOrders(washing);
      setIroningOrders(ironing);

      const today = new Date().toISOString().split('T')[0];
      const todayWashing = washing.filter(o => o.created_at?.split('T')[0] === today);
      
      setStats({
        to_iron: washing.length,
        ironing: ironing.length,
        completed: completed.length,
        today: todayWashing.length
      });

    } catch (error) {
      console.error('Error fetching ironer data:', error);
      toast.error('Failed to load ironer data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/ironer-order/${order.order_id}`);
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">👕 Ironer Dashboard</h4>
          <p className="text-secondary">Welcome back, {user?.full_name || 'Ironer'}!</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate('/ironer-history')}
          className="d-flex align-items-center gap-2"
        >
          <FiBarChart2 className="me-1" /> History
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiShoppingBag size={24} className="text-warning mb-2" />
              <div className="text-secondary small">To Iron</div>
              <div className="fw-bold fs-3">{stats.to_iron}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiWind size={24} className="text-primary mb-2" />
              <div className="text-secondary small">Ironing</div>
              <div className="fw-bold fs-3">{stats.ironing}</div>
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
              <div className="text-secondary small">Completed (Sent to Packer)</div>
              <div className="fw-bold fs-3">{stats.completed}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders to Iron */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FiShoppingBag className="me-2" /> Orders to Iron
            <Badge bg="warning" className="ms-2">{stats.to_iron}</Badge>
          </h6>
          
          {washingOrders.length === 0 ? (
            <div className="text-center text-secondary py-4">
              <FiCheckCircle size={40} className="mb-2 opacity-25" />
              <p>No orders to iron</p>
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
                  {washingOrders.map((order, index) => (
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
                          <FiWind className="me-1" /> Start Ironing
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

      {/* Ironing in Progress */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FiWind className="me-2" /> Ironing in Progress
            <Badge bg="primary" className="ms-2">{stats.ironing}</Badge>
          </h6>
          
          {ironingOrders.length === 0 ? (
            <div className="text-center text-secondary py-4">
              <FiLoader size={40} className="mb-2 opacity-25" />
              <p>No orders currently ironing</p>
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
                  {ironingOrders.map((order) => (
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
                          <FiCheckCircle className="me-1" /> Complete Ironing
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

export default IronerDashboard;