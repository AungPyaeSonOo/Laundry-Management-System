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
  FiBox
} from 'react-icons/fi';
import { orderApi } from '../api';
import { formatCurrency, formatShortDate } from '../utils/helpers';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';

const PackerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ironingOrders, setIroningOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [stats, setStats] = useState({
    to_pack: 0,
    packed: 0,
    delivered: 0,
    today: 0
  });

  useEffect(() => {
    fetchPackerData();
  }, []);

  const fetchPackerData = async () => {
    try {
      setLoading(true);
      
      // ✅ Packer ဆီဝင်လာတဲ့ Order (ironing)
      const ironingRes = await orderApi.getAll({ 
        status: 'ironing',
        limit: 100
      });
      
      // ✅ Packer က လုပ်ဆောင်နေတဲ့ Order (ready)
      const readyRes = await orderApi.getAll({ 
        status: 'ready',
        limit: 100
      });
      
      // ✅ Packer က ပြီးမြောက်ပြီးသား (delivered - Delivery ဆီပို့)
      const deliveredRes = await orderApi.getAll({ 
        status: 'delivered',
        limit: 100
      });

      const ironing = ironingRes.data.data.orders || [];
      const ready = readyRes.data.data.orders || [];
      const delivered = deliveredRes.data.data.orders || [];

      setIroningOrders(ironing);
      setReadyOrders(ready);

      const today = new Date().toISOString().split('T')[0];
      const todayIroning = ironing.filter(o => o.created_at?.split('T')[0] === today);
      
      setStats({
        to_pack: ironing.length,
        packed: ready.length,
        delivered: delivered.length,
        today: todayIroning.length
      });

    } catch (error) {
      console.error('Error fetching packer data:', error);
      toast.error('Failed to load packer data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/packer-order/${order.order_id}`);
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">📦 Packer Dashboard</h4>
          <p className="text-secondary">Welcome back, {user?.full_name || 'Packer'}!</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate('/packer-history')}
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
              <div className="text-secondary small">To Pack</div>
              <div className="fw-bold fs-3">{stats.to_pack}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiBox size={24} className="text-primary mb-2" />
              <div className="text-secondary small">In Progress</div>
              <div className="fw-bold fs-3">{stats.packed}</div>
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
              <div className="text-secondary small">Completed (Sent to Delivery)</div>
              <div className="fw-bold fs-3">{stats.delivered}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders to Pack */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FiShoppingBag className="me-2" /> Orders to Pack
            <Badge bg="warning" className="ms-2">{stats.to_pack}</Badge>
          </h6>
          
          {ironingOrders.length === 0 ? (
            <div className="text-center text-secondary py-4">
              <FiCheckCircle size={40} className="mb-2 opacity-25" />
              <p>No orders to pack</p>
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
                  {ironingOrders.map((order, index) => (
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
                          <FiBox className="me-1" /> Start Packing
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

      {/* Packed & Ready for Delivery */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FiBox className="me-2" /> Packed & Ready for Delivery
            <Badge bg="success" className="ms-2">{stats.packed}</Badge>
          </h6>
          
          {readyOrders.length === 0 ? (
            <div className="text-center text-secondary py-4">
              <FiLoader size={40} className="mb-2 opacity-25" />
              <p>No orders packed yet</p>
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
                  {readyOrders.map((order) => (
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
                          variant="success"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FiCheckCircle className="me-1" /> Send to Delivery
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

export default PackerDashboard;