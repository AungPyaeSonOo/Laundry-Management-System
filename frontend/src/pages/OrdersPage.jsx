import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, InputGroup, Form } from 'react-bootstrap';
import {
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiPackage,
  FiUser,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';
import { orderApi } from '../api';
import Loading from '../components/common/Loading';
import OrderCreate from '../components/orders/OrderCreate';
import OrderDetail from '../components/orders/OrderDetail';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { formatPrice, formatShortDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editData, setEditData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      
      console.log('📡 Fetching orders with params:', params);
      const response = await orderApi.getAll(params);
      console.log('✅ Orders response:', response.data);
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const refreshOrders = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshKey]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const clearSearch = () => {
    setSearch('');
  };

  const handleViewOrder = (order) => {
    console.log('📌👁️ View Order CLICKED!', order);
    console.log('📌 Order ID:', order?.order_id);
    console.log('📌 Order Number:', order?.order_number);
    
    if (order && order.order_id) {
      setSelectedOrder(order);
      setShowDetailModal(true);
      console.log('✅ Selected order set, showDetailModal = true');
    } else {
      console.error('❌ Invalid order data:', order);
      toast.error('Invalid order data');
    }
  };

  const handleEditOrder = (order) => {
    setEditData(order);
    setShowCreateModal(true);
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to delete order #${order.order_number}?`)) return;
    
    try {
      await orderApi.delete(order.order_id);
      toast.success('Order deleted successfully!');
      refreshOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleOrderSuccess = () => {
    setShowCreateModal(false);
    setEditData(null);
    refreshOrders();
  };

  const handleDetailClose = () => {
    console.log('📌 Closing detail modal');
    setShowDetailModal(false);
    setTimeout(() => {
      setSelectedOrder(null);
    }, 300);
    refreshOrders();
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: 'danger',
      partial: 'warning',
      paid: 'success'
    };
    return colors[status] || 'secondary';
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">📦 Orders</h4>
          <p className="text-secondary small mb-0">Manage your laundry orders</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={refreshOrders}
            className="d-flex align-items-center gap-2"
            size="sm"
          >
            <FiRefreshCw size={16} /> Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setEditData(null);
              setShowCreateModal(true);
            }}
            className="d-flex align-items-center gap-2 px-4 py-2 rounded-3"
          >
            <FiPlus size={18} /> New Order
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <Form onSubmit={handleSearchSubmit}>
            <div className="d-flex flex-wrap gap-2">
              <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                <InputGroup className="rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-white border-end-0">
                    <FiSearch className="text-secondary" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by order number or customer..."
                    value={search}
                    onChange={handleSearch}
                    className="border-start-0"
                    style={{ fontSize: '14px' }}
                  />
                  {search && (
                    <Button 
                      variant="light" 
                      onClick={clearSearch}
                      className="border-start-0"
                    >
                      <FiX />
                    </Button>
                  )}
                </InputGroup>
              </div>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-3"
                style={{ width: '160px', fontSize: '14px' }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="collected">Collected</option>
                <option value="washing">Washing</option>
                <option value="ironing">Ironing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
              <Button 
                type="submit" 
                variant="primary"
                className="px-4"
              >
                Search
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ minWidth: '600px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="ps-3" style={{ width: '40px' }}>#</th>
                  <th style={{ minWidth: '90px' }}>Order #</th>
                  <th style={{ minWidth: '100px' }}>Customer</th>
                  <th style={{ minWidth: '90px' }}>Date</th>
                  <th style={{ width: '50px' }}>Items</th>
                  <th style={{ minWidth: '90px' }}>Total</th>
                  <th style={{ minWidth: '100px' }}>Status</th>
                  <th style={{ minWidth: '80px' }}>Payment</th>
                  <th className="text-center pe-3" style={{ width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="text-secondary">
                        <FiPackage size={48} className="mb-2 opacity-25" />
                        <p className="mb-1">No orders found</p>
                        <small>Click "New Order" to create one</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order.order_id} className="align-middle">
                      <td className="ps-3">
                        <span className="fw-medium">{index + 1}</span>
                      </td>
                      <td>
                        <span className="fw-medium" style={{ fontSize: '13px' }}>
                          #{order.order_number?.split('-').pop() || order.order_number}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FiUser size={12} className="text-secondary flex-shrink-0" />
                          <span className="text-truncate" style={{ maxWidth: '80px', fontSize: '13px' }}>
                            {order.customer?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FiCalendar size={12} className="text-secondary flex-shrink-0" />
                          <span style={{ fontSize: '13px' }}>{formatShortDate(order.order_date)}</span>
                        </div>
                      </td>
                      <td className="text-center">{order.items?.length || 0}</td>
                      <td>
                        <span className="fw-medium" style={{ fontSize: '13px' }}>
                          {formatPrice(order.total_price)} MMK
                        </span>
                      </td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td>
                        <Badge bg={getPaymentStatusColor(order.payment_status)} style={{ fontSize: '12px' }}>
                          {order.payment_status || 'unpaid'}
                        </Badge>
                      </td>
                      <td className="text-center pe-3">
                        <div className="d-flex justify-content-center gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('👆👆👆 VIEW BUTTON CLICKED! Order:', order);
                              handleViewOrder(order);
                            }}
                            title="View Details"
                          >
                            <FiEye size={13} />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleEditOrder(order)}
                            title="Edit Order"
                          >
                            <FiEdit size={13} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleDeleteOrder(order)}
                            title="Delete Order"
                          >
                            <FiTrash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Mobile Card View */}
          <div className="d-block d-sm-none">
            {orders.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <FiPackage size={48} className="mb-2 opacity-25" />
                <p className="mb-1">No orders found</p>
              </div>
            ) : (
              orders.map((order, index) => (
                <div key={order.order_id} className="border-bottom p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="fw-bold" style={{ fontSize: '14px' }}>
                        #{order.order_number?.split('-').pop() || order.order_number}
                      </span>
                      <div className="text-secondary small">{order.customer?.name || 'N/A'}</div>
                    </div>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="row g-1 small">
                    <div className="col-6">
                      <span className="text-secondary">Date:</span> {formatShortDate(order.order_date)}
                    </div>
                    <div className="col-6">
                      <span className="text-secondary">Items:</span> {order.items?.length || 0}
                    </div>
                    <div className="col-6">
                      <span className="text-secondary">Total:</span> {formatPrice(order.total_price)} MMK
                    </div>
                    <div className="col-6">
                      <span className="text-secondary">Payment:</span>{' '}
                      <Badge bg={getPaymentStatusColor(order.payment_status)}>
                        {order.payment_status || 'unpaid'}
                      </Badge>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => handleViewOrder(order)}
                    >
                      <FiEye className="me-1" /> View
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => handleEditOrder(order)}
                    >
                      <FiEdit className="me-1" /> Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => handleDeleteOrder(order)}
                    >
                      <FiTrash2 className="me-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {orders.length > 0 && (
            <div className="p-3 border-top text-secondary small">
              Total: {orders.length} orders
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Order Create/Edit Modal */}
      <OrderCreate
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          setEditData(null);
        }}
        onSuccess={handleOrderSuccess}
        editData={editData}
      />

      {/* Order Detail Modal */}
      <OrderDetail
        show={showDetailModal}
        onHide={handleDetailClose}
        order={selectedOrder}
        onEdit={(order) => {
          setShowDetailModal(false);
          handleEditOrder(order);
        }}
        onRefresh={refreshOrders}
        onAddItems={() => {
          toast.info('Add items feature coming soon');
        }}
      />
    </div>
  );
};

export default OrdersPage;