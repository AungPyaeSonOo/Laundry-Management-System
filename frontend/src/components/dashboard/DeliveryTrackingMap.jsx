import React, { useState, useEffect } from 'react';
import { Card, Badge, Table, Button } from 'react-bootstrap';
import { FiMapPin, FiTruck, FiClock, FiCheckCircle } from 'react-icons/fi';
import { orderApi } from '../../api';
import { formatShortDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DeliveryTrackingMap = () => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveDeliveries();
    const interval = setInterval(fetchActiveDeliveries, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchActiveDeliveries = async () => {
    try {
      const response = await orderApi.getActiveDeliveries();
      setActiveDeliveries(response.data.data || []);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FiClock className="text-warning" />;
      case 'collected': return <FiCheckCircle className="text-success" />;
      default: return <FiTruck className="text-primary" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      collected: 'success',
      delivered: 'info',
      completed: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  if (loading) return <div className="text-center py-3">Loading deliveries...</div>;

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h6 className="fw-bold mb-3">
          <FiTruck className="me-2" /> Active Deliveries
          <Badge bg="primary" className="ms-2">{activeDeliveries.length}</Badge>
        </h6>

        {activeDeliveries.length === 0 ? (
          <div className="text-center text-secondary py-4">
            <FiTruck size={40} className="mb-2 opacity-25" />
            <p>No active deliveries</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {activeDeliveries.map((delivery) => (
                  <tr key={delivery.order_id}>
                    <td>#{delivery.order_number}</td>
                    <td>{delivery.delivery_person?.full_name || 'N/A'}</td>
                    <td>
                      <Badge bg={getStatusBadge(delivery.status)}>
                        {getStatusIcon(delivery.status)} {delivery.status}
                      </Badge>
                    </td>
                    <td>
                      {delivery.location ? (
                        <a 
                          href={`https://www.google.com/maps?q=${delivery.location.lat},${delivery.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          <FiMapPin className="me-1" /> View on Map
                        </a>
                      ) : (
                        <span className="text-secondary">No location</span>
                      )}
                    </td>
                    <td>{formatShortDate(delivery.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DeliveryTrackingMap;