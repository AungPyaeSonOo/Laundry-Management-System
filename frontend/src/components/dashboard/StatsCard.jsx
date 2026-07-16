import React from 'react';
import { Card } from 'react-bootstrap';

const StatsCard = ({ icon: Icon, label, value, color = 'primary', trend }) => {
  const colors = {
    primary: 'bg-primary',
    success: 'bg-success',
    danger: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info',
    secondary: 'bg-secondary',
  };

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <div className="text-secondary small fw-medium mb-1">{label}</div>
            <div className="fw-bold fs-4">{value}</div>
            {trend && (
              <div className={`small mt-1 ${trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                {trend} from last week
              </div>
            )}
          </div>
          <div className={`${colors[color]} text-white rounded-3 p-3 flex-shrink-0`}>
            <Icon size={24} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;