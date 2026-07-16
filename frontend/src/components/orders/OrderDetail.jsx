import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Row, Col, Badge, Button, Spinner, Form } from 'react-bootstrap';
import { 
  FiUser, 
  FiPhone, 
  FiPackage, 
  FiDollarSign, 
  FiCalendar, 
  FiEdit,
  FiFileText,
  FiTruck,
  FiCheckCircle,
  FiArrowRight,
  FiMapPin,
  FiPlus,
  FiCreditCard,
  FiCheck
} from 'react-icons/fi';
import { orderApi } from '../../api';
import OrderStatusBadge from './OrderStatusBadge';
import { formatOrderId, formatPrice, formatLongDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const OrderDetail = ({ show, onHide, order, onEdit, onRefresh, onAddItems }) => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [nextStatusInfo, setNextStatusInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [apiError, setApiError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  console.log('📌 OrderDetail rendered:', { 
    show, 
    orderId: order?.order_id, 
    orderNumber: order?.order_number,
    hasOrder: !!order,
    status: order?.status
  });

  const userRole = useMemo(() => user?.role || 'employee', [user?.role]);
  const isAdmin = useMemo(() => userRole === 'admin', [userRole]);
  const isFinanceRole = useMemo(() => ['admin', 'accountant', 'manager'].includes(userRole), [userRole]);
  const isDelivery = useMemo(() => userRole === 'delivery', [userRole]);
  const isCompleted = useMemo(() => order?.status === 'completed', [order?.status]);
  const isDelivered = useMemo(() => order?.status === 'delivered', [order?.status]);
  const isReady = useMemo(() => order?.status === 'ready', [order?.status]);
  
  const canAddItems = useMemo(() => {
    const allowedRoles = ['admin', 'accountant', 'manager'];
    return order?.status === 'collected' && allowedRoles.includes(userRole);
  }, [order?.status, userRole]);

  const canComplete = useMemo(() => {
    if (isCompleted) return false;
    if (!nextStatusInfo) {
      console.log('❌ nextStatusInfo is null');
      return false;
    }
    
    if (isAdmin) {
      return nextStatusInfo.can_complete === true;
    }
    
    if (isDelivery) {
      return ['pending', 'ready'].includes(order?.status) && nextStatusInfo.can_complete === true;
    }
    
    if (isFinanceRole) {
      if (order?.status === 'ready') return false;
      return nextStatusInfo.can_complete === true;
    }
    
    return nextStatusInfo.can_complete === true;
  }, [isCompleted, nextStatusInfo, order?.status, isAdmin, isDelivery, isFinanceRole]);

  const getButtonConfig = useMemo(() => {
    if (processing) return { label: 'Processing...', color: 'secondary', action: 'none' };
    
    const status = order?.status || '';
    
    if (isAdmin) {
      const adminConfigs = {
        pending: { label: '✅ Mark as Collected', color: 'primary', action: 'next' },
        collected: { label: '✅ Mark as Washing', color: 'info', action: 'next' },
        washing: { label: '✅ Mark as Ironing', color: 'primary', action: 'next' },
        ironing: { label: '✅ Mark as Ready', color: 'primary', action: 'next' },
        ready: { label: '✅ Mark as Delivered', color: 'success', action: 'next' },
        delivered: { label: '💰 Confirm Payment & Complete', color: 'success', action: 'confirm_payment' },
      };
      return adminConfigs[status] || { label: 'Complete', color: 'success', action: 'next' };
    }
    
    if (isDelivery) {
      if (status === 'pending') {
        return { label: '✅ Complete Pickup', color: 'primary', action: 'next' };
      }
      if (status === 'ready') {
        return { label: '💰 Deliver & Collect Payment', color: 'success', action: 'next' };
      }
      return { label: 'Complete', color: 'success', action: 'next' };
    }
    
    if (isFinanceRole) {
      if (status === 'delivered') {
        return { 
          label: '💰 Confirm Payment & Complete', 
          color: 'success', 
          action: 'confirm_payment' 
        };
      }
      const financeConfigs = {
        pending: { label: '✅ Mark as Collected', color: 'primary', action: 'next' },
        collected: { label: '✅ Mark as Washing', color: 'info', action: 'next' },
        washing: { label: '✅ Mark as Ironing', color: 'primary', action: 'next' },
        ironing: { label: '✅ Mark as Ready', color: 'primary', action: 'next' },
        ready: { label: '✅ Mark as Delivered', color: 'success', action: 'next' },
      };
      return financeConfigs[status] || { label: 'Complete', color: 'success', action: 'next' };
    }
    
    const empLabels = {
      collected: { label: '✅ Start Washing', color: 'info', action: 'next' },
      washing: { label: '✅ Start Ironing', color: 'primary', action: 'next' },
      ironing: { label: '✅ Ready for Delivery', color: 'primary', action: 'next' },
    };
    return empLabels[status] || { label: 'Complete', color: 'success', action: 'next' };
  }, [order?.status, processing, isAdmin, isDelivery, isFinanceRole]);

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: 'danger',
      partial: 'warning',
      paid: 'success'
    };
    return colors[status] || 'secondary';
  };

  useEffect(() => {
    if (show && order) {
      console.log('📌 Fetching next status for order:', order.order_id);
      setNotes('');
      setApiError(null);
      fetchNextStatus();
    }
  }, [show, order]);

  const fetchNextStatus = useCallback(async () => {
    if (!order?.order_id) {
      console.log('❌ No order ID');
      setApiError('No order ID');
      return;
    }
    
    if (isFetching) return;
    
    console.log('📡 Fetching next status for order:', order.order_id);
    setIsFetching(true);
    setLoading(true);
    setApiError(null);
    
    try {
      const response = await orderApi.getNextStatus(order.order_id);
      console.log('✅ API Response:', response.data);
      
      if (response.data && response.data.data) {
        setNextStatusInfo(response.data.data);
        console.log('✅ Next status info set:', response.data.data);
      } else {
        setApiError('Invalid response');
        toast.error('Failed to load next status');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setApiError(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || 'Failed to load next status');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [order?.order_id, isFetching]);

  // ✅ Confirm Payment Handler
  const handleConfirmPayment = useCallback(async () => {
    if (!window.confirm('Confirm payment and complete this order?')) return;
    
    setProcessing(true);
    try {
      await orderApi.confirmPayment(order.order_id, {
        payment_method: order.payment_method || 'cash',
        amount: order.total_price - order.paid_amount,
        notes: notes || 'Payment confirmed and order completed'
      });
      toast.success('✅ Payment confirmed! Order completed successfully!');
      onRefresh?.();
      onHide();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setProcessing(false);
    }
  }, [order?.order_id, order?.payment_method, order?.total_price, order?.paid_amount, notes, onRefresh, onHide]);

  const handleComplete = useCallback(async () => {
    const action = getButtonConfig.action;

    // ✅ Finance/Admin: Confirm Payment (delivered → completed)
    if (action === 'confirm_payment' && (isAdmin || isFinanceRole) && order?.status === 'delivered') {
      await handleConfirmPayment();
      return;
    }

    const confirmMessage = nextStatusInfo?.next_label 
      ? `Mark this order as "${nextStatusInfo.next_label}"?` 
      : 'Complete this step?';
      
    if (!window.confirm(confirmMessage)) return;

    setProcessing(true);
    try {
      await orderApi.completeNext(order.order_id, { 
        notes: notes || nextStatusInfo?.next_label || 'Status updated' 
      });
      toast.success(`Order ${nextStatusInfo?.next_label || 'updated'} successfully!`);
      onRefresh?.();
      onHide();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(false);
    }
  }, [order?.order_id, order?.status, nextStatusInfo, notes, onRefresh, onHide, getButtonConfig.action, isAdmin, isFinanceRole, handleConfirmPayment]);

  if (!order) {
    console.warn('⚠️ Order is null/undefined');
    return (
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Loading Order...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-secondary">Loading order details...</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  if (!show) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FiPackage className="me-2" /> Order #{formatOrderId(order.order_number)}
          {isAdmin && <Badge bg="danger" className="ms-2">👑 ADMIN</Badge>}
          {isDelivery && <Badge bg="info" className="ms-2">🚚 DELIVERY</Badge>}
          {isFinanceRole && !isAdmin && !isDelivery && <Badge bg="info" className="ms-2">💰 FINANCE</Badge>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col xs={12}>
            <div className="bg-light rounded-3 p-3 d-flex justify-content-between align-items-center">
              <div>
                <small className="text-secondary">Order Number</small>
                <div className="fw-bold fs-5">{formatOrderId(order.order_number)}</div>
              </div>
              <OrderStatusBadge status={order.status} size="md" />
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary"><FiUser className="me-1" /> Customer</small>
              <div className="fw-medium">{order.customer?.name || 'N/A'}</div>
              <small className="text-secondary"><FiPhone className="me-1" /> {order.customer?.phone || 'N/A'}</small>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary"><FiCalendar className="me-1" /> Order Date</small>
              <div className="fw-medium">{formatLongDate(order.order_date)}</div>
              {order.pickup_date && (
                <><small className="text-secondary"><FiTruck className="me-1" /> Pickup Date</small>
                <div className="fw-medium">{formatLongDate(order.pickup_date)}</div></>
              )}
            </div>
          </Col>

          <Col xs={12}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary"><FiDollarSign className="me-1" /> Payment</small>
              <div>
                <Badge bg={getPaymentStatusColor(order.payment_status)} className="me-2">
                  {order.payment_status || 'unpaid'}
                </Badge>
                <span>{formatPrice(order.paid_amount)} / {formatPrice(order.total_price)} MMK</span>
                {order.payment_method && (
                  <Badge bg="secondary" className="ms-2">
                    {order.payment_method === 'cash' ? '💰 Cash' :
                     order.payment_method === 'kpay' ? '📱 KPay' :
                     order.payment_method === 'wave_pay' ? '📱 Wave Pay' : order.payment_method}
                  </Badge>
                )}
              </div>
            </div>
          </Col>

          {isAdmin && !isCompleted && (
            <Col xs={12}>
              <div className="bg-danger bg-opacity-10 rounded-3 p-3 border border-danger">
                <div className="d-flex align-items-start gap-2">
                  <FiCheck className="text-danger mt-1" size={20} />
                  <div>
                    <strong className="text-danger">👑 Admin Full Access</strong>
                    <p className="mb-0 small text-secondary">You can update any status at any step.</p>
                  </div>
                </div>
              </div>
            </Col>
          )}

          <Col xs={12}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary"><FiPackage className="me-1" /> Items</small>
              {order.items?.length === 0 ? (
                <div className="text-secondary py-2">No items added yet</div>
              ) : (
                order.items?.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                    <div>
                      <span className="fw-medium">{item.clothing_type?.type_name || `Item ${index + 1}`}</span>
                      <span className="text-secondary ms-2">x{item.quantity}</span>
                    </div>
                    <span className="fw-bold">{formatPrice(item.total_price)} MMK</span>
                  </div>
                ))
              )}
              <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                <span className="fw-bold">Total</span>
                <span className="fw-bold text-primary fs-5">{formatPrice(order.total_price)} MMK</span>
              </div>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary"><FiArrowRight className="me-1" /> Next Action</small>
              {loading ? (
                <div className="text-secondary"><Spinner animation="border" size="sm" /> Loading...</div>
              ) : isCompleted ? (
                <div className="text-success fw-bold"><FiCheckCircle className="me-1" /> Order Completed</div>
              ) : nextStatusInfo ? (
                <div>
                  <div className="fw-medium">Next: <OrderStatusBadge status={nextStatusInfo.next_status} size="md" /></div>
                  <small className="text-secondary">{nextStatusInfo.allowed_roles?.join(', ')} can complete</small>
                  {isAdmin && <div className="mt-1"><Badge bg="danger" className="small">👑 Admin can update</Badge></div>}
                </div>
              ) : (
                <div>
                  <div className="text-danger fw-bold">❌ No action available</div>
                  <div className="mt-1 small text-secondary">
                    Status: <Badge bg="secondary">{order.status}</Badge> | Role: <Badge bg="info">{userRole}</Badge>
                  </div>
                  {apiError && <div className="mt-1 text-danger small">Error: {apiError}</div>}
                  <Button variant="outline-primary" size="sm" className="mt-2" onClick={fetchNextStatus} disabled={isFetching}>
                    {isFetching ? <Spinner animation="border" size="sm" /> : '🔄 Retry'}
                  </Button>
                </div>
              )}
            </div>
          </Col>

          {canComplete && (
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary">Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this step..."
                  className="py-1"
                  style={{ resize: 'none' }}
                />
              </Form.Group>
            </Col>
          )}

          <Col xs={12}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary"><FiFileText className="me-1" /> Status History</small>
              {order.status_history?.map((history, index) => (
                <div key={index} className="d-flex justify-content-between py-1 border-bottom">
                  <span><OrderStatusBadge status={history.status} size="sm" /></span>
                  <span className="text-secondary small">{formatLongDate(history.changed_at)} by {history.user?.full_name || 'System'}</span>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>

        {canAddItems && (
          <Button variant="warning" onClick={() => onAddItems?.(order)} className="d-flex align-items-center gap-2">
            <FiPlus /> Add Items
          </Button>
        )}

        {canComplete && (
          <Button variant={getButtonConfig.color} onClick={handleComplete} disabled={processing} className="d-flex align-items-center gap-2">
            {processing ? <Spinner animation="border" size="sm" /> : (getButtonConfig.action === 'confirm_payment' ? <FiCreditCard /> : <FiCheckCircle />)}
            {getButtonConfig.label}
          </Button>
        )}

        {!isCompleted && (
          <Button variant="primary" onClick={() => onEdit(order)}>
            <FiEdit className="me-2" /> Edit Order
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetail;