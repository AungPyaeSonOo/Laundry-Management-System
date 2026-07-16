import React from 'react';
import { Badge } from 'react-bootstrap';

const RecentOrders = ({ orders = [] }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      collected: 'info',
      washing: 'primary',
      ironing: 'primary',
      ready: 'success',
      delivered: 'success',
      completed: 'secondary',
      cancelled: 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  if (orders.length === 0) {
    return (
      <div className="text-center text-secondary py-4">
        <small>No recent orders</small>
      </div>
    );
  }

  return (
    <div className="recent-orders">
      {orders.slice(0, 5).map((order) => (
        <div
          key={order.order_id}
          className="d-flex justify-content-between align-items-center py-2 border-bottom"
        >
          <div>
            <div className="fw-medium small">{order.order_number}</div>
            <div className="text-secondary small">
              {order.customer?.name || 'N/A'}
            </div>
          </div>
          <div className="text-end">
            <div className="fw-medium small">
              {order.total_price?.toLocaleString()} MMK
            </div>
            <Badge bg={getStatusBadge(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentOrders;