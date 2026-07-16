// components/users/UserForm.js

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiKey, 
  FiSave, 
  FiX,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiShield,
  FiInfo
} from 'react-icons/fi';
import { userApi } from '../../api';
import toast from 'react-hot-toast';

const UserForm = ({ show, onHide, onSuccess, editData }) => {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer',
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isEmployeeUser, setIsEmployeeUser] = useState(false);

  useEffect(() => {
    if (editData) {
      // ✅ Check if user is an employee (has employee role or manager/delivery)
      const employeeRoles = ['employee', 'manager', 'delivery'];
      const isEmp = employeeRoles.includes(editData.role) || editData.role === 'employee';
      setIsEmployeeUser(isEmp);

      setFormData({
        username: editData.username || '',
        email: editData.email || '',
        password: '',
        full_name: editData.full_name || '',
        phone: editData.phone || '',
        role: editData.role || 'customer',
        is_active: editData.is_active !== undefined ? editData.is_active : true,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'customer',
        is_active: true,
      });
      setIsEmployeeUser(false);
    }
    setErrors({});
  }, [editData, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value === 'true' : (type === 'checkbox' ? checked : value)
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone || '',
        role: formData.role,
        is_active: formData.is_active,
      };

      if (!isEdit) {
        data.password = formData.password;
      }

      if (isEdit) {
        if (!editData?.user_id) {
          throw new Error('User ID is missing');
        }

        // ✅ If user is employee and status is changing, show confirmation
        if (isEmployeeUser && formData.is_active !== editData.is_active) {
          const statusText = formData.is_active ? 'activated' : 'deactivated';
          const confirmMessage = `This will also ${statusText} the employee record. Continue?`;
          if (!window.confirm(confirmMessage)) {
            setLoading(false);
            return;
          }
        }

        await userApi.update(editData.user_id, data);
        
        // ✅ Show appropriate success message
        if (isEmployeeUser && formData.is_active !== editData.is_active) {
          const statusText = formData.is_active ? 'activated' : 'deactivated';
          toast.success(`User and employee ${statusText} successfully!`);
        } else {
          toast.success('User updated successfully!');
        }
      } else {
        await userApi.create(data);
        toast.success('User created successfully!');
        
        // ✅ If user is created as employee, show info
        if (formData.role === 'employee') {
          toast.info('Remember to assign a specific position in Employee section!');
        }
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onHide();
      
    } catch (error) {
      console.error('Error saving user:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Failed to save user');
      }
    } finally {
      setLoading(false);
    }
  };

  const isAdminUser = isEdit && editData?.role === 'admin';

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
          {isEdit ? (
            <FiUser className="text-primary" size={24} />
          ) : (
            <FiUserPlus className="text-primary" size={24} />
          )}
          <span>{isEdit ? 'Edit User' : 'Add New User'}</span>
          {isEdit && (
            <Badge 
              bg={formData.is_active ? 'success' : 'danger'} 
              className="ms-2 rounded-pill px-3 py-2"
            >
              {formData.is_active ? (
                <><FiUserCheck size={12} className="me-1" /> Active</>
              ) : (
                <><FiUserX size={12} className="me-1" /> Inactive</>
              )}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-3">
          {isAdminUser && (
            <Alert variant="warning" className="mb-3 d-flex align-items-center gap-2">
              <FiShield size={18} />
              <span>Admin user - some fields are restricted for security</span>
            </Alert>
          )}

          {/* ✅ Show employee status info */}
          {isEdit && isEmployeeUser && (
            <Alert variant="info" className="mb-3 d-flex align-items-start gap-2">
              <FiInfo size={18} className="mt-1" />
              <div>
                <strong>Employee User</strong>
                <p className="mb-0 small">
                  Changing status will also update the employee record automatically.
                </p>
              </div>
            </Alert>
          )}

          <Row className="g-3">
            {/* Full Name */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiUser size={14} /> Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="py-2"
                  isInvalid={!!errors.full_name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.full_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Username */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiUser size={14} /> Username <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                  disabled={isEdit}
                  className="py-2"
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
                {isEdit && (
                  <Form.Text className="text-secondary">
                    <small>Username cannot be changed</small>
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            {/* Email */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiMail size={14} /> Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className="py-2"
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Phone */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiPhone size={14} /> Phone
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="09-XXX-XXX-XXX"
                  className="py-2"
                />
              </Form.Group>
            </Col>

            {/* Password (only for new user) */}
            {!isEdit && (
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                    <FiKey size={14} /> Password <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password (min 6 characters)"
                      required={!isEdit}
                      minLength="6"
                      className="py-2 pe-5"
                      isInvalid={!!errors.password}
                    />
                    <Button
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y p-0 me-2"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ textDecoration: 'none', color: '#6c757d' }}
                      type="button"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                  <Form.Text className="text-secondary d-block">
                    Must be at least 6 characters
                  </Form.Text>
                </Form.Group>
              </Col>
            )}

            {/* Role - Only 3 options */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                  <FiUser size={14} /> Role <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={isAdminUser}
                  className="py-2"
                >
                  <option value="customer">👤 Customer</option>
                  <option value="employee">👤 Employee</option>
                  <option value="admin" disabled={isEdit}>👑 Admin</option>
                </Form.Select>
                {isAdminUser && (
                  <Form.Text className="text-warning d-block mt-1">
                    <FiAlertCircle className="me-1" size={12} />
                    Admin role cannot be changed
                  </Form.Text>
                )}
                {formData.role === 'employee' && !isEdit && (
                  <Form.Text className="text-info d-block mt-1">
                    <FiAlertCircle className="me-1" size={12} />
                    After creating, you can assign specific position (Washer, Ironer, etc.) in Employee section
                  </Form.Text>
                )}
                {isEdit && formData.role === 'employee' && (
                  <Form.Text className="text-info d-block mt-1">
                    <FiInfo className="me-1" size={12} />
                    Employee can have specific positions: Manager, Washer, Ironer, Packer, Delivery
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            {/* Status - Active/Inactive (for edit mode) */}
            {isEdit && (
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary d-flex align-items-center gap-1">
                    <FiUserCheck size={14} /> Status
                  </Form.Label>
                  <div className="d-flex gap-4 pt-2">
                    <Form.Check
                      type="radio"
                      id="status-active"
                      label={
                        <span className="d-flex align-items-center gap-1">
                          <FiUserCheck className="text-success" size={16} />
                          <span className="fw-medium">Active</span>
                        </span>
                      }
                      name="is_active"
                      value="true"
                      checked={formData.is_active === true}
                      onChange={handleChange}
                      disabled={isAdminUser}
                      className="me-3"
                    />
                    <Form.Check
                      type="radio"
                      id="status-inactive"
                      label={
                        <span className="d-flex align-items-center gap-1">
                          <FiUserX className="text-danger" size={16} />
                          <span className="fw-medium">Inactive</span>
                        </span>
                      }
                      name="is_active"
                      value="false"
                      checked={formData.is_active === false}
                      onChange={handleChange}
                      disabled={isAdminUser}
                    />
                  </div>
                  
                  {isAdminUser ? (
                    <Form.Text className="text-warning d-block mt-2">
                      <FiAlertCircle className="me-1" />
                      Admin status cannot be changed
                    </Form.Text>
                  ) : formData.is_active === false ? (
                    <div className="mt-3 p-3 bg-danger bg-opacity-10 rounded-3 border border-danger border-opacity-25">
                      <Form.Text className="text-danger d-flex align-items-start gap-2">
                        <FiAlertCircle size={18} className="mt-1 flex-shrink-0" />
                        <div>
                          <strong>Warning:</strong> User will not be able to login
                          {isEmployeeUser && (
                            <span className="d-block mt-1">
                              <FiUserX className="me-1" size={14} />
                              <strong>Employee record will also be deactivated</strong>
                            </span>
                          )}
                        </div>
                      </Form.Text>
                    </div>
                  ) : (
                    <div className="mt-2 p-2 bg-success bg-opacity-10 rounded-3">
                      <Form.Text className="text-success d-flex align-items-center gap-2">
                        <FiUserCheck size={16} />
                        <span>User can login and access the system</span>
                        {isEmployeeUser && (
                          <span className="d-block mt-1">
                            <FiUserCheck className="me-1" size={14} />
                            <strong>Employee record will also be activated</strong>
                          </span>
                        )}
                      </Form.Text>
                    </div>
                  )}
                </Form.Group>
              </Col>
            )}

            {/* Show status info for new user */}
            {!isEdit && (
              <Col xs={12}>
                <div className="p-3 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25">
                  <Form.Text className="text-secondary d-flex align-items-center gap-2">
                    <FiUserCheck size={16} className="text-info" />
                    <span>New users are created as <strong>Active</strong> by default</span>
                  </Form.Text>
                </div>
              </Col>
            )}
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
            disabled={loading} 
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
                {isEdit ? 'Update User' : 'Create User'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserForm;