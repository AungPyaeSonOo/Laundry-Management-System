import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  Container,
  ProgressBar,
  Nav
} from 'react-bootstrap';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiBriefcase,
  FiCalendar,
  FiArrowLeft,
  FiEdit2,
  FiUserCheck,
  FiClock,
  FiSmartphone,
  FiAward,
  FiStar,
  FiTrendingUp,
  FiSettings,
  FiPower,
  FiRefreshCw,
  FiCreditCard,
  FiHome,
  FiMapPin,
  FiGlobe,
  FiBell,
  FiMessageSquare,
  FiHeart,
  FiLayers,
  FiActivity,
  FiBarChart2,
  FiTarget,
  FiThumbsUp,
  FiUsers,
  FiShoppingBag,
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiPercent,
  FiZap,
  FiCompass
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    position: '',
    is_active: true
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        position: user.position || '',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authApi.updateProfile(formData);
      const updatedUser = response.data.data;

      const updatedUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      window.location.reload();
      
      setSuccess('Profile updated successfully!');
      toast.success('✅ Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      toast.error('New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      setSaving(false);
      return;
    }

    try {
      await authApi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setSuccess('Password changed successfully!');
      toast.success('✅ Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'danger',
      manager: 'warning',
      accountant: 'info',
      employee: 'primary',
      delivery: 'success'
    };
    return colors[role] || 'secondary';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <FiShield />,
      manager: <FiUserCheck />,
      accountant: <FiTrendingUp />,
      employee: <FiUser />,
      delivery: <FiTruck />
    };
    return icons[role] || <FiUser />;
  };

  // Profile completion
  const completionPercentage = 85;

  // Achievements
  const achievements = [
    { name: 'Top Performer', icon: FiAward, color: 'warning', progress: 100 },
    { name: 'Perfect Attendance', icon: FiCheckCircle, color: 'success', progress: 75 },
    { name: '5 Years Club', icon: FiStar, color: 'danger', progress: 60 },
    { name: 'Team Player', icon: FiUsers, color: 'info', progress: 90 }
  ];

  // Recent Activity
  const recentActivity = [
    { 
      id: 1,
      icon: FiShoppingBag,
      color: 'primary',
      title: 'New Order #ORD-2024-001',
      description: 'Order placed by John Doe',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      icon: FiUser,
      color: 'success',
      title: 'Profile Updated',
      description: 'Changed profile information',
      time: '1 day ago',
      status: 'pending'
    },
    {
      id: 3,
      icon: FiLock,
      color: 'warning',
      title: 'Password Changed',
      description: 'Security settings updated',
      time: '3 days ago',
      status: 'completed'
    },
    {
      id: 4,
      icon: FiTruck,
      color: 'info',
      title: 'Delivery Completed',
      description: 'Order #ORD-2024-002 delivered',
      time: '5 days ago',
      status: 'completed'
    }
  ];

  // Quick stats
  const stats = [
    { label: 'Total Orders', value: '156', icon: FiPackage, color: 'primary', change: '+12%' },
    { label: 'Revenue', value: '$12,450', icon: FiDollarSign, color: 'success', change: '+8.5%' },
    { label: 'Rating', value: '4.8 ★', icon: FiStar, color: 'warning', change: '+0.2' },
    { label: 'Completed', value: '89%', icon: FiPercent, color: 'info', change: '+5%' }
  ];

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-secondary">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 animate-fade-in" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Back Button */}
      <div className="mb-4">
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={() => navigate(-1)}
          className="d-flex align-items-center gap-2 rounded-pill px-3 bg-white border-0 shadow-sm"
        >
          <FiArrowLeft size={16} /> Back
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="rounded-3 border-0 shadow-sm">
          <FiCheckCircle className="me-2" /> {success}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="rounded-3 border-0 shadow-sm">
          <FiAlertCircle className="me-2" /> {error}
        </Alert>
      )}

      {/* Profile Header - Hero Section */}
      <Card className="border-0 rounded-4 overflow-hidden shadow-sm mb-4">
        <div className="position-relative">
          <div 
            className="p-4 p-md-5 text-white"
            style={{ 
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
              minHeight: '180px'
            }}
          >
            <Row className="align-items-center">
              <Col lg={8}>
                <div className="d-flex align-items-center gap-4">
                  <div className="position-relative">
                    <div 
                      className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                      style={{ width: '90px', height: '90px', fontSize: '36px', fontWeight: '700', color: '#4f46e5' }}
                    >
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    {user.is_active && (
                      <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white" style={{ width: '20px', height: '20px' }} />
                    )}
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0">{user.full_name}</h3>
                    <p className="opacity-75 mb-1">{user.email}</p>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <Badge bg={getRoleBadgeColor(user.role)} className="px-3 py-2">
                        {getRoleIcon(user.role)} {user.role?.toUpperCase()}
                      </Badge>
                      {user.position && (
                        <Badge bg="light" text="dark" className="px-3 py-2">
                          {user.position?.toUpperCase()}
                        </Badge>
                      )}
                      <Badge bg={user.is_active ? 'success' : 'danger'} className="px-3 py-2">
                        {user.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
                <div className="d-flex gap-2 justify-content-lg-end">
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-pill px-4"
                  >
                    <FiEdit2 className="me-1" /> {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button variant="outline-light" size="sm" className="rounded-pill px-4">
                    <FiSettings /> Settings
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} xs={6} md={3}>
            <Card className="border-0 rounded-4 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className={`text-${stat.color} fw-bold fs-4`}>{stat.value}</div>
                    <div className="text-secondary small">{stat.label}</div>
                  </div>
                  <div className={`rounded-circle bg-${stat.color} bg-opacity-10 p-2`}>
                    <stat.icon className={`text-${stat.color}`} size={24} />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-success small">
                    <FiTrendingUp className="me-1" />
                    {stat.change}
                  </span>
                  <span className="text-secondary small ms-2">vs last month</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Left Column */}
        <Col lg={8}>
          {/* Profile Information */}
          <Card className="border-0 rounded-4 shadow-sm mb-4">
            <Card.Header className="bg-white rounded-4 rounded-bottom-0 py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FiUser className="text-primary" /> Personal Information
                {isEditing && (
                  <Badge bg="warning" className="ms-2">Editing Mode</Badge>
                )}
              </h6>
              <div className="d-flex align-items-center gap-3">
                <span className="text-secondary small">
                  <FiClock className="me-1" /> Last updated: {moment().format('DD MMM YYYY')}
                </span>
                <div className="d-flex align-items-center gap-1">
                  <span className="text-secondary small">Profile:</span>
                  <div style={{ width: '80px' }}>
                    <ProgressBar now={completionPercentage} variant="success" className="rounded-pill" style={{ height: '6px' }} />
                  </div>
                  <span className="text-success small fw-bold">{completionPercentage}%</span>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleProfileUpdate}>
                <Row className="g-4">
                  <Col md={6}>
                    <div className="position-relative">
                      <Form.Group>
                        <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                          <FiUser size={14} /> Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          disabled={!isEditing}
                          required
                          className="rounded-3 py-2 border-0 bg-light"
                          style={{ 
                            background: isEditing ? '#fff' : '#f8f9fa',
                            border: isEditing ? '2px solid #4f46e5' : 'none'
                          }}
                        />
                      </Form.Group>
                    </div>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                        <FiMail size={14} /> Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        required
                        className="rounded-3 py-2 border-0 bg-light"
                        style={{ 
                          background: isEditing ? '#fff' : '#f8f9fa',
                          border: isEditing ? '2px solid #4f46e5' : 'none'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                        <FiPhone size={14} /> Phone Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="rounded-3 py-2 border-0 bg-light"
                        placeholder="Enter phone number"
                        style={{ 
                          background: isEditing ? '#fff' : '#f8f9fa',
                          border: isEditing ? '2px solid #4f46e5' : 'none'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                        <FiBriefcase size={14} /> Role
                      </Form.Label>
                      <div className="d-flex align-items-center gap-2">
                        <Form.Control
                          type="text"
                          value={formData.role?.toUpperCase() || ''}
                          disabled
                          className="rounded-3 py-2 bg-light border-0"
                        />
                        <Badge bg={getRoleBadgeColor(formData.role)} className="px-3 py-2">
                          {getRoleIcon(formData.role)} {formData.role?.toUpperCase()}
                        </Badge>
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                        <FiCalendar size={14} /> Member Since
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={moment(user.created_at).format('DD MMM YYYY')}
                        disabled
                        className="rounded-3 py-2 bg-light border-0"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary d-flex align-items-center gap-1">
                        <FiUserCheck size={14} /> Account Status
                      </Form.Label>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg={user.is_active ? 'success' : 'danger'} className="px-3 py-2">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-secondary small">
                          <FiClock className="me-1" />
                          {user.is_active ? 'Account is active' : 'Account is deactivated'}
                        </span>
                      </div>
                    </Form.Group>
                  </Col>

                  {isEditing && (
                    <Col xs={12}>
                      <div className="d-flex gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={saving}
                          className="px-5 py-2 rounded-pill"
                          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}
                        >
                          {saving ? (
                            <>
                              <Spinner size="sm" className="me-2" /> Saving...
                            </>
                          ) : (
                            <>
                              <FiSave className="me-2" /> Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              full_name: user.full_name || '',
                              email: user.email || '',
                              phone: user.phone || '',
                              role: user.role || '',
                              position: user.position || '',
                              is_active: user.is_active !== undefined ? user.is_active : true
                            });
                          }}
                          className="rounded-pill px-4"
                        >
                          Cancel
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 rounded-4 shadow-sm">
            <Card.Header className="bg-white rounded-4 rounded-bottom-0 py-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FiActivity className="text-primary" /> Recent Activity
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`d-flex align-items-center gap-3 p-3 ${index !== recentActivity.length - 1 ? 'border-bottom' : ''}`}
                  style={{ transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className={`rounded-circle bg-${activity.color} bg-opacity-10 p-2 flex-shrink-0`}>
                    <activity.icon className={`text-${activity.color}`} size={20} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small">{activity.title}</div>
                    <div className="text-secondary small">{activity.description}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-secondary small">{activity.time}</div>
                    <Badge bg={activity.status === 'completed' ? 'success' : 'warning'} className="small">
                      {activity.status === 'completed' ? '✅ Done' : '⏳ Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col lg={4}>
          {/* Change Password */}
          <Card className="border-0 rounded-4 shadow-sm mb-4">
            <Card.Header className="bg-white rounded-4 rounded-bottom-0 py-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FiLock className="text-warning" /> Change Password
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-secondary">
                    Current Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    required
                    placeholder="Enter current password"
                    className="rounded-3 py-2 border-0 bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-secondary">
                    New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    required
                    placeholder="Enter new password (min 6 chars)"
                    className="rounded-3 py-2 border-0 bg-light"
                  />
                  <Form.Text className="text-secondary small">
                    Password must be at least 6 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-secondary">
                    Confirm New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    required
                    placeholder="Confirm new password"
                    className="rounded-3 py-2 border-0 bg-light"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="warning"
                  disabled={saving}
                  className="w-100 py-2 rounded-pill fw-bold"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Changing...
                    </>
                  ) : (
                    <>
                      <FiLock className="me-2" /> Change Password
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Achievements */}
          <Card className="border-0 rounded-4 shadow-sm mb-4">
            <Card.Header className="bg-white rounded-4 rounded-bottom-0 py-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FiAward className="text-warning" /> Achievements
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <achievement.icon className={`text-${achievement.color}`} size={18} />
                      <span className="small">{achievement.name}</span>
                    </div>
                    <span className="text-secondary small">{achievement.progress}%</span>
                  </div>
                  <ProgressBar 
                    now={achievement.progress} 
                    variant={achievement.color} 
                    className="rounded-pill" 
                    style={{ height: '4px' }}
                  />
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Security Status */}
          <Card className="border-0 rounded-4 shadow-sm">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiShield className="text-success" /> Security Status
              </h6>
              
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-2">
                <FiCheckCircle className="text-success" size={20} />
                <div>
                  <div className="fw-bold small">Password</div>
                  <div className="text-secondary small">Strong (last changed 30 days ago)</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-2">
                <FiShield className="text-info" size={20} />
                <div>
                  <div className="fw-bold small">Two-Factor Authentication</div>
                  <div className="text-secondary small">Not enabled</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <FiClock className="text-warning" size={20} />
                <div>
                  <div className="fw-bold small">Session</div>
                  <div className="text-secondary small">Active (logged in 2 hours ago)</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;