import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Spinner, Form, Alert, Container } from 'react-bootstrap';
import { 
  FiUser, 
  FiPhone, 
  FiPackage, 
  FiMapPin, 
  FiCalendar, 
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
  FiNavigation,
  FiTarget,
  FiHome
} from 'react-icons/fi';
import { orderApi } from '../api';
import { formatPrice, formatLongDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';

const WasherOrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getById(id);
      setOrder(response.data.data);
    } catch (error) {
      toast.error('Failed to load order');
      navigate('/washer-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWash = async () => {
    if (!window.confirm('Start washing this order?')) {
      return;
    }

    setProcessing(true);
    try {
      await orderApi.completeNext(order.order_id, { 
        notes: notes || 'Started washing' 
      });
      toast.success('✅ Washing started!');
      navigate('/washer-dashboard');
    } catch (error) {
      toast.error('Failed to start washing');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteWash = async () => {
    if (!window.confirm('Complete washing and send to ironing?')) {
      return;
    }

    setProcessing(true);
    try {
      await orderApi.completeNext(order.order_id, { 
        notes: notes || 'Washing completed, sent to ironing' 
      });
      toast.success('✅ Washing completed! Sent to ironing.');
      navigate('/washer-dashboard');
    } catch (error) {
      toast.error('Failed to complete washing');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!order) return <div className="text-center py-5">Order not found</div>;

  const isCollected = order.status === 'collected';
  const isWashing = order.status === 'washing';

  return (
    <Container fluid className="animate-fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate('/washer-dashboard')}
            className="back-btn"
            title="Back to Dashboard"
          >
            <FiArrowLeft className="back-btn-icon" />
            <span className="back-btn-label">Back</span>
          </button>
          <div>
            <h4 className="fw-bold mb-1">🧺 Order Details</h4>
            <p className="text-secondary">Order #{order.order_number}</p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} size="md" />
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3">
                <FiUser className="me-2" /> Customer Details
              </h6>
              <div className="mb-2">
                <strong>Name:</strong> {order.customer?.name || 'N/A'}
              </div>
              <div className="mb-2">
                <strong>Phone:</strong> {order.customer?.phone || 'N/A'}
              </div>
              <div className="mb-2">
                <strong>Address:</strong> {order.customer?.address || 'N/A'}
              </div>
              <div>
                <strong>Pickup Date:</strong> {formatLongDate(order.pickup_date)}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3">
                <FiPackage className="me-2" /> Order Summary
              </h6>
              <div className="mb-2">
                <strong>Items:</strong> {order.items?.length || 0}
              </div>
              <div className="mb-2">
                <strong>Total:</strong> {formatPrice(order.total_price)} MMK
              </div>
              <div>
                <strong>Notes:</strong> {order.notes || 'N/A'}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3">
            {isCollected && (
              <Col xs={12}>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="w-100 py-3"
                  onClick={handleStartWash}
                  disabled={processing}
                >
                  {processing ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <><FiTruck className="me-2" /> Start Washing</>
                  )}
                </Button>
              </Col>
            )}

            {isWashing && (
              <Col xs={12}>
                <Button 
                  variant="success" 
                  size="lg"
                  className="w-100 py-3"
                  onClick={handleCompleteWash}
                  disabled={processing}
                >
                  {processing ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <><FiCheckCircle className="me-2" /> Complete Wash & Send to Ironing</>
                  )}
                </Button>
              </Col>
            )}

            {!isCollected && !isWashing && (
              <Col xs={12}>
                <Alert variant="info">
                  This order is already in progress or completed.
                </Alert>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {order.items && order.items.length > 0 && (
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h6 className="fw-bold mb-3">Items</h6>
            {order.items.map((item, index) => (
              <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                <div>
                  <span className="fw-medium">
                    {item.clothing_type?.type_name || `Item ${index + 1}`}
                  </span>
                  <span className="text-secondary ms-2">x{item.quantity}</span>
                </div>
                <span className="fw-bold">{formatPrice(item.total_price)} MMK</span>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

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
    </Container>
  );
};

export default WasherOrderDetail;