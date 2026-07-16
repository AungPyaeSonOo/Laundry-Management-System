import React from 'react';
import { Badge } from 'react-bootstrap';
import { FiClock, FiCheckCircle, FiAlertCircle, FiLoader, FiPackage, FiTruck, FiCheck } from 'react-icons/fi';

const OrderStatusBadge = ({ status, size = 'sm' }) => {
  const statusConfig = {
    pending: {
      color: 'warning',
      icon: FiClock,
      label: 'Pending'
    },
    collected: {
      color: 'info',
      icon: FiPackage,
      label: 'Collected'
    },
    washing: {
      color: 'primary',
      icon: FiLoader,
      label: 'Washing'
    },
    ironing: {
      color: 'primary',
      icon: FiLoader,
      label: 'Ironing'
    },
    ready: {
      color: 'success',
      icon: FiCheckCircle,
      label: 'Ready'
    },
    delivered: {
      color: 'success',
      icon: FiTruck,
      label: 'Delivered'
    },
    completed: {
      color: 'secondary',
      icon: FiCheck,
      label: 'Completed'
    },
    cancelled: {
      color: 'danger',
      icon: FiAlertCircle,
      label: 'Cancelled'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge bg={config.color} className="d-inline-flex align-items-center gap-1 px-2 py-1">
      <Icon size={size === 'sm' ? 12 : 14} />
      <span className={size === 'sm' ? 'small' : ''}>{config.label}</span>
    </Badge>
  );
};

export default OrderStatusBadge;