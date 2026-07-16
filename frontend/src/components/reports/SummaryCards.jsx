import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import {
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Orders',
      value: summary.total_orders || 0,
      icon: FiShoppingCart,
      color: 'primary',
      bg: 'bg-primary bg-opacity-10'
    },
    {
      title: 'Total Income',
      value: `$${summary.total_income?.toFixed(2) || '0.00'}`,
      icon: FiDollarSign,
      color: 'success',
      bg: 'bg-success bg-opacity-10'
    },
    {
      title: 'Total Expenses',
      value: `$${summary.total_expenses?.toFixed(2) || '0.00'}`,
      icon: FiTrendingDown,
      color: 'danger',
      bg: 'bg-danger bg-opacity-10'
    },
    {
      title: 'Net Profit',
      value: `$${summary.net_profit?.toFixed(2) || '0.00'}`,
      icon: FiTrendingUp,
      color: summary.net_profit > 0 ? 'success' : 'danger',
      bg: summary.net_profit > 0 ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'
    }
  ];

  return (
    <Row className="g-3 g-md-4 mb-4">
      {cards.map((card, index) => (
        <Col key={index} xs={6} md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className={`rounded-circle p-3 ${card.bg} me-3`}>
                  <card.icon size={24} className={`text-${card.color}`} />
                </div>
                <div>
                  <h6 className="text-muted mb-0 small">{card.title}</h6>
                  <h5 className="fw-bold mb-0">{card.value}</h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryCards;