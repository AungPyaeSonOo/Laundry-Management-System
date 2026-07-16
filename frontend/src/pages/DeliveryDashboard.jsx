import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Spinner } from 'react-bootstrap';
import { 
  FiTruck, 
  FiPackage, 
  FiDollarSign, 
  FiCalendar, 
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiCreditCard,
  FiHome,
  FiBarChart2,
  FiUser,
  FiPhone,
  FiMapPin,
  FiEye  // ✅ ထည့်ပါ
} from 'react-icons/fi';
import { orderApi } from '../api';
import { formatCurrency, formatShortDate } from '../utils/helpers';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [todayStats, setTodayStats] = useState({
    pending: 0,
    ready: 0,
    delivered: 0,
    cash: 0,
    kpay: 0
  });

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      
      const pendingRes = await orderApi.getAll({ 
        status: 'pending',
        limit: 100
      });
      
      const readyRes = await orderApi.getAll({ 
        status: 'ready',
        limit: 100
      });
      
      const today = new Date().toISOString().split('T')[0];
      const deliveredRes = await orderApi.getAll({ 
        status: 'delivered',
        start_date: today,
        end_date: today,
        limit: 100
      });

      const pending = pendingRes.data.data.orders || [];
      const ready = readyRes.data.data.orders || [];
      const delivered = deliveredRes.data.data.orders || [];

      setPendingOrders(pending);
      setReadyOrders(ready);

      setTodayStats({
        pending: pending.length,
        ready: ready.length,
        delivered: delivered.length,
        cash: delivered.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_price || 0), 0),
        kpay: delivered.filter(o => o.payment_status === 'kpay').reduce((sum, o) => sum + (o.total_price || 0), 0)
      });

    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast.error('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  const handleGoDeliver = async (order) => {
    if (!window.confirm(`Deliver order to ${order.customer?.name}?`)) return;
    
    setProcessing(true);
    try {
      await orderApi.completeNext(order.order_id, {
        notes: 'Delivered to customer by delivery'
      });
      toast.success('✅ Order delivered successfully!');
      fetchDeliveryData();
    } catch (error) {
      console.error('Error delivering order:', error);
      toast.error('Failed to deliver order');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/delivery-order/${order.order_id}`);
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">🚚 Delivery Dashboard</h4>
          <p className="text-secondary">Welcome back, {user?.full_name || 'Delivery'}!</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate('/delivery-history')}
          className="d-flex align-items-center gap-2"
        >
          <FiClock className="me-1" /> History
        </Button>
      </div>

      <Row className="g-3 g-md-4 mb-4">
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiPackage size={30} className="text-warning mb-2" />
              <div className="text-secondary small">Pending Pickups</div>
              <div className="fw-bold fs-3">{todayStats.pending}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiTruck size={30} className="text-success mb-2" />
              <div className="text-secondary small">Ready to Deliver</div>
              <div className="fw-bold fs-3">{todayStats.ready}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiDollarSign size={30} className="text-warning mb-2" />
              <div className="text-secondary small">Cash Collected</div>
              <div className="fw-bold fs-5">{formatCurrency(todayStats.cash)} MMK</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-3">
              <FiCreditCard size={30} className="text-info mb-2" />
              <div className="text-secondary small">Kpay Collected</div>
              <div className="fw-bold fs-5">{formatCurrency(todayStats.kpay)} MMK</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Pickups */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FiClock className="me-2" /> Pending Pickups
            <Badge bg="warning" className="ms-2">{todayStats.pending}</Badge>
          </h6>
          
          {pendingOrders.length === 0 ? (
            <div className="text-center text-secondary py-4">
              <FiCheckCircle size={40} className="mb-2 opacity-25" />
              <p>No pending pickups</p>
            </div>
          ) : (
            <div className="row g-3">
              {pendingOrders.map((order) => (
                <div key={order.order_id} className="col-md-6 col-lg-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="warning">Pending Pickup</Badge>
                        <small className="text-secondary">#{formatOrderId(order.order_number)}</small>
                      </div>

                      <div className="mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <FiUser className="text-primary" />
                          <span className="fw-medium">{order.customer?.name || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <FiPhone className="text-success" />
                          <span>{order.customer?.phone || 'N/A'}</span>
                        </div>
                      </div>

                      {order.customer?.address && (
                        <div className="mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <FiMapPin className="text-danger" />
                            <span className="text-truncate" style={{ maxWidth: '200px' }}>
                              {order.customer.address}
                            </span>
                          </div>
                        </div>
                      )}

                      {order.pickup_date && (
                        <div className="mb-2">
                          <small className="text-secondary">
                            <FiCalendar className="me-1" /> 
                            Pickup: {formatShortDate(order.pickup_date)}
                          </small>
                        </div>
                      )}

                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-100 mt-2"
                        onClick={() => handleViewOrder(order)}
                      >
                        <FiTruck className="me-1" /> View & Pickup
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Ready for Delivery */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FiPackage className="me-2" /> Ready for Delivery
            <Badge bg="success" className="ms-2">{todayStats.ready}</Badge>
          </h6>
          
          {readyOrders.length === 0 ? (
            <div className="text-center text-secondary py-4">
              <FiPackage size={40} className="mb-2 opacity-25" />
              <p>No orders ready for delivery</p>
            </div>
          ) : (
            <div className="row g-3">
              {readyOrders.map((order) => (
                <div key={order.order_id} className="col-md-6 col-lg-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="success">Ready for Delivery</Badge>
                        <small className="text-secondary">#{formatOrderId(order.order_number)}</small>
                      </div>

                      <div className="mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <FiUser className="text-primary" />
                          <span className="fw-medium">{order.customer?.name || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <FiPhone className="text-success" />
                          <span>{order.customer?.phone || 'N/A'}</span>
                        </div>
                      </div>

                      {order.customer?.address && (
                        <div className="mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <FiMapPin className="text-danger" />
                            <span className="text-truncate" style={{ maxWidth: '200px' }}>
                              {order.customer.address}
                            </span>
                          </div>
                        </div>
                      )}

                      {order.delivery_date && (
                        <div className="mb-2">
                          <small className="text-secondary">
                            <FiCalendar className="me-1" /> 
                            Delivery: {formatShortDate(order.delivery_date)}
                          </small>
                        </div>
                      )}

                      <div className="d-grid gap-2">
                        <Button 
                          variant="success" 
                          size="sm"
                          className="w-100"
                          onClick={() => handleGoDeliver(order)}
                          disabled={processing}
                        >
                          {processing ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <><FiCheckCircle className="me-1" /> Go Deliver</>
                          )}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          className="w-100"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FiEye className="me-1" /> View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

// Helper function
const formatOrderId = (orderNumber) => {
  if (!orderNumber) return 'N/A';
  const parts = orderNumber.split('-');
  if (parts.length >= 3) {
    return parts[parts.length - 1];
  }
  return orderNumber;
};

export default DeliveryDashboard;