import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FiFilter, FiX } from 'react-icons/fi';

const OrderFilter = ({ filters, onFilterChange, onClear }) => {
  const statuses = [
    'All',
    'Pending',
    'Collected',
    'Washing',
    'Ironing',
    'Ready',
    'Delivered',
    'Completed',
    'Cancelled'
  ];

  return (
    <div className="bg-light rounded-3 p-3 mb-3">
      <div className="d-flex align-items-center mb-2">
        <FiFilter className="me-2 text-primary" />
        <span className="fw-medium">Filters</span>
        <Button
          variant="link"
          size="sm"
          className="ms-auto text-decoration-none"
          onClick={onClear}
        >
          <FiX className="me-1" /> Clear All
        </Button>
      </div>
      <Row className="g-2">
        <Col xs={12} sm={6} md={3}>
          <Form.Select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            size="sm"
          >
            {statuses.map(status => (
              <option key={status} value={status === 'All' ? '' : status.toLowerCase()}>
                {status}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Form.Control
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => onFilterChange('start_date', e.target.value)}
            size="sm"
            placeholder="Start Date"
          />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Form.Control
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => onFilterChange('end_date', e.target.value)}
            size="sm"
            placeholder="End Date"
          />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Button variant="primary" size="sm" className="w-100">
            Apply Filters
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default OrderFilter;