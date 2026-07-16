import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FiNavigation,
  FiArrowLeft,
  FiDollarSign,
  FiCreditCard,
  FiCornerDownRight
} from 'react-icons/fi';
import { orderApi } from '../api';
import { formatPrice, formatLongDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const DeliveryOrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  
  // ✅ Payment state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const watchIdRef = useRef(null);
  const locationTimeoutRef = useRef(null);

  useEffect(() => {
    fetchOrder();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getById(id);
      setOrder(response.data.data);
      // Set default payment amount
      const remaining = response.data.data.total_price - response.data.data.paid_amount;
      setPaymentAmount(remaining > 0 ? remaining.toString() : '0');
    } catch (error) {
      toast.error('Failed to load order');
      navigate('/delivery-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const sendLocation = useCallback(async (lat, lng) => {
    try {
      await orderApi.updateLocation(order?.order_id, { lat, lng });
    } catch (error) {
      // Silent fail
    }
  }, [order?.order_id]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported');
      return;
    }

    setIsTracking(true);
    toast.success('📍 Tracking started!');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setLocation(loc);
        sendLocation(loc.lat, loc.lng);
      },
      (error) => {
        toast.error('Unable to get location');
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setLocation(loc);
        
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
        }
        locationTimeoutRef.current = setTimeout(() => {
          sendLocation(loc.lat, loc.lng);
        }, 10000);
      },
      (error) => console.error('GPS error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
    
    watchIdRef.current = watchId;
  }, [sendLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
    setIsTracking(false);
    toast.info('Tracking stopped');
  }, []);

  // ✅ Complete Delivery with Payment
  const handleCompleteDelivery = useCallback(async () => {
    if (!showPaymentForm) {
      setShowPaymentForm(true);
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select payment method');
      return;
    }

    const amount = parseFloat(paymentAmount) || order?.total_price;
    if (amount <= 0) {
      toast.error('Please enter valid payment amount');
      return;
    }

    if (!window.confirm(`Confirm delivery and collect ${formatPrice(amount)} MMK via ${paymentMethod.toUpperCase()}?`)) {
      return;
    }

    setProcessing(true);
    try {
      await orderApi.completeNext(order.order_id, {
        notes: notes || `Order delivered. Payment collected via ${paymentMethod}`,
        payment_method: paymentMethod,
        payment_reference: paymentReference || undefined,
        amount: amount
      });
      toast.success(`✅ Order delivered! ${formatPrice(amount)} MMK collected via ${paymentMethod.toUpperCase()}`);
      stopTracking();
      navigate('/delivery-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete delivery');
    } finally {
      setProcessing(false);
    }
  }, [order?.order_id, notes, stopTracking, navigate, showPaymentForm, paymentMethod, paymentReference, paymentAmount, order?.total_price]);

  // ✅ Complete Pickup
  const handleCompletePickup = useCallback(async () => {
    if (!window.confirm('Confirm you have picked up the items?')) {
      return;
    }

    setProcessing(true);
    try {
      await orderApi.completeNext(order.order_id, { 
        notes: notes || 'Pickup completed, items collected' 
      });
      toast.success('✅ Pickup completed! Items are collected.');
      stopTracking();
      navigate('/delivery-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete pickup');
    } finally {
      setProcessing(false);
    }
  }, [order?.order_id, notes, stopTracking, navigate]);

  const handleGoBack = () => {
    if (isTracking) {
      if (!window.confirm('Tracking is active. Stop tracking and go back?')) {
        return;
      }
      stopTracking();
    }
    navigate('/delivery-dashboard');
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border" variant="primary" />
    </div>
  );
  
  if (!order) return (
    <div className="text-center py-5 text-secondary">Order not found</div>
  );

  const isPending = order.status === 'pending';
  const isReady = order.status === 'ready';
  const isDelivered = order.status === 'delivered';
  const remainingAmount = order.total_price - order.paid_amount;

  const getPageTitle = () => {
    if (isPending) return '🚚 Pickup Order';
    if (isReady) return '📦 Deliver Order & Collect Payment';
    if (isDelivered) return '✅ Order Delivered';
    return '📋 Order Details';
  };

  const getStatusBadge = () => {
    if (isPending) {
      return <Badge bg="warning" className="px-3 py-2"><FiClock className="me-1" /> Pending Pickup</Badge>;
    }
    if (isReady) {
      return <Badge bg="success" className="px-3 py-2"><FiTruck className="me-1" /> Ready for Delivery</Badge>;
    }
    if (isDelivered) {
      return <Badge bg="info" className="px-3 py-2"><FiCheckCircle className="me-1" /> Delivered</Badge>;
    }
    return <Badge bg="secondary">{order.status}</Badge>;
  };

  return (
    <Container fluid className="animate-fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={handleGoBack}
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
            <FiArrowLeft style={{ fontSize: '18px', transition: 'transform 0.3s ease' }} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Back</span>
          </button>
          <div>
            <h4 className="fw-bold mb-1">{getPageTitle()}</h4>
            <p className="text-secondary mb-0">Order #{order.order_number}</p>
          </div>
        </div>
        {getStatusBadge()}
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
              {order.delivery_date && (
                <div className="mt-1">
                  <strong>Delivery Date:</strong> {formatLongDate(order.delivery_date)}
                </div>
              )}
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
              <div className="mb-2">
                <strong>Paid:</strong> {formatPrice(order.paid_amount)} MMK
              </div>
              {remainingAmount > 0 && (
                <div className="mb-2">
                  <strong className="text-danger">Remaining:</strong> {formatPrice(remainingAmount)} MMK
                </div>
              )}
              <div>
                <strong>Notes:</strong> {order.notes || 'N/A'}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ✅ Payment Form for Delivery */}
      {isReady && showPaymentForm && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body>
            <h6 className="fw-bold mb-3">
              <FiDollarSign className="me-2" /> Collect Payment from Customer
            </h6>
            <Row className="g-3">
              <Col xs={12} md={4}>
                <Form.Label>Payment Method</Form.Label>
                <div className="d-flex gap-2">
                  {['cash', 'kpay', 'wave_pay'].map((method) => (
                    <Button
                      key={method}
                      variant={paymentMethod === method ? 'primary' : 'outline-secondary'}
                      onClick={() => setPaymentMethod(method)}
                      className="flex-grow-1"
                      size="sm"
                    >
                      {method === 'cash' && '💰 Cash'}
                      {method === 'kpay' && '📱 KPay'}
                      {method === 'wave_pay' && '📱 Wave Pay'}
                    </Button>
                  ))}
                </div>
              </Col>
              <Col xs={12} md={4}>
                <Form.Label>Amount (MMK)</Form.Label>
                <Form.Control
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  step="1000"
                />
              </Col>
              {(paymentMethod === 'kpay' || paymentMethod === 'wave_pay') && (
                <Col xs={12} md={4}>
                  <Form.Label>Transaction Reference</Form.Label>
                  <Form.Control
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter transaction ref"
                  />
                </Col>
              )}
            </Row>
            {paymentMethod === 'cash' && (
              <Alert variant="warning" className="mt-3">
                <FiCornerDownRight className="me-2" />
                <strong>Note:</strong> Cash collected must be submitted to Admin/Manager/Accountant when you return to office.
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3">
            {!isTracking ? (
              <Col xs={12}>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="w-100 py-3"
                  onClick={startTracking}
                >
                  <FiNavigation className="me-2" /> 
                  {isPending ? 'Start Pickup & Track Location' : 'Start Delivery & Track Location'}
                </Button>
                <div className="text-secondary small mt-2">
                  📍 GPS will track your location during {isPending ? 'pickup' : 'delivery'}
                </div>
              </Col>
            ) : (
              <Col xs={12}>
                <Alert variant="info" className="mb-3">
                  <FiNavigation className="me-2" /> 
                  📍 Location tracking is active
                  {location && (
                    <span className="ms-2">
                      ({location.lat.toFixed(6)}, {location.lng.toFixed(6)})
                    </span>
                  )}
                </Alert>

                <div className="d-grid gap-2">
                  {isPending && (
                    <Button 
                      variant="success" 
                      size="lg"
                      className="py-3"
                      onClick={handleCompletePickup}
                      disabled={processing}
                    >
                      {processing ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <><FiCheckCircle className="me-2" /> Complete Pickup</>
                      )}
                    </Button>
                  )}

                  {isReady && (
                    <Button 
                      variant="success" 
                      size="lg"
                      className="py-3"
                      onClick={handleCompleteDelivery}
                      disabled={processing}
                    >
                      {processing ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <><FiCheckCircle className="me-2" /> {showPaymentForm ? 'Confirm Delivery & Payment' : 'Deliver & Collect Payment'}</>
                      )}
                    </Button>
                  )}

                  {isDelivered && (
                    <Alert variant="info" className="mb-0">
                      <FiCheckCircle className="me-2" />
                      ✅ This order has been delivered. 
                      {order.payment_status !== 'paid' && (
                        <span className="text-warning ms-2">
                          ⚠️ Payment pending verification by Admin/Manager/Accountant.
                        </span>
                      )}
                    </Alert>
                  )}

                  <Button 
                    variant="outline-secondary"
                    onClick={stopTracking}
                    disabled={processing}
                  >
                    Stop Tracking
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Notes */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label className="fw-bold">Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add delivery notes..."
            />
          </Form.Group>
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
    </Container>
  );
};

export default DeliveryOrderDetail;