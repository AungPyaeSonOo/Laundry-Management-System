// components/employees/EmployeeForm.js

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { 
  FiUser, 
  FiBriefcase, 
  FiDollarSign, 
  FiCalendar, 
  FiSave, 
  FiX,
  FiUserPlus,
  FiUsers,
  FiAlertCircle,
  FiUserCheck
} from 'react-icons/fi';
import { employeeApi, userApi } from '../../api';
import toast from 'react-hot-toast';

const EmployeeForm = ({ show, onHide, onSuccess, editData, preselectedUser }) => {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    position: 'washer',
    salary_type: 'fixed',
    salary_amount: '',
    hire_date: '',
  });

  // ✅ If preselectedUser is provided, auto-select them
  useEffect(() => {
    if (preselectedUser && show) {
      setFormData(prev => ({
        ...prev,
        user_id: preselectedUser.user_id
      }));
    }
  }, [preselectedUser, show]);

  // ✅ Fetch users who are not employees yet (for create mode)
  useEffect(() => {
    if (show && !isEdit && !preselectedUser) {
      fetchAvailableUsers();
    }
  }, [show, isEdit, preselectedUser]);

  // ✅ Load edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        user_id: editData.user_id || '',
        position: editData.position || 'washer',
        salary_type: editData.salary_type || 'fixed',
        salary_amount: editData.salary_amount || '',
        hire_date: editData.hire_date || '',
      });
    } else if (!preselectedUser) {
      setFormData({
        user_id: '',
        position: 'washer',
        salary_type: 'fixed',
        salary_amount: '',
        hire_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [editData, show, preselectedUser]);

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userApi.getAvailableForEmployee();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load available users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        user_id: parseInt(formData.user_id),
        position: formData.position,
        salary_type: formData.salary_type,
        salary_amount: parseFloat(formData.salary_amount) || 0,
        hire_date: formData.hire_date || new Date().toISOString().split('T')[0],
      };

      if (isEdit) {
        await employeeApi.update(editData.employee_id, data);
        toast.success('Employee updated successfully!');
      } else {
        await employeeApi.create(data);
        toast.success('Employee created successfully!');
      }
      
      onSuccess?.();
      onHide();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(error.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const getPositionLabel = (position) => {
    const labels = {
      manager: '👔 Manager',
      washer: '🧺 Washer',
      ironer: '👕 Ironer',
      packer: '📦 Packer',
      delivery: '🚚 Delivery'
    };
    return labels[position] || position;
  };

  const getPositionColor = (position) => {
    const colors = {
      manager: 'primary',
      washer: 'info',
      ironer: 'info',
      packer: 'success',
      delivery: 'warning'
    };
    return colors[position] || 'secondary';
  };

  // ✅ Get selected user info
  const selectedUserInfo = preselectedUser || users.find(u => u.user_id === parseInt(formData.user_id));

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      backdrop="static"
      keyboard={!loading}
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <FiUserPlus className="text-primary" size={24} />
          <span>{isEdit ? 'Edit Employee' : 'Add New Employee'}</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-3">
          <Row className="g-3">
            {/* ✅ Show selected user info */}
            {selectedUserInfo && !isEdit && (
              <Col xs={12}>
                <div className="bg-light rounded-3 p-3 border border-primary border-opacity-25">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-secondary">
                        <FiUser className="me-1" /> Selected User
                      </small>
                      <div className="fw-medium fs-5">
                        {selectedUserInfo.full_name}
                      </div>
                      <small className="text-secondary">
                        @{selectedUserInfo.username} • {selectedUserInfo.email}
                      </small>
                    </div>
                    <Badge bg="secondary" className="rounded-pill px-3 py-2">
                      {selectedUserInfo.role}
                    </Badge>
                  </div>
                </div>
              </Col>
            )}

            {/* ✅ Select User (for create mode without preselected) */}
            {!isEdit && !preselectedUser && (
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                    <FiUsers size={14} /> Select User <span className="text-danger">*</span>
                  </Form.Label>
                  
                  {loadingUsers ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary me-2" />
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="bg-light rounded-3 p-4 text-center">
                      <FiAlertCircle className="text-warning mb-2" size={32} />
                      <div className="text-secondary">
                        <p className="mb-1 fw-medium">No available users found</p>
                        <small>Please create a user with <strong>Employee</strong> role first in User Management</small>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Form.Select
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleChange}
                        required
                        className="py-2"
                      >
                        <option value="">Select a user...</option>
                        {users.map(user => (
                          <option key={user.user_id} value={user.user_id}>
                            {user.full_name} (@{user.username}) - {user.email}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-secondary">
                        <FiUserCheck className="me-1" size={12} />
                        Only active users with <strong>Employee</strong> role are shown
                      </Form.Text>
                    </>
                  )}
                </Form.Group>
              </Col>
            )}

            {/* Hidden user_id field for preselected user */}
            {preselectedUser && !isEdit && (
              <input type="hidden" name="user_id" value={formData.user_id} />
            )}

            {/* ✅ Show user info for edit mode */}
            {isEdit && editData?.user && (
              <Col xs={12}>
                <div className="bg-light rounded-3 p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-secondary">
                        <FiUser className="me-1" /> Employee
                      </small>
                      <div className="fw-medium fs-5">
                        {editData.user.full_name}
                      </div>
                      <small className="text-secondary">
                        @{editData.user.username} • {editData.user.email}
                      </small>
                    </div>
                    <Badge 
                      bg={getPositionColor(editData.position)} 
                      className="rounded-pill px-3 py-2"
                    >
                      {getPositionLabel(editData.position)}
                    </Badge>
                  </div>
                </div>
              </Col>
            )}

            {/* Position - Role */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiBriefcase size={14} /> Position <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="py-2"
                >
                  <option value="manager">👔 Manager</option>
                  <option value="washer">🧺 Washer</option>
                  <option value="ironer">👕 Ironer</option>
                  <option value="packer">📦 Packer</option>
                  <option value="delivery">🚚 Delivery</option>
                </Form.Select>
                <Form.Text className="text-secondary">
                  This will update the user's role automatically
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Salary Type */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiDollarSign size={14} /> Salary Type
                </Form.Label>
                <Form.Select
                  name="salary_type"
                  value={formData.salary_type}
                  onChange={handleChange}
                  className="py-2"
                >
                  <option value="fixed">Fixed (Monthly)</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Salary Amount */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiDollarSign size={14} /> Salary Amount <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="salary_amount"
                  value={formData.salary_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="py-2"
                />
                <Form.Text className="text-secondary">
                  Amount in MMK
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Hire Date */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiCalendar size={14} /> Hire Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  required
                  className="py-2"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="light" 
            onClick={onHide} 
            disabled={loading}
            className="d-flex align-items-center gap-2 px-4"
          >
            <FiX size={18} /> Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || (!isEdit && !preselectedUser && users.length === 0)} 
            className="d-flex align-items-center gap-2 px-4"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FiSave size={18} />
                {isEdit ? 'Update Employee' : 'Create Employee'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EmployeeForm;