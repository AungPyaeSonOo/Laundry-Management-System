import React from 'react';
import { Modal, Row, Col, Badge, Button } from 'react-bootstrap';
import { 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiBriefcase, 
  FiDollarSign, 
  FiCalendar, 
  FiX, 
  FiEdit,
  FiUserCheck,
  FiUserX,
  FiCode
} from 'react-icons/fi';
import { formatCurrency, formatLongDate } from '../../utils/helpers';

const EmployeeDetail = ({ show, onHide, employee, onEdit }) => {
  if (!employee) return null;

  const getPositionLabel = (position) => {
    const labels = {
      manager: 'Manager',
      washer: 'Washer',
      ironer: 'Ironer',
      packer: 'Packer',
      delivery: 'Delivery'
    };
    return labels[position] || position;
  };

  const getSalaryTypeLabel = (type) => {
    const labels = {
      fixed: 'Fixed',
      hourly: 'Hourly',
      daily: 'Daily'
    };
    return labels[type] || type;
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FiUser className="me-2" /> Employee Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col xs={12}>
            <div className="bg-light rounded-3 p-3 d-flex justify-content-between align-items-center">
              <div>
                <small className="text-secondary">Employee ID</small>
                <div className="fw-bold fs-5">
                  <FiCode className="me-2 text-primary" />
                  #{employee.employee_id}
                </div>
              </div>
              <Badge 
                bg={employee.is_active ? 'success' : 'danger'}
                className="rounded-pill px-3 py-2"
              >
                {employee.is_active ? (
                  <><FiUserCheck className="me-1" /> Active</>
                ) : (
                  <><FiUserX className="me-1" /> Inactive</>
                )}
              </Badge>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary">
                <FiUser className="me-1" /> Full Name
              </small>
              <div className="fw-medium fs-5">{employee.user?.full_name || 'N/A'}</div>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary">
                <FiMail className="me-1" /> Email
              </small>
              <div className="fw-medium">{employee.user?.email || 'N/A'}</div>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary">
                <FiPhone className="me-1" /> Phone
              </small>
              <div className="fw-medium">{employee.user?.phone || 'N/A'}</div>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary">
                <FiBriefcase className="me-1" /> Position
              </small>
              <div>
                <Badge bg="primary" className="px-3 py-2">
                  {getPositionLabel(employee.position)}
                </Badge>
              </div>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary">
                <FiDollarSign className="me-1" /> Salary
              </small>
              <div>
                <span className="fw-bold fs-5">
                  {formatCurrency(employee.salary_amount)} MMK
                </span>
                <span className="text-secondary ms-2">
                  ({getSalaryTypeLabel(employee.salary_type)})
                </span>
              </div>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="bg-light rounded-3 p-3">
              <small className="text-secondary">
                <FiCalendar className="me-1" /> Hire Date
              </small>
              <div className="fw-medium">{formatLongDate(employee.hire_date)}</div>
              {employee.termination_date && (
                <>
                  <small className="text-secondary text-danger">
                    <FiCalendar className="me-1" /> Termination Date
                  </small>
                  <div className="fw-medium text-danger">{formatLongDate(employee.termination_date)}</div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={() => onEdit(employee)}>
          <FiEdit className="me-2" /> Edit Employee
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmployeeDetail;